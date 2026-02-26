import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ContractQRProps {
  contractId: string;
  showDownload?: boolean;
}

export function ContractQR({ contractId }: ContractQRProps) {
  const publicBase = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;

  const normalizeBase = (value: string) => {
    try {
      const parsed = new URL(value);
      const cleanPath = parsed.pathname.replace(/\/$/, '');
      return `${parsed.origin}${cleanPath}`;
    } catch {
      return value.replace(/[#?].*$/, '').replace(/\/$/, '');
    }
  };

  const signUrl = useMemo(() => {
    if (publicBase) return `${normalizeBase(publicBase)}/sign/${contractId}`;
    return `${window.location.origin}/sign/${contractId}`;
  }, [contractId, publicBase]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex justify-center">
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG
          id={`qr-${contractId}`}
          value={signUrl}
          size={256}
          level="H"
          includeMargin={true}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <a
            href={signUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline"
          >
            Abrir enlace de firma
          </a>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(signUrl);
                  toast.success('URL copiada al portapapeles');
                } catch (e) {
                  console.error('No se pudo copiar URL:', e);
                  toast.error('No se pudo copiar la URL');
                }
              }}
            >
              Copiar URL
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
