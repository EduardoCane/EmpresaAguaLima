import { forwardRef } from "react";
import { Cliente } from "@/types";
import logo1Default from "@/img/logo_header_1.jpeg";
import logo2Default from "@/img/logo_header_2.jpeg";
import firmaempresa from "@/img/firmaempresa.jpeg";
type EstadoCivil = "SOLTERO" | "CASADO" | "VIUDO" | "CONVIVIENTE" | "DIVORCIADO";

type Familiar = {
  apellidosNombres?: string;
  parentesco?: string;
  edad?: string;
};

type EduRow = {
  marcado?: boolean;
  aniosEstudio?: string;
  anioEgreso?: string;
  ciudad?: string;
};

export interface PersonalFichaData {
  fecha?: string; // dd/mm/aaaa
  codigo?: string;
  remuneracion?: string;
  unidadArea?: string;
  puesto?: string;

  periodoDesde?: string;
  periodoHasta?: string;

  entidadBancaria?: string;
  numeroCuenta?: string;

  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombres?: string;

  fechaNacimiento?: string; // dd/mm/aa
  distritoNacimiento?: string;
  provinciaNacimiento?: string;
  departamentoNacimiento?: string;

  dni?: string;
  carneExtranjeria?: string;
  telefonoFijo?: string;
  celular?: string;

  estadoCivil?: EstadoCivil;

  domicilioActual?: string;
  cpDistrito?: string;
  provinciaDomicilio?: string;

  familiares?: Familiar[];

  emergenciaContacto?: string;
  emergenciaCelular?: string;

  educacion?: {
    primaria?: EduRow;
    secundaria?: EduRow;
    tecnico?: EduRow & { carreraTecnica?: string };
    universitario?: EduRow & { carreraProfesional?: string };
  };
  experienciaLaboral?: { cargo?: string; empresa?: string }[];
  sinExperiencia?: boolean;
}

interface Props {
  client: Cliente | null;
  data?: Partial<PersonalFichaData>;
  isLocked?: boolean;

  logo1Src?: string; 
  logo2Src?: string; 
  pageNumber?: number;
  totalPages?: number;
  hideHeader?: boolean;
  noOuterBorder?: boolean;
  pagePart?: 1 | 2 | "all";
  signatureSrc?: string;
}

interface HeaderProps {
  logo1Src?: string;
  logo2Src?: string;
  pageNumber: number;
  totalPages: number;
  fecha?: string;
}

export const PersonalDataSheetHeader = ({
  logo1Src = logo1Default,
  logo2Src = logo2Default,
  pageNumber,
  totalPages,
  fecha,
}: HeaderProps) => {
  const th = "border border-black bg-slate-200 p-1 text-[11px] font-semibold";
  const td = "border border-black p-1 text-[11px]";
  const dateText = "09.01.2020";

  return (
    <div className="grid grid-cols-[180px_1fr_220px] items-stretch gap-0">
    {/* Logos */}
    <div className="border-b-2 border-r-2 border-black p-1 flex items-center justify-center">
      <div className="flex items-center gap-1">
        <img src={logo1Src} alt="Logo 1" className="h-12 w-auto object-contain" />
        <img src={logo2Src} alt="Logo 2" className="h-12 w-auto object-contain" />
      </div>
    </div>

    {/* Título */}
      <div className="border-b-2 border-r-2 border-black flex items-center justify-center px-1 py-2">
        <h1 className="text-[11px] font-bold text-center leading-tight whitespace-normal">
          FICHA DE DATOS DEL PERSONAL
        </h1>
      </div>

    {/* Cuadro derecho */}
    <div className="border-b-2 border-black">
      <table className="w-full border-collapse text-[9px]">
        <tbody>
          <tr>
            <td className={`${th} text-center`} colSpan={2}>
              ASUNTOS CORPORATIVOS Y DE GESTIÓN HUMANA
            </td>
          </tr>
          <tr>
            <td className={`${td} text-[8px]`}>Código: FO-ACG-ACG-05</td>
            <td className={td}>Versión: 03</td>
          </tr>
          <tr>
            <td className={td}>Fecha: {dateText}</td>
            <td className={td}>
              Página: {pageNumber} de {totalPages}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  );
};

