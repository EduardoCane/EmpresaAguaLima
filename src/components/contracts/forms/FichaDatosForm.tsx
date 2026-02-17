import { useEffect, useState } from 'react';
import { Cliente } from '@/types';

export type FamiliarRow = {
  apellidosNombres: string;
  parentesco: string;
  edad: string;
};

type ExperienciaRow = {
  cargo: string;
  empresa: string;
};

export type FichaDatosValues = {
  remuneracion: string;
  unidadArea: string;
  puesto: string;
  periodoDesde: string;
  periodoHasta: string;
  fechaNacimiento: string;
  distritoNacimiento: string;
  provinciaNacimiento: string;
  departamentoNacimiento: string;
  estadoCivil: string;
  domicilioActual: string;
  distritoDomicilio: string;
  provinciaDomicilio: string;
  telefonoFijo: string;
  celular: string;
  emergenciaContacto: string;
  emergenciaCelular: string;
  educacion: {
    primaria: { marcado: boolean; aniosEstudio: string; anioEgreso: string; ciudad: string };
    secundaria: { marcado: boolean; aniosEstudio: string; anioEgreso: string; ciudad: string };
    tecnico: { marcado: boolean; aniosEstudio: string; anioEgreso: string; ciudad: string; carrera: string };
    universitario: { marcado: boolean; aniosEstudio: string; anioEgreso: string; ciudad: string; carrera: string };
  };
  entidadBancaria: string;
  numeroCuenta: string;
  familiares: FamiliarRow[];
  experienciaLaboral: ExperienciaRow[];
  sinExperiencia: boolean;
};

type TextField = Exclude<
  keyof FichaDatosValues,
  'educacion' | 'familiares' | 'experienciaLaboral' | 'sinExperiencia'
>;

export const emptyFichaDatosValues: FichaDatosValues = {
  remuneracion: '',
  unidadArea: '',
  puesto: '',
  periodoDesde: '',
  periodoHasta: '',
  fechaNacimiento: '',
  distritoNacimiento: '',
  provinciaNacimiento: '',
  departamentoNacimiento: '',
  estadoCivil: '',
  domicilioActual: '',
  distritoDomicilio: '',
  provinciaDomicilio: '',
  telefonoFijo: '',
  celular: '',
  emergenciaContacto: '',
  emergenciaCelular: '',
  educacion: {
    primaria: { marcado: false, aniosEstudio: '', anioEgreso: '', ciudad: '' },
    secundaria: { marcado: false, aniosEstudio: '', anioEgreso: '', ciudad: '' },
    tecnico: { marcado: false, aniosEstudio: '', anioEgreso: '', ciudad: '', carrera: '' },
    universitario: { marcado: false, aniosEstudio: '', anioEgreso: '', ciudad: '', carrera: '' },
  },
  entidadBancaria: '',
  numeroCuenta: '',
  familiares: [
    { apellidosNombres: '', parentesco: '', edad: '' },
  ],
  experienciaLaboral: [{ cargo: '', empresa: '' }, { cargo: '', empresa: '' }],
  sinExperiencia: false,
};

interface FichaDatosFormProps {
  client?: Cliente | null;
  value: FichaDatosValues;
  onChange: (next: FichaDatosValues) => void;
  onMissingChange?: (missing: (keyof FichaDatosValues)[]) => void;
  currentPage?: 1 | 2;
}

