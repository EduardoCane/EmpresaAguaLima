import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import personaImg from '@/img/persona.jpg';

interface LocationState {
  from?: { pathname?: string };
  infoMessage?: string;
  prefillEmail?: string;
}

const palette = {
  page: '#edf3f0',
  pageAccentA: 'rgba(14,94,82,0.10)',
  pageAccentB: 'rgba(17,88,132,0.08)',
  cardShadow: '0 26px 70px -12px rgba(7,41,36,0.24), 0 10px 28px -8px rgba(8,35,52,0.18)',
  leftGradient: 'linear-gradient(160deg, #0f3d36 0%, #15574f 56%, #1b6e66 100%)',
  topLine: 'linear-gradient(90deg, #4fbc8f, #79d3ab, #4fbc8f)',
  leftChipBg: 'rgba(121,211,171,0.16)',
  leftChipBorder: '1px solid rgba(121,211,171,0.30)',
  leftIcon: '#a7ebca',
  leftMuted: 'rgba(236,251,245,0.76)',
  rightBg: '#fcfffe',
  accent: '#1f8c70',
  heading: '#153833',
  subtitle: '#617772',
  inputBg: '#f4faf8',
  inputBorder: '#cfe0d8',
  buttonGradient: 'linear-gradient(135deg, #1f8c70 0%, #156b7a 100%)',
  buttonShadow: '0 8px 22px rgba(22,118,108,0.32)',
  footer: '#9cb0aa',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session, isAdmin, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (hashParams.get('type') === 'recovery') {
      navigate(`/reset-password${window.location.hash}`, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.prefillEmail) {
      setEmail(state.prefillEmail);
    }
    if (state?.infoMessage) {
      setResetMessage(state.infoMessage);
    }
  }, [location.state]);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (hashParams.get('type') === 'recovery') {
      return;
    }
    if (!loading && session && isAdmin) {
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname || '/', { replace: true });
    }
  }, [loading, session, isAdmin, location.state, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResetMessage(null);

    const sanitizedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail);
    if (!isValidEmail) {
      setError('Ingresa un correo electronico valido.');
      return;
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(sanitizedEmail, password);
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);

    const sanitizedEmail = email.trim();
    if (!sanitizedEmail) {
      setError('Escribe tu correo para enviarte el enlace de recuperación.');
      return;
    }

    setResetLoading(true);
    try {
      const configuredPublicUrl = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim();
      const appBaseUrl = configuredPublicUrl
        ? configuredPublicUrl.replace(/\/$/, '')
        : window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${appBaseUrl}/reset-password`,
      });

      if (resetError) {
        const lowerMessage = resetError.message.toLowerCase();
        if (lowerMessage.includes('rate limit') || lowerMessage.includes('limite')) {
          throw new Error('Se excedió el límite de correos. Espera unos minutos e inténtalo nuevamente.');
        }
        throw resetError;
      }

      setResetMessage('Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo de recuperación.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden"
      style={{ background: palette.page }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 14% 48%, ${palette.pageAccentA} 0%, transparent 58%),
                            radial-gradient(circle at 85% 12%, ${palette.pageAccentB} 0%, transparent 46%)`,
        }}
      />

      <div
        className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden"
        style={{ boxShadow: palette.cardShadow }}
      >
        <div className="grid md:grid-cols-[1.05fr_1fr]">
          <section
            className="relative flex flex-col justify-between overflow-hidden"
            style={{
              background: palette.leftGradient,
              minHeight: '560px',
            }}
          >
            <div
              className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)' }}
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-12 w-80 h-80 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: palette.topLine }}
            />

            <div className="relative z-10 p-8 md:p-10 flex flex-col h-full justify-between">
              <div>
                <div
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl mb-7"
                  style={{
                    background: palette.leftChipBg,
                    border: palette.leftChipBorder,
                  }}
                >
                  <ShieldCheck className="h-5 w-5" style={{ color: palette.leftIcon }} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Aqualima</h2>
                <p className="mt-2 text-sm leading-relaxed max-w-xs" style={{ color: palette.leftMuted }}>
                  Plataforma interna para la gestion de clientes, contratos y firmas digitales.
                </p>
              </div>

              <div className="my-8">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    height: '220px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <img
                    src={personaImg}
                    alt="Equipo de trabajo"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(10,25,45,0.90) 0%, rgba(10,25,45,0.30) 50%, rgba(10,25,45,0.08) 100%)',
                    }}
                  />

                  <div
                    className="absolute bottom-4 left-4 flex items-center rounded-xl px-3 py-2"
                    style={{
                      background: 'rgba(255,255,255,0.97)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    <img
                      src="/logo_header_1.jpeg"
                      alt="Logo Aqualima"
                      className="h-8 w-auto object-contain"
                    />
                  </div>

                  <div
                    className="absolute bottom-4 right-4 rounded-lg px-2.5 py-1"
                    style={{
                      background: palette.leftChipBg,
                      border: palette.leftChipBorder,
                    }}
                  >
                    <span className="text-xs font-semibold tracking-wide" style={{ color: palette.leftIcon }}>
                      Nuestro equipo
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { Icon: UserRound, label: 'Acceso exclusivo para administradores' },
                  { Icon: LockKeyhole, label: 'Autenticacion segura con Supabase' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm" style={{ color: palette.leftMuted }}>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                      style={{ background: 'rgba(121,211,171,0.14)', border: '1px solid rgba(121,211,171,0.26)' }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: palette.leftIcon }} />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative p-8 md:p-12 flex flex-col justify-center" style={{ background: palette.rightBg }}>
            <div
              className="absolute top-0 right-0 h-[3px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${palette.accent}, #79d3ab)`,
                width: '100%',
              }}
            />

            <div className="mb-8">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: palette.accent, letterSpacing: '0.12em' }}
              >
                Portal administrativo
              </p>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: palette.heading }}>
                Iniciar sesion
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: palette.subtitle }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {(error || authError) && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl p-3.5 text-sm"
                style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c' }}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error || authError}</span>
              </div>
            )}

            {resetMessage && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl p-3.5 text-sm"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}
              >
                <span>{resetMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold" style={{ color: palette.heading }}>
                  Correo electronico
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-sm"
                  style={{
                    borderRadius: '10px',
                    border: `1.5px solid ${palette.inputBorder}`,
                    background: palette.inputBg,
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold" style={{ color: palette.heading }}>
                  Contrasena
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-sm"
                  style={{
                    borderRadius: '10px',
                    border: `1.5px solid ${palette.inputBorder}`,
                    background: palette.inputBg,
                  }}
                />
                <div className="pt-1 text-right">
                  <button
                    type="button"
                    onClick={() => void handleForgotPassword()}
                    disabled={submitting || loading || resetLoading}
                    className="text-xs font-medium underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: palette.accent }}
                  >
                    {resetLoading ? 'Enviando enlace...' : 'Olvide mi contrasena'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full h-12 text-white font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderRadius: '10px',
                  background: submitting || loading ? '#94a3b8' : palette.buttonGradient,
                  boxShadow: submitting || loading ? 'none' : palette.buttonShadow,
                }}
              >
                {submitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs" style={{ color: palette.footer }}>
              (c) {new Date().getFullYear()} Aqualima . Todos los derechos reservados
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
