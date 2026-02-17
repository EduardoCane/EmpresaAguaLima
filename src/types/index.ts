export interface Cliente {
  id: string;
  dni: string;
  cod: string;
  created_at?: Date;

  repetir_codigo?: string | null;
  codigogrupotrabajo?: string | null;
  nombre?: string | null;
  a_paterno?: string | null;
  a_materno?: string | null;
  apellidos_y_nombres?: string | null;

  fecha_reclutamiento?: string | null;
  fecha_nac?: string | null;
  edad?: number | null;

  area?: string | null;
  descripcion_zona?: string | null;

  id_afp?: string | null;
  cuspp?: string | null;
  fecha_inicio_afiliacion?: string | null;
  porcentaje_comision?: number | null;
  nueva_afiliacion?: boolean | null;

  grado_instruccion?: string | null;
  asignacion?: string | null;
  estado_actual?: string | null;

  sexo?: 'M' | 'F' | null;
  estado_civil?: 'SOLTERO' | 'CASADO' | 'VIUDO' | 'CONVIVIENTE' | 'DIVORCIADO' | null;

  direccion?: string | null;
  distrito?: string | null;
  provincia?: string | null;
  departamento?: string | null;

  cargo?: string | null;

  fecha_inicio_contrato?: string | null;
  fecha_termino_contrato?: string | null;

  remuneracion?: number | null;
  tipo_contrato?: string | null;
  planilla?: string | null;

  observaciones?: string | null;
  referido?: string | null;
  lugar?: string | null;
  cooperador?: string | null;
}

export interface Contrato {
  id: string;
  cliente_id: string;
  contenido: string;
  estado: 'borrador' | 'pendiente' | 'firmado' | 'cancelado';
  firmado: boolean;
  firmado_at?: Date;
  signature_data?: string;
  created_at: Date;
  fecha_reclutamiento?: string | null;
  codigo_reclutamiento?: string | null;
  zona_reclutamiento?: string | null;
  area?: string | null;
  descripcion_zona?: string | null;
  asignacion?: string | null;
  estado_actual?: string | null;
  cargo?: string | null;
  fecha_inicio_contrato?: string | null;
  fecha_termino_contrato?: string | null;
  remuneracion?: number | null;
  tipo_contrato?: string | null;
  planilla?: string | null;
  observaciones?: string | null;
  referido?: string | null;
  lugar?: string | null;
  cooperador?: string | null;
  ficha_datos?: Record<string, unknown> | null;
  contrato_intermitente?: Record<string, unknown> | null;
  contrato_temporada_plan?: Record<string, unknown> | null;
  sistema_pensionario?: Record<string, unknown> | null;
  reglamentos?: Record<string, unknown> | null;
  consentimiento_informado?: Record<string, unknown> | null;
  induccion?: Record<string, unknown> | null;
  cuenta_bancaria?: Record<string, unknown> | null;
  declaracion_conflicto_intereses?: Record<string, unknown> | null;
  acuerdo_confidencialidad?: Record<string, unknown> | null;
  carta_no_soborno?: Record<string, unknown> | null;
  declaracion_parentesco?: Record<string, unknown> | null;
  dj_patrimonial?: Record<string, unknown> | null;
}

export interface Firma {
  id: string;
  contrato_id: string;
  cliente_firma_id?: string;
  firma_url: string;
  origen: 'capturada' | 'reutilizada';
  created_at: Date;
}

export interface ClienteFirma {
  id: string;
  cliente_id: string;
  firma_url: string;
  activa: boolean;
  created_at: Date;
}