export const getFichaDatosMissing = (current: FichaDatosValues) =>
  (Object.keys(current) as (keyof FichaDatosValues)[])
    .filter((key) => {
      // Los campos de ubicación (distrito, provincia, departamento) y estado civil son opcionales y se pre-rellenan
      if (key === 'distritoNacimiento' || key === 'provinciaNacimiento' || key === 'departamentoNacimiento' ||
          key === 'distritoDomicilio' || key === 'provinciaDomicilio' || key === 'estadoCivil') {
        return false;
      }
      if (key === 'educacion') {
        const edu = current.educacion;
        const hasPrimaria = edu.primaria.marcado &&
          !!edu.primaria.aniosEstudio.trim() &&
          !!edu.primaria.anioEgreso.trim() &&
          !!edu.primaria.ciudad.trim();
        const hasSecundaria = edu.secundaria.marcado &&
          !!edu.secundaria.aniosEstudio.trim() &&
          !!edu.secundaria.anioEgreso.trim() &&
          !!edu.secundaria.ciudad.trim();
        const hasTecnico = !!edu.tecnico.carrera.trim() ||
          !!edu.tecnico.aniosEstudio.trim() ||
          !!edu.tecnico.anioEgreso.trim() ||
          !!edu.tecnico.ciudad.trim();
        const hasUniversitario = !!edu.universitario.carrera.trim() ||
          !!edu.universitario.aniosEstudio.trim() ||
          !!edu.universitario.anioEgreso.trim() ||
          !!edu.universitario.ciudad.trim();

        const anyCompleted = hasPrimaria || hasSecundaria || hasTecnico || hasUniversitario;
        if (!anyCompleted) return true;

        const primariaIncomplete = edu.primaria.marcado &&
          (!edu.primaria.aniosEstudio.trim() || !edu.primaria.anioEgreso.trim() || !edu.primaria.ciudad.trim());
        const secundariaIncomplete = edu.secundaria.marcado &&
          (!edu.secundaria.aniosEstudio.trim() || !edu.secundaria.anioEgreso.trim() || !edu.secundaria.ciudad.trim());
        return primariaIncomplete || secundariaIncomplete;
      }
      if (key === 'familiares') {
        const hasAny = current.familiares.some(row =>
          row.apellidosNombres.trim() || row.parentesco.trim() || row.edad.trim()
        );
        return !hasAny;
      }
      if (key === 'experienciaLaboral') {
        if (current.sinExperiencia) return false;
        const hasAny = current.experienciaLaboral.some(row => row.cargo.trim() || row.empresa.trim());
        return !hasAny;
      }
      if (key === 'sinExperiencia') {
        return false;
      }
      if (key === 'remuneracion') {
        return !String(current[key]).trim();
      }
      if (key === 'unidadArea' || key === 'puesto' || key === 'periodoDesde' || key === 'periodoHasta') {
        return !String(current[key]).trim();
      }
      const raw = current[key];
      if (typeof raw === 'string') return !raw.trim();
      if (raw === null || raw === undefined) return true;
      const asString = String(raw);
      return !asString.trim();
    });