export const PersonalDataSheetTemplate = forwardRef<HTMLDivElement, Props>(
  (
    {
      client,
      data,
      isLocked = false,
      logo1Src = logo1Default,
      logo2Src = logo2Default,
      pageNumber = 1,
      totalPages = 1,
      hideHeader = false,
      noOuterBorder = false,
      pagePart = "all",
      signatureSrc,
    },
    ref
  ) => {
    const th = "border border-black bg-slate-200 p-1 text-[11px] font-semibold";
    const td = "border border-black p-2 text-[11px]";
    const tdCenter = `${td} text-center`;
    const tdValue = `${tdCenter} font-semibold`;
    const blockTitle = "border border-black bg-slate-200 p-1 text-[11px] font-semibold";

    const val = (value?: string | number | null, placeholder = "") => {
      if (value === null || value === undefined) return placeholder;
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed ? trimmed : placeholder;
      }
      const asString = String(value);
      const trimmed = asString.trim();
      return trimmed ? trimmed : placeholder;
    };
    const formatDate = (value?: string | number | null) => {
      if (value === null || value === undefined) return undefined;
      const trimmed = String(value).trim();
      if (!trimmed) return undefined;
      if (trimmed.includes("/")) return trimmed;
      const parsed = new Date(trimmed);
      if (Number.isNaN(parsed.getTime())) return trimmed;
      const day = String(parsed.getDate()).padStart(2, "0");
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}/${parsed.getFullYear()}`;
    };

    const Box = ({ checked }: { checked?: boolean }) => (
      <span className="inline-flex items-center justify-center w-[13px] h-[13px] border border-black">
        {checked ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path
              d="M2.2 6.2 L5 9 L9.8 3.5"
              fill="none"
              stroke="#000"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    );

    const showPage1 = pagePart !== 2;
    const showPage2 = pagePart !== 1;

    // Defaults básicos (para que se vea “relleno” aunque no tengas data)
    const today = new Date();
    const defaultFecha = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}/${today.getFullYear()}`;

    // Mapeos desde Cliente cuando aplique
    const codigo = data?.codigo ?? client?.cod;
    const dni = data?.dni ?? client?.dni;
    const nombres = data?.nombres ?? client?.nombre;
    const apellidoPaterno = data?.apellidoPaterno ?? client?.a_paterno;
    const apellidoMaterno = data?.apellidoMaterno ?? client?.a_materno;
    const celular = data?.celular;
    const fechaNacimiento = data?.fechaNacimiento ?? formatDate(client?.fecha_nac);
    const distritoNacimiento = data?.distritoNacimiento ?? client?.distrito;
    const provinciaNacimiento = data?.provinciaNacimiento ?? client?.provincia;
    const departamentoNacimiento = data?.departamentoNacimiento ?? client?.departamento;
    const estadoCivil = data?.estadoCivil ?? client?.estado_civil ?? undefined;
    const domicilioActual = data?.domicilioActual ?? client?.direccion;
    const cpDistrito = data?.cpDistrito ?? client?.distrito;
    const provinciaDomicilio = data?.provinciaDomicilio ?? client?.provincia;

    const familiares: Familiar[] = (data?.familiares?.length ? data.familiares : Array.from({ length: 5 }, () => ({}))) as Familiar[];

    return (
      <div
        ref={ref}
        className={`bg-white text-black ${noOuterBorder ? "" : "border-2 border-black"} mx-auto w-full max-w-none print:max-w-none print:w-full print:m-0 print:p-0 ${
          isLocked ? "opacity-95" : ""
        } print:shadow-none`}
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {showPage1 && (
          <div
            data-pdf-page="1"
            className="flex flex-col w-full min-h-full print:w-full print:min-h-full"
            style={{
              boxSizing: "border-box",
              ...(showPage2 ? { breakAfter: "page", pageBreakAfter: "always" } : {}),
            }}
          >
            {!hideHeader && (
              <PersonalDataSheetHeader
                logo1Src={logo1Src}
                logo2Src={logo2Src}
                pageNumber={1}
                totalPages={totalPages}
                fecha={defaultFecha}
              />
            )}
            {/* GENERALIDADES */}
        <div className="border-b-2 border-black p-2 text-[11px] leading-snug">
          <span className="font-bold">Generalidades:</span>{" "}
          La siguiente información es necesaria para el estudio de seguridad de la empresa. Los datos suministrados serán clasificados como
          información confidencial y podrán ser presentados ante las autoridades nacionales cuando estas así lo requieran. Toda la información
          registrada en el presente formato, será confirmada por funcionarios autorizados por la empresa.
        </div>

        {/* BLOQUE: FECHA / CODIGO / REMUNERACIÓN */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={th}>FECHA</td>
              <td className={tdValue}>{defaultFecha}</td>

              <td className={th}>CÓDIGO</td>
              <td className={tdValue}>{val(codigo)}</td>

              <td className={th}>REMUNERACIÓN</td>
              <td className={tdValue}>{val(data?.remuneracion)}</td>
            </tr>

            <tr>
              <td className={th}>U.N/ ÁREA:</td>
              <td className={tdValue} colSpan={2}>
                {val(data?.unidadArea)}
              </td>

              <td className={th}>PUESTO</td>
              <td className={tdValue} colSpan={2}>
                {val(data?.puesto)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* PERIODO + BANCO */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={blockTitle} colSpan={3}>
                PERIODO DE CONTRATACIÓN (sólo para nuevos trabajadores o reingresantes)
              </td>
              <td className={blockTitle} colSpan={3}>
                ELECCIÓN DE ENTIDAD BANCARIA (Pago de Haberes)
              </td>
            </tr>
            <tr>
              <td className={tdValue}>{val(data?.periodoDesde)}</td>
              <td className={tdCenter}>hasta</td>
              <td className={tdValue}>{val(data?.periodoHasta)}</td>

              <td className={th} style={{ width: "140px" }}>
                Entidad Bancaria
              </td>
              <td className={tdValue} colSpan={2}>
                {val(data?.entidadBancaria)}
              </td>
            </tr>
            <tr>
              <td className={td} colSpan={3}></td>

              <td className={th} style={{ width: "140px" }}>
                N° de cuenta
              </td>
              <td className={tdValue} colSpan={2}>
                {val(data?.numeroCuenta)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* APELLIDOS Y NOMBRES */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={`${th} text-center`} colSpan={2}>
                APELLIDO PATERNO
              </td>
              <td className={`${th} text-center`} colSpan={2}>
                APELLIDO MATERNO
              </td>
              <td className={`${th} text-center`} colSpan={2}>
                NOMBRES
              </td>
            </tr>
            <tr>
              <td className={`${tdValue}`} colSpan={2}>
                {val(apellidoPaterno)}
              </td>
              <td className={`${tdValue}`} colSpan={2}>
                {val(apellidoMaterno)}
              </td>
              <td className={`${tdValue}`} colSpan={2}>
                {val(nombres)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* FECHA Y LUGAR DE NACIMIENTO */}
        <div className="border-l border-r border-black bg-slate-200 p-1 text-[11px] font-semibold">
          FECHA Y LUGAR DE NACIMIENTO
        </div>

        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={th}>F. NACIMIENTO (dd/mm/aa)</td>
              <td className={th}>DISTRITO</td>
              <td className={th}>PROVINCIA</td>
              <td className={th}>DEPARTAMENTO</td>
            </tr>
            <tr>
              <td className={tdValue}>{val(fechaNacimiento)}</td>
              <td className={tdValue}>{val(distritoNacimiento)}</td>
              <td className={tdValue}>{val(provinciaNacimiento)}</td>
              <td className={tdValue}>{val(departamentoNacimiento)}</td>
            </tr>
          </tbody>
        </table>

        {/* DOCS + TELÉFONOS */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={th}>DNI</td>
              <td className={th}>CARNÉ DE EXTRANJERÍA</td>
              <td className={th}>TELÉFONO FIJO</td>
              <td className={th}>CELULAR</td>
            </tr>
            <tr>
              <td className={tdValue}>{val(dni)}</td>
              <td className={tdValue}>{val(data?.carneExtranjeria, "................")}</td>
              <td className={tdValue}>{val(data?.telefonoFijo, "................")}</td>
              <td className={tdValue}>{val(celular)}</td>
            </tr>
          </tbody>
        </table>

        {/* ESTADO CIVIL */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={th} style={{ width: "160px" }}>
                ESTADO CIVIL:
              </td>
              <td className={td}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <span>SOLTERO</span> <Box checked={estadoCivil === "SOLTERO"} />
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <span>CASADO</span> <Box checked={estadoCivil === "CASADO"} />
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <span>VIUDO</span> <Box checked={estadoCivil === "VIUDO"} />
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <span>CONVIVIENTE</span> <Box checked={estadoCivil === "CONVIVIENTE"} />
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <span>DIVORCIADO</span> <Box checked={estadoCivil === "DIVORCIADO"} />
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* DOMICILIO ACTUAL */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={th} rowSpan={2} style={{ width: "180px" }}>
                DOMICILIO ACTUAL :
              </td>
              <td className={tdValue} rowSpan={2}>
                {val(domicilioActual)}
              </td>
              <td className={`${th} text-center`} style={{ width: "180px" }}>
                C.P. / DISTRITO
              </td>
              <td className={`${th} text-center`} style={{ width: "180px" }}>
                PROVINCIA
              </td>
            </tr>
            <tr>
              <td className={tdValue}>{val(cpDistrito)}</td>
              <td className={tdValue}>{val(provinciaDomicilio)}</td>
            </tr>
          </tbody>
        </table>

        {/* 2. DATOS FAMILIARES */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={blockTitle} colSpan={3}>
                2. DATOS FAMILIARES (CONYUGE, HIJOS Y DEPENDIENTES)
              </td>
            </tr>
            <tr>
              <td className={`${th} text-center`}>APELLIDOS Y NOMBRES</td>
              <td className={`${th} text-center`} style={{ width: "220px" }}>
                PARENTESCO
              </td>
              <td className={`${th} text-center`} style={{ width: "140px" }}>
                EDAD
              </td>
            </tr>

            {familiares.map((f, idx) => (
              <tr key={idx}>
                <td className={`${tdValue} py-3.5`}>{val(f.apellidosNombres, "")}</td>
                <td className={`${tdValue} py-3.5`}>{val(f.parentesco, "")}</td>
                <td className={`${tdValue} py-3.5`}>{val(f.edad, "")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EMERGENCIA */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={th} style={{ width: "420px" }}>
                EN CASO DE EMERGENCIA COMUNICARSE (NOMBRES Y APELLIDOS):
              </td>
              <td className={tdValue}>{val(data?.emergenciaContacto, "")}</td>
            </tr>
            <tr>
              <td className={th}>NÚMERO CELULAR:</td>
              <td className={tdValue}>{val(data?.emergenciaCelular, "")}</td>
            </tr>
          </tbody>
        </table>

        {/* 3. EDUCACIÓN */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={blockTitle} colSpan={5}>
                3. EDUCACIÓN Y FORMACIÓN ACADÉMICA
              </td>
            </tr>
            <tr>
              <td className={`${th} text-center`} style={{ width: "200px" }}>
                NIVEL EDUCATIVO
              </td>
              <td className={`${th} text-center`} style={{ width: "90px" }}>
                MARCAR
              </td>
              <td className={`${th} text-center`}>AÑOS DE ESTUDIO</td>
              <td className={`${th} text-center`}>AÑO DE EGRESO</td>
              <td className={`${th} text-center`}>CIUDAD EN QUE CURSÓ SUS ESTUDIOS</td>
            </tr>

            {/* PRIMARIA */}
            <tr>
              <td className={th}>PRIMARIA</td>
              <td className={tdCenter}>
                <Box checked={data?.educacion?.primaria?.marcado} />
              </td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.primaria?.aniosEstudio, "")}</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.primaria?.anioEgreso, "")}</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.primaria?.ciudad, "")}</td>
            </tr>

            {/* SECUNDARIA */}
            <tr>
              <td className={th}>SECUNDARIA</td>
              <td className={tdCenter}>
                <Box checked={data?.educacion?.secundaria?.marcado} />
              </td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.secundaria?.aniosEstudio, "")}</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.secundaria?.anioEgreso, "")}</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.secundaria?.ciudad, "")}</td>
            </tr>

            {/* TÉCNICO */}
            <tr>
              <td className={th}>TÉCNICO</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.tecnico?.aniosEstudio, "")}</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.tecnico?.anioEgreso, "")}</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.tecnico?.ciudad, "")}</td>
            </tr>
            <tr>
              <td className={th} colSpan={2}>
                CARRERA TÉCNICA:
              </td>
              <td className={`${tdValue} py-1.5 h-8`} colSpan={3}>
                {val(data?.educacion?.tecnico?.carreraTecnica, "")}
              </td>
            </tr>

            {/* UNIVERSITARIO */}
            <tr>
              <td className={th}>UNIVERSITARIO</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.universitario?.aniosEstudio, "")}</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.universitario?.anioEgreso, "")}</td>
              <td className={`${tdValue} py-1.5 h-8`}>{val(data?.educacion?.universitario?.ciudad, "")}</td>
            </tr>
            <tr>
              <td className={th} colSpan={2}>
                CARRERA PROFESIONAL:
              </td>
              <td className={`${tdValue} py-1.5 h-8`} colSpan={3}>
                {val(data?.educacion?.universitario?.carreraProfesional, "")}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex-1 border-l border-r border-b border-black" />
          </div>
        )}
        {showPage2 && (
          <div
            data-pdf-page="2"
            className="flex flex-col w-full min-h-full flex-1 print:w-full print:min-h-full overflow-hidden"
            style={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              ...(showPage1 ? { breakBefore: "page", pageBreakBefore: "always" } : {}),
            }}
          >
            {!hideHeader && (
              <PersonalDataSheetHeader
                logo1Src={logo1Src}
                logo2Src={logo2Src}
                pageNumber={2}
                totalPages={totalPages}
                fecha={defaultFecha}
              />
            )}
            {/* 4. EXPERIENCIA LABORAL */}
            <div
              style={showPage1 ? { breakBefore: "page", pageBreakBefore: "always" } : undefined}
              className="border-l border-r border-black bg-slate-200 p-1 text-[11px] font-semibold"
            >
              4. EXPERIENCIA LABORAL (INDICAR LOS DOS ÚLTIMOS EMPLEOS)
            </div>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className={`${th} text-center`} style={{ width: "220px" }}>
                    CARGO
                  </td>
                  <td className={`${th} text-center`}>EMPRESA</td>
                </tr>
                {(() => {
                  const rows: { cargo?: string; empresa?: string }[] = data?.experienciaLaboral?.length
                    ? data.experienciaLaboral
                    : (data?.sinExperiencia ? [{ cargo: "SIN EXPERIENCIA", empresa: "" }] : []);
                  const padded: { cargo?: string; empresa?: string }[] = [
                    ...rows,
                    ...Array.from({ length: Math.max(0, 4 - rows.length) }, () => ({ })),
                  ];
                  return padded.slice(0, 4).map((row, idx) => (
                    <tr key={`exp-${idx}`}>
                      <td className={`${tdValue} py-3`}>{val(row.cargo, "")}</td>
                      <td className={`${tdValue} py-3`}>{val(row.empresa, "")}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>

            <div className="border-b-2 border-black p-2 text-[9px] leading-snug">
              NOTA: Certifico que la información aquí suministrada es verdadera y podrá ser verificada en cualquier momento por la Empresa.
              Así mismo estoy dispuesto a brindar un alcance de cualquier aspecto de los datos registrados.
            </div>

            {/* 5. REGISTRO DE HUELLAS DACTILARES */}
            <div className="border-l border-r border-black bg-slate-200 p-1 text-[11px] font-semibold">
              5. REGISTRO DE HUELLAS DACTILARES
            </div>

            <div className="border-l border-r border-black p-2 text-[10px] font-semibold">
              1.- Mano Derecha:
            </div>
            <div className="border-l border-r border-black p-2">
              <div className="grid grid-cols-5 gap-2">
                {["PULGAR", "INDICE", "DEDO MEDIO", "ANULAR", "MENIQUE"].map(label => (
                  <div key={`der-${label}`} className="flex flex-col">
                    <div className="border border-black h-48"></div>
                    <div className="border border-black text-[8px] text-center h-6 flex items-center justify-center leading-tight font-medium">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-l border-r border-black p-2 text-[10px] font-semibold">
              2.- Mano Izquierda:
            </div>
            <div className="border-l border-r border-black p-2">
              <div className="grid grid-cols-5 gap-2">
                {["PULGAR", "INDICE", "DEDO MEDIO", "ANULAR", "MENIQUE"].map(label => (
                  <div key={`izq-${label}`} className="flex flex-col">
                    <div className="border border-black h-48"></div>
                    <div className="border border-black text-[8px] text-center h-6 flex items-center justify-center leading-tight font-medium">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b-2 border-black p-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="border border-black flex-1 flex items-center justify-center p-1" style={{ minHeight: '180px' }}>
                    {signatureSrc ? (
                      <img src={signatureSrc} alt="Firma del trabajador" className="max-h-full max-w-full w-auto h-auto object-contain" />
                    ) : null}
                  </div>
                  <div className="border border-black text-[11px] text-center font-semibold py-1">
                    FIRMA DEL TRABAJADOR
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="border border-black flex-1 flex items-center justify-center p-1" style={{ minHeight: '180px' }}>
                    <img src={firmaempresa} alt="Firma empresa" className="max-h-full max-w-full w-auto h-auto object-contain" />
                  </div>
                  <div className="border border-black text-[11px] text-center font-semibold py-1">
                    FIRMA BIENESTAR SOCIAL
                  </div>
                </div>
              </div>
            </div>

            {/* Espaciador para llenar la página */}
            <div className="flex-1"></div>

            {/* Pie simple (opcional) */}
            <div className="p-2 text-[10px] border-t-2 border-black">
              <span className="text-slate-700">Documento generado electrónicamente.</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PersonalDataSheetTemplate.displayName = "PersonalDataSheetTemplate";



