import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, Download, Lock, Edit3, Eye, Trash2, FileArchive } from 'lucide-react';
import html2canvas, { type Options as Html2CanvasOptions } from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClientSelector } from '@/components/ClientSelector';
import { SignaturePad } from '@/components/SignaturePad';
import { PersonalDataSheetHeader, PersonalDataSheetTemplate } from '@/components/ContractTemplate';
import { emptyFichaDatosValues, FichaDatosForm, FichaDatosValues, getFichaDatosMissing } from '@/components/contracts/forms/FichaDatosForm';
import { emptyDeclaracionParentescoValues, DeclaracionParentescoEditor, DeclaracionParentescoValues, getDeclaracionParentescoMissing, DeclaracionParentescoForm } from '@/components/contracts/forms/DeclaracionParentesco';
import { ContratoIntermitenteForm } from '@/components/contracts/forms/ContratoIntermitenteForm';
import { ContratoTemporadaPlanForm } from '@/components/contracts/forms/ContratoTemporadaPlanForm';
import { SistemaPensionarioForm } from '@/components/contracts/forms/SistemaPensionarioForm';
import { ReglamentosForm } from '@/components/contracts/forms/ReglamentosForm';
import { ConsentimientoInformadoForm } from '@/components/contracts/forms/ConsentimientoInformadoForm';
import { InduccionForm } from '@/components/contracts/forms/InduccionForm';
import { CuentaBancariaForm } from '@/components/contracts/forms/CuentaBancariaForm';
import { DeclaracionConflictoInteresesForm } from '@/components/contracts/forms/DeclaracionConflictoInteresesForm';
import { AcuerdoConfidencialidadForm } from '@/components/contracts/forms/AcuerdoConfidencialidadForm';
import { CartaNoSobornoForm } from '@/components/contracts/forms/CartaNoSobornoForm';
import { DjPatrimonialForm } from '@/components/contracts/forms/DjPatrimonialForm';
import { ContractQR } from '@/components/ContractQR';
import { ScannerInput } from '@/components/ScannerInput';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useClientes } from '@/contexts/ClientContext';
import { useContratos, type ContractFormId } from '@/contexts/ContractContext';
import { useConsultaDNI } from '@/hooks/useConsultaDNI';
import { Cliente, Contrato } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

type FirmaRow = { firma_url?: string; origen?: 'capturada' | 'reutilizada' };
type ClienteFirmaActivaRow = { firma_url?: string };
type ErrorWithCode = { code?: string };

type ViewMode = 'list' | 'create' | 'view';

interface ValidationErrors {
  client?: string;
  signature?: string;
}

