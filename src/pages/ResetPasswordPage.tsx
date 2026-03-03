import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, LockKeyhole } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function toFriendlyResetError(message?: string) {
  const normalized = (message || '').toLowerCase();
  if (normalized.includes('expired')) {
    return 'El enlace de recuperacion ha expirado. Solicita uno nuevo.';
  }
  if (normalized.includes('invalid')) {
    return 'El enlace de recuperacion no es valido.';
  }
  return message || 'No se pudo actualizar la contrasena.';
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recoveredEmail, setRecoveredEmail] = useState<string>('');

  const [hashSnapshot] = useState(() => window.location.hash);
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const hashParams = useMemo(
    () => new URLSearchParams(hashSnapshot.replace(/^#/, '')),
    [hashSnapshot],
  );

  useEffect(() => {
    let mounted = true;

    const initRecovery = async () => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = hashParams.get('access_token') ?? searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') ?? searchParams.get('refresh_token');
        const type = hashParams.get('type') ?? searchParams.get('type');

        if (accessToken && refreshToken && type === 'recovery') {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            throw setSessionError;
          }

          if (!mounted) return;

          setRecoveredEmail(data.session?.user?.email || '');
          setReady(true);
          window.history.replaceState({}, document.title, '/reset-password');
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (!mounted) return;

        if (sessionData.session?.user) {
          setRecoveredEmail(sessionData.session.user.email || '');
          setReady(true);
          return;
        }

        throw new Error('No se detecto una sesion de recuperacion valida.');
      } catch (err) {
        if (!mounted) return;
        setReady(false);
        setError(toFriendlyResetError(err instanceof Error ? err.message : undefined));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initRecovery();

    return () => {
      mounted = false;
    };
  }, [hashParams, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();

      setSuccess('Contrasena actualizada correctamente. Seras redirigido al login.');

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            infoMessage: 'Contrasena actualizada. Inicia sesion con tu nueva contrasena.',
            prefillEmail: recoveredEmail,
          },
        });
      }, 1200);
    } catch (err) {
      setError(toFriendlyResetError(err instanceof Error ? err.message : undefined));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card shadow-lg p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Restablecer contrasena</h1>
            <p className="text-sm text-muted-foreground">Crea una nueva contrasena para tu cuenta.</p>
          </div>
        </div>

        {loading && (
          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            Validando enlace de recuperacion...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!loading && ready && !success && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nueva contrasena</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password">Confirmar contrasena</Label>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contrasena"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
            >
              {submitting ? 'Actualizando...' : 'Guardar nueva contrasena'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
