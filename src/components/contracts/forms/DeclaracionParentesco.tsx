import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Cliente } from '@/types';
import logoAgualima from "@/img/logo_header_1.jpeg";

// ============ TYPES ============
export type ParienteRow = {
  apellidosNombres: string;
  parentesco: string;
  areaLabora: string;
};

export type DeclaracionParentescoValues = {
  tieneParientes: 'si' | 'no' | '';
  parientes: ParienteRow[];
  fecha_registro?: string;
  ciudad?: string;
};

// ============ CONSTANTS ============
const LOGO_AGUALIMA_SRC = logoAgualima;

export const emptyDeclaracionParentescoValues: DeclaracionParentescoValues = {
  tieneParientes: '',
  parientes: [
    { apellidosNombres: '', parentesco: '', areaLabora: '' },
  ],
};

// ============ VALIDATION ============
export const getDeclaracionParentescoMissing = (current: DeclaracionParentescoValues) => {
  const missing: (keyof DeclaracionParentescoValues)[] = [];
  
  if (!current.tieneParientes) {
    missing.push('tieneParientes');
  }
  
  if (current.tieneParientes === 'si') {
    const hasComplete = current.parientes.some(row =>
      row.apellidosNombres.trim() && row.parentesco.trim() && row.areaLabora.trim()
    );
    if (!hasComplete) {
      missing.push('parientes');
    }
  }
  
  return missing;
};

// ============ PDF COMPONENTS ============
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

function Line({ w = 200 }: { w?: number }) {
  return <span className="inline-block border-b border-black" style={{ width: w }} />;
}

