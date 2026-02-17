import { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useContratos } from '@/contexts/ContractContext';
import { Progress } from '@/components/ui/progress';
import { FileArchive } from 'lucide-react';
import { ContratoIntermitenteForm } from '@/components/contracts/forms/ContratoIntermitenteForm';
import { ContratoTemporadaPlanForm } from '@/components/contracts/forms/ContratoTemporadaPlanForm';
import { SistemaPensionarioForm } from '@/components/contracts/forms/SistemaPensionarioForm';
import { ReglamentosForm } from '@/components/contracts/forms/ReglamentosForm';
import { ConsentimientoInformadoForm } from '@/components/contracts/forms/ConsentimientoInformadoForm';
import { CuentaBancariaForm } from '@/components/contracts/forms/CuentaBancariaForm';
import { DeclaracionConflictoInteresesForm } from '@/components/contracts/forms/DeclaracionConflictoInteresesForm';
import { AcuerdoConfidencialidadForm } from '@/components/contracts/forms/AcuerdoConfidencialidadForm';
import { CartaNoSobornoForm } from '@/components/contracts/forms/CartaNoSobornoForm';
import { DeclaracionParentescoForm } from '@/components/contracts/forms/DeclaracionParentesco';
import { DjPatrimonialForm } from '@/components/contracts/forms/DjPatrimonialForm';
import { InduccionForm } from '@/components/contracts/forms/InduccionForm';
import { emptyFichaDatosValues } from '@/components/contracts/forms/FichaDatosForm';
import { emptyDeclaracionParentescoValues } from '@/components/contracts/forms/DeclaracionParentesco';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { zipProgress, zipRenderState, zipDocRef } = useContratos();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 pt-20 lg:pt-6">
            <div className="mx-auto w-full max-w-7xl">
              {children ?? <Outlet />}
            </div>
          </div>
        </div>
      </main>

      {/* Barra de progreso flotante para descarga de ZIP */}
      {zipProgress?.active && (
        <div 
          className="fixed bottom-4 right-4 left-4 md:left-auto z-50 bg-card border-2 border-primary/20 rounded-lg shadow-2xl p-5 md:min-w-[360px] max-w-md md:max-w-md transition-all duration-300 ease-out"
          style={{
            backdropFilter: 'blur(8px)',
            animation: 'slideInFromBottom 0.3s ease-out',
          }}
        >
          <style>{`
            @keyframes slideInFromBottom {
              from {
                transform: translateY(100px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FileArchive className="w-6 h-6 text-primary animate-pulse" />
                  {zipProgress.progress < 100 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
                  )}
                  {zipProgress.progress === 100 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </div>
                <div>
                  <span className="font-semibold text-foreground block">
                    {zipProgress.progress === 100 ? 'ZIP Completado ✓' : 'Generando ZIP'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {zipProgress.progress === 100 ? 'Descarga iniciada' : 'No cerrar esta página'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{zipProgress.progress}%</span>
              </div>
            </div>
            {/* Mostrar siempre el nombre del trabajador */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2 truncate" title={zipProgress.clientName}>
                {zipProgress.clientName}
              </p>
            </div>
            <div>
              <div className="space-y-1">
                <Progress value={zipProgress.progress} className="h-3 transition-all duration-300" />
                <p className="text-xs text-muted-foreground">
                  Documento {zipProgress.current} de {zipProgress.total}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Componentes de renderizado ocultos para ZIP - persisten aunque cambies de página */}
      <div
        style={{
          position: 'fixed',
          top: -2000,
          left: -2000,
          opacity: 0,
          pointerEvents: 'none',
          width: '794px',
          zIndex: -1,
        }}
      >
        <div ref={zipDocRef}>
          {zipRenderState.activeForm === 'contrato-intermitente' && (
            <ContratoIntermitenteForm
              client={zipRenderState.client}
              puesto={zipRenderState.fichaDatos?.puesto}
              fechaInicio={zipRenderState.fichaDatos?.periodoDesde}
              fechaFin={zipRenderState.fichaDatos?.periodoHasta}
              remuneracion={zipRenderState.fichaDatos?.remuneracion}
              celular={zipRenderState.fichaDatos?.celular}
              signatureSrc={zipRenderState.signature}
              pagePart="all"
              pdfMode={true}
            />
          )}
          {zipRenderState.activeForm === 'contrato-temporada-plan' && (
            <ContratoTemporadaPlanForm
              client={zipRenderState.client}
              puesto={zipRenderState.fichaDatos?.puesto}
              fechaInicio={zipRenderState.fichaDatos?.periodoDesde}
              fechaFin={zipRenderState.fichaDatos?.periodoHasta}
              remuneracion={zipRenderState.fichaDatos?.remuneracion}
              signatureSrc={zipRenderState.signature}
              celular={zipRenderState.fichaDatos?.celular}
              pagePart="all"
            />
          )}
          {zipRenderState.activeForm === 'sistema-pensionario' && (
            <SistemaPensionarioForm
              client={zipRenderState.client}
              ficha={zipRenderState.fichaDatos}
              signatureSrc={zipRenderState.signature}
              pensionChoice={zipRenderState.pensionChoice}
              onChangeChoice={() => {}}
              pdfMode={true}
            />
          )}
          {zipRenderState.activeForm === 'reglamentos' && (
            <ReglamentosForm
              client={zipRenderState.client}
              signatureSrc={zipRenderState.signature}
              pagePart="all"
            />
          )}
          {zipRenderState.activeForm === 'consentimiento-informado' && (
            <ConsentimientoInformadoForm
              client={zipRenderState.client}
              pagePart="all"
              signatureSrc={zipRenderState.signature || undefined}
            />
          )}
          {zipRenderState.activeForm === 'cuenta-bancaria' && (
            <CuentaBancariaForm 
              client={zipRenderState.client}
              signatureSrc={zipRenderState.signature || undefined}
              entidadBancaria={zipRenderState.fichaDatos?.entidadBancaria}
              numeroCuenta={zipRenderState.fichaDatos?.numeroCuenta}
            />
          )}
          {zipRenderState.activeForm === 'declaracion-conflicto' && (
            <DeclaracionConflictoInteresesForm
              client={zipRenderState.client}
              signatureSrc={zipRenderState.signature || undefined}
            />
          )}
          {zipRenderState.activeForm === 'acuerdo-confidencialidad' && (
            <AcuerdoConfidencialidadForm
              client={zipRenderState.client}
              signatureSrc={zipRenderState.signature || undefined}
              cargo={zipRenderState.fichaDatos?.puesto}
            />
          )}
          {zipRenderState.activeForm === 'carta-no-soborno' && (
            <CartaNoSobornoForm
              client={zipRenderState.client}
              signatureSrc={zipRenderState.signature || undefined}
              cargo={zipRenderState.fichaDatos?.puesto}
              unidadArea={zipRenderState.fichaDatos?.unidadArea}
            />
          )}
          {zipRenderState.activeForm === 'declaracion-parentesco' && (
            <DeclaracionParentescoForm
              client={zipRenderState.client}
              signatureSrc={zipRenderState.signature || undefined}
              parentescoValues={zipRenderState.declaracionParentesco}
            />
          )}
          {zipRenderState.activeForm === 'dj-patrimonial' && (
            <DjPatrimonialForm
              client={zipRenderState.client}
              signatureSrc={zipRenderState.signature || undefined}
            />
          )}
          {zipRenderState.activeForm === 'induccion' && (
            <InduccionForm />
          )}
        </div>
      </div>
    </div>
  );
}
