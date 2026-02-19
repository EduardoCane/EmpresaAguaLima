import React from "react";
import { Cliente } from "@/types";
import { FichaDatosValues } from "./FichaDatosForm";


function PdfPage({
  headerLeft,
  headerRight,
  children,
  pdfMode = false,
}: {
  headerLeft?: string;
  headerRight?: string;
  children: React.ReactNode;
  pdfMode?: boolean;
}) {
  return (
    <section
      className="pdf-page mx-auto bg-white text-black shadow-sm print:shadow-none"
      data-pdf-page={pdfMode ? "1" : undefined}
      style={{
        width: "100%",
        maxWidth: "210mm",
        height: pdfMode ? "297mm" : "auto",
        minHeight: "297mm",
        paddingTop: "6mm",
        paddingBottom: "6mm",
        paddingLeft: "8mm",
        paddingRight: "8mm",
        fontFamily: '"Times New Roman", Times, serif',
        overflow: pdfMode ? "hidden" : "visible",
      }}
    >
      <div className="flex items-start justify-between text-[10px] leading-[12px]">
        <div className="italic">{headerLeft ?? ""}</div>
        <div className="font-bold">{headerRight ?? ""}</div>
      </div>
      <div className="mt-2 text-[9.5px] leading-[12px]">{children}</div>
    </section>
  );
}

function Box({
  size = 18,
  checked = false,
  onClick,
}: {
  size?: number;
  checked?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`border border-black flex items-center justify-center cursor-pointer select-none ${
        checked ? "bg-black text-white" : "bg-white"
      }`}
      style={{ width: size, height: size }}
    >
      {checked && <span className="text-[10px] leading-none font-bold">✓</span>}
    </div>
  );
}