function TblCell({
  children,
  className = "",
  center = false,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
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

// ============ PDF VIEW ============
export function DeclaracionParentescoForm({
  client,
  signatureSrc,
  parentescoValues,
  previewCurrentDate = false,
}: {
  client?: Cliente;
  signatureSrc?: string;
  parentescoValues?: DeclaracionParentescoValues;
  previewCurrentDate?: boolean;
}) {
  const fechaSlash = parentescoValues?.fecha_registro
    ? formatDate(parentescoValues.fecha_registro, "/")
    : (previewCurrentDate ? formatDate(new Date().toISOString().slice(0, 10), "/") : "");
  const fullName = buildFullName(client);
  const dni = buildDni(client);
  
  const numRows = parentescoValues?.tieneParientes === 'si' 
    ? Math.max((parentescoValues.parientes?.length || 0), 1)
    : parentescoValues?.tieneParientes === 'no'
    ? 1
    : 3;

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0" style={{ margin: 0, padding: 0 }}>
      <PdfPage>
        <div className="flex flex-col" style={{ minHeight: "260mm" }}>
        <div
          className="grid border border-black"
          style={{ gridTemplateColumns: "120px 1fr 260px" }}
        >
          <HCell center className="flex items-center justify-center py-3">
            <img
              src={LOGO_AGUALIMA_SRC}
              alt="Logo"
              className="w-[70px] h-auto object-contain"
              draggable={false}
            />
          </HCell>

          <HCell center className="py-5 flex items-center justify-center">
            <p className="font-bold uppercase">DECLARACIÓN DE PARENTESCO</p>
          </HCell>

          <div className="border-l border-black flex flex-col items-center justify-center">
            <div className="grid w-full" style={{ gridTemplateRows: "auto auto auto" }}>
              <HCell center className="font-bold uppercase">
                ASUNTOS CORPORATIVOS Y GESTIÓN HUMANA
              </HCell>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <SmallCell center className="font-bold text-center">
                  FO-ACGC-ACGH-32
                </SmallCell>
                <SmallCell center className="font-bold text-center">
                  Versión: 00
                </SmallCell>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <SmallCell center className="font-bold text-center">
                  Fecha: 10/05/19
                </SmallCell>
                <SmallCell center className="font-bold text-center">
                  Página: 1 de 1
                </SmallCell>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 px-10 text-[10px] leading-[16px]">
          <div className="space-y-2">
            <p className="font-bold">SEÑORES :</p>
            <p className="font-bold mt-6">AGUALIMA S.A.C.</p>
            <p className="font-bold">PRESENTE.-</p>
          </div>

          <div className="mt-10 space-y-6">
            <p className="font-bold">
              YO,&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-bold">{fullName}</span>
            </p>
            <p className="font-bold">
              con D.N.I.&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-bold">{dni}</span>
            </p>

            <p className="font-bold">
              DECLARO&nbsp;&nbsp; <span className="font-bold">{parentescoValues?.tieneParientes === 'si' ? 'Si' : parentescoValues?.tieneParientes === 'no' ? 'No' : <Line w={110} />}</span> &nbsp;&nbsp;TENER PARIENTE(S) QUE LABOREN EN LA
              EMPRESA AGUALIMA S.A.C.
            </p>
          </div>

          <div className="mt-10 mx-auto" style={{ width: "420px" }}>
            <div
              className="grid"
              style={{ gridTemplateColumns: "60px 1fr 120px 120px" }}
            >
              <TblCell center className="font-bold">
                Item
              </TblCell>
              <TblCell center className="font-bold">
                Apellidos y nombres
              </TblCell>
              <TblCell center className="font-bold">
                Parentesco
              </TblCell>
              <TblCell center className="font-bold">
                Área que Labora
              </TblCell>

              {Array.from({ length: numRows }).map((_, i) => {
                if (parentescoValues?.tieneParientes === 'no') {
                  return (
                    <React.Fragment key={i}>
                      <TblCell center>—</TblCell>
                      <TblCell center className="font-semibold">NO TIENE</TblCell>
                      <TblCell center>-</TblCell>
                      <TblCell center>-</TblCell>
                    </React.Fragment>
                  );
                }
                
                const pariente = parentescoValues?.tieneParientes === 'si' 
                  ? parentescoValues.parientes?.[i]
                  : undefined;
                
                return (
                  <React.Fragment key={i}>
                    <TblCell center>{i + 1}</TblCell>
                    <TblCell>{pariente?.apellidosNombres || '\u00A0'}</TblCell>
                    <TblCell>{pariente?.parentesco || '\u00A0'}</TblCell>
                    <TblCell>{pariente?.areaLabora || '\u00A0'}</TblCell>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <p className="mt-10 text-center text-[9px] leading-[12px]">
            Expreso bajo declaración jurada, que los datos contenidos en el presente documento son
            verdaderos, sometiéndome a la decisión
            <br />
            de la compañía una vez evaluada la presente declaración.
          </p>

          <div className="mt-14 space-y-8">
            <p className="font-bold">
              FECHA :&nbsp;&nbsp;&nbsp;&nbsp; <span className="font-bold">{fechaSlash}</span>
            </p>

            <div className="flex gap-6 items-start">
              <span className="font-bold min-w-fit pt-1">FIRMA:</span>
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
      </div>
    </PdfPage>
    </div>
  );
}

// ============ EDITOR COMPONENT ============
interface DeclaracionParentescoEditorProps {
  client?: Cliente | null;
  value: DeclaracionParentescoValues;
  onChange: (next: DeclaracionParentescoValues) => void;
  onMissingChange?: (missing: (keyof DeclaracionParentescoValues)[]) => void;
}

export function DeclaracionParentescoEditor({
  client,
  value,
  onChange,
  onMissingChange,
}: DeclaracionParentescoEditorProps) {
  const [activeField, setActiveField] = useState<keyof DeclaracionParentescoValues | null>(null);
  const [tempValue, setTempValue] = useState<DeclaracionParentescoValues>(value);

  const allMissing = useMemo(() => getDeclaracionParentescoMissing(value), [value]);
  const lastMissingRef = useRef<string>('');
  
  useEffect(() => {
    if (!onMissingChange) return;
    const signature = allMissing.join('|');
    if (signature === lastMissingRef.current) return;
    lastMissingRef.current = signature;
    onMissingChange(allMissing);
  }, [allMissing, onMissingChange]);

  const fieldLabels: Record<keyof DeclaracionParentescoValues, string> = {
    tieneParientes: '¿Tiene parientes en la empresa?',
    parientes: 'Parientes',
  };

  const handleTieneParientesChange = (newValue: 'si' | 'no') => {
    setTempValue({
      ...tempValue,
      tieneParientes: newValue,
      parientes: newValue === 'no' ? [] : tempValue.parientes,
    });
  };

  const handleAddPariente = () => {
    setTempValue({
      ...tempValue,
      parientes: [
        ...tempValue.parientes,
        { apellidosNombres: '', parentesco: '', areaLabora: '' },
      ],
    });
  };

  const handleParienteChange = (index: number, field: keyof ParienteRow, val: string) => {
    const newParientes = [...tempValue.parientes];
    newParientes[index] = { ...newParientes[index], [field]: val };
    setTempValue({
      ...tempValue,
      parientes: newParientes,
    });
  };

  const handleRemovePariente = (index: number) => {
    const newParientes = tempValue.parientes.filter((_, i) => i !== index);
    setTempValue({
      ...tempValue,
      parientes: newParientes.length > 0 ? newParientes : [{ apellidosNombres: '', parentesco: '', areaLabora: '' }],
    });
  };

  const handleSave = () => {
    onChange(tempValue);
    setActiveField(null);
  };

  const handleCancel = () => {
    setTempValue(value);
    setActiveField(null);
  };

  const openModal = (field: keyof DeclaracionParentescoValues) => {
    setTempValue(value);
    setActiveField(field);
  };

  return (
    <div className="space-y-6">
      {activeField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">{fieldLabels[activeField]}</h2>
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {activeField === 'tieneParientes' ? (
                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-3">¿Tiene parientes en la empresa?</label>
                  <div className={`flex gap-6 mb-4 p-3 rounded border-2 ${
                    !tempValue.tieneParientes ? 'border-destructive bg-destructive/5' : 'border-transparent'
                  }`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        value="si"
                        checked={tempValue.tieneParientes === 'si'}
                        onChange={(e) => handleTieneParientesChange(e.target.value as 'si')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Sí</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        value="no"
                        checked={tempValue.tieneParientes === 'no'}
                        onChange={(e) => handleTieneParientesChange(e.target.value as 'no')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">No</span>
                    </label>
                  </div>
                  
                  {tempValue.tieneParientes === 'si' && (
                    <div className="space-y-3 p-3 bg-muted/30 rounded-md">
                      <div className="grid grid-cols-[1fr_120px_140px] gap-2 text-[11px] text-muted-foreground font-semibold">
                        <div>Apellidos y nombres</div>
                        <div>Parentesco</div>
                        <div>Área que Labora</div>
                      </div>
                      {tempValue.parientes.map((pariente, index) => (
                        <div key={index} className="grid grid-cols-[1fr_120px_140px_28px] gap-2">
                          <input
                            type="text"
                            value={pariente.apellidosNombres}
                            onChange={(e) => handleParienteChange(index, 'apellidosNombres', e.target.value)}
                            className={`input-field w-full text-sm border rounded px-2 py-1 ${
                              !pariente.apellidosNombres.trim() ? 'border-destructive bg-destructive/10' : 'border-border'
                            }`}
                            placeholder="Nombre completo"
                          />
                          <input
                            type="text"
                            value={pariente.parentesco}
                            onChange={(e) => handleParienteChange(index, 'parentesco', e.target.value)}
                            className={`input-field w-full text-sm border rounded px-2 py-1 ${
                              !pariente.parentesco.trim() ? 'border-destructive bg-destructive/10' : 'border-border'
                            }`}
                            placeholder="Parentesco"
                          />
                          <input
                            type="text"
                            value={pariente.areaLabora}
                            onChange={(e) => handleParienteChange(index, 'areaLabora', e.target.value)}
                            className={`input-field w-full text-sm border rounded px-2 py-1 ${
                              !pariente.areaLabora.trim() ? 'border-destructive bg-destructive/10' : 'border-border'
                            }`}
                            placeholder="Área"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePariente(index)}
                            className="h-9 w-7 rounded border border-destructive text-destructive hover:bg-destructive/10 transition-colors text-sm font-bold"
                            title="Eliminar"
                          >
                            −
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddPariente}
                        className="text-xs font-medium text-primary hover:text-primary/80 mt-2"
                      >
                        + Agregar pariente
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-md border border-border text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
