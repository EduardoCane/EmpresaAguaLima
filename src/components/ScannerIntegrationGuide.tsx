import { useState, useRef } from 'react';
import { Barcode, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cliente } from '@/types';
import { toast } from 'sonner';

export function ScannerIntegrationGuide() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sistema de Escaneo de Códigos</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="test">Testing</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="dashboard-card p-6">
            <h2 className="text-xl font-semibold mb-4">¿Cómo Funciona?</h2>
            <div className="space-y-3 text-sm">
              <p>El sistema captura entrada de un scanner conectado al equipo.</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Usuario selecciona "Escanear Identificador"</li>
                <li>Escanea código de barras del identificador</li>
                <li>Sistema busca cliente por DNI en BD</li>
                <li>Datos se cargan automáticamente</li>
                <li>Usuario firma el contrato</li>
                <li>Contrato se guarda como firmado</li>
              </ol>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="setup" className="space-y-4">
          <div className="dashboard-card p-6">
            <h2 className="text-xl font-semibold mb-4">Configuración Required</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Hardware Mínimo</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Scanner HID (interfaz de teclado)</li>
                  <li>Conexión USB o Bluetooth</li>
                  <li>Debe enviar DNI + Enter</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Base de Datos</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tabla: clientes</li>
                  <li>Campos: dni, nombre, apellido, correo, celular</li>
                  <li>DNI debe coincidir con salida del scanner</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-4">
          <div className="dashboard-card p-6">
            <h2 className="text-xl font-semibold mb-4">Cómo Testear Ahora</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200 dark:border-blue-900">
                <p className="font-semibold">Sin hardware físico:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Abre app en http://localhost:8081</li>
                  <li>Ve a Fichas/Contratos → Nueva Ficha</li>
                  <li>Selecciona "Escanear Identificador"</li>
                  <li>Escribe manualmente un DNI que exista</li>
                  <li>Presiona Enter</li>
                  <li>Deberías ver datos cargados automáticamente</li>
                </ol>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="config" className="space-y-4">
          <div className="dashboard-card p-6">
            <h2 className="text-xl font-semibold mb-4">Configuración del Scanner</h2>
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold">ZEBRA / MOTOROLA</p>
                <p className="text-muted-foreground">DS3678, MC3300, DS4208</p>
                <p className="mt-1">Sin prefijo, sin sufijo, Enter solamente</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="font-semibold">HONEYWELL</p>
                <p className="text-muted-foreground">Voyager, Hyperion, Granit</p>
                <p className="mt-1">Modo ASCII, sufijo: Enter</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-semibold">DATALOGIC</p>
                <p className="text-muted-foreground">Gryphon, PowerScan</p>
                <p className="mt-1">Configurar modo texto, CR como sufijo</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ScannerIntegrationGuide;

