import { useEffect, useRef, useState } from 'react';
import { Barcode, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Cliente } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScannerInputProps {
  onClientDetected: (client: Cliente) => void;
  getClientByDni: (dni: string) => Cliente | undefined;
  disabled?: boolean;
  onRegisterNewClient?: (dni?: string) => void;
}

export function ScannerInput({
  onClientDetected,
  getClientByDni,
  disabled = false,
  onRegisterNewClient,
}: ScannerInputProps) {
  const [scannedDni, setScannedDni] = useState('');
  const [isListening, setIsListening] = useState(true);
  const [clientFound, setClientFound] = useState<Cliente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerInputRef = useRef<HTMLDivElement>(null);
  const barcodesRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (disabled || !isListening) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.key === 'Tab' ||
        event.key === 'Escape'
      ) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();

        const dni = barcodesRef.current.trim();
        if (dni.length > 0) {
          setScannedDni(dni);
          processScannedDni(dni);
        }

        barcodesRef.current = '';
        return;
      }

      if (event.key.length === 1) {
        event.preventDefault();
        barcodesRef.current += event.key;
        setIsScanning(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (barcodesRef.current.length > 0) {
            const dni = barcodesRef.current.trim();
            setScannedDni(dni);
            processScannedDni(dni);
            barcodesRef.current = '';
            setIsScanning(false);
          }
        }, 3000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, disabled]);

  const processScannedDni = (dni: string) => {
    setError(null);
    setIsScanning(false);

    const cleanDni = dni.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (!cleanDni) {
      setError('Código inválido. Por favor, intenta nuevamente.');
      setClientFound(null);
      return;
    }

    const foundClient = getClientByDni(cleanDni);

    if (foundClient) {
      setClientFound(foundClient);
      setError(null);
      onClientDetected(foundClient);
    } else {
      setError(
        `No se encontró trabajador con DNI: ${cleanDni}. Verifica que el código sea correcto.`
      );
      setClientFound(null);
    }
  };

  const handleReset = () => {
    barcodesRef.current = '';
    setScannedDni('');
    setClientFound(null);
    setError(null);
    setIsScanning(false);
  };

  return (
    <div
      ref={scannerInputRef}
      className="dashboard-card p-6 space-y-4"
      tabIndex={-1}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${isListening ? 'bg-primary/10' : 'bg-muted'}`}>
            <Barcode className={`w-6 h-6 ${isListening ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Escáner de Código de Barras</h3>
            <p className="text-sm text-muted-foreground">
              {isListening ? 'Listo para escanear' : 'Scanner desactivado'}
            </p>
          </div>
        </div>
        <div className={`text-xs font-medium px-3 py-1 rounded-full ${
          isListening
            ? 'bg-success/20 text-success'
            : 'bg-muted text-muted-foreground'
        }`}>
          {isListening ? 'Escuchando' : 'Inactivo'}
        </div>
      </div>

      {isScanning && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Leyendo código: <span className="font-mono font-semibold">{barcodesRef.current}</span>
          </p>
        </div>
      )}

      {clientFound && (
        <Alert className="bg-success/10 border border-success/30">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <AlertDescription className="text-success ml-2">
            Trabajador encontrado: <span className="font-semibold">{clientFound.nombre} {clientFound.apellido}</span>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <div className="space-y-3">
          <Alert className="bg-destructive/10 border border-destructive/30">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <AlertDescription className="text-destructive ml-2">
              {error}
            </AlertDescription>
          </Alert>
          {onRegisterNewClient && (
            <button
              onClick={() => onRegisterNewClient(scannedDni)}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              Registrar Nuevo Trabajador
            </button>
          )}
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">Instrucciones:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Escanea el código de barras del identificador del trabajador</li>
          <li>El sistema busca automáticamente en la base de datos</li>
          <li>Si se encuentra, los datos se cargan automáticamente</li>
        </ul>
      </div>

      {scannedDni && (
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Último código escaneado</p>
            <p className="font-mono text-foreground select-text">{scannedDni}</p>
          </div>
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1 rounded bg-muted-foreground/20 hover:bg-muted-foreground/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

    </div>
  );
}