function Cell({
  children,
  className = "",
  gray = false,
  center = false,
}: {
  children?: React.ReactNode;
  className?: string;
  gray?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={[
        "sp-cell border border-black px-1 py-0.5 text-[9px] leading-[10px]",
        gray ? "bg-zinc-200" : "bg-white",
        center ? "text-center sp-center" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CellSmall({ children, gray = false, center = false }: { children?: React.ReactNode; gray?: boolean; center?: boolean }) {
  return (
    <div
      className={[
        "sp-cell-small border border-black px-1 py-[2px] text-[10px] leading-[12px]",
        gray ? "bg-zinc-200" : "bg-white",
        center ? "text-center sp-center" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

interface SistemaPensionarioFormProps {
  client?: Cliente | null;
  ficha?: FichaDatosValues;
  sistemaPensionarioValues?: Record<string, unknown> | null;
  signatureSrc?: string;
  pensionChoice: 'ONP' | 'AFP' | '';
  onChangeChoice: (choice: 'ONP' | 'AFP') => void;
  pdfMode?: boolean;
}

export function SistemaPensionarioForm({
  client,
  ficha,
  sistemaPensionarioValues,
  signatureSrc,
  pensionChoice,
  onChangeChoice,
  pdfMode = false,
}: SistemaPensionarioFormProps) {
  const codigo = (client?.cod || '').trim();
  const hasPersistedValues = !!(sistemaPensionarioValues && typeof sistemaPensionarioValues === "object");
  const fichaWithDepartamento = ficha as (FichaDatosValues & { departamentoDomicilio?: string | null }) | undefined;
  const valuesObj = (sistemaPensionarioValues && typeof sistemaPensionarioValues === "object"
    ? sistemaPensionarioValues
    : {}) as Record<string, unknown>;

  const normalize = (value?: string | number | null) => {
    if (value === null || value === undefined) return "";
    const str = String(value).trim();
    return str;
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const v = value.trim();
    if (!v) return "";
    if (v.includes("/")) return v;
    
    // Si viene en formato YYYY-MM-DD, parsear directamente sin Date
    if (v.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = v.split("-");
      return `${day}/${month}/${year}`;
    }
    
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
  };

  const apellidoPaterno = normalize(client?.a_paterno) || "";
  const apellidoMaterno = normalize(client?.a_materno) || "";
  const nombres =
    normalize(client?.nombre) || normalize(client?.apellidos_y_nombres);
  const dni = normalize(client?.dni);
  const fechaNacimiento = formatDate(ficha?.fechaNacimiento);
  const sexo = normalize(client?.sexo) || "";
  const sexMarkF = sexo.toUpperCase() === "F" ? "X" : "";
  const sexMarkM = sexo.toUpperCase() === "M" ? "X" : "";

  const domicilio = normalize(ficha?.domicilioActual);
  const distrito = normalize(ficha?.distritoDomicilio);
  const provincia = normalize(ficha?.provinciaDomicilio);
  const departamento = (
    normalize(fichaWithDepartamento?.departamentoDomicilio) ||
    normalize(valuesObj.departamento_domicilio as string) ||
    normalize(valuesObj.departamentoDomicilio as string) ||
    normalize(valuesObj.departamento as string) ||
    normalize(client?.departamento) ||
    normalize(ficha?.departamentoNacimiento)
  );

  const fechaInicio = formatDate(ficha?.periodoDesde);
  const remuneracion = normalize(ficha?.remuneracion) || "";
  const savedCiudad = normalize(valuesObj.ciudad as string) || "Virú";
  const savedFechaRegistro = normalize(valuesObj.fecha_registro as string);
  const normalizedFechaRegistro = savedFechaRegistro && /^\d{4}-\d{2}-\d{2}$/.test(savedFechaRegistro)
    ? `${savedFechaRegistro}T00:00:00`
    : savedFechaRegistro;
  const parsedSavedDate = normalizedFechaRegistro ? new Date(normalizedFechaRegistro) : null;
  const hasSavedDate = !!(parsedSavedDate && !Number.isNaN(parsedSavedDate.getTime()));
  const hoy = hasSavedDate
    ? (() => {
        const s = parsedSavedDate.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        return s.charAt(0).toUpperCase() + s.slice(1);
      })()
    : !hasPersistedValues
      ? (() => {
          const s = new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          return s.charAt(0).toUpperCase() + s.slice(1);
        })()
      : "";

  return (
    <PdfPage headerRight={codigo} pdfMode={pdfMode}>
      {pdfMode ? (
        <style>{`
          [data-pdf-fix-lines="true"] .sp-cell {
            display: flex;
            align-items: center;
            min-height: 19px;
            padding-top: 4px;
            padding-bottom: 4px;
            line-height: 13px;
          }
          [data-pdf-fix-lines="true"] .sp-cell-small {
            display: flex;
            align-items: center;
            min-height: 17px;
            padding-top: 4px;
            padding-bottom: 4px;
          }
          [data-pdf-fix-lines="true"] .sp-center {
            justify-content: center;
          }
          [data-pdf-fix-lines="true"] .sp-title {
            border-bottom: 0 !important;
            padding-bottom: 0 !important;
            line-height: 16px;
            margin: 0;
            position: relative;
            top: 1px;
          }
          [data-pdf-fix-lines="true"] .sp-section {
            display: flex;
            align-items: center;
            min-height: 24px;
            padding-top: 5px;
            padding-bottom: 5px;
          }
          [data-pdf-fix-lines="true"] .sp-inline-title {
            display: flex;
            align-items: center;
            min-height: 24px;
            line-height: 15px;
          }
          [data-pdf-fix-lines="true"] .sp-section > p,
          [data-pdf-fix-lines="true"] .sp-inline-title > p {
            margin: 0;
            line-height: 15px;
            position: relative;
            top: 1px;
          }
        `}</style>
      ) : null}
      <div className="border border-black" data-pdf-fix-lines={pdfMode ? "true" : undefined}>
        <div className="border-b border-black py-1 text-center">
          <p className="sp-title font-bold uppercase text-[11px]">
            FORMATO DE ELECCIÓN DEL SISTEMA PENSIONARIO
          </p>
        </div>

        <div className="sp-section border-b border-black px-2 py-0.5">
          <p className="font-bold uppercase text-[9px]">I. DATOS DEL TRABAJADOR</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "260px 1fr" }}>
          <Cell className="font-bold">1 APELLIDO PATERNO:</Cell>
          <Cell className="font-bold">{apellidoPaterno || ""}</Cell>

          <Cell className="font-bold">2 APELLIDO MATERNO:</Cell>
          <Cell className="font-bold">{apellidoMaterno || ""}</Cell>

          <Cell className="font-bold">3 NOMBRES:</Cell>
          <Cell className="font-bold">{nombres || ""}</Cell>

          <Cell className="font-bold">4 TIPO DE DOCUMENTO:</Cell>
          <div className="border border-black p-0">
            <div className="grid" style={{ gridTemplateColumns: "60px 1fr 1fr" }}>
              <CellSmall center>DNI</CellSmall>
              <CellSmall>{dni || ""}</CellSmall>
              <CellSmall gray />
            </div>

            <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
              <CellSmall>Carné de extranjería</CellSmall>
              <CellSmall>Pasaporte</CellSmall>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "120px 1fr" }}>
              <CellSmall>Otro</CellSmall>
              <CellSmall>N°</CellSmall>
            </div>
          </div>

          <Cell className="font-bold">5 SEXO</Cell>
          <div className="border border-black p-0">
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <CellSmall center>F</CellSmall>
              <CellSmall center>{sexMarkF}</CellSmall>
              <CellSmall center>M</CellSmall>
              <CellSmall center>{sexMarkM}</CellSmall>
            </div>
          </div>

          <Cell className="font-bold">6 FECHA DE NACIMIENTO</Cell>
          <Cell center className="font-bold">
            {fechaNacimiento || ""}
          </Cell>

          <Cell className="font-bold">7 DOMICILIO</Cell>
          <div className="border border-black p-0">
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <CellSmall center>Avenida</CellSmall>
              <CellSmall center>Calle</CellSmall>
              <CellSmall>Otros:</CellSmall>
            </div>

            <CellSmall>{domicilio || ""}</CellSmall>

            <div className="grid" style={{ gridTemplateColumns: "100px 1fr" }}>
              <CellSmall>Distrito</CellSmall>
              <CellSmall>{distrito || ""}</CellSmall>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "100px 1fr" }}>
              <CellSmall>Provincia</CellSmall>
              <CellSmall>{provincia || ""}</CellSmall>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "100px 1fr" }}>
              <CellSmall>Departamento</CellSmall>
              <CellSmall>{departamento || ""}</CellSmall>
            </div>
          </div>

          <div className="sp-inline-title col-span-2 border border-black px-2 py-0.5 text-[9px] font-bold">
            Presentación de las jefaturas y ambiente de trabajo.
          </div>

          <Cell className="font-bold">1 NOMBRE O RAZÓN SOCIAL:</Cell>
          <Cell className="font-bold">AGUALIMA S.A.C.</Cell>

          <Cell className="font-bold">2 N° DE RUC:</Cell>
          <Cell className="font-bold">20512217452</Cell>

          <Cell className="font-bold">3 DEPARTAMENTO DEL DOMICILIO FISCAL:</Cell>
          <Cell className="font-bold">LIMA</Cell>
        </div>

        <div className="sp-section border-t border-black border-b border-black px-2 py-0.5">
          <p className="font-bold uppercase text-[9px]">III. DATOS DEL VÍNCULO LABORAL</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "260px 1fr" }}>
          <Cell className="font-bold">
            1 FECHA DE INICIO DE LA RELACIÓN<br />LABORAL:
          </Cell>
          <Cell center className="font-bold">
            {fechaInicio || ""}
          </Cell>

          <Cell className="font-bold">2 REMUNERACIÓN:</Cell>
          <Cell className="font-bold">{remuneracion}</Cell>
        </div>

        <div className="border-t border-black px-2 py-1 text-center">
          <p className="sp-title font-bold uppercase text-[10px]">
            IV. ELECCIÓN DEL SISTEMA PENSIONARIO
          </p>
        </div>

        <div className="px-2 py-1">
          <div className="grid grid-cols-2 gap-4 items-center mb-2">
            <div className="flex items-center justify-start gap-4">
              <p className="text-[10px] font-bold uppercase">
                1 SISTEMA NACIONAL DE PENSIONES (ONP)
              </p>
              <Box checked={pensionChoice === 'ONP'} onClick={() => onChangeChoice('ONP')} />
            </div>

            <div className="flex items-center justify-end gap-4">
              <p className="text-[10px] font-bold uppercase">
                2 SISTEMA PRIVADO DE PENSIONES (AFP)
              </p>
              <Box checked={pensionChoice === 'AFP'} onClick={() => onChangeChoice('AFP')} />
            </div>
          </div>

          <div className="grid grid-cols-3 items-end gap-1">
            <div className="text-left text-[10px] font-bold">Firma del trabajador</div>
            <div className="text-center">
              <div
                className="relative mx-auto mb-0.5"
                style={{ width: "60mm", height: "14mm" }}
              >
                {signatureSrc ? (
                  <img
                    src={signatureSrc}
                    alt="Firma del trabajador"
                    className="absolute inset-0 mx-auto h-full w-full object-contain"
                    style={{ top: "-2mm" }}
                  />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 h-px bg-black" />
              </div>
              <p className="text-[9px] font-bold">{hoy}</p>
            </div>
            <div />
          </div>

          <div className="mt-1 flex justify-start">
            <p className="text-[8px] font-bold">Ciudad de {savedCiudad}</p>
          </div>
        </div>
      </div>

      <p className="mt-0.5 text-[7px]">Base legal: R. M. 112 - 2013 - TR</p>
    </PdfPage>
  );
}

export default SistemaPensionarioForm;

