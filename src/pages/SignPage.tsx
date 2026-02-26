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

  // Log para debugging
  console.log('SignPage mounted, contractId:', contractId);

  useEffect(() => {
    if (!contractId) {
      const errorMsg = 'ID de contrato invalido';
      console.error(errorMsg);
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
      toast.error('ID de contrato invalido');
      return;
    }

    try {
      setIsSending(true);

      // Enviar a la ventana de escritorio si existe
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'SIGNATURE_COMPLETE',
            contractId,
            signature: signatureData,
          },
          '*',
        );
      }

      // Broadcast opcional por canal (funciona aunque no haya opener)
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('signature-updates');
        channel.postMessage({
          type: 'SIGNATURE_COMPLETE',
          contractId,
          signature: signatureData,
        });
        channel.close();
      }

      // Persistir en Supabase para que escritorio lo lea *solo si el contrato existe*.
      // Cuando el QR fue generado para un cliente (no existe contrato aún), el contractId
      // es en realidad un cliente_id y no debemos insertar en `firmas` (evita errores 400).
      try {
        let contratoExists = false;

        let contratoClienteId: string | null = null;
        try {
          const { data: contratoData, error: contratoError } = await supabase
            .from('contratos')
            .select('id, cliente_id')
            .eq('id', contractId)
            .maybeSingle();

          if (!contratoError && contratoData && contratoData.id) {
            contratoExists = true;
            contratoClienteId = contratoData.cliente_id ?? null;
          }

        try {
          const { data: contratoData, error: contratoError } = await supabase
            .from('contratos')
            .select('id')
            .eq('id', contractId)
            .maybeSingle();

          if (!contratoError && contratoData && contratoData.id) contratoExists = true;

        } catch (checkErr) {
          console.warn('No se pudo verificar existencia de contrato; continuando sin persistir en DB:', checkErr);
        }


        // IMPORTANT: avoid inserting directly into `firmas` from the mobile signer because
        // DB triggers may mark the contrato as firmado immediately. Instead save into
        // `cliente_firmas` (so the desktop app can reuse the signature) and rely on
        // postMessage/Broadcast to display the signature in the UI. The desktop app
        // should be the one to insert into `firmas` when the user explicitly clicks Save.
        if (contratoExists) {
          try {
            const clienteIdToUse = contratoClienteId || contractId;
            await supabase
              .from('cliente_firmas')
              .update({ activa: false })
              .eq('cliente_id', clienteIdToUse)
              .eq('activa', true);

            const { error: insertClienteFirmaError } = await supabase
              .from('cliente_firmas')
              .insert({ cliente_id: clienteIdToUse, firma_url: signatureData, activa: true });

            if (insertClienteFirmaError) {
              console.error('Error guardando cliente_firma desde SignPage (contrato exists):', insertClienteFirmaError);
              toast.error('No se pudo guardar la firma en el servidor; la firma solo se envió localmente');
            } else {
              toast.success('Firma guardada en el cliente (lista para reutilizar)');
            }
          } catch (fallbackErr) {
            console.warn('No fue posible guardar cliente_firma (probablemente RLS). Firma enviada localmente:', fallbackErr);

        if (contratoExists) {
          const { error: insertFirmaError } = await supabase
            .from('firmas')
            .insert({ contrato_id: contractId, firma_url: signatureData, origen: 'capturada' });

          if (insertFirmaError) {
            // Intento de fallback para guardar como cliente_firma si la inserción falla
            try {
              await supabase
                .from('cliente_firmas')
                .update({ activa: false })
                .eq('cliente_id', contractId)
                .eq('activa', true);

              const { error: insertClienteFirmaError } = await supabase
                .from('cliente_firmas')
                .insert({ cliente_id: contractId, firma_url: signatureData, activa: true });

              if (insertClienteFirmaError) {
                console.error('Error guardando firma en cliente_firmas:', insertClienteFirmaError);
                toast.error('No se pudo guardar la firma en Supabase');
              }
            } catch (fallbackErr) {
              console.error('Fallback al guardar cliente_firmas falló:', fallbackErr);
              toast.error('No se pudo guardar la firma en Supabase');
            }
          }
        } else {
          // No existe contrato: tratar de guardar la firma como cliente_firma (fallback),
          // de forma que cuando la app principal cree el contrato pueda reutilizarla.
          try {
            await supabase
              .from('cliente_firmas')
              .update({ activa: false })
              .eq('cliente_id', contractId)
              .eq('activa', true);

            const { error: insertClienteFirmaError } = await supabase
              .from('cliente_firmas')
              .insert({ cliente_id: contractId, firma_url: signatureData, activa: true });

            if (insertClienteFirmaError) {
              console.error('Error guardando cliente_firma desde SignPage:', insertClienteFirmaError);
              toast.error('No se pudo guardar la firma en el servidor; la firma solo se envió localmente');
            }
            if (!insertClienteFirmaError) {
              toast.success('Firma guardada en el cliente (lista para reutilizar)');
            }
          } catch (fallbackSaveErr) {
            console.warn('No fue posible guardar cliente_firma (probablemente RLS). Firma enviada localmente:', fallbackSaveErr);
            // No hacemos más, la app principal seguirá recibiendo el mensaje via postMessage/Broadcast
          }
        }
      } catch (dbErr) {
        console.error('Supabase no disponible; la firma solo se envia por Broadcast/postMessage:', dbErr);
        toast.error('Supabase no disponible, la firma se envio solo localmente');
      }
      setIsSuccess(true);
      toast.success('Firma guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la firma');
      console.error('Error:', error);
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
            Tu firma se guardo correctamente. La vista del contrato en la aplicacion principal se actualizara al instante.
            Puedes cerrar esta pestana cuando quieras.
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
            <p className="text-sm text-primary-foreground/90 mt-1">
              Contrato ID: {contractId || 'Cargando...'}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-300">
                <p className="font-medium">Por favor, firma en el area de abajo</p>
                <p className="text-xs mt-1">Usa tu dedo o un lapiz digital para firmar</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Area de Firma
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
              <div className="bg-success/10 border border-success/30 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <p className="text-sm text-success font-medium">Firma capturada correctamente</p>
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

            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">Instrucciones:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Firma en el area blanca de arriba</li>
                <li>Puedes limpiar y intentar de nuevo si es necesario</li>
                <li>Haz clic en "Guardar Firma" cuando estes listo</li>
                <li>La firma se envia automaticamente a la aplicacion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

