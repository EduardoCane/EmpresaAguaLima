import React from "react";
import type { Cliente } from "@/types";
import logoAgualima from "@/img/logo_header_1.jpeg";

const LOGO_AGUALIMA_SRC = logoAgualima;

function PdfPage({ children }: { children: React.ReactNode }) {
  return (
    <section
      data-pdf-page
      className="pdf-page bg-white text-black"
      style={{
        width: "100%",
        maxWidth: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        paddingTop: "8mm",
        paddingBottom: "8mm",
        paddingLeft: "10mm",
        paddingRight: "10mm",
        fontFamily: '"Times New Roman", Times, serif',
        boxSizing: "border-box",
        position: "relative",
        boxShadow: "none",
      }}
    >
      {children}
    </section>
  );
}

function HCell({
  children,
  center = false,
  className = "",
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "border border-black px-2 py-2 text-[10px] leading-[12px]",
        center ? "text-center" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SmallCell({
  children,
  center = false,
  className = "",
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "border border-black px-2 py-1 text-[10px] leading-[12px]",
        center ? "text-center" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 font-bold underline text-[10px] leading-[14px]">
      {children}
    </p>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[10px] leading-[14px] text-justify">{children}</p>;
}

function BulletO({ children }: { children: React.ReactNode }) {
  return (
    <li className="mt-1 text-[10px] leading-[14px] text-justify">
      <span className="mr-2">o</span>
      <span>{children}</span>
    </li>
  );
}

const normalize = (value?: string | number | null) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

function formatDate(dateStr?: string, separator = "/"): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (!trimmed) return "";
  if (trimmed.includes("/")) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed.split("-").reverse().join(separator);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}${separator}${month}${separator}${year}`;
}

function buildFullName(client?: Cliente): string {
  if (!client) return "";
  const parts = [
    client.nombre || "",
    client.a_paterno || "",
    client.a_materno || "",
  ].filter(Boolean);
  return parts.join(" ") || "";
}

function buildDni(client?: Cliente): string {
  return client?.dni || "";
}

function formatFullDate(dateValue?: Date | null): string {
  if (!dateValue || Number.isNaN(dateValue.getTime())) return "";
  const today = dateValue;
  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  
  const diaSemana = diasSemana[today.getDay()];
  const dia = today.getDate();
  const mes = meses[today.getMonth()];
  const año = today.getFullYear();
  
  return `${diaSemana}, ${dia} de ${mes} de ${año}`;
}

export function AcuerdoConfidencialidadForm({
  client,
  signatureSrc,
  cargo,
  acuerdoConfidencialidadValues,
}: {
  client?: Cliente;
  signatureSrc?: string;
  cargo?: string;
  acuerdoConfidencialidadValues?: Record<string, unknown> | null;
}) {
  const hasPersistedValues = !!(acuerdoConfidencialidadValues && typeof acuerdoConfidencialidadValues === "object");
  const valuesObj = (acuerdoConfidencialidadValues && typeof acuerdoConfidencialidadValues === "object"
    ? acuerdoConfidencialidadValues
    : {}) as Record<string, unknown>;
  const savedCiudad = normalize(valuesObj.ciudad as string) || "Virú";
  const savedFechaRegistro = normalize(valuesObj.fecha_registro as string);
  const normalizedFechaRegistro = savedFechaRegistro && /^\d{4}-\d{2}-\d{2}$/.test(savedFechaRegistro)
    ? `${savedFechaRegistro}T00:00:00`
    : savedFechaRegistro;
  const parsedSavedDate = normalizedFechaRegistro ? new Date(normalizedFechaRegistro) : null;
  const hasSavedDate = !!(parsedSavedDate && !Number.isNaN(parsedSavedDate.getTime()));
  const fechaLarga = hasSavedDate ? formatFullDate(parsedSavedDate) : (!hasPersistedValues ? formatFullDate(new Date()) : "");
  const fullName = buildFullName(client);
  const dni = buildDni(client);
  const cargoDisplay = cargo || "";

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0" style={{ margin: 0, padding: 0 }}>
      <PdfPage>
      <div className="flex flex-col" style={{ minHeight: "260mm" }}>
        {/* HEADER */}
        <div
          className="grid border border-black"
          style={{ gridTemplateColumns: "140px 1fr 260px" }}
        >
          {/* Logo */}
          <HCell center className="flex items-center justify-center py-3">
            <img
              src={LOGO_AGUALIMA_SRC}
              alt="Logo"
              className="w-[85px] h-auto object-contain"
              draggable={false}
            />
          </HCell>

          {/* Título */}
          <HCell center className="py-5 flex items-center justify-center">
            <p className="font-bold uppercase">ACUERDO DE CONFIDENCIALIDAD</p>
          </HCell>

          {/* Bloque derecho */}
          <div className="border-l border-black flex flex-col items-center justify-center">
            <div className="grid w-full" style={{ gridTemplateRows: "auto auto auto" }}>
              <HCell center className="font-bold uppercase">
                ASUNTOS CORPORATIVOS Y GESTIÓN HUMANA
              </HCell>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <SmallCell center className="font-bold text-center">
                  Código: FO-ACGC-ACGH-27
                </SmallCell>
                <SmallCell center className="font-bold text-center">
                  Versión: 00
                </SmallCell>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <SmallCell center className="font-bold text-center">
                  Fecha: 10/05/2019
                </SmallCell>
                <SmallCell center className="font-bold text-center">
                  Página 1 de 1
                </SmallCell>
              </div>
            </div>
          </div>
        </div>

        {/* CUERPO */}
        <div className="mt-10 px-10 text-[10px] leading-[14px] text-justify">
          <P>
            Por el presente documento el (la) abajo firmante, quien a la fecha de suscripción del
            presente documento se desempeña como Colaborador/Consultor/Proveedor para{" "}
            <span className="font-bold uppercase">AGUALIMA SAC</span>, declara que en virtud al manejo
            de <span className="font-bold uppercase">INFORMACIÓN CONFIDENCIAL</span> de propiedad de{" "}
            <span className="font-bold uppercase">AGUALIMA</span>, asumo voluntariamente las
            siguientes compromisos:
          </P>

          <SectionTitle>1. NO DIVULGAR INFORMACIÓN CONFIDENCIAL</SectionTitle>
          <P>
            El (La) suscrito(a) se compromete en forma irrevocable a lo siguiente:
          </P>
          <ul className="mt-2 pl-4">
            <BulletO>
              No divulgar, revelar o facilitar – bajo cualquier forma (medios físicos, tecnológicos,
              o cualquier otro) – cualquier información confidencial a terceros, ya sean utilizados
              beneficio propio o de terceros, o la información confidencial a que he tenido acceso
              durante el ejercicio de mis funciones.
            </BulletO>
            <BulletO>
              No usar, vender, ceder o transferir Información Confidencial a terceros.
            </BulletO>
            <BulletO>
              No realizar copia alguna de la Información Confidencial a que he tenido acceso, salvo
              que <span className="font-bold uppercase">AGUALIMA</span> lo autorice expresamente por
              escrito.
            </BulletO>
          </ul>

          <SectionTitle>INFORMACIÓN CONFIDENCIAL</SectionTitle>
          <P>
            Comprende toda información o material que cumpla las siguientes características:
          </P>
          <ul className="mt-2 pl-4">
            <BulletO>
              Que sea generada o recopilada por <span className="font-bold uppercase">AGUALIMA</span>,
              incluyendo sedes comerciales, planes estratégicos o información que se refiera
              directamente a los negocios de <span className="font-bold uppercase">AGUALIMA</span>,
              incluyendo todo tipo de bien usado en sus operaciones, o relacionado con los negocios o
              investigación y desarrollo de productos o ajustes y/o procesos.
            </BulletO>
            <BulletO>
              Que resulte de las labores encomendadas durante la vigencia de la relación laboral.
            </BulletO>
            <BulletO>
              Que pueda contener información relacionada con la estrategia corporativa, incluyendo
              Manuales, Políticas, Procedimientos y cualquier otra información vinculada con el
              objeto social de <span className="font-bold uppercase">AGUALIMA</span>.
            </BulletO>
          </ul>

          <SectionTitle>DEVOLUCIÓN DE BIENES</SectionTitle>
          <P>
            A la conclusión de la relación laboral/contractual, devolveré a{" "}
            <span className="font-bold uppercase">AGUALIMA</span> todos los bienes de su propiedad,
            incluyendo copias o muestras de información confidencial que estén bajo mi custodia,
            incluyendo claves, accesos, contraseñas, files con información, estudios de mercado,
            perfiles comerciales y en general, cualquier información a la que hubiera podido tener
            acceso en el ejercicio de mis funciones.
          </P>

          <SectionTitle>CUMPLIMIENTO DE POLÍTICAS DE SEGURIDAD</SectionTitle>
          <P>
            El (La) suscrito(a) se compromete a cumplir con todas las políticas, normas y procedimientos
            relacionados a la Seguridad de la Información, aprobadas y publicadas por{" "}
            <span className="font-bold uppercase">AGUALIMA</span>; reconociendo que su incumplimiento
            constituye falta grave de orden laboral, dándose lugar a la imposición de sanciones de
            acuerdo a la gravedad de la falta y a la intencionalidad de la misma, dichas sanciones irán
            desde la simple amonestación hasta el despido, sin perjuicio de las acciones civiles o
            penales a que haya lugar.
          </P>

          <SectionTitle>VIGENCIA DEL ACUERDO</SectionTitle>
          <P>
            La vigencia del presente acuerdo se extenderá hasta por (2) dos años adicionales contados
            desde la conclusión de la relación laboral/contractual con{" "}
            <span className="font-bold uppercase">AGUALIMA</span>, sosteniéndose las consecuencias
            civiles y penales que pueda generar el incumplimiento del presente documento.
          </P>

          {/* DATOS */}
          <div className="mt-8 space-y-3">
            <div className="flex items-baseline gap-6">
              <span className="font-bold w-[140px]">Nombres y Apellidos:</span>
              <span className="font-bold">{fullName}</span>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="font-bold w-[140px]">DNI:</span>
              <span className="font-bold">{dni}</span>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="font-bold w-[140px]">Cargo:</span>
              <span className="font-bold">{cargoDisplay}</span>
            </div>
          </div>

          <p className="mt-6 text-[10px]">
            Firmado en la ciudad de {savedCiudad}, <span className="font-bold capitalize">{fechaLarga}</span>
          </p>
        </div>

        {/* FIRMA */}
        <div className="mt-20 px-10 pb-10">
          <div className="flex gap-6 items-start">
            <span className="font-bold text-[10px] min-w-fit pt-1">Firma:</span>
            <div className="flex flex-col">
              <div className="relative" style={{ width: "200px", height: "40px" }}>
                {signatureSrc && (
                  <img
                    src={signatureSrc}
                    alt="Firma"
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      left: "0",
                      height: "36px",
                      maxWidth: "200px",
                      objectFit: "contain",
                    }}
                    draggable={false}
                  />
                )}
              </div>
              <div className="border-b border-black" style={{ width: "200px" }} />
            </div>
          </div>
        </div>
      </div>
    </PdfPage>
    </div>
  );
}
