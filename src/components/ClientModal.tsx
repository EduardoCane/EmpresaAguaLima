import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Cliente } from '@/types';
import { useClientes } from '@/contexts/ClientContext';
import { ClientBarcode } from '@/components/ClientBarcode';
import { toast } from 'sonner';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingClient?: Cliente | null;
}

export function ClientModal({ isOpen, onClose, editingClient }: ClientModalProps) {
  const { addCliente, updateCliente, getClienteByDni } = useClientes();
  const [formData, setFormData] = useState({
    dni: '',
    repetir_codigo: '',
    nombre: '',
    a_paterno: '',
    a_materno: '',
    fecha_nac: '',
    edad: '',
    fecha_reclutamiento: '',
    sexo: '',
    estado_civil: '',
    codigogrupotrabajo: '',
    id_afp: '',
    cuspp: '',
    fecha_inicio_afiliacion: '',
    porcentaje_comision: '',
    nueva_afiliacion: false,
    grado_instruccion: '',
    direccion: '',
    distrito: '',
    provincia: '',
    departamento: '',
    area: '',
    descripcion_zona: '',
    asignacion: '',
    estado_actual: '',
    cargo: '',
    fecha_inicio_contrato: '',
    fecha_termino_contrato: '',
    tipo_contrato: '',
    remuneracion: '',
    planilla: '',
    observaciones: '',
    referido: '',
    lugar: '',
    cooperador: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reniecLoading, setReniecLoading] = useState(false);
  const [reniecError, setReniecError] = useState<string | null>(null);
  const reniecAbort = useRef<AbortController | null>(null);
  const reniecToken = import.meta.env.VITE_RENIEC_TOKEN || 'sk_12933.HGJ0GrDZjKEOundZardFPZCTJZhCBlAy';
  const reniecApiBase = import.meta.env.VITE_RENIEC_API_URL || '/reniec';
  const dniInputRef = useRef<HTMLInputElement>(null);

  const splitApellido = (apellido?: string | null) => {
    const trimmed = (apellido ?? '').trim();
    if (!trimmed) return { paterno: '', materno: '' };
    const parts = trimmed.split(/\s+/);
    return { paterno: parts[0] ?? '', materno: parts.slice(1).join(' ') };
  };

  useEffect(() => {
    if (editingClient) {
      const fallbackApellidos = splitApellido(editingClient.a_paterno);
      setFormData({
        dni: editingClient.dni ?? '',
        repetir_codigo: editingClient.repetir_codigo ?? '',
        nombre: editingClient.nombre ?? '',
        a_paterno: editingClient.a_paterno ?? fallbackApellidos.paterno,
        a_materno: editingClient.a_materno ?? fallbackApellidos.materno,
        fecha_nac: editingClient.fecha_nac ?? '',
        edad: editingClient.edad ? String(editingClient.edad) : '',
        fecha_reclutamiento: editingClient.fecha_reclutamiento ?? '',
        sexo: editingClient.sexo ?? '',
        estado_civil: editingClient.estado_civil ?? '',
        codigogrupotrabajo: editingClient.codigogrupotrabajo ?? '',
        id_afp: editingClient.id_afp ?? '',
        cuspp: editingClient.cuspp ?? '',
        fecha_inicio_afiliacion: editingClient.fecha_inicio_afiliacion ?? '',
        porcentaje_comision: editingClient.porcentaje_comision !== null && editingClient.porcentaje_comision !== undefined
          ? String(editingClient.porcentaje_comision)
          : '',
        nueva_afiliacion: editingClient.nueva_afiliacion ?? false,
        grado_instruccion: editingClient.grado_instruccion ?? '',
        direccion: editingClient.direccion ?? '',
        distrito: editingClient.distrito ?? '',
        provincia: editingClient.provincia ?? '',
        departamento: editingClient.departamento ?? '',
        area: editingClient.area ?? '',
        descripcion_zona: editingClient.descripcion_zona ?? '',
        asignacion: editingClient.asignacion ?? '',
        estado_actual: editingClient.estado_actual ?? '',
        cargo: editingClient.cargo ?? '',
        fecha_inicio_contrato: editingClient.fecha_inicio_contrato ?? '',
        fecha_termino_contrato: editingClient.fecha_termino_contrato ?? '',
        tipo_contrato: editingClient.tipo_contrato ?? '',
        remuneracion: editingClient.remuneracion !== null && editingClient.remuneracion !== undefined
          ? String(editingClient.remuneracion)
          : '',
        planilla: editingClient.planilla ?? '',
        observaciones: editingClient.observaciones ?? '',
        referido: editingClient.referido ?? '',
        lugar: editingClient.lugar ?? '',
        cooperador: editingClient.cooperador ?? '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        dni: '',
        repetir_codigo: '',
        nombre: '',
        a_paterno: '',
        a_materno: '',
        fecha_nac: '',
        edad: '',
        fecha_reclutamiento: today,
        sexo: '',
        estado_civil: '',
        codigogrupotrabajo: '',
        id_afp: '',
        cuspp: '',
        fecha_inicio_afiliacion: '',
        porcentaje_comision: '',
        nueva_afiliacion: false,
        grado_instruccion: '',
        direccion: '',
        distrito: '',
        provincia: '',
        departamento: '',
        area: '',
        descripcion_zona: '',
        asignacion: '',
        estado_actual: '',
        cargo: '',
        fecha_inicio_contrato: '',
        fecha_termino_contrato: '',
        tipo_contrato: '',
        remuneracion: '',
        planilla: '',
        observaciones: '',
        referido: '',
        lugar: '',
        cooperador: '',
      });
      setTimeout(() => dniInputRef.current?.focus(), 0);
    }
    setErrors({});
  }, [editingClient, isOpen]);

  const setField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  useEffect(() => {
    const dni = formData.dni.trim();
    if (dni.length !== 8 || /\D/.test(dni)) {
      setReniecError(null);
      setReniecLoading(false);
      reniecAbort.current?.abort();
      return;
    }
    if (!reniecToken) return;
    const controller = new AbortController();
    reniecAbort.current?.abort();
    reniecAbort.current = controller;

    const timer = setTimeout(async () => {
      try {
        setReniecLoading(true);
        setReniecError(null);
        const doFetch = async (base: string) => fetch(`${base}/dni?numero=${dni}`, {
          headers: {
            Authorization: `Bearer ${reniecToken}`,
            token: reniecToken,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        let res: Response | null = null;
        try {
          res = await doFetch(reniecApiBase);
        } catch (e) {
          if (!reniecApiBase.startsWith('/')) throw e;
        }

        if ((!res || !res.ok) && reniecApiBase.startsWith('/')) {
          res = await doFetch('https://api.decolecta.com/v1/reniec');
        }

        if (!res || !res.ok) throw new Error(`RENIEC respondió ${res?.status}`);
        const payload = await res.json();
        const data = payload?.data || payload;
        const nombres = (data?.first_name || data?.nombres || data?.nombre || '').trim();
        const apPat = (data?.first_last_name || data?.a_paterno || data?.apepat || '').trim();
        const apMat = (data?.second_last_name || data?.a_materno || data?.apemat || '').trim();
        if (!nombres && !apPat && !apMat) throw new Error('Respuesta sin nombres');

        setFormData(prev => ({
          ...prev,
          nombre: nombres || prev.nombre,
          a_paterno: apPat || prev.a_paterno,
          a_materno: apMat || prev.a_materno,
          dni: data?.document_number ? String(data.document_number).trim() : prev.dni,
        }));
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : 'Error consultando RENIEC';
        setReniecError(msg);
      } finally {
        if (!controller.signal.aborted) setReniecLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.dni]);

  // Calcular edad automáticamente cuando cambia la fecha de nacimiento
  useEffect(() => {
    const fechaNacimiento = formData.fecha_nac.trim();
    if (!fechaNacimiento) {
      return;
    }

    try {
      const birthDate = new Date(fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age >= 0) {
        setFormData(prev => ({ ...prev, edad: String(age) }));
      }
    } catch (err) {
      // Fecha inválida, no hacer nada
    }
  }, [formData.fecha_nac]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos';
    } else {
      const existingCliente = getClienteByDni(formData.dni);
      if (existingCliente && existingCliente.id !== editingClient?.id) {
        newErrors.dni = 'Este DNI ya está registrado';
      }
    }

    if (formData.porcentaje_comision.trim()) {
      const value = Number(formData.porcentaje_comision);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        newErrors.porcentaje_comision = 'La comisión debe estar entre 0 y 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normalizeString = (value: string) => {
    const trimmed = value.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const nombre = formData.nombre.trim();
    const aPaterno = formData.a_paterno.trim();
    const aMaterno = formData.a_materno.trim();

    try {
      if (editingClient) {
        // Para actualizar, no incluimos apellidos_y_nombres (se genera automáticamente)
        const updatePayload: Partial<Cliente> = {
          dni: formData.dni.trim(),
          repetir_codigo: normalizeString(formData.repetir_codigo),
          nombre: nombre || null,
          a_paterno: aPaterno || null,
          a_materno: aMaterno || null,
          fecha_nac: normalizeString(formData.fecha_nac),
          edad: formData.edad.trim() ? parseInt(formData.edad.trim(), 10) : null,
          fecha_reclutamiento: normalizeString(formData.fecha_reclutamiento),
          sexo: formData.sexo ? (formData.sexo as 'M' | 'F') : null,
          estado_civil: formData.estado_civil
            ? (formData.estado_civil as 'SOLTERO' | 'CASADO' | 'VIUDO' | 'CONVIVIENTE' | 'DIVORCIADO')
            : null,
          codigogrupotrabajo: normalizeString(formData.codigogrupotrabajo),
          id_afp: normalizeString(formData.id_afp),
          cuspp: normalizeString(formData.cuspp),
          fecha_inicio_afiliacion: normalizeString(formData.fecha_inicio_afiliacion),
          porcentaje_comision: formData.porcentaje_comision.trim()
            ? Number(formData.porcentaje_comision)
            : null,
          nueva_afiliacion: formData.nueva_afiliacion,
          grado_instruccion: normalizeString(formData.grado_instruccion),
          direccion: normalizeString(formData.direccion),
          distrito: normalizeString(formData.distrito),
          provincia: normalizeString(formData.provincia),
          departamento: normalizeString(formData.departamento),
          area: normalizeString(formData.area),
          descripcion_zona: normalizeString(formData.descripcion_zona),
          asignacion: normalizeString(formData.asignacion),
          estado_actual: normalizeString(formData.estado_actual),
          cargo: normalizeString(formData.cargo),
          fecha_inicio_contrato: normalizeString(formData.fecha_inicio_contrato),
          fecha_termino_contrato: normalizeString(formData.fecha_termino_contrato),
          tipo_contrato: normalizeString(formData.tipo_contrato),
          remuneracion: formData.remuneracion.trim()
            ? Number(formData.remuneracion)
            : null,
          planilla: normalizeString(formData.planilla),
          observaciones: normalizeString(formData.observaciones),
          referido: normalizeString(formData.referido),
          lugar: normalizeString(formData.lugar),
          cooperador: normalizeString(formData.cooperador),
        };
        
        await updateCliente(editingClient.id, updatePayload);
        toast.success('Cliente actualizado correctamente');
      } else {
        // Para crear, incluimos apellidos_y_nombres
        const apellidosYNombres = [aPaterno, aMaterno, nombre].filter(Boolean).join(' ').trim();
        const createPayload: Partial<Cliente> = {
          dni: formData.dni.trim(),
          repetir_codigo: normalizeString(formData.repetir_codigo),
          nombre: nombre || null,
          a_paterno: aPaterno || null,
          a_materno: aMaterno || null,
          apellidos_y_nombres: apellidosYNombres || null,
          fecha_nac: normalizeString(formData.fecha_nac),
          edad: formData.edad.trim() ? parseInt(formData.edad.trim(), 10) : null,
          fecha_reclutamiento: normalizeString(formData.fecha_reclutamiento),
          sexo: formData.sexo ? (formData.sexo as 'M' | 'F') : null,
          estado_civil: formData.estado_civil
            ? (formData.estado_civil as 'SOLTERO' | 'CASADO' | 'VIUDO' | 'CONVIVIENTE' | 'DIVORCIADO')
            : null,
          codigogrupotrabajo: normalizeString(formData.codigogrupotrabajo),
          id_afp: normalizeString(formData.id_afp),
          cuspp: normalizeString(formData.cuspp),
          fecha_inicio_afiliacion: normalizeString(formData.fecha_inicio_afiliacion),
          porcentaje_comision: formData.porcentaje_comision.trim()
            ? Number(formData.porcentaje_comision)
            : null,
          nueva_afiliacion: formData.nueva_afiliacion,
          grado_instruccion: normalizeString(formData.grado_instruccion),
          direccion: normalizeString(formData.direccion),
          distrito: normalizeString(formData.distrito),
          provincia: normalizeString(formData.provincia),
          departamento: normalizeString(formData.departamento),
          area: normalizeString(formData.area),
          descripcion_zona: normalizeString(formData.descripcion_zona),
          asignacion: normalizeString(formData.asignacion),
          estado_actual: normalizeString(formData.estado_actual),
          cargo: normalizeString(formData.cargo),
          fecha_inicio_contrato: normalizeString(formData.fecha_inicio_contrato),
          fecha_termino_contrato: normalizeString(formData.fecha_termino_contrato),
          tipo_contrato: normalizeString(formData.tipo_contrato),
          remuneracion: formData.remuneracion.trim()
            ? Number(formData.remuneracion)
            : null,
          planilla: normalizeString(formData.planilla),
          observaciones: normalizeString(formData.observaciones),
          referido: normalizeString(formData.referido),
          lugar: normalizeString(formData.lugar),
          cooperador: normalizeString(formData.cooperador),
        };
        
        await addCliente(createPayload);
        toast.success('Cliente creado correctamente');
      }

      onClose();
    } catch (error) {
      toast.error('Error al guardar el cliente');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Evita que el Enter del escáner envíe el formulario y dispare validaciones prematuras
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="modal-overlay motion-safe:animate-fade-in">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden motion-safe:animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identificacion */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Identificación</p>
              </div>

              {/* DNI primero para escáner/teclado */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  DNI * (escáner o teclado)
                </label>
                <input
                  ref={dniInputRef}
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setField('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className={`input-field ${errors.dni ? 'border-destructive' : ''}`}
                  placeholder="Ej: 12345678"
                  inputMode="numeric"
                  maxLength={8}
                  autoComplete="off"
                  autoFocus
                />
                {(reniecLoading || reniecError) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {reniecLoading ? 'Consultando RENIEC…' : `RENIEC: ${reniecError} (puedes llenar manual)`}
                  </p>
                )}
                {errors.dni && (
                  <p className="mt-1 text-sm text-destructive">{errors.dni}</p>
                )}
              </div>

              {/* Nombres y apellidos */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos personales</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setField('nombre', e.target.value)}
                  className={`input-field ${errors.nombre ? 'border-destructive' : ''}`}
                  placeholder="Ej: María"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-destructive">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apellido paterno
                </label>
                <input
                  type="text"
                  value={formData.a_paterno}
                  onChange={(e) => setField('a_paterno', e.target.value)}
                  className={`input-field ${errors.a_paterno ? 'border-destructive' : ''}`}
                  placeholder="Ej: García"
                />
                {errors.a_paterno && (
                  <p className="mt-1 text-sm text-destructive">{errors.a_paterno}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apellido materno
                </label>
                <input
                  type="text"
                  value={formData.a_materno}
                  onChange={(e) => setField('a_materno', e.target.value)}
                  className="input-field"
                  placeholder="Ej: López"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_nac}
                  onChange={(e) => setField('fecha_nac', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setField('edad', e.target.value)}
                  className="input-field"
                  placeholder="Se calcula automáticamente"
                  min="0"
                  max="150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de reclutamiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_reclutamiento}
                  onChange={(e) => setField('fecha_reclutamiento', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sexo
                </label>
                <select
                  value={formData.sexo}
                  onChange={(e) => setField('sexo', e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado civil
                </label>
                <select
                  value={formData.estado_civil}
                  onChange={(e) => setField('estado_civil', e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  <option value="SOLTERO">Soltero</option>
                  <option value="CASADO">Casado</option>
                  <option value="VIUDO">Viudo</option>
                  <option value="CONVIVIENTE">Conviviente</option>
                  <option value="DIVORCIADO">Divorciado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Repetir codigo
                </label>
                <input
                  type="text"
                  value={formData.repetir_codigo}
                  onChange={(e) => setField('repetir_codigo', e.target.value)}
                  className="input-field"
                  placeholder="Ej: 44000"
                  maxLength={20}
                />
              </div>

              {/* AFP */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AFP / Afiliación</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  AFP
                </label>
                <input
                  type="text"
                  value={formData.id_afp}
                  onChange={(e) => setField('id_afp', e.target.value)}
                  className="input-field"
                  placeholder="Ej: PRIMA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CUSPP
                </label>
                <input
                  type="text"
                  value={formData.cuspp}
                  onChange={(e) => setField('cuspp', e.target.value)}
                  className="input-field"
                  placeholder="Ej: 123456789012"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha inicio afiliación
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio_afiliacion}
                  onChange={(e) => setField('fecha_inicio_afiliacion', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Porcentaje comisión
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.porcentaje_comision}
                  onChange={(e) => setField('porcentaje_comision', e.target.value)}
                  className={`input-field ${errors.porcentaje_comision ? 'border-destructive' : ''}`}
                  placeholder="Ej: 12.5"
                />
                {errors.porcentaje_comision && (
                  <p className="mt-1 text-sm text-destructive">{errors.porcentaje_comision}</p>
                )}
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  id="nueva_afiliacion"
                  type="checkbox"
                  checked={formData.nueva_afiliacion}
                  onChange={(e) => setField('nueva_afiliacion', e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="nueva_afiliacion" className="text-sm font-medium text-foreground">
                  Nueva afiliación
                </label>
              </div>

              {/* Estudios */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estudios</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Grado de instrucción
                </label>
                <input
                  type="text"
                  value={formData.grado_instruccion}
                  onChange={(e) => setField('grado_instruccion', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Secundaria completa"
                />
              </div>

              {/* Direccion */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dirección</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dirección
                </label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setField('direccion', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Ej: Av. Principal 123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Distrito
                </label>
                <input
                  type="text"
                  value={formData.distrito}
                  onChange={(e) => setField('distrito', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Miraflores"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Provincia
                </label>
                <input
                  type="text"
                  value={formData.provincia}
                  onChange={(e) => setField('provincia', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Lima"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) => setField('departamento', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Lima"
                />
              </div>

              {/* Laboral */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información Laboral</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Código Grupo Trabajo
                </label>
                <input
                  type="text"
                  value={formData.codigogrupotrabajo}
                  onChange={(e) => setField('codigogrupotrabajo', e.target.value)}
                  className="input-field"
                  placeholder="Ej: 001"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Área
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setField('area', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Ventas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción de Zona
                </label>
                <input
                  type="text"
                  value={formData.descripcion_zona}
                  onChange={(e) => setField('descripcion_zona', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Zona Norte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Asignación
                </label>
                <input
                  type="text"
                  value={formData.asignacion}
                  onChange={(e) => setField('asignacion', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Planta Norte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado Actual
                </label>
                <input
                  type="text"
                  value={formData.estado_actual}
                  onChange={(e) => setField('estado_actual', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Activo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setField('cargo', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Gerente de Proyectos"
                />
              </div>

              {/* Información de Contrato */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información de Contrato</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha Inicio Contrato
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio_contrato}
                  onChange={(e) => setField('fecha_inicio_contrato', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha Término Contrato
                </label>
                <input
                  type="date"
                  value={formData.fecha_termino_contrato}
                  onChange={(e) => setField('fecha_termino_contrato', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Contrato
                </label>
                <input
                  type="text"
                  value={formData.tipo_contrato}
                  onChange={(e) => setField('tipo_contrato', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Plazo fijo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Remuneración
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.remuneracion}
                  onChange={(e) => setField('remuneracion', e.target.value)}
                  className="input-field"
                  placeholder="Ej: 1500.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Planilla
                </label>
                <input
                  type="text"
                  value={formData.planilla}
                  onChange={(e) => setField('planilla', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Planilla Principal"
                />
              </div>

              {/* Información Adicional */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información Adicional</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Referido
                </label>
                <input
                  type="text"
                  value={formData.referido}
                  onChange={(e) => setField('referido', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lugar
                </label>
                <input
                  type="text"
                  value={formData.lugar}
                  onChange={(e) => setField('lugar', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Oficina Central"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cooperador
                </label>
                <input
                  type="text"
                  value={formData.cooperador}
                  onChange={(e) => setField('cooperador', e.target.value)}
                  className="input-field"
                  placeholder="Ej: María López"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setField('observaciones', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Observaciones generales..."
                />
              </div>

              {/* Barcode Preview */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Código de Barras (generado automáticamente desde DNI)
                </label>
                <ClientBarcode dni={formData.dni} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



