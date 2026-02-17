/* =========================================================
   2 PÁGINAS DE REGLAMENTOS
   - Página 1: Reglamento Interno + Ética y Conducta
   - Página 2: Higiene + Política Salarial
   ========================================================= */

import React from "react";
import type { Cliente } from "@/types";
import logoAgualima from "@/img/logo_header_1.jpeg";

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

const buildCodigo = (client?: Cliente | null) => {
  return normalize(client?.cod) || "";
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
  if (trimmed.includes("/")) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${parsed.getFullYear()}`;
};

function PdfPage({ children, pageBreak = false }: { children: React.ReactNode; pageBreak?: boolean }) {
  return (
    <section
      data-pdf-page
      className="pdf-page bg-white text-black"
      style={{
        width: "100%",
        maxWidth: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        paddingTop: "10mm",
        paddingBottom: "10mm",
        paddingLeft: "10mm",
        paddingRight: "10mm",
        fontFamily: '"Times New Roman", Times, serif',
        boxSizing: "border-box",
        position: "relative",
        boxShadow: "none",
      }}
    >
      {children}
      <style>{`
        @media print {
          .pdf-page {
            page-break-after: ${pageBreak ? "always" : "auto"};
            page-break-inside: avoid;
            box-shadow: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function LogoAgualimaSmall() {
  return (
    <img
      src={logoAgualima}
      alt="Logo Agualima"
      className="w-[56px] h-auto object-contain"
      draggable={false}
    />
  );
}

function DatosYFirmaInline({
  apellidosNombres = "#N/D",
  codigo = "#N/D",
  fecha = formatDate(),
  signatureSrc,
}: {
  apellidosNombres?: string;
  codigo?: string;
  fecha?: string;
  signatureSrc?: string;
}) {
  return (
    <>
      {/* Datos */}
      <div className="mt-4 mx-auto" style={{ width: "150mm" }}>
        <div className="grid grid-cols-[180px_1fr] gap-x-6 gap-y-1 text-[13px] leading-[15px]">
          <div style={{ fontWeight: 700 }}>Apellidos y Nombres:</div>
          <div style={{ fontWeight: 600 }}>{apellidosNombres}</div>

          <div style={{ fontWeight: 700 }}>Código:</div>
          <div style={{ fontWeight: 600 }}>{codigo}</div>

          <div style={{ fontWeight: 700 }}>Fecha:</div>
          <div style={{ fontWeight: 600 }}>{fecha}</div>
        </div>
      </div>

      {/* Firma (debajo de los datos) */}
      <div className="mt-6 mx-auto flex items-center justify-between gap-6" style={{ width: "170mm" }}>
        <div className="flex items-center gap-3 flex-1">
          <span className="text-[14px]" style={{ fontWeight: 700 }}>Firma:</span>
          <div className="relative flex-1 h-[50px]">
            {signatureSrc ? (
              <img
                src={signatureSrc}
                alt="Firma del trabajador"
                style={{
                  position: "absolute",
                  bottom: "2px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  height: "46px",
                  maxWidth: "200px",
                  objectFit: "contain",
                }}
              />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 h-px bg-black" />
          </div>
        </div>
        <div className="w-[120px] h-[90px] border border-black" />
      </div>
    </>
  );
}

function DeclaracionBlock({
  titleLines,
  paragraphs,
  apellidosNombres = "#N/D",
  codigo = "#N/D",
  fecha = formatDate(),
  signatureSrc,
}: {
  titleLines: string[];
  paragraphs: React.ReactNode[];
  apellidosNombres?: string;
  codigo?: string;
  fecha?: string;
  signatureSrc?: string;
}) {
  return (
    <div className="px-4">
      <style>{`
        @media print {
          .px-4 {
            page-break-inside: avoid;
          }
        }
      `}</style>
      {/* Header del bloque */}
      <div className="flex items-start gap-1">
        <div className="pt-1">
          <LogoAgualimaSmall />
        </div>
        <div className="flex-1 text-center">
          {titleLines.map((t, i) => (
            <p
              key={i}
              className="uppercase text-[12px] leading-[15px] tracking-[0.5px]"
              style={{ fontWeight: 800 }}
            >
              {t}
            </p>
          ))}
        </div>
        <div className="w-[56px]" />
      </div>

      {/* Texto */}
      <div className="mt-5 mx-auto text-[11.5px] leading-[17px] text-justify tracking-[0.4px]" style={{ width: "160mm" }}>
        <div className="space-y-4">
          {paragraphs.map((p, idx) => (
            <div key={idx}>{p}</div>
          ))}
        </div>
      </div>

      {/* Datos + Firma (juntos) */}
      <DatosYFirmaInline
        apellidosNombres={apellidosNombres}
        codigo={codigo}
        fecha={fecha}
        signatureSrc={signatureSrc}
      />
    </div>
  );
}

function DeclaracionesEnUnaPagina({
  apellidosNombres = "#N/D",
  codigo = "#N/D",
  fecha = formatDate(),
  signatureSrc,
}: {
  apellidosNombres?: string;
  codigo?: string;
  fecha?: string;
  signatureSrc?: string;
}) {
  return (
    <PdfPage pageBreak={true}>
      {/* Contenedor full página */}
      <div className="flex flex-col">
        {/* BLOQUE 1 */}
        <DeclaracionBlock
          titleLines={[
            "DECLARACIÓN DE RECEPCIÓN DE REGLAMENTO INTERNO DE TRABAJO Y REGLAMENTO DE SEGURIDAD Y SALUD EN EL TRABAJO",
          ]}
          paragraphs={[
            <p key="p1">
              Declaro que he recibido, leído y entiendo el{" "}
              <span className="font-bold uppercase">
                REGLAMENTO INTERNO DE TRABAJO
              </span>{" "}
              y el{" "}
              <span className="font-bold uppercase">
                REGLAMENTO DE SEGURIDAD Y SALUD EN EL TRABAJO
              </span>{" "}
              vigente y exigible en{" "}
              <span className="font-bold uppercase">AGUALIMA S.A.C.</span> y que
              comprendo las posibles consecuencias que me podría acarrear el
              incumplimiento de sus normas.
            </p>,
            <p key="p2">
              Por consiguiente, acepto libre, espontánea e irrevocablemente
              comportarme y realizar mi trabajo de acuerdo a los citados
              Reglamentos.
            </p>,
          ]}
          apellidosNombres={apellidosNombres}
          codigo={codigo}
          fecha={fecha}
          signatureSrc={signatureSrc}
        />

        {/* Separación entre bloques */}
        <div className="h-10" />

        {/* BLOQUE 2 */}
        <DeclaracionBlock
          titleLines={[
            "DECLARACIÓN DE RECEPCIÓN DEL CODIGO DE ÉTICA Y CONDUCTA, MANUAL DE PREVENCIÓN DE CORRUPCIÓN Y SOBORNO; Y CÓDIGO DE COMERCIO ÉTICO Y POLÍTICA DE DERECHOS HUMANOS DE AGUALIMA S.A.C.",
          ]}
          paragraphs={[
            <p key="p3">
              Declaro que he recibido, leído y entendido el Código de Ética y
              Conducta, Manual de Prevención de corrupción y Soborno y Código de
              Comercio Ético y Política de Derechos Humanos, exigible en{" "}
              <span className="font-bold uppercase">AGUALIMA S.A.C</span> y que
              comprendo las posibles consecuencias que me podría acarrear el
              incumplimiento de sus normas.
            </p>,
            <p key="p4">
              Por consiguiente, acepto libre, espontánea e irrevocablemente
              comportarme y realizar mi trabajo en{" "}
              <span className="font-bold uppercase">AGUALIMA S.A.C.</span> de
              acuerdo a los citado reglamentos.
            </p>,
          ]}
          apellidosNombres={apellidosNombres}
          codigo={codigo}
          fecha={fecha}
          signatureSrc={signatureSrc}
        />
      </div>
    </PdfPage>
  );
}

function HigieneYPoliticaPagina({
  apellidosNombres = "#N/D",
  codigo = "#N/D",
  fecha = formatDate(),
  signatureSrc,
}: {
  apellidosNombres?: string;
  codigo?: string;
  fecha?: string;
  signatureSrc?: string;
}) {
  return (
    <PdfPage pageBreak={false}>
      <div className="flex flex-col">
        {/* BLOQUE 1: HIGIENE */}
        <DeclaracionBlock
          titleLines={[
            "DECLARACIÓN DE RECEPCIÓN DE REGLAMENTO DE HIGIENE PARA",
            "TRABAJADORES Y VISITANTES",
          ]}
          paragraphs={[
            <p key="p1">
              Declaro que he recibido, leído y entiendo el{" "}
              <span className="font-bold uppercase">
                REGLAMENTO DE HIGIENE PARA TRABAJADORES Y VISITANTES
              </span>{" "}
              vigente y exigible en{" "}
              <span className="font-bold uppercase">AGUALIMA S.A.C.</span> y que comprendo las
              posibles consecuencias que me podría acarrear el incumplimiento de sus normas.
            </p>,
            <p key="p2">
              Por consiguiente, acepto libre, espontánea e irrevocablemente comportarme y realizar mi
              trabajo en <span className="font-bold uppercase">AGUALIMA S.A.C.</span> de acuerdo al
              citado reglamento.
            </p>,
          ]}
          apellidosNombres={apellidosNombres}
          codigo={codigo}
          fecha={fecha}
          signatureSrc={signatureSrc}
        />

        {/* Separación entre bloques */}
        <div className="h-10" />

        {/* BLOQUE 2: POLÍTICA SALARIAL */}
        <DeclaracionBlock
          titleLines={[
            "DECLARACIÓN DE RECEPCIÓN DE POLÍTICA SALARIAL, VALORIZACIÓN DE PUESTOS Y CUADRO DE CATEGORÍAS Y FUNCIONES",
          ]}
          paragraphs={[
            <p key="p3">
              Declaro haber recibido, leído y entendido la{" "}
              <span className="font-bold uppercase">
                POLÍTICA SALARIAL, VALORIZACIÓN DE PUESTOS Y CUADRO DE CATEGORÍAS Y FUNCIONES
              </span>{" "}
              de <span className="font-bold uppercase">AGUALIMA S.A.C.</span>
            </p>,
            <p key="p4">
              comprometiéndome a aceptar todas las disposiciones contenidas en ellas.
            </p>,
          ]}
          apellidosNombres={apellidosNombres}
          codigo={codigo}
          fecha={fecha}
          signatureSrc={signatureSrc}
        />
      </div>
    </PdfPage>
  );
}

interface ReglamentosFormProps {
  client?: Cliente | null;
  fecha?: string;
  signatureSrc?: string;
  pagePart?: 1 | 2 | "all";
}

export function ReglamentosForm({ client, fecha, signatureSrc, pagePart = "all" }: ReglamentosFormProps) {
  const apellidosNombres = buildFullName(client);
  const codigo = buildCodigo(client);
  const fechaValue = formatDate(fecha);

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0" style={{ margin: 0, padding: 0 }}>
      {/* PÁGINA 1: Reglamento Interno + Ética y Conducta */}
      {(pagePart === 1 || pagePart === "all") && (
        <DeclaracionesEnUnaPagina
          apellidosNombres={apellidosNombres}
          codigo={codigo}
          fecha={fechaValue}
          signatureSrc={signatureSrc}
        />
      )}
      
      {/* PÁGINA 2: Higiene + Política Salarial */}
      {(pagePart === 2 || pagePart === "all") && (
        <HigieneYPoliticaPagina
          apellidosNombres={apellidosNombres}
          codigo={codigo}
          fecha={fechaValue}
          signatureSrc={signatureSrc}
        />
      )}
    </div>
  );
}

export default ReglamentosForm;
