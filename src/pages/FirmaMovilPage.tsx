import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Check, RotateCcw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FirmaMovilPage() {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });

  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth - 48, 500);
      const height = Math.min(window.innerHeight * 0.4, 300);
      setCanvasSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = () => {
    if (sigCanvas.current?.isEmpty()) return;
    
    // In a real app, this would send the signature to the server
    // For demo purposes, we'll just show success
    setIsSigned(true);
  };

  if (isSigned) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6 motion-safe:animate-scale-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">¡Firma Enviada!</h1>
            <p className="text-muted-foreground mt-2">
              Su firma ha sido registrada correctamente.
              Puede cerrar esta ventana.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <Smartphone className="w-6 h-6" />
          <span className="font-semibold">Firma Digital</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">Firme el documento</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Use su dedo para dibujar su firma
        </p>
      </div>

      {/* Signature Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="signature-pad bg-card shadow-lg rounded-xl overflow-hidden">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              width: canvasSize.width,
              height: canvasSize.height,
              className: 'touch-none',
            }}
            backgroundColor="white"
            penColor="#1e293b"
          />
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Dibuje su firma en el recuadro superior
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={handleClear} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          <Check className="w-4 h-4 mr-2" />
          Enviar Firma
        </Button>
      </div>
    </div>
  );
}
