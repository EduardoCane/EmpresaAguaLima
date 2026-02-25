import React from "react";
import { Cliente } from "@/types";
import firmaempresa2 from "@/img/firmaempresa2.jpeg";

const FIRMA_EMPRESA_SRC = firmaempresa2;

/* =========================================================
  CONTRATO DE TEMPORADA (3 PAGINAS)
  - Pagina 1: contrato base con datos dinamicos (nombre, DNI, domicilio, puesto, fechas, remuneracion)
  - Pagina 2: clausulas adicionales (confidencialidad, SST, datos, entrega digital)
  - Pagina 3: regimen laboral, suspension, comunicaciones y firmas finales
   ========================================================= */

function LineField({ value = "#N/D", widthMm = 60 }: { value?: string; widthMm?: number }) {
  return (
    <span className="inline-flex flex-col items-center" style={{ width: `${widthMm}mm` }}>
      <span className="block text-center font-bold text-[10px] leading-[12px] pb-[2mm]">{value}</span>
      <span className="block w-full border-b border-black" />
    </span>
  );
}

const PAGE_WIDTH_PX = 794; // A4 ~210mm @96dpi
const PAGE_HEIGHT_PX = 1123; // A4 height @96dpi
const PADDING_PX = 52; // ~14mm

function PdfPage({
  headerLeft,
  headerRight,
  pageNumber,
  isLast = false,
  bodyTopMarginPx = 16,
  bodyLineHeight = 1.45,
  children,
}: {
  headerLeft?: string;
  headerRight?: string;
  pageNumber: number;
  isLast?: boolean;
  bodyTopMarginPx?: number;
  bodyLineHeight?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="pdf-page mx-auto bg-white text-black shadow-sm print:shadow-none"
      data-pdf-page={pageNumber}
      style={{
        width: `${PAGE_WIDTH_PX}px`,
        minHeight: `${PAGE_HEIGHT_PX}px`,
        paddingTop: `${PADDING_PX}px`,
        paddingBottom: `${PADDING_PX}px`,
        paddingLeft: `${PADDING_PX}px`,
        paddingRight: `${PADDING_PX}px`,
        fontFamily: '"Times New Roman", Times, serif',
        boxSizing: "border-box",
        ...(isLast ? {} : { breakAfter: "page", pageBreakAfter: "always" }),
      }}
    >
      <div className="flex items-start justify-between text-[10px] leading-[12px]">
        <div className="italic">{headerLeft ?? ""}</div>
        <div className="font-bold">{headerRight ?? ""}</div>
      </div>
      <div
        className="text-[9.5px]"
        style={{
          lineHeight: String(bodyLineHeight),
          marginTop: `${bodyTopMarginPx}px`,
          hyphens: "none",
          WebkitHyphens: "none",
          msHyphens: "none",
          wordBreak: "normal",
          overflowWrap: "normal",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function P({ children, center, tight }: { children: React.ReactNode; center?: boolean; tight?: boolean }) {
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
        wordSpacing: "normal",
        letterSpacing: "0px",
        marginTop: tight ? "0" : "8px",
      }}
    >
      {children}
    </p>
  );
}

function TitleTemporada() {
  return (
    <div className="text-center mt-2">
      <p className="font-bold uppercase underline underline-offset-2 text-[10px] leading-[12px]">
        CONTRATO DE TRABAJO A PLAZO FIJO BAJO LA MODALIDAD DE CONTRATO
      </p>
      <p className="font-bold uppercase underline underline-offset-2 text-[10px] leading-[12px] mt-1">
        DE TEMPORADA
      </p>
    </div>
  );
}

function IntroFieldsRow({ name, dni, address }: { name: string; dni: string; address: string }) {
  return (
    <div className="mt-4 flex items-end justify-between gap-3">
      <LineField widthMm={68} value={name || "#N/D"} />
      <span className="text-[9.5px] leading-[12px]">identificado (a) con DNI N</span>
      <LineField widthMm={28} value={dni || "#N/D"} />
      <span className="text-[9.5px] leading-[12px]">con domicilio en</span>
      <LineField widthMm={68} value={address || "#N/D"} />
      <span className="text-[9.5px] leading-[12px]">,</span>
    </div>
  );
}

function ClauseInline({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <P>
      <span className="font-bold underline underline-offset-2">{label}</span> {children}
    </P>
  );
}

function UnderlineOnly({ widthMm, value }: { widthMm: number; value?: string }) {
  return (
    <span className="inline-flex flex-col items-center" style={{ width: `${widthMm}mm` }}>
      <span className="block text-center font-bold text-[10px] leading-[12px] pb-[2mm]">
        {value ?? ""}
      </span>
      <span className="block w-full border-b border-black" />
    </span>
  );
}

function FirmaTemporadaFinal({ signatureSrc }: { signatureSrc?: string }) {
  return (
    <div className="mt-auto" style={{ paddingTop: "4mm" }}>
      <div className="grid grid-cols-2 gap-14 items-start">
        <div className="text-center">
          <img
            src={FIRMA_EMPRESA_SRC}
            alt="Firma empresa"
            className="mx-auto w-[55mm] h-auto object-contain"
            draggable={false}
          />
          <div className="mt-2 leading-[12px]">
            <p className="font-bold uppercase text-[10px]">LA EMPRESA</p>
            <p className="font-bold">Selene Torres Vilchez</p>
            <p className="font-bold">Responsable de Asuntos Corporativos</p>
            <p className="font-bold">&amp; Gestion Humana</p>
            <p className="font-bold uppercase">AGUALIMA S.A.C.</p>
          </div>
        </div>

        <div className="text-center">
          <div className="mx-auto relative h-[20mm] w-[70mm] mb-2 flex items-end justify-center">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-black" />
            {signatureSrc ? (
              <img
                src={signatureSrc}
                alt="Firma del trabajador"
                className="h-[16mm] w-auto max-w-[66mm] object-contain"
              />
            ) : null}
          </div>
          <p className="font-bold uppercase text-[10px]">EL TRABAJADOR</p>

          <div className="mx-auto mt-8" style={{ width: "90mm" }}>
            <div className="relative h-[18mm] w-full flex items-end justify-center">
              {signatureSrc ? (
                <img
                  src={signatureSrc}
                  alt="Firma de recepcion del trabajador"
                  className="h-[16mm] w-auto max-w-[88mm] object-contain"
                />
              ) : null}
            </div>
            <div className="border-b border-black mb-1" />
            <p className="font-bold uppercase text-[10px] leading-[12px]">
              DECLARO HABER RECIBIDO LA COPIA DE MI
              <br />
              CONTRATO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ContratoTemporadaPlanFormProps {
  client?: Cliente | null;
  puesto?: string;
  fechaInicio?: string;
  fechaFin?: string;
  remuneracion?: string | number | null;
  signatureSrc?: string;
  celular?: string;
  pagePart?: 1 | 2 | 3 | "all";
}

export function ContratoTemporadaPlanForm({
  client,
  puesto,
  fechaInicio,
  fechaFin,
  remuneracion,
  signatureSrc,
  celular,
  pagePart = "all",
}: ContratoTemporadaPlanFormProps) {
  const normalize = (value?: string | number | null) => {
    if (value === null || value === undefined) return "";
    const trimmed = String(value).trim();
    return trimmed;
  };

  const codigo = normalize(client?.cod);

  const fullName =
    normalize(client?.apellidos_y_nombres) ||
    normalize([client?.a_paterno, client?.a_materno, client?.nombre].filter(Boolean).join(" "));

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
  const fechaInicioValue = formatDate(fechaInicio) || "#N/D";
  const fechaFinValue = formatDate(fechaFin) || "#N/D";

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
  const remuneracionMensual = remuneracionValue !== "" ? formatAmount(remuneracionValue) : "#N/D";
  const remuneracionDiaria = remuneracionValue !== "" ? formatAmount(remuneracionValue / 30) : "#N/D";
  const celularValue = normalize(celular) || "________________________";
  const celularValueUnderline = normalize(celular) || "";

  const page1 = (
    <PdfPage headerLeft="Version 02" headerRight={codigo} pageNumber={1}>
      <TitleTemporada />

      <P>
        Conste por el presente documento que se extiende por duplicado, 
        <span className="font-bold uppercase">EL CONTRATO DE TRABAJO A PLAZO FIJO BAJO LA MODALIDAD DE “CONTRATO DE TEMPORADA”</span>, 
        que celebran al amparo del a Art. 67º de la Ley de Productividad y Competitividad 
        Laboral aprobado por D. S. Nº 003-97-TR, las normas de la Ley N° 31110, Ley del 
        Régimen Laboral Agrario y de Incentivos para el Sector Agrario y Riego, Agroexportador 
        y Agroindustrial, y su Reglamento; de una parte, la empresa <span className="font-bold uppercase">AGUALIMA S.A.C.</span> con R.U.C 
        N° 20512217452, y domiciliada en KM 512 Carretera Panamericana Norte, Provincia de Virú,
         Departamento de La Libertad; a quien en adelante se le denominará <span className="font-bold uppercase">LA EMPRESA</span>, 
         representada YESSICA SELENE TORRES VILCHEZ identificada con D.N.I N° 40642893 
         con facultades inscritas en la P.E. 11829370 del Registro de Personas Jurídicas 
         de Lima, y de la otra parte el Sr (a). 
      </P>

<<<<<<< HEAD
       <P center>
           <span className="font-bold">{fullName}</span> identificado (a) con DNI Nº{" "}
=======
<<<<<<< HEAD
       <P center>
           <span className="font-bold">{fullName}</span> identificado (a) con DNI Nº{" "}
=======
<<<<<<< HEAD
       <P center>
           <span className="font-bold">{fullName}</span> identificado (a) con DNI Nº{" "}
=======
<<<<<<< HEAD
       <P center>
           <span className="font-bold">{fullName}</span> identificado (a) con DNI Nº{" "}
=======
<<<<<<< HEAD
       <P center>
           <span className="font-bold">{fullName}</span> identificado (a) con DNI Nº{" "}
=======
      <P center>
           <span className="font-bold">{fullName}</span> identificado(a) identificado (a) con DNI Nº{" "}
>>>>>>> ec1eabe9348520c82121c88f0e4054c21d1f338e
>>>>>>> f0e56ed59eb76318885995a3a23a80ecc9c9a8ad
>>>>>>> cceba747610bb152877dc1cbd902f7f8a601f584
>>>>>>> 2f8d00b3a06e0a7fd9751ad37c655afdb72d1e13
>>>>>>> cebba9ea39b8826a33a8451f802824cc315d7f32
           <span className="font-bold">{dni}</span> con domicilio en{" "}
           <span className="font-bold">{fullAddress}</span>
        </P>

      <P>
        a quien en adelante se le denominará <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, en los términos y condiciones siguientes:
      </P>

      <ClauseInline label="PRIMERA:">
        <span className="font-bold uppercase">DEL EMPLEADOR.- LA EMPRESA</span> es una persona jurídica 
        del sector Privado, dedicada a la agroindustria; esto es: cultivo de hortalizas 
        y frutas. Entre ellos, el cultivo, pre cosecha y cosecha, empaque 
        y exportación de espárrago blanco.
      </ClauseInline>

      <P>
        <span className="font-bold uppercase">LA EMPRESA</span> declara que se encuentra sujeta y acogida a los alcances del
         Régimen Laboral Agrario, de conformidad con lo dispuesto en la Ley N° 
        31110, Ley del Régimen Laboral Agrario y de Incentivos para el Sector 
        Agrario y Riego, Agroexportador y Agroindustrial, y su Reglamento.
      </P>

      <ClauseInline label="SEGUNDA:">
        <span className="font-bold uppercase">JUSTIFICACIÓN DE LA CONTRATACIÓN. - LA EMPRESA</span>
        requiere cubrir la necesidad operativa de labores y cosecha de palto, 
        labor que tiene naturaleza iregular, propia del giro de la empresa pero que
         se cumple solo en determinadas épocas del año, esto es, del mes de noviembre 
         al mes de marzo de cada año, salvo que, extraordinariamente, por razones
          climáticas se extienda y justifique dicho requerimiento.
      </ClauseInline>

      <P>
        El carácter temporal del contrato se funda en lo dispuesto por el Art. 67º de
         la Ley de Productividad y Competitividad Laboral aprobado por D. S. Nº 003-97-TR, 
         y normas complementarias, de acuerdo al cual, pueden celebrarse contratos de
          temporada con el objeto de atender necesidades propias del giro de la empresa
           o establecimiento, que se cumplen solo en determinadas épocas del año, y 
           que están sujetas a repetirse en períodos equivalentes en cada ciclo en 
           función a la naturaleza de la actividad productiva.
      </P>

      <P>
        La duración de la temporada se establece en los meses de julio a agosto,
         aproximadamente, debido a que en este periodo de tiempo la fruta está apta
          para ser cosechada y, posteriormente, empacada y exportada, precisando que, 
          en los meses anteriores el cultivo está en periodo de mantenimiento, 
          crecimiento de la planta y formación del fruto.
      </P>

      <P>
        Las labores del trabajador (a) son de naturaleza regular, pero con 
        variaciones cíclicas, debido a que en este periodo de tiempo la fruta 
        está apta para ser cosechada.
      </P>

      <P>
        En este contexto, <span className="font-bold uppercase">LA EMPRESA</span> requiere de los servicios de <span className="font-bold uppercase">EL TRABAJADOR</span>, cuya 
        contratación se encuentra íntimamente vinculada a la circunstancia y 
        temporada descrita precedentemente; lo cual constituye la causa objetiva
         de la presente contratación modal a plazo determinado, 
         quedando plenamente justificada su temporalidad.
      </P>

      <ClauseInline label="TERCERA:">
        <span className="font-bold uppercase">CARGO Y FUNCIONES. -</span>
        Por el presente documento, <span className="font-bold uppercase">LA EMPRESA</span> contrata a plazo fijo, bajo 
        la modalidad ya indicada en la cláusula precedente, los servicios personales 
        de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, para que se realice las labores y funciones propias 
        y complementarias del puesto de <span className="font-bold uppercase">OPERARIO AGROINDUSTRIAL PARA EMPAQUE Y EXPORTACIÓN 
        DE ESPARRAGO BLANCO</span>  pudiendo también desarrollar cualquier otra función que le 
        encomienden sus superiores. La prestación de servicios deberá ser efectuada de
         manera personal, no pudiendo <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> ser reemplazado ni ayudado
          por tercera persona. <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> declara expresamente encontrarse 
          capacitado para la prestación de los servicios contratados, los cuales 
          llevará adelante según instrucciones que le imparta <span className="font-bold uppercase">LA EMPRESA</span>.  
           Así mismo, las partes convienen que <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, 
           puede prestar sus servicios tanto por unidad de tiempo o por unidad 
           de obra, de acuerdo a los requerimientos de la producción diaria, 
           por tal razón, cuando corresponda, el pago será por jornal diario,
            de conformidad con lo establecido en la cláusula séptima del presente
             contrato; o por destajo o tarea u obra ejecutada.
      </ClauseInline>

      <P>
        Para el desarrollo de sus funciones, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> recibirá equipos de protección personal, 
        herramientas u otros, que son de propiedad de <span className="font-bold uppercase">LA EMPRESA</span>. En caso de término del vínculo laboral, 
        por cualquiera de los supuestos establecidos en la Ley, o a solicitud de <span className="font-bold uppercase">LA EMPRESA</span>, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> 
        devolverá dichos equipos de forma inmediata. En caso de pérdida, robo o daño por el uso inadecuado de los
         equipos, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> deberá cumplir con reponerlos en plazo breve, y el costo será asumido 
         en su totalidad por <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, quien autoriza expresamente a <span className="font-bold uppercase">LA EMPRESA</span> a descontar
          de su remuneración y liquidación de beneficios sociales, el correspondiente valor no devuelto,
           así como los gastos que pudieran generarse por la no devolución oportuna de los mismos.
      </P>

      <ClauseInline label="CUARTA:">
        <span className="font-bold uppercase">PLAZO Y VIGENCIA.-</span>El plazo del presente contrato  comenzará a regir desde el {" "}
        <span className="font-bold">{fechaInicioValue}</span>, concluyendo el dia{" "}
        <span className="font-bold">{fechaFinValue}</span>, sin necesidad de comunicacion previa
        por parte de <span className="font-bold uppercase">LA EMPRESA</span>. La suspensión de 
        las labores por alguna de las causas previstas legalmente como: descansos pre y post natal, 
        accidente de trabajo, enfermedad, etc., no interrumpirá el plazo de duración del presente contrato de temporada.
      </ClauseInline>

      <ClauseInline label="QUINTA:">
        <span className="font-bold uppercase">PERÍODO DE PRUEBA</span>De conformidad con lo dispuesto en el articulo 10 del TUO del D. Leg.728,{" "}
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se
        encontrara sujeto a un periodo de prueba de ley.
      </ClauseInline>

      <ClauseInline label="SEXTA:">
        <span className="font-bold uppercase"> HORARIO Y JORNADA LABORAL.- EL (LA) TRABAJADOR (A)</span>observará bajo responsabilidad, 
        el horario de trabajo establecido por <span className="font-bold uppercase">LA EMPRESA</span> de conformidad con las normas contenidas en el 
        Decreto Supremo N° 007-2002-TR, que aprueba el Texto Único Ordenado de la Ley de Jornada de 
        Trabajo, Horario y Trabajo en Sobretiempo, y su Reglamento, aprobado por Decreto Supremo N° 008-2002-TR. 
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, tendrá una jornada laboral de 48 horas semanales, respetando el día de descanso 
        semanal obligatorio, y el tiempo de refrigerio mínimo, el mismo que, conforme a Ley, no forma parte de la 
        jornada de trabajo. En uso de sus facultades directrices, y de acuerdo a lo dispuesto en el artículo 2º del D. Leg.713,
         según las necesidades del negocio, el descanso podrá ser rotativo. 
      </ClauseInline>
      <P>
        EL (LA) TRABAJADOR (A) observará el horario de trabajo establecido en LA EMPRESA; 
        sin embargo, LA EMPRESA podrá introducir cambios necesarios por la propia naturaleza
         variable de las actividades agrícolas y agroindustriales. En tal sentido, cuando se generen 
         las llamadas bajas de producción, no previsibles en términos de tiempo y sujetas por lo general 
         a factores no siempre determinados y ajenos a LA EMPRESA, la jornada laboral diaria se restringirá 
         al tiempo necesario de acuerdo a los requerimientos de LA EMPRESA y a la observancia de sus normas técnicas.
      </P>
      <P>
        EL (LA) TRABAJADOR (A) y LA EMPRESA acuerdan que, de existir trabajo en sobretiempo, éste será 
        compensado con tiempo de descanso equivalente, de acuerdo a lo regulado en el artículo 10° del 
        Decreto Supremo No. 007-2002-TR. A fin de validar el trabajo en sobretiempo realizado, EL TRABAJADOR
         deberá cumplir con el procedimiento establecido por LA EMPRESA para la autorización de trabajo en 
         sobretiempo y firmar el formato de autorización de trabajo en sobretiempo correspondiente.  
      </P>
      <P>
        LA EMPRESA, en ejercicio de su poder de dirección, podrá variar los horarios fijados, 
        estableciendo nuevos turnos y horarios de trabajo, de acuerdo a sus necesidades de 
        operación y dentro del marco legal y parámetros establecidos en el antes citado cuerpo 
        normativo y su Reglamento aprobado por D.S.008-2002-TR. Sin perjuicio de lo pactado en la 
        presente cláusula, EL (LA) TRABAJADOR (A) se compromete a mantener un permanente involucramiento y 
        disponibilidad para prestar la colaboración necesaria, y de forma voluntaria, durante la jornada de trabajo, 
        y en los días u horas, inclusive días de descanso y feriados, que por necesidades concretas de las
         actividades de LA EMPRESA, o por requerimientos especiales de la misma, LA EMPRESA en ejercicio de
          sus facultades directrices-, lo requiera, los cuales serán debidamente remunerados conforme a la normatividad vigente.
      </P>

      <ClauseInline label="SEPTIMA: REMUNERACION.-">
        Conforme a lo dispuesto en el literal d) del articulo 3 de la Ley N 31110,{" "}
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> percibira una
        Remuneracion diaria (RD) ascendente a <span className="font-bold">{remuneracionDiaria}</span> o {" "}
        <span className="font-bold">{remuneracionMensual}</span> por periodo mensual.Dicho importe, de acuerdo a los alcances de la Ley N° 31110 Ley del Régimen Laboral Agrario y de
        Incentivos para el Sector Agrario y Riego, Agroexportador y Agroindustrial, incluye a 
        la compensación por tiempo de servicios y las gratificaciones de Fiestas Patrias y Navidad, 
        y se actualizará en el mismo porcentaje que los incrementos de la Remuneración Mínima Vital. 
        Asimismo, se precisa que en la planilla de remuneraciones se disgregará de manera independiente 
        la remuneración básica, CTS y gratificaciones, de acuerdo a los porcentajes que corresponden a cada concepto.
      </ClauseInline>
      <P>
        El importe remunerativo estará sujeto a las deducciones y retenciones de ley, las ausencias 
        injustificadas por parte de EL (LA) TRABAJADOR (A) implican la pérdida de la remuneración
         básica de modo proporcional a la duración de dicha ausencia, sin perjuicio del ejercicio de
          las facultades disciplinarias propias de LA EMPRESA, previsto en la legislación laboral y 
          su Reglamento Interno. Será de cargo de EL (LA) TRABAJADOR (A) el pago del Impuesto a la Renta, 
          aplicable a toda remuneración que se le abone, los aportes y contribuciones previsionales y sociales a su cargo, 
          así como cualquier otro tributo que grave las remuneraciones del personal dependiente. LA EMPRESA cumplirá con 
          efectuar las retenciones y descuentos de ley. LA EMPRESA se reserva el derecho de hacer las retenciones que de 
          acuerdo a ley o mandato judicial correspondiente.
      </P>

      <ClauseInline label="OCTAVA:">
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> de acuerdo a lo prescrito en el 
        inciso d) del artículo 3 de la Ley N° 31110, opta por percibir el pago de sus beneficios sociales 
        (CTS y gratificaciones de Fiestas Patrias y Navidad) de manera conjunta y prorrateada, con la remuneración diaria.
      </ClauseInline>

      <ClauseInline label="NOVENO: PODER DE DIRECCION.-">
        <span className="font-bold uppercase">LA EMPRESA</span> se reserva el derecho a
        reubicar a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> en otro cargo de 
        igual categoría dentro de la organización, de acuerdo a sus requerimientos y conveniencias siempre 
        que dicho cambio no implique reducción inmotivada de remuneración o categoría.
      </ClauseInline>
      <P>
        LA EMPRESA, al amparo del artículo 9° de la Ley de Productividad y Competitividad
         Laboral (LPCL), está facultada para introducir cambios, modificaciones al horario y 
         jornada de trabajo, establecer jornadas acumulativas, alternativas, flexibles, compensatorias
          y horarios diferenciados, así como la forma y modalidad de la prestación de las labores,
           dentro de criterios de razonabilidad y teniendo en cuenta las necesidades del centro de trabajo; 
           sin que dichas variaciones signifiquen menoscabo de categoría y/o remuneración.
      </P>

      <ClauseInline label="DECIMA: DEBERES DEL TRABAJADOR.-">
        Durante el desarrollo de las labores que le competen a {" "}
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, este se sujetara
        a las disposiciones de direccion y administracion de {" "}
        <span className="font-bold uppercase">LA EMPRESA</span>.
      </ClauseInline>
      <P>
        Asimismo, deberá cumplir con las normas propias del centro de trabajo, 
        las contenidas en el Reglamento Interno de Trabajo, de Seguridad y Salud 
        en el Trabajo, de Seguridad Alimentaria y demás normas laborales; y las que 
        se impartan por necesidades del servicio en ejercicio de las facultades de administración de LA EMPRESA, 
        de conformidad con el artículo 9° del T.U.O de la Ley de Productividad y Competitividad Laboral aprobado 
        por D.S. Nº 003-97-TR; asimismo, se compromete a cumplir sus obligaciones con buena fe, lealtad, 
        eficiencia y responsabilidad, velando por los intereses de LA EMPRESA, y cumpliendo con los 
        estándares de asistencia laboral y ejecución de las tareas encargadas.
      </P>

      <P>
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se obliga ante{" "}
        <span className="font-bold uppercase">LA EMPRESA</span> en forma expresa a ejecutar mientras
        dure la vigencia de su contrato las siguientes reglas de trabajo:
      </P>

      <ol className="mt-2 list-decimal pl-5 text-justify">
        <li className="mt-1">
          Cumplir y acatar las órdenes y disposiciones que bajo dirección y control de la empresa pudiera
           recibir directamente de sus jefes inmediatos superiores o los gerentes
            de <span className="font-bold uppercase">LA EMPRESA</span>.
        </li>
        <li className="mt-1">
          Cumplir con los procesos y metodos de trabajo inherentes a su puesto de labor,
          asi como las cargas y condiciones de trabajo del puesto que ocupe, de conformidad
          a las disposiciones internas de <span className="font-bold uppercase">LA EMPRESA</span>{" "}
          y/o normas convencionales vigentes.
        </li>
      </ol>
    </PdfPage>
  );

  const page2 = (
    <PdfPage headerRight={codigo} pageNumber={2}>
      <ol start={3} className="mt-2 list-decimal pl-5 text-justify">
        <li className="mt-1">
          Reconocer la facultad de <span className="font-bold uppercase">LA EMPRESA</span> a planificar y
          ordenar las labores que debe desarrollar el trabajador, asi como reservarse la facultad de
          poder reubicar a <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> en los
          horarios y turnos que requiera su actividad, o en cualquier otro puesto de similar categoria y
          remuneracion, o en otra area o seccion de trabajo, que guarde relacion con el origen de la
          contratacion.
        </li>
        <li className="mt-1">
          A reconocer que las obligaciones y condiciones de trabajo establecidas en la presente clausula
          son solamente enunciativas pudiendose dar otras mas durante la ejecucion del contrato, las
          cuales seran cumplidas tambien por <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>{" "}
          siempre que se refieran a disposiciones de caracter laboral y que sean necesarias para optimizar
          y hacer productiva, a criterio del empleador, la labor contratada.
        </li>
        <li className="mt-1">
          A cumplir con las disposiciones vigentes en la empresa y certificaciones relacionadas con
          aspectos ambientales, de calidad y seguridad que existan en{" "}
          <span className="font-bold uppercase">LA EMPRESA</span>.
        </li>
      </ol>

      <P>
        La enumeracion antes indicada es enunciativa y no limitativa, toda vez que, de acuerdo a las
        necesidades de <span className="font-bold uppercase">LA EMPRESA</span>, esta puede introducir
        obligaciones adicionales y/o conexas que no resulten contrarias a las descritas en el presente
        documento.
      </P>

      <ClauseInline label="DECIMO PRIMERA: CONFIDENCIALIDAD.-">
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> mantendra confidencialidad
        absoluta durante la vigencia de este contrato, respecto de las informaciones y documentos en
        general proporcionados por <span className="font-bold uppercase">LA EMPRESA</span> o que hubiera
        obtenido en ejecucion del mismo. Asimismo, se obliga a no divulgar a terceros ajenos a la empresa
        (dentro de los que se incluyen a los medios de comunicacion), toda informacion legal, financiera,
        contable o aquella relativa al desarrollo de las operaciones o actividades de{" "}
        <span className="font-bold uppercase">LA EMPRESA</span>, incluidos sus clientes o el diseno de sus
        sistemas y procesos de exportacion, importacion, produccion y/o comercializacion y marketing, ya
        sea que estan incorporados o no en documentos escritos, archivos, cintas magneticas, cassetts,
        disquetes, videos, peliculas, entre otros medios.
      </ClauseInline>

      <P>
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a no retirar de{" "}
        <span className="font-bold uppercase">LA EMPRESA</span>, mediante medios fisicos, electronicos u
        otros, ningun proceso o programa de computo. Ademas de las obligaciones anteriores que son de
        indole personal, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> velara para
        que durante el periodo que se realice sus labores, terceras personas no tengan acceso a retirar
        parcial o totalmente cualquiera de los programas de computo de propiedad de{" "}
        <span className="font-bold uppercase">LA EMPRESA</span> o informacion relativa a sus clientes.
      </P>

      <P>
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> respondera ante{" "}
        <span className="font-bold uppercase">LA EMPRESA</span> por los danos y perjuicios que cause
        derivados del incumplimiento de lo previsto en esta clausula, sin perjuicio de la incursion en
        falta grave por expreso incumplimiento de sus obligaciones laborales y la buena fe laboral,
        lo cual configura causal de despido justificado.
      </P>

      <P>
        Esta obligacion subsistira aun despues de terminada la relacion laboral y su incumplimiento
        genera la correspondiente responsabilidad por danos y perjuicios, sin desmedro de la persecucion
        penal por el delito previsto en el articulo 165 del Codigo Penal y ademas por lo dispuesto por
        el inciso d) del articulo 25 del D.S. 003-97-TR. {" "}
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se obliga a entregar, al
        termino del contrato, los documentos, materiales e informes a los que hubiere tenido acceso con
        motivo de la ejecucion del mismo.
      </P>

      <ClauseInline label="DECIMO SEGUNDA: NO DISCRIMINACION.-">
        <span className="font-bold uppercase">LA EMPRESA</span> declara que en la presente contratacion no ha mediado
        discriminacion ni favoritismo sin causa objetiva, y se obliga a no efectuar distinciones basadas en motivos
        de raza, color, sexo, identidad de genero, orientacion sexual, embarazo, discapacidad, condicion seropositiva,
        religion, opinion politica, sindicacion, ascendencia, nacionalidad, origen social, lengua o condicion economica.
      </ClauseInline>

      <ClauseInline label="DECIMO TERCERA: SEGURIDAD Y SALUD EN EL TRABAJO.-">
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a respetar y
        dar estricto cumplimiento a las normas sobre seguridad y salud en el trabajo que {" "}
        <span className="font-bold uppercase">LA EMPRESA</span> establezca como medidas de prevencion.
      </ClauseInline>

      <P>
        <span className="font-bold uppercase">LA EMPRESA</span>, en cumplimiento de lo dispuesto por el
        articulo 35 de la Ley 29783, entrega a {" "}
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> una descripcion de las
        recomendaciones de seguridad y salud en el trabajo para el puesto que ocupara en virtud del
        presente contrato. Dicha descripcion se entrega como documento adjunto y detalla lo siguiente:
      </P>

      <P>
        (i) Los riesgos (quimicos, fisicos, biologicos, ergonomicos, mecanicos, psicosociales, entre
        otros) a los que se pudiera ver expuesto el trabajador con motivo del desempeno de sus funciones;
        y (ii) las recomendaciones de seguridad y salud en el trabajo para reducir o mitigar tales riesgos.
      </P>

      <P>
        Por su parte <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a
        observar estrictamente las pautas contenidas en la descripcion de recomendaciones de seguridad y
        salud en el trabajo. Cualquier inobservancia sera sancionada por {" "}
        <span className="font-bold uppercase">LA EMPRESA</span>.
      </P>

      <P>
        <span className="font-bold uppercase">LA EMPRESA</span> se compromete a actualizar periodicamente
        la descripcion de las recomendaciones de seguridad y salud; en particular, cuando se asignen nuevas
        funciones o se detecten riesgos adicionales.
      </P>

      <P>
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se obliga a cuidar de su
        persona y los bienes de su propiedad o posesion, y a no exponerse voluntaria o negligentemente a
        situaciones de riesgo. El incumplimiento da lugar a sanciones conforme a reglamentos y ley.
      </P>

      <ClauseInline label="DECIMO CUARTA: AUTORIZACION DE DESCUENTO POR PLANILLA.-">
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> autoriza que, ante perjuicio
        economico ocasionado por infraccion a estandares de {" "}
        <span className="font-bold uppercase">LA EMPRESA</span>, se descuente de su remuneracion el monto
        equivalente.
      </ClauseInline>

      <P>
        Asimismo, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> debera reintegrar a{" "}
        <span className="font-bold uppercase">LA EMPRESA</span> el valor de bienes perdidos o deteriorados por
        negligencia, montos de dinero bajo su custodia, o deudas derivadas del contrato, autorizando el
        respectivo descuento por planilla o liquidacion.
      </P>

      <ClauseInline label="DECIMO QUINTA: AUTORIZACION PARA RECOPILACION Y TRATAMIENTO DE DATOS PERSONALES.-">
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> declara su consentimiento para el
        tratamiento de sus datos personales por {" "}
        <span className="font-bold uppercase">LA EMPRESA</span> conforme a la ley.
      </ClauseInline>

      <ol className="mt-2 list-decimal pl-6 text-justify">
        <li className="mt-1">
          Declaro expresamente que he suministrado mis datos personales para la suscripcion del presente
          contrato y que durante la ejecucion del servicio {" "}
          <span className="font-bold uppercase">LA EMPRESA</span> podra tener acceso a otros datos personales mios.
        </li>
        <li className="mt-1">
          Declaro que {" "}
          <span className="font-bold uppercase">LA EMPRESA</span> me ha informado que la informacion que he
          proporcionado es considerada Datos Personales.
        </li>
        <li className="mt-1">
          Doy mi consentimiento libre, previo, expreso e informado para que mis Datos Personales sean tratados.
        </li>
        <li className="mt-1">
          Autorizo que mis datos sean compartidos con filiales, contratistas u operadores necesarios.
        </li>
        <li className="mt-1">
          Declaro que puedo revocar el consentimiento para tratar mis Datos Personales en cualquier momento.
        </li>
        <li className="mt-1">
          Declaro conocer que puedo revocar el consentimiento para tratar mis Datos Personales en cualquier momento. Para ejercer este derecho debera presentar una solicitud escrita a mi empleador.
        </li>
      </ol>

      <ClauseInline label="DECIMO SEXTA: USO Y ENTREGA DIGITAL DE DOCUMENTOS LABORALES.-">
        <span className="font-bold uppercase">LA EMPRESA</span> esta facultada a suscribir y entregar digitalmente
        boletas y otros documentos laborales; {" "}
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> autoriza esta modalidad.
      </ClauseInline>

      <P>
        <span className="font-bold uppercase">LA EMPRESA</span> podra sustituir firma manuscrita por firma digital y
        entrega electronica de documentos laborales. {" "}
        <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> reconoce y autoriza esta facultad.
      </P>

      <P>
        Incluso, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> otorgara para la comunicacion via remota
        el correo electronico <span className="font-bold uppercase">____________________________________________________________</span>
      </P>

      <P>
        y el numero telefonico celular {" "}
<<<<<<< HEAD
        <span className="font-bold uppercase">______________________________</span>; siendo estos validos para las
=======
<<<<<<< HEAD
        <span className="font-bold uppercase">______________________________</span>; siendo estos validos para las
=======
<<<<<<< HEAD
        <span className="font-bold uppercase">______________________________</span>; siendo estos validos para las
=======
<<<<<<< HEAD
        <span className="font-bold uppercase">______________________________</span>; siendo estos validos para las
=======
<<<<<<< HEAD
        <span className="font-bold uppercase">______________________________</span>; siendo estos validos para las
=======
        <span className="font-bold uppercase">_________________________</span>; siendo estos validos para las
>>>>>>> ec1eabe9348520c82121c88f0e4054c21d1f338e
>>>>>>> f0e56ed59eb76318885995a3a23a80ecc9c9a8ad
>>>>>>> cceba747610bb152877dc1cbd902f7f8a601f584
>>>>>>> 2f8d00b3a06e0a7fd9751ad37c655afdb72d1e13
>>>>>>> cebba9ea39b8826a33a8451f802824cc315d7f32
        comunicaciones que efectuara <span className="font-bold uppercase">LA EMPRESA</span>.
      </P>
    </PdfPage>
  );

  const page3 = (
    <PdfPage
      headerRight={codigo}
      pageNumber={3}
      isLast={true}
    >
      <div className="flex flex-col" style={{ minHeight: "240mm" }}>
        <P>
          Asimismo, a traves del portal digital y/o cuenta de correo electronico del trabajador, la
          empresa remitira otros documentos de indole laboral tales como: Reglamento Interno de
          Trabajo, Reglamento de Seguridad y Salud en el Trabajo, Directivas, Procedimientos y demas
          normas conexas. Por su parte, <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>{" "}
          se compromete a descargar los documentos laborales, revisar su contenido, y a dar cabal
          cumplimiento en cuanto corresponda a sus obligaciones, declarando estar instruido que la
          remision de los mismos, a traves de dichos medios de tecnologia de la informacion y
          comunicacion, es senal de conformidad con su entrega. De igual manera,{" "}
          <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a lo
          siguiente:
        </P>

        <ol className="mt-2 list-decimal pl-6 text-justify">
          <li className="mt-1">
            Contar con una cuenta activa de correo electronico, la cual debera proporcionar a{" "}
            <span className="font-bold uppercase">LA EMPRESA</span> en el plazo de 02 dias habiles de
            iniciada la relacion laboral. En caso{" "}
            <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> no confirme su direccion
            de correo electronico en el plazo antes mencionado, acepta que{" "}
            <span className="font-bold uppercase">LA EMPRESA</span> envie los Documentos Laborales al
            Portal digital o al portal que esta contrate, dandolos por aceptados por parte de{" "}
            <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> y por notificados por{" "}
            <span className="font-bold uppercase">LA EMPRESA</span>. No obstante, lo anterior, en el
            momento que <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> cuente con
            un correo electronico y este sea comunicado a <span className="font-bold uppercase">LA EMPRESA</span>{" "}
            podra acceder a la informacion disponible en el Portal.
          </li>
          <li className="mt-1">
            Mantener activo el correo electronico y revisar periodicamente la plataforma digital a
            fin de tomar conocimiento de los Documentos Laborales remitidos por{" "}
            <span className="font-bold uppercase">LA EMPRESA</span>.
          </li>
          <li className="mt-1">
            Dado que bajo este procedimiento de entrega digital de Documentos Laborales, la firma de{" "}
            <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> no es obligatoria, aquel
            debera confirmar expresamente la recepcion de cada uno de los Documentos Laborales
            remitidos al trabajador por parte de <span className="font-bold uppercase">LA EMPRESA</span>,
            dando conformidad de recepcion de los documentos marcando la opcion correspondiente a
            traves de la plataforma digital o mediante el acuse de recibo a traves de su cuenta de
            correo electronico o a traves de otro mecanismo analogo de confirmacion. En caso{" "}
            <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> no realice el reclamo
            dentro del plazo establecido (3 dias habiles de remitidos los documentos laborales), se
            entendera por aceptados la entrega y contenido de los documentos. En caso tuviera alguna
            consulta, queja, observacion o detectara un error, debera acercarse inmediatamente o
            enviar una comunicacion escrita dentro de dicho termino al correo corporativo del
            Departamento de Asuntos Corporativos & Gestion Humana :{" "}
            <span className="underline">acgh@agualima.com</span> a fin de procurar resolverlo de comun
            acuerdo entre las partes. En caso no lo hiciera, se entendera que esta conforme con su
            contenido.
          </li>
          <li className="mt-1">
            <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> debera mantener en
            reserva su contrasena de acceso a la plataforma digital, y debera asegurarse de cerrar
            su sesion en el Portal al culminar su consulta, para asegurar la inviolabilidad de su
            informacion.
          </li>
        </ol>

        <ClauseInline label="DECIMO SEPTIMA: REGIMEN LABORAL.-">
          <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> estara sujeto al Regimen
          Laboral Agrario, dentro de los alcances y efectos de la Ley N 31110 Ley del Regimen Laboral
          Agrario y de incentivos para el sector agrario y riego, agroexportador y agroindustrial.
        </ClauseInline>

        <ClauseInline label="DECIMO OCTAVA: SUSPENSION PERFECTA DE LABORES.-">
          Por la propia naturaleza de las actividades que realiza{" "}
          <span className="font-bold uppercase">LA EMPRESA</span>, se presentan circunstancias que
          paralizan en forma total o parcial las labores de todos o algunos de sus trabajadores. Por
          ello, las partes convienen expresamente en suspender en forma temporal y perfecta el
          presente contrato cuando se presenten:
        </ClauseInline>

        <ol className="mt-2 list-decimal pl-10 text-justify">
          <li className="mt-1">Razones de falta o disminucion de la materia prima o insumos.</li>
          <li className="mt-1">Fenomenos climaticos, de temperatura o estacional.</li>
          <li className="mt-1">Ausencia o disminucion de la demanda en los mercados internos y de exportacion.</li>
          <li className="mt-1">Casos fortuitos o de fuerza mayor.</li>
          <li className="mt-1">Otros que la ley establezca.</li>
        </ol>

        <P>
          <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> declara conocer que la
          suspension perfecta de labores acordada previamente implica que temporalmente cesa su
          obligacion de prestar el servicio y de <span className="font-bold uppercase">LA EMPRESA</span>{" "}
          de pagar la remuneracion y demas beneficios laborales.
        </P>

        <ClauseInline label="DECIMO NOVENA: EXTINCION DEL CONTRATO DE TRABAJO.-">
          Queda entendido que <span className="font-bold uppercase">LA EMPRESA</span> no esta obligada
          a dar aviso alguno adicional referente al termino del presente contrato, operando su
          extincion a la expiracion del plazo pactado entre las partes en el contrato; tal como lo
          determina el inc. c) del articulo 16 del D.S. 003-97-TR, oportunidad en la cual abonara a{" "}
          <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> los beneficios sociales
          que pudieran corresponderle.
        </ClauseInline>

        <P>
          <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> conoce y acepta que
          constituye causa justa de terminacion de la relacion laboral, el rendimiento deficiente en
          relacion con su capacidad y con el rendimiento promedio en labores y bajo condiciones
          similares, conforme a lo previsto en el articulo 23 literal b) del TUO del D. Leg. 728
          aprobado por Decreto Supremo No. 003-97-TR, causal que sera evaluada y aplicada de acuerdo a
          los parametros establecidos por "<span className="font-bold uppercase">LA EMPRESA</span>" y
          teniendo en cuenta el cumplimiento de los objetivos formalmente disenados por{" "}
          <span className="font-bold uppercase">LA EMPRESA</span>. Sin perjuicio a lo citado en los
          parrafos anteriores, sera de aplicacion al presente contrato, las demas causas generales de
          extincion previstas en el articulo 16 del D.S. 003-97-TR.
        </P>

        <ClauseInline label="VIGESIMA: ACEPTACION DE COMUNICACION POR VIA ELECTRONICA, DIGITAL Y/O TELEFONICA.-">
          <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> acepta y reconoce que{" "}
          <span className="font-bold uppercase">LA EMPRESA</span> se encuentra facultada para utilizar
          cualquier medio de comunicacion electronico, digital y/o telefonico; con la finalidad de
          poner en conocimiento de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>{" "}
          cualquier decision y/o situacion que guarde correspondencia con la relacion laboral
          sostenida entre las partes. Para tales efectos,{" "}
          <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> proporciona la siguiente
          direccion electronica <span className="font-bold uppercase">_________________________________________________</span>,asi como el numero de celular <span className="font-bold uppercase">______________________________</span> mediante los cuales{" "}
          <span className="font-bold uppercase">AUTORIZA</span> que{" "}
          <span className="font-bold uppercase">LA EMPRESA</span> efectue las comunicaciones que estime
          pertinente, las mismas que, una vez efectuadas, quedaran validamente notificadas.
        </ClauseInline>

        <ClauseInline label="VIGESIMO PRIMERA: DOMICILIOS Y JURISDICCION.-">
          Las partes senalan como sus respectivos domicilios los especificados en la introduccion del
          presente contrato, por lo que se reputaran validas todas las comunicaciones y
          notificaciones dirigidas a las mismas con motivo de la ejecucion del presente contrato.
          Todo cambio de domicilio de <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>{" "}
          debera ser comunicado por escrito a <span className="font-bold uppercase">LA EMPRESA</span>{" "}
          para que surta efectos.
        </ClauseInline>

        <P>
          Las partes contratantes se someten expresamente a la jurisdiccion de las autoridades
          judiciales y administrativas de la Provincia de Viru, Departamento La Libertad.
        </P>

        <P>
          Ambas partes enteradas del contenido de todas y cada una de las clausulas del presente
          documento proceden a firmar por duplicado, en senal de conformidad, en la ciudad de Viru el{" "}
          <span className="ml-10 font-bold">#N/D</span>
        </P>

        <FirmaTemporadaFinal signatureSrc={signatureSrc} />
      </div>
    </PdfPage>
  );

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0">
      {(pagePart === 1 || pagePart === "all") && page1}
      {(pagePart === 2 || pagePart === "all") && page2}
      {(pagePart === 3 || pagePart === "all") && page3}
    </div>
  );
}

export default ContratoTemporadaPlanForm;