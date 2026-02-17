import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupabaseTable<T>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error: fetchError } = await supabase
          .from(tableName)
          .select('*');

        if (fetchError) {
          throw fetchError;
        }

        setData(result || []);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        console.error(`Error fetching from ${tableName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName]);

  return { data, loading, error };
}

export function useSupabaseSubscription<T>(tableName: string, onUpdate: (data: T[]) => void) {
  useEffect(() => {
    const subscription = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log(`Change detected in ${tableName}:`, payload);
          // Aquí puedes manejar el cambio en tiempo real
          // Por ejemplo, recargar los datos
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [tableName, onUpdate]);
}
