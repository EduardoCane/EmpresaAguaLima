import { useState } from 'react';
import { toast } from 'sonner';
import { lookupReniecByDni } from '@/lib/reniec';

export function useConsultaDNI() {
  const [loading, setLoading] = useState(false);

  const consultarDNI = async (dni: string) => {
    if (!dni || dni.length !== 8) return null;

    try {
      setLoading(true);
      const payload = await lookupReniecByDni(dni);

      return {
        nombre: payload.nombre,
        apellido: `${payload.apellidoPaterno} ${payload.apellidoMaterno}`.trim(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error consultando RENIEC';
      if (message.toLowerCase().includes('dni no encontrado')) {
        toast.error('DNI no encontrado en la base de datos');
      } else {
        toast.error('No se pudo consultar RENIEC. Puedes llenar los datos manualmente.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { consultarDNI, loading };
}
