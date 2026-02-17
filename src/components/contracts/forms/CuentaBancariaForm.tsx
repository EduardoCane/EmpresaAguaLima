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

function CheckBox({ size = 18, checked = false }: { size?: number; checked?: boolean }) {
  return (
    <div
      className="border border-black flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {checked && <div className="text-[16px] font-bold">X</div>}
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

export function CuentaBancariaForm({
  client,
  fecha,
  signatureSrc,
  entidadBancaria,
  numeroCuenta,
}: {
  client?: Cliente | null;
  fecha?: string;
  signatureSrc?: string;
  entidadBancaria?: string;
  numeroCuenta?: string;
}) {
  const fullName = buildFullName(client);
  const dni = buildDni(client);
  const fechaSlash = formatDate(fecha);
  const codigo = (client?.cod || '').trim();

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0" style={{ margin: 0, padding: 0 }}>
      <PdfPage>
        <div className="flex flex-col" style={{ minHeight: "260mm" }}>
          {/* Header superior */}
          <div className="px-10 mt-8 flex items-start justify-between">
            {/* Logo */}
            <img
              src={LOGO_AGUALIMA_SRC}
              alt="Logo"
              className="w-[90px] h-auto object-contain"
              draggable={false}
            />

            {/* Código */}
            <p className="text-[10px] font-bold">{codigo}</p>
          </div>

          {/* Título */}
          <div className="mt-6 text-center">
            <p className="font-bold uppercase text-[12px]">
              AUTORIZACIÓN DE ELECCIÓN DE ENTIDAD BANCARIA
            </p>
          </div>

          {/* Cuerpo */}
          <div className="mt-16 px-10 text-[10px] leading-[16px]">
            {/* Yo / DNI */}
            <div className="grid grid-cols-3 text-center">
              <p>Yo,</p>
              <p className="font-bold">{fullName}</p>
              <p>
                identificado con DNI N° <span className="font-bold">{dni}</span>
              </p>
            </div>

            <p className="mt-6 text-center">
              Autorizo a la empresa <span className="font-bold uppercase">AGUALIMA S.A.C.</span>,
              aperturar mi cuenta sueldo para el pago de mis haber en el banco:
            </p>

            {/* Lista bancos + checkbox */}
            <div className="mt-12" style={{ width: "260px" }}>
              <div className="flex items-center justify-between py-2">
                <p className="font-bold">BAN BIF</p>
                <CheckBox checked={entidadBancaria === "BAN BIF"} />
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="font-bold">BBVA (Continental)</p>
                <CheckBox checked={entidadBancaria === "BBVA (Continental)"} />
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="font-bold">FINANCIERA CONFIANZA</p>
                <CheckBox checked={entidadBancaria === "FINANCIERA CONFIANZA"} />
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="font-bold">CAJA HUANCAYO</p>
                <CheckBox checked={entidadBancaria === "CAJA HUANCAYO"} />
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="font-bold">CAJA AREQUIPA</p>
                <CheckBox checked={entidadBancaria === "CAJA AREQUIPA"} />
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="font-bold">CAJA TRUJILLO</p>
                <CheckBox checked={entidadBancaria === "CAJA TRUJILLO"} />
              </div>
            </div>

            {/* Cuenta + Fecha */}
            <div className="mt-16 flex items-end justify-between">
              <div className="flex items-end gap-2">
                <span className="font-bold">Entregaré mi cuenta del banco:</span>
                <div className="border-b border-black w-[210px] flex items-end justify-center pb-1">
                  <span className="font-bold">{numeroCuenta || ""}</span>
                </div>
              </div>

              <p className="font-bold">Virú, {fechaSlash}</p>
            </div>
          </div>

          {/* Firma y huella al fondo */}
          <div className="mt-24 pb-10">
            <div className="flex flex-col items-center">
              <div className="relative w-[280px] h-[40px]">
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
                      maxWidth: "200px",
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
