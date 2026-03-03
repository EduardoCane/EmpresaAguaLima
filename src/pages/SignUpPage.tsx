import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, LockKeyhole, ShieldCheck, UserRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import personaImg from '@/img/persona.jpg';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, session, isAdmin, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      const state = location.state as LocationState | null;
      const destination = state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [loading, session, isAdmin, location.state, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);

    try {
      const sanitizedEmail = email.trim();
      const signUpResult = await signUp(sanitizedEmail, password);

      if (signUpResult.requiresEmailConfirmation) {
        navigate('/login', {
          replace: true,
          state: {
            prefillEmail: sanitizedEmail,
            infoMessage: 'Cuenta creada. Revisa tu correo y verifica tu cuenta antes de ingresar.',
          },
        });
        return;
      }

      navigate('/login', {
        replace: true,
        state: {
          prefillEmail: sanitizedEmail,
          infoMessage: 'Cuenta creada correctamente. Ya puedes iniciar sesion.',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(132, 204, 22, 0.05) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(163, 230, 53, 0.04) 0%, transparent 40%)`,
        }}
      />

      <Card className="relative z-10 w-full max-w-4xl border-border/80 shadow-xl">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-[1.1fr_1fr]">

            {/* ─── LEFT PANEL ─── */}
            <section
              className="relative flex flex-col justify-between overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #7c9660 0%, #94a894 40%, #a8d08d 100%)',
                minHeight: '520px',
              }}
            >
              {/* Decorative circles */}
              <div
                className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
              />
              <div
                className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}
              />

              {/* Content */}
              <div className="relative z-10 p-8 md:p-10 flex flex-col h-full justify-between">

                {/* Top: shield + title */}
                <div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm mb-6">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Aqualima</h2>
                  <p className="mt-2 text-green-50 text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    Crea tu cuenta de administrador para acceder a la plataforma de gestión.
                  </p>
                </div>

                {/* Center: combined image composition */}
                <div className="my-8">
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      height: '210px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                    }}
                  >
                    {/* Team photo as full background */}
                    <img
                      src={personaImg}
                      alt="Equipo de trabajo"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />

                    {/* Dark gradient overlay from bottom */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(100,130,90,0.70) 0%, rgba(100,130,90,0.20) 45%, transparent 100%)',
                      }}
                    />

                    {/* Logo pill — bottom left, floating over the photo */}
                    <div
                      className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl px-3 py-2"
                      style={{
                        background: 'rgba(255,255,255,0.96)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      }}
                    >
                      <img
                        src="/logo_header_1.jpeg"
                        alt="Logo Aqualima"
                        className="h-8 w-auto object-contain"
                      />
                    </div>

                    {/* Caption — bottom right */}
                    <span className="absolute bottom-5 right-4 text-white text-xs font-semibold tracking-wide opacity-80">
                      Nuestro equipo
                    </span>
                  </div>
                </div>

                {/* Bottom: badges */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                      <UserRound className="h-3.5 w-3.5 text-white" />
                    </div>
                    Primera cuenta de administrador
                  </div>
                  <div className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                      <LockKeyhole className="h-3.5 w-3.5 text-white" />
                    </div>
                    Datos encriptados con Supabase
                  </div>
                </div>
              </div>
            </section>

            {/* ─── RIGHT PANEL ─── */}
            <section className="bg-white p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Crear cuenta</h1>
                <p className="mt-1.5 text-sm text-slate-500">Registra el primer administrador</p>
              </div>

              {(error || authError) && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="flex items-start gap-2.5 mb-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="font-semibold">{error || authError}</span>
                  </div>
                  {((error || authError || '').toLowerCase().includes('signup') || 
                    (error || authError || '').toLowerCase().includes('deshabilitad')) && (
                    <div className="ml-6 mt-2 text-xs space-y-1 text-red-600">
                      <p className="font-medium">📋 Solución:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Ve a tu Supabase Dashboard</li>
                        <li>Authentication → Providers → Email</li>
                        <li>Activa "Enable Email Signup"</li>
                        <li>Desactiva "Confirm email" (para desarrollo)</li>
                        <li>Guarda y vuelve a intentar</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-colors text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-colors text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-sm">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-colors text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full h-12 rounded-xl text-white font-semibold text-sm tracking-wide transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: submitting || loading
                      ? '#d1d5db'
                      : 'linear-gradient(135deg, #7c9660 0%, #94a894 100%)',
                    boxShadow: submitting || loading ? 'none' : '0 4px 15px rgba(124, 150, 96, 0.3)',
                  }}
                >
                  {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-center text-sm text-slate-600 mb-3">
                  ¿Ya tienes cuenta?
                </p>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-medium text-sm transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </section>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
