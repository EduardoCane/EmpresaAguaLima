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

function LabelRow({
  label,
  value,
  underline = false,
}: {
  label: string;
  value: string;
  underline?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-6">
      <span className="font-bold w-[140px]">{label}</span>
      {underline ? (
        <span className="inline-flex items-baseline gap-2">
          <span className="font-bold">{value}</span>
          <span className="inline-block w-[160px] border-b border-black translate-y-[-1px]" />
        </span>
      ) : (
        <span className="font-bold">{value}</span>
      )}
    </div>
  );
}

const normalize = (value?: string | number | null) => {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  return str;
};

const buildFullName = (client?: Cliente | null) => {
  const apellidosNombres = normalize(client?.apellidos_y_nombres);
  if (apellidosNombres) return apellidosNombres;

  const composed =
    [normalize(client?.a_paterno ?? client?.apellido), normalize(client?.a_materno), normalize(client?.nombre ?? client?.nombre)]
      .filter(Boolean)
      .join(" ");

  return composed || "#N/D";
};

const buildDni = (client?: Cliente | null) => {
  return normalize(client?.dni) || "#N/D";
};

const formatDate = (value?: string) => {
  if (!value) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${now.getFullYear()}`;
  }

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.includes("/") || trimmed.includes(".")) {
    const parts = trimmed.split(/[/.]/);
    if (parts.length >= 3) {
      const day = String(parts[0]).padStart(2, "0");
      const month = String(parts[1]).padStart(2, "0");
      const year = String(parts[2]).slice(0, 4);
      return `${day}/${month}/${year}`;
    }
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${parsed.getFullYear()}`;
};

export function DeclaracionConflictoInteresesForm({
  client,
  fecha,
  declaracionConflictoValues,
  signatureSrc,
}: {
  client?: Cliente | null;
  fecha?: string;
  declaracionConflictoValues?: Record<string, unknown> | null;
  signatureSrc?: string;
}) {
  const hasPersistedValues = !!(declaracionConflictoValues && typeof declaracionConflictoValues === "object");
  const valuesObj = (declaracionConflictoValues && typeof declaracionConflictoValues === "object"
    ? declaracionConflictoValues
    : {}) as Record<string, unknown>;
  const savedFechaRegistro = normalize(valuesObj.fecha_registro as string);
  const normalizedFechaRegistro = savedFechaRegistro && /^\d{4}-\d{2}-\d{2}$/.test(savedFechaRegistro)
    ? `${savedFechaRegistro}T00:00:00`
    : savedFechaRegistro;
  const parsedSavedDate = normalizedFechaRegistro ? new Date(normalizedFechaRegistro) : null;
  const hasSavedDate = !!(parsedSavedDate && !Number.isNaN(parsedSavedDate.getTime()));

  const fullName = buildFullName(client);
  const dni = buildDni(client);
  const fechaSlash = hasSavedDate ? formatDate(normalizedFechaRegistro) : (!hasPersistedValues ? formatDate(fecha) : "");

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
              <p className="font-bold uppercase text-center">DECLARACIÓN DE CONFLICTO DE INTERESES</p>
            </HCell>

            {/* Bloque derecho */}
            <div className="border-l border-black flex flex-col items-center justify-center">
              <div className="grid w-full" style={{ gridTemplateRows: "auto auto auto" }}>
                <HCell center className="font-bold uppercase text-center">
                  ASUNTOS CORPORATIVOS Y GESTIÓN HUMANA
                </HCell>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <SmallCell center className="font-bold text-center">
                    Código: FO-ACGC-ACGH-31
                  </SmallCell>
                  <SmallCell center className="font-bold text-center">
                    Versión: 00
                  </SmallCell>
                </div>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <SmallCell center className="font-bold">
                    Fecha: 10/05/2019
                  </SmallCell>
                  <SmallCell center className="font-bold">
                    Página 1 de 1
                  </SmallCell>
                </div>
              </div>
            </div>
          </div>

          {/* CUERPO */}
          <div className="mt-12 px-10 text-[10px] leading-[15px] text-justify">
            <p>
              Mediante el presente documento dejo expresa constancia que he tomado conocimiento que las
              actividades que pueden generar conflicto de intereses son aquellas en las que el juicio
              profesional se ve afectado por un interés personal, de esta manera se pueden presentar
              circunstancias que puedan afectar la objetividad o independencia en el desarrollo de las
              funciones, de esta manera cuando se presente un conflicto de interés este debe ser puesto
              en conocimiento de la jefatura inmediata o gerencia para que se evalúe el nivel de riesgo
              que puede representar.
            </p>

            <p className="mt-4">
              Igualmente, entiendo que tendré acceso a información confidencial, por lo cual{" "}
              <span className="font-bold uppercase">NO</span> podré:
            </p>

            <ul className="mt-4 space-y-3 pl-4">
              <li>
                - Extraer información física o digital sin la autorización correspondiente.
              </li>
              <li>
                - Hacer uso de la información a la que tenga acceso (como divulgación de resultados
                previo a su publicación, divulgación de proyectos o planes estratégicos) para beneficio
                personal, darla a conocer o ponerla en disposición del beneficio de cualquier otra
                persona y organización.
              </li>
            </ul>

            <p className="mt-6">
              En atención a lo expuesto, reconozco que la omisión o incumplimiento de lo antes
              mencionado constituye falta grave conforme a lo establecido en el Reglamento Interno de
              Trabajo (RIT), por lo cual asumo las consecuencias que se deriven de su incumplimiento.
            </p>

            {/* DATOS */}
            <div className="mt-10 space-y-5">
              <LabelRow label="Nombres y Apellidos:" value={fullName} />
              <LabelRow label="DNI:" value={dni} />
              <div className="flex items-baseline gap-6">
                <span className="font-bold w-[140px]">Fecha:</span>
                <span>{fechaSlash}</span>
              </div>
            </div>
          </div>

          {/* FIRMA (al fondo) */}
          <div className="mt-20 pb-10">
            <div className="flex flex-col items-center">
              <div className="relative w-[220px] h-[40px]">
                {signatureSrc ? (
                  <img
                    src={signatureSrc}
                    alt="Firma del trabajador"
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      height: "36px",
                      maxWidth: "180px",
                      objectFit: "contain",
                    }}
                  />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 h-px bg-black" />
              </div>
              <p className="mt-2 font-bold text-[10px]">FIRMA Y HUELLA</p>
            </div>
          </div>
        </div>
      </PdfPage>
    </div>
  );
}

