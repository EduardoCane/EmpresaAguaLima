import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Contrato, Cliente } from '@/types';
import { supabase } from '@/lib/supabase';
import type { FichaDatosValues } from '@/components/contracts/forms/FichaDatosForm';
import type { DeclaracionParentescoValues } from '@/components/contracts/forms/DeclaracionParentesco';

export type ContractFormId = 'ficha-datos' | 'contrato-intermitente' | 'contrato-temporada-plan' | 
  'sistema-pensionario' | 'reglamentos' | 'consentimiento-informado' | 'induccion' | 
  'cuenta-bancaria' | 'declaracion-conflicto' | 'acuerdo-confidencialidad' | 
  'carta-no-soborno' | 'declaracion-parentesco' | 'dj-patrimonial';


export interface ZipProgress {
  active: boolean;
  progress: number;
  total: number;
  current: number;
  clientName: string;
}

export interface ZipRenderState {
  activeForm: ContractFormId | null;
  fichaDatos: FichaDatosValues | null;
  pensionChoice: string;
  declaracionParentesco: DeclaracionParentescoValues | null;
  signature: string;
  client: Cliente | null;
  docLabel: string;
}

export type ZipProgressMap = Record<string, ZipProgress>;
export type ZipRenderStateMap = Record<string, ZipRenderState>;
export type ZipDocRefMap = Record<string, React.RefObject<HTMLDivElement>>;

