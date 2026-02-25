import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Cliente } from '@/types';
import { emptyFichaDatosValues } from '@/components/contracts/forms/FichaDatosForm';
import { useClientes } from '@/contexts/ClientContext';
import { useContratos } from '@/contexts/ContractContext';
import { ClientBarcode } from '@/components/ClientBarcode';
import { toast } from 'sonner';
import { lookupReniecByDni } from '@/lib/reniec';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingClient?: Cliente | null;
}

export function ClientModal({ isOpen, onClose, editingClient }: ClientModalProps) {
    const [dniTouched, setDniTouched] = useState(false);
  const { addCliente, updateCliente, getClienteByDni, getClienteByCod, getNextCod } = useClientes();
  const { addContrato } = useContratos();
  const PLANILLA_OPTIONS = [
    'OBREROS AGRARIO',
    'EMP.REG.GRAL. VIRU',
    'EMPLEADOS AGRARIO',
    'OBRERO R. GENERAL',
  ] as const;
  const TIPO_CONTRATO_OPTIONS = [
    'Contrato Intermitente',
    'Contrato por Temporada',
  ] as const;
  const [formData, setFormData] = useState({
    dni: '',
    cod: '',
    repetir_codigo: '',
    nombre: '',
    apellidos_y_nombres: '',
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
  const [reingresoQuery, setReingresoQuery] = useState('');
  const [reingresoCliente, setReingresoCliente] = useState<Cliente | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reniecLoading, setReniecLoading] = useState(false);
  const [reniecError, setReniecError] = useState<string | null>(null);
  const reniecAbort = useRef<AbortController | null>(null);
  const dniInputRef = useRef<HTMLInputElement>(null);
  // Fecha local en formato YYYY-MM-DD (evita desfase por UTC)
  const todayIso = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // ms
    const local = new Date(now.getTime() - tzOffset);
    return local.toISOString().split('T')[0];
  };
  const isReingreso = formData.estado_actual === 'Reingresante';
  const isEstadoSelected = formData.estado_actual === 'Nuevo' || formData.estado_actual === 'Reingresante';
  const isFormLocked = !isEstadoSelected;

  const splitApellido = (apellido?: string | null) => {
    const trimmed = (apellido ?? '').trim();
    if (!trimmed) return { paterno: '', materno: '' };
    const parts = trimmed.split(/\s+/);
    return { paterno: parts[0] ?? '', materno: parts.slice(1).join(' ') };
  };

  const getFullName = (cliente: Cliente) => {
    const apellidos = [cliente.a_paterno, cliente.a_materno].filter(Boolean).join(' ').trim();
    const nombre = (cliente.nombre ?? '').trim();
    const apellidosYNombre = (cliente.apellidos_y_nombres ?? '').trim();
    const combined = [apellidos, nombre].filter(Boolean).join(' ').trim();
    return apellidosYNombre || combined || nombre || apellidos || cliente.dni || 'Cliente';
  };

  const fetchAndSetNextCod = async () => {
    try {
      const nextCod = await getNextCod();
      setFormData(prev => (prev.cod.trim() ? prev : { ...prev, cod: nextCod }));
    } catch {
      // silencioso: solo previsualización de código
    }
  };

  const normalizeEstadoActual = (estado?: string | null) => {
    const trimmed = (estado ?? '').trim();
    if (!trimmed) return '';
    if (trimmed === 'ReIngresante' || trimmed === 'Re Ingresante') return 'Reingresante';
    return trimmed;
  };

  const normalizePlanilla = (planilla?: string | null) => {
    const trimmed = (planilla ?? '').trim();
    if (!trimmed) return '';
    if (trimmed.toUpperCase() === 'OBREROS AGRARIO') return 'OBREROS AGRARIO';
    if (trimmed.toUpperCase() === 'EMP.REG.GRAL. VIRU') return 'EMP.REG.GRAL. VIRU';
    if (trimmed.toUpperCase() === 'EMPLEADOS AGRARIO') return 'EMPLEADOS AGRARIO';
    if (trimmed.toUpperCase() === 'OBRERO R. GENERAL') return 'OBRERO R. GENERAL';
    return trimmed;
  };

  const normalizeTipoContrato = (tipoContrato?: string | null) => {
    const trimmed = (tipoContrato ?? '').trim();
    if (!trimmed) return '';
    const upper = trimmed.toUpperCase();
    if (upper === 'CONTRATO INTERMITENTE' || upper === 'INTERMITENTE') {
      return 'Contrato Intermitente';
    }
    if (
      upper === 'CONTRATO POR TEMPORADA' ||
      upper === 'CONTRATO POR TEMPORADA PLAN' ||
      upper === 'TEMPORADA' ||
      upper === 'TEMPORADA PLAN'
    ) {
      return 'Contrato por Temporada';
    }
    return trimmed;
  };

  useEffect(() => {
    if (editingClient) {
      setDniTouched(false);
      const fallbackApellidos = splitApellido(editingClient.a_paterno);
      setFormData({
        dni: editingClient.dni ?? '',
        cod: editingClient.cod ?? '',
        repetir_codigo: editingClient.repetir_codigo ?? '',
        nombre: editingClient.nombre ?? '',
        apellidos_y_nombres: editingClient.apellidos_y_nombres ?? '',
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
        estado_actual: normalizeEstadoActual(editingClient.estado_actual) || '',
        cargo: editingClient.cargo ?? '',
        fecha_inicio_contrato: editingClient.fecha_inicio_contrato ?? '',
        fecha_termino_contrato: editingClient.fecha_termino_contrato ?? '',
        tipo_contrato: normalizeTipoContrato(editingClient.tipo_contrato),
        remuneracion: editingClient.remuneracion !== null && editingClient.remuneracion !== undefined
          ? String(editingClient.remuneracion)
          : '',
        planilla: normalizePlanilla(editingClient.planilla),
        observaciones: editingClient.observaciones ?? '',
        referido: editingClient.referido ?? '',
        lugar: editingClient.lugar ?? '',
        cooperador: editingClient.cooperador ?? '',
      });
      setReingresoCliente(null);
      setReingresoQuery('');
      // No consultar RENIEC automáticamente al editar
    } else {
      const today = todayIso();
      setFormData({
        dni: '',
        cod: '',
        repetir_codigo: '',
        nombre: '',
        apellidos_y_nombres: '',
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
      setReingresoCliente(null);
      setReingresoQuery('');
      if (isOpen && formData.estado_actual !== 'Reingresante') {
        void fetchAndSetNextCod();
      }
      setTimeout(() => dniInputRef.current?.focus(), 0);
    }
    setErrors({});
  }, [editingClient, isOpen]);

  const setField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const lastAutoApellidosRef = useRef('');
  useEffect(() => {
    const newAuto = [formData.a_paterno, formData.a_materno, formData.nombre]
      .filter(Boolean)
      .join(' ')
      .trim();

    const current = formData.apellidos_y_nombres ?? '';

    if (current === '' || current === lastAutoApellidosRef.current) {
      if (newAuto !== lastAutoApellidosRef.current) {
        setField('apellidos_y_nombres', newAuto);
        lastAutoApellidosRef.current = newAuto;
      }
    }
  }, [formData.a_paterno, formData.a_materno, formData.nombre]);

  useEffect(() => {
    if (!dniTouched) return;
    const dni = formData.dni.trim();
    if (dni.length !== 8 || /\D/.test(dni)) {
      setReniecError(null);
      setReniecLoading(false);
      reniecAbort.current?.abort();
      return;
    }
    const controller = new AbortController();
    reniecAbort.current?.abort();
    reniecAbort.current = controller;

    const timer = setTimeout(async () => {
      try {
        setReniecLoading(true);
        setReniecError(null);
        const data = await lookupReniecByDni(dni, controller.signal);
        const nombres = data.nombre.trim();
        const apPat = data.apellidoPaterno.trim();
        const apMat = data.apellidoMaterno.trim();

        setFormData(prev => ({
          ...prev,
          nombre: nombres || prev.nombre,
          a_paterno: apPat || prev.a_paterno,
          a_materno: apMat || prev.a_materno,
          dni: data.documentNumber || prev.dni,
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
  }, [formData.dni, dniTouched]);

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
    const isReingreso = formData.estado_actual === 'Reingresante';
    const isCreateFlow = !editingClient;
    const requireText = (field: keyof typeof formData, label: string) => {
      if (!String(formData[field] ?? '').trim()) {
        newErrors[field] = `${label} es obligatorio`;
      }
    };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos';
    } else if (!isReingreso) {
      const existingCliente = getClienteByDni(formData.dni);
      if (existingCliente && existingCliente.id !== editingClient?.id) {
        newErrors.dni = 'Este DNI ya está registrado';
      }
    }

    const cod = formData.cod.trim().toUpperCase();
    if (cod && !isReingreso) {
      const existingClienteByCod = getClienteByCod(cod);
      if (existingClienteByCod && existingClienteByCod.id !== editingClient?.id) {
        newErrors.cod = 'Este codigo ya esta registrado';
      }
    }

    if (formData.estado_actual === '') {
      newErrors.estado_actual = 'Selecciona Estado Actual';
    }

    if (isReingreso && !reingresoCliente) {
      newErrors.reingreso = 'Busca y selecciona un cliente existente (DNI o COD)';
    }

    if (isCreateFlow) {
      // Datos personales
      requireText('a_paterno', 'Apellido paterno');
      requireText('a_materno', 'Apellido materno');
      requireText('fecha_nac', 'Fecha de nacimiento');
      requireText('edad', 'Edad');
      requireText('fecha_reclutamiento', 'Fecha de reclutamiento');
      requireText('sexo', 'Sexo');
      requireText('estado_civil', 'Estado civil');

      // Dirección
      requireText('direccion', 'Dirección');
      requireText('distrito', 'Distrito');
      requireText('provincia', 'Provincia');
      requireText('departamento', 'Departamento');

      // Información Laboral
      requireText('codigogrupotrabajo', 'Código Grupo Trabajo');
      requireText('area', 'Área');
      requireText('descripcion_zona', 'Descripción de Zona');
      // asignacion no es obligatorio
      requireText('cargo', 'Cargo');

      // Información de Contrato
      requireText('fecha_inicio_contrato', 'Fecha Inicio Contrato');
      requireText('fecha_termino_contrato', 'Fecha Término Contrato');
      requireText('tipo_contrato', 'Tipo de Contrato');
      requireText('remuneracion', 'Remuneración');
      requireText('planilla', 'Planilla');
    }

    if (formData.porcentaje_comision.trim()) {
      const value = Number(formData.porcentaje_comision);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        newErrors.porcentaje_comision = 'La comisión debe estar entre 0 y 100';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }
    return Object.keys(newErrors).length === 0;
  };

  const normalizeString = (value: string) => {
    const trimmed = value.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  };

  const hydrateFormFromCliente = (cliente: Cliente, forceTodayReclutamiento = false) => {
    const fallbackApellidos = splitApellido(cliente.a_paterno);
    const isReingresoFlow = forceTodayReclutamiento || formData.estado_actual === 'Reingresante';

    const base = {
      dni: cliente.dni ?? formData.dni,
      cod: cliente.cod ?? formData.cod,
      repetir_codigo: cliente.repetir_codigo ?? cliente.cod ?? formData.repetir_codigo,
      nombre: cliente.nombre ?? formData.nombre,
      a_paterno: cliente.a_paterno ?? fallbackApellidos.paterno,
      a_materno: cliente.a_materno ?? fallbackApellidos.materno,
      fecha_nac: cliente.fecha_nac ?? formData.fecha_nac,
      edad: cliente.edad ? String(cliente.edad) : formData.edad,
      sexo: cliente.sexo ?? formData.sexo,
      estado_civil: cliente.estado_civil ?? formData.estado_civil,
      estado_actual: formData.estado_actual || normalizeEstadoActual(cliente.estado_actual) || '',
      fecha_reclutamiento: forceTodayReclutamiento ? todayIso() : (cliente.fecha_reclutamiento ?? formData.fecha_reclutamiento),
      codigogrupotrabajo: cliente.codigogrupotrabajo ?? formData.codigogrupotrabajo,
      id_afp: cliente.id_afp ?? formData.id_afp,
      cuspp: cliente.cuspp ?? formData.cuspp,
      fecha_inicio_afiliacion: cliente.fecha_inicio_afiliacion ?? formData.fecha_inicio_afiliacion,
      porcentaje_comision: cliente.porcentaje_comision !== null && cliente.porcentaje_comision !== undefined
        ? String(cliente.porcentaje_comision)
        : formData.porcentaje_comision,
      nueva_afiliacion: cliente.nueva_afiliacion ?? formData.nueva_afiliacion,
      grado_instruccion: cliente.grado_instruccion ?? formData.grado_instruccion,
      direccion: cliente.direccion ?? formData.direccion,
      distrito: cliente.distrito ?? formData.distrito,
      provincia: cliente.provincia ?? formData.provincia,
      departamento: cliente.departamento ?? formData.departamento,
      area: cliente.area ?? formData.area,
      descripcion_zona: cliente.descripcion_zona ?? formData.descripcion_zona,
      asignacion: cliente.asignacion ?? formData.asignacion,
      cargo: cliente.cargo ?? formData.cargo,
      fecha_inicio_contrato: cliente.fecha_inicio_contrato ?? formData.fecha_inicio_contrato,
      fecha_termino_contrato: cliente.fecha_termino_contrato ?? formData.fecha_termino_contrato,
      tipo_contrato: normalizeTipoContrato(cliente.tipo_contrato) ?? formData.tipo_contrato,
      remuneracion: cliente.remuneracion !== null && cliente.remuneracion !== undefined
        ? String(cliente.remuneracion)
        : formData.remuneracion,
      planilla: normalizePlanilla(cliente.planilla) ?? formData.planilla,
      observaciones: cliente.observaciones ?? formData.observaciones,
      referido: cliente.referido ?? formData.referido,
      lugar: cliente.lugar ?? formData.lugar,
      cooperador: cliente.cooperador ?? formData.cooperador,
    };

    // En reingreso queremos que ciertos campos se llenen nuevamente para el nuevo contrato
    const clearedOnReingreso: Array<keyof typeof formData> = [
      // Datos que deben renovarse para el nuevo contrato
      'id_afp',
      'cuspp',
      'fecha_inicio_afiliacion',
      'porcentaje_comision',
      'nueva_afiliacion',
      // Información laboral debe ingresarse nuevamente en reingreso
      'area',
      'descripcion_zona',
      'asignacion',
      'codigogrupotrabajo',
      'cargo',
      'fecha_inicio_contrato',
      'fecha_termino_contrato',
      'tipo_contrato',
      'remuneracion',
      'planilla',
      'observaciones',
      'referido',
      'lugar',
      'cooperador',
    ];

    const finalData = isReingresoFlow
      ? clearedOnReingreso.reduce((acc, field) => {
          (acc as any)[field] = field === 'nueva_afiliacion' ? false : '';
          return acc;
        }, { ...base, fecha_reclutamiento: todayIso() })
      : base;

    setFormData(prev => ({ ...prev, ...finalData }));
  };

  const buildFichaDatosSnapshot = (source: typeof formData) => {
    const base = { ...emptyFichaDatosValues };
    const copyString = (key: keyof typeof base, val?: string | null) => {
      (base as any)[key] = val?.toString().trim() || '';
    };

    copyString('remuneracion', source.remuneracion);
    copyString('unidadArea', source.area);
    copyString('puesto', source.cargo);
    copyString('periodoDesde', source.fecha_inicio_contrato);
    copyString('periodoHasta', source.fecha_termino_contrato);
    copyString('fechaNacimiento', source.fecha_nac);
    copyString('estadoCivil', source.estado_civil);
    copyString('domicilioActual', source.direccion);
    copyString('distritoDomicilio', source.distrito);
    copyString('provinciaDomicilio', source.provincia);
    // copyString('departamentoDomicilio', source.departamento); // Remove or fix if not in emptyFichaDatosValues
    // Campos de educación, contactos y cuentas se dejan vacíos por defecto
    return base;
  };

  const handleBuscarReingreso = () => {
    const query = (reingresoQuery || formData.dni || formData.cod).trim();
    if (!query) {
      toast.error('Ingresa DNI o COD para buscar reingreso');
      return;
    }

    let found = getClienteByDni(query);
    if (!found) {
      found = getClienteByCod(query.toUpperCase());
    }

    if (!found) {
      toast.error('No se encontró un cliente con ese DNI o COD');
      setReingresoCliente(null);
      return;
    }

    setReingresoCliente(found);
    hydrateFormFromCliente(found, formData.estado_actual === 'Reingresante');
    // Mantén visible exactamente lo que el usuario escribió (DNI o COD), no lo sustituyas por el DNI encontrado
    setReingresoQuery(query);
    setErrors(prev => ({ ...prev, reingreso: undefined }));
    toast.success(`Cliente encontrado: ${getFullName(found)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const nombre = formData.nombre.trim();
    const aPaterno = formData.a_paterno.trim();
    const aMaterno = formData.a_materno.trim();
    const codigo = normalizeString(formData.cod)?.toUpperCase() ?? null;

    try {
      if (isReingreso) {
        if (!reingresoCliente) {
          toast.error('Busca y selecciona un cliente existente para reingreso');
          return;
        }

        const updatePayload: Partial<Cliente> = {
          repetir_codigo: normalizeString(formData.repetir_codigo) ?? reingresoCliente.repetir_codigo ?? reingresoCliente.cod,
          nombre: nombre || reingresoCliente.nombre || null,
          a_paterno: aPaterno || reingresoCliente.a_paterno || null,
          a_materno: aMaterno || reingresoCliente.a_materno || null,
          fecha_nac: normalizeString(formData.fecha_nac) ?? reingresoCliente.fecha_nac ?? null,
          edad: formData.edad.trim()
            ? parseInt(formData.edad.trim(), 10)
            : reingresoCliente.edad ?? null,
          fecha_reclutamiento: normalizeString(formData.fecha_reclutamiento) ?? todayIso(),
          sexo: formData.sexo ? (formData.sexo as 'M' | 'F') : reingresoCliente.sexo ?? null,
          estado_civil: formData.estado_civil
            ? (formData.estado_civil as 'SOLTERO' | 'CASADO' | 'VIUDO' | 'CONVIVIENTE' | 'DIVORCIADO')
            : reingresoCliente.estado_civil ?? null,
          // Campos laborales/afiliación se rellenan de nuevo para el reingreso; si se dejan vacíos se guardan como null
          codigogrupotrabajo: normalizeString(formData.codigogrupotrabajo),
          id_afp: normalizeString(formData.id_afp),
          cuspp: normalizeString(formData.cuspp),
          fecha_inicio_afiliacion: normalizeString(formData.fecha_inicio_afiliacion),
          porcentaje_comision: formData.porcentaje_comision.trim() ? Number(formData.porcentaje_comision) : null,
          nueva_afiliacion: formData.nueva_afiliacion ?? null,
          grado_instruccion: normalizeString(formData.grado_instruccion),
          direccion: normalizeString(formData.direccion),
          distrito: normalizeString(formData.distrito),
          provincia: normalizeString(formData.provincia),
          departamento: normalizeString(formData.departamento),
          area: normalizeString(formData.area),
        descripcion_zona: normalizeString(formData.descripcion_zona),
        asignacion: normalizeString(formData.asignacion),
          estado_actual: isReingreso ? 'Reingresante' : 'Nuevo',
          cargo: normalizeString(formData.cargo),
          fecha_inicio_contrato: normalizeString(formData.fecha_inicio_contrato),
          fecha_termino_contrato: normalizeString(formData.fecha_termino_contrato),
          tipo_contrato: normalizeString(normalizeTipoContrato(formData.tipo_contrato)),
          remuneracion: formData.remuneracion.trim() ? Number(formData.remuneracion) : null,
          planilla: normalizeString(formData.planilla),
          observaciones: normalizeString(formData.observaciones),
          referido: normalizeString(formData.referido),
          lugar: normalizeString(formData.lugar),
          cooperador: normalizeString(formData.cooperador),
        };

        await updateCliente(reingresoCliente.id, updatePayload);

        const fullName = getFullName(reingresoCliente);
        await addContrato({
          cliente_id: reingresoCliente.id,
          contenido: `Contrato de trabajo para ${fullName} - Borrador`,
          estado: 'borrador',
          firmado: false,
          firmado_at: undefined,
          ficha_datos: buildFichaDatosSnapshot(formData),
        });
        toast.success('Reingreso registrado y contrato borrador creado');
      } else if (editingClient) {
        // Para actualizar, no incluimos apellidos_y_nombres (se genera automáticamente)
        const updatePayload: Partial<Cliente> = {
          dni: formData.dni.trim(),
          cod: codigo,
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
          estado_actual: isReingreso ? 'Reingresante' : 'Nuevo',
          cargo: normalizeString(formData.cargo),
          fecha_inicio_contrato: normalizeString(formData.fecha_inicio_contrato),
          fecha_termino_contrato: normalizeString(formData.fecha_termino_contrato),
          tipo_contrato: normalizeString(normalizeTipoContrato(formData.tipo_contrato)),
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
        const createPayload: any = {
          dni: formData.dni.trim(),
          cod: codigo,
          repetir_codigo: normalizeString(formData.repetir_codigo),
          nombre: nombre || '',
          a_paterno: aPaterno || '',
          a_materno: aMaterno || '',
          apellidos_y_nombres: apellidosYNombres || '',
          fecha_nac: normalizeString(formData.fecha_nac) || '',
          edad: formData.edad.trim() ? parseInt(formData.edad.trim(), 10) : 0,
          fecha_reclutamiento: normalizeString(formData.fecha_reclutamiento) || todayIso(),
          estado_civil: formData.estado_civil
            ? (formData.estado_civil as 'SOLTERO' | 'CASADO' | 'VIUDO' | 'CONVIVIENTE' | 'DIVORCIADO')
            : '',
          codigogrupotrabajo: normalizeString(formData.codigogrupotrabajo) || '',
          id_afp: normalizeString(formData.id_afp) || '',
          cuspp: normalizeString(formData.cuspp) || '',
          fecha_inicio_afiliacion: normalizeString(formData.fecha_inicio_afiliacion) || '',
          porcentaje_comision: formData.porcentaje_comision.trim()
            ? Number(formData.porcentaje_comision)
            : 0,
          nueva_afiliacion: formData.nueva_afiliacion,
          grado_instruccion: normalizeString(formData.grado_instruccion) || '',
          direccion: normalizeString(formData.direccion) || '',
          distrito: normalizeString(formData.distrito) || '',
          provincia: normalizeString(formData.provincia) || '',
          departamento: normalizeString(formData.departamento) || '',
          area: normalizeString(formData.area) || '',
          descripcion_zona: normalizeString(formData.descripcion_zona) || '',
          asignacion: normalizeString(formData.asignacion) || '',
          cargo: normalizeString(formData.cargo) || '',
          fecha_inicio_contrato: normalizeString(formData.fecha_inicio_contrato) || '',
          fecha_termino_contrato: normalizeString(formData.fecha_termino_contrato) || '',
          tipo_contrato: normalizeString(normalizeTipoContrato(formData.tipo_contrato)) || '',
          remuneracion: formData.remuneracion.trim()
            ? Number(formData.remuneracion)
            : 0,
          planilla: normalizeString(formData.planilla) || '',
          observaciones: normalizeString(formData.observaciones) || '',
          referido: normalizeString(formData.referido) || '',
          lugar: normalizeString(formData.lugar) || '',
          cooperador: normalizeString(formData.cooperador) || '',
          estado_actual: normalizeString(formData.estado_actual) || (isReingreso ? 'Reingresante' : 'Nuevo'),
        };
        if (formData.sexo === 'M' || formData.sexo === 'F') {
          createPayload.sexo = formData.sexo;
        }
        const createdClient = await addCliente(createPayload);
        const fullName =
          createdClient.apellidos_y_nombres?.trim() ||
          [createdClient.a_paterno, createdClient.a_materno, createdClient.nombre]
            .filter(Boolean)
            .join(' ')
            .trim() ||
          formData.dni.trim();

        try {
          await addContrato({
            cliente_id: createdClient.id,
            contenido: `Contrato de trabajo para ${fullName} - Borrador`,
            estado: 'borrador',
            firmado: false,
            firmado_at: undefined,
            ficha_datos: buildFichaDatosSnapshot(formData),
          });
          toast.success('Cliente y contrato borrador creados correctamente');
        } catch (contractError) {
          console.error('Error creando borrador automatico de contrato:', contractError);
          toast.error('Cliente creado, pero no se pudo crear el contrato borrador');
        }
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

              <div className="md:col-span-2 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="text-sm font-semibold text-foreground">Estado Actual *</label>
                  <select
                    value={formData.estado_actual}
                    onChange={(e) => {
                      const val = e.target.value;
                      setField('estado_actual', val);
                      if (val === 'Nuevo') {
                        setReingresoCliente(null);
                        setReingresoQuery('');
                        void fetchAndSetNextCod();
                      } else if (val === 'Reingresante') {
                        setFormData(prev => ({ ...prev, cod: '', repetir_codigo: '', fecha_reclutamiento: todayIso() }));
                      }
                    }}
                    className="input-field md:max-w-xs"
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Reingresante">Reingresante</option>
                  </select>
                </div>
                {isReingreso && (
                  <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={reingresoQuery}
                      onChange={(e) => setReingresoQuery(e.target.value)}
                      className="input-field md:max-w-xs"
                      placeholder="Buscar por DNI o COD"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleBuscarReingreso}>
                      Autocompletar
                    </Button>
                    {errors.reingreso && (
                      <p className="text-sm text-destructive">{errors.reingreso}</p>
                    )}
                  </div>
                )}
              </div>

              {isReingreso && reingresoCliente && (
                <div className="md:col-span-2 text-sm text-success bg-success/10 border border-success/40 rounded-lg px-3 py-2">
                  Cargado {getFullName(reingresoCliente)} (DNI {reingresoCliente.dni})
                </div>
              )}

              {/* DNI primero para escáner/teclado */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  DNI * (escáner o teclado)
                </label>
                <input
                  ref={dniInputRef}
                  type="text"
                  value={formData.dni}
                  onChange={(e) => {
                    setField('dni', e.target.value.replace(/\D/g, '').slice(0, 8));
                    setDniTouched(true);
                  }}
                  className={`input-field ${errors.dni ? 'border-destructive' : ''}`}
                  placeholder="Ej: 12345678"
                  inputMode="numeric"
                  maxLength={8}
                  autoComplete="off"
                  autoFocus
                  disabled={isFormLocked || isReingreso}
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
              {/* Datos personales (orden solicitado) */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos personales</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de reclutamiento *
                </label>
                <input
                  type="date"
                  value={formData.fecha_reclutamiento}
                  onChange={(e) => setField('fecha_reclutamiento', e.target.value)}
                  className="input-field"
                  disabled={isFormLocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Codigo
                </label>
                <input
                  type="text"
                  value={formData.cod}
                  onChange={(e) => setField('cod', e.target.value.toUpperCase().replace(/\s+/g, '').slice(0, 30))}
                  className={`input-field ${errors.cod ? 'border-destructive' : ''}`}
                  placeholder="Se autogenera si lo dejas vacio"
                  maxLength={30}
                  disabled={isFormLocked || isReingreso}
                />
                {errors.cod && (
                  <p className="mt-1 text-sm text-destructive">{errors.cod}</p>
                )}
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
                  disabled={isFormLocked || isReingreso}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apellido paterno *
                </label>
                <input
                  type="text"
                  value={formData.a_paterno}
                  onChange={(e) => setField('a_paterno', e.target.value)}
                  className={`input-field ${errors.a_paterno ? 'border-destructive' : ''}`}
                  placeholder="Ej: García"
                  disabled={isFormLocked}
                />
                {errors.a_paterno && (
                  <p className="mt-1 text-sm text-destructive">{errors.a_paterno}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apellido materno *
                </label>
                <input
                  type="text"
                  value={formData.a_materno}
                  onChange={(e) => setField('a_materno', e.target.value)}
                  className="input-field"
                  placeholder="Ej: López"
                  disabled={isFormLocked}
                />
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
                  disabled={isFormLocked}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-destructive">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apellidos y nombres
                </label>
                <input
                  type="text"
                  value={formData.apellidos_y_nombres}
                  onChange={(e) => setField('apellidos_y_nombres', e.target.value)}
                  className="input-field"
                  placeholder="Ej: García López María"
                  disabled={isFormLocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de nacimiento *
                </label>
                <input
                  type="date"
                  value={formData.fecha_nac}
                  onChange={(e) => setField('fecha_nac', e.target.value)}
                  className="input-field"
                  disabled={isFormLocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Edad *
                </label>
                <input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setField('edad', e.target.value)}
                  className="input-field"
                  placeholder="Se calcula automáticamente"
                  min="0"
                  max="150"
                  disabled={isFormLocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Área *
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
                  Descripción de Zona *
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
                  ID-AFP
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
                  Sexo *
                </label>
                <select
                  value={formData.sexo}
                  onChange={(e) => setField('sexo', e.target.value)}
                  className="input-field"
                  disabled={isFormLocked}
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado civil *
                </label>
                <select
                  value={formData.estado_civil}
                  onChange={(e) => setField('estado_civil', e.target.value)}
                  className="input-field"
                  disabled={isFormLocked}
                >
                  <option value="">Seleccionar</option>
                  <option value="SOLTERO">Soltero</option>
                  <option value="CASADO">Casado</option>
                  <option value="VIUDO">Viudo</option>
                  <option value="CONVIVIENTE">Conviviente</option>
                  <option value="DIVORCIADO">Divorciado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dirección *
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
                  Distrito *
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
                  Provincia *
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
                  Departamento *
                </label>
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) => setField('departamento', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Lima"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setField('cargo', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Gerente de Proyectos"
                />
              </div>

              {/* Información Laboral (mantener Código Grupo Trabajo) */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información Laboral</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Código Grupo Trabajo *
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

              {/* Información de Contrato */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información de Contrato</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha Inicio Contrato *
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
                  Fecha Término Contrato *
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
                  Tipo de Contrato *
                </label>
                <select
                  value={formData.tipo_contrato}
                  onChange={(e) => setField('tipo_contrato', e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccione una opción</option>
                  {TIPO_CONTRATO_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  {formData.tipo_contrato && !TIPO_CONTRATO_OPTIONS.some(option => option === formData.tipo_contrato) && (
                    <option value={formData.tipo_contrato}>Actual: {formData.tipo_contrato}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Remuneración *
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
                  Planilla *
                </label>
                <select
                  value={formData.planilla}
                  onChange={(e) => setField('planilla', e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccione una opción</option>
                  {PLANILLA_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  {formData.planilla && !PLANILLA_OPTIONS.some(option => option === formData.planilla) && (
                    <option value={formData.planilla}>Actual: {formData.planilla}</option>
                  )}
                </select>
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






