import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SignaturePad } from '@/components/SignaturePad';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function SignPage() {
  const { contractId } = useParams();
  const [signatureData, setSignatureData] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId) {
      const errorMsg = 'ID de contrato inválido';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }, [contractId]);

  const handleSignatureSave = (signature: string) => {
    setSignatureData(signature);
  };

  const handleSubmitSignature = async () => {
    if (!signatureData) {
      toast.error('Debes firmar para continuar');
      return;
    }

    if (!contractId) {
      toast.error('ID de contrato inválido');
      return;
    }

    try {
      setIsSending(true);

      // Enviar a ventana principal
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'SIGNATURE_COMPLETE',
            contractId,
            signature: signatureData,
          },
          '*'
        );
      }

      // BroadcastChannel
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('signature-updates');
        channel.postMessage({
          type: 'SIGNATURE_COMPLETE',
          contractId,
          signature: signatureData,
        });
        channel.close();
      }

      // ==============================
      // Persistencia en Supabase
      // ==============================

      let contratoClienteId: string | null = null;

      try {
        const { data, error } = await supabase
          .from('contratos')
          .select('id, cliente_id')
          .eq('id', contractId)
          .maybeSingle();

        if (!error && data) {
          contratoClienteId = data.cliente_id ?? null;
        }
      } catch (checkErr) {
        console.warn('No se pudo verificar contrato:', checkErr);
      }

      const clienteIdToUse = contratoClienteId || contractId;

      try {
        // Desactivar firma activa previa
        await supabase
          .from('cliente_firmas')
          .update({ activa: false })
          .eq('cliente_id', clienteIdToUse)
          .eq('activa', true);

        // Insertar nueva firma
        const { error: insertError } = await supabase
          .from('cliente_firmas')
          .insert({
            cliente_id: clienteIdToUse,
            firma_url: signatureData,
            activa: true,
          });

        if (insertError) {
          console.error('Error guardando cliente_firma:', insertError);
          toast.error('No se pudo guardar la firma en el servidor');
        } else {
          toast.success('Firma guardada correctamente');
        }
      } catch (dbErr) {
        console.error('Error en Supabase:', dbErr);
        toast.error('Supabase no disponible, firma enviada solo localmente');
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Error general:', err);
      toast.error('Error al guardar la firma');
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    setSignatureData('');
    setClearSignal((prev) => prev + 1);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-2xl p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Firma guardada</h1>
          <p className="text-muted-foreground">
            Tu firma se guardó correctamente. Puedes cerrar esta pestaña cuando
            desees.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="bg-card border border-red-200 dark:border-red-800 rounded-lg shadow-2xl p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
            <h1 className="text-2xl font-bold">Firma del Contrato</h1>
            <p className="text-sm mt-1">
              Contrato ID: {contractId || 'Cargando...'}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">
                  Por favor, firma en el área de abajo
                </p>
                <p className="text-xs mt-1">
                  Usa tu dedo o un lápiz digital para firmar
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Área de Firma
              </label>
              <div className="border-2 border-border rounded-lg overflow-hidden bg-white dark:bg-black/20">
                {contractId ? (
                  <SignaturePad
                    onSignatureComplete={handleSignatureSave}
                    existingSignature={signatureData}
                    clearSignal={clearSignal}
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-muted-foreground">
                    <p>Cargando...</p>
                  </div>
                )}
              </div>
            </div>

            {signatureData && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium">
                  Firma capturada correctamente
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={isSending}
                className="flex-1"
              >
                Limpiar
              </Button>
              <Button
                onClick={handleSubmitSignature}
                disabled={!signatureData || isSending || !contractId}
                className="flex-1"
              >
                {isSending ? 'Guardando...' : 'Guardar Firma'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
