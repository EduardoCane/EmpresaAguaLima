import Barcode from 'react-barcode';
import { useState, useEffect } from 'react';

interface ClientBarcodeProps {
  dni: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export function ClientBarcode({ 
  dni, 
  width = 1.5, 
  height = 50, 
  displayValue = true 
}: ClientBarcodeProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const cleanDni = (dni || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  if (!cleanDni) {
    return (
      <div className="barcode-container text-muted-foreground text-sm">
        Ingrese un DNI válido
      </div>
    );
  }

  return (
    <div className="barcode-container">
      <Barcode
        value={cleanDni}
        width={width}
        height={height}
        displayValue={displayValue}
        format="CODE128"
        background="transparent"
        lineColor={isDarkMode ? "#ffffff" : "#1e293b"}
        fontSize={12}
        margin={10}
      />
    </div>
  );
}
