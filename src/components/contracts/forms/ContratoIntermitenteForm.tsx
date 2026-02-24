import React from "react";
import { Cliente } from "@/types";
import firmaempresa2 from "@/img/firmaempresa2.jpeg";

function PdfPage({
  headerLeft,
  headerRight,
  pageNumber,
  pdfMode = false,
  children,
}: {
  headerLeft?: string;
  headerRight?: string;
  pageNumber: number;
  pdfMode?: boolean;
  children: React.ReactNode;
}) {
  const paddingTop = pdfMode ? "8mm" : "14mm";
  const paddingBottom = pdfMode ? "8mm" : "14mm";
  const paddingSide = pdfMode ? "10mm" : "14mm";
  const bodyClass = pdfMode
    ? "mt-3 text-[8.5px] leading-[1.45]"
    : "mt-6 text-[9.5px] leading-[2]";

  return (
    <section
      className="pdf-page mx-auto bg-white text-black shadow-sm print:shadow-none"
      data-pdf-page={pageNumber}
      data-pdf-compact={pdfMode ? "true" : undefined}
      style={{
        width: "100%",
        maxWidth: "210mm",
        height: pdfMode ? "297mm" : "auto",
        minHeight: "297mm",
        fontFamily: '"Times New Roman", Times, serif',
        boxSizing: "border-box",
        overflow: pdfMode ? "hidden" : "visible",
        paddingTop,
        paddingBottom,
        paddingLeft: paddingSide,
        paddingRight: paddingSide,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between text-[10px] leading-[12px]" style={pdfMode ? { fontSize: "8.5px", lineHeight: "10px" } : undefined}>
        <div className="italic">{headerLeft ?? ""}</div>
        <div className="font-bold">{headerRight ?? ""}</div>
      </div>

      {/* Body */}
      <div
        className={bodyClass}
        style={{
          ...(pdfMode ? { marginTop: "3mm" } : {}),
          hyphens: "none",
          WebkitHyphens: "none",
          msHyphens: "none",
          wordBreak: "normal",
          overflowWrap: "normal",
          whiteSpace: "normal",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center">
      <h1 className="font-bold uppercase underline underline-offset-2 text-[10px] leading-[12px]">
        {children}
      </h1>
    </div>
  );
}

function P({
  children,
  center,
  tight,
}: {
  children: React.ReactNode;
  center?: boolean;
  tight?: boolean;
}) {
  return (
    <p
      className={[tight ? "mt-0" : "mt-2", center ? "text-center" : ""].join(" ")}
      style={{
        hyphens: "none",
        WebkitHyphens: "none",
        msHyphens: "none",
        textAlign: center ? "center" : "justify",
        textJustify: "inter-word",
        wordBreak: "normal",
        overflowWrap: "normal",
        whiteSpace: "normal",
      }}
    >
      {children}
    </p>
  );
}

function Clause({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 font-bold uppercase text-justify">{children}</p>
  );
}

const FIRMA_EMPRESA_SRC = firmaempresa2;

function HyphenList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-2 pl-0 space-y-1">
      {items.map((it, i) => (
        <li key={i} className="text-justify">
          - {it}
        </li>
      ))}
    </ul>
  );
}

function FirmaPage4({ signatureSrc }: { signatureSrc?: string }) {
  return (
    <div className="mt-auto pt-8">
      <div className="grid grid-cols-[1fr_1.2fr] gap-10 items-start">
        <div className="text-center">
          <img
            src={FIRMA_EMPRESA_SRC}
            alt="Firma empresa"
            className="mx-auto w-[48mm] h-auto object-contain"
            draggable={false}
          />
          <div className="mx-auto mt-2 h-px w-[60mm] bg-black" />
          <div className="mt-2 leading-[12px]">
            <p className="font-bold uppercase text-[10px]">LA EMPRESA</p>
            <p className="font-bold">Selene Torres Vilchez</p>
            <p className="font-bold">Responsable de Asuntos</p>
            <p className="font-bold">Corporativos</p>
            <p className="font-bold">&amp; Gestion Humana</p>
            <p className="font-bold uppercase">AGUALIMA S.A.C.</p>
          </div>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-2 relative h-[20mm] w-[70mm]">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-black" />
            {signatureSrc ? (
              <img
                src={signatureSrc}
                alt="Firma del trabajador"
                className="absolute bottom-[1mm] left-0 right-0 mx-auto h-[18mm] w-full object-contain px-1"
              />
            ) : null}
          </div>
          <p className="font-bold uppercase mb-6">EL TRABAJADOR</p>
          <div
            className="mx-auto relative border border-black"
            style={{ width: "75mm", height: "55mm" }}
          >
            {signatureSrc ? (
              <div className="absolute left-0 right-0 top-[2mm] h-[28mm] px-2">
                <img
                  src={signatureSrc}
                  alt="Firma de recepcion del trabajador"
                  className="mx-auto h-full w-full object-contain"
                />
              </div>
            ) : null}
            <div className="absolute left-0 right-0 top-[32mm] h-px bg-black" />
            <div className="absolute bottom-[6mm] left-0 right-0 px-2">
              <p className="font-bold uppercase text-[9px] leading-[11px]">
                DECLARO HABER RECIBIDO MI COPIA DE MI
              </p>
              <p className="font-bold uppercase text-[9px] leading-[11px]">
                CONTRATO
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContratoIntermitentePage4Content({ signatureSrc }: { signatureSrc?: string }) {
  return (
    <div className="flex flex-col" style={{ minHeight: "240mm" }}>
      <P>
        4. <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> deberá mantener en reserva su contraseña de 
        acceso a la plataforma digital, y deberá asegurarse de cerrar su sesión en el 
        Portal al culminar su consulta, para asegurar la inviolabilidad de su información.  
      </P>

      <P>
        <span className="font-bold uppercase">DECIMO SEPTIMA: REGIMEN LABORAL.- EL (LA) TRABAJADOR (A) </span> 
         estará sujeto al Régimen Laboral Agrario, dentro de los alcances y efectos de la Ley N°31110 Ley del Régimen
         Laboral Agrario y de incentivos para el sector agrario y riego, agroexportador y agroindustrial.
      </P>

      <Clause>DECIMO OCTAVA: SUPUESTOS DEL DERECHO PREFERENCIAL DE CONTRATACION.-</Clause>
      <P>
        De conformidad con lo dispuesto en el articulo 4 de la Ley 31110 y su reglamento, el derecho preferencial
        en la contratación se configura en los siguientes supuestos:
      </P>

      <HyphenList
        items={[
          <>
            Cuando el/la trabajador/a es contratado por LA EMPRESA en la misma línea de cultivo, por dos o más plazos 
            que en conjunto superan los dos meses en un periodo de un año, tiene derecho preferencial en la contratación 
            cada vez que el empleador requiera contratar personal en la misma línea de cultivo.
          </>,
          <>
            Cuando el/la trabajador/a es contratado por LA EMPRESA, bajo la modalidad de contratos intermitentes o contratos
             de temporada o similares, dos veces consecutivas o no consecutivas, tiene derecho preferencial en la contratación 
             si el empleador requiere contratar personal en las siguientes temporadas o servicios intermitentes.
          </>,
          <>
            Cuando el/la trabajador/a es contratado por LA EMPRESA, bajo la modalidad de contratos de temporada, por lo menos dos
             temporadas en un mismo año, de manera consecutiva o no consecutiva, para prestar servicios en cultivos diversos cuya
              estacionalidad conjunta cubre todo el año, tiene derecho preferencial en la contratación si el empleador requiere 
              contratar personal en las siguientes temporadas.
          </>,
        ]}
      />

      <Clause>VIGESIMA: FORMALIDADES PARA LA EJECUCION DEL DERECHO PREFERENCIAL DE CONTRATACION</Clause>
      <P>
        Para hacer efectivo el derecho preferencial de contratación, en los supuestos previstos 
        en el artículo 4 de la Ley 31110, LAS PARTES acuerdan que LA EMPRESA convocará al trabajador/a mediante 
        avisos en sus redes sociales u otros similares a fin de que, dentro de los quince (15) días anteriores 
        al inicio de la prestación de servicios, manifieste expresamente su voluntad de prestar servicios en la empresa. 
        Para tal efecto, las partes acuerdan que la CONVOCATORIA y la ACEPTACIÓN O NEGATIVA del trabajador/a se realizará
         de manera virtual o de cualquiera de las siguientes formas:
      </P>

      <HyphenList
        items={[
          <>
            Vía convocatoria por redes sociales, para tal efecto, LA EMPRESA difundirá anuncios en sus redes sociales oficiales.
          </>,
          <>
            Vía convocatoria radial, para tal efecto, LA EMPRESA difundirá anuncios en las principales radios de la localidad.
          </>,
          <>
            Vía mensaje escrito al número telefónico que el trabajador proporcione, quien recibirá una comunicación 
            desde el WhatsApp corporativo de la empresa o un SMS.
          </>,
          <>
            Vía correo electrónico; el trabajador/a recibirá una comunicación a su correo desde la 
            cuenta corporativa bienestarsocial@agualima.com
          </>,
        ]}
      />
      <p>
        Comunicada la negativa del trabajador o trabajadora o vencido el plazo de quince (15) 
        días sin que aquel manifieste expresamente su voluntad de prestar servicios o sin acercarse 
        a la empresa para iniciar el proceso de contratación, caduca el derecho preferencial de contratación del/la trabajadora/a.
      </p>

      <P>
        <span className="font-bold uppercase">VIGESIMA PRIMERA: EXTINCION DEL CONTRATO DE TRABAJO.-</span>
         Queda entendido que <span className="font-bold uppercase">LA EMPRESA</span> no está obligada a dar aviso alguno adicional referente al término 
         del presente contrato, operando su extinción a la expiración del plazo pactado entre las partes 
         en el contrato; tal como lo determina el inc. c) del artículo 16º del D.S. 003-97-TR, oportunidad
          en la cual abonará a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> los beneficios sociales que pudieran corresponderle.
      </P>

      <P>
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> conoce y acepta que constituye causa justa de terminación de la relación laboral, 
        el rendimiento deficiente en relación con su capacidad y con el rendimiento promedio en labores y bajo 
        condiciones similares, conforme a lo previsto en el artículo 23º literal b) del TUO del D. Leg. 728 aprobado 
        por Decreto Supremo No. 003-97-TR, causal que será evaluada y aplicada de acuerdo a los parámetros 
        establecidos por “<span className="font-bold uppercase">LA EMPRESA</span>” y teniendo en cuenta el cumplimiento de los objetivos formalmente 
        diseñados por <span className="font-bold uppercase">LA EMPRESA</span>. Sin perjuicio a lo citado en los párrafos anteriores, será de aplicación
         al presente contrato, las demás causas generales de extinción previstas en el artículo 16º del D.S. 003-97-TR.
      </P>

      <Clause>VIGESIMA SEGUNDA: ACEPTACION DE COMUNICACION POR VIA ELECTRONICA, DIGITAL Y/O TELEFONICA.-</Clause>
      <P>
        <span className="font-bold uppercase">VIGESIMA SEGUNDA: ACEPTACION DE COMUNICACION POR VIA ELECTRONICA, DIGITAL Y/O TELEFONICA.- EL (LA) 
          TRABAJADOR (A)</span> acepta y reconoce que <span className="font-bold uppercase">LA EMPRESA</span> se encuentra facultada para utilizar cualquier medio de comunicación
           electrónica, digital y/o telefónica; con la finalidad de poner en conocimiento de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>
           cualquier decisión y/o situación que guarde correspondencia con la relación laboral sostenida entre las partes. 
           Para tales efectos, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> proporciona la siguiente dirección electrónica  
           <span className="font-bold">  ________________________________________________________</span>
           , así como el número de celular ______________________________ mediante los cuales <span className="font-bold uppercase">AUTORIZA</span> que <span className="font-bold uppercase">LA EMPRESA </span>
           efectúe las comunicaciones que estime pertinente, las mismas que, una vez efectuadas, quedarán válidamente notificadas.
      </P>

      <P>
        <span className="font-bold uppercase">VIGESIMA TERCERA: DOMICILIOS Y JURISDICCION.-</span> Las partes senalan
         como sus respectivos domicilios los especificados en la introduccion del presente contrato;
        por lo que se reputaran validas todas las comunicaciones y notificaciones dirigidas a las mismas con motivo de la
        ejecucion del presente contrato. Todo cambio de domicilio de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> debera ser comunicado por
        escrito a <span className="font-bold uppercase">LA EMPRESA</span> para que surta efectos.
      </P>

      <P>
        Las partes contratantes se someten expresamente a la jurisdicción de las autoridades judiciales y administrativas
         de la Provincia de Virú, Departamento La Libertad.
      </P>

      <FirmaPage4 signatureSrc={signatureSrc} />
    </div>
  );
}

function Blank({
  value = "",
  widthMm = 40,
  pdfMode = false,
}: {
  value?: string;
  widthMm?: number;
  pdfMode?: boolean;
}) {
  return (
    <span
      className="inline-block font-bold text-center mx-1"
      style={{ 
        width: `${widthMm}mm`,
        borderBottom: "1px solid black",
        paddingBottom: pdfMode ? "2.5px" : "1px",
        verticalAlign: "baseline"
      }}
    >
      {value}
    </span>
  );
}

interface ContratoIntermitenteFormProps {
  client?: Cliente | null;
  puesto?: string;
  fechaInicio?: string;
  fechaFin?: string;
  remuneracion?: string | number | null;
  celular?: string;
  signatureSrc?: string;
  pagePart?: 1 | 2 | 3 | 4 | "all";
  pdfMode?: boolean;
}

export function ContratoIntermitenteForm({
  client,
  puesto,
  fechaInicio,
  fechaFin,
  remuneracion,
  celular,
  signatureSrc,
  pagePart = "all",
  pdfMode = false,
}: ContratoIntermitenteFormProps) {
  const codigo = (client?.cod || '').trim();

  const normalize = (value?: string | number | null) => {
    if (value === null || value === undefined) return "";
    const trimmed = String(value).trim();
    return trimmed;
  };

  const fullName =
    normalize(client?.apellidos_y_nombres) ||
    normalize(
      [client?.a_paterno, client?.a_materno, client?.nombre]
        .filter(Boolean)
        .join(" ")
    ) ||
      "";

  const dni = normalize(client?.dni);
  const address = normalize(client?.direccion);
  const fullAddress = address;
  const puestoValue = normalize(puesto);
  const formatDate = (value?: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    const isoDateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateOnly) {
      const [, year, month, day] = isoDateOnly;
      return `${day}/${month}/${year}`;
    }
    if (trimmed.includes("/")) return trimmed;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return trimmed;
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${parsed.getFullYear()}`;
  };
  const fechaInicioValue = formatDate(fechaInicio);
  const fechaFinValue = formatDate(fechaFin);
  const parseAmount = (value?: string | number | null) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return Number.isFinite(value) ? value : "";
    const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : "";
  };
  const formatAmount = (value: number) =>
    value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const remuneracionValue = parseAmount(remuneracion);
  const remuneracionMensual =
    remuneracionValue !== "" ? formatAmount(remuneracionValue) : "";
  const remuneracionDiaria =
    remuneracionValue !== "" ? formatAmount(remuneracionValue / 30) : "";
  const celularValue = normalize(celular);

  const BlankPdf = (props: { value?: string; widthMm?: number }) => (
    <Blank {...props} pdfMode={pdfMode} />
  );

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0">
      <style>{`
        [data-pdf-compact="true"] p {
          margin-top: 0.25rem !important;
        }
        [data-pdf-compact="true"] .mt-3 {
          margin-top: 0.35rem !important;
        }
        [data-pdf-compact="true"] .mt-2 {
          margin-top: 0.25rem !important;
        }
        [data-pdf-compact="true"] ol,
        [data-pdf-compact="true"] ul {
          margin-top: 0.25rem !important;
        }
        [data-pdf-compact="true"] li {
          margin-top: 0.1rem !important;
        }
        [data-pdf-page="1"][data-pdf-compact="true"] p {
          margin-top: 0.4rem !important;
          line-height: 1.7 !important;
        }
        [data-pdf-page="1"][data-pdf-compact="true"] .mt-3 {
          margin-top: 0.5rem !important;
        }
        [data-pdf-page="2"][data-pdf-compact="true"] p {
          line-height: 1.6 !important;
        }
        [data-pdf-page="3"][data-pdf-compact="true"] p {
          margin-top: 0.4rem !important;
          line-height: 1.7 !important;
        }
        [data-pdf-page="3"][data-pdf-compact="true"] .mt-3 {
          margin-top: 0.5rem !important;
        }
        [data-pdf-page="3"][data-pdf-compact="true"] ol,
        [data-pdf-page="3"][data-pdf-compact="true"] ul {
          margin-top: 0.4rem !important;
          line-height: 1.7 !important;
        }
        [data-pdf-page="3"][data-pdf-compact="true"] li {
          margin-top: 0.15rem !important;
          line-height: 1.7 !important;
        }
      `}</style>
      {pagePart !== 2 && pagePart !== 3 && pagePart !== 4 && (
        <PdfPage headerLeft="Versión 02" headerRight={codigo} pageNumber={1} pdfMode={pdfMode}>
        <Title>
          CONTRATO DE TRABAJO A PLAZO FIJO BAJO LA MODALIDAD DE CONTRATO
          <br />
          INTERMITENTE
        </Title>

        <P>
          Conste por el presente documento que se extiende por duplicado,<span className="font-bold uppercase"> EL CONTRATO
          DE TRABAJO A PLAZO FIJO BAJO LA MODALIDAD DE “CONTRATO DE TEMPORADA”</span>,
          que celebran al amparo del a Art. 67º de la Ley de Productividad y Competitividad Laboral aprobado por D. S. Nº 003-97-TR, las normas de la Ley N° 31110, Ley del Régimen Laboral Agrario y de Incentivos para el Sector Agrario y Riego, Agroexportador y Agroindustrial, y su Reglamento; de una parte, la empresa{" "}
          <span className="font-bold uppercase">AGUALIMA S.A.C.</span> con R.U.C N° 20512217452, y domiciliada en KM 512 Carretera Panamericana Norte, Provincia de Virú, Departamento de La Libertad; a quien en adelante se le denominará{" "}
          <span className="font-bold uppercase">LA EMPRESA</span>, representada{" "}
          representada YESSICA SELENE TORRES VILCHEZ identificada con D.N.I N° 40642893 con facultades inscritas en la P.E. 11829370 del Registro de Personas Jurídicas de Lima, y de la otra parte el Sr (a). 
        </P>

        <P center>
           <span className="font-bold">{fullName}</span> identificado(a) con DNI Nº{" "}
           <span className="font-bold">{dni}</span> con domicilio en{" "}
           <span className="font-bold">{fullAddress}</span>
        </P>

        <P>
          a quien en adelante se le denominará{" "}
          <span className="font-bold uppercase">EL (LA) TRABAJADOR(A)</span>, en los
          términos y condiciones siguientes:
        </P>

        <P>
           <span className="font-bold uppercase">PRIMERA: DEL EMPLEADOR.- LA EMPRESA </span> es una persona jurídica del sector Privado, dedicada a la agroindustria; esto es: cultivo de hortalizas y frutas. Entre ellos, el cultivo, pre cosecha y cosecha, empaque y exportación de espárrago blanco, arándano, mandarinas y paltas.
        </P>
        <P>
           <span className="font-bold uppercase">LA EMPRESA </span> declara que se encuentra sujeta y acogida a los alcances del Régimen Laboral Agrario, de conformidad con lo dispuesto en la Ley N° 31110, Ley del Régimen Laboral Agrario y de Incentivos para el Sector Agrario y Riego, Agroexportador y Agroindustrial, y su Reglamento.
        </P>

        <Clause>SEGUNDA: JUSTIFICACIÓN DE LA CONTRATACIÓN.-</Clause>
        <P>
          Por el presente contrato, las partes convienen que EL(A) TRABAJADOR(A) preste servicios intermitentes para EL EMPLEADOR en calidad de {" "}
           <span className="font-bold">{puestoValue}</span> a cambio de la retribución pactada en el presente contrato, para cumplir, y cubrir las necesidades de las actividades de EL EMPLEADOR, que, por su naturaleza y particularidades del sector agrario, son discontinuas.
        </P>
        <P>
          Las partes declaran conocer que las necesidades de trabajo de EL EMPLEADOR, al desarrollar una actividad de exportación agroindustrial, son discontinuas debido a los factores climáticos, biológicos, y otros que condicionan las actividades en el campo y consecuentemente todas las actividades conexas de la empresa, por lo que estos factores determinan que EL(A) TRABAJADOR(A) preste servicios de modo intermitente.
        </P>
        <P>
          Las labores del(a) trabajador (a) son de naturaleza regular, pero con periodos de discontinuidad, previo al periodo de tiempo en que los productos (frutas y la hortaliza) estén aptos para ser cosechados.
        </P>
        <P>
          En este contexto, LA EMPRESA requiere de los servicios de EL(A) TRABAJADOR(A), cuya contratación se encuentra íntimamente vinculada a la circunstancia descrita precedentemente; lo cual constituye la causa objetiva de la presente contratación modal a plazo determinado, quedando plenamente justificada su temporalidad.
        </P>

        <P>
           <span className="font-bold uppercase">TERCERA: CARGO Y FUNCIONES. - </span> Por el presente documento, LA EMPRESA contrata a plazo fijo, bajo la modalidad ya indicada en la cláusula precedente, los servicios personales de EL (LA) TRABAJADOR (A), para que se realice las labores y funciones propias y complementarias del puesto de  <span className="font-bold">{puestoValue}</span> pudiendo también desarrollar cualquier  otra función que le encomienden sus superiores. La prestación de servicios deberá ser efectuada de manera personal,  no pudiendo  <span className="font-bold uppercase">  EL (LA) TRABAJADOR (A </span> ser reemplazado ni ayudado por tercera persona. <span className="font-bold uppercase"> EL (LA) TRABAJADOR (A) </span> declara expresamente encontrarse capacitado para la prestación de los servicios contratados, los cuales llevará adelante según instrucciones que le imparta <span className="font-bold uppercase">LA EMPRESA. </span>
        </P>
        <P>
          EL TRABAJADOR se compromete a ejecutar las tareas propias de su cargo en cada oportunidad que se reanude la labor intermitente del contrato, cumpliendo con lo que disponga la Empresa.
        </P>
        <P>
          Las  Partes declaran que la labor intermitente del contrato se reanudará si y solo si se verifica una necesidad de  personal para atender las actividades de EL EMPLEADOR con posición dispuesto por el  Decreto Supremo N° 003-97-TR, las circunstancias o condiciones que deben observarse para que se reanude la labor intermitente vienen dadas por la necesidad de vacante en las secciones correspondientes en sus Fundos y/o Campos  y/o  Plantas, para satisfacer los requerimientos  de  siembra, cultivo, cosecha, riego, procesamiento, envasado y congelamiento, entre otras y la verificación de puestos vacantes para atender tales actividades, con relación a requerimientos de producción.
        </P>

        <P>
          EL EMPLEADOR está facultado a rotar a EL(A) TRABAJADOR(A), dentro de su categoría profesional y nivel, y sin modificar su remuneración, sin que ello suponga una variación sustancial del presente contrato de trabajo, en tanto que, EL EMPLEADOR, en ejercicio de su facultad de dirección y organización está facultado para incorporar estos cambios a fin de satisfacer las necesidades empresariales; pudiendo EL TRABAJADOR ejecutar las labores de OBRERO en otras unidades o áreas de la empresa.
        </P>

        <P>
          LAS PARTES convienen que EL(A) TRABAJADOR(A) puede prestar sus servicios tanto por unidad de tiempo o por unidad de obra, de acuerdo a los requerimientos de la producción diaria, por tal razón, cuando corresponda, el pago será por jornal diario, de conformidad con lo establecido en el presente contrato; o por destajo o tarea u obra ejecutada.
        </P>

        <P> 
          Para el desarrollo de sus funciones, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A) </span> recibirá equipos de protección personal, herramientas u otros, que son de propiedad de <span className="font-bold uppercase">LA EMPRESA. </span> En caso de término del vínculo laboral, por cualquiera de los supuestos establecidos en la Ley, o a solicitud de, <span className="font-bold uppercase">LA EMPRESA, EL (LA) TRABAJADOR (A) </span> devolverá dichos equipos de forma inmediata. En caso de pérdida, robo o daño por el uso inadecuado de los equipos, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A) </span> deberá cumplir con reponerlos en plazo breve, y el costo será asumido en su totalidad por <span className="font-bold uppercase">EL (LA) TRABAJADOR (A) </span>, quien autoriza expresamente a  <span className="font-bold uppercase">LA EMPRESA </span> a descontar de su remuneración y liquidación de beneficios sociales, el correspondiente valor no devuelto, así como los gastos que pudieran generarse por la no devolución oportuna de los mismos.
        </P>

        <P>
          <span className="font-bold uppercase">CUARTA: PLAZO Y VIGENCIA.- </span> El plazo del presente contrato comenzará a regir desde el <span className="font-bold">{fechaInicioValue}</span> concluyendo el día <span className="font-bold">{fechaFinValue}</span>, sin necesidad de comunicación previa por parte de LA EMPRESA. La suspensión de las labores por alguna de las causas previstas legalmente como: descansos pre y post natal, accidente de trabajo, enfermedad, etc., no interrumpirá el plazo de duración del presente contrato. Sin embargo, las partes, de común acuerdo, podrán nuevamente prorrogar o renovar el presente contrato respetando el derecho de preferencia del trabajador previsto en las leyes que regulan la presente contratación.
        </P>

        <P> 
          De conformidad con lo dispuesto en el artículo 10º del TUO del D. Leg.728, EL (LA) TRABAJADOR (A) se encontrará sujeto a un período de prueba de ley.
        </P>

        <P>
          <span className="font-bold uppercase">QUINTA: SUSPENSIÓN PERFECTA DE LABORES.- </span> Por la propia naturaleza de las actividades que realiza <span className="font-bold uppercase">LA EMPRESA</span>, se presentan circunstancias que paralizan en forma total o parcial las labores de todos o algunos de sus trabajadores. Por ello, las partes convienen expresamente en suspender en forma temporal y perfecta el presente contrato cuando se presenten:
        </P>

        <ol className="mt-2 list-decimal pl-5 text-justify">
          <li className="mt-1">Razones de falta o disminución de la materia prima o insumos.</li>
          <li className="mt-1">Fenómenos climáticos, de temperatura o estacional.</li>
          <li className="mt-1">Ausencia o disminución de la demanda en los mercados internos y de exportación.</li>
          <li className="mt-1">Casos fortuitos o de fuerza mayor.</li>
          <li className="mt-1">Otros que la ley establezca.</li>
        </ol>

        <P>
         <span className="font-bold uppercase">EL (LA) TRABAJADOR(A)</span> declara conocer que la suspensión perfecta de labores acordada previamente implica que temporalmente cesa su obligación de prestar el servicio y de <span className="font-bold uppercase">LA EMPRESA</span> de pagar la remuneración y demás beneficios laborales. Para ello la empresa comunica a EL(A) TRABAJADOR(A) esta situación mediante una boleta de suspensión de labores o de descanso temporal, consignando en dicho documento el periodo de suspensión, así como la fecha probable en que se reanudarán las labores. EL(A) TRABAJADOR(A) deberá presentarse en el centro de trabajo en la oportunidad fijada, con la finalidad de reincorporarse al área que venía laborando o a otra nueva, según las disposiciones que la empresa emita o inclusive de recibir la comunicación de una nueva o la continuación de la suspensión.
        </P>

        <P>
          La suspensión del presente contrato de trabajo por alguna de las causas previstas en el Art. 11 del D.S. N° 003-97-TR, incluyendo las que se den por la naturaleza intermitente ya señalada, no interrumpirán su vigencia, pues ésta seguirá siendo la misma.
        </P>

        <P>
          Respecto a esta suspensión perfecta de labores durante los periodos de inactividad de las labores agrícolas, EL TRABAJADOR y la  empresa acuerdan que transcurridos 03 días naturales desde el vencimiento del periodo de suspensión de labores (descansos temporales), sin que EL TRABAJADOR se haya apersonado al centro de trabajo, se entenderá que ello implica la manifestación del trabajador de no continuar la relación laboral y operará la extinción diferida del vínculo laboral por mutuo disenso, de conformidad con lo establecido en el artículo 16, inciso d) y el artículo 19° del Decreto Supremo N° 003-97-TR.
        </P>

        <P>
          <span className="font-bold uppercase"> SEXTA: HORARIO Y JORNADA LABORAL.- EL (LA) TRABAJADOR(A)</span>  observará bajo responsabilidad, el horario de trabajo establecido por <span className="font-bold uppercase">LA EMPRESA</span> de conformidad con las normas contenidas en el Decreto Supremo N° 007-2002-TR, que aprueba el Texto Único Ordenado de la Ley de Jornada de Trabajo, Horario y Trabajo en Sobretiempo, y su Reglamento, aprobado por Decreto Supremo N° 008-2002-TR. <span className="font-bold uppercase"></span>, tendrá una jornada laboral de 48 horas semanales, respetando el día de descanso semanal obligatorio, y el tiempo de refrigerio mínimo, el mismo que, conforme a Ley, no forma parte de la jornada de trabajo. En uso de sus facultades directrices, y de acuerdo a lo dispuesto en el artículo 2º del D. Leg.713, según las necesidades del negocio, el descanso podrá ser rotativo. 
        </P>
        </PdfPage>
      )}
      {pagePart !== 1 && pagePart !== 3 && pagePart !== 4 && (
        <PdfPage headerLeft="Versión 02" headerRight={codigo} pageNumber={2} pdfMode={pdfMode}>
  {/* Continúa cláusula SEXTA */}
  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> observará el horario de trabajo establecido en <span className="font-bold uppercase">LA EMPRESA</span>; sin embargo, <span className="font-bold uppercase">LA EMPRESA</span> podrá introducir cambios necesarios por la propia naturaleza variable de las actividades agrícolas y agroindustriales. En tal sentido, cuando se generen las llamadas bajas de producción, no previsibles en términos de tiempo y sujetas por lo general a factores no siempre determinados y ajenos a <span className="font-bold uppercase">LA EMPRESA</span>, la jornada laboral diaria se restringirá al tiempo necesario de acuerdo a los requerimientos de <span className="font-bold uppercase">LA EMPRESA</span> y a la observancia de sus normas técnicas.
  </P>

  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> y <span className="font-bold uppercase">LA EMPRESA</span> acuerdan que, de existir trabajo en sobretiempo, éste será compensado con tiempo de descanso equivalente, de acuerdo a lo regulado en el artículo 10° del Decreto Supremo No. 007-2002-TR. A fin de validar el trabajo en sobretiempo realizado, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> deberá cumplir con el procedimiento establecido por <span className="font-bold uppercase">LA EMPRESA</span> para la autorización de trabajo en sobretiempo y firmar el formato de autorización de trabajo en sobretiempo correspondiente.  
  </P>

  <P>
    <span className="font-bold uppercase">LA EMPRESA</span>, en ejercicio de su poder de dirección, podrá variar los horarios fijados, estableciendo nuevos turnos y horarios de trabajo, de acuerdo a sus necesidades de operación y dentro del marco legal y parámetros establecidos en el antes citado cuerpo normativo y su Reglamento aprobado por D.S.008-2002-TR. Sin perjuicio de lo pactado en la presente cláusula, <span className="font-bold uppercase">EL (LA)
    TRABAJADOR (A)</span> se compromete a mantener un permanente involucramiento y disponibilidad para prestar la colaboración necesaria, y de forma voluntaria, durante la jornada de trabajo, y en los días u horas, inclusive días de descanso y feriados, que por necesidades concretas de las actividades de <span className="font-bold uppercase">LA EMPRESA</span>, o por requerimientos especiales de la misma,
    <span className="font-bold uppercase">LA EMPRESA</span>, -en ejercicio de sus facultades directrices-, lo requiera, los cuales serán debidamente remunerados conforme a la normatividad vigente.
  </P>

  <P>
    <span className="font-bold uppercase">SEPTIMA: REMUNERACIÓN.-</span> - Conforme a lo dispuesto en el literal d) del artículo 3° de la Ley N° 31110, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> percibirá una Remuneración diaria (RD) ascendente a {" "}
    <span className="font-bold uppercase">{remuneracionDiaria}</span> o <span className="font-bold uppercase">{remuneracionMensual}</span> por período mensual.
    Dicho importe, de acuerdo a los alcances de la Ley N° 31110 Ley del Régimen Laboral Agrario y de Incentivos para el  Sector Agrario y Riego, Agroexportador y Agroindustrial, incluye a la compensación por tiempo de servicios y las gratificaciones de Fiestas Patrias y Navidad, y se actualizará en el mismo porcentaje que los incrementos de la Remuneración Mínima Vital. Asimismo, se precisa que en la planilla de remuneraciones se disgregará de manera independiente la remuneración básica, CTS y gratificaciones, de acuerdo a los porcentajes que corresponden a cada concepto.
  </P>

  <P>
    El importe remunerativo estará sujeto a las deducciones y retenciones de ley, las ausencias injustificadas por parte de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> implican la pérdida de la remuneración básica de modo proporcional a la duración de dicha ausencia, sin perjuicio del ejercicio de las facultades disciplinarias propias de <span className="font-bold uppercase">LA EMPRESA</span>, previsto en la legislación laboral y su Reglamento Interno. Será de cargo de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> el pago del Impuesto a la Renta, aplicable a toda remuneración que se le abone, los aportes y contribuciones previsionales y sociales a su cargo, así como cualquier otro tributo que grave las remuneraciones del personal dependiente. <span className="font-bold uppercase">LA EMPRESA</span> cumplirá con efectuar las retenciones y descuentos de ley. <span className="font-bold uppercase">LA EMPRESA</span> se reserva el derecho de hacer las retenciones que de acuerdo a ley o mandato judicial correspondiente.
  </P>

  <P>
    <span className="font-bold uppercase">OCTAVA: EL (LA) TRABAJADOR (A)</span>, se reserva el derecho a reubicar a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> en otro cargo de igual categoría dentro de la organización, de acuerdo a sus requerimientos y conveniencias siempre que dicho cambio no implique reducción inmotivada de remuneración o categoría.
  </P>


  <P>
    <span className="font-bold uppercase">NOVENO: PODER DE DIRECCIÓN. - LA EMPRESA</span> se reserva el derecho a reubicar a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> en otro cargo de igual
    categoría dentro de la organización, de acuerdo a sus requerimientos y conveniencias, siempre
    que dicho cambio no implique reducción inmotivada de remuneración o categoría.
  </P>

  <P>
    <span className="font-bold uppercase">LA EMPRESA</span> ,  al amparo del artículo 9° de la Ley de Productividad y Competitividad Laboral (LPCL), está facultada para introducir cambios, modificaciones al horario y jornada de trabajo, establecer jornadas acumulativas, alternativas, flexibles, compensatorias y horarios diferenciados, así como la forma y modalidad de la prestación de las labores, dentro de criterios de razonabilidad y teniendo en cuenta las necesidades del centro de trabajo; sin que dichas variaciones signifiquen menoscabo de categoría y/o remuneración.
  </P>

  <P>
    <span className="font-bold uppercase">DECIMA: DEBERES DEL TRABAJADOR.-</span>  Durante el desarrollo de las labores que le competen a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, éste se sujetará a las disposiciones de dirección y administración de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>.
  </P>

  <P>
    Asimismo, deberá cumplir con las normas propias del centro de trabajo, las contenidas en el Reglamento Interno de Trabajo, de Seguridad y Salud en el Trabajo, de Seguridad Alimentaria y demás normas laborales; y las que se impartan por necesidades del servicio en ejercicio de las facultades de administración de <span className="font-bold uppercase">LA EMPRESA</span>, de conformidad con el artículo 9° del T.U.O de la Ley de Productividad y Competitividad Laboral aprobado por D.S. Nº 003-97-TR; asimismo, se compromete a cumplir sus obligaciones con buena fe, lealtad, eficiencia y responsabilidad, velando por los intereses de <span className="font-bold uppercase">LA EMPRESA</span>, y cumpliendo con los estándares de asistencia laboral y ejecución de las tareas encargadas.
  </P>

  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se obliga ante <span className="font-bold uppercase">LA EMPRESA</span> en forma expresa a ejecutar mientras dure la vigencia de su contrato las siguientes reglas de trabajo:
  </P>

  <ol className="mt-2 list-decimal pl-5 text-justify">
    <li className="mt-1">
      Cumplir y acatar las órdenes y disposiciones que bajo dirección y control de la empresa pudiera recibir directamente de sus jefes inmediatos superiores o los gerentes de <span className="font-bold uppercase">LA EMPRESA</span>.
    </li>
    <li className="mt-1">
      Cumplir con los procesos y métodos de trabajo inherentes a su puesto de labor, así como las cargas y condiciones de trabajo del puesto que ocupe, de conformidad a las disposiciones internas de <span className="font-bold uppercase">LA EMPRESA</span> y/o normas convencionales vigentes.
    </li>
    <li className="mt-1">
      Reconocer la facultad de <span className="font-bold uppercase">LA EMPRESA</span> a planificar y ordenar las labores que debe desarrollar el trabajador, así como reservarse la facultad de poder reubicar a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> en los horarios y turnos que requiera su actividad, o en cualquier otro puesto de similar categoría y remuneración, o en otra área o sección de trabajo, que guarde relación con el origen de la contratación.
    </li>
    <li className="mt-1">
      A conocer que las obligaciones y condiciones de trabajo establecidas en la presente clausula con solamente enunciativas pudiéndose dar otras más durante la ejecución del contrato, las cuales serán cumplidas también por <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> siempre que se refieran a disposiciones de carácter laboral y que sean necesarias para optimizar y hacer productiva, a criterio del empleador, la labor contratada.
    </li>
    <li className="mt-1">
      A cumplir con las disposiciones vigentes en la empresa y certificaciones relacionadas con aspectos ambientales, de calidad y seguridad que existan en <span className="font-bold uppercase">LA EMPRESA</span>.
    </li>
  </ol>

  <P>
    La enumeración antes indicada es enunciativa y no limitativa, toda vez que, de acuerdo a las necesidades de <span className="font-bold uppercase">LA EMPRESA</span>, ésta puede introducir obligaciones adicionales y/o conexas que no resulten contrarias a las descritas en el presente documento.
  </P>

  <P>
    <span className="font-bold uppercase">DÉCIMO PRIMERA: CONFIDENCIALIDAD.- EL (LA) TRABAJADOR (A)</span> mantendrá confidencialidad absoluta durante la vigencia de este contrato, respecto de las informaciones y documentos en general proporcionados por <span className="font-bold uppercase">LA EMPRESA</span> o que hubiera obtenido en ejecución del mismo. Asimismo, se obliga a no divulgar a terceros ajenos a la empresa (dentro de los que se incluyen a los medios de comunicación), toda información legal, financiera, contable o aquella relativa al desarrollo de las operaciones o actividades de <span className="font-bold uppercase">LA EMPRESA</span> , incluidos sus clientes o el diseño de sus sistemas y procesos de exportación, importación, producción y/o comercialización y marketing, ya sea que estén incorporados o no en documentos escritos, archivos, cintas magnéticas, cassets, disquetes, videos, películas, entre otros medios que le fueran proporcionados directa o indirectamente, por ejecutivos, analistas financieros, contadores o abogados relacionados directa o indirectamente con <span className="font-bold uppercase">LA EMPRESA</span>.
  </P>

  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a no retirar de <span className="font-bold uppercase">LA EMPRESA</span>, mediante medios físicos, electrónicos u otros, ningún proceso o programa de cómputo. Además de las obligaciones anteriores que son de índole personal, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> velará para que durante el periodo que se realice sus labores, terceras personas no tengan acceso a retirar parcial o totalmente cualquiera de los programas de cómputo de propiedad de <span className="font-bold uppercase">LA EMPRESA</span> o información relativa a sus clientes.
  </P>

  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>  responderá ante <span className="font-bold uppercase">LA EMPRESA</span> por los daños y perjuicios que cause derivados del incumplimiento de lo previsto en esta cláusula, sin perjuicio de la incursión en falta grave por expreso incumplimiento de sus obligaciones laborales y la buena fe laboral, conforme previsto en la Ley de Productividad y Competitividad Laboral, lo cual configura causal de despido justificado.
  </P>

  <P>
    Esta obligación subsistirá aún después de terminada la relación laboral y su incumplimiento genera la correspondiente responsabilidad por daños y perjuicios, sin desmedro de la persecución penal por el delito previsto en el artículo 165° del Código Penal y además por lo dispuesto por el inciso d) del artículo 25º del D.S. 003-97-TR. EL (LA) TRABAJADOR (A) se obliga a entregar, al término del contrato, los documentos, materiales e informes a los que hubiera tenido acceso con motivo de la ejecución del mismo.
  </P>

  <P>
    <span className="font-bold uppercase">DÉCIMO SEGUNDA: NO DISCRIMINACIÓN.- LA EMPRESA</span>, en observancia de lo prescrito en el artículo 2, inciso 2 de la Constitución Política del Perú y en el Convenio 111 de la Organización Internacional del Trabajo, y consciente de que todas las personas son únicas e irrepetibles y de que su identidad está formada por una diversidad de aspectos, muchos de los cuales no involucran una mayor o menor idoneidad para el puesto de trabajo que puedan ocupar; declara que en la presente contratación no ha mediado discriminación ni favoritismo sin causa objetiva, y se obliga a no efectuar distinciones, exclusiones o preferencias, respecto de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>,  basadas en motivos de raza, color, sexo, identidad de género, orientación sexual, embarazo, discapacidad, condición seropositiva, conocida o supuesta; religión, opinión política, sindicación, ascendencia, nacionalidad, origen social, lengua, condición económica ni cualquier otro motivo especificado por la legislación nacional, el Tribunal Constitucional o la Organización Internacional del Trabajo.
  </P>

  <P>
    <span className="font-bold uppercase">DÉCIMO TERCERA: SEGURIDAD Y SALUD EN EL TRABAJO. - EL (LA) TRABAJADOR (A)</span> se compromete a respetar y dar estricto cumplimiento a las normas sobre seguridad y salud en el trabajo que LA EMPRESA establezca como medidas de prevención de accidentes y protección de los trabajadores y de todos los bienes e instalaciones de la misma. Asimismo, deberá cooperar plenamente en casos de accidente y/o siniestros, así como en la prevención de los mismos, quedando establecido que todo accidente de trabajo acerca del cual tuviera conocimiento <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, deberá ser reportado en forma inmediata a fin de tomar las medidas urgentes que sean necesarias. Igualmente, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a contribuir al desarrollo de los programas de capacitación y entrenamiento que implemente <span className="font-bold uppercase">LA EMPRESA</span> en materia de seguridad y salud en el trabajo.
  </P>
        </PdfPage>
      )}
      {pagePart !== 1 && pagePart !== 2 && pagePart !== 4 && (
        <PdfPage headerLeft="Version 02" headerRight={codigo} pageNumber={3} pdfMode={pdfMode}>
  <P tight>
    <span className="font-bold uppercase">LA EMPRESA</span>, en cumplimiento de lo dispuesto por el artículo 35° de la Ley 29783, Ley de Seguridad y Salud en el trabajo, entrega a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> una descripción de las recomendaciones de seguridad y salud en el trabajo para el puesto que este ocupara en virtud a la celebración del presente contrato. Dicha descripción se entrega a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> como documento adjunto al presente contrato y detalla lo siguiente: (i) Los riesgos (químicos, físicos, biológicos, ergonómicos, mecánicos, psicosociales, entre otros) a los que se pudiera ver expuesto el trabajador con motivo del desempeño de sus funciones; y, (ii) Las recomendaciones de seguridad y salud en el trabajo para reducir o mitigar tales riesgos detectados.
  </P>

  <P>
    Por su parte <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a observar estrictamente las pautas contenidas en la descripción de recomendaciones de seguridad y salud en el trabajo. Cualquier inobservancia de las recomendaciones referidas, que exponga a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> a un riesgo mayor, será debidamente sancionada por <span className="font-bold uppercase">LA EMPRESA</span>.
  </P>

  <P>
    <span className="font-bold uppercase">LA EMPRESA</span> se compromete a actualizar periódicamente la descripción de las recomendaciones de seguridad y salud en el trabajo de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>; en particular, en aquellos supuestos en que se le asignen nuevas funciones o cuando se detecten riesgos adicionales para su seguridad y salud, con motivo de la mejora continua del Sistema de Gestión de la Seguridad y Salud en el trabajo de <span className="font-bold uppercase">LA EMPRESA</span>.
  </P>

  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se obliga a cuidar de su persona y los bienes de su propiedad o posesión, y a no exponerse voluntaria o negligentemente a situaciones de riesgo en que pudiere contraer enfermedades o sufrir accidentes en el trabajo. Asimismo, no compartirá sus útiles personales con los demás trabajadores ni sus utensilios al consumir su refrigerio, de ser el caso. El incumplimiento de estas disposiciones da lugar a la imposición de las sanciones establecidas en los reglamentos, normas y procedimientos de la empresa y en los dispositivos legales vigentes, en materia de seguridad y salud en el trabajo.
  </P>

  <P>
    <span className="font-bold uppercase">DECIMO QUINTA: AUTORIZACIÓN DE DESCUENTO POR PLANILLA.- EL (LA) TRABAJADOR (A)</span>, en caso vulnere los estándares y procedimientos establecidos por LA EMPRESA, y tal situación ocasionare un perjuicio económico para ésta, autoriza que la misma le descuente de su remuneración la cantidad equivalente al perjuicio o pérdida ocasionados en infracción de tales estándares. 
  </P>

  <P>
    Asimismo, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> deberá reintegrar a <span className="font-bold uppercase">LA EMPRESA</span> el valor de los bienes que estando bajo su responsabilidad o custodia se perdieren o deterioraren por descuido o negligencia debidamente comprobada; así como los montos de dinero de propiedad de <span className="font-bold uppercase">LA EMPRESA</span>, a los que pudiere tener acceso con ocasión de sus funciones o que estén bajo su custodia; o los valores que resultaren en deudas derivadas de la ejecución del presente contrato o préstamos personales que le hubiere otorgado LA EMPRESA; o daños ocasionados durante la ejecución del mismo que originen un saldo deudor de cargo de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, para lo cual autoriza igualmente el respectivo descuento por planillas, o con cargo a su liquidación de beneficios sociales en caso de cese de la relación laboral.
  </P>

   <P>
    <span className="font-bold uppercase">DECIMO SEXTA: AUTORIZACIÓN PARA RECOPILACIÓN Y TRATAMIENTO DE DATOS PERSONALES.-</span> declara:
   </P>

  <ol className="mt-2 list-decimal pl-5 text-justify">
    <li className="mt-1">
      Declaro expresamente, que, para efectos de la suscripción del presente contrato, he suministrado mis datos personales. Asimismo, durante la ejecución del servicio LA EMPRESA podrá tener acceso a otros datos personales míos, suministrados o no por mí, o de ser el caso de cualquier otra persona.    
    </li>
    <li className="mt-1">
      Declaro que LA EMPRESA me ha informado de manera expresa que la información que he proporcionado, como son: nombre, apellido, nacionalidad, estado civil, documento de identidad, ocupación, estudios, domicilio, correo electrónico, teléfono, estado de salud, actividades que realiza, ingresos económicos, patrimonio, gastos, entre otros, así como la referida a los rasgos físicos y/o de conducta que lo identifican o lo hacen identificable como es su huella dactilar, firma, voz, etc. (datos biométricos), conforme a Ley es considerada como Datos Personales.
    </li>
    <li className="mt-1">
      Doy mi consentimiento libre, previo, expreso e informado para que mis Datos Personales sean tratados por <span className="font-bold uppercase">LA EMPRESA</span>, es decir, que puedan ser: recopilados, registrados, organizados, almacenados, conservados, elaborados, modificados, bloqueados, suprimidos, extraídos, consultados, utilizados, transferidos o procesados de cualquier otra forma prevista por Ley. Esta autorización es indefinida y se mantendrá inclusive después de terminado el servicio y/o el presente Contrato.
    </li>
    <li className="mt-1">
      Autorizo que mis datos sean compartidos, transmitidos, entregados, transferidos o divulgados para las finalidades mencionadas a: i) Personas jurídicas que tienen la calidad de filiales, subsidiarias, contratistas o vinculadas, o de matriz de <span className="font-bold uppercase">LA EMPRESA</span>, ii) Los operadores necesarios para el cumplimiento de los servicios que presta <span className="font-bold uppercase">LA EMPRESA</span>, tales como: call centers, investigadores, compañías de asistencia, contratistas, y empresas interesadas en las labores de consultoría sobre el perfil de calidades y competencia de personal para llenar sus vacantes de trabajo, entre otros.
    </li>
    <li className="mt-1">
      Declaro que me han informado que tengo derecho a no proporcionar mis Datos Personales y que si no los proporciona no podrán tratar mis Datos Personales en la forma explicada en la presente cláusula, lo que no impide su uso para la ejecución y cumplimiento del Contrato.
    </li>
    <li className="mt-1">
      Asimismo, declaro conocer que puedo revocar el consentimiento para tratar mis Datos Personales en cualquier momento. Para ejercer este derecho o cualquier otro que la Ley establece con relación a sus Datos Personales deberá presentar una solicitud escrita a mi empleador.
    </li>
  </ol>

  <P>
    <span className="font-bold uppercase">DÉCIMO SEXTA: USO Y ENTREGA DIGITAL DE DOCUMENTOS LABORALES. -</span> Al amparo de lo dispuesto en el artículo 1° del Decreto Supremo 009-2011-TR, que modificó los artículos 18, 19 y 20 del Decreto Supremo N° 001-98-TR, y dentro de los alcances de las normas de simplificación en materia laboral contenidas en el Decreto Legislativo 1310, <span className="font-bold uppercase">LA EMPRESA</span> se encuentra facultada a suscribir las boletas de pago de manera digital. Asimismo, podrá hacer uso del sistema digital de entrega de dichas boletas, a través de mecanismos electrónicos.
  </P>

  <P>
    De igual manera, <span className="font-bold uppercase">LA EMPRESA</span>, se encuentra facultada para implementar el sistema de firma y entrega digital de otros documentos laborales aparte de las boletas de pago, tales como las hojas de liquidación por tiempo de servicios – CTS, hojas de liquidaciones de participación en las utilidades por el ejercicio gravable, gratificaciones, liquidaciones de beneficios sociales, certificado de renta y retenciones de quinta categoría, certificado de trabajo, comprobante de retenciones por aportes al sistema privado de pensiones, entre otros documentos (en adelante, los Documentos Laborales).
  </P>

  <P>
    <span className="font-bold uppercase">LA EMPRESA</span>, en virtud de lo dispuesto en el Decreto
     Legislativo 1310, se encuentra facultado para sustituir su firma ológrafa y el sellado manual por 
     su firma digital, conforme lo regulado por el artículo 141-A del Código Civil; o, su firma electrónica,
      emitida conforme a lo regulado por la Ley número 27269, Ley de Firmas y Certificados Digitales, en todos 
      los documentos laborales que emita. Por su parte, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> 
      reconoce dicha facultad del empleador, y <span className="font-bold uppercase">autoriza</span> 
      la entrega de manera digital de sus boletas de pago de remuneraciones, vacaciones, liquidación de CTS, 
      de utilidades, de Beneficios Sociales, y cualquier otro documento en materia laboral; 
      reconociendo <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> que 
      no se requiere firma de recepción de su parte en el supuesto que dichos documentos 
      sean puestos a su disposición mediante el uso de tecnologías de la información y 
      comunicación. Incluso, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> otorgará para 
      la comunicación vía remota (debido a estas circunstancias), el correo electrónico :
    <span className="font-bold">  ________________________________________________________</span> y el número telefónico celular: <span className="font-bold">  ____________________________</span>;
    siendo estos válidos para las comunicaciones que efectuará{" "}
    <span className="font-bold uppercase">LA EMPRESA</span>.
  </P>


  <P>
    Asimismo, a través del portal digital y/o cuenta de correo electrónico del
     trabajador, la empresa remitirá otros documentos de índole laboral tales como: 
     Reglamento Interno de Trabajo, Reglamento de Seguridad y Salud en el Trabajo, 
     Directivas, Procedimientos y demás normas conexas. Por su parte, <span 
     className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete 
     a descargar los documentos laborales, revisar su contenido, y a dar cabal 
     cumplimiento en cuanto corresponda a sus obligaciones; declarando estar 
     instruido que la remisión de los mismos, a través de dichos medios de tecnología
      de la información y comunicación, es señal de conformidad con su entrega. De 
      igual manera, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se 
      compromete a lo siguiente:
  </P>

  <ol className="mt-2 list-decimal pl-5 text-justify">
    <li className="mt-1">
      Contar con una cuenta activa de correo electrónico, la cual deberá proporcionar
       a LA EMPRESA en el plazo de 02 días hábiles de iniciada la relación laboral. 
       En caso <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> no confirme su dirección de correo electrónico
        en el plazo antes mencionado, acepta que LA EMPRESA envíe los Documentos
         Laborales al Portal digital o al portal que ésta contrate, dándolos por 
         aceptados por parte de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> y por notificados por <span className="font-bold uppercase">LA EMPRESA</span>. 
         No obstante, lo anterior, en el momento que <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> cuente con 
         un correo electrónico y este sea comunicado a LA EMPRESA podrá acceder a la
          información disponible en el Portal.
    </li>
    <li className="mt-1">
      Mantener activo el correo electrónico y revisar 
      periódicamente la plataforma digital a fin de tomar conocimiento de 
      los Documentos Laborales remitidos por <span className="font-bold uppercase">LA EMPRESA</span>.
    </li>
    <li className="mt-1">
      Dado que bajo este procedimiento de entrega digital de Documentos Laborales, 
      la firma de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> no es obligatoria, aquel deberá confirmar 
      expresamente la recepción de cada uno de los Documentos Laborales remitidos al 
      trabajador por parte de <span className="font-bold uppercase">LA EMPRESA</span>, dando conformidad de recepción de los 
      documentos marcando la opción correspondiente a través de la plataforma digital 
      o mediante el acuse de recibo a través de su cuenta de correo electrónico o a 
      través de otro mecanismo análogo de confirmación. En caso <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> 
      no realice el reclamo dentro del plazo establecido (3 días hábiles de remitidos 
      los documentos laborales), se entenderá por aceptados la entrega y contenido de 
      los documentos. En caso tuviera alguna consulta, queja, observación o detectara 
      un error, deberá acercarse inmediatamente o enviar una comunicación escrita dentro
       de dicho término al correo corporativo del Departamento de Asuntos Corporativos & 
       Gestión Humana : <span className="underline text-blue-700">acgh@agualima.com</span>  a fin de procurar resolverlo de común acuerdo 
       entre las partes. En caso no lo hiciera, se entenderá que está conforme con su contenido.
    </li>
  </ol>
        </PdfPage>
      )}
      {pagePart !== 1 && pagePart !== 2 && pagePart !== 3 && (
        <PdfPage headerLeft="Version 02" headerRight={codigo} pageNumber={4} pdfMode={pdfMode}>
          <ContratoIntermitentePage4Content signatureSrc={signatureSrc} />
        </PdfPage>
      )}

    </div>
  );
}






