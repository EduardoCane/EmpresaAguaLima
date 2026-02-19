// Cell institucional: sin bordes redondeados, sin padding extra
function Cell({
  children,
  center = false,
  bold = false,
  fontSize = 10,
  pad = "2px 4px",
  bg,
  style = {},
  className = "",
}: {
  children?: React.ReactNode;
  center?: boolean;
  bold?: boolean;
  fontSize?: number;
  pad?: string;
  bg?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={["dj-cell", className].filter(Boolean).join(" ")}
      data-dj-cell-pad={pad === "0" ? "none" : "default"}
      style={{
        border: "1px solid #000",
        padding: pad,
        fontWeight: bold ? 700 : 400,
        fontSize,
        background: bg,
        textAlign: center ? "center" : "left",
        boxSizing: "border-box",
        lineHeight: 1.1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// BB institucional: sin borderRadius, sin margen extra
function BB({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        border: "2px solid #000",
        margin: 0,
        padding: 0,
        borderRadius: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
import * as React from "react";
import logoHeader1 from "@/img/logo_header_1.jpeg";
import type { Cliente } from "@/types";

// Colores muestreados de la imagen de ejemplo
const LOGO_SRC = logoHeader1;
const C_BLUE = "#323299";
const C_GREEN = "#99CB00";
const C_GRAY = "#BFBFBF";

const normalize = (value?: string | number | null) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const formatAmount = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return n.toFixed(2);
};

function PdfPage({
  children,
  pdfMode = false,
}: {
  children: React.ReactNode;
  pdfMode?: boolean;
}) {
  return (
    <div
      data-pdf-page={pdfMode ? "1" : undefined}
      style={{
        width: "100%",
        maxWidth: pdfMode ? "210mm" : undefined,
        height: pdfMode ? "297mm" : "auto",
        minHeight: pdfMode ? "297mm" : "100%",
        boxSizing: "border-box",
        paddingTop: pdfMode ? "2.5mm" : 0,
        paddingBottom: pdfMode ? "3mm" : 0,
        paddingLeft: pdfMode ? "3.5mm" : 0,
        paddingRight: pdfMode ? "3.5mm" : 0,
        background: "#fff",
        marginTop: pdfMode ? 0 : 24,
        overflow: pdfMode ? "hidden" : "visible",
      }}
    >
      {children}
    </div>
  );
}

function Row({
  cols,
  children,
  style,
}: {
  cols: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cols,
        width: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Checkbox({
  size = 16,
  checked = false,
  marginLeft = 8,
  marginRight = 6,
}: {
  size?: number;
  checked?: boolean;
  marginLeft?: number;
  marginRight?: number;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: "1px solid #000",
        verticalAlign: "middle",
        marginLeft,
        marginRight,
      }}
    >
      {checked ? (
        <span
          style={{
            display: "block",
            width: size - 6,
            height: size - 6,
            background: "#000",
            margin: 2,
          }}
        />
      ) : null}
    </span>
  );
}

function DottedFill({ height = 26 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderBottom: "1px dotted #000",
        marginTop: 2,
      }}
    />
  );
}

function ImgBox({ src }: { src: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <img
        src={src}
        alt="logo"
        style={{ maxWidth: "90%", maxHeight: "70%", objectFit: "contain" }}
        draggable={false}
      />
    </div>
  );
}

function SectionBar({
  leftText,
  leftBg,
  leftColor = "#000",
  leftWidth = "38%",
  leftNoWrap = false,
}: {
  leftText: string;
  leftBg: string;
  leftColor?: string;
  leftWidth?: string;
  leftNoWrap?: boolean;
}) {
  return (
    <Row cols={`${leftWidth} 1fr`}>
      <Cell
        bg={leftBg}
        bold
        fontSize={12}
        pad="4px 6px"
        style={{ color: leftColor, whiteSpace: leftNoWrap ? "nowrap" : undefined }}
      >
        {leftText}
      </Cell>
      <Cell pad="0" style={{ borderLeft: "none" }}>
        {/* solo para mantener borde como en imagen */}
        <div style={{ height: 1 }} />
      </Cell>
    </Row>
  );
}

function Header({ pdfMode = false }: { pdfMode?: boolean }) {
  return (
    <div style={{ marginTop: pdfMode ? 6 : 24 }}>
      <BB>
        <Row cols="120px 1fr 220px" style={{ height: 86 }}>
          {/* Logo */}
          <Cell pad="0" style={{ borderRight: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImgBox src={LOGO_SRC} />
          </Cell>

          {/* Título */}
          <Cell
            center
            bold
            fontSize={15}
            style={{ borderRight: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 0.5 }}
          >
            DECLARACIÓN JURADA PATRIMONIAL DEL TRABAJADOR
          </Cell>

          {/* Bloque derecho */}
          <Cell pad="0" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateRows: "1fr 24px 24px", height: "100%" }}>
              <Cell center bold fontSize={10} style={{ borderBottom: "1px solid #000", borderRight: "none", borderLeft: "none", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1.05 }}>
                ASUNTOS CORPORATIVOS Y<br />GESTIÓN HUMANA
              </Cell>
              <Row cols="1fr 70px">
                <Cell bold fontSize={10} style={{ borderRight: "1px solid #000" }}>FO-ACGH-ACGH-33</Cell>
                <Cell bold fontSize={10} center>Versión: 00</Cell>
              </Row>
              <Row cols="1fr 70px">
                <Cell bold fontSize={10} style={{ borderRight: "1px solid #000" }}>Fecha: 10/05/19</Cell>
                <Cell bold fontSize={9} center>Página: 1 de 1</Cell>
              </Row>
            </div>
          </Cell>
        </Row>

        {/* Franja inferior del header */}
        <div
          style={{
            borderTop: "2px solid #000",
            background: "#BFBFBF",
            textAlign: "center",
            fontWeight: 700,
            fontSize: pdfMode ? 10.5 : 11,
            padding: pdfMode ? "0" : "2px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: pdfMode ? 24 : undefined,
            lineHeight: pdfMode ? 1.02 : 1.1,
          }}
        >
          <span style={{ position: "relative", top: pdfMode ? -4 : 0 }}>
            Para ser incorporada al Legajo Personal del trabajador del Sujeto Obligado supervisado
          </span>
        </div>
      </BB>
    </div>
  );
}

interface DjPatrimonialFormProps {
  client?: Cliente | null;
  signatureSrc?: string;
  djPatrimonialValues?: Record<string, unknown> | null;
  pdfMode?: boolean;
}

export function DjPatrimonialForm({
  client,
  signatureSrc,
  djPatrimonialValues,
  pdfMode = false,
}: DjPatrimonialFormProps = {}) {
  const hasPersistedValues = !!(djPatrimonialValues && typeof djPatrimonialValues === "object");
  const valuesObj = (djPatrimonialValues && typeof djPatrimonialValues === "object"
    ? djPatrimonialValues
    : {}) as Record<string, unknown>;
  const snapshot = (valuesObj.clientSnapshot && typeof valuesObj.clientSnapshot === "object"
    ? valuesObj.clientSnapshot
    : {}) as Record<string, unknown>;

  const apellidoPaterno = normalize(snapshot.a_paterno as string) || normalize(client?.a_paterno) || "#N/D";
  const apellidoMaterno = normalize(snapshot.a_materno as string) || normalize(client?.a_materno) || "#N/D";
  const nombres = normalize(snapshot.nombre as string) || normalize(client?.nombre) || "#N/D";
  const dni = normalize(snapshot.dni as string) || normalize(client?.dni) || "#N/D";
  const direccion = normalize(snapshot.direccion as string) || normalize(client?.direccion);
  const distrito = normalize(snapshot.distrito as string) || normalize(client?.distrito);
  const provincia = normalize(snapshot.provincia as string) || normalize(client?.provincia);
  const departamento = normalize(snapshot.departamento as string) || normalize(client?.departamento);
  const remuneracion = formatAmount(
    (snapshot.remuneracion as number | string | undefined) ?? client?.remuneracion ?? null,
  );
  const savedCiudad = normalize(valuesObj.ciudad as string) || normalize(snapshot.ciudad as string) || "Virú";
  const savedFechaRegistro =
    normalize(valuesObj.fecha_registro as string) || normalize(snapshot.fecha_registro as string);
  const normalizedFechaRegistro = savedFechaRegistro && /^\d{4}-\d{2}-\d{2}$/.test(savedFechaRegistro)
    ? `${savedFechaRegistro}T00:00:00`
    : savedFechaRegistro;
  const parsedSavedDate = normalizedFechaRegistro ? new Date(normalizedFechaRegistro) : null;
  const hasSavedDate = !!(parsedSavedDate && !Number.isNaN(parsedSavedDate.getTime()));
  const previewNow = new Date();
  const dateToShow = hasSavedDate ? parsedSavedDate! : previewNow;
  const currentDay = dateToShow ? String(dateToShow.getDate()).padStart(2, "0") : "";
  const currentMonth = dateToShow ? String(dateToShow.getMonth() + 1).padStart(2, "0") : "";
  const currentYear = dateToShow ? String(dateToShow.getFullYear()) : "";
  const currentDateSlash = dateToShow ? `${currentDay}/${currentMonth}/${currentYear}` : "";
  const renderLocationCell = (value: string, label: string) => (
    <Cell pad="0">
      <div style={{ padding: pdfMode ? "0px 4px 4px" : "3px 4px" }}>
        <div
          style={{
            height: pdfMode ? 12 : 14,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            fontSize: 9.5,
            fontWeight: 700,
            lineHeight: pdfMode ? 1 : 1.02,
            transform: pdfMode ? "translateY(-3px)" : undefined,
          }}
        >
          {value}
        </div>
        <div
          style={{
            borderBottom: "1px dotted #000",
            marginTop: pdfMode ? 4 : 1,
            marginBottom: pdfMode ? -2 : 2,
          }}
        />
        <div
          style={{
            textAlign: "center",
            fontSize: 9.5,
            lineHeight: pdfMode ? 1.05 : 1.1,
            minHeight: pdfMode ? 10 : undefined,
          }}
        >
          {label}
        </div>
      </div>
    </Cell>
  );

  return (
    <PdfPage pdfMode={pdfMode}>
      {pdfMode ? (
        <style>{`
          [data-dj-pdf-fix="true"] {
            font-family: Arial, Helvetica, sans-serif;
          }
          [data-dj-pdf-fix="true"] .dj-cell {
            line-height: 1.22 !important;
          }
          [data-dj-pdf-fix="true"] .dj-cell[data-dj-cell-pad="default"] {
            padding-top: 0.8px !important;
            padding-bottom: 6px !important;
          }
          [data-dj-pdf-fix="true"] .dj-cell p {
            margin: 0;
          }
        `}</style>
      ) : null}
      <div data-dj-pdf-fix={pdfMode ? "true" : undefined} style={{ display: "flex", flexDirection: "column", gap: pdfMode ? 4 : 5 }}>
        <Header pdfMode={pdfMode} />

        {/* Párrafo inicial */}
        <div
          style={{
            fontSize: 9.5,
            lineHeight: pdfMode ? 1.16 : 1.15,
            marginTop: pdfMode ? -8 : 24,
            marginBottom: pdfMode ? 8 : 0,
          }}
        >
          Declaro bajo juramento que los datos y demás información consignada en el presente documento son
          verdaderos y actuales, obligándome frente a mi empleador a presentarla anualmente, durante el mes de enero
          del año calendario siguiente, con datos actualizados a la fecha de presentación
        </div>

        {/* ===================== INFORMACIÓN PERSONAL ===================== */}
        <div>
          <SectionBar leftText="INFORMACIÓN PERSONAL:" leftBg={C_BLUE} leftColor="#fff" leftWidth="38%" />

          {/* tabla info personal */}
          <BB style={{ borderTop: "none", fontSize: 9.5 }}>
            {/* Fila #N/D (3 columnas) */}
            <Row cols="22% 28% 50%">
              <Cell center bold fontSize={10.5}>{apellidoPaterno}</Cell>
              <Cell center bold fontSize={10.5}>{apellidoMaterno}</Cell>
              <Cell center bold fontSize={10.5}>{nombres}</Cell>
            </Row>

            {/* Encabezados verdes (3 columnas) */}
            <Row cols="22% 28% 50%">
              <Cell center bold bg={C_GREEN} fontSize={10.5}>Apellido Paterno</Cell>
              <Cell center bold bg={C_GREEN} fontSize={10.5}>Apellido Materno</Cell>
              <Cell center bold bg={C_GREEN} fontSize={10.5}>Nombres</Cell>
            </Row>

            {/* Documento / DNI / Fecha / País */}
            <Row cols="22% 18% 28% 32%">
              <Cell bold bg={C_GREEN} fontSize={9.5}>Documento de Identidad:</Cell>
              <Cell center bold fontSize={9.5}>D.N.I.</Cell>
              <Cell center bold fontSize={9.5}>{currentDateSlash}</Cell>
              <Cell bold fontSize={9.5}>País (De ser extranjero):</Cell>
            </Row>
            <Row cols="22% 18% 28% 32%">
              <Cell bold bg={C_GREEN} fontSize={9.5}> </Cell>
              <Cell center bold fontSize={9.5}>{dni}</Cell>
              <Cell bold fontSize={9.5}>Nacionalidad:</Cell>
              <Cell fontSize={9.5}>{""}</Cell>
            </Row>

            {/* Estado civil */}
            <Row cols="22% 78%">
              <Cell bold bg={C_GREEN} fontSize={9.5}>Estado Civil:</Cell>
              <Cell fontSize={9.5} pad="3px 6px">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 4 }}>
                  <div>
                    a. Soltero <Checkbox checked={false} />
                  </div>
                  <div>
                    b. Casado <Checkbox checked={false} />
                  </div>
                  <div>
                    c. Conviviente <Checkbox checked={false} />
                  </div>
                  <div>
                    d. Viudo <Checkbox checked={false} />
                  </div>
                  <div>
                    e. Divorciado <Checkbox checked={false} />
                  </div>
                </div>
              </Cell>
            </Row>

            {/* Cónyuge / dependientes */}
            <Row cols="78% 22%">
              <Cell center bold fontSize={9.5}>
                Nombres - Apellido Paterno - Apellido Materno del cónyuge o conviviente (Si aplica)
              </Cell>
              <Cell center bold fontSize={9.5}>Número de dependientes</Cell>
            </Row>

            {/* Dirección domiciliaria actual */}
            <Row cols="22% 78%">
              <Cell bold bg={C_GREEN} fontSize={9.5}>Dirección Domiciliaria Actual:</Cell>
              <Cell
                fontSize={9.5}
                style={{ height: pdfMode ? 22 : 20, display: "flex", alignItems: "center" }}
              >
                {direccion}
              </Cell>
            </Row>

            {/* Dirección (Jr/Av/Calle/Pasaje, N°, Dpto, Edificio...) */}
            <Row cols={pdfMode ? "51% 9% 14% 26%" : "55% 10% 15% 20%"} style={{ minHeight: pdfMode ? 31 : undefined }}>
              <Cell pad="0">
                <div style={{ padding: pdfMode ? "1px 4px 3px" : "3px 4px" }}>
                  <DottedFill height={pdfMode ? 10 : 14} />
                  <div style={{ textAlign: "center", fontSize: 9.5, marginTop: pdfMode ? 0 : 2, lineHeight: pdfMode ? 1.02 : 1.1, transform: pdfMode ? "translateY(-2px)" : undefined }}>
                    Jr. / Av. / Calle / Pasaje
                  </div>
                </div>
              </Cell>
              <Cell pad="0">
                <div style={{ padding: pdfMode ? "1px 4px 3px" : "3px 4px" }}>
                  <DottedFill height={pdfMode ? 10 : 14} />
                  <div style={{ textAlign: "center", fontSize: 9.5, marginTop: pdfMode ? 0 : 2, lineHeight: pdfMode ? 1.02 : 1.1, transform: pdfMode ? "translateY(-2px)" : undefined }}>N°</div>
                </div>
              </Cell>
              <Cell pad="0">
                <div style={{ padding: pdfMode ? "1px 4px 3px" : "3px 4px" }}>
                  <DottedFill height={pdfMode ? 10 : 14} />
                  <div style={{ textAlign: "center", fontSize: 9.5, marginTop: pdfMode ? 0 : 2, lineHeight: pdfMode ? 1.02 : 1.1, transform: pdfMode ? "translateY(-2px)" : undefined }}>Dpto. / Interior N°</div>
                </div>
              </Cell>
              <Cell pad="0">
                <div style={{ padding: pdfMode ? "1px 4px 3px" : "3px 4px" }}>
                  <DottedFill height={pdfMode ? 10 : 14} />
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: pdfMode ? 8.5 : 9.2,
                      marginTop: pdfMode ? 0 : 2,
                      lineHeight: pdfMode ? 1 : 1.1,
                      whiteSpace: pdfMode ? "nowrap" : "normal",
                      transform: pdfMode ? "translateY(-2px)" : undefined,
                    }}
                  >
                    Edificio / Urb. / Complejo / Zona / Sector
                  </div>
                </div>
              </Cell>
            </Row>

            {/* Distrito / Provincia / Departamento */}
            <Row cols="40% 35% 25%" style={{ minHeight: pdfMode ? 38 : undefined }}>
              {renderLocationCell(distrito, "Distrito")}
              {renderLocationCell(provincia, "Provincia")}
              {renderLocationCell(departamento, "Departamento")}
            </Row>

            {/* Condición del inmueble */}
            <Row cols="22% 78%">
              <Cell bold bg={C_GREEN} fontSize={9.5} style={{ display: "flex", alignItems: "center", lineHeight: 1.1 }}>
                <div>
                  Condición del inmueble en el que
                  <br />
                  vive:
                </div>
              </Cell>
              <Cell fontSize={9.5} pad="0">
                <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", minHeight: pdfMode ? 52 : 56 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.6fr 1.3fr", borderBottom: "1px solid #000" }}>
                    <div style={{ padding: pdfMode ? "4px 6px" : "5px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", whiteSpace: "nowrap" }}>
                      <span>Casa Propia</span>
                      <Checkbox size={pdfMode ? 12 : 16} marginLeft={pdfMode ? 4 : 8} marginRight={pdfMode ? 0 : 2} />
                    </div>
                    <div style={{ borderLeft: "1px solid #000", padding: pdfMode ? "4px 6px" : "5px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", whiteSpace: "nowrap" }}>
                      <span>De los Padres</span>
                      <Checkbox size={pdfMode ? 12 : 16} marginLeft={pdfMode ? 4 : 8} marginRight={pdfMode ? 0 : 2} />
                    </div>
                    <div style={{ borderLeft: "1px solid #000", padding: pdfMode ? "4px 6px" : "5px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", whiteSpace: "nowrap" }}>
                      <span>De la sociedad conyugal</span>
                      <Checkbox size={pdfMode ? 12 : 16} marginLeft={pdfMode ? 4 : 8} marginRight={pdfMode ? 0 : 2} />
                    </div>
                    <div style={{ borderLeft: "1px solid #000", padding: pdfMode ? "4px 6px" : "5px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", whiteSpace: "nowrap" }}>
                      <span>De los convivientes</span>
                      <Checkbox size={pdfMode ? 12 : 16} marginLeft={pdfMode ? 4 : 8} marginRight={pdfMode ? 0 : 2} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.6fr 1.3fr" }}>
                    <div style={{ padding: pdfMode ? "4px 6px" : "5px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", whiteSpace: "nowrap" }}>
                      <span>Alquilada</span>
                      <Checkbox size={pdfMode ? 12 : 16} marginLeft={pdfMode ? 4 : 8} marginRight={pdfMode ? 0 : 2} />
                    </div>
                    <div style={{ borderLeft: "1px solid #000", padding: pdfMode ? "4px 6px" : "5px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", whiteSpace: "nowrap" }}>
                      <span>Cedida en uso</span>
                      <Checkbox size={pdfMode ? 12 : 16} marginLeft={pdfMode ? 4 : 8} marginRight={pdfMode ? 0 : 2} />
                    </div>
                    <div style={{ borderLeft: "1px solid #000", borderRight: "1px solid #000", gridColumn: "3 / 5", padding: pdfMode ? "4px 6px" : "5px 8px", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 2, whiteSpace: "nowrap" }}>
                      <span>Otra (indicar):</span>
                      <Checkbox size={pdfMode ? 12 : 16} marginLeft={pdfMode ? 1 : 4} marginRight={0} />
                    </div>
                  </div>
                </div>
              </Cell>
            </Row>
          </BB>
        </div>

        {/* ===================== INFORMACIÓN PATRIMONIAL ===================== */}
        <div>
          <SectionBar leftText="INFORMACIÓN PATRIMONIAL:" leftBg={C_BLUE} leftColor="#fff" leftWidth="50%" leftNoWrap />

          {/* INGRESOS */}
          <BB style={{ borderTop: "none", fontSize: 9.5 }}>
            <Row cols="22% 78%">
              <Cell
                bg={C_GREEN}
                bold
                center
                fontSize={10.5}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                I.
                <div style={{ width: 8 }} />
                INGRESOS
              </Cell>

              <div style={{ borderLeft: "1px solid #000" }}>
                {/* tabla ingresos: num + desc + S/. */}
                <Row cols="32px 1fr 70px">
                  <Cell center bold fontSize={9.5} pad="2px 4px">1.</Cell>
                  <Cell bold fontSize={9.5} pad="2px 4px">
                    Remuneración bruta mensual (En planilla del Empleador)
                  </Cell>
                  <Cell bold fontSize={9.5} pad="2px 4px">S/.</Cell>
                </Row>
                <Row cols="32px 1fr 70px">
                  <Cell center bold fontSize={9.5} pad="2px 4px">2.</Cell>
                  <Cell bold fontSize={9.5} pad="2px 4px">
                    Otros Ingresos por ejercicio individual de profesión, oficio u otra labor
                  </Cell>
                  <Cell fontSize={9.5} pad="2px 4px">{""}</Cell>
                </Row>
                <Row cols="32px 1fr 70px">
                  <Cell center bold fontSize={9.5} pad="2px 4px">3.</Cell>
                  <Cell bold fontSize={9.5} pad="2px 4px">Otros Ingresos mensuales:</Cell>
                  <Cell fontSize={9.5} pad="2px 4px">{""}</Cell>
                </Row>
                <Row cols="1fr 44px 70px">
                  <Cell fontSize={9.5} pad="3px">{""}</Cell>
                  <Cell bold center fontSize={9.5} pad="3px">TOTAL:</Cell>
                  <Cell fontSize={9.5} pad="3px">{""}</Cell>
                </Row>
              </div>
            </Row>

            {/* II. BIENES INMUEBLES */}
            <Row cols="28% 72%">
              <Cell bg={C_GREEN} bold fontSize={10.5} pad="3px 6px">
                II.&nbsp;&nbsp;BIENES INMUEBLES
              </Cell>
              <Cell pad="0" style={{ borderLeft: "none" }}>
                <div style={{ height: 1 }} />
              </Cell>
            </Row>

            {/* tabla bienes inmuebles */}
            <Row cols="1fr 120px 70px">
              <Cell center bold fontSize={9.5}>
                Dirección &nbsp;&nbsp;&nbsp;
                <span style={{ fontWeight: 400 }}>
                  (Jr/Av/Calle - N° - Dpto o Interior - Urb/Zona /Sector/Complejo - Distrito - Provincia - Departamento)
                </span>
              </Cell>
              <Cell center bold fontSize={9.5}>N° de Ficha o Partida Registral</Cell>
              <Cell center bold fontSize={9.5}>Valor S/.</Cell>
            </Row>
            {[0, 1, 2].map((i) => (
              <Row key={i} cols="1fr 120px 70px">
                <Cell pad="0">
                  <div style={{ display: "grid", gridTemplateColumns: "34px 1fr", height: 12 }}>
                    <div style={{ borderRight: "1px solid #000" }} />
                    <div />
                  </div>
                </Cell>
                <Cell>{""}</Cell>
                <Cell>{""}</Cell>
              </Row>
            ))}

            {/* nota gris + TOTAL */}
            <Row cols="1fr 70px 70px">
              <Cell bg={C_GRAY} fontSize={9.5} pad="5px 6px">
                Marque P: si es bien propio; C: si es de la sociedad conyugal o los convivientes; CO si es copropietario con terceras personas
              </Cell>
              <Cell bold center fontSize={9.5}>TOTAL:</Cell>
              <Cell>{""}</Cell>
            </Row>

            {/* III. BIENES MUEBLES */}
            <Row cols="28% 72%">
              <Cell bg={C_GREEN} bold fontSize={10.5} pad="3px 6px">
                III.&nbsp;&nbsp;BIENES MUEBLES
              </Cell>
              <Cell pad="0" style={{ borderLeft: "none" }}>
                <div style={{ height: 1 }} />
              </Cell>
            </Row>

            <Row cols="38% 13% 12% 10% 15% 12%">
              <Cell center bold fontSize={9.5}>Tipo de VEHÍCULO (Auto - Station Wagon - Camión</Cell>
              <Cell center bold fontSize={9.5}>Marca</Cell>
              <Cell center bold fontSize={9.5}>Modelo</Cell>
              <Cell center bold fontSize={9.5}>Año</Cell>
              <Cell center bold fontSize={9.5}>Placa de Rodaje</Cell>
              <Cell center bold fontSize={9.5}>Valor S/.</Cell>
            </Row>
            <Row cols="38% 13% 12% 10% 15% 12%">
              <Cell style={{ height: 12 }}>{""}</Cell>
              <Cell>{""}</Cell>
              <Cell>{""}</Cell>
              <Cell>{""}</Cell>
              <Cell>{""}</Cell>
              <Cell>{""}</Cell>
            </Row>
            <Row cols="38% 25% 25% 12%">
              <Cell center bold fontSize={9.5}>OTROS</Cell>
              <Cell center bold fontSize={9.5}>Descripción</Cell>
              <Cell center bold fontSize={9.5}>Características</Cell>
              <Cell>{""}</Cell>
            </Row>
            <Row cols="38% 25% 25% 12%">
              <Cell style={{ height: 12 }}>{""}</Cell>
              <Cell>{""}</Cell>
              <Cell>{""}</Cell>
              <Cell>{""}</Cell>
            </Row>
            <Row cols="1fr 44px 70px">
              <Cell>{""}</Cell>
              <Cell bold center fontSize={9.5}>TOTAL:</Cell>
              <Cell>{""}</Cell>
            </Row>

            {/* IV. AHORROS... */}
            <Row cols="1fr">
              <Cell bg={C_GREEN} bold fontSize={10.5} pad="3px 6px">
                IV.&nbsp;&nbsp;AHORROS, DEPÓSITOS COLOCACIONES, INVERSIONES EN EL SISTEMA FINANCIERO
              </Cell>
            </Row>

            <Row cols="58% 27% 15%">
              <Cell center bold fontSize={9.5}>Nombre de la Entidad Financiera</Cell>
              <Cell center bold fontSize={9.5}>Tipo de Cuenta o Depósito</Cell>
              <Cell center bold fontSize={9.5}>Valor S/.</Cell>
            </Row>
            {[0, 1, 2].map((i) => (
              <Row key={i} cols="58% 27% 15%">
                <Cell style={{ height: 12 }}>{""}</Cell>
                <Cell>{""}</Cell>
                <Cell>{""}</Cell>
              </Row>
            ))}
            <Row cols="1fr 44px 15%">
              <Cell>{""}</Cell>
              <Cell bold center fontSize={9.5}>TOTAL:</Cell>
              <Cell>{""}</Cell>
            </Row>

            <Row cols="1fr">
              <Cell bold fontSize={9.5} pad="5px 6px">
                Especificar el Origen de los Ahorros.
              </Cell>
            </Row>

            {/* ACREENCIAS Y OBLIGACIONES */}
            <SectionBar leftText="ACREENCIAS Y OBLIGACIONES:" leftBg={C_BLUE} leftColor="#fff" leftWidth="38%" />

            {/* tabla acreencias */}
            <Row cols="58% 30% 12%">
              <Cell center bold fontSize={9.5}>Detalle de la deuda u obligación</Cell>
              <Cell center bold fontSize={9.5}>Asumida ante</Cell>
              <Cell center bold fontSize={9.5}>Monto S/.</Cell>
            </Row>

            {/* 3 filas */}
            {[0, 1, 2].map((i) => (
              <Row key={i} cols="58% 30% 12%">
                <Cell style={{ height: pdfMode ? 20 : 14 }}>{""}</Cell>
                <Cell pad={pdfMode ? "2px 4px" : "3px 4px"}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: pdfMode ? "1.4fr 1.2fr 0.7fr" : "1fr 1fr 1fr",
                      gap: pdfMode ? 2 : 4,
                      fontSize: pdfMode ? 8.6 : 9.5,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, lineHeight: 1.05 }}>
                      <span>Entidad Financiera</span>
                      <Checkbox size={pdfMode ? 9 : 10} marginLeft={pdfMode ? 2 : 8} marginRight={pdfMode ? 1 : 6} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, whiteSpace: "nowrap" }}>
                      <span>Persona Natural</span>
                      <Checkbox size={pdfMode ? 9 : 10} marginLeft={pdfMode ? 2 : 8} marginRight={pdfMode ? 1 : 6} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, whiteSpace: "nowrap" }}>
                      <span>Otro</span>
                      <Checkbox size={pdfMode ? 9 : 10} marginLeft={pdfMode ? 2 : 8} marginRight={pdfMode ? 1 : 6} />
                    </div>
                  </div>
                </Cell>
                <Cell>{""}</Cell>
              </Row>
            ))}

            <Row cols="1fr 96px 12%">
              <Cell>{""}</Cell>
              <Cell bold center fontSize={9.5} style={{ whiteSpace: "nowrap" }}>TOTAL DEUDA:</Cell>
              <Cell>{""}</Cell>
            </Row>

            {/* ELABORADO... */}
            <Row cols="45% 25% 10% 10% 10%">
              <Cell bold fontSize={9.5} pad="3px 6px">ELABORADO Y SUSCRITO, EN LA CIUDAD DE</Cell>
              <Cell bold center fontSize={9.5}>{savedCiudad}</Cell>
              <Cell bold center fontSize={9.5}>{currentDay}</Cell>
              <Cell bold center fontSize={9.5}>{currentMonth}</Cell>
              <Cell bold center fontSize={9.5}>{currentYear}</Cell>
            </Row>
            <Row cols="45% 25% 10% 10% 10%">
              <Cell fontSize={9.5}>{""}</Cell>
              <Cell bold center fontSize={9.5}>Ciudad</Cell>
              <Cell bold center fontSize={9.5}>día (dd)</Cell>
              <Cell bold center fontSize={9.5}>mes (mm)</Cell>
              <Cell bold center fontSize={9.5}>año (aaaa)</Cell>
            </Row>

            {/* Firma grande */}
            <div style={{ padding: "6px 0 0 0" }}>
              <div
                style={{
                  marginLeft: "40%",
                  width: "60%",
                  border: "1px solid #000",
                  height: 76,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    width: "85%",
                    height: 52,
                    position: "relative",
                    borderBottom: "1px solid #000",
                  }}
                >
                  {signatureSrc ? (
                    <img
                      src={signatureSrc}
                      alt="Firma del trabajador"
                      style={{
                        position: "absolute",
                        bottom: 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        height: 48,
                        maxWidth: "85%",
                        objectFit: "contain",
                      }}
                      draggable={false}
                    />
                  ) : null}
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 700, transform: pdfMode ? "translateY(-4px)" : undefined }}>
                  FIRMA DEL TRABAJADOR DECLARANTE
                </div>
              </div>
            </div>
          </BB>
        </div>
      </div>
    </PdfPage>
  );
}
