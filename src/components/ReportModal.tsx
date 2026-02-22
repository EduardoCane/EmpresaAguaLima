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
import { toast } from 'sonner';

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
  const [startTime, setStartTime] = useState<string>('00:00');
  const [endTime, setEndTime] = useState<string>('23:59');
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [isGenerating, setIsGenerating] = useState(false);

  const parseLocalDateTime = (dateValue: string, timeValue: string, endOfMinute = false) => {
    const [year, month, day] = dateValue.split('-').map(Number);
    const [hours, minutes] = timeValue.split(':').map(Number);
    const safeHours = Number.isNaN(hours) ? 0 : hours;
    const safeMinutes = Number.isNaN(minutes) ? 0 : minutes;

    const parsed = (!year || !month || !day)
      ? new Date(`${dateValue}T${timeValue || '00:00'}`)
      : new Date(year, month - 1, day, safeHours, safeMinutes, 0, 0);

    if (endOfMinute && !Number.isNaN(parsed.getTime())) {
      parsed.setSeconds(59, 999);
    }

    return parsed;
  };

  useEffect(() => {
    if (mode === 'single') {
      const today = format(new Date(), 'yyyy-MM-dd');
      setStartDate(today);
      setEndDate(today);
    }
  }, [mode]);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const start = parseLocalDateTime(startDate, startTime);
      const end = mode === 'single'
        ? parseLocalDateTime(startDate, endTime, true)
        : parseLocalDateTime(endDate, endTime, true);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        toast.error('Debes ingresar una fecha y hora validas');
        return;
      }

      if (start > end) {
        toast.error('La fecha y hora de inicio no puede ser mayor que la fecha y hora de fin');
        return;
      }

      const contratosInRange = contratos.filter(c => {
        const t = new Date(c.created_at).getTime();
        return t >= start.getTime() && t <= end.getTime();
      });

      const filteredClientes = filterClientesByDate(clientes, start, end, contratosInRange);

      if (filteredClientes.length === 0) {
        toast.warning('No hay clientes registrados en el rango de fechas y horas seleccionado');
        return;
      }

      const reportName = mode === 'single'
        ? `Reporte_Clientes_${startDate}_${startTime.replace(':', '-')}_a_${endTime.replace(':', '-')}`
        : `Reporte_Clientes_${startDate}_${startTime.replace(':', '-')}_a_${endDate}_${endTime.replace(':', '-')}`;

      const rangeLabel = mode === 'single'
        ? format(start, 'dd/MM/yyyy', { locale: undefined })
        : `${format(start, 'dd/MM/yyyy', { locale: undefined })} al ${format(end, 'dd/MM/yyyy', { locale: undefined })}`;

      await generateExcelReport(filteredClientes, reportName, contratosInRange, rangeLabel);

      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte. Por favor intenta de nuevo.');
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
            Selecciona un rango de fecha y hora para generar el reporte de clientes registrados en Excel
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-time">Hora de Inicio</Label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Hora de Fin</Label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
            Se generara un reporte con {clientes.length} cliente(s) potencialmente registrado(s) en el rango seleccionado.
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
            {isGenerating ? '...' : 'Descargar Excel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
