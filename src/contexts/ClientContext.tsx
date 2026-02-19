import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Cliente } from '@/types';
import { supabase } from '@/lib/supabase';

interface ClientContextType {
  clientes: Cliente[];
  addCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'cod'> & { cod?: string | null }) => Promise<Cliente>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  getClienteByDni: (dni: string) => Cliente | undefined;
  getClienteByCod: (cod: string) => Cliente | undefined;
  getClienteById: (id: string) => Cliente | undefined;
  getNextCod: () => Promise<string>;
  loading: boolean;
  error: string | null;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando carga de clientes desde Supabase...');
      
      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error de Supabase:', fetchError);
        console.warn('Using mock data instead...');
        // Usar datos simulados si Supabase falla
        const mockClientes = [
          { id: '1', cod: '44000', dni: '12345678', nombre: 'Juan', a_paterno: 'Pérez', apellidos_y_nombres: 'Pérez Juan', created_at: new Date() },
          { id: '2', cod: '44001', dni: '87654321', nombre: 'María', a_paterno: 'García', apellidos_y_nombres: 'García María', created_at: new Date() },
        ];
        setClientes(mockClientes);
        setLoading(false);
        return;
      }

      console.log('Clientes cargados:', data);
      
      const formattedClientes = (data || []).map((cliente: any) => {
        console.log('Cliente raw:', cliente);
        return {
          ...cliente,
          created_at: new Date(cliente.created_at),
        };
      });

      setClientes(formattedClientes);
    } catch (err) {
      console.error('Error loading clientes:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar clientes';
      setError(errorMsg);
      // Usar datos simulados como fallback
      const mockClientes = [
        { id: '1', cod: '44000', dni: '12345678', nombre: 'Juan', a_paterno: 'Pérez', apellidos_y_nombres: 'Pérez Juan', created_at: new Date() },
      ];
      setClientes(mockClientes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const addCliente = async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'cod'> & { cod?: string | null }): Promise<Cliente> => {
    try {
      // Obtener el próximo código
      const codIngresado = (clienteData.cod ?? '').trim();
      const cod = codIngresado || await getNextCod();
      
      // Si no hay fecha_reclutamiento, usar la fecha actual
      const fechaReclutamiento = clienteData.fecha_reclutamiento || new Date().toISOString().split('T')[0];
      
      // Generar apellidos_y_nombres si viene en el clienteData
      const apellidosYNombres = (clienteData.apellidos_y_nombres ?? '').trim();
      
      const repetirCodigo = (clienteData.repetir_codigo ?? '').trim();
      const payload = {
        cod,
        repetir_codigo: repetirCodigo || cod,
        dni: clienteData.dni,
        a_paterno: clienteData.a_paterno ?? null,
        a_materno: clienteData.a_materno ?? null,
        nombre: clienteData.nombre ?? null,
        apellidos_y_nombres: apellidosYNombres || null,
        fecha_nac: clienteData.fecha_nac ?? null,
        edad: (clienteData.edad && typeof clienteData.edad === 'number' && !isNaN(clienteData.edad)) ? clienteData.edad : null,
        fecha_reclutamiento: fechaReclutamiento,
        sexo: clienteData.sexo ?? null,
        estado_civil: clienteData.estado_civil ?? null,
        codigogrupotrabajo: clienteData.codigogrupotrabajo ?? null,
        id_afp: clienteData.id_afp ?? null,
        cuspp: clienteData.cuspp ?? null,
        fecha_inicio_afiliacion: clienteData.fecha_inicio_afiliacion ?? null,
        porcentaje_comision: (clienteData.porcentaje_comision && typeof clienteData.porcentaje_comision === 'number' && !isNaN(clienteData.porcentaje_comision)) ? clienteData.porcentaje_comision : null,
        nueva_afiliacion: clienteData.nueva_afiliacion ?? null,
        grado_instruccion: clienteData.grado_instruccion ?? null,
        direccion: clienteData.direccion ?? null,
        distrito: clienteData.distrito ?? null,
        provincia: clienteData.provincia ?? null,
        departamento: clienteData.departamento ?? null,
        area: clienteData.area ?? null,
        descripcion_zona: clienteData.descripcion_zona ?? null,
        asignacion: clienteData.asignacion ?? null,
        estado_actual: clienteData.estado_actual ?? null,
        cargo: clienteData.cargo ?? null,
        fecha_inicio_contrato: clienteData.fecha_inicio_contrato ?? null,
        fecha_termino_contrato: clienteData.fecha_termino_contrato ?? null,
        remuneracion: (clienteData.remuneracion && typeof clienteData.remuneracion === 'number' && !isNaN(clienteData.remuneracion)) ? clienteData.remuneracion : null,
        tipo_contrato: clienteData.tipo_contrato ?? null,
        planilla: clienteData.planilla ?? null,
        observaciones: clienteData.observaciones ?? null,
        referido: clienteData.referido ?? null,
        lugar: clienteData.lugar ?? null,
        cooperador: clienteData.cooperador ?? null,
      };
      const { data: insertedCliente, error: insertError } = await supabase
        .from('clientes')
        .insert([payload])
        .select('*')
        .single();

      if (insertError) {
        throw insertError;
      }
      if (!insertedCliente) {
        throw new Error('No se pudo obtener el cliente insertado');
      }

      await loadClientes();
      return {
        ...insertedCliente,
        created_at: insertedCliente.created_at ? new Date(insertedCliente.created_at) : undefined,
      } as Cliente;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al agregar cliente';
      console.error('Error adding cliente:', err);
      setError(errorMsg);
      throw err;
    }
  };

  const updateCliente = async (id: string, clienteData: Partial<Cliente>) => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if ('cod' in clienteData && typeof clienteData.cod === 'string') {
        const cod = clienteData.cod.trim();
        if (cod) updateData.cod = cod;
      }
      if ('dni' in clienteData) updateData.dni = clienteData.dni ?? null;
      if ('repetir_codigo' in clienteData) updateData.repetir_codigo = clienteData.repetir_codigo ?? null;
      if ('a_paterno' in clienteData) updateData.a_paterno = clienteData.a_paterno ?? null;
      if ('a_materno' in clienteData) updateData.a_materno = clienteData.a_materno ?? null;
      if ('nombre' in clienteData) updateData.nombre = clienteData.nombre ?? null;
      if ('fecha_nac' in clienteData) updateData.fecha_nac = clienteData.fecha_nac ?? null;
      if ('edad' in clienteData) {
        const age = clienteData.edad;
        updateData.edad = (age && typeof age === 'number' && !isNaN(age)) ? age : null;
      }
      if ('fecha_reclutamiento' in clienteData) updateData.fecha_reclutamiento = clienteData.fecha_reclutamiento ?? null;
      if ('sexo' in clienteData) updateData.sexo = clienteData.sexo ?? null;
      if ('estado_civil' in clienteData) updateData.estado_civil = clienteData.estado_civil ?? null;
      if ('codigogrupotrabajo' in clienteData) updateData.codigogrupotrabajo = clienteData.codigogrupotrabajo ?? null;
      if ('id_afp' in clienteData) updateData.id_afp = clienteData.id_afp ?? null;
      if ('cuspp' in clienteData) updateData.cuspp = clienteData.cuspp ?? null;
      if ('fecha_inicio_afiliacion' in clienteData) updateData.fecha_inicio_afiliacion = clienteData.fecha_inicio_afiliacion ?? null;
      if ('porcentaje_comision' in clienteData) {
        const comision = clienteData.porcentaje_comision;
        updateData.porcentaje_comision = (comision && typeof comision === 'number' && !isNaN(comision)) ? comision : null;
      }
      if ('nueva_afiliacion' in clienteData) updateData.nueva_afiliacion = clienteData.nueva_afiliacion ?? null;
      if ('grado_instruccion' in clienteData) updateData.grado_instruccion = clienteData.grado_instruccion ?? null;
      if ('direccion' in clienteData) updateData.direccion = clienteData.direccion ?? null;
      if ('distrito' in clienteData) updateData.distrito = clienteData.distrito ?? null;
      if ('provincia' in clienteData) updateData.provincia = clienteData.provincia ?? null;
      if ('departamento' in clienteData) updateData.departamento = clienteData.departamento ?? null;
      if ('area' in clienteData) updateData.area = clienteData.area ?? null;
      if ('descripcion_zona' in clienteData) updateData.descripcion_zona = clienteData.descripcion_zona ?? null;
      if ('asignacion' in clienteData) updateData.asignacion = clienteData.asignacion ?? null;
      if ('estado_actual' in clienteData) updateData.estado_actual = clienteData.estado_actual ?? null;
      if ('cargo' in clienteData) updateData.cargo = clienteData.cargo ?? null;
      if ('fecha_inicio_contrato' in clienteData) updateData.fecha_inicio_contrato = clienteData.fecha_inicio_contrato ?? null;
      if ('fecha_termino_contrato' in clienteData) updateData.fecha_termino_contrato = clienteData.fecha_termino_contrato ?? null;
      if ('remuneracion' in clienteData) {
        const remun = clienteData.remuneracion;
        updateData.remuneracion = (remun && typeof remun === 'number' && !isNaN(remun)) ? remun : null;
      }
      if ('tipo_contrato' in clienteData) updateData.tipo_contrato = clienteData.tipo_contrato ?? null;
      if ('planilla' in clienteData) updateData.planilla = clienteData.planilla ?? null;
      if ('observaciones' in clienteData) updateData.observaciones = clienteData.observaciones ?? null;
      if ('referido' in clienteData) updateData.referido = clienteData.referido ?? null;
      if ('lugar' in clienteData) updateData.lugar = clienteData.lugar ?? null;
      if ('cooperador' in clienteData) updateData.cooperador = clienteData.cooperador ?? null;

      const { error: updateError } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setClientes(prev =>
        prev.map(cliente =>
          cliente.id === id ? { ...cliente, ...clienteData } : cliente
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar cliente';
      console.error('Error updating cliente:', err);
      setError(errorMsg);
      throw err;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setClientes(prev => prev.filter(cliente => cliente.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar cliente';
      console.error('Error deleting cliente:', err);
      setError(errorMsg);
      throw err;
    }
  };

  const getClienteByDni = (dni: string) => {
    return clientes.find(cliente => cliente.dni.toLowerCase() === dni.toLowerCase());
  };

  const getClienteByCod = (cod: string) => {
    return clientes.find(cliente => cliente.cod.toLowerCase() === cod.toLowerCase());
  };

  const getClienteById = (id: string) => {
    return clientes.find(cliente => cliente.id === id);
  };

  const getNextCod = async (): Promise<string> => {
    try {
      // Obtener el cliente con el código más alto
      const { data, error } = await supabase
        .from('clientes')
        .select('cod')
        .order('cod', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error getting next cod:', error);
        // Si hay error, usar 44000 como fallback
        return '44000';
      }

      if (!data || data.length === 0) {
        // Si no hay clientes, comenzar desde 44000
        return '44000';
      }

      // Extraer el número del código anterior y sumar 1
      const lastCod = data[0].cod;
      const codNumber = parseInt(lastCod, 10);
      
      if (isNaN(codNumber)) {
        // Si no es un número válido, comenzar desde 44000
        return '44000';
      }

      return String(codNumber + 1);
    } catch (err) {
      console.error('Error in getNextCod:', err);
      // En caso de error, usar 44000 como fallback
      return '44000';
    }
  };

  return (
    <ClientContext.Provider value={{
      clientes,
      addCliente,
      updateCliente,
      deleteCliente,
      getClienteByDni,
      getClienteByCod,
      getClienteById,
      getNextCod,
      loading,
      error,
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClientes() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientes must be used within a ClientProvider');
  }
  return context;
}
