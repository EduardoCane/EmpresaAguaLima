import { useState } from 'react';
import { toast } from 'sonner';

export function useConsultaDNI() {
  const [loading, setLoading] = useState(false);

  const consultarDNI = async (dni: string) => {
    if (!dni || dni.length !== 8) return null;

    try {
      setLoading(true);

      const token = import.meta.env.VITE_RENIEC_TOKEN || 'sk_12933.HGJ0GrDZjKEOundZardFPZCTJZhCBlAy';
      const apiBase = import.meta.env.VITE_RENIEC_API_URL || '/reniec';

      if (!token) {
        console.warn('Token de API no configurado');
        toast.error('Token de API no configurado. Ingresa los datos manualmente.');
        return null;
      }

      const doFetch = async (base: string) =>
        fetch(`${base}/dni?numero=${dni}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            token,
          },
        });

      let response: Response | null = null;
      try {
        response = await doFetch(apiBase);
      } catch (err) {
        if (!apiBase.startsWith('/')) throw err;
      }

      if ((!response || !response.ok) && apiBase.startsWith('/')) {
        response = await doFetch('https://api.decolecta.com/v1/reniec');
      }

      if (!response.ok) {
        console.warn('API respondió con error:', response.status);
        if (response.status === 404) {
          toast.error('DNI no encontrado en la base de datos');
        }
        return null;
      }

      const data = await response.json();
      const payload = data?.data || data;
      return {
        nombre: payload?.first_name || payload?.nombres || payload?.nombre || '',
        apellido: `${payload?.first_last_name || payload?.apellido_paterno || ''} ${payload?.second_last_name || payload?.apellido_materno || ''}`.trim(),
      };
    } finally {
      setLoading(false);
    }
  };

  return { consultarDNI, loading };
}
