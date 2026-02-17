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
      <div className={bodyClass} style={pdfMode ? { marginTop: "3mm" } : undefined}>
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
      className={[
        tight ? "mt-0" : "mt-2",
        center ? "text-center" : "text-justify",
        "hyphens-auto",
      ].join(" ")}
      style={{ hyphens: "auto" }}
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
        4. EL (LA) TRABAJADOR (A) debera mantener en reserva su contrasena de acceso a la plataforma digital,
        y debera asegurarse de cerrar su sesion en el Portal al culminar con sus tareas, para asegurar
        la inviolabilidad de su informacion.
      </P>

      <Clause>DECIMO SEPTIMA: REGIMEN LABORAL.-</Clause>
      <P>
        EL (LA) TRABAJADOR (A) estara sujeto al Regimen Laboral Agrario, dentro de los alcances y efectos
        de la Ley N 31110 Ley del Regimen Laboral Agrario y de incentivos para el sector agrario y riego,
        agroexportador y agroindustrial.
      </P>

      <Clause>DECIMO OCTAVA: SUPUESTOS DEL DERECHO PREFERENCIAL DE CONTRATACION.-</Clause>
      <P>
        De conformidad con lo dispuesto en el articulo 4 de la Ley 31110 y su reglamento, el derecho preferencial
        en la contratacion se configura en los siguientes supuestos:
      </P>

      <HyphenList
        items={[
          <>
            Cuando el/la trabajador(a) es contratado por{" "}
            <span className="font-bold uppercase">LA EMPRESA</span> en la misma linea de cultivo, por dos o mas plazos
            que en conjunto superan los dos meses en un periodo de un ano, tiene derecho preferencial en la
            contratacion a que se le emplee de manera continua en la misma linea de cultivo.
          </>,
          <>
            Cuando el/la trabajador(a) es contratado por{" "}
            <span className="font-bold uppercase">LA EMPRESA</span>, bajo la modalidad de contratos intermitentes o
            contratos de temporada similares, dos veces consecutivas o no consecutivas, tiene derecho preferencial
            en la contratacion si el empleador requiere contratar personal en las siguientes temporadas de servicios
            intermitentes.
          </>,
          <>
            Cuando el/la trabajador(a) es contratado por{" "}
            <span className="font-bold uppercase">LA EMPRESA</span>, bajo la modalidad de contrato de temporada, por lo
            menos dos temporadas en un mismo ano, de manera consecutiva o no consecutiva, para prestar servicios en
            cultivos diversos cuya estacionalidad conjunta cubre todo el ano, tiene derecho preferencial en la
            contratacion si el empleador requiere contratar personal en las siguientes temporadas.
          </>,
        ]}
      />

      <Clause>VIGESIMA: FORMALIDADES PARA LA EJECUCION DEL DERECHO PREFERENCIAL DE CONTRATACION</Clause>
      <P>
        Para hacer efectivo el derecho preferencial de contratacion, en los supuestos previstos en el articulo 4
        de la Ley 31110, LAS PARTES acuerdan que <span className="font-bold uppercase">LA EMPRESA</span> convocara
        al trabajador(a) mediante avisos en sus redes sociales o sus similares. A fin de que, dentro de los quince (15)
        dias anteriores al inicio de la prestacion de servicios, manifieste expresamente su voluntad de prestar servicios
        en la empresa. Para tal efecto, las partes acuerdan la{" "}
        <span className="font-bold uppercase">CONVOCATORIA</span> y la{" "}
        <span className="font-bold uppercase">ACEPTACION</span> se efectuaran de la siguiente manera:
      </P>

      <HyphenList
        items={[
          <>
            Via convocatoria por redes sociales, para el caso,{" "}
            <span className="font-bold uppercase">LA EMPRESA</span> difundira anuncios en sus redes sociales oficiales.
          </>,
          <>Via convocatoria a traves del WhatsApp corporativo desde el numero celular de la empresa o un SMS.</>,
          <>
            Via correo electronico; el trabajador recibira una comunicacion a su correo desde la cuenta corporativa:{" "}
            <span className="underline">postulaciones@agualima.com.pe</span>.
          </>,
          <>Via llamada telefonica; el trabajador recibira comunicacion por la empresa desde el numero telefonico que la empresa mantenga expresamente.</>,
        ]}
      />

      <Clause>VIGESIMA PRIMERA: EXTINCION DEL CONTRATO DE TRABAJO.-</Clause>
      <P>
        Queda entendido que <span className="font-bold uppercase">LA EMPRESA</span> no esta obligada a dar aviso alguno
        adicional referente al termino del presente contrato, operando su extincion a la expiracion del plazo pactado
        entre las partes. En el entendido que con lo descrito en el presente contrato.
      </P>

      <P>
        EL (LA) TRABAJADOR (A) conoce y acepta que constituye causa justa de terminacion de la relacion laboral,
        el rendimiento deficiente en relacion con su capacidad y con el rendimiento promedio en el cumplimiento de sus
        funciones, de conformidad con el articulo 23 inciso b) del TUO de la LPCL y teniendo en cuenta el cumplimiento
        de los objetivos normalmente deseados por <span className="font-bold uppercase">LA EMPRESA</span>.
      </P>

      <Clause>VIGESIMA SEGUNDA: ACEPTACION DE COMUNICACION POR VIA ELECTRONICA, DIGITAL Y/O TELEFONICA.-</Clause>
      <P>
        EL (LA) TRABAJADOR (A) acepta y reconoce que <span className="font-bold uppercase">LA EMPRESA</span> se encuentra
        facultada para utilizar cualquier medio de comunicacion electronico, digital y/o telefonico, con la finalidad de
        poner en conocimiento de EL (LA) TRABAJADOR (A) cualquier gestion y/o situacion que guarde correspondencia con la
        relacion laboral subsistente entre las partes. Para tales efectos, EL (LA) TRABAJADOR (A) proporciona la siguiente
        direccion electronica:
      </P>
      <P>
        <span className="font-bold">__________________________</span>
      </P>

      <Clause>VIGESIMA TERCERA: DOMICILIOS Y JURISDICCION.-</Clause>
      <P>
        Las partes senalan como sus respectivos domicilios los especificados en la introduccion del presente contrato;
        por lo que se reputaran validas todas las comunicaciones y notificaciones dirigidas a las mismas con motivo de la
        ejecucion del presente contrato. Todo cambio de domicilio de EL (LA) TRABAJADOR (A) debera ser comunicado por
        escrito a <span className="font-bold uppercase">LA EMPRESA</span> para que surta efectos.
      </P>

      <P>
        Las partes contratantes se someten expresamente a la jurisdiccion de las autoridades judiciales y administrativas
        de la Provincia de Viru, Departamento La Libertad.
      </P>

      <P>
        Ambas partes enteradas del contenido de todas y cada una de las clausulas del presente documento proceden a firmar
        por duplicado, en senal de conformidad, en la ciudad de Viru el <span className="font-bold"></span>.
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
    normalize([client?.apellido, client?.nombre].filter(Boolean).join(" "));

  const dni = normalize(client?.dni);
  const address = normalize(client?.direccion);
  const district = normalize(client?.distrito);
  const province = normalize(client?.provincia);
  const department = normalize(client?.departamento);
  const fullAddress = [address, district, province, department]
    .filter(Boolean)
    .join(", ");
  const puestoValue = normalize(puesto);
  const formatDate = (value?: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
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
  const celularValue = normalize(celular) || normalize(client?.celular);

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
          Conste por el presente documento que se extiende por duplicado, EL CONTRATO
          DE TRABAJO A PLAZO FIJO BAJO LA MODALIDAD DE “CONTRATO DE TEMPORADA”,
          que celebran al amparo del Art. 67º de la Ley de Productividad y Competitividad
          Laboral aprobado por D.S. Nº 003-97-TR, las normas de la Ley N° 31110, Ley del
          Régimen Laboral Agrario y de Incentivos para el Sector Agrario y Riego,
          Agroexportador y Agroindustrial, y su Reglamento; de una parte, la empresa{" "}
          <span className="font-bold uppercase">AGUALIMA S.A.C.</span> con R.U.C N°{" "}
          <span className="font-bold">20512217452</span>, y domiciliada en{" "}
          <span className="font-bold">KM 512</span> Carretera Panamericana Norte,
          Provincia de Virú, Departamento de La Libertad; a quien en adelante se le
          denominará{" "}
          <span className="font-bold uppercase">LA EMPRESA</span>, representada{" "}
          <span className="font-bold uppercase">YESSICA SELENE TORRES VILCHEZ</span>{" "}
          identificada con D.N.I N° <span className="font-bold">40642893</span> con
          facultades inscritas en la P.E. 11829370 del Registro de Personas Jurídicas de
          Lima, y de la otra parte el Sr(a).
        </P>

        <P center>
          <BlankPdf widthMm={55} value={fullName} /> identificado(a) con DNI Nº{" "}
          <BlankPdf widthMm={35} value={dni} /> con domicilio en{" "}
          <BlankPdf widthMm={60} value={fullAddress} />
        </P>

        <P>
          a quien en adelante se le denominará{" "}
          <span className="font-bold uppercase">EL (LA) TRABAJADOR(A)</span>, en los
          términos y condiciones siguientes:
        </P>

        <Clause>PRIMERA: DEL EMPLEADOR.-</Clause>
        <P>
          LA EMPRESA es una persona jurídica del sector Privado, dedicada a la
          agroindustria; esto es: cultivo de hortalizas y frutas. Entre ellos, el cultivo,
          pre cosecha y cosecha, empaque y exportación de espárrago blanco, arándano,
          mandarinas y paltas.
        </P>
        <P>
          LA EMPRESA declara que se encuentra sujeta y acogida a los alcances del
          Régimen Laboral Agrario, de conformidad con lo dispuesto en la Ley N° 31110,
          Ley del Régimen Laboral Agrario y de Incentivos para el Sector Agrario y Riego,
          Agroexportador y Agroindustrial, y su Reglamento.
        </P>

        <Clause>SEGUNDA: JUSTIFICACIÓN DE LA CONTRATACIÓN.-</Clause>
        <P>
          Por el presente contrato, las partes convienen que EL(A) TRABAJADOR(A) preste
          servicios intermitentes para EL EMPLEADOR en calidad de{" "}
          <BlankPdf widthMm={45} value={puestoValue} /> a cambio de la retribución pactada en el presente
          contrato, para cumplir y cubrir las necesidades de las actividades de EL
          EMPLEADOR, que, por su naturaleza y particularidades del sector agrario, son
          discontinuas.
        </P>
        <P>
          Las partes declaran conocer que las necesidades de trabajo de EL EMPLEADOR,
          al desarrollar una actividad de exportación agroindustrial, son discontinuas
          debido a los factores climáticos, biológicos, y otros que condicionan las
          actividades en el campo y, consecuentemente, todas las actividades conexas de
          la empresa, por lo que estos factores determinan que EL(A) TRABAJADOR(A) preste
          servicios de modo intermitente.
        </P>
        <P>
          Las labores del(a) trabajador(a) son de naturaleza regular, pero con períodos
          de discontinuidad, previo al período de tiempo en que los productos (frutas y
          la hortaliza) estén aptos para ser cosechados.
        </P>
        <P>
          En este contexto, LA EMPRESA requiere de los servicios de EL(A) TRABAJADOR(A),
          cuya contratación se encuentra íntimamente vinculada a la circunstancia
          descrita precedentemente; lo cual constituye la causa objetiva de la presente
          contratación modal a plazo determinado, quedando plenamente justificada su
          temporalidad.
        </P>

        <Clause>TERCERA: CARGO Y FUNCIONES.-</Clause>
        <P>
          Por el presente documento, LA EMPRESA contrata a plazo fijo, bajo la modalidad
          ya indicada en la cláusula precedente, los servicios personales de EL(LA)
          TRABAJADOR(A), para que se realice las labores y funciones propias y
          complementarias del puesto de <BlankPdf widthMm={45} value={puestoValue} /> pudiendo también
          desarrollar cualquier otra función que le encomienden sus superiores.
        </P>
        <P>
          La prestación de servicios deberá ser efectuada de manera personal, no
          pudiendo EL(LA) TRABAJADOR(A) ser reemplazado ni ayudado por tercera persona.
          EL(LA) TRABAJADOR(A) declara expresamente encontrarse capacitado para la
          prestación de los servicios contratados, los cuales llevará adelante según
          instrucciones que le imparta LA EMPRESA.
        </P>
        <P>
          EL TRABAJADOR se compromete a ejecutar las tareas propias de su cargo en cada
          oportunidad que se reanude la labor intermitente del contrato, cumpliendo con
          lo que disponga la Empresa.
        </P>
        <P>
          Las partes declaran que la labor intermitente del contrato se reanudará si y
          solo si se verifica una necesidad de personal para atender las actividades de
          EL EMPLEADOR con posición dispuesto por el Decreto Supremo N° 003-97-TR...
        </P>

        <P>
          EL EMPLEADOR está facultado a rotar a EL(A) TRABAJADOR(A), dentro de su
          categoría profesional y nivel, y sin modificar su remuneración, sin que ello
          suponga una variación sustancial del presente contrato de trabajo...
        </P>

        <P>
          Para el desarrollo de sus funciones, EL(LA) TRABAJADOR(A) recibirá equipos de
          protección personal, herramientas u otros, que son de propiedad de LA EMPRESA...
        </P>

        <Clause>CUARTA: PLAZO Y VIGENCIA.-</Clause>
        <P>
          El plazo del presente contrato comenzará a regir desde el <BlankPdf widthMm={30} value={fechaInicioValue} />
          concluyendo el día <BlankPdf widthMm={30} value={fechaFinValue} />, sin necesidad de comunicación previa
          por parte de LA EMPRESA...
        </P>

        <Clause>QUINTA: SUSPENSIÓN PERFECTA DE LABORES.-</Clause>
        <P>
          Por la propia naturaleza de las actividades que realiza LA EMPRESA, se
          presentan circunstancias que paralizan en forma total o parcial las labores
          de todos o algunos de sus trabajadores. Por ello, las partes convienen
          expresamente en suspender en forma temporal y perfecta el presente contrato
          cuando se presenten:
        </P>

        <ol className="mt-2 list-decimal pl-5 text-justify">
          <li className="mt-1">Razones de falta o disminución de la materia prima o insumos.</li>
          <li className="mt-1">Fenómenos climáticos, de temperatura o estacional.</li>
          <li className="mt-1">Ausencia o disminución de la demanda en los mercados internos y de exportación.</li>
          <li className="mt-1">Casos fortuitos o de fuerza mayor.</li>
          <li className="mt-1">Otros que la ley establezca.</li>
        </ol>

        <P>
          EL(LA) TRABAJADOR(A) declara conocer que la suspensión perfecta de labores
          acordada previamente implica que temporalmente cesa su obligación de prestar el
          servicio y de LA EMPRESA de pagar la remuneración y demás beneficios laborales...
        </P>

        <P>
          La suspensión del presente contrato de trabajo por alguna de las causas previstas
          en el Art. 11 del D.S. N° 003-97-TR, incluyendo las que se den por la naturaleza
          intermitente ya señalada, no interrumpirán su vigencia, pues ésta seguirá siendo
          la misma.
        </P>

        <P>
          Respecto a esta suspensión perfecta de labores durante los periodos de inactividad
          de las labores agrícolas, EL TRABAJADOR y la empresa acuerdan que transcurridos
          03 días naturales desde el vencimiento del periodo de suspensión de labores...
        </P>

        <Clause>SEXTA: HORARIO Y JORNADA LABORAL.-</Clause>
        <P>
          EL (LA) TRABAJADOR (A) observará bajo responsabilidad, el horario de trabajo
          establecido por LA EMPRESA de conformidad con las normas contenidas en el Decreto
          Supremo N° 007-2002-TR, que aprueba el Texto Único Ordenado de la Ley de Jornada
          de Trabajo, Horario y Trabajo en Sobretiempo, y su Reglamento, aprobado por
          Decreto Supremo N° 008-2002-TR. EL (LA) TRABAJADOR (A), tendrá una jornada laboral
          de 48 horas semanales, respetando el día de descanso semanal obligatorio, y el
          tiempo de refrigerio mínimo, el mismo que, conforme a Ley, no forma parte de la
          jornada de trabajo. En uso de sus facultades directrices, y de acuerdo a lo
          dispuesto en el artículo 2º del D. Leg.713, según las necesidades del negocio, el
          descanso podrá ser rotativo.
        </P>
        </PdfPage>
      )}
      {pagePart !== 1 && pagePart !== 3 && pagePart !== 4 && (
        <PdfPage headerLeft="Versión 02" headerRight={codigo} pageNumber={2} pdfMode={pdfMode}>
  {/* Continúa cláusula SEXTA */}
  <P>
    EL (LA) TRABAJADOR (A) observará el horario de trabajo establecido en LA EMPRESA;
    sin embargo, LA EMPRESA podrá introducir cambios necesarios por la propia naturaleza
    variable de las actividades agrícolas y agronómicas. En tal sentido, cuando se generen
    las llamadas bajas de producción, no se prevén horas en forma de tiempo y trabajo por
    lo cual, LA EMPRESA, de manera unilateral y ateniéndose a la norma de LA EMPRESA, la
    jornada laboral diaria se restringirá al tiempo necesario de acuerdo a los requerimientos
    de LA EMPRESA, y a la observancia de sus normas técnicas.
  </P>

  <P>
    EL (LA) TRABAJADOR (A) y LA EMPRESA acuerdan que, de existir trabajo en sobretiempo,
    éste será compensado con tiempo de descanso equivalente, de acuerdo a lo regulado en el
    artículo 10° del Decreto Supremo N° 007-2002-TR. A fin de validar el trabajo en
    sobretiempo, EL TRABAJADOR deberá cumplir con el procedimiento establecido por LA EMPRESA
    para la autorización de trabajo en sobretiempo y firmar el formato de autorización de
    trabajo en sobretiempo correspondiente.
  </P>

  <P>
    LA EMPRESA, en ejercicio de su poder de dirección, podrá variar los horarios fijados,
    estableciendo nuevos turnos y horarios de trabajo, de acuerdo a sus necesidades de
    operación y control. Sin perjuicio de lo pactado en la presente cláusula, EL (LA)
    TRABAJADOR (A) se compromete a laborar en sobretiempo en la oportunidad que sea requerido,
    si así lo estima necesario, y de forma voluntaria, durante la jornada de trabajo, y en
    los días u horas, inclusive días de descanso y feriados, que por necesidades concretas
    de las actividades de LA EMPRESA, o por requerimientos del negocio, así lo estime.
    LA EMPRESA, en ejercicio de sus facultades directrices, lo requiera, los cuales serán
    adicionalmente remunerados conforme a la normatividad vigente.
  </P>

  {/* SÉPTIMA */}
  <Clause>SEPTIMA: REMUNERACIÓN.-</Clause>
  <P>
    Conforme a lo dispuesto en literal d) del artículo 3° de la Ley N° 31110, EL (LA)
    TRABAJADOR (A) percibirá una Remuneración diaria (RD) ascendente a{" "}
    <BlankPdf value={remuneracionDiaria} widthMm={26} /> o <BlankPdf value={remuneracionMensual} widthMm={26} /> por periodo mensual.
    Dicho monto, de acuerdo al alcance de la Ley N° 31110 (Ley del Régimen Laboral Agrario y
    de Incentivos para el Sector Agrario y Riego, Agroexportador y Agroindustrial), incluye
    alimentación mínima vital. Asimismo, se considera que en la planilla de remuneraciones se
    desagrega el margen independiente a la remuneración básica, CTS y gratificaciones, de
    acuerdo al porcentaje que corresponda a dicho concepto, y se actualizarán en el mismo
    porcentaje que los incrementos de la Remuneración Mínima Vital.
  </P>

  <P>
    El importe remunerativo estará sujeto a las deducciones y retenciones de ley. La ausencia
    injustificada por parte de EL (LA) TRABAJADOR (A) implica la pérdida de la remuneración
    básica de modo proporcional a la duración de dicha ausencia, sin perjuicio del ejercicio
    de las facultades disciplinarias propias de LA EMPRESA, previa evaluación y de acuerdo a
    su Reglamento Interno. Serán de cargo de EL (LA) TRABAJADOR (A) el pago de impuestos a la
    renta, aportes a los organismos que son de su cargo, aportes y contribuciones previsionales
    y sociales a su cargo, así como cualquier otro tributo que grave las remuneraciones por
    persona dependiente. LA EMPRESA cumplirá con efectuar las retenciones y descuentos de ley.
    LA EMPRESA se reserva el derecho de hacer las retenciones que de acuerdo a ley o mandato
    judicial correspondan.
  </P>

  {/* OCTAVA */}
  <Clause>OCTAVA: EL (LA) TRABAJADOR (A) opta por pago mensual prorrateado.-</Clause>
  <P>
    EL (LA) TRABAJADOR (A), de acuerdo a lo previsto en el inciso d) del artículo 3 de la Ley
    N° 31110, opta por percibir el pago de sus beneficios sociales (CTS y gratificaciones de
    Fiestas Patrias y Navidad) de manera mensual y prorrateada, con la remuneración diaria.
  </P>

  {/* NOVENA */}
  <Clause>NOVENA: PODER DE DIRECCIÓN.-</Clause>
  <P>
    LA EMPRESA se reserva el derecho a reubicar a EL (LA) TRABAJADOR (A) en otro cargo de igual
    categoría dentro de la organización, de acuerdo a sus requerimientos y conveniencias, siempre
    que dicho cambio no implique reducción inmotivada de remuneración o categoría.
  </P>

  <P>
    LA EMPRESA, al amparo del artículo 9° de la Ley de Productividad y Competitividad Laboral
    (LPCL), está facultada en introducir cambios o modificaciones en el horario y jornadas de
    trabajo, establecer jornadas acumulativas, alternativas, flexibles, compensatorias y horarios
    diferenciados, así como la forma y modalidad de la prestación de las labores, dentro de
    criterios de razonabilidad y teniendo en cuenta las necesidades del centro de trabajo sin que
    dichas variaciones signifiquen menoscabo de categoría y/o remuneración.
  </P>

  {/* DÉCIMA */}
  <Clause>DECIMA: DEBERES DEL TRABAJADOR.-</Clause>
  <P>
    Durante el desarrollo de las labores que le competen a EL (LA) TRABAJADOR (A), éste se
    ajustará a las disposiciones de dirección y administración de LA EMPRESA. Asimismo, deberá
    cumplir con las normas propias del centro de trabajo, las contenidas en el Reglamento Interno
    de Trabajo, de Seguridad y Salud en el Trabajo, de Seguridad Alimentaria y demás normas
    laborales y las que se impartan por necesidades del servicio, de conformidad con el artículo
    9° del T.U.O. de la Ley de Productividad y Competitividad Laboral aprobado por D.S. N° 003-97-TR;
    asimismo, se compromete a cumplir las obligaciones con buena fe, lealtad, fidelidad y
    responsabilidad, velando por los intereses de LA EMPRESA y cumpliendo con los estándares de
    asistencia laboral y calidad en las labores encargadas.
  </P>

  <P>
    EL (LA) TRABAJADOR (A) se obliga ante LA EMPRESA en forma concreta a ejecutar mientras dure
    la vigencia de su contrato las siguientes reglas de trabajo:
  </P>

  <ol className="mt-2 list-decimal pl-5 text-justify">
    <li className="mt-1">
      Cumplir y acatar las órdenes y disposiciones que bajo dirección y control de la empresa
      puedan recibir directamente de sus jefes inmediatos superiores o los gerentes de LA EMPRESA.
    </li>
    <li className="mt-1">
      Cumplir con los procesos y métodos de trabajo internos a su puesto de labor, así como las
      entregas y condiciones de trabajo del puesto que ocupa, de conformidad a las disposiciones
      internas de LA EMPRESA y normas convencionales vigentes.
    </li>
    <li className="mt-1">
      Reconocer la facultad de LA EMPRESA a planificar y ordenar las labores que debe desarrollar
      el trabajador, así como la facultad de poder reubicar a EL (LA) TRABAJADOR (A) en horas y
      turnos que requiera su actividad, o en cualquier otro puesto de similar categoría y
      remuneración, o en otra área o sección de trabajo que guarde relación con el origen de lo
      contratado.
    </li>
    <li className="mt-1">
      A conocer que las obligaciones y condiciones de trabajo establecidas en la presente cláusula
      son solamente enunciativas, pudiéndose dar otras durante la ejecución del contrato, las
      cuales serán ampliadas también por EL (LA) TRABAJADOR (A) siempre que se refieran a
      disposiciones de carácter laboral y que sean necesarias para optimizar y hacer productiva,
      a criterio del empleador, la labor contratada.
    </li>
    <li className="mt-1">
      A cumplir con las disposiciones vigentes en la empresa y actividades relacionadas con
      aspectos ambientales, de calidad y seguridad que existan en LA EMPRESA.
    </li>
  </ol>

  <P>
    La enumeración antes indicada es enunciativa y no limitativa, toda vez que, de acuerdo a las
    necesidades de LA EMPRESA, ésta puede introducir obligaciones adicionales y/o conexas que no
    resulten contrarias a las descritas en el presente documento.
  </P>

  {/* DÉCIMO PRIMERA */}
  <Clause>DÉCIMO PRIMERA: CONFIDENCIALIDAD.-</Clause>
  <P>
    EL (LA) TRABAJADOR (A) mantendrá confidencialidad absoluta durante la vigencia de este
    contrato, respecto de las informaciones y documentos en general proporcionados por LA EMPRESA
    o que hubiera obtenido en ejecución del mismo. Asimismo, se obliga a no divulgar a terceros
    ajenos a la empresa (dentro de los que se incluyen a los medios de comunicación), toda
    información legal, financiera, contable o general relativa al desarrollo de las operaciones o
    actividades de LA EMPRESA, incluidas sus sistemas y procesos de exportación, importación,
    producción y/o comercialización y marketing, ya sea que estén incorporados o no en documentos
    escritos, archivos o cualquier otro medio.
  </P>

  <P>
    EL (LA) TRABAJADOR (A) se compromete a no retirar de LA EMPRESA, mediante medios físicos,
    electrónicos u otros, ningún proceso o programa de cómputo. Además, velará para que durante el
    período que realice sus labores, terceras personas no tengan acceso a retirar parcial o
    totalmente cualquiera de los programas de cómputo de propiedad de LA EMPRESA o información
    relativa a sus datos.
  </P>

  <P>
    EL (LA) TRABAJADOR (A) responderá ante LA EMPRESA por los daños y perjuicios derivados del
    incumplimiento de lo previsto en esta cláusula, sin perjuicio de la incursión en falta grave y
    la aplicación de las medidas legales correspondientes.
  </P>

  <P>
    Esta obligación subsistirá aún después de terminada la relación laboral y su incumplimiento
    genera la correspondiente responsabilidad por daños y perjuicios, sin desmedro de la persecución
    penal por el delito previsto en el artículo 165° del Código Penal y además por lo dispuesto por
    el inciso d) del artículo 25° del D.S. 003-97-TR. EL (LA) TRABAJADOR (A) se obliga a entregar, al
    término del contrato, los documentos, materiales e informes a los que hubiere tenido acceso con
    motivo de la ejecución del mismo.
  </P>

  {/* DÉCIMO SEGUNDA */}
  <Clause>DÉCIMO SEGUNDA: NO DISCRIMINACIÓN.-</Clause>
  <P>
    LA EMPRESA, en observancia de lo previsto en el artículo 2, inciso 2 de la Constitución Política
    del Perú y en el Convenio 111 de la Organización Internacional del Trabajo, declara que en la
    presente contratación no ha mediado discriminación ni favoritismo sin causa objetiva, y se obliga
    a no efectuar distinciones, exclusiones o preferencias respecto de EL (LA) TRABAJADOR (A), basadas
    en motivos de raza, color, sexo, identidad de género, orientación sexual, embarazo, discapacidad,
    condición socioeconómica, edad, lengua, opinión política, sindicación, ascendencia, nacionalidad,
    origen social, idioma, condición económica ni cualquier otro motivo especificado por la legislación
    nacional, el Tribunal Constitucional o la OIT.
  </P>

  {/* DÉCIMO TERCERA */}
  <Clause>DÉCIMO TERCERA: SEGURIDAD Y SALUD EN EL TRABAJO.-</Clause>
  <P>
    EL (LA) TRABAJADOR (A) se compromete a respetar y dar estricto cumplimiento a las normas sobre
    seguridad y salud en el trabajo que LA EMPRESA establezca como medidas de prevención de accidentes
    y protección de los trabajadores y de todos los bienes e instalaciones de la misma. Asimismo,
    deberá cooperar plenamente en caso se accidente y/o incidentes, así como en la prevención de los
    mismos, quedando establecido que todo accidente de trabajo del cual tuviera conocimiento EL (LA)
    TRABAJADOR (A) deberá ser reportado en forma inmediata a fin de tomar las medidas urgentes que sean
    necesarias. Igualmente, EL (LA) TRABAJADOR (A) se compromete a contribuir al desarrollo de los
    programas de capacitación y entrenamiento que implemente LA EMPRESA en materia de seguridad y salud
    en el trabajo.
  </P>
        </PdfPage>
      )}
      {pagePart !== 1 && pagePart !== 2 && pagePart !== 4 && (
        <PdfPage headerLeft="Version 02" headerRight={codigo} pageNumber={3} pdfMode={pdfMode}>
  <P tight>
    LA EMPRESA, en cumplimiento de lo dispuesto por el artículo 35° de la Ley 29783,
    Ley de Seguridad y Salud en el trabajo, entrega a{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> una descripción
    de las recomendaciones de seguridad y salud en el trabajo para el puesto que se
    ocupará en virtud de la celebración del presente contrato. Dicha descripción se
    entrega a{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> como documento
    adjunto al presente contrato y detalla lo siguiente: (i) Los riesgos químicos,
    físicos, biológicos, ergonómicos, mecánicos, psicosociales, entre otros; a los que
    se pudiera ver expuesto el trabajador con motivo del desempeño de sus funciones; y
    (ii) las recomendaciones de seguridad y salud en el trabajo para reducir o mitigar
    tales riesgos detectados.
  </P>

  <P>
    Por su parte{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a
    observar estrictamente las pautas contenidas en la descripción de recomendaciones
    de seguridad y salud en el trabajo. Cualquier incumplimiento de las referidas
    pautas expone a{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> a un riesgo
    mayor, será debidamente sancionado por{" "}
    <span className="font-bold uppercase">LA EMPRESA</span>.
  </P>

  <P>
    LA EMPRESA se compromete a actualizar periódicamente la descripción de las
    recomendaciones de seguridad y salud en el trabajo de{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, en particular,
    en aquellos supuestos en que se le asignen nuevas funciones o cuando las nuevas
    pautas de seguridad y salud, con motivo de la mejora continua del Sistema de
    Gestión de Seguridad y Salud en el trabajo de{" "}
    <span className="font-bold uppercase">LA EMPRESA</span>.
  </P>

  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se obliga a
    cuidar de su persona y los bienes de su propiedad; no es ajeno, y a no exponer
    voluntaria o negligentemente a situaciones de riesgo en que pudieren encontrarse
    otros; cumplir estrictamente con las normas; no compartir con los demás
    trabajadores ni sus utensilios o consumos; retirar de ser el caso las informaciones
    de emergencia; asimismo, cumplir con las sanciones establecidas en los
    reglamentos, normas y procedimientos de la empresa y en las disposiciones legales
    vigentes en materia de seguridad y salud en el trabajo.
  </P>

  <Clause>DECIMO QUINTA: AUTORIZACIÓN DE DESCUENTO POR PLANILLA.-</Clause>
  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, en caso incurra
    en faltas y/o procedimientos establecidos por{" "}
    <span className="font-bold uppercase">LA EMPRESA</span>, y tal situación conlleve
    un perjuicio económico para ésta, autoriza que la misma le descuente de su
    remuneración la cantidad equivalente al perjuicio o pérdida ocasionados en
    infracción de tales estándares.
  </P>

  <P>
    Asimismo,{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> deberá
    reintegrar a{" "}
    <span className="font-bold uppercase">LA EMPRESA</span> el valor de los bienes que
    de su custodia haya sido su responsabilidad o custodia se perdieran o deterioren,
    o se afectaren por descuido o negligencia debidamente comprobada; así como los
    montos de dinero de propiedad de{" "}
    <span className="font-bold uppercase">LA EMPRESA</span>, a los que tuviere acceso
    con ocasión de sus funciones o que estén bajo su custodia y que durante la
    ejecución de servicio, negligencia o dejación de la presente cláusula o la
    conducta de sus actos o labores le causen daños o pérdidas a{" "}
    <span className="font-bold uppercase">LA EMPRESA</span>; o para cubrir su descargo
    y/o préstamos por{" "}
    <span className="font-bold uppercase">LA EMPRESA</span> con autorización igualmente
    expresa; así como su deducción por planillas, con cargo a su liquidación de
    beneficios sociales en caso de cese de la relación laboral.
  </P>

  <Clause>DECIMO SEXTA: AUTORIZACIÓN PARA RECOPILACIÓN Y TRATAMIENTO DE DATOS PERSONALES.-</Clause>
  <ol className="mt-2 list-decimal pl-5 text-justify">
    <li className="mt-1">
      Declaro expresamente, que, para efectos de la suscripción del presente contrato,
      he suministrado mis datos personales. Asimismo, durante la ejecución del servicio{" "}
      <span className="font-bold uppercase">LA EMPRESA</span> podrá tener acceso a otros
      datos personales, mismos suministrados o no por mí, o de ser el caso por cualquier
      otra persona.
    </li>
    <li className="mt-1">
      Declaro que{" "}
      <span className="font-bold uppercase">LA EMPRESA</span> me ha informado de manera
      expresa que la información que he proporcionado, como son: nombre, apellido,
      nacionalidad, estado civil, documento de identidad, ocupación, estudios,
      domicilio, correo electrónico, teléfono, estado de salud, actividades que realiza,
      ingresos económicos, patrimonio, gastos, entre otros, así como la referida a los
      rasgos físicos y de conducta que lo identifican o lo hacen identificable como son
      huella dactilar, firma, voz, etc. (datos biométricos), conforme a Ley es considerada
      como Datos Personales.
    </li>
    <li className="mt-1">
      Doy mi consentimiento libre, previo, expreso e informado para que mis Datos
      Personales sean tratados por{" "}
      <span className="font-bold uppercase">LA EMPRESA</span>, es decir, que puedan ser:
      recolectados, registrados, organizados, almacenados, conservados, elaborados,
      modificados, bloqueados, suprimidos, extraídos, consultados, utilizados,
      transferidos, o procesados de cualquier otra forma prevista por Ley. Estas
      autorizaciones indefinidas y se mantendrán vigentes después de terminado el
      servicio y/o el presente Contrato.
    </li>
    <li className="mt-1">
      Autorizo que mis datos sean compartidos, transmitidos, entregados, transferidos
      o divulgados para las finalidades mencionadas a: i) Personas jurídicas que tienen
      la calidad de filiales, subsidiarias, controlantes o vinculadas, o de matriz de{" "}
      <span className="font-bold uppercase">LA EMPRESA</span>; ii) Los operadores
      necesarios para el cumplimiento de los servicios que presta{" "}
      <span className="font-bold uppercase">LA EMPRESA</span>, a los como por ejemplo
      servicios de transporte de personal, seguros, operadores necesarios para el
      informe de consultas o cruce de perfil de calidades y competencia de personal
      para llenar sus vacantes de entre otros.
    </li>
    <li className="mt-1">
      Declaro que me han informado que tengo derecho a no proporcionar mis Datos
      Personales y que si no los proporciono no podrán tratar mis Datos Personales en
      la forma explicada en la presente cláusula, o que no me proporcionarán la
      ejecución y cumplimiento del Contrato.
    </li>
    <li className="mt-1">
      Asimismo, declaro conocer que puedo revocar el consentimiento para tratar mis
      Datos Personales en cualquier momento. Para ejercer este derecho o cualquier otro
      de que la Ley establece en relación a sus Datos Personales deberá remitirme el
      presente.
    </li>
    <li className="mt-1">
      COMO SEXTA: USO Y ENTREGA DIGITAL DE DOCUMENTOS LABORALES.-{" "}
      <span className="font-normal">
        (Se continúa en la cláusula siguiente.)
      </span>
    </li>
  </ol>

  {/* En la imagen, aquí ya arranca el bloque grande de “Uso y entrega digital...” */}
  <Clause>USO Y ENTREGA DIGITAL DE DOCUMENTOS LABORALES.-</Clause>
  <P>
    De acuerdo a lo dispuesto en el artículo 1° del Decreto Supremo N° 09-2011-TR, que
    modifica los artículos 18, 19 y 20 del Decreto Supremo N° 001-98-TR, y dentro de
    los alcances de las normas de simplificación en materia laboral contenidas en el
    Decreto Legislativo 1310,{" "}
    <span className="font-bold uppercase">LA EMPRESA</span> se encuentra facultada para
    sustituir las boletas de pago de manera digital. Asimismo, podrá hacer uso del
    sistema digital de entrega de dichas boletas, a través de mecanismos electrónicos.
  </P>

  <P>
    De igual manera,{" "}
    <span className="font-bold uppercase">LA EMPRESA</span> se encuentra facultada para
    implementar el sistema de firma y entrega digital de los documentos laborales
    parte de las boletas de pago, tales como las hojas de liquidación por tiempo de
    servicios - CTS, hojas de liquidaciones de participación en las utilidades, hoja
    de ejercicio gravable, gratificaciones, liquidaciones de beneficios sociales,
    certificado de renta y retenciones, certificado de trabajo, comprobante de
    retenciones por aportes al sistema privado de pensiones, entre otros documentos
    (en adelante, los Documentos Laborales).
  </P>

  <P>
    LA EMPRESA, en virtud de lo dispuesto en el Decreto Legislativo 1310, se encuentra
    facultada para sustituir el uso de firma y huella manuscrita por su firma digital
    y el sello manual por su firma digital, conforme lo regulado por el artículo 141-A
    del Código Civil; su firma electrónica, emitida conforme a lo regulado por la Ley
    número 27269, Ley de Firmas y Certificados Digitales, en todos los Documentos
    Laborales señalados. Por otra parte,{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>, (en beneficio
    de facilidad y seguridad) autoriza la entrega de manera digital de sus boletas y
    demás remuneraciones y beneficios; sustituyendo el uso de firma y huella, y
    reconociendo que dichos documentos serán puestos a su disposición mediante el uso
    de tecnologías de la información y comunicación.
  </P>

  <P>
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> otorga para la
    comunicación remota (medio de datos circunstanciales), el correo electrónico:
    <BlankPdf widthMm={70} /> y el número telefónico celular: <BlankPdf widthMm={55} value={celularValue} />;
    siendo estos válidos para las comunicaciones que efectuará{" "}
    <span className="font-bold uppercase">LA EMPRESA</span>.
  </P>

  <P>
    Asimismo, a través del portal digital y/o cuenta de correo electrónico del
    trabajador, la empresa remitirá otros documentos de índole laboral tales como:
    Reglamento Interno de Trabajo, Reglamento de Seguridad y Salud en el Trabajo,
    Directivas, Procedimientos y demás normas conexas. Por su parte{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a
    descargar dichos documentos durante su vigencia, y a dar cumplimiento estricto con
    las normas, procedimientos y documentos conexos puestos a su disposición; de no
    realizarlo a los términos señalados, a través de dichos medios de tecnología de la
    información y comunicación, se tendrá de conformidad con su entrega. De igual
    manera,{" "}
    <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> se compromete a
    lo siguiente:
  </P>

  <ol className="mt-2 list-decimal pl-5 text-justify">
    <li className="mt-1">
      Contar con una cuenta de correo electrónico, a la cual deberá proporcionar a{" "}
      <span className="font-bold uppercase">LA EMPRESA</span> en el plazo de{" "}
      <BlankPdf widthMm={18} /> días hábiles de iniciada la relación laboral. En caso{" "}
      <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> no confirme su
      dirección de correo electrónico en el plazo antes mencionado, acepta que{" "}
      <span className="font-bold uppercase">LA EMPRESA</span> envíe los Documentos
      Laborales al Portal digital o al portal web que utiliza la empresa para tal
      efecto.
    </li>
    <li className="mt-1">
      Mantener activo el correo electrónico y revisar periódicamente la plataforma en
      la cual{" "}
      <span className="font-bold uppercase">LA EMPRESA</span> ponga a su disposición
      los Documentos Laborales remitidos por{" "}
      <span className="font-bold uppercase">LA EMPRESA</span>.
    </li>
    <li className="mt-1">
      No proporcionar su cuenta de correo electrónico ni contraseña a ninguna persona
      distinta a la de{" "}
      <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span>; de no ser
      así asumirá toda la responsabilidad que derive de esta acción.
    </li>
    <li className="mt-1">
      Acusar recibo de la recepción de cada uno de los Documentos Laborales remitidos
      al trabajador por parte de{" "}
      <span className="font-bold uppercase">LA EMPRESA</span>, dando conformidad de
      recepción de los documentos marcando la opción correspondiente a través de la
      plataforma digital mediante el acuse de recibo o a través del correo electrónico.
      En caso <span className="font-bold uppercase">EL (LA) TRABAJADOR (A)</span> no
      manifieste el descargo dentro del plazo establecido, se entenderá por aceptados
      los documentos laborales. En caso tuviera alguna consulta, duda, observación o
      declaración de un error, deberá acercarse inmediatamente o enviar una
      comunicación escrita dentro de dicho término al correo corporativo del
      Departamento de Asuntos Corporativos y Gestión Humana:{" "}
      <span className="underline text-blue-700">acgh@agualima.com</span>, a fin de
      procurar resolverlos de común acuerdo entre las partes.
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
























