import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  onSignatureComplete: (signatureData: string) => void;
  existingSignature?: string;
  clearSignal?: number;
}

export function SignaturePad({ onSignatureComplete, existingSignature, clearSignal }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(existingSignature || '');
  const [mode, setMode] = useState<'draw' | 'complete'>('draw');

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevData = signatureData || existingSignature;
    const parentWidth = canvas.parentElement?.clientWidth || canvas.offsetWidth || 0;
    canvas.width = parentWidth;
    canvas.height = 160;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (prevData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = prevData;
    }
  };

  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSignatureData(existingSignature || '');
    if (!existingSignature) {
      setMode('draw');
      resizeCanvas();
    }
  }, [existingSignature]);

  useEffect(() => {
    if (clearSignal !== undefined) {
      handleReset();
    }
  }, [clearSignal]);

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoords(e);
    if (!coords) return;
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoords(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let isEmpty = true;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r !== 255 || g !== 255 || b !== 255) {
        isEmpty = false;
        break;
      }
    }

    if (isEmpty) {
      console.warn('El canvas está vacío');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
    onSignatureComplete(dataUrl);
    setMode('complete');
  };

  const handleReset = () => {
    setSignatureData('');
    setMode('draw');
    onSignatureComplete('');
    handleClear();
  };

  if (mode === 'complete' || signatureData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground">Firma Digital</h4>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Nueva firma
          </Button>
        </div>
        <div className="border-2 border-success rounded-lg p-4 bg-success/5">
          <div className="flex items-center gap-2 text-success mb-3">
            <Check className="w-5 h-5" />
            <span className="font-medium">Firma recibida</span>
          </div>
          <img
            src={signatureData}
            alt="Firma digital"
            className="max-h-24 mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="w-full h-40 cursor-crosshair touch-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="w-4 h-4 mr-1" />
            Confirmar firma
          </Button>
        </div>
      </div>
    </div>
  );
}