interface ContractContextType {
  contratos: Contrato[];
  addContrato: (contrato: Omit<Contrato, 'id' | 'created_at'>) => Promise<string | void>;
  updateContrato: (id: string, contrato: Partial<Contrato>) => Promise<void>;
  deleteContrato: (id: string) => Promise<void>;
  getContratoById: (id: string) => Contrato | undefined;
  getContratosByClienteId: (clienteId: string) => Contrato[];
  firmarContrato: (id: string, firmado_at: Date, signatureData?: string) => Promise<void>;
  reloadContratos: () => Promise<void>;
  loading: boolean;
  error: string | null;
  zipProgress: ZipProgress | null;
  setZipProgress: React.Dispatch<React.SetStateAction<ZipProgress | null>>;
  zipRenderState: ZipRenderState;
  setZipRenderState: React.Dispatch<React.SetStateAction<ZipRenderState>>;
  zipDocRef: React.RefObject<HTMLDivElement>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zipProgressMap, setZipProgressMap] = useState<ZipProgressMap>({});
  const [zipRenderStateMap, setZipRenderStateMap] = useState<ZipRenderStateMap>({});
  const [zipDocRefMap, setZipDocRefMap] = useState<ZipDocRefMap>({});
  const [zipProgress, setZipProgress] = useState<ZipProgress | null>(null);
  const [zipRenderState, setZipRenderState] = useState<ZipRenderState>({
    activeForm: null,
    fichaDatos: null,
    pensionChoice: '',
    declaracionParentesco: null,
    signature: '',
    client: null,
    docLabel: '',
  });
  const zipDocRef = useRef<HTMLDivElement>(null);

  const loadContratos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando carga de contratos desde Supabase...');
      
      const { data, error: fetchError } = await supabase
        .from('contratos')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error de Supabase:', fetchError);
        console.warn('Using mock data instead...');
        // Usar datos simulados si Supabase falla
        const mockContratos = [
          { id: '1', cliente_id: '1', contenido: 'Contrato de trabajo', estado: 'firmado' as const, firmado: true, firmado_at: new Date(), created_at: new Date() },
          { id: '2', cliente_id: '2', contenido: 'Contrato de servicios', estado: 'borrador' as const, firmado: false, firmado_at: undefined, created_at: new Date() },
        ];
        setContratos(mockContratos);
        setLoading(false);
        return;
      }

      console.log('Contratos cargados:', data);
      
      const formattedContratos = (data || []).map(contrato => ({
        ...contrato,
        created_at: new Date(contrato.created_at),
        firmado_at: contrato.firmado_at ? new Date(contrato.firmado_at) : undefined,
      }));

      setContratos(formattedContratos);
    } catch (err) {
      console.error('Error loading contratos:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar contratos';
      setError(errorMsg);
      // Usar datos simulados como fallback
      const mockContratos = [
        { id: '1', cliente_id: '1', contenido: 'Contrato de trabajo', estado: 'firmado' as const, firmado: true, firmado_at: new Date(), created_at: new Date() },
      ];
      setContratos(mockContratos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContratos();
  }, []);

  const addContrato = async (contratoData: Omit<Contrato, 'id' | 'created_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('contratos')
        .insert([{
          cliente_id: contratoData.cliente_id,
          contenido: contratoData.contenido,
          estado: contratoData.estado,
          firmado: contratoData.firmado,
          firmado_at: contratoData.firmado_at,
          ficha_datos: contratoData.ficha_datos ?? {},
          contrato_intermitente: contratoData.contrato_intermitente ?? {},
          contrato_temporada_plan: contratoData.contrato_temporada_plan ?? {},
          sistema_pensionario: contratoData.sistema_pensionario ?? {},
          reglamentos: contratoData.reglamentos ?? {},
          consentimiento_informado: contratoData.consentimiento_informado ?? {},
          induccion: contratoData.induccion ?? {},
          cuenta_bancaria: contratoData.cuenta_bancaria ?? {},
          declaracion_conflicto_intereses: contratoData.declaracion_conflicto_intereses ?? {},
          acuerdo_confidencialidad: contratoData.acuerdo_confidencialidad ?? {},
          carta_no_soborno: contratoData.carta_no_soborno ?? {},
          declaracion_parentesco: contratoData.declaracion_parentesco ?? {},
          dj_patrimonial: contratoData.dj_patrimonial ?? {},
        }])
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      await loadContratos();
      return data?.id;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al agregar contrato';
      console.error('Error adding contrato:', err);
      setError(errorMsg);
      throw err;
    }
  };

  const updateContrato = async (id: string, contratoData: Partial<Contrato>) => {
    try {
      const updateData: Partial<Contrato> = {};
      if (contratoData.contenido) updateData.contenido = contratoData.contenido;
      if (contratoData.estado) updateData.estado = contratoData.estado;
      if (contratoData.firmado !== undefined) updateData.firmado = contratoData.firmado;
      if ('firmado_at' in contratoData) updateData.firmado_at = contratoData.firmado_at;
      if ('ficha_datos' in contratoData) updateData.ficha_datos = contratoData.ficha_datos ?? {};
      if ('contrato_intermitente' in contratoData) updateData.contrato_intermitente = contratoData.contrato_intermitente ?? {};
      if ('contrato_temporada_plan' in contratoData) updateData.contrato_temporada_plan = contratoData.contrato_temporada_plan ?? {};
      if ('sistema_pensionario' in contratoData) updateData.sistema_pensionario = contratoData.sistema_pensionario ?? {};
      if ('reglamentos' in contratoData) updateData.reglamentos = contratoData.reglamentos ?? {};
      if ('consentimiento_informado' in contratoData) updateData.consentimiento_informado = contratoData.consentimiento_informado ?? {};
      if ('induccion' in contratoData) updateData.induccion = contratoData.induccion ?? {};
      if ('cuenta_bancaria' in contratoData) updateData.cuenta_bancaria = contratoData.cuenta_bancaria ?? {};
      if ('declaracion_conflicto_intereses' in contratoData) updateData.declaracion_conflicto_intereses = contratoData.declaracion_conflicto_intereses ?? {};
      if ('acuerdo_confidencialidad' in contratoData) updateData.acuerdo_confidencialidad = contratoData.acuerdo_confidencialidad ?? {};
      if ('carta_no_soborno' in contratoData) updateData.carta_no_soborno = contratoData.carta_no_soborno ?? {};
      if ('declaracion_parentesco' in contratoData) updateData.declaracion_parentesco = contratoData.declaracion_parentesco ?? {};
      if ('dj_patrimonial' in contratoData) updateData.dj_patrimonial = contratoData.dj_patrimonial ?? {};

      const { error: updateError } = await supabase
        .from('contratos')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setContratos(prev =>
        prev.map(contrato =>
          contrato.id === id ? { ...contrato, ...contratoData } : contrato
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar contrato';
      console.error('Error updating contrato:', err);
      setError(errorMsg);
      throw err;
    }
  };

  const deleteContrato = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setContratos(prev => prev.filter(contrato => contrato.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar contrato';
      console.error('Error deleting contrato:', err);
      setError(errorMsg);
      throw err;
    }
  };

  const getContratoById = (id: string) => {
    return contratos.find(contrato => contrato.id === id);
  };

  const getContratosByClienteId = (clienteId: string) => {
    return contratos.filter(contrato => contrato.cliente_id === clienteId);
  };

  const firmarContrato = async (id: string, firmado_at: Date, signatureData?: string) => {
    try {
      // Primero insertar la firma en la tabla firmas
      // El trigger preparar_firma_contrato manejará:
      // - Guardar/reutilizar firma en cliente_firmas
      // - Enlazar cliente_firma_id
      // El trigger marcar_contrato_firmado marcará el contrato como firmado
      
      if (signatureData) {
        const { error: insertFirmaError } = await supabase
          .from('firmas')
          .insert([{ 
            contrato_id: id, 
            firma_url: signatureData,
            origen: 'capturada' // Nueva firma capturada
          }]);
        
        if (insertFirmaError) {
          console.error('Error guardando firma:', insertFirmaError);
          throw insertFirmaError;
        }
      } else {
        // Si no hay firma pero quiere reutilizar
        const { error: insertFirmaError } = await supabase
          .from('firmas')
          .insert([{ 
            contrato_id: id,
            origen: 'reutilizada' // Reutilizar firma existente del cliente
          }]);
        
        if (insertFirmaError) {
          console.error('Error reutilizando firma:', insertFirmaError);
          throw insertFirmaError;
        }
      }

      // Recargar contratos para actualizar estado
      await loadContratos();

      setContratos(prev =>
        prev.map(contrato =>
          contrato.id === id
            ? { ...contrato, firmado: true, firmado_at, estado: 'firmado' as const }
            : contrato
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al firmar contrato';
      console.error('Error signing contrato:', err);
      setError(errorMsg);
      throw err;
    }
  };

  return (
    <ContractContext.Provider value={{
      contratos,
      addContrato,
      updateContrato,
      deleteContrato,
      getContratoById,
      getContratosByClienteId,
      firmarContrato,
      reloadContratos: loadContratos,
      loading,
      error,
        zipProgress,
        setZipProgress,
        zipRenderState,
        setZipRenderState,
        zipDocRef,
    }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContratos() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContratos must be used within a ContractProvider');
  }
  return context;
}
