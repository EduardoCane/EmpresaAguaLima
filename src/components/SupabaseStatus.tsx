import { useClientes } from '@/contexts/ClientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function SupabaseStatus() {
  const { loading, error } = useClientes();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 motion-safe:animate-spin" />
            Conectando a Supabase...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error de conexión:</strong> {error}
          <br />
          <small>Los datos se cargarán desde el servidor local.</small>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <CheckCircle2 className="h-4 w-4" />
      <AlertDescription className="text-green-700">
        Conectado a Supabase correctamente
      </AlertDescription>
    </Alert>
  );
}

export function SupabaseSetupGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Supabase</CardTitle>
        <CardDescription>
          Pasos para conectar tu aplicación con Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">1. Crear proyecto en Supabase</h3>
          <p className="text-sm text-gray-600">
            Ve a supabase.com y crea una nueva cuenta o inicia sesión
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">2. Obtener credenciales</h3>
          <p className="text-sm text-gray-600">
            Ve a Settings &gt; API y copia tu Project URL y anon key
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">3. Configurar .env.local</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}
          </pre>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">4. Crear tablas</h3>
          <p className="text-sm text-gray-600">
            Ejecuta el SQL en supabase_schema.sql usando SQL Editor en Supabase
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
