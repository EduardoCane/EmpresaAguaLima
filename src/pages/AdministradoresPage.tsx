import { useState, useEffect, FormEvent } from 'react';
import { Trash2, UserPlus, Shield, Mail, AlertCircle, CheckCircle2, KeyRound, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AdminUser {
  user_id: string;
  created_at: string;
  email: string;
  rawEmail: string | null;
  emailVerified: boolean | null;
}

export default function AdministradoresPage() {
  const { signUp, user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [resendingVerificationFor, setResendingVerificationFor] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const maskEmail = (email?: string | null) => {
    if (!email) return 'Sin email';

    const [localPart, domainPart] = email.split('@');
    if (!localPart || !domainPart) return 'Correo no disponible';

    const localVisible = localPart.slice(0, 2);
    const localMasked =
      localPart.length <= 2 ? `${localVisible}***` : `${localVisible}${'*'.repeat(localPart.length - 2)}`;

    const domainParts = domainPart.split('.');
    const domainName = domainParts[0] || '';
    const tld = domainParts.slice(1).join('.');

    const domainVisible = domainName.slice(0, 1);
    const domainMasked =
      domainName.length <= 1 ? `${domainVisible}***` : `${domainVisible}${'*'.repeat(domainName.length - 1)}`;

    return `${localMasked}@${domainMasked}${tld ? `.${tld}` : ''}`;
  };

  const resolveAdminEmail = (candidateEmail?: string | null) => {
    return maskEmail(candidateEmail);
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      // RPC with no args must still send an empty object or PostgREST returns 400
      const { data: adminWithEmails, error: rpcError } = await supabase.rpc('list_admin_users', {});

      if (rpcError) {
        console.warn('RPC list_admin_users failed:', rpcError);
      }

      if (!rpcError && adminWithEmails) {
        const adminUsers: AdminUser[] = adminWithEmails.map((admin) => ({
          user_id: admin.user_id,
          created_at: admin.created_at,
          rawEmail:
            typeof (admin as { email?: unknown }).email === 'string'
              ? ((admin as { email: string }).email ?? null)
              : null,
          emailVerified:
            typeof (admin as { email_verified?: unknown }).email_verified === 'boolean'
              ? (admin as { email_verified: boolean }).email_verified
              : user?.id === admin.user_id
                ? Boolean(user.email_confirmed_at)
                : null,
          email: resolveAdminEmail(
            typeof (admin as { email?: unknown }).email === 'string'
              ? ((admin as { email: string }).email ?? null)
              : user?.id === admin.user_id
                ? (user.email ?? null)
                : null,
          ),
        }));

        setAdmins(adminUsers);
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id, created_at')
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;

      const adminUsers: AdminUser[] = (adminData || []).map((admin) => ({
        user_id: admin.user_id,
        created_at: admin.created_at,
        rawEmail: user?.id === admin.user_id ? (user.email ?? null) : null,
        emailVerified: user?.id === admin.user_id ? Boolean(user.email_confirmed_at) : null,
        email: resolveAdminEmail(user?.id === admin.user_id ? (user.email ?? null) : null),
      }));

      setAdmins(adminUsers);
    } catch (err) {
      console.error('Error loading admins:', err);
      toast.error('Error al cargar administradores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [user?.id, user?.email]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const signUpResult = await signUp(email.trim(), password);

      if (signUpResult.requiresEmailConfirmation) {
        setSuccessMessage('Administrador creado. Falta verificar el correo para que pueda ingresar.');
        toast.success('Administrador creado. Debe verificar su correo antes de ingresar.');
      } else {
        setSuccessMessage('Administrador creado exitosamente.');
        toast.success('Administrador creado exitosamente');
      }

      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Recargar lista
      setTimeout(() => {
        loadAdmins();
        setSuccessMessage(null);
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear administrador';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const { error: deleteError } = await supabase.rpc('admin_delete_user', {
        target_user_id: deleteId,
      });

      if (deleteError) throw deleteError;

      toast.success('Usuario eliminado');
      setAdmins(admins.filter(a => a.user_id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting admin:', err);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  const handleResendVerification = async (admin: AdminUser) => {
    if (!admin.rawEmail) {
      toast.error('No se pudo obtener el correo real para reenviar la verificacion.');
      return;
    }

    try {
      setResendingVerificationFor(admin.user_id);
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: admin.rawEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (resendError) {
        const lowerMessage = resendError.message.toLowerCase();
        if (lowerMessage.includes('rate') || lowerMessage.includes('too many')) {
          throw new Error('Se excedio el limite de reenvios. Espera unos minutos e intenta nuevamente.');
        }
        throw resendError;
      }

      toast.success(`Correo de verificacion reenviado a ${maskEmail(admin.rawEmail)}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo reenviar el correo de verificacion.');
    } finally {
      setResendingVerificationFor(null);
    }
  };

  const openPasswordDialog = (userId: string) => {
    setPasswordUserId(userId);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleUpdatePassword = async () => {
    if (!passwordUserId) return;

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error: updateError } = await supabase.rpc('admin_update_user_password', {
        target_user_id: passwordUserId,
        new_password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success('Contraseña actualizada correctamente');
      setPasswordUserId(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Administradores</h1>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              Gestiona los usuarios con acceso administrativo
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lista de administradores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-purple-600" />
              Administradores Actuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">Cargando...</div>
            ) : admins.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No hay administradores registrados</div>
            ) : (
              <div className="space-y-2">
                {admins.map((admin) => (
                  (() => {
                    const cannotDelete = admins.length <= 1 || admin.user_id === user?.id;
                    const isPendingVerification = admin.emailVerified === false;

                    return (
                  <div
                    key={admin.user_id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {admin.email}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Desde {new Date(admin.created_at).toLocaleDateString('es-ES')}
                        </p>
                        {isPendingVerification && (
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            Falta verificar correo para que pueda ingresar.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isPendingVerification && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleResendVerification(admin)}
                          disabled={resendingVerificationFor === admin.user_id || !admin.rawEmail}
                          title="Reenviar verificacion por correo"
                          className="shrink-0 text-sky-700 hover:bg-sky-50 hover:text-sky-800 disabled:opacity-40 disabled:hover:bg-transparent dark:text-sky-400 dark:hover:bg-sky-900/20"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPasswordDialog(admin.user_id)}
                        className="shrink-0 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(admin.user_id)}
                        disabled={cannotDelete}
                        title={
                          cannotDelete
                            ? admins.length <= 1
                              ? 'No puedes eliminar el último administrador'
                              : 'No puedes eliminar tu propio usuario'
                            : 'Eliminar usuario'
                        }
                        className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                    );
                  })()
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario agregar administrador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Agregar Administrador
            </CardTitle>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creando...' : 'Crear Administrador'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cuenta de acceso y su permiso de administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!passwordUserId} onOpenChange={(open) => !open && setPasswordUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar contraseña</DialogTitle>
            <DialogDescription>
              Define una nueva contraseña para este usuario administrador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={updatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmar contraseña</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                disabled={updatingPassword}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordUserId(null)} disabled={updatingPassword}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePassword} disabled={updatingPassword}>
              {updatingPassword ? 'Guardando...' : 'Guardar contraseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
