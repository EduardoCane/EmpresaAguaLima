import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ContractQRProps {
  contractId: string;
  showDownload?: boolean;
}

export function ContractQR({ contractId }: ContractQRProps) {
  const publicBase = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;

  const signUrl = useMemo(() => {
    if (publicBase) return `${publicBase.replace(/\/$/, '')}/sign/${contractId}`;
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
      </div>
    </div>
  );
}
