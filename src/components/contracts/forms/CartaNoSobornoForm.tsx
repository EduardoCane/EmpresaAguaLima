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

function FieldRow({
  label,
  value,
  labelW = 140,
}: {
  label: string;
  value: string;
  labelW?: number;
}) {
  return (
    <div className="flex items-baseline gap-6">
      <span className="font-bold text-[10px]" style={{ width: labelW }}>
        {label}
      </span>
      <span className="font-bold text-[10px]">{value}</span>
    </div>
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
  if (!client) return "#N/D";
  const parts = [
    client.nombre || "",
    client.a_paterno || "",
    client.a_materno || "",
  ].filter(Boolean);
  return parts.join(" ") || "#N/D";
}

function buildDni(client?: Cliente): string {
  return client?.dni || "#N/D";
}

export function CartaNoSobornoForm({
  client,
  signatureSrc,
  cargo,
  unidadArea,
  cartaNoSobornoValues,
}: {
  client?: Cliente;
  signatureSrc?: string;
  cargo?: string;
  unidadArea?: string;
  cartaNoSobornoValues?: Record<string, unknown> | null;
}) {
  const hasPersistedValues = !!(cartaNoSobornoValues && typeof cartaNoSobornoValues === "object");
  const valuesObj = (cartaNoSobornoValues && typeof cartaNoSobornoValues === "object"
    ? cartaNoSobornoValues
    : {}) as Record<string, unknown>;
  const savedFechaRegistro = normalize(valuesObj.fecha_registro as string);
  const normalizedFechaRegistro = savedFechaRegistro && /^\d{4}-\d{2}-\d{2}$/.test(savedFechaRegistro)
    ? `${savedFechaRegistro}T00:00:00`
    : savedFechaRegistro;
  const parsedSavedDate = normalizedFechaRegistro ? new Date(normalizedFechaRegistro) : null;
  const hasSavedDate = !!(parsedSavedDate && !Number.isNaN(parsedSavedDate.getTime()));
  const fechaSlash = hasSavedDate ? formatDate(normalizedFechaRegistro, "/") : (!hasPersistedValues ? formatDate(new Date().toISOString().slice(0, 10), "/") : "");
  const fullName = buildFullName(client);
  const dni = buildDni(client);
  const cargoDisplay = cargo || "#N/D";
  const unidadAreaDisplay = unidadArea || "#N/D";

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0" style={{ margin: 0, padding: 0 }}>
      <PdfPage>
        <div className="flex flex-col" style={{ minHeight: "260mm" }}>
        {/* HEADER */}
        <div
          className="grid border border-black"
          style={{ gridTemplateColumns: "140px 1fr 240px" }}
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
            <p className="font-bold uppercase text-[10px] leading-[13px]">
              CARTA DE COMPROMISO DE NO
              <br />
              OFRECIMIENTO DE SOBORNOS A
              <br />
              FUNCIONARIOS PÚBLICOS
            </p>
          </HCell>

          {/* Bloque derecho */}
          <div className="border-l border-black flex flex-col items-center justify-center">
            <div className="grid w-full" style={{ gridTemplateRows: "auto auto auto" }}>
              <HCell center className="font-bold uppercase">
                ASUNTOS CORPORATIVOS Y GESTIÓN HUMANA
              </HCell>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <SmallCell center className="font-bold text-center">
                  Código: FO-ACGC-ACGH-29
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
        <div className="mt-16 px-10 text-[10px] leading-[1.5] text-justify">
          <p>
            Por medio del presente documento, dejo constancia que he entendido que debido a la
            naturaleza de la empresa si existen relaciones con funcionarios públicos por actividades
            necesarias para el normal desarrollo de las operaciones, las cuales se deben desarrollar
            en el marco de las normas de la empresa, así mismo se conoce que está completamente
            prohibido pagar, ofrecer sobornos de ninguna manera, ya sea directa o indirectamente a
            funcionarios públicos.
          </p>

          {/* Datos */}
          <div className="mt-14 space-y-4">
            <FieldRow label="Apellidos y Nombres:" value={fullName} />
            <FieldRow label="Cargo:" value={cargoDisplay} />
            <FieldRow label="Gerencia / Área:" value={unidadAreaDisplay} />
            <FieldRow label="Número de DNI:" value={dni} />
            <div className="flex items-baseline gap-6">
              <span className="font-bold text-[10px]" style={{ width: 140 }}>
                Fecha:
              </span>
              <span className="font-bold text-[10px]">{fechaSlash}</span>
            </div>
          </div>
        </div>

        {/* FIRMA */}
        <div className="mt-8 px-10 pb-12">
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