export default function ContratosPage() {
  const { getClienteById, getClienteByDni, getClienteByCod, clientes, addCliente, getNextCod } = useClientes();
  const {
    contratos, addContrato, updateContrato, deleteContrato, reloadContratos, firmarContrato,
    zipProgress, setZipProgress, zipRenderState, setZipRenderState, zipDocRef
  } = useContratos();
  const { consultarDNI, loading: dniLoading } = useConsultaDNI();
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
  const createRegistroInitialState = (dni = '') => ({
    dni,
    cod: '',
    repetir_codigo: '',
    nombre: '',
    a_paterno: '',
    a_materno: '',
    fecha_nac: '',
    edad: '',
    fecha_reclutamiento: new Date().toISOString().split('T')[0],
    sexo: '',
    estado_civil: '',
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
    codigogrupotrabajo: '',
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
    referido: '',
    lugar: '',
    cooperador: '',
    observaciones: '',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [signatureData, setSignatureData] = useState('');
  const [signatureSource, setSignatureSource] = useState<'capturada' | 'reutilizada' | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [viewingContract, setViewingContract] = useState<Contrato | null>(null);
  const [pensionChoice, setPensionChoice] = useState<'ONP' | 'AFP' | ''>('');
  const [selectionMethod, setSelectionMethod] = useState<'scanner' | 'manual' | null>(null);
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [registroFormData, setRegistroFormData] = useState(() => createRegistroInitialState());
  const [activeContractForm, setActiveContractForm] = useState('ficha-datos');
  const [lockedExclusiveContract, setLockedExclusiveContract] = useState<string | null>(null);
  const [fichaDatosValues, setFichaDatosValues] = useState<FichaDatosValues>(emptyFichaDatosValues);
  const [fichaDatosMissing, setFichaDatosMissing] = useState<(keyof FichaDatosValues)[]>([]);
  const [declaracionParentescoValues, setDeclaracionParentescoValues] = useState<DeclaracionParentescoValues>(emptyDeclaracionParentescoValues);
  const [declaracionParentescoMissing, setDeclaracionParentescoMissing] = useState<(keyof DeclaracionParentescoValues)[]>([]);
  const [registroLoading, setRegistroLoading] = useState(false);
  const registroDniRef = useRef<HTMLInputElement>(null);
  const [signatureMode, setSignatureMode] = useState<'direct' | 'qr'>('direct');
  const fullContractRef = useRef<HTMLDivElement>(null);
  const downloadContractRef = useRef<HTMLDivElement>(null);
  const signatureChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseSyncEnabled = useRef(true);
  const [previewPage, setPreviewPage] = useState(1);
  const [downloadingRowId, setDownloadingRowId] = useState<string | null>(null);
  const [downloadContext, setDownloadContext] = useState<{
    contract: Contrato;
    client: Cliente | null;
    signature?: string;
  } | null>(null);
  const [savingContract, setSavingContract] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [contractSearch, setContractSearch] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [bulkDocumentIds, setBulkDocumentIds] = useState<ContractFormId[]>([]);
  const [bulkScope, setBulkScope] = useState<'manual' | 'day' | 'all'>('manual');
  const [bulkDate, setBulkDate] = useState('');
  const [selectedBulkClients, setSelectedBulkClients] = useState<Record<string, boolean>>({});
  const [bulkUserSearch, setBulkUserSearch] = useState('');
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    destructive?: boolean;
    onConfirm?: () => Promise<void> | void;
  }>({
    open: false,
    title: '',
  });

  const latestContract = useMemo(() => {
    if (!selectedClient) return null;
    return contratos
      .filter(c => c.cliente_id === selectedClient.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
  }, [contratos, selectedClient]);

  const getSearchName = (cliente?: Cliente | null) => {
    if (!cliente) return '';
    const apellidos = [cliente.a_paterno, cliente.a_materno].filter(Boolean).join(' ').trim();
    const nombre = (cliente.nombre ?? '').trim();
    return [apellidos, nombre].filter(Boolean).join(' ').trim();
  };

  const getFullName = (cliente?: Cliente | null) => {
    if (!cliente) return 'Cliente no encontrado';
    const apellidosYNombre = (cliente.apellidos_y_nombres ?? '').trim();
    const combined = getSearchName(cliente);
    return apellidosYNombre || combined || 'Cliente no encontrado';
  };

  const contratosPorCliente = useMemo(() => {
    const map = new Map<string, { cliente: Cliente | null; contratos: Contrato[] }>();
    contratos.forEach(contrato => {
      const existing = map.get(contrato.cliente_id);
      if (existing) {
        existing.contratos.push(contrato);
      } else {
        map.set(contrato.cliente_id, {
          cliente: getClienteById(contrato.cliente_id) || null,
          contratos: [contrato],
        });
      }
    });

    const grupos = Array.from(map.values());
    grupos.sort((a, b) => {
      const nameA = getFullName(a.cliente);
      const nameB = getFullName(b.cliente);
      return nameA.localeCompare(nameB, 'es');
    });

    grupos.forEach(grupo => {
      grupo.contratos.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return grupos;
  }, [contratos, getClienteById]);

  const filteredContratosPorCliente = useMemo(() => {
    const term = contractSearch.trim().toLowerCase();
    if (!term) return contratosPorCliente;
    return contratosPorCliente.filter(grupo => {
      const cliente = grupo.cliente;
      if (!cliente) return false;
      const fullName = getFullName(cliente).toLowerCase();
      const reverseName = getSearchName(cliente).toLowerCase();
      const cod = (cliente.cod || '').toLowerCase();
      return fullName.includes(term) || reverseName.includes(term) || cod.includes(term);
    });
  }, [contratosPorCliente, contractSearch]);

  const latestSignedContractByClient = useMemo(() => {
    const map = new Map<string, Contrato>();
    contratos.forEach(contrato => {
      if (contrato.estado !== 'firmado') return;
      const existing = map.get(contrato.cliente_id);
      if (!existing || new Date(contrato.created_at).getTime() > new Date(existing.created_at).getTime()) {
        map.set(contrato.cliente_id, contrato);
      }
    });
    return map;
  }, [contratos]);

  const signedFilteredContratos = useMemo(() => {
    const contratosFiltrados = filteredContratosPorCliente
      .flatMap(grupo => grupo.contratos)
      .filter(contrato => contrato.estado === 'firmado');

    const map = new Map<string, Contrato>();
    contratosFiltrados.forEach(contrato => {
      const existing = map.get(contrato.cliente_id);
      if (!existing || new Date(contrato.created_at).getTime() > new Date(existing.created_at).getTime()) {
        map.set(contrato.cliente_id, contrato);
      }
    });

    return Array.from(map.values());
  }, [filteredContratosPorCliente]);

  const bulkSelectableClients = useMemo(() => {
    return signedFilteredContratos.map(contrato => {
      const cliente = getClienteById(contrato.cliente_id);
      return {
        clienteId: contrato.cliente_id,
        label: cliente ? getFullName(cliente) : `Cliente ${contrato.cliente_id}`,
        cod: cliente?.cod || '',
        dni: cliente?.dni || '',
      };
    });
  }, [signedFilteredContratos, getClienteById]);

  const filteredBulkSelectableClients = useMemo(() => {
    const term = bulkUserSearch.trim().toLowerCase();
    if (!term) return bulkSelectableClients;
    return bulkSelectableClients.filter(item => {
      return (
        item.label.toLowerCase().includes(term) ||
        item.cod.toLowerCase().includes(term) ||
        item.dni.toLowerCase().includes(term)
      );
    });
  }, [bulkSelectableClients, bulkUserSearch]);

  const toggleGroup = (clienteId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [clienteId]: !prev[clienteId],
    }));
  };

  const toggleBulkClient = (clienteId: string, checked: boolean) => {
    setSelectedBulkClients(prev => ({
      ...prev,
      [clienteId]: checked,
    }));
  };

  const selectAllVisibleBulkClients = () => {
    setSelectedBulkClients(prev => {
      const next = { ...prev };
      signedFilteredContratos.forEach(contrato => {
        next[contrato.cliente_id] = true;
      });
      return next;
    });
  };

  const clearVisibleBulkClients = () => {
    setSelectedBulkClients(prev => {
      const next = { ...prev };
      signedFilteredContratos.forEach(contrato => {
        delete next[contrato.cliente_id];
      });
      return next;
    });
  };

  const PREVIEW_PAGE_HEIGHT = 1123; // A4 height at ~96dpi

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      signatureChannelRef.current = new BroadcastChannel('signature-updates');
    }

    const handleMessage = (event: MessageEvent) => {
      if (signatureMode !== 'qr') return;
      if (event.data.type === 'SIGNATURE_COMPLETE') {
        const { contractId, signature } = event.data;
        // Acepta coincidencia por contrato o por cliente (compatibilidad)
        const matches =
          (!!latestContract && latestContract.id === contractId) ||
          (selectedClient && contractId === selectedClient.id);
        if (!selectedClient || !matches) return;
        if (signature) {
          setSignatureData(signature);
          setSignatureSource('capturada');
          setValidationErrors(prev => ({ ...prev, signature: undefined }));
          setSignatureMode('qr');
          toast.success('Firma recibida del celular');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    signatureChannelRef.current?.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      signatureChannelRef.current?.removeEventListener('message', handleMessage);
      signatureChannelRef.current?.close();
    };
  }, [selectedClient, signatureMode, latestContract]);

  const clientSectionComplete = !!selectedClient;

  const fichaDatosComplete = getFichaDatosMissing(fichaDatosValues).length === 0;

  const signatureSectionComplete = !!signatureData;

  const hasText = (value?: string | number | null) => {
    if (value === null || value === undefined) return false;
    return String(value).trim().length > 0;
  };

  const intermitenteBaseComplete =
    hasText(fichaDatosValues.puesto) &&
    hasText(fichaDatosValues.periodoDesde) &&
    hasText(fichaDatosValues.periodoHasta) &&
    hasText(fichaDatosValues.remuneracion) &&
    hasText(fichaDatosValues.celular);

  const isContractComplete = clientSectionComplete && signatureSectionComplete;

  const hasSelectedClient = !!selectedClient;

  const isFormComplete = (formId: string) => {
    if (!hasSelectedClient) return null;

    switch (formId) {
      case 'ficha-datos':
        // Solo requiere firma, los datos se completan con info del cliente
        return signatureSectionComplete;
      case 'contrato-intermitente':
      case 'contrato-temporada-plan':
        // Solo requiere firma
        return signatureSectionComplete;
      case 'sistema-pensionario':
        // Solo requiere firma
        return signatureSectionComplete;
      case 'cuenta-bancaria':
        // Solo requiere firma
        return signatureSectionComplete;
      case 'consentimiento-informado':
        return signatureSectionComplete;
      case 'declaracion-parentesco':
        // Solo requiere firma
        return signatureSectionComplete;
      case 'acuerdo-confidencialidad':
      case 'carta-no-soborno':
      case 'declaracion-conflicto-intereses':
        return signatureSectionComplete;
      default:
        return signatureSectionComplete;
    }
  };


  const isContractLocked = viewingContract?.firmado === true;
  const qrContractId = latestContract?.id || selectedClient?.id || null;
  const pensionPending = activeContractForm === 'sistema-pensionario' && !pensionChoice;

  const mutuallyExclusiveContracts = useMemo(
    () => new Set(['contrato-intermitente', 'contrato-temporada-plan']),
    []
  );

  useEffect(() => {
    if (!isContractLocked) return;
    if (mutuallyExclusiveContracts.has(activeContractForm)) {
      setLockedExclusiveContract(activeContractForm);
    }
  }, [isContractLocked, activeContractForm, mutuallyExclusiveContracts]);

  const buildFichaDatosTemplateData = () => {
    const normalize = (value: unknown) => {
      if (value === null || value === undefined) return undefined;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed ? trimmed : undefined;
      }
      const asString = String(value);
      const trimmed = asString.trim();
      return trimmed ? trimmed : undefined;
    };
    const familiares = (fichaDatosValues.familiares || [])
      .filter(row => row.apellidosNombres.trim() || row.parentesco.trim() || row.edad.trim())
      .map(row => ({
        apellidosNombres: row.apellidosNombres.trim(),
        parentesco: row.parentesco.trim(),
        edad: row.edad.trim(),
      }));

    return {
      remuneracion: fichaDatosValues.remuneracion ? String(fichaDatosValues.remuneracion) : undefined,
      unidadArea: normalize(fichaDatosValues.unidadArea),
      puesto: normalize(fichaDatosValues.puesto),
      periodoDesde: normalize(fichaDatosValues.periodoDesde),
      periodoHasta: normalize(fichaDatosValues.periodoHasta),
      fechaNacimiento: normalize(fichaDatosValues.fechaNacimiento),
      distritoNacimiento: normalize(fichaDatosValues.distritoNacimiento),
      provinciaNacimiento: normalize(fichaDatosValues.provinciaNacimiento),
      departamentoNacimiento: normalize(fichaDatosValues.departamentoNacimiento),
      estadoCivil: normalize(fichaDatosValues.estadoCivil) as Cliente['estado_civil'] | undefined,
      domicilioActual: normalize(fichaDatosValues.domicilioActual),
      cpDistrito: normalize(fichaDatosValues.distritoDomicilio),
      provinciaDomicilio: normalize(fichaDatosValues.provinciaDomicilio),
      telefonoFijo: normalize(fichaDatosValues.telefonoFijo),
      celular: normalize(fichaDatosValues.celular),
      emergenciaContacto: normalize(fichaDatosValues.emergenciaContacto),
      emergenciaCelular: normalize(fichaDatosValues.emergenciaCelular),
      entidadBancaria: normalize(fichaDatosValues.entidadBancaria),
      numeroCuenta: normalize(fichaDatosValues.numeroCuenta),
      familiares: familiares.length ? familiares : undefined,
      experienciaLaboral: (fichaDatosValues.experienciaLaboral || [])
        .filter(row => row.cargo.trim() || row.empresa.trim())
        .map(row => ({ cargo: row.cargo.trim(), empresa: row.empresa.trim() })),
      sinExperiencia: fichaDatosValues.sinExperiencia,
      educacion: {
        primaria: fichaDatosValues.educacion.primaria.marcado
          ? {
              marcado: true,
              aniosEstudio: normalize(fichaDatosValues.educacion.primaria.aniosEstudio),
              anioEgreso: normalize(fichaDatosValues.educacion.primaria.anioEgreso),
              ciudad: normalize(fichaDatosValues.educacion.primaria.ciudad),
            }
          : undefined,
        secundaria: fichaDatosValues.educacion.secundaria.marcado
          ? {
              marcado: true,
              aniosEstudio: normalize(fichaDatosValues.educacion.secundaria.aniosEstudio),
              anioEgreso: normalize(fichaDatosValues.educacion.secundaria.anioEgreso),
              ciudad: normalize(fichaDatosValues.educacion.secundaria.ciudad),
            }
          : undefined,
        tecnico: fichaDatosValues.educacion.tecnico.marcado
          ? {
              marcado: true,
              aniosEstudio: normalize(fichaDatosValues.educacion.tecnico.aniosEstudio),
              anioEgreso: normalize(fichaDatosValues.educacion.tecnico.anioEgreso),
              ciudad: normalize(fichaDatosValues.educacion.tecnico.ciudad),
              carreraTecnica: normalize(fichaDatosValues.educacion.tecnico.carrera),
            }
          : undefined,
        universitario: fichaDatosValues.educacion.universitario.marcado
          ? {
              marcado: true,
              aniosEstudio: normalize(fichaDatosValues.educacion.universitario.aniosEstudio),
              anioEgreso: normalize(fichaDatosValues.educacion.universitario.anioEgreso),
              ciudad: normalize(fichaDatosValues.educacion.universitario.ciudad),
              carreraProfesional: normalize(fichaDatosValues.educacion.universitario.carrera),
            }
          : undefined,
      },
    };
  };

  const contractForms = [
    {
      id: 'ficha-datos',
      label: 'Ficha de Datos',
      component: (
                      <FichaDatosForm
                        client={selectedClient}
                        value={fichaDatosValues}
                        onChange={setFichaDatosValues}
                        onMissingChange={setFichaDatosMissing}
                        currentPage={previewPage as 1 | 2}
                      />
      ),
    },
    { id: 'contrato-intermitente', label: 'Contrato Intermitente', component: (
      <ContratoIntermitenteForm
        client={selectedClient}
        puesto={fichaDatosValues.puesto}
        fechaInicio={fichaDatosValues.periodoDesde}
        fechaFin={fichaDatosValues.periodoHasta}
        remuneracion={fichaDatosValues.remuneracion}
        celular={fichaDatosValues.celular}
        signatureSrc={signatureData}
      />
    ) },
    { id: 'contrato-temporada-plan', label: 'Contrato por Temporada Plan', component: (
      <ContratoTemporadaPlanForm
        client={selectedClient}
        puesto={fichaDatosValues.puesto}
        fechaInicio={fichaDatosValues.periodoDesde}
        fechaFin={fichaDatosValues.periodoHasta}
        remuneracion={fichaDatosValues.remuneracion}
        signatureSrc={signatureData}
        celular={fichaDatosValues.celular}
        pagePart={previewPage as 1 | 2 | 3}
      />
    ) },
    { id: 'sistema-pensionario', label: 'Sistema Pensionario', component: (
      <SistemaPensionarioForm
        client={selectedClient}
        ficha={fichaDatosValues}
        sistemaPensionarioValues={(viewingContract?.sistema_pensionario as Record<string, unknown> | null | undefined) ?? null}
        signatureSrc={signatureData}
        pensionChoice={pensionChoice}
        onChangeChoice={setPensionChoice}
      />
    ) },
    { id: 'reglamentos', label: 'Reglamentos', component: (
      <ReglamentosForm
        client={selectedClient}
        reglamentosValues={(viewingContract?.reglamentos as Record<string, unknown> | null | undefined) ?? null}
        signatureSrc={signatureData}
        pagePart={previewPage as 1 | 2 | "all"}
      />
    ) },
    { id: 'consentimiento-informado', label: 'Consentimiento Informado', component: (
      <ConsentimientoInformadoForm
        client={selectedClient}
        consentimientoInformadoValues={(viewingContract?.consentimiento_informado as Record<string, unknown> | null | undefined) ?? null}
        pagePart={previewPage as 1 | 2 | 3 | 4 | "all"}
        signatureSrc={signatureData || undefined}
      />
    ) },
    { id: 'induccion', label: 'Inducción', component: (
      <InduccionForm
        client={selectedClient}
        cargo={fichaDatosValues.puesto}
        unidadArea={fichaDatosValues.unidadArea}
        codigo={selectedClient?.cod || undefined}
        induccionValues={(viewingContract?.induccion as Record<string, unknown> | null | undefined) ?? null}
        signatureSrc={signatureData || undefined}
      />
    ) },
    { id: 'cuenta-bancaria', label: 'Cuenta Bancaria', component: (
      <CuentaBancariaForm 
        client={selectedClient}
        cuentaBancariaValues={(viewingContract?.cuenta_bancaria as Record<string, unknown> | null | undefined) ?? null}
        signatureSrc={signatureData || undefined}
        entidadBancaria={fichaDatosValues.entidadBancaria}
        numeroCuenta={fichaDatosValues.numeroCuenta}
      />
    ) },
    { id: 'declaracion-conflicto', label: 'Declaración de Conflicto de Intereses', component: (
      <DeclaracionConflictoInteresesForm
        client={selectedClient}
        declaracionConflictoValues={(viewingContract?.declaracion_conflicto_intereses as Record<string, unknown> | null | undefined) ?? null}
        signatureSrc={signatureData || undefined}
      />
    ) },
    { id: 'acuerdo-confidencialidad', label: 'Acuerdo de Confidencialidad', component: (
      <AcuerdoConfidencialidadForm
        client={selectedClient}
        acuerdoConfidencialidadValues={(viewingContract?.acuerdo_confidencialidad as Record<string, unknown> | null | undefined) ?? null}
        signatureSrc={signatureData || undefined}
        cargo={fichaDatosValues.puesto}
      />
    ) },
    { id: 'carta-no-soborno', label: 'Carta de C. de No Soborno', component: (
      <CartaNoSobornoForm
        client={selectedClient}
        cartaNoSobornoValues={(viewingContract?.carta_no_soborno as Record<string, unknown> | null | undefined) ?? null}
        signatureSrc={signatureData || undefined}
        cargo={fichaDatosValues.puesto}
        unidadArea={fichaDatosValues.unidadArea}
      />
    ) },
    { id: 'declaracion-parentesco', label: 'Declaración de Parentesco', component: (
      <DeclaracionParentescoForm
        client={selectedClient}
        signatureSrc={signatureData || undefined}
        parentescoValues={declaracionParentescoValues}
        previewCurrentDate={!viewingContract}
      />
    ) },
    { id: 'dj-patrimonial', label: 'DJ Patrimonial', component: (
      <DjPatrimonialForm
        client={selectedClient}
        signatureSrc={signatureData || undefined}
        djPatrimonialValues={(viewingContract?.dj_patrimonial as Record<string, unknown> | null | undefined) ?? null}
      />
    ) },
  ];

  const bulkDocumentOptions = contractForms.filter(form => form.id !== 'ficha-datos');

  const activeContractTab = contractForms.find(form => form.id === activeContractForm) || contractForms[0];
  const previewPages =
    activeContractForm === 'contrato-intermitente'
      ? 4
      : activeContractForm === 'contrato-temporada-plan'
        ? 3
      : activeContractForm === 'ficha-datos'
        ? 2
      : activeContractForm === 'reglamentos'
        ? 2
      : activeContractForm === 'consentimiento-informado'
        ? 5
        : 1;

  useEffect(() => {
    setPreviewPage(prev => Math.min(prev, previewPages));
  }, [previewPages]);

  const yieldToMainThread = () =>
    new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

  const setZipDocLabel = (label: string) => {
    setZipRenderState(prev => ({
      ...prev,
      docLabel: label,
    }));
  };

  // Refresca la firma desde Supabase cuando llega desde el movil (cross-device)
  useEffect(() => {
    // No sobreescribir una firma recien capturada manualmente.
    if (signatureSource === 'capturada' && signatureData) return;
    const activeContractId = latestContract?.id;
    const activeClientId = selectedClient?.id;
    if (!selectedClient || (!activeContractId && !activeClientId)) return;

    let isMounted = true;
    const fetchContractSignature = async () => {
      try {
        let firma: FirmaRow | null = null;
        let firmaActivaCliente: ClienteFirmaActivaRow | null = null;

        if (activeClientId) {
          const { data, error } = await supabase
            .from('cliente_firmas')
            .select('firma_url')
            .eq('cliente_id', activeClientId)
            .eq('activa', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error('Error cargando firma activa del cliente:', error);
          } else {
            firmaActivaCliente = data as ClienteFirmaActivaRow | null;
          }
        }

        if (activeContractId) {
          const { data, error } = await supabase
            .from('firmas')
            .select('firma_url, origen')
            .eq('contrato_id', activeContractId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error('Error cargando firma del contrato:', error);
          } else {
            firma = data as FirmaRow | null;
          }
        }

        if (!firma?.firma_url && firmaActivaCliente?.firma_url) {
          firma = {
            firma_url: firmaActivaCliente.firma_url,
            origen: 'reutilizada',
          };
        }

        if (!firma?.firma_url && activeClientId) {
          const contratoIds = contratos
            .filter(contrato => contrato.cliente_id === activeClientId)
            .map(contrato => contrato.id);

          if (contratoIds.length > 0) {
            const { data, error } = await supabase
              .from('firmas')
              .select('firma_url, origen, contrato_id, created_at')
              .in('contrato_id', contratoIds)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (error) {
              console.error('Error cargando firma por cliente:', error);
            } else {
              firma = data as FirmaRow | null;
            }
          }
        }

        if (!isMounted) return;
        if (firma?.firma_url) {
          setSignatureData(firma.firma_url);
          setSignatureSource(firma.origen ?? 'reutilizada');
          setValidationErrors(prev => ({ ...prev, signature: undefined }));
        } else {
          setSignatureData('');
          setSignatureSource(null);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error de red al cargar firma del contrato:', err);
      }
    };

    fetchContractSignature();
    return () => {
      isMounted = false;
    };
  }, [viewingContract, selectedClient, latestContract, signatureMode, viewMode, contratos, signatureData, signatureSource]);

  const handleSaveContract = async () => {
    if (!selectedClient) {
      setValidationErrors({ client: 'Debe seleccionar un cliente para el contrato' });
      toast.error('Debe seleccionar un trabajador');
      return;
    }

    if (!signatureData) {
      setValidationErrors({ signature: 'El contrato requiere la firma del trabajador para ser valido' });
      toast.error('Debe agregar la firma del trabajador');
      return;
    }

    const exclusiveSelection =
      lockedExclusiveContract ??
      (mutuallyExclusiveContracts.has(activeContractForm) ? activeContractForm : null);
    if (!exclusiveSelection) {
      toast.error('Seleccione Contrato Intermitente o Contrato por Temporada Plan');
      return;
    }

    const targetContract = viewingContract;
    const firmadoAt = new Date().toISOString();

    const fichaDatosPayload = {
      ficha_datos: {
        ...fichaDatosValues,
        clientSnapshot: {
          dni: selectedClient.dni,
          nombre: selectedClient.nombre,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          fecha_nac: selectedClient.fecha_nac,
          sexo: selectedClient.sexo,
          estado_civil: selectedClient.estado_civil,
          direccion: selectedClient.direccion,
          distrito: selectedClient.distrito,
          provincia: selectedClient.provincia,
          departamento: selectedClient.departamento,
          id_afp: selectedClient.id_afp,
          cuspp: selectedClient.cuspp,
        }
      }
    };

    const contratoIntermitentePayload =
      exclusiveSelection === 'contrato-intermitente'
        ? {
            contrato_intermitente: {
              puesto: fichaDatosValues.puesto,
              fechaInicio: fichaDatosValues.periodoDesde,
              fechaFin: fichaDatosValues.periodoHasta,
              remuneracion: fichaDatosValues.remuneracion,
              celular: fichaDatosValues.celular,
              clientSnapshot: {
                dni: selectedClient.dni,
                apellidos_y_nombres: selectedClient.apellidos_y_nombres,
                a_paterno: selectedClient.a_paterno,
                a_materno: selectedClient.a_materno,
                nombre: selectedClient.nombre,
              }
            }
          }
        : { contrato_intermitente: {} };

    const contratoTemporadaPlanPayload =
      exclusiveSelection === 'contrato-temporada-plan'
        ? {
            contrato_temporada_plan: {
              puesto: fichaDatosValues.puesto,
              fechaInicio: fichaDatosValues.periodoDesde,
              fechaFin: fichaDatosValues.periodoHasta,
              remuneracion: fichaDatosValues.remuneracion,
              celular: fichaDatosValues.celular,
              clientSnapshot: {
                dni: selectedClient.dni,
                apellidos_y_nombres: selectedClient.apellidos_y_nombres,
                a_paterno: selectedClient.a_paterno,
                a_materno: selectedClient.a_materno,
                nombre: selectedClient.nombre,
              }
            }
          }
        : { contrato_temporada_plan: {} };

    const existingSistemaPensionario = (targetContract?.sistema_pensionario as Record<string, unknown> | null | undefined) ?? null;
    const existingSistemaFechaRegistro =
      typeof existingSistemaPensionario?.fecha_registro === 'string' && existingSistemaPensionario.fecha_registro.trim()
        ? existingSistemaPensionario.fecha_registro
        : '';
    const existingSistemaCiudad =
      typeof existingSistemaPensionario?.ciudad === 'string' && existingSistemaPensionario.ciudad.trim()
        ? existingSistemaPensionario.ciudad
        : '';

    const sistemaPensionarioPayload = {
      sistema_pensionario: {
        pensionChoice,
        fecha_registro: existingSistemaFechaRegistro || new Date().toISOString(),
        ciudad: existingSistemaCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };

    const existingReglamentos = (targetContract?.reglamentos as Record<string, unknown> | null | undefined) ?? null;
    const existingReglamentosFechaRegistro =
      typeof existingReglamentos?.fecha_registro === 'string' && existingReglamentos.fecha_registro.trim()
        ? existingReglamentos.fecha_registro
        : '';
    const existingReglamentosCiudad =
      typeof existingReglamentos?.ciudad === 'string' && existingReglamentos.ciudad.trim()
        ? existingReglamentos.ciudad
        : '';

    const reglamentosPayload = {
      reglamentos: {
        fecha_registro: existingReglamentosFechaRegistro || new Date().toISOString(),
        ciudad: existingReglamentosCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };

    const consentimientoInformadoPayload = {
      consentimiento_informado: {
        fecha_registro:
          (typeof (targetContract?.consentimiento_informado as Record<string, unknown> | null | undefined)?.fecha_registro === 'string' &&
            ((targetContract?.consentimiento_informado as Record<string, unknown> | null | undefined)?.fecha_registro as string).trim())
            ? ((targetContract?.consentimiento_informado as Record<string, unknown>).fecha_registro as string)
            : new Date().toISOString(),
        ciudad:
          (typeof (targetContract?.consentimiento_informado as Record<string, unknown> | null | undefined)?.ciudad === 'string' &&
            ((targetContract?.consentimiento_informado as Record<string, unknown> | null | undefined)?.ciudad as string).trim())
            ? ((targetContract?.consentimiento_informado as Record<string, unknown>).ciudad as string)
            : 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };

    const existingInduccion = (targetContract?.induccion as Record<string, unknown> | null | undefined) ?? null;
    const existingInduccionFechaRegistro =
      typeof existingInduccion?.fecha_registro === 'string' && existingInduccion.fecha_registro.trim()
        ? existingInduccion.fecha_registro
        : '';
    const existingInduccionCiudad =
      typeof existingInduccion?.ciudad === 'string' && existingInduccion.ciudad.trim()
        ? existingInduccion.ciudad
        : '';

    const induccionPayload = {
      induccion: {
        fecha_registro: existingInduccionFechaRegistro || new Date().toISOString(),
        ciudad: existingInduccionCiudad || 'VirÃº',
        cargo: fichaDatosValues.puesto,
        unidadArea: fichaDatosValues.unidadArea,
        codigo: selectedClient.cod,
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
          cod: selectedClient.cod,
        }
      }
    };

    const existingCuentaBancaria = (targetContract?.cuenta_bancaria as Record<string, unknown> | null | undefined) ?? null;
    const existingCuentaBancariaFechaRegistro =
      typeof existingCuentaBancaria?.fecha_registro === 'string' && existingCuentaBancaria.fecha_registro.trim()
        ? existingCuentaBancaria.fecha_registro
        : '';
    const existingCuentaBancariaCiudad =
      typeof existingCuentaBancaria?.ciudad === 'string' && existingCuentaBancaria.ciudad.trim()
        ? existingCuentaBancaria.ciudad
        : '';

    const cuentaBancariaPayload = {
      cuenta_bancaria: {
        fecha_registro: existingCuentaBancariaFechaRegistro || new Date().toISOString(),
        ciudad: existingCuentaBancariaCiudad || 'Virú',
        entidadBancaria: fichaDatosValues.entidadBancaria,
        numeroCuenta: fichaDatosValues.numeroCuenta,
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };

    const existingDeclaracionConflicto = (targetContract?.declaracion_conflicto_intereses as Record<string, unknown> | null | undefined) ?? null;
    const existingDeclaracionConflictoFechaRegistro =
      typeof existingDeclaracionConflicto?.fecha_registro === 'string' && existingDeclaracionConflicto.fecha_registro.trim()
        ? existingDeclaracionConflicto.fecha_registro
        : '';
    const existingDeclaracionConflictoCiudad =
      typeof existingDeclaracionConflicto?.ciudad === 'string' && existingDeclaracionConflicto.ciudad.trim()
        ? existingDeclaracionConflicto.ciudad
        : '';

    const declaracionConflictoInteresesPayload = {
      declaracion_conflicto_intereses: {
        fecha_registro: existingDeclaracionConflictoFechaRegistro || new Date().toISOString(),
        ciudad: existingDeclaracionConflictoCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };

    const existingAcuerdoConfidencialidad = (targetContract?.acuerdo_confidencialidad as Record<string, unknown> | null | undefined) ?? null;
    const existingAcuerdoConfidencialidadFechaRegistro =
      typeof existingAcuerdoConfidencialidad?.fecha_registro === 'string' && existingAcuerdoConfidencialidad.fecha_registro.trim()
        ? existingAcuerdoConfidencialidad.fecha_registro
        : '';
    const existingAcuerdoConfidencialidadCiudad =
      typeof existingAcuerdoConfidencialidad?.ciudad === 'string' && existingAcuerdoConfidencialidad.ciudad.trim()
        ? existingAcuerdoConfidencialidad.ciudad
        : '';

    const acuerdoConfidencialidadPayload = {
      acuerdo_confidencialidad: {
        fecha_registro: existingAcuerdoConfidencialidadFechaRegistro || new Date().toISOString(),
        ciudad: existingAcuerdoConfidencialidadCiudad || 'Virú',
        cargo: fichaDatosValues.puesto,
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };

    const existingCartaNoSoborno = (targetContract?.carta_no_soborno as Record<string, unknown> | null | undefined) ?? null;
    const existingCartaNoSobornoFechaRegistro =
      typeof existingCartaNoSoborno?.fecha_registro === 'string' && existingCartaNoSoborno.fecha_registro.trim()
        ? existingCartaNoSoborno.fecha_registro
        : '';
    const existingCartaNoSobornoCiudad =
      typeof existingCartaNoSoborno?.ciudad === 'string' && existingCartaNoSoborno.ciudad.trim()
        ? existingCartaNoSoborno.ciudad
        : '';

    const cartaNoSobornoPayload = {
      carta_no_soborno: {
        fecha_registro: existingCartaNoSobornoFechaRegistro || new Date().toISOString(),
        ciudad: existingCartaNoSobornoCiudad || 'Virú',
        cargo: fichaDatosValues.puesto,
        unidadArea: fichaDatosValues.unidadArea,
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };

    const existingDeclaracionParentesco = (targetContract?.declaracion_parentesco as Record<string, unknown> | null | undefined) ?? null;
    const existingDeclaracionParentescoFechaRegistro =
      typeof existingDeclaracionParentesco?.fecha_registro === 'string' && existingDeclaracionParentesco.fecha_registro.trim()
        ? existingDeclaracionParentesco.fecha_registro
        : '';
    const existingDeclaracionParentescoCiudad =
      typeof existingDeclaracionParentesco?.ciudad === 'string' && existingDeclaracionParentesco.ciudad.trim()
        ? existingDeclaracionParentesco.ciudad
        : '';

    const declaracionParentescoPayload = { 
      declaracion_parentesco: {
        ...declaracionParentescoValues,
        fecha_registro: existingDeclaracionParentescoFechaRegistro || new Date().toISOString(),
        ciudad: existingDeclaracionParentescoCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };
    const existingDjPatrimonial = (targetContract?.dj_patrimonial as Record<string, unknown> | null | undefined) ?? null;
    const existingFechaRegistro =
      typeof existingDjPatrimonial?.fecha_registro === 'string' && existingDjPatrimonial.fecha_registro.trim()
        ? existingDjPatrimonial.fecha_registro
        : '';
    const existingCiudad =
      typeof existingDjPatrimonial?.ciudad === 'string' && existingDjPatrimonial.ciudad.trim()
        ? existingDjPatrimonial.ciudad
        : '';

    const djPatrimonialPayload = {
      dj_patrimonial: {
        fecha_registro: existingFechaRegistro || new Date().toISOString(),
        ciudad: existingCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
          estado_civil: selectedClient.estado_civil,
          remuneracion: selectedClient.remuneracion,
          direccion: selectedClient.direccion,
          distrito: selectedClient.distrito,
          provincia: selectedClient.provincia,
          departamento: selectedClient.departamento,
        }
      }
    };

    try {
      setSavingContract(true);
      let contractId;

      if (targetContract) {
        await updateContrato(targetContract.id, {
          contenido: `Contrato de trabajo para ${selectedClient.apellidos_y_nombres || `${selectedClient.nombre || ''} ${selectedClient.a_paterno || ''} ${selectedClient.a_materno || ''}`.trim()}`,
          estado: 'borrador',
          firmado: false,
          firmado_at: undefined,
          ...fichaDatosPayload,
          ...contratoIntermitentePayload,
          ...contratoTemporadaPlanPayload,
          ...sistemaPensionarioPayload,
          ...reglamentosPayload,
          ...consentimientoInformadoPayload,
          ...induccionPayload,
          ...cuentaBancariaPayload,
          ...declaracionConflictoInteresesPayload,
          ...acuerdoConfidencialidadPayload,
          ...cartaNoSobornoPayload,
          ...declaracionParentescoPayload,
          ...djPatrimonialPayload,
        });
      } else {
        const insertedId = await addContrato({
          cliente_id: selectedClient.id,
          contenido: `Contrato de trabajo para ${selectedClient.apellidos_y_nombres || `${selectedClient.nombre || ''} ${selectedClient.a_paterno || ''} ${selectedClient.a_materno || ''}`.trim()}`,
          estado: 'borrador',
          firmado: false,
          firmado_at: undefined,
          ...fichaDatosPayload,
          ...contratoIntermitentePayload,
          ...contratoTemporadaPlanPayload,
          ...sistemaPensionarioPayload,
          ...reglamentosPayload,
          ...consentimientoInformadoPayload,
          ...induccionPayload,
          ...cuentaBancariaPayload,
          ...declaracionConflictoInteresesPayload,
          ...acuerdoConfidencialidadPayload,
          ...cartaNoSobornoPayload,
          ...declaracionParentescoPayload,
          ...djPatrimonialPayload,
        });
        contractId = typeof insertedId === 'string' ? insertedId : contractId;
      }

      if (signatureData && (contractId || targetContract?.id)) {
        const finalId = contractId || targetContract?.id;
        try {
          const { data: existingFirma, error: existingError } = await supabase
            .from('firmas')
            .select('id')
            .eq('contrato_id', finalId)
            .limit(1)
            .maybeSingle();

          if (existingError) {
            console.error('Error verificando firma existente:', existingError);
          }

          if (!existingFirma) {
            await firmarContrato(
              finalId,
              firmadoAt,
              signatureSource === 'capturada' ? signatureData : undefined
            );
          }
        } catch (err) {
          console.error('No se pudo guardar la firma:', err);
          toast.error('Contrato guardado, pero no se pudo guardar la firma');
        }
      }

      await reloadContratos();
      toast.success('Contrato guardado y firmado correctamente');
      resetForm();
    } catch (err) {
      console.error('No se pudo guardar el contrato:', err);
      toast.error('No se pudo guardar el contrato');
    } finally {
      setSavingContract(false);
    }
  };
  const handleSaveDraft = async () => {
    if (!selectedClient) {
      toast.error('Debe seleccionar un trabajador');
      return;
    }

    const exclusiveSelection =
      lockedExclusiveContract ??
      (mutuallyExclusiveContracts.has(activeContractForm) ? activeContractForm : null);
    if (!exclusiveSelection) {
      toast.error('Seleccione Contrato Intermitente o Contrato por Temporada Plan');
      return;
    }

    const targetContract = viewingContract;
    
    // Preparar todos los payloads JSONB - guardando snapshot de datos del cliente + datos editables
    const fichaDatosPayload = { 
      ficha_datos: {
        ...fichaDatosValues,
        // Snapshot de datos del cliente en este momento
        clientSnapshot: {
          dni: selectedClient.dni,
          nombre: selectedClient.nombre,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          fecha_nac: selectedClient.fecha_nac,
          sexo: selectedClient.sexo,
          estado_civil: selectedClient.estado_civil,
          direccion: selectedClient.direccion,
          distrito: selectedClient.distrito,
          provincia: selectedClient.provincia,
          departamento: selectedClient.departamento,
          id_afp: selectedClient.id_afp,
          cuspp: selectedClient.cuspp,
        }
      }
    };
    
    const contratoIntermitentePayload =
      exclusiveSelection === 'contrato-intermitente'
        ? {
            contrato_intermitente: {
              // Datos editables
              puesto: fichaDatosValues.puesto,
              fechaInicio: fichaDatosValues.periodoDesde,
              fechaFin: fichaDatosValues.periodoHasta,
              remuneracion: fichaDatosValues.remuneracion,
              celular: fichaDatosValues.celular,
              // Snapshot de datos del cliente
              clientSnapshot: {
                dni: selectedClient.dni,
                apellidos_y_nombres: selectedClient.apellidos_y_nombres,
                a_paterno: selectedClient.a_paterno,
                a_materno: selectedClient.a_materno,
                nombre: selectedClient.nombre,
                direccion: selectedClient.direccion,
                distrito: selectedClient.distrito,
                provincia: selectedClient.provincia,
                departamento: selectedClient.departamento,
              },
            },
          }
        : { contrato_intermitente: {} };

    const contratoTemporadaPlanPayload =
      exclusiveSelection === 'contrato-temporada-plan'
        ? {
            contrato_temporada_plan: {
              // Datos editables
              puesto: fichaDatosValues.puesto,
              fechaInicio: fichaDatosValues.periodoDesde,
              fechaFin: fichaDatosValues.periodoHasta,
              remuneracion: fichaDatosValues.remuneracion,
              celular: fichaDatosValues.celular,
              // Snapshot de datos del cliente
              clientSnapshot: {
                dni: selectedClient.dni,
                apellidos_y_nombres: selectedClient.apellidos_y_nombres,
                a_paterno: selectedClient.a_paterno,
                a_materno: selectedClient.a_materno,
                nombre: selectedClient.nombre,
                direccion: selectedClient.direccion,
                distrito: selectedClient.distrito,
                provincia: selectedClient.provincia,
                departamento: selectedClient.departamento,
              },
            },
          }
        : { contrato_temporada_plan: {} };
    
    const existingSistemaPensionario = (targetContract?.sistema_pensionario as Record<string, unknown> | null | undefined) ?? null;
    const existingSistemaFechaRegistro =
      typeof existingSistemaPensionario?.fecha_registro === 'string' && existingSistemaPensionario.fecha_registro.trim()
        ? existingSistemaPensionario.fecha_registro
        : '';
    const existingSistemaCiudad =
      typeof existingSistemaPensionario?.ciudad === 'string' && existingSistemaPensionario.ciudad.trim()
        ? existingSistemaPensionario.ciudad
        : '';

    // Sistema pensionario: elección + datos del cliente + datos de ficha
    const sistemaPensionarioPayload = {
      sistema_pensionario: {
        pensionChoice,
        fecha_registro: existingSistemaFechaRegistro || new Date().toISOString(),
        ciudad: existingSistemaCiudad || 'Virú',
        // Snapshot de datos del cliente
        clientSnapshot: {
          dni: selectedClient.dni,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
          sexo: selectedClient.sexo,
        },
        // Datos de ficha necesarios para sistema pensionario
        fechaNacimiento: fichaDatosValues.fechaNacimiento,
        domicilioActual: fichaDatosValues.domicilioActual,
        distritoDomicilio: fichaDatosValues.distritoDomicilio,
        provinciaDomicilio: fichaDatosValues.provinciaDomicilio,
        periodoDesde: fichaDatosValues.periodoDesde,
        remuneracion: fichaDatosValues.remuneracion,
      }
    };
    
    const existingReglamentos = (targetContract?.reglamentos as Record<string, unknown> | null | undefined) ?? null;
    const existingReglamentosFechaRegistro =
      typeof existingReglamentos?.fecha_registro === 'string' && existingReglamentos.fecha_registro.trim()
        ? existingReglamentos.fecha_registro
        : '';
    const existingReglamentosCiudad =
      typeof existingReglamentos?.ciudad === 'string' && existingReglamentos.ciudad.trim()
        ? existingReglamentos.ciudad
        : '';

    // Reglamentos: snapshot de datos del cliente
    const reglamentosPayload = { 
      reglamentos: {
        fecha_registro: existingReglamentosFechaRegistro || new Date().toISOString(),
        ciudad: existingReglamentosCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };
    
    // Consentimiento informado: snapshot de datos del cliente
    const consentimientoInformadoPayload = { 
      consentimiento_informado: {
        fecha_registro:
          (typeof (targetContract?.consentimiento_informado as Record<string, unknown> | null | undefined)?.fecha_registro === 'string' &&
            ((targetContract?.consentimiento_informado as Record<string, unknown> | null | undefined)?.fecha_registro as string).trim())
            ? ((targetContract?.consentimiento_informado as Record<string, unknown>).fecha_registro as string)
            : new Date().toISOString(),
        ciudad:
          (typeof (targetContract?.consentimiento_informado as Record<string, unknown> | null | undefined)?.ciudad === 'string' &&
            ((targetContract?.consentimiento_informado as Record<string, unknown> | null | undefined)?.ciudad as string).trim())
            ? ((targetContract?.consentimiento_informado as Record<string, unknown>).ciudad as string)
            : 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };
    
    // Inducción no tiene datos editables, solo se visualiza
    const existingInduccion = (targetContract?.induccion as Record<string, unknown> | null | undefined) ?? null;
    const existingInduccionFechaRegistro =
      typeof existingInduccion?.fecha_registro === 'string' && existingInduccion.fecha_registro.trim()
        ? existingInduccion.fecha_registro
        : '';
    const existingInduccionCiudad =
      typeof existingInduccion?.ciudad === 'string' && existingInduccion.ciudad.trim()
        ? existingInduccion.ciudad
        : '';

    const induccionPayload = {
      induccion: {
        fecha_registro: existingInduccionFechaRegistro || new Date().toISOString(),
        ciudad: existingInduccionCiudad || 'VirÃº',
        cargo: fichaDatosValues.puesto,
        unidadArea: fichaDatosValues.unidadArea,
        codigo: selectedClient.cod,
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
          cod: selectedClient.cod,
        }
      }
    };

    const existingCuentaBancaria = (targetContract?.cuenta_bancaria as Record<string, unknown> | null | undefined) ?? null;
    const existingCuentaBancariaFechaRegistro =
      typeof existingCuentaBancaria?.fecha_registro === 'string' && existingCuentaBancaria.fecha_registro.trim()
        ? existingCuentaBancaria.fecha_registro
        : '';
    const existingCuentaBancariaCiudad =
      typeof existingCuentaBancaria?.ciudad === 'string' && existingCuentaBancaria.ciudad.trim()
        ? existingCuentaBancaria.ciudad
        : '';
    
    // Cuenta bancaria: entidad, número + snapshot del cliente
    const cuentaBancariaPayload = {
      cuenta_bancaria: {
        fecha_registro: existingCuentaBancariaFechaRegistro || new Date().toISOString(),
        ciudad: existingCuentaBancariaCiudad || 'Virú',
        entidadBancaria: fichaDatosValues.entidadBancaria,
        numeroCuenta: fichaDatosValues.numeroCuenta,
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };
    
    // Declaración de conflicto de intereses: snapshot del cliente
    const existingDeclaracionConflicto = (targetContract?.declaracion_conflicto_intereses as Record<string, unknown> | null | undefined) ?? null;
    const existingDeclaracionConflictoFechaRegistro =
      typeof existingDeclaracionConflicto?.fecha_registro === 'string' && existingDeclaracionConflicto.fecha_registro.trim()
        ? existingDeclaracionConflicto.fecha_registro
        : '';
    const existingDeclaracionConflictoCiudad =
      typeof existingDeclaracionConflicto?.ciudad === 'string' && existingDeclaracionConflicto.ciudad.trim()
        ? existingDeclaracionConflicto.ciudad
        : '';

    const declaracionConflictoInteresesPayload = { 
      declaracion_conflicto_intereses: {
        fecha_registro: existingDeclaracionConflictoFechaRegistro || new Date().toISOString(),
        ciudad: existingDeclaracionConflictoCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };
    
    // Acuerdo de confidencialidad: cargo + snapshot del cliente
    const existingAcuerdoConfidencialidad = (targetContract?.acuerdo_confidencialidad as Record<string, unknown> | null | undefined) ?? null;
    const existingAcuerdoConfidencialidadFechaRegistro =
      typeof existingAcuerdoConfidencialidad?.fecha_registro === 'string' && existingAcuerdoConfidencialidad.fecha_registro.trim()
        ? existingAcuerdoConfidencialidad.fecha_registro
        : '';
    const existingAcuerdoConfidencialidadCiudad =
      typeof existingAcuerdoConfidencialidad?.ciudad === 'string' && existingAcuerdoConfidencialidad.ciudad.trim()
        ? existingAcuerdoConfidencialidad.ciudad
        : '';

    const acuerdoConfidencialidadPayload = {
      acuerdo_confidencialidad: {
        fecha_registro: existingAcuerdoConfidencialidadFechaRegistro || new Date().toISOString(),
        ciudad: existingAcuerdoConfidencialidadCiudad || 'Virú',
        cargo: fichaDatosValues.puesto,
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };
    
    // Carta no soborno: cargo, unidad/área + snapshot del cliente
    const existingCartaNoSoborno = (targetContract?.carta_no_soborno as Record<string, unknown> | null | undefined) ?? null;
    const existingCartaNoSobornoFechaRegistro =
      typeof existingCartaNoSoborno?.fecha_registro === 'string' && existingCartaNoSoborno.fecha_registro.trim()
        ? existingCartaNoSoborno.fecha_registro
        : '';
    const existingCartaNoSobornoCiudad =
      typeof existingCartaNoSoborno?.ciudad === 'string' && existingCartaNoSoborno.ciudad.trim()
        ? existingCartaNoSoborno.ciudad
        : '';

    const cartaNoSobornoPayload = {
      carta_no_soborno: {
        fecha_registro: existingCartaNoSobornoFechaRegistro || new Date().toISOString(),
        ciudad: existingCartaNoSobornoCiudad || 'Virú',
        cargo: fichaDatosValues.puesto,
        unidadArea: fichaDatosValues.unidadArea,
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };
    
    // Declaración de parentesco: valores editables + snapshot del cliente
    const existingDeclaracionParentesco = (targetContract?.declaracion_parentesco as Record<string, unknown> | null | undefined) ?? null;
    const existingDeclaracionParentescoFechaRegistro =
      typeof existingDeclaracionParentesco?.fecha_registro === 'string' && existingDeclaracionParentesco.fecha_registro.trim()
        ? existingDeclaracionParentesco.fecha_registro
        : '';
    const existingDeclaracionParentescoCiudad =
      typeof existingDeclaracionParentesco?.ciudad === 'string' && existingDeclaracionParentesco.ciudad.trim()
        ? existingDeclaracionParentesco.ciudad
        : '';

    const declaracionParentescoPayload = { 
      declaracion_parentesco: {
        ...declaracionParentescoValues,
        fecha_registro: existingDeclaracionParentescoFechaRegistro || new Date().toISOString(),
        ciudad: existingDeclaracionParentescoCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          apellidos_y_nombres: selectedClient.apellidos_y_nombres,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
        }
      }
    };
    const existingDjPatrimonial = (targetContract?.dj_patrimonial as Record<string, unknown> | null | undefined) ?? null;
    const existingFechaRegistro =
      typeof existingDjPatrimonial?.fecha_registro === 'string' && existingDjPatrimonial.fecha_registro.trim()
        ? existingDjPatrimonial.fecha_registro
        : '';
    const existingCiudad =
      typeof existingDjPatrimonial?.ciudad === 'string' && existingDjPatrimonial.ciudad.trim()
        ? existingDjPatrimonial.ciudad
        : '';
    
    // DJ Patrimonial: snapshot del cliente
    const djPatrimonialPayload = { 
      dj_patrimonial: {
        fecha_registro: existingFechaRegistro || new Date().toISOString(),
        ciudad: existingCiudad || 'Virú',
        clientSnapshot: {
          dni: selectedClient.dni,
          a_paterno: selectedClient.a_paterno,
          a_materno: selectedClient.a_materno,
          nombre: selectedClient.nombre,
          estado_civil: selectedClient.estado_civil,
          remuneracion: selectedClient.remuneracion,
          direccion: selectedClient.direccion,
          distrito: selectedClient.distrito,
          provincia: selectedClient.provincia,
          departamento: selectedClient.departamento,
        }
      }
    };

    try {
      setSavingDraft(true);
      if (targetContract) {
        await updateContrato(targetContract.id, {
          contenido: `Contrato de trabajo para ${selectedClient.apellidos_y_nombres || `${selectedClient.nombre || ''} ${selectedClient.a_paterno || ''} ${selectedClient.a_materno || ''}`.trim()} - Borrador`,
          estado: 'borrador',
          firmado: false,
          firmado_at: undefined,
          ...fichaDatosPayload,
          ...contratoIntermitentePayload,
          ...contratoTemporadaPlanPayload,
          ...sistemaPensionarioPayload,
          ...reglamentosPayload,
          ...consentimientoInformadoPayload,
          ...induccionPayload,
          ...cuentaBancariaPayload,
          ...declaracionConflictoInteresesPayload,
          ...acuerdoConfidencialidadPayload,
          ...cartaNoSobornoPayload,
          ...declaracionParentescoPayload,
          ...djPatrimonialPayload,
        });
      } else {
        await addContrato({
          cliente_id: selectedClient.id,
          contenido: `Contrato de trabajo para ${selectedClient.apellidos_y_nombres || `${selectedClient.nombre || ''} ${selectedClient.a_paterno || ''} ${selectedClient.a_materno || ''}`.trim()} - Borrador`,
          estado: 'borrador',
          firmado: false,
          firmado_at: undefined,
          ...fichaDatosPayload,
          ...contratoIntermitentePayload,
          ...contratoTemporadaPlanPayload,
          ...sistemaPensionarioPayload,
          ...reglamentosPayload,
          ...consentimientoInformadoPayload,
          ...induccionPayload,
          ...cuentaBancariaPayload,
          ...declaracionConflictoInteresesPayload,
          ...acuerdoConfidencialidadPayload,
          ...cartaNoSobornoPayload,
          ...declaracionParentescoPayload,
          ...djPatrimonialPayload,
        });
      }

      await reloadContratos();
      toast.success('Borrador guardado correctamente');
      resetForm();
    } catch (err) {
      console.error('No se pudo guardar el borrador:', err);
      toast.error('No se pudo guardar el borrador');
    } finally {
      setSavingDraft(false);
    }
  };

  const A4_PX_WIDTH = 794;   // A4 @ ~96dpi
  const A4_PX_HEIGHT = 1123;

  const capturePdfPageImagesFromRef = async (ref: React.RefObject<HTMLDivElement>) => {
    const container = ref.current;
    if (!container) return [] as string[];

    const fontDoc = document as Document & { fonts?: { ready?: Promise<void> } };
    const fontsReady = fontDoc.fonts?.ready;
    if (fontsReady) {
      await fontsReady;
    }
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const pages = container.querySelectorAll('[data-pdf-page]');

    const captureFixedA4 = async (el: HTMLElement) => {
      const prev = {
        width: el.style.width,
        height: el.style.height,
        minHeight: el.style.minHeight,
        background: el.style.background,
        position: el.style.position,
        top: el.style.top,
        left: el.style.left,
        zIndex: el.style.zIndex,
        opacity: el.style.opacity,
        pointerEvents: el.style.pointerEvents,
        display: el.style.display,
        overflow: el.style.overflow,
        flexDirection: el.style.flexDirection,
      };

      el.style.position = 'fixed';
      el.style.top = '0px';
      el.style.left = '0px';
      el.style.zIndex = '999999';
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      el.style.width = `${A4_PX_WIDTH}px`;
      const naturalHeight = Math.max(el.scrollHeight, A4_PX_HEIGHT);
      el.style.height = `${naturalHeight}px`;
      el.style.minHeight = `${naturalHeight}px`;
      el.style.background = '#ffffff';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.overflow = 'visible';

      const waitForImages = async (root: HTMLElement, timeout = 5000) => {
        const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
        await Promise.all(
          imgs.map(img =>
            new Promise<void>(resolve => {
              if (!img || img.complete) return resolve();
              const ondone = () => {
                img.removeEventListener('load', ondone);
                img.removeEventListener('error', ondone);
                resolve();
              };
              img.addEventListener('load', ondone);
              img.addEventListener('error', ondone);
              setTimeout(resolve, timeout);
            })
          )
        );
      };

      const waitForFonts = async () => {
        try {
          const localFontDoc = document as Document & { fonts?: { ready?: Promise<void> } };
          const localFontsReady = localFontDoc.fonts?.ready;
          if (localFontsReady) {
            await localFontsReady;
          }
        } catch {
          // ignore
        }
      };

      const isMostlyWhite = (canvas: HTMLCanvasElement) => {
        try {
          const ctx = canvas.getContext('2d');
          if (!ctx) return false;
          const w = canvas.width;
          const h = canvas.height;
          const samples = [
            [Math.floor(w / 2), Math.floor(h / 2)],
            [Math.floor(w / 4), Math.floor(h / 4)],
            [Math.floor((3 * w) / 4), Math.floor(h / 4)],
            [Math.floor(w / 4), Math.floor((3 * h) / 4)],
            [Math.floor((3 * w) / 4), Math.floor((3 * h) / 4)],
          ];
          let sum = 0;
          for (const [x, y] of samples) {
            const d = ctx.getImageData(x, y, 1, 1).data;
            sum += d[0] + d[1] + d[2];
          }
          const avg = sum / (samples.length * 3);
          return avg > 250;
        } catch {
          return false;
        }
      };

      try {
        await new Promise(resolve => setTimeout(resolve, 0));
        await waitForImages(el);
        await waitForFonts();
        await new Promise(resolve => setTimeout(resolve, 0));

        const tryCapture = async (opts: Html2CanvasOptions) => {
          return await html2canvas(el, opts);
        };

        const strategies: Array<Pick<Html2CanvasOptions, 'scale' | 'foreignObjectRendering'>> = [
          { scale: 5, foreignObjectRendering: false },
          { scale: 4, foreignObjectRendering: false },
          { scale: 3, foreignObjectRendering: false },
        ];

        let canvas: HTMLCanvasElement | null = null;

        for (const s of strategies) {
          const opts: Html2CanvasOptions = {
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            scale: s.scale,
            foreignObjectRendering: !!s.foreignObjectRendering,
            allowTaint: true,
          };

          try {
            canvas = await tryCapture(opts);
          } catch (err) {
            console.warn('html2canvas failed for opts', opts, err);
            canvas = null;
          }

          if (canvas && !isMostlyWhite(canvas)) {
            break;
          }
        }

        if (!canvas || isMostlyWhite(canvas)) {
          canvas = await tryCapture({
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            scale: 3,
            foreignObjectRendering: false,
            allowTaint: true,
          });
        }

        return canvas;
      } finally {
        el.style.width = prev.width;
        el.style.height = prev.height;
        el.style.minHeight = prev.minHeight;
        el.style.background = prev.background;
        el.style.position = prev.position;
        el.style.top = prev.top;
        el.style.left = prev.left;
        el.style.zIndex = prev.zIndex;
        el.style.opacity = prev.opacity;
        el.style.pointerEvents = prev.pointerEvents;
        el.style.display = prev.display;
        el.style.overflow = prev.overflow;
        el.style.flexDirection = prev.flexDirection;
      }
    };

    const targets =
      pages.length === 0
        ? [container as HTMLElement]
        : (Array.from(pages) as HTMLElement[]);

    const images: string[] = [];
    for (const pageElement of targets) {
      const canvas = await captureFixedA4(pageElement);
      images.push(canvas.toDataURL('image/png'));
    }

    return images;
  };

  const trimWhiteMarginsFromImageData = async (imageData: string) => {
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo cargar la imagen para recorte'));
        img.src = imageData;
      });

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = image.naturalWidth || image.width;
      sourceCanvas.height = image.naturalHeight || image.height;
      const sourceCtx = sourceCanvas.getContext('2d');
      if (!sourceCtx) return imageData;

      sourceCtx.drawImage(image, 0, 0);
      const { width, height } = sourceCanvas;
      const imagePixels = sourceCtx.getImageData(0, 0, width, height).data;

      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      const threshold = 245;
      const sampleStep = 2;

      for (let y = 0; y < height; y += sampleStep) {
        for (let x = 0; x < width; x += sampleStep) {
          const idx = (y * width + x) * 4;
          const r = imagePixels[idx];
          const g = imagePixels[idx + 1];
          const b = imagePixels[idx + 2];
          const a = imagePixels[idx + 3];
          const isContent = a > 0 && (r < threshold || g < threshold || b < threshold);
          if (!isContent) continue;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }

      if (maxX < minX || maxY < minY) return imageData;

      const padding = 16;
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropX2 = Math.min(width - 1, maxX + padding);
      const cropY2 = Math.min(height - 1, maxY + padding);
      const cropWidth = cropX2 - cropX + 1;
      const cropHeight = cropY2 - cropY + 1;

      if (cropWidth <= 0 || cropHeight <= 0) return imageData;
      if (cropWidth >= width - 2 && cropHeight >= height - 2) return imageData;

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = cropWidth;
      outputCanvas.height = cropHeight;
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) return imageData;
      outputCtx.drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      return outputCanvas.toDataURL('image/png');
    } catch {
      return imageData;
    }
  };

  const generatePdfFromRef = async (
    ref: React.RefObject<HTMLDivElement>,
    clientName: string,
    options?: {
      returnBlob?: boolean;
      orientation?: 'portrait' | 'landscape';
      trimWhiteMargins?: boolean;
    }
  ) => {
    const images = await capturePdfPageImagesFromRef(ref);
    if (images.length === 0) return;

    const orientation = options?.orientation || 'portrait';
    const normalizedImages = options?.trimWhiteMargins
      ? await Promise.all(images.map(img => trimWhiteMarginsFromImageData(img)))
      : images;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    normalizedImages.forEach((imgData, index) => {
      if (index > 0) pdf.addPage();
      let renderWidth = pdfWidth;
      let renderHeight = pdfHeight;
      try {
        const props = pdf.getImageProperties(imgData);
        if (props?.width && props?.height) {
          const imageAspect = props.width / props.height;
          const pageAspect = pdfWidth / pdfHeight;
          if (imageAspect > pageAspect) {
            renderWidth = pdfWidth;
            renderHeight = renderWidth / imageAspect;
          } else {
            renderHeight = pdfHeight;
            renderWidth = renderHeight * imageAspect;
          }
        }
      } catch {
        // fallback: usar tamaño completo de página
      }

      const offsetX = (pdfWidth - renderWidth) / 2;
      const offsetY = (pdfHeight - renderHeight) / 2;
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, renderHeight);
    });

    if (options?.returnBlob) {
      return pdf.output('blob');
    }

    pdf.save(`contrato_${clientName.replace(/\s+/g, '_')}.pdf`);
  };

  const getPdfExportOptions = (formId?: string, returnBlob = false) => {
    if (formId === 'sistema-pensionario') {
      return {
        returnBlob,
        orientation: 'landscape' as const,
        trimWhiteMargins: true,
      };
    }

    return returnBlob ? { returnBlob } : undefined;
  };



  const handleDownloadPDF = async () => {
    if (!fullContractRef.current) return;

    if (!isContractComplete && !isContractLocked) {
      toast.error('El contrato debe estar completo y firmado para descargarlo');
      return;
    }

    try {
      toast.loading('Generando PDF...');

      const clientName = selectedClient
        ? `${selectedClient.nombre} ${selectedClient.a_paterno || ''} ${selectedClient.a_materno || ''}`
        : (viewingContract?.cliente_id || 'contrato');
      const safeName = clientName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');

      if (activeContractForm === 'ficha-datos') {
        await generatePdfFromRef(fullContractRef, safeName);
      } else {
        const currentForm = contractForms.find(form => form.id === activeContractForm);
        setZipRenderState({
          activeForm: activeContractForm as ContractFormId,
          fichaDatos: fichaDatosValues,
          pensionChoice,
          sistemaPensionario: (viewingContract?.sistema_pensionario as Record<string, unknown> | null | undefined) ?? null,
          reglamentos: (viewingContract?.reglamentos as Record<string, unknown> | null | undefined) ?? null,
          consentimientoInformado: (viewingContract?.consentimiento_informado as Record<string, unknown> | null | undefined) ?? null,
          induccion: (viewingContract?.induccion as Record<string, unknown> | null | undefined) ?? null,
          cuentaBancaria: (viewingContract?.cuenta_bancaria as Record<string, unknown> | null | undefined) ?? null,
          declaracionConflicto: (viewingContract?.declaracion_conflicto_intereses as Record<string, unknown> | null | undefined) ?? null,
          acuerdoConfidencialidad: (viewingContract?.acuerdo_confidencialidad as Record<string, unknown> | null | undefined) ?? null,
          cartaNoSoborno: (viewingContract?.carta_no_soborno as Record<string, unknown> | null | undefined) ?? null,
          declaracionParentesco: declaracionParentescoValues,
          djPatrimonial: (viewingContract?.dj_patrimonial as Record<string, unknown> | null | undefined) ?? null,
          signature: signatureData,
          client: selectedClient,
          docLabel: currentForm?.label || 'Contrato',
        });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await new Promise(resolve => setTimeout(resolve, 0));
        await generatePdfFromRef(
          zipDocRef,
          `${safeName}_${activeContractForm}`,
          getPdfExportOptions(activeContractForm)
        );
      }

      toast.dismiss();
      toast.success('PDF descargado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar el PDF');
      console.error(error);
    } finally {
      setZipRenderState({
        activeForm: null,
        fichaDatos: null,
        pensionChoice: '',
        sistemaPensionario: null,
        reglamentos: null,
        consentimientoInformado: null,
        induccion: null,
        cuentaBancaria: null,
        declaracionConflicto: null,
        acuerdoConfidencialidad: null,
        cartaNoSoborno: null,
        declaracionParentesco: null,
        djPatrimonial: null,
        signature: '',
        client: null,
        docLabel: '',
      });
    }
  };

  const resetForm = () => {
    setViewMode('list');
    setViewingContract(null);
    setSelectedClient(null);
    setValidationErrors({});
    setSignatureData('');
    setSignatureSource(null);
    setSignatureMode('direct');
    setActiveContractForm('ficha-datos');
    setLockedExclusiveContract(null);
    setPensionChoice('');
    setPreviewPage(1);
    setFichaDatosValues(emptyFichaDatosValues);
    setFichaDatosMissing([]);
    setDeclaracionParentescoValues(emptyDeclaracionParentescoValues);
    setDeclaracionParentescoMissing([]);
    setDownloadContext(null);
    setDownloadingRowId(null);
  };

  const handleViewContract = (contrato: Contrato) => {
    const cliente = getClienteById(contrato.cliente_id);
    setViewingContract(contrato);
    setSelectedClient(cliente || null);
    setSignatureData('');
    setSignatureSource(null);
    setViewMode('view');
  };

  const handleEditContract = (contrato: Contrato) => {
    if (contrato.estado === 'firmado') {
      toast.error('Los contratos firmados no pueden ser editados');
      return;
    }
    
    const cliente = getClienteById(contrato.cliente_id);
    setViewingContract(contrato);
    setSelectedClient(cliente || null);
    setSignatureData('');
    setSignatureSource(null);
    setViewMode('create');
  };

  const handleDeleteContract = (contrato: Contrato) => {
    const cliente = getClienteById(contrato.cliente_id);
    const clienteNombre = cliente ? getFullName(cliente) : `Cliente ${contrato.cliente_id}`;

    openConfirm({
      title: 'Eliminar contrato',
      description: `Se eliminara el contrato de ${clienteNombre}. Esta accion no se puede deshacer.`,
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteContrato(contrato.id);
          if (viewingContract?.id === contrato.id) {
            resetForm();
          }
          toast.success('Contrato eliminado correctamente');
        } catch (error) {
          console.error(error);
          toast.error('No se pudo eliminar el contrato');
        }
      },
    });
  };

  useEffect(() => {
    if (viewMode === 'create' && !viewingContract) {
      setLockedExclusiveContract(null);
    }
  }, [viewMode, viewingContract]);

  // Al cambiar de trabajador (o limpiar selección) resetea la ficha para evitar datos congelados
  useEffect(() => {
    if (viewMode !== 'create') return;
    if (!selectedClient) {
      setFichaDatosValues(emptyFichaDatosValues);
      return;
    }
    // Pre-rellenar con datos del cliente
    setFichaDatosValues({
      ...emptyFichaDatosValues,
      remuneracion: selectedClient.remuneracion ? String(selectedClient.remuneracion) : '',
      unidadArea: selectedClient.area || '',
      puesto: selectedClient.cargo || '',
      periodoDesde: selectedClient.fecha_inicio_contrato || '',
      periodoHasta: selectedClient.fecha_termino_contrato || '',
      fechaNacimiento: selectedClient.fecha_nac || '',
      distritoNacimiento: selectedClient.distrito || '',
      provinciaNacimiento: selectedClient.provincia || '',
      departamentoNacimiento: selectedClient.departamento || '',
      estadoCivil: selectedClient.estado_civil || '',
      domicilioActual: selectedClient.direccion || '',
      distritoDomicilio: selectedClient.distrito || '',
      provinciaDomicilio: selectedClient.provincia || '',
    });
  }, [selectedClient?.id, viewMode]);

  useEffect(() => {
    if (!viewingContract) return;
    
    // Cargar ficha_datos
    const raw = viewingContract.ficha_datos as Partial<FichaDatosValues> | undefined;
    if (raw) {
      setFichaDatosValues({
        ...emptyFichaDatosValues,
        ...raw,
        familiares: raw.familiares?.length ? raw.familiares : emptyFichaDatosValues.familiares,
        experienciaLaboral: raw.experienciaLaboral?.length ? raw.experienciaLaboral : emptyFichaDatosValues.experienciaLaboral,
        educacion: {
          ...emptyFichaDatosValues.educacion,
          ...(raw.educacion || {}),
          primaria: { ...emptyFichaDatosValues.educacion.primaria, ...(raw.educacion?.primaria || {}) },
          secundaria: { ...emptyFichaDatosValues.educacion.secundaria, ...(raw.educacion?.secundaria || {}) },
          tecnico: { ...emptyFichaDatosValues.educacion.tecnico, ...(raw.educacion?.tecnico || {}) },
          universitario: { ...emptyFichaDatosValues.educacion.universitario, ...(raw.educacion?.universitario || {}) },
        },
      });
    } else {
      setFichaDatosValues(emptyFichaDatosValues);
    }

    // Cargar sistema_pensionario
    const sistemaPensionario = viewingContract.sistema_pensionario as Record<string, unknown> | null | undefined;
    const pensionChoiceValue = typeof sistemaPensionario?.pensionChoice === 'string'
      ? sistemaPensionario.pensionChoice
      : '';
    if (pensionChoiceValue === 'ONP' || pensionChoiceValue === 'AFP') {
      setPensionChoice(pensionChoiceValue);
    } else {
      setPensionChoice('');
    }

    // Cargar declaracion_parentesco
    const declaracionParentesco = viewingContract.declaracion_parentesco as Partial<DeclaracionParentescoValues> | undefined;
    if (declaracionParentesco) {
      setDeclaracionParentescoValues({
        ...emptyDeclaracionParentescoValues,
        ...declaracionParentesco,
      });
    } else {
      setDeclaracionParentescoValues(emptyDeclaracionParentescoValues);
    }
    
    // En modo ver, bloquear el contrato exclusivo según lo guardado
    if (viewMode === 'view') {
      const intermitenteData = viewingContract.contrato_intermitente as Record<string, unknown> | null | undefined;
      const temporadaData = viewingContract.contrato_temporada_plan as Record<string, unknown> | null | undefined;
      const hasIntermitente = !!(intermitenteData && Object.keys(intermitenteData).length > 0);
      const hasTemporada = !!(temporadaData && Object.keys(temporadaData).length > 0);
      const selectedExclusive = hasIntermitente
        ? 'contrato-intermitente'
        : hasTemporada
          ? 'contrato-temporada-plan'
          : null;

      setLockedExclusiveContract(selectedExclusive);
    }
  }, [viewingContract, viewMode]);

  // Prefill ficha de datos SOLO con información básica del cliente (NO con datos de contratos anteriores)
  useEffect(() => {
    if (!selectedClient || viewMode !== 'create' || viewingContract) return;
    
    setFichaDatosValues(prev => {
      const next = { ...prev };
      const fill = (field: keyof FichaDatosValues, value?: string | null) => {
        if (!next[field] || (typeof next[field] === 'string' && next[field].trim() === '')) {
          (next as Record<keyof FichaDatosValues, unknown>)[field] = value ?? '';
        }
      };
      
      // SOLO pre-rellenar con datos básicos del cliente de la base de datos
      // NO con datos de contratos anteriores (puesto, remuneración, fechas, etc.)
      fill('domicilioActual', selectedClient.direccion);
      fill('distritoDomicilio', selectedClient.distrito);
      fill('provinciaDomicilio', selectedClient.provincia);
      fill('fechaNacimiento', selectedClient.fecha_nac);
      fill('estadoCivil', selectedClient.estado_civil);
      
      return next;
    });
  }, [selectedClient?.id, viewMode, viewingContract, contratos]);

  const openConfirm = (options: {
    title: string;
    description?: string;
    confirmText?: string;
    destructive?: boolean;
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmState({
      open: true,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText,
      destructive: options.destructive,
      onConfirm: options.onConfirm,
    });
  };

  const handleConfirmClose = () => {
    setConfirmState(prev => ({ ...prev, open: false, onConfirm: undefined }));
  };

  const handleConfirmAction = async () => {
    try {
      await confirmState.onConfirm?.();
    } finally {
      handleConfirmClose();
    }
  };

  const triggerBlobDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 1000);
  };

  const generateZipForContratos = async (contratosList: Contrato[], zipName: string) => {
    if (contratosList.length === 0) {
      toast.error('No hay contratos firmados para descargar');
      return;
    }

    try {
      toast.loading('Generando ZIP...');
      const zip = new JSZip();

      for (const contrato of contratosList) {
        await yieldToMainThread();
        const cliente = getClienteById(contrato.cliente_id);

        let sig = '';
        const { data } = await supabase
          .from('firmas')
          .select('firma_url')
          .eq('contrato_id', contrato.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        sig = data?.firma_url || '';

        setDownloadContext({ contract: contrato, client: cliente || null, signature: sig });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const clientName = cliente ? getFullName(cliente) : contrato.id;
        const safeName = clientName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        const blob = await generatePdfFromRef(fullContractRef, safeName, { returnBlob: true });
        if (blob instanceof Blob) {
          zip.file(`contrato_${safeName}_${contrato.id}.pdf`, blob);
        }
      }

      setDownloadContext(null);
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 1 },
      });
      triggerBlobDownload(zipBlob, zipName);
      toast.dismiss();
      toast.success('ZIP descargado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar el ZIP');
      console.error(error);
    }
  };

  const handleDownloadAllZip = async () => {
    const signedContratos = contratos.filter(contrato => contrato.estado === 'firmado');
    await generateZipForContratos(signedContratos, 'contratos.zip');
  };

  const getSelectedExclusiveForm = (contrato?: Contrato | null) => {
    if (contrato) {
      const intermitenteData = contrato.contrato_intermitente as Record<string, unknown> | null | undefined;
      const temporadaData = contrato.contrato_temporada_plan as Record<string, unknown> | null | undefined;
      const hasIntermitente = !!(intermitenteData && Object.keys(intermitenteData).length > 0);
      const hasTemporada = !!(temporadaData && Object.keys(temporadaData).length > 0);
      if (hasIntermitente) return 'contrato-intermitente';
      if (hasTemporada) return 'contrato-temporada-plan';
    }

    if (lockedExclusiveContract && mutuallyExclusiveContracts.has(lockedExclusiveContract)) {
      return lockedExclusiveContract;
    }

    if (mutuallyExclusiveContracts.has(activeContractForm)) {
      return activeContractForm;
    }

    return null;
  };

  const handleDownloadClientZip = async (clienteId?: string, contratoId?: string) => {
    const cliente =
      (clienteId ? getClienteById(clienteId) : null) ||
      (viewingContract?.cliente_id ? getClienteById(viewingContract.cliente_id) : null) ||
      selectedClient;
    if (!cliente) {
      toast.error('Seleccione un trabajador');
      return;
    }
    const safeName = getFullName(cliente).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
    const targetContrato = contratoId
      ? contratos.find(contrato => contrato.id === contratoId) || null
      : viewingContract || null;
    const selectedExclusiveForm = getSelectedExclusiveForm(targetContrato);
    const formsToDownload = contractForms.filter(form => {
      if (!mutuallyExclusiveContracts.has(form.id)) return true;
      return selectedExclusiveForm ? form.id === selectedExclusiveForm : false;
    });
    if (formsToDownload.length === 0) {
      toast.error('No hay documentos para descargar');
      return;
    }

    try {
      toast.loading('Generando ZIP...');
      let fichaDatosForZip = fichaDatosValues;
      let pensionChoiceForZip = pensionChoice;
      const sistemaPensionarioForZip = (targetContrato?.sistema_pensionario as Record<string, unknown> | null | undefined) ?? null;
      const reglamentosForZip = (targetContrato?.reglamentos as Record<string, unknown> | null | undefined) ?? null;
      const consentimientoInformadoForZip = (targetContrato?.consentimiento_informado as Record<string, unknown> | null | undefined) ?? null;
      const induccionForZip = (targetContrato?.induccion as Record<string, unknown> | null | undefined) ?? null;
      const cuentaBancariaForZip = (targetContrato?.cuenta_bancaria as Record<string, unknown> | null | undefined) ?? null;
      const declaracionConflictoForZip = (targetContrato?.declaracion_conflicto_intereses as Record<string, unknown> | null | undefined) ?? null;
      const acuerdoConfidencialidadForZip = (targetContrato?.acuerdo_confidencialidad as Record<string, unknown> | null | undefined) ?? null;
      const cartaNoSobornoForZip = (targetContrato?.carta_no_soborno as Record<string, unknown> | null | undefined) ?? null;
      let declaracionParentescoForZip = declaracionParentescoValues;
      const djPatrimonialForZip = (targetContrato?.dj_patrimonial as Record<string, unknown> | null | undefined) ?? null;
      let signatureForZip = signatureData;

      if (targetContrato) {
        const raw = targetContrato.ficha_datos as Partial<FichaDatosValues> | undefined;
        if (raw) {
          fichaDatosForZip = {
            ...emptyFichaDatosValues,
            ...raw,
            familiares: raw.familiares?.length ? raw.familiares : emptyFichaDatosValues.familiares,
            experienciaLaboral: raw.experienciaLaboral?.length ? raw.experienciaLaboral : emptyFichaDatosValues.experienciaLaboral,
            educacion: {
              ...emptyFichaDatosValues.educacion,
              ...(raw.educacion || {}),
              primaria: { ...emptyFichaDatosValues.educacion.primaria, ...(raw.educacion?.primaria || {}) },
              secundaria: { ...emptyFichaDatosValues.educacion.secundaria, ...(raw.educacion?.secundaria || {}) },
              tecnico: { ...emptyFichaDatosValues.educacion.tecnico, ...(raw.educacion?.tecnico || {}) },
              universitario: { ...emptyFichaDatosValues.educacion.universitario, ...(raw.educacion?.universitario || {}) },
            },
          };
        }

        const sistemaPensionario = targetContrato.sistema_pensionario as Record<string, unknown> | null | undefined;
        const pensionChoiceValue = typeof sistemaPensionario?.pensionChoice === 'string'
          ? sistemaPensionario.pensionChoice
          : '';
        if (pensionChoiceValue === 'ONP' || pensionChoiceValue === 'AFP') {
          pensionChoiceForZip = pensionChoiceValue;
        }

        const declaracionParentesco = targetContrato.declaracion_parentesco as Partial<DeclaracionParentescoValues> | undefined;
        if (declaracionParentesco) {
          declaracionParentescoForZip = {
            ...emptyDeclaracionParentescoValues,
            ...declaracionParentesco,
          };
        }

        const { data: firmaData } = await supabase
          .from('firmas')
          .select('firma_url')
          .eq('contrato_id', targetContrato.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (firmaData?.firma_url) {
          signatureForZip = firmaData.firma_url;
        }
      }

      const zip = new JSZip();

      for (let i = 0; i < formsToDownload.length; i++) {
        const form = formsToDownload[i];

        if (form.id === 'ficha-datos') {
          const blob = await generatePdfFromRef(fullContractRef, safeName, { returnBlob: true });
          if (blob instanceof Blob) {
            zip.file(`${safeName}_ficha_datos.pdf`, blob);
          }
          continue;
        }

        setZipRenderState({
          activeForm: form.id as ContractFormId,
          fichaDatos: fichaDatosForZip,
          pensionChoice: pensionChoiceForZip,
          sistemaPensionario: sistemaPensionarioForZip,
          reglamentos: reglamentosForZip,
          consentimientoInformado: consentimientoInformadoForZip,
          induccion: induccionForZip,
          cuentaBancaria: cuentaBancariaForZip,
          declaracionConflicto: declaracionConflictoForZip,
          acuerdoConfidencialidad: acuerdoConfidencialidadForZip,
          cartaNoSoborno: cartaNoSobornoForZip,
          declaracionParentesco: declaracionParentescoForZip,
          djPatrimonial: djPatrimonialForZip,
          signature: signatureForZip,
          client: cliente,
          docLabel: form.label,
        });

        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await new Promise(resolve => setTimeout(resolve, 0));
        const blob = await generatePdfFromRef(
          zipDocRef,
          `${safeName}_${form.id}`,
          getPdfExportOptions(form.id, true)
        );
        if (blob instanceof Blob) {
          const fileName = `${safeName}_${form.label.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}.pdf`;
          zip.file(fileName, blob);
        }
      }

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 1 },
      });
      triggerBlobDownload(zipBlob, `contratos_${safeName}.zip`);

      toast.dismiss();
      toast.success('ZIP descargado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar el ZIP');
      console.error(error);
    } finally {
      setZipRenderState({
        activeForm: null,
        fichaDatos: null,
        pensionChoice: '',
        sistemaPensionario: null,
        reglamentos: null,
        consentimientoInformado: null,
        induccion: null,
        cuentaBancaria: null,
        declaracionConflicto: null,
        acuerdoConfidencialidad: null,
        cartaNoSoborno: null,
        declaracionParentesco: null,
        djPatrimonial: null,
        signature: '',
        client: null,
        docLabel: '',
      });
      setZipProgress(null);
    }
  };
  const handleDownloadClientZipFromRow = async (clienteId: string, contratoId: string) => {
    setDownloadingRowId(contratoId);
    try {
      await handleDownloadClientZip(clienteId, contratoId);
    } finally {
      setDownloadingRowId(null);
    }
  };

  const handleDownloadBulkFormPdf = async () => {
    const selectedDocuments = bulkDocumentIds
      .map(id => bulkDocumentOptions.find(form => form.id === id))
      .filter((form): form is (typeof bulkDocumentOptions)[number] => !!form);
    if (selectedDocuments.length === 0) {
      toast.error('Seleccione al menos un documento');
      return false;
    }

    const normalizeDate = (dateValue: Date | string) => {
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let contratosElegibles: Contrato[] = [];
    if (bulkScope === 'manual') {
      contratosElegibles = signedFilteredContratos.filter(contrato => selectedBulkClients[contrato.cliente_id]);
      if (contratosElegibles.length === 0) {
        toast.error('Seleccione al menos un usuario');
        return false;
      }
    } else if (bulkScope === 'day') {
      if (!bulkDate) {
        toast.error('Seleccione una fecha');
        return false;
      }
      contratosElegibles = Array.from(latestSignedContractByClient.values())
        .filter(contrato => normalizeDate(contrato.created_at) === bulkDate);
    } else {
      contratosElegibles = Array.from(latestSignedContractByClient.values());
    }

    const totalSteps = contratosElegibles.reduce((sum, contrato) => {
      const docsForThisContract = selectedDocuments.filter(form => {
        if (!mutuallyExclusiveContracts.has(form.id)) return true;
        return getSelectedExclusiveForm(contrato) === form.id;
      });
      return sum + docsForThisContract.length;
    }, 0);

    if (totalSteps === 0) {
      toast.error('No hay documentos para los criterios seleccionados');
      return false;
    }

    try {
      setBulkDownloading(true);
      toast.loading('Generando PDF consolidado...');

      const firmaByContrato = new Map<string, string>();
      const contratoIds = contratosElegibles.map(contrato => contrato.id);
      const { data: firmasData } = await supabase
        .from('firmas')
        .select('contrato_id, firma_url, created_at')
        .in('contrato_id', contratoIds)
        .order('created_at', { ascending: false });

      for (const row of firmasData || []) {
        if (!firmaByContrato.has(row.contrato_id) && row.firma_url) {
          firmaByContrato.set(row.contrato_id, row.firma_url);
        }
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const shouldPairCuentaBancariaPages =
        selectedDocuments.some(form => form.id === 'cuenta-bancaria') &&
        contratosElegibles.length > 1;
      const halfPageHeight = pdfHeight / 2;
      const fitCuentaImageInHalfPage = (slotTop: number, imageData: string) => {
        let imageAspectRatio = A4_PX_WIDTH / A4_PX_HEIGHT;
        try {
          const imageProps = pdf.getImageProperties(imageData);
          if (imageProps?.width && imageProps?.height) {
            imageAspectRatio = imageProps.width / imageProps.height;
          }
        } catch {
          // Usa aspecto por defecto si no se pueden leer propiedades
        }

        let renderWidth = pdfWidth;
        let renderHeight = renderWidth / imageAspectRatio;
        if (renderHeight > halfPageHeight) {
          renderHeight = halfPageHeight;
          renderWidth = renderHeight * imageAspectRatio;
        }
        const renderX = (pdfWidth - renderWidth) / 2;
        const renderY = slotTop + (halfPageHeight - renderHeight) / 2;
        pdf.addImage(imageData, 'PNG', renderX, renderY, renderWidth, renderHeight);
      };
      let pendingCuentaImage: string | null = null;
      const flushPendingCuentaImage = () => {
        if (!pendingCuentaImage) return;
        if (pdfPageCount > 0) {
          pdf.addPage();
        }
        fitCuentaImageInHalfPage(0, pendingCuentaImage);
        pdfPageCount++;
        pendingCuentaImage = null;
      };
      let pdfPageCount = 0;
      let currentStep = 0;

      for (const form of selectedDocuments) {
        for (let i = 0; i < contratosElegibles.length; i++) {
          const contrato = contratosElegibles[i];
          if (mutuallyExclusiveContracts.has(form.id) && getSelectedExclusiveForm(contrato) !== form.id) {
            continue;
          }

          const cliente = getClienteById(contrato.cliente_id);
          if (!cliente) continue;

          const rawFicha = contrato.ficha_datos as Partial<FichaDatosValues> | undefined;
          const fichaDatosForZip = rawFicha
            ? {
                ...emptyFichaDatosValues,
                ...rawFicha,
                familiares: rawFicha.familiares?.length ? rawFicha.familiares : emptyFichaDatosValues.familiares,
                experienciaLaboral: rawFicha.experienciaLaboral?.length ? rawFicha.experienciaLaboral : emptyFichaDatosValues.experienciaLaboral,
                educacion: {
                  ...emptyFichaDatosValues.educacion,
                  ...(rawFicha.educacion || {}),
                  primaria: { ...emptyFichaDatosValues.educacion.primaria, ...(rawFicha.educacion?.primaria || {}) },
                  secundaria: { ...emptyFichaDatosValues.educacion.secundaria, ...(rawFicha.educacion?.secundaria || {}) },
                  tecnico: { ...emptyFichaDatosValues.educacion.tecnico, ...(rawFicha.educacion?.tecnico || {}) },
                  universitario: { ...emptyFichaDatosValues.educacion.universitario, ...(rawFicha.educacion?.universitario || {}) },
                },
              }
            : emptyFichaDatosValues;

          const sistemaPensionario = contrato.sistema_pensionario as { pensionChoice?: 'ONP' | 'AFP' | '' } | undefined;
          const pensionChoiceForZip = sistemaPensionario?.pensionChoice || '';
          const sistemaPensionarioForZip = (contrato.sistema_pensionario as Record<string, unknown> | null | undefined) ?? null;
          const reglamentosForZip = (contrato.reglamentos as Record<string, unknown> | null | undefined) ?? null;
          const consentimientoInformadoForZip = (contrato.consentimiento_informado as Record<string, unknown> | null | undefined) ?? null;
          const induccionForZip = (contrato.induccion as Record<string, unknown> | null | undefined) ?? null;
          const cuentaBancariaForZip = (contrato.cuenta_bancaria as Record<string, unknown> | null | undefined) ?? null;
          const declaracionConflictoForZip = (contrato.declaracion_conflicto_intereses as Record<string, unknown> | null | undefined) ?? null;
          const acuerdoConfidencialidadForZip = (contrato.acuerdo_confidencialidad as Record<string, unknown> | null | undefined) ?? null;
          const cartaNoSobornoForZip = (contrato.carta_no_soborno as Record<string, unknown> | null | undefined) ?? null;

          const declaracionParentesco = contrato.declaracion_parentesco as Partial<DeclaracionParentescoValues> | undefined;
          const declaracionParentescoForZip = declaracionParentesco
            ? { ...emptyDeclaracionParentescoValues, ...declaracionParentesco }
            : emptyDeclaracionParentescoValues;
          const djPatrimonialForZip = (contrato.dj_patrimonial as Record<string, unknown> | null | undefined) ?? null;

          currentStep += 1;
          setZipProgress({
            active: true,
            progress: Math.round((currentStep / totalSteps) * 100),
            total: totalSteps,
            current: currentStep,
            clientName: `${getFullName(cliente)} · ${form.label}`,
          });

          setZipRenderState({
            activeForm: form.id as ContractFormId,
            fichaDatos: fichaDatosForZip,
            pensionChoice: pensionChoiceForZip,
            sistemaPensionario: sistemaPensionarioForZip,
            reglamentos: reglamentosForZip,
            consentimientoInformado: consentimientoInformadoForZip,
            induccion: induccionForZip,
            cuentaBancaria: cuentaBancariaForZip,
            declaracionConflicto: declaracionConflictoForZip,
            acuerdoConfidencialidad: acuerdoConfidencialidadForZip,
            cartaNoSoborno: cartaNoSobornoForZip,
            declaracionParentesco: declaracionParentescoForZip,
            djPatrimonial: djPatrimonialForZip,
            signature: firmaByContrato.get(contrato.id) || '',
            client: cliente,
            docLabel: form.label,
          });

          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          await yieldToMainThread();
          const images = await capturePdfPageImagesFromRef(zipDocRef);
          for (const image of images) {
            const normalizedImage =
              shouldPairCuentaBancariaPages && form.id === 'cuenta-bancaria'
                ? await trimWhiteMarginsFromImageData(image)
                : image;

            if (shouldPairCuentaBancariaPages && form.id === 'cuenta-bancaria') {
              if (!pendingCuentaImage) {
                pendingCuentaImage = normalizedImage;
                continue;
              }
              if (pdfPageCount > 0) {
                pdf.addPage();
              }
              fitCuentaImageInHalfPage(0, pendingCuentaImage);
              fitCuentaImageInHalfPage(halfPageHeight, normalizedImage);
              pdfPageCount++;
              pendingCuentaImage = null;
              continue;
            }

            if (pdfPageCount > 0) {
              pdf.addPage();
            }
            pdf.addImage(normalizedImage, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdfPageCount++;
          }
        }

        if (form.id === 'cuenta-bancaria') {
          flushPendingCuentaImage();
        }
      }

      flushPendingCuentaImage();

      if (pdfPageCount === 0) {
        throw new Error('No se pudieron renderizar paginas para el PDF consolidado');
      }

      const docsTag = selectedDocuments
        .map(form => form.label.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_'))
        .join('_');
      const dateTag = new Date().toISOString().slice(0, 10);
      const scopeTag = bulkScope === 'manual' ? 'seleccion' : bulkScope === 'day' ? `dia_${bulkDate}` : 'general';
      pdf.save(`lote_${docsTag}_${scopeTag}_${dateTag}.pdf`);

      toast.dismiss();
      toast.success('PDF consolidado descargado correctamente');
      return true;
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar PDF consolidado');
      console.error(error);
      return false;
    } finally {
      setZipRenderState({
        activeForm: null,
        fichaDatos: null,
        pensionChoice: '',
        sistemaPensionario: null,
        reglamentos: null,
        consentimientoInformado: null,
        induccion: null,
        cuentaBancaria: null,
        declaracionConflicto: null,
        acuerdoConfidencialidad: null,
        cartaNoSoborno: null,
        declaracionParentesco: null,
        djPatrimonial: null,
        signature: '',
        client: null,
        docLabel: '',
      });
      setZipProgress(null);
      setBulkDownloading(false);
    }
  };

  const splitApellido = (apellido?: string) => {
    const trimmed = (apellido ?? '').trim();
    if (!trimmed) return { paterno: '', materno: '' };
    const parts = trimmed.split(/\s+/);
    return { paterno: parts[0] ?? '', materno: parts.slice(1).join(' ') };
  };

  const handleOpenRegistro = async (prefillDni?: string) => {
    const cleanDni = prefillDni ? prefillDni.replace(/\D/g, '').slice(0, 8) : '';
    setRegistroFormData(createRegistroInitialState(cleanDni));
    void getNextCod()
      .then((nextCod) => {
        setRegistroFormData(prev => (prev.cod.trim() ? prev : { ...prev, cod: nextCod }));
      })
      .catch(() => undefined);
    setShowRegistroModal(true);
    setTimeout(() => registroDniRef.current?.focus(), 0);

    if (cleanDni.length === 8) {
      const datos = await consultarDNI(cleanDni);
      if (datos) {
        const split = splitApellido(datos.apellido);
        setRegistroFormData(prev => ({
          ...prev,
          nombre: datos.nombre || prev.nombre,
          a_paterno: split.paterno || prev.a_paterno,
          a_materno: split.materno || prev.a_materno,
        }));
      }
    }
  };

  useEffect(() => {
    const fechaNacimiento = registroFormData.fecha_nac.trim();
    if (!fechaNacimiento) {
      setRegistroFormData(prev => (prev.edad ? { ...prev, edad: '' } : prev));
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
        const nextEdad = String(age);
        setRegistroFormData(prev => (prev.edad === nextEdad ? prev : { ...prev, edad: nextEdad }));
      }
    } catch {
      // Ignora fechas invalidas
    }
  }, [registroFormData.fecha_nac]);

  const normalizeLetters = (input: string) =>
    input
      .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
      .replace(/\s{2,}/g, ' ');

  const normalizeDigits = (input: string, maxLen: number) =>
    input.replace(/\D/g, '').slice(0, maxLen);

  const handleRegistroChange = async (field: keyof typeof registroFormData, value: string) => {
    let newValue = value;
    if (field === 'dni') {
      newValue = normalizeDigits(value, 8);
    } else if (field === 'cod') {
      newValue = value.toUpperCase().replace(/\s+/g, '').slice(0, 30);
    } else if (field === 'edad') {
      newValue = normalizeDigits(value, 3);
    } else if (field === 'nombre' || field === 'a_paterno' || field === 'a_materno') {
      newValue = normalizeLetters(value);
    }
    
    setRegistroFormData(prev => ({
      ...prev,
      [field]: newValue,
    }));

    if (field === 'dni' && newValue.length === 8 && /^\d{8}$/.test(newValue)) {
      const datos = await consultarDNI(newValue);
      if (datos) {
        const split = splitApellido(datos.apellido);
        setRegistroFormData(prev => ({
          ...prev,
          nombre: datos.nombre || prev.nombre,
          a_paterno: split.paterno || prev.a_paterno,
          a_materno: split.materno || prev.a_materno,
        }));
      }
    }
  };

  const normalizeRegistroString = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  const normalizeRegistroEstadoActual = (value: string) => {
    const normalized = normalizeRegistroString(value);
    if (normalized === 'ReIngresante' || normalized === 'Re Ingresante') return 'Reingresante';
    return normalized;
  };

  const normalizeRegistroTipoContrato = (value: string) => {
    const normalized = normalizeRegistroString(value);
    if (!normalized) return null;
    const upper = normalized.toUpperCase();
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
    return normalized;
  };

  const handleSaveNewClient = async () => {
    if (!/^\d{8}$/.test(registroFormData.dni.trim())) {
      toast.error('El DNI debe tener 8 digitos');
      return;
    }
    if (!registroFormData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (registroFormData.porcentaje_comision.trim()) {
      const value = Number(registroFormData.porcentaje_comision);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        toast.error('La comision debe estar entre 0 y 100');
        return;
      }
    }
    if (registroFormData.remuneracion.trim()) {
      const value = Number(registroFormData.remuneracion);
      if (Number.isNaN(value) || value < 0) {
        toast.error('La remuneracion debe ser un numero mayor o igual a 0');
        return;
      }
    }

    const codManual = normalizeRegistroString(registroFormData.cod);
    if (codManual && getClienteByCod(codManual)) {
      toast.error('El codigo ya esta registrado');
      return;
    }

    try {
      setRegistroLoading(true);
      const nombre = registroFormData.nombre.trim();
      const aPaterno = registroFormData.a_paterno.trim();
      const aMaterno = registroFormData.a_materno.trim();
      const apellidosYNombres = [aPaterno, aMaterno, nombre].filter(Boolean).join(' ').trim();

      await addCliente({
        dni: registroFormData.dni.toUpperCase(),
        cod: codManual,
        repetir_codigo: normalizeRegistroString(registroFormData.repetir_codigo),
        nombre: nombre || null,
        a_paterno: aPaterno || null,
        a_materno: aMaterno || null,
        apellidos_y_nombres: apellidosYNombres || null,
        edad: registroFormData.edad.trim() ? parseInt(registroFormData.edad.trim(), 10) : null,
        fecha_reclutamiento: normalizeRegistroString(registroFormData.fecha_reclutamiento),
        codigogrupotrabajo: normalizeRegistroString(registroFormData.codigogrupotrabajo),
        fecha_nac: normalizeRegistroString(registroFormData.fecha_nac),
        sexo: registroFormData.sexo ? (registroFormData.sexo as 'M' | 'F') : null,
        estado_civil: registroFormData.estado_civil
          ? (registroFormData.estado_civil as 'SOLTERO' | 'CASADO' | 'VIUDO' | 'CONVIVIENTE' | 'DIVORCIADO')
          : null,
        id_afp: normalizeRegistroString(registroFormData.id_afp),
        cuspp: normalizeRegistroString(registroFormData.cuspp),
        fecha_inicio_afiliacion: normalizeRegistroString(registroFormData.fecha_inicio_afiliacion),
        porcentaje_comision: registroFormData.porcentaje_comision.trim()
          ? Number(registroFormData.porcentaje_comision)
          : null,
        nueva_afiliacion: registroFormData.nueva_afiliacion,
        grado_instruccion: normalizeRegistroString(registroFormData.grado_instruccion),
        direccion: normalizeRegistroString(registroFormData.direccion),
        distrito: normalizeRegistroString(registroFormData.distrito),
        provincia: normalizeRegistroString(registroFormData.provincia),
        departamento: normalizeRegistroString(registroFormData.departamento),
        area: normalizeRegistroString(registroFormData.area),
        descripcion_zona: normalizeRegistroString(registroFormData.descripcion_zona),
        asignacion: normalizeRegistroString(registroFormData.asignacion),
        estado_actual: normalizeRegistroEstadoActual(registroFormData.estado_actual),
        cargo: normalizeRegistroString(registroFormData.cargo),
        fecha_inicio_contrato: normalizeRegistroString(registroFormData.fecha_inicio_contrato),
        fecha_termino_contrato: normalizeRegistroString(registroFormData.fecha_termino_contrato),
        tipo_contrato: normalizeRegistroTipoContrato(registroFormData.tipo_contrato),
        remuneracion: registroFormData.remuneracion.trim()
          ? Number(registroFormData.remuneracion)
          : null,
        planilla: normalizeRegistroString(registroFormData.planilla),
        observaciones: normalizeRegistroString(registroFormData.observaciones),
        referido: normalizeRegistroString(registroFormData.referido),
        lugar: normalizeRegistroString(registroFormData.lugar),
        cooperador: normalizeRegistroString(registroFormData.cooperador),
      });

      toast.success('Trabajador registrado correctamente');

      const newClient = getClienteByDni(registroFormData.dni.toUpperCase());
      if (newClient) {
        handleClientChange(newClient);
      }

      setShowRegistroModal(false);
      setRegistroFormData(createRegistroInitialState());
    } catch (error) {
      toast.error('Error al registrar trabajador');
      console.error(error);
    } finally {
      setRegistroLoading(false);
    }
  };

  const handleClientChange = (cliente: Cliente | null) => {
    if (isContractLocked) {
      toast.error('No se puede modificar un contrato firmado');
      return;
    }
    setSelectedClient(cliente);
    setPensionChoice('');
    setSignatureData('');
    setSignatureSource(null);
    setValidationErrors(prev => ({ ...prev, client: undefined }));
  };

  const handleScannerDetection = (client: Cliente) => {
    handleClientChange(client);
    setSelectionMethod('scanner');
  };

  const handleSignatureChange = (signature: string) => {
    if (isContractLocked) {
      toast.error('No se puede modificar un contrato firmado');
      return;
    }
    setSignatureData(signature);
    setSignatureSource('capturada');
    setValidationErrors(prev => ({ ...prev, signature: undefined }));
  };

  const getStatusBadge = (estado: Contrato['estado']) => {
    const styles = {
      borrador: 'bg-muted text-muted-foreground',
      pendiente: 'bg-warning/20 text-warning',
      firmado: 'bg-success/20 text-success',
      cancelado: 'bg-destructive/20 text-destructive',
    };

    const labels = {
      borrador: 'Borrador',
      pendiente: 'Pendiente firma',
      firmado: 'Firmado',
      cancelado: 'Cancelado',
    };

    const icons = {
      borrador: FileText,
      pendiente: Clock,
      firmado: CheckCircle2,
      cancelado: AlertCircle,
    };

    const Icon = icons[estado];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[estado]}`}>
        <Icon className="w-3.5 h-3.5" />
        {labels[estado]}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-6 motion-safe:animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 section-header">
          <div className="flex-1">
            <h1 className="section-title">Fichas / Contratos</h1>
            <p className="section-subtitle">Gestiona contratos y fichas de personal</p>
          </div>
          {viewMode === 'list' && (
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowDownloadModal(true)} variant="outline" size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                <span>Descarga masiva</span>
              </Button>
              <Button onClick={() => setViewMode('create')} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                <span>Nueva Ficha</span>
              </Button>
            </div>
          )}
          {viewMode !== 'list' && (
            <Button variant="outline" onClick={resetForm}>
              Volver a la lista
            </Button>
          )}
        </div>

        {(viewMode === 'create' || viewMode === 'view') && (
          <div className="space-y-6">
            {isContractLocked && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-3">
                <Lock className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-success">Contrato Firmado y Bloqueado</p>
                  <p className="text-sm text-muted-foreground">
                    Este contrato ha sido firmado y no puede ser modificado.
                  </p>
                </div>
              </div>
            )}

            {viewMode === 'create' && !isContractLocked && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center gap-3">
                <Edit3 className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Modo Edicion - Borrador</p>
                  <p className="text-sm text-muted-foreground">
                    Completa todos los campos y anade la firma para finalizar el contrato
                  </p>
                </div>
              </div>
            )}

            <div className="dashboard-card p-6 space-y-4">
              <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/30 p-2 dark:border-slate-700 dark:bg-slate-900/70">
                {contractForms.map(form => {
                  const isDisabled =
                    ((viewMode === 'create' || viewMode === 'view') &&
                      !!lockedExclusiveContract &&
                      mutuallyExclusiveContracts.has(form.id) &&
                      form.id !== lockedExclusiveContract) ||
                    (isContractLocked &&
                      !!lockedExclusiveContract &&
                      mutuallyExclusiveContracts.has(form.id) &&
                      form.id !== lockedExclusiveContract);
                  const formCompleteStatus = hasSelectedClient ? isFormComplete(form.id) : null;
                  return (
                    <button
                      key={form.id}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return;
                        setActiveContractForm(form.id);
                        if (viewMode === 'create' && mutuallyExclusiveContracts.has(form.id)) {
                          setLockedExclusiveContract(form.id);
                        }
                      }}
                      disabled={isDisabled}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${
                        activeContractForm === form.id
                          ? 'border border-success/40 bg-white text-slate-900 shadow-sm ring-1 ring-success/20 dark:border-emerald-400/60 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-400/30'
                          : isDisabled
                            ? 'cursor-not-allowed border border-border/40 text-muted-foreground/40 dark:border-slate-700/50 dark:bg-slate-900/40 dark:text-slate-500'
                            : formCompleteStatus === true
                              ? 'border border-success/40 text-success dark:border-emerald-700/60 dark:bg-emerald-500/10 dark:text-emerald-300'
                              : formCompleteStatus === false
                                ? 'border border-destructive/40 text-destructive dark:border-red-700/60 dark:bg-red-500/10 dark:text-red-300'
                                : 'text-muted-foreground hover:bg-white/80 hover:text-foreground dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                      }`}
                    >
                      {form.label}
                    </button>
                  );
                })}
              </div>
              {lockedExclusiveContract && !isContractLocked && viewMode !== 'view' && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
                  <span className="text-xs text-muted-foreground">
                    Seleccionaste {contractForms.find(form => form.id === lockedExclusiveContract)?.label}. El otro contrato queda bloqueado.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLockedExclusiveContract(null);
                    }}
                    className="text-xs font-semibold text-warning hover:text-foreground"
                  >
                    Desbloquear
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 space-y-6">
                {/* Si el contrato está firmado, solo muestra datos del cliente */}
                {isContractLocked && selectedClient ? (
                  <div className="dashboard-card p-6 bg-success/5 border border-success/30">
                    <h3 className="font-semibold text-foreground mb-4">Datos del Cliente</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Nombre</p>
                        <p className="font-semibold text-foreground">
                          {selectedClient.apellidos_y_nombres
                            || `${selectedClient.a_paterno || ''} ${selectedClient.a_materno || ''} ${selectedClient.nombre || ''}`.trim()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">DNI</p>
                        <p className="font-semibold text-foreground">{selectedClient.dni}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">COD</p>
                        <p className="font-semibold text-foreground">{selectedClient.cod || ''}</p>
                      </div>
                    </div>
                  </div>
                ) : !selectionMethod && (
                  <div className="dashboard-card p-6">
                    <h3 className="font-semibold text-foreground mb-4">Como deseas cargar los datos?</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        onClick={() => setSelectionMethod('scanner')}
                        variant="outline"
                        className="h-auto flex flex-col items-center justify-center gap-2 py-4"
                      >
                        <FileText className="w-6 h-6" />
                        <span>Escanear Identificador</span>
                        <span className="text-xs text-muted-foreground">Usa el scanner de codigos</span>
                      </Button>
                      <Button
                        onClick={() => setSelectionMethod('manual')}
                        variant="outline"
                        className="h-auto flex flex-col items-center justify-center gap-2 py-4"
                      >
                        <FileText className="w-6 h-6" />
                        <span>Seleccionar Manualmente</span>
                        <span className="text-xs text-muted-foreground">Elige de la lista de trabajadores</span>
                      </Button>
                    </div>
                  </div>
                )}

                {selectionMethod === 'scanner' && (
                  <>
                    <ScannerInput
                      onClientDetected={handleScannerDetection}
                      getClientByDni={getClienteByDni}
                      disabled={isContractLocked || showRegistroModal}
                      onRegisterNewClient={handleOpenRegistro}
                    />
                    <Button
                      onClick={() => setSelectionMethod(null)}
                      variant="outline"
                      className="w-full"
                    >
                      Volver Atras
                    </Button>
                    {selectedClient && (
                      <div className="dashboard-card p-6 bg-success/5 border border-success/30">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-success" />
                          Datos del Trabajador
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Nombre:</span>
                            <p className="font-medium">{selectedClient.nombre} {selectedClient.a_paterno || ''} {selectedClient.a_materno || ''}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">DNI:</span>
                            <p className="font-medium">{selectedClient.dni}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectionMethod(null)}
                          variant="outline"
                          className="w-full mt-4"
                          size="sm"
                        >
                          Cambiar metodo
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {selectionMethod === 'manual' && (
                  <>
                    <div className="dashboard-card p-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Datos del Trabajador
                      </h3>
                      
                      {isContractLocked ? (
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Nombre:</span>
                            <p className="font-medium">{selectedClient?.nombre} {selectedClient?.a_paterno || ''} {selectedClient?.a_materno || ''}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">DNI:</span>
                            <p className="font-medium">{selectedClient?.dni}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <ClientSelector
                            selectedClient={selectedClient}
                            onSelectClient={handleClientChange}
                            onRegisterNewClient={handleOpenRegistro}
                          />
                          {validationErrors.client && (
                            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {validationErrors.client}
                            </p>
                          )}
                          <Button
                            onClick={() => setSelectionMethod(null)}
                            variant="outline"
                            className="w-full mt-4"
                            size="sm"
                          >
                            Volver Atras
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}

                <div className="dashboard-card p-6 space-y-4">
                  <h3 className="font-semibold text-foreground mb-4">Firma del Trabajador</h3>
                  
                  {selectedClient && (
                    <>
                      {!isContractLocked && (
                        <div className="flex gap-2 mb-4 border-b border-border">
                          <button
                            onClick={() => setSignatureMode('direct')}
                            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                              signatureMode === 'direct'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Firma Digital
                          </button>
                          <button
                            onClick={() => setSignatureMode('qr')}
                            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                              signatureMode === 'qr'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Firma por QR
                          </button>
                        </div>
                      )}

                      {(signatureMode === 'direct' || isContractLocked) && (
                        <div className="space-y-4">
                          {isContractLocked ? (
                            <div className="border-2 border-success rounded-lg p-4 bg-success/5">
                              <div className="flex items-center gap-2 text-success mb-3">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Firma registrada</span>
                              </div>
                              {signatureData && (
                                <img
                                  src={signatureData}
                                  alt="Firma digital"
                                  className="max-h-24 mx-auto"
                                />
                              )}
                            </div>
                          ) : (
                            <>
                              <SignaturePad
                                onSignatureComplete={handleSignatureChange}
                                existingSignature={signatureData}
                              />
                              {validationErrors.signature && (
                                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  {validationErrors.signature}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {signatureMode === 'qr' && !isContractLocked && (
                        <div className="space-y-4">
                          {qrContractId && (
                            <ContractQR
                              contractId={qrContractId}
                              showDownload={true}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {!selectedClient && (
                    <div className="p-4 bg-muted/50 border border-border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Selecciona un trabajador para acceder a las opciones de firma.
                      </p>
                    </div>
                  )}
                </div>

                <div className="dashboard-card p-6 space-y-3">
                  <h3 className="font-semibold text-foreground mb-4">Acciones</h3>
                  
                  {(viewMode === 'view' || viewingContract) && (
                    <>
                      <Button
                        className="w-full"
                        onClick={handleDownloadPDF}
                        disabled={!selectedClient}
                        variant={selectedClient ? 'default' : 'outline'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Contrato PDF
                      </Button>

                      <Button
                        className="w-full"
                        onClick={() => handleDownloadClientZip()}
                        disabled={!selectedClient}
                        variant={selectedClient ? 'default' : 'outline'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar ZIP de documentos
                      </Button>
                    </>
                  )}

                  {!isContractLocked && viewMode === 'create' && (
                    <>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={!selectedClient || savingDraft || savingContract}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {savingDraft ? 'Guardando...' : 'Guardar como Borrador'}
                      </Button>

                      <Button
                        className="w-full"
                        onClick={handleSaveContract}
                        disabled={!isContractComplete || savingContract || savingDraft}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {savingContract ? 'Guardando...' : 'Guardar y Firmar Contrato'}
                      </Button>
                    </>
                  )}

                  {!isContractLocked && !isContractComplete && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Para completar el contrato:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {!selectedClient && <li>- Seleccione un trabajador</li>}
                        {!signatureData && <li>- Anada la firma del trabajador</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="xl:col-span-2">
                <div className="dashboard-card p-4 bg-slate-100 dark:bg-slate-900">
                  {activeContractForm === 'ficha-datos' && !isContractLocked && (
                    <div className="mb-4">
                      {activeContractTab?.component}
                    </div>
                  )}
                  {activeContractForm === 'declaracion-parentesco' && !isContractLocked && (
                    <div className="mb-4">
                      <DeclaracionParentescoEditor
                        client={selectedClient}
                        value={declaracionParentescoValues}
                        onChange={setDeclaracionParentescoValues}
                        onMissingChange={setDeclaracionParentescoMissing}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Vista Previa del Contrato
                    </h3>
                    {isContractLocked && (
                      <span className="inline-flex items-center gap-1 text-sm text-success">
                        <Lock className="w-4 h-4" />
                        Bloqueado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      Hoja {previewPage} de {previewPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                        disabled={previewPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewPage(p => Math.min(previewPages, p + 1))}
                        disabled={previewPage === previewPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                  <div
                    className="overflow-hidden mx-auto w-full max-w-[794px] border border-border bg-white"
                    style={{ height: PREVIEW_PAGE_HEIGHT }}
                  >
                    {activeContractForm === 'ficha-datos' ? (
                      <>
                        <PersonalDataSheetHeader
                          pageNumber={previewPage}
                          totalPages={previewPages}
                        />
                        <PersonalDataSheetTemplate
                          client={selectedClient}
                          data={buildFichaDatosTemplateData()}
                          isLocked={isContractLocked}
                          hideHeader={true}
                          noOuterBorder={true}
                          pagePart={Math.min(previewPage, 2) as 1 | 2}
                          signatureSrc={signatureData}
                        />
                      </>
                    ) : activeContractForm === 'contrato-intermitente' ? (
                      <div className="h-full w-full overflow-x-hidden overflow-y-auto flex justify-center">
                        <ContratoIntermitenteForm
                          client={selectedClient}
                          puesto={fichaDatosValues.puesto}
                          fechaInicio={fichaDatosValues.periodoDesde}
                          fechaFin={fichaDatosValues.periodoHasta}
                          remuneracion={fichaDatosValues.remuneracion}
                          celular={fichaDatosValues.celular}
                          signatureSrc={signatureData}
                          pagePart={previewPage as 1 | 2 | 3 | 4}
                        />
                      </div>
                    ) : activeContractForm === 'contrato-temporada-plan' ? (
                      <div className="h-full w-full overflow-x-hidden overflow-y-auto flex justify-center">
                        <ContratoTemporadaPlanForm
                          client={selectedClient}
                          puesto={fichaDatosValues.puesto}
                          fechaInicio={fichaDatosValues.periodoDesde}
                          fechaFin={fichaDatosValues.periodoHasta}
                          remuneracion={fichaDatosValues.remuneracion}
                          signatureSrc={signatureData}
                          celular={fichaDatosValues.celular}
                          pagePart={previewPage as 1 | 2 | 3}
                        />
                      </div>
                    ) : activeContractForm === 'sistema-pensionario' ? (
                      <div className="h-full w-full overflow-x-hidden overflow-y-auto flex justify-center">
                        <SistemaPensionarioForm
                          client={selectedClient}
                          ficha={fichaDatosValues}
                          sistemaPensionarioValues={(viewingContract?.sistema_pensionario as Record<string, unknown> | null | undefined) ?? null}
                          signatureSrc={signatureData}
                          pensionChoice={pensionChoice}
                          onChangeChoice={setPensionChoice}
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full overflow-x-auto overflow-y-auto flex justify-center">
                        <div
                          className={`w-full max-w-[794px] min-h-full bg-white text-black ${
                            activeContractForm === 'dj-patrimonial' ? 'p-0' : 'p-6'
                          }`}
                        >
                          {activeContractTab?.component}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="dashboard-card">
            <div className="border-b border-slate-200 bg-slate-50/80 p-6 dark:border-gray-700 dark:bg-gray-800/70">
              <h3 className="font-semibold text-foreground text-lg">Contratos Registrados</h3>
              <p className="text-sm text-muted-foreground mt-1">Total: {contratos.length} ficha(s)</p>
              <div className="mt-4">
                <input
                  type="text"
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  placeholder="Buscar por nombre o COD"
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="table-header">
                    <th className="text-left px-6 py-4 font-semibold">Titulo</th>
                    <th className="text-left px-6 py-4 font-semibold">Trabajador</th>
                    <th className="text-left px-6 py-4 hidden md:table-cell font-semibold">Tipo</th>
                    <th className="text-left px-6 py-4 font-semibold">Estado</th>
                    <th className="text-left px-6 py-4 hidden lg:table-cell font-semibold">Fecha</th>
                    <th className="text-left px-6 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContratosPorCliente.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No hay contratos registrados
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      let rowIndex = 0;
                      return filteredContratosPorCliente.flatMap(grupo => {
                        const cliente = grupo.cliente;
                        const clienteId = cliente?.id || `unknown-${grupo.contratos[0]?.id}`;
                        const isExpanded = !!expandedGroups[clienteId];
                        const headerRow = (
                          <tr key={`header-${cliente?.id || 'unknown'}`}>
                            <td colSpan={6} className="border-b border-slate-200 bg-slate-50/80 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/70">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="text-sm font-semibold text-foreground">
                                  {cliente
                                    ? getFullName(cliente)
                                    : 'Cliente no encontrado'}
                                  {cliente?.dni ? ` · DNI: ${cliente.dni}` : ''}
                                  {cliente?.cod ? ` · COD: ${cliente.cod}` : ''}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-xs text-muted-foreground">
                                    {grupo.contratos.length} contrato(s)
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleGroup(clienteId)}
                                  >
                                    {isExpanded ? 'Ocultar' : 'Ver lista'}
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );

                        const rows = isExpanded ? grupo.contratos.map(contrato => {
                          const index = rowIndex++;
                          return (
                            <tr
                              key={contrato.id}
                              className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-gray-800 dark:hover:bg-gray-800/60"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <td className="px-6 py-4">
                                <p className="font-medium text-foreground">{contrato.contenido?.split('\n')[0] || 'Contrato'}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {contrato.contenido || 'Sin descripcion'}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-foreground">
                                  {cliente
                                    ? getFullName(cliente)
                                    : 'Cliente no encontrado'}
                                </p>
                                <p className="text-sm text-muted-foreground">{cliente?.dni || ''}{cliente?.cod ? ` · COD: ${cliente.cod}` : ''}</p>
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell capitalize text-muted-foreground">
                                contrato
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(contrato.estado)}
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                                {new Date(contrato.created_at).toLocaleDateString('es-ES')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  {contrato.estado !== 'borrador' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewContract(contrato)}
                                      title="Ver"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {contrato.estado !== 'firmado' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditContract(contrato)}
                                      title="Editar"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {contrato.estado === 'firmado' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownloadClientZipFromRow(contrato.cliente_id, contrato.id)}
                                      disabled={downloadingRowId === contrato.id}
                                      title="Descargar ZIP"
                                    >
                                      <FileArchive className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteContract(contrato)}
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        }) : [];

                        return [headerRow, ...rows];
                      });
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showRegistroModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-4xl w-full mx-4 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Registrar Nuevo Trabajador</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Los datos seran guardados y automaticamente vinculados al contrato
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Identificacion</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  DNI
                  {dniLoading && <span className="text-xs text-muted-foreground ml-2">(consultando...)</span>}
                </label>
                <input
                  ref={registroDniRef}
                  type="text"
                  value={registroFormData.dni}
                  onChange={(e) => handleRegistroChange('dni', e.target.value)}
                  placeholder="Ej: 12345678"
                  className="input-field w-full"
                  maxLength={8}
                  inputMode="numeric"
                  pattern="\d*"
                  disabled={dniLoading}
                />
                {registroFormData.dni.length === 8 && dniLoading && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Consultando datos del DNI...
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos personales</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
                <input
                  type="text"
                  value={registroFormData.nombre}
                  onChange={(e) => handleRegistroChange('nombre', e.target.value)}
                  placeholder="Ej: Juan"
                  className="input-field w-full"
                  inputMode="text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Apellido paterno</label>
                <input
                  type="text"
                  value={registroFormData.a_paterno}
                  onChange={(e) => handleRegistroChange('a_paterno', e.target.value)}
                  placeholder="Ej: Perez"
                  className="input-field w-full"
                  inputMode="text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Apellido materno</label>
                <input
                  type="text"
                  value={registroFormData.a_materno}
                  onChange={(e) => handleRegistroChange('a_materno', e.target.value)}
                  placeholder="Ej: Garcia"
                  className="input-field w-full"
                  inputMode="text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={registroFormData.fecha_nac}
                  onChange={(e) => handleRegistroChange('fecha_nac', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Edad</label>
                <input
                  type="number"
                  value={registroFormData.edad}
                  onChange={(e) => handleRegistroChange('edad', e.target.value)}
                  placeholder="Se calcula automaticamente"
                  className="input-field w-full"
                  min={0}
                  max={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha de reclutamiento</label>
                <input
                  type="date"
                  value={registroFormData.fecha_reclutamiento}
                  onChange={(e) => handleRegistroChange('fecha_reclutamiento', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sexo</label>
                <select
                  value={registroFormData.sexo}
                  onChange={(e) => handleRegistroChange('sexo', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estado civil</label>
                <select
                  value={registroFormData.estado_civil}
                  onChange={(e) => handleRegistroChange('estado_civil', e.target.value)}
                  className="input-field w-full"
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
                <label className="block text-sm font-medium text-foreground mb-2">Repetir codigo</label>
                <input
                  type="text"
                  value={registroFormData.repetir_codigo}
                  onChange={(e) => handleRegistroChange('repetir_codigo', e.target.value)}
                  placeholder="Ej: 44000"
                  className="input-field w-full"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Codigo</label>
                <input
                  type="text"
                  value={registroFormData.cod}
                  onChange={(e) => handleRegistroChange('cod', e.target.value)}
                  placeholder="Se autogenera si lo dejas vacio"
                  className="input-field w-full"
                  maxLength={30}
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AFP / Afiliacion</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">AFP</label>
                <input
                  type="text"
                  value={registroFormData.id_afp}
                  onChange={(e) => handleRegistroChange('id_afp', e.target.value)}
                  placeholder="Ej: PRIMA"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">CUSPP</label>
                <input
                  type="text"
                  value={registroFormData.cuspp}
                  onChange={(e) => handleRegistroChange('cuspp', e.target.value)}
                  placeholder="Ej: 123456789012"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha inicio afiliacion</label>
                <input
                  type="date"
                  value={registroFormData.fecha_inicio_afiliacion}
                  onChange={(e) => handleRegistroChange('fecha_inicio_afiliacion', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Porcentaje comision</label>
                <input
                  type="number"
                  step="0.001"
                  value={registroFormData.porcentaje_comision}
                  onChange={(e) => handleRegistroChange('porcentaje_comision', e.target.value)}
                  placeholder="Ej: 12.5"
                  className="input-field w-full"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  id="registro_nueva_afiliacion"
                  type="checkbox"
                  checked={registroFormData.nueva_afiliacion}
                  onChange={(e) =>
                    setRegistroFormData(prev => ({ ...prev, nueva_afiliacion: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                <label htmlFor="registro_nueva_afiliacion" className="text-sm font-medium text-foreground">
                  Nueva afiliacion
                </label>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estudios</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Grado de instruccion</label>
                <input
                  type="text"
                  value={registroFormData.grado_instruccion}
                  onChange={(e) => handleRegistroChange('grado_instruccion', e.target.value)}
                  placeholder="Ej: Secundaria completa"
                  className="input-field w-full"
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Direccion</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Direccion</label>
                <textarea
                  value={registroFormData.direccion}
                  onChange={(e) => handleRegistroChange('direccion', e.target.value)}
                  placeholder="Ej: Av. Principal 123"
                  className="input-field w-full"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Distrito</label>
                <input
                  type="text"
                  value={registroFormData.distrito}
                  onChange={(e) => handleRegistroChange('distrito', e.target.value)}
                  placeholder="Ej: Miraflores"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Provincia</label>
                <input
                  type="text"
                  value={registroFormData.provincia}
                  onChange={(e) => handleRegistroChange('provincia', e.target.value)}
                  placeholder="Ej: Lima"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Departamento</label>
                <input
                  type="text"
                  value={registroFormData.departamento}
                  onChange={(e) => handleRegistroChange('departamento', e.target.value)}
                  placeholder="Ej: Lima"
                  className="input-field w-full"
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informacion laboral</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Codigo Grupo Trabajo</label>
                <input
                  type="text"
                  value={registroFormData.codigogrupotrabajo}
                  onChange={(e) => handleRegistroChange('codigogrupotrabajo', e.target.value)}
                  placeholder="Ej: 001"
                  className="input-field w-full"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Area</label>
                <input
                  type="text"
                  value={registroFormData.area}
                  onChange={(e) => handleRegistroChange('area', e.target.value)}
                  placeholder="Ej: Ventas"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Descripcion de Zona</label>
                <input
                  type="text"
                  value={registroFormData.descripcion_zona}
                  onChange={(e) => handleRegistroChange('descripcion_zona', e.target.value)}
                  placeholder="Ej: Zona Norte"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Asignacion</label>
                <input
                  type="text"
                  value={registroFormData.asignacion}
                  onChange={(e) => handleRegistroChange('asignacion', e.target.value)}
                  placeholder="Ej: Planta Norte"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estado Actual</label>
                <select
                  className="input-field w-full"
                  value={registroFormData.estado_actual}
                  onChange={(e) => handleRegistroChange('estado_actual', e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Reingresante">Reingresante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cargo</label>
                <input
                  type="text"
                  value={registroFormData.cargo}
                  onChange={(e) => handleRegistroChange('cargo', e.target.value)}
                  placeholder="Ej: Operario"
                  className="input-field w-full"
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informacion de contrato</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha Inicio Contrato</label>
                <input
                  type="date"
                  value={registroFormData.fecha_inicio_contrato}
                  onChange={(e) => handleRegistroChange('fecha_inicio_contrato', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha Termino Contrato</label>
                <input
                  type="date"
                  value={registroFormData.fecha_termino_contrato}
                  onChange={(e) => handleRegistroChange('fecha_termino_contrato', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo de Contrato</label>
                <select
                  value={registroFormData.tipo_contrato}
                  onChange={(e) => handleRegistroChange('tipo_contrato', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Seleccione una opción</option>
                  {TIPO_CONTRATO_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Remuneracion</label>
                <input
                  type="number"
                  step="0.01"
                  value={registroFormData.remuneracion}
                  onChange={(e) => handleRegistroChange('remuneracion', e.target.value)}
                  placeholder="Ej: 1500.00"
                  className="input-field w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Planilla</label>
                <select
                  className="input-field w-full"
                  value={registroFormData.planilla}
                  onChange={(e) => handleRegistroChange('planilla', e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  {PLANILLA_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informacion adicional</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Referido</label>
                <input
                  type="text"
                  value={registroFormData.referido}
                  onChange={(e) => handleRegistroChange('referido', e.target.value)}
                  placeholder="Ej: Juan Perez"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Lugar</label>
                <input
                  type="text"
                  value={registroFormData.lugar}
                  onChange={(e) => handleRegistroChange('lugar', e.target.value)}
                  placeholder="Ej: Oficina Central"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cooperador</label>
                <input
                  type="text"
                  value={registroFormData.cooperador}
                  onChange={(e) => handleRegistroChange('cooperador', e.target.value)}
                  placeholder="Ej: Maria Lopez"
                  className="input-field w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Observaciones</label>
                <textarea
                  value={registroFormData.observaciones}
                  onChange={(e) => handleRegistroChange('observaciones', e.target.value)}
                  placeholder="Observaciones generales..."
                  className="input-field w-full"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowRegistroModal(false)}
                disabled={registroLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNewClient}
                disabled={registroLoading}
                className="flex-1"
              >
                {registroLoading ? 'Guardando...' : 'Guardar y Continuar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {(viewMode === 'create' || viewMode === 'view') && (
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
          <PersonalDataSheetTemplate
            ref={fullContractRef}
            client={selectedClient}
            data={buildFichaDatosTemplateData()}
            isLocked={isContractLocked}
            signatureSrc={signatureData}
          />
        </div>
      )}

      {downloadContext && (
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
          <PersonalDataSheetTemplate
            ref={downloadContractRef}
            client={downloadContext.client || selectedClient}
            data={buildFichaDatosTemplateData()}
            isLocked={true}
            signatureSrc={downloadContext.signature}
          />
        </div>
      )}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-3xl w-full mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Descarga Masiva</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configura documentos, alcance y usuarios para generar un solo PDF.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Documentos a incluir</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {bulkDocumentOptions.map(form => {
                  const checked = bulkDocumentIds.includes(form.id as ContractFormId);
                  return (
                    <label key={form.id} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const formId = form.id as ContractFormId;
                          setBulkDocumentIds(prev => {
                            if (e.target.checked) {
                              if (prev.includes(formId)) return prev;
                              return [...prev, formId];
                            }
                            return prev.filter(id => id !== formId);
                          });
                        }}
                        className="h-4 w-4"
                      />
                      {form.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Alcance</label>
                <select
                  className="input-field w-full"
                  value={bulkScope}
                  onChange={(e) => setBulkScope(e.target.value as 'manual' | 'day' | 'all')}
                >
                  <option value="manual">Usuarios seleccionados</option>
                  <option value="day">Todos de un dia especifico</option>
                  <option value="all">General (todos)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha</label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  disabled={bulkScope !== 'day'}
                />
              </div>
            </div>

            {bulkScope === 'manual' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Usuarios</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={selectAllVisibleBulkClients}>
                      Marcar visibles
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={clearVisibleBulkClients}>
                      Limpiar
                    </Button>
                  </div>
                </div>
                <input
                  type="text"
                  className="input-field w-full"
                  value={bulkUserSearch}
                  onChange={(e) => setBulkUserSearch(e.target.value)}
                  placeholder="Buscar usuario por nombre, DNI o COD"
                />
                <div className="border border-border rounded-md p-3 max-h-56 overflow-y-auto space-y-2">
                  {filteredBulkSelectableClients.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay usuarios que coincidan.</p>
                  )}
                  {filteredBulkSelectableClients.map(item => (
                    <label key={item.clienteId} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!selectedBulkClients[item.clienteId]}
                        onChange={(e) => toggleBulkClient(item.clienteId, e.target.checked)}
                      />
                      {item.label}{item.dni ? ` · DNI: ${item.dni}` : ''}{item.cod ? ` · COD: ${item.cod}` : ''}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Seleccionados: {Object.values(selectedBulkClients).filter(Boolean).length} usuario(s)
              </p>
              <Button
                onClick={async () => {
                  const ok = await handleDownloadBulkFormPdf();
                  if (ok) setShowDownloadModal(false);
                }}
                disabled={bulkDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                {bulkDownloading ? 'Generando PDF...' : 'Generar PDF masivo'}
              </Button>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowDownloadModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        destructive={confirmState.destructive}
        onConfirm={handleConfirmAction}
        onCancel={handleConfirmClose}
      />
    </>
  );
}