export function FichaDatosForm({ client, value, onChange, onMissingChange, currentPage = 1 }: FichaDatosFormProps) {
  const [activeField, setActiveField] = useState<keyof FichaDatosValues | null>(null);
  const normalizeLetters = (input: string) =>
    input
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, '')
      .replace(/\s{2,}/g, ' ');

  const normalizeDigits = (input: string, maxLen: number) =>
    input.replace(/\D/g, '').slice(0, maxLen);
  const textFields: TextField[] = [
    'remuneracion',
    'unidadArea',
    'puesto',
    'periodoDesde',
    'periodoHasta',
    'fechaNacimiento',
    'distritoNacimiento',
    'provinciaNacimiento',
    'departamentoNacimiento',
    'estadoCivil',
    'domicilioActual',
    'distritoDomicilio',
    'provinciaDomicilio',
    'telefonoFijo',
    'celular',
    'emergenciaContacto',
    'emergenciaCelular',
    'entidadBancaria',
    'numeroCuenta',
  ];

  const isTextField = (field: keyof FichaDatosValues): field is TextField =>
    textFields.includes(field as TextField);

  useEffect(() => {
    if (!client) return;
    const merged: FichaDatosValues = {
      ...value,
      remuneracion: value.remuneracion || (client.remuneracion ? String(client.remuneracion) : ''),
      unidadArea: value.unidadArea || client.area || '',
      puesto: value.puesto || client.cargo || '',
      periodoDesde: value.periodoDesde || client.fecha_inicio_contrato || '',
      periodoHasta: value.periodoHasta || client.fecha_termino_contrato || '',
      fechaNacimiento: value.fechaNacimiento || client.fecha_nac || '',
      distritoNacimiento: value.distritoNacimiento || client.distrito || '',
      provinciaNacimiento: value.provinciaNacimiento || client.provincia || '',
      departamentoNacimiento: value.departamentoNacimiento || client.departamento || '',
      estadoCivil: value.estadoCivil || client.estado_civil || '',
      domicilioActual: value.domicilioActual || client.direccion || '',
      distritoDomicilio: value.distritoDomicilio || client.distrito || '',
      provinciaDomicilio: value.provinciaDomicilio || client.provincia || '',
      celular: value.celular || client.celular || '',
    };
    const same =
      merged.remuneracion === value.remuneracion &&
      merged.unidadArea === value.unidadArea &&
      merged.puesto === value.puesto &&
      merged.periodoDesde === value.periodoDesde &&
      merged.periodoHasta === value.periodoHasta &&
      merged.fechaNacimiento === value.fechaNacimiento &&
      merged.distritoNacimiento === value.distritoNacimiento &&
      merged.provinciaNacimiento === value.provinciaNacimiento &&
      merged.departamentoNacimiento === value.departamentoNacimiento &&
      merged.estadoCivil === value.estadoCivil &&
      merged.domicilioActual === value.domicilioActual &&
      merged.distritoDomicilio === value.distritoDomicilio &&
      merged.provinciaDomicilio === value.provinciaDomicilio &&
      merged.celular === value.celular;
    if (!same) {
      onChange(merged);
    }
  }, [client?.id]);

  const setField = (field: keyof FichaDatosValues, nextValue: string) => {
    let sanitized = nextValue;
    if (field === 'telefonoFijo' || field === 'celular' || field === 'emergenciaCelular') {
      sanitized = normalizeDigits(nextValue, 9);
    }
    if (field === 'emergenciaContacto') {
      sanitized = normalizeLetters(nextValue);
    }
    onChange({ ...value, [field]: sanitized });
  };

  const updateFamiliar = (index: number, field: keyof FamiliarRow, nextValue: string) => {
    let sanitized = nextValue;
    if (field === 'apellidosNombres' || field === 'parentesco') {
      sanitized = normalizeLetters(nextValue);
    }
    if (field === 'edad') {
      sanitized = normalizeDigits(nextValue, 3);
    }
    const next = [...value.familiares];
    next[index] = { ...next[index], [field]: sanitized };
    onChange({ ...value, familiares: next });
  };

  const addFamiliarRow = () => {
    onChange({
      ...value,
      familiares: [...value.familiares, { apellidosNombres: '', parentesco: '', edad: '' }],
    });
  };

  const removeFamiliarRow = (index: number) => {
    const next = value.familiares.filter((_, idx) => idx !== index);
    onChange({
      ...value,
      familiares: next.length ? next : [{ apellidosNombres: '', parentesco: '', edad: '' }],
    });
  };

  const updateExperience = (index: number, field: keyof ExperienciaRow, nextValue: string) => {
    const next = [...value.experienciaLaboral];
    next[index] = { ...next[index], [field]: nextValue };
    onChange({ ...value, experienciaLaboral: next });
  };

  const addExperienceRow = () => {
    onChange({
      ...value,
      experienciaLaboral: [...value.experienciaLaboral, { cargo: '', empresa: '' }],
    });
  };

  const fieldLabels: Record<keyof FichaDatosValues, string> = {
    remuneracion: 'Remuneracion',
    unidadArea: 'U.N / Area',
    puesto: 'Puesto',
    periodoDesde: 'Periodo de contratacion (desde)',
    periodoHasta: 'Periodo de contratacion (hasta)',
    fechaNacimiento: 'Fecha de nacimiento',
    distritoNacimiento: 'Distrito de nacimiento',
    provinciaNacimiento: 'Provincia de nacimiento',
    departamentoNacimiento: 'Departamento de nacimiento',
    estadoCivil: 'Estado civil',
    domicilioActual: 'Domicilio actual',
    distritoDomicilio: 'Distrito',
    provinciaDomicilio: 'Provincia',
    telefonoFijo: 'Telefono fijo',
    celular: 'Celular',
    emergenciaContacto: 'Contacto de emergencia',
    emergenciaCelular: 'Celular de emergencia',
    familiares: 'Datos familiares (conyuge, hijos, dependientes)',
    educacion: 'Educacion y formacion academica',
    entidadBancaria: 'Entidad bancaria',
    numeroCuenta: 'Numero de cuenta',
    experienciaLaboral: 'Experiencia laboral',
    sinExperiencia: 'Sin experiencia',
  };

  const allMissingFields = getFichaDatosMissing(value);

  const missingFields = allMissingFields.filter((key) => {
    if (currentPage === 1) {
      return key !== 'experienciaLaboral' && key !== 'sinExperiencia';
    }
    return key === 'experienciaLaboral' || key === 'sinExperiencia';
  });

  useEffect(() => {
    if (onMissingChange) {
      onMissingChange(missingFields);
    }
  }, [missingFields.join('|'), currentPage]);

  const closeModal = () => setActiveField(null);

  return (
    <div className="space-y-6">
    </div>
  );
}
