import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const { session, isAdmin, loading, signOut } = useAuth();
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const isRecoveryFlow = hashParams.get('type') === 'recovery';

  if (isRecoveryFlow) {
    return <Navigate to={`/reset-password${window.location.hash}`} replace />;
  }

  // Show loading only while session is still unknown.
  if (loading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          Verificando sesion...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Keep panel mounted if user is already authorized, even if loading toggles.
  if (session && isAdmin) {
    return children;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          Validando permisos...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-xl border bg-card p-6 space-y-3 text-center">
        <h1 className="text-xl font-semibold text-foreground">Acceso restringido</h1>
        <p className="text-sm text-muted-foreground">
          Tu cuenta no esta registrada como administrador en Supabase.
        </p>
        <Button onClick={() => void signOut()} className="w-full">
          Cerrar sesion
        </Button>
      </div>
    </div>
  );
}
