import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Cliente } from '@/types';
import { useContratos } from '@/contexts/ContractContext';
import { useReportGenerator } from '@/hooks/useReportGenerator';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: Cliente[];
}

export function ReportModal({ isOpen, onClose, clientes }: ReportModalProps) {
  const { filterClientesByDate, generateExcelReport } = useReportGenerator();
  const { contratos } = useContratos();
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [isGenerating, setIsGenerating] = useState(false);

  const parseLocalDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return new Date(value);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    if (mode === 'single') {
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [mode]);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const start = parseLocalDate(startDate);
      const end = mode === 'single' ? parseLocalDate(startDate) : parseLocalDate(endDate);

      if (start > end) {
        alert('La fecha de inicio no puede ser mayor que la fecha de fin');
        return;
      }

      const filteredClientes = filterClientesByDate(clientes, start, end);

      if (filteredClientes.length === 0) {
        alert('No hay clientes registrados en el rango de fechas seleccionado');
        return;
      }

      const reportName = mode === 'single'
        ? `Reporte_Clientes_${startDate}`
        : `Reporte_Clientes_${startDate}_a_${endDate}`;

      await generateExcelReport(filteredClientes, reportName, contratos);

      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generar Reporte de Clientes</DialogTitle>
          <DialogDescription>
            Selecciona un rango de fechas para generar el reporte de clientes registrados en Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">Tipo de reporte</Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="report-mode"
                  value="single"
                  checked={mode === 'single'}
                  onChange={() => setMode('single')}
                />
                Un dia
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="report-mode"
                  value="range"
                  checked={mode === 'range'}
                  onChange={() => setMode('range')}
                />
                Intervalo
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {mode === 'single' ? 'Fecha' : 'Fecha de Inicio'}
            </Label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field w-full"
            />
          </div>

          {mode === 'range' && (
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Fin
              </Label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
            Se generará un reporte con {clientes.length} cliente(s) potencialmente registrado(s) en el rango seleccionado.
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? '...' : '📊 Descargar Excel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
