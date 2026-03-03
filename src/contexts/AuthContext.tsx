import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isEmailNotConfirmedError(message?: string, code?: string) {
  const normalizedMessage = message?.toLowerCase() || '';
  const normalizedCode = code?.toLowerCase() || '';

  return (
    normalizedCode.includes('email_not_confirmed') ||
    normalizedMessage.includes('email not confirmed') ||
    normalizedMessage.includes('not confirmed') ||
    normalizedMessage.includes('correo no confirmado')
  );
}

function toFriendlyAuthError(error: { message?: string; code?: string }, fallbackMessage: string) {
  if (isEmailNotConfirmedError(error.message, error.code)) {
    return new Error(
      'Tu correo aun no esta verificado. Revisa tu bandeja y confirma tu cuenta para poder ingresar.',
    );
  }

  const normalizedMessage = error.message?.toLowerCase() || '';
  if (
    normalizedMessage.includes('invalid login credentials') ||
    normalizedMessage.includes('invalid email or password')
  ) {
    return new Error('Correo o contrasena incorrectos.');
  }

  return new Error(error.message || fallbackMessage);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdminRef = useRef(isAdmin);
  const userIdRef = useRef<string | null>(user?.id ?? null);

  useEffect(() => {
    isAdminRef.current = isAdmin;
    userIdRef.current = user?.id ?? null;
  }, [isAdmin, user?.id]);

  const withTimeout = useCallback(async <T,>(operation: PromiseLike<T> | T, ms: number): Promise<T> => {
    const operationPromise = Promise.resolve(operation);

    return await Promise.race([
      operationPromise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado al validar sesión.')), ms);
      }),
    ]);
  }, []);

  const checkIsAdmin = useCallback(async (userId?: string | null) => {
    try {
      if (!userId) {
        return false;
      }

      const { data, error: queryError } = await withTimeout(
        supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle(),
        6000,
      );

      if (queryError) {
        return false;
      }

      return Boolean(data);
    } catch (err) {
      console.error('Error in checkIsAdmin:', err);
      return false;
    }
  }, [withTimeout]);

  const ensureAdminRecord = useCallback(async (userId?: string | null) => {
    if (!userId) {
      return false;
    }

    const alreadyAdmin = await checkIsAdmin(userId);
    if (alreadyAdmin) {
      return true;
    }

    try {
      const { error: rpcError } = await withTimeout(supabase.rpc('bootstrap_admin_user'), 6000);

      if (!rpcError) {
        return true;
      }

      const functionMissing =
        rpcError.code === 'PGRST202' ||
        rpcError.message?.toLowerCase().includes('could not find the function');

      if (!functionMissing) {
        console.error('Error calling bootstrap_admin_user:', rpcError);
      }

      const { error: insertError } = await withTimeout(
        supabase.from('admin_users').insert([{ user_id: userId }]),
        6000,
      );

      if (insertError) {
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error ensuring admin record:', err);
      return false;
    }
  }, [checkIsAdmin, withTimeout]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
      try {
        setLoading(true);
        setError(null);
        fallbackTimer = setTimeout(() => {
          if (mounted) {
            setLoading(false);
          }
        }, 10000);

        const { data, error: sessionError } = await withTimeout(supabase.auth.getSession(), 6000);

        if (sessionError) {
          throw sessionError;
        }

        const currentSession = data.session;
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const admin = await ensureAdminRecord(currentSession.user.id);
          if (!mounted) return;
          setIsAdmin(admin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setError(err instanceof Error ? err.message : 'No se pudo inicializar autenticación.');
      } finally {
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
        }
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      void (async () => {
        if (!mounted) return;

        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setError(null);

        if (!nextSession?.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const shouldRecheckAdmin =
          event === 'SIGNED_IN' ||
          event === 'USER_UPDATED' ||
          userIdRef.current !== nextSession.user.id ||
          !isAdminRef.current;

        if (!shouldRecheckAdmin) {
          return;
        }

        const shouldShowGlobalLoading =
          event === 'SIGNED_IN' || userIdRef.current !== nextSession.user.id || !isAdminRef.current;

        if (shouldShowGlobalLoading) {
          setLoading(true);
        }

        try {
          const admin = await ensureAdminRecord(nextSession.user.id);
          if (!mounted) return;
          setIsAdmin(admin);
        } catch (adminErr) {
          if (!mounted) return;
          setIsAdmin(false);
          console.error('Error in auth state listener:', adminErr);
        } finally {
          if (mounted && shouldShowGlobalLoading) {
            setLoading(false);
          }
        }
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [ensureAdminRecord, withTimeout]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw toFriendlyAuthError(signInError, 'No se pudo iniciar sesion.');
      }
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setError(null);

      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw toFriendlyAuthError(signUpError, 'No se pudo crear la cuenta.');
      }

      if (!data?.user?.id) {
        throw new Error('No se pudo obtener el ID del usuario.');
      }

      const requiresEmailConfirmation = !data.user.email_confirmed_at;

      // Si ya hay una sesion activa, se trata de un admin creando otro admin.
      // En ese caso NO intentamos iniciar sesion con la cuenta nueva.
      if (user?.id) {
        const { error: upsertError } = await supabase
          .from('admin_users')
          .upsert({ user_id: data.user.id }, { onConflict: 'user_id' });

        if (upsertError) {
          throw new Error('La cuenta fue creada, pero no se pudo registrar como administrador.');
        }

        return { requiresEmailConfirmation };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (isEmailNotConfirmedError(signInError.message, signInError.code)) {
          return { requiresEmailConfirmation: true };
        }

        throw toFriendlyAuthError(signInError, 'No se pudo autenticar luego del registro.');
      }

      const ensured = await ensureAdminRecord(data.user.id);
      if (!ensured) {
        await supabase.auth.signOut();
        throw new Error('No se pudo registrar como administrador.');
      }

      return { requiresEmailConfirmation: false };
    },
    [ensureAdminRecord, user?.id],
  );

  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw signOutError;
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      isAdmin,
      loading,
      error,
      signIn,
      signUp,
      signOut,
    }),
    [session, user, isAdmin, loading, error, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
