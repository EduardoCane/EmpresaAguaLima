import React from "react";
import type { Cliente } from "@/types";
import logoAgualima from "@/img/logo_header_1.jpeg";

const LOGO_AGUALIMA_SRC = logoAgualima;

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

const formatDate = (value?: string, separator: "/" | "." = "/") => {
  if (!value) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${day}${separator}${month}${separator}${now.getFullYear()}`;
  }

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.includes("/") || trimmed.includes(".")) {
    const parts = trimmed.split(/[/.]/);
    if (parts.length >= 3) {
      const day = String(parts[0]).padStart(2, "0");
      const month = String(parts[1]).padStart(2, "0");
      const year = String(parts[2]).slice(0, 4);
      return `${day}${separator}${month}${separator}${year}`;
    }
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${day}${separator}${month}${separator}${parsed.getFullYear()}`;
};

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

function HeaderCell({
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

function UnderlineTitle({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 font-bold underline text-[10px]">{children}</p>;
}

function UnderTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center font-bold uppercase underline underline-offset-4 text-[12px]">
      {children}
    </p>
  );
}

function H2u({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-bold underline text-[10px] mt-4" style={{ lineHeight: "2" }}>
      {children}
    </p>
  );
}

function P2({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] text-justify mt-2" style={{ lineHeight: "2" }}>
      {children}
    </p>
  );
}

export function ConsentimientoInformadoForm({
  client,
  pagePart = "all",
  fecha,
  signatureSrc,
}: {
  client?: Cliente | null;
  pagePart?: 1 | 2 | 3 | 4 | 5 | "all";
  fecha?: string;
  signatureSrc?: string;
}) {
  const fullName = buildFullName(client);
  const dni = buildDni(client);
  const fechaDot = formatDate(fecha, ".");
  const fechaSlash = formatDate(fecha, "/");

  console.log('ConsentimientoInformado - signatureSrc:', signatureSrc ? 'tiene firma' : 'NO tiene firma', 'pagePart:', pagePart);

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0" style={{ margin: 0, padding: 0 }}>
      {(pagePart === 1 || pagePart === "all") && (
        <PdfPage>
          {/* ENCABEZADO TIPO TABLA */}
          <div
            className="grid border border-black"
            style={{ gridTemplateColumns: "140px 1fr 300px" }}
          >
            {/* Logo */}
            <HeaderCell center className="flex items-center justify-center py-3">
              <img
                src={LOGO_AGUALIMA_SRC}
                alt="Logo"
                className="w-[85px] h-auto object-contain"
                draggable={false}
              />
            </HeaderCell>

            {/* Título */}
            <HeaderCell center className="flex items-center justify-center">
              <p className="font-bold uppercase text-[11px]">
                CONSENTIMIENTO INFORMADO SOBRE TRATAMIENTO
                <br />
                DE DATOS PERSONALES
              </p>
            </HeaderCell>

            {/* Bloque derecho (3 filas) */}
            <div className="border-l border-black">
              <div className="grid" style={{ gridTemplateRows: "1fr 1fr 1fr" }}>
                <HeaderCell center className="font-bold">
                  ASUNTOS CORPORATIVOS Y GESTIÓN HUMANA
                </HeaderCell>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <HeaderCell center className="font-bold">
                    FO-ACG-ACG-26
                  </HeaderCell>
                  <HeaderCell center className="font-bold">
                    Versión: 01
                  </HeaderCell>
                </div>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <HeaderCell center className="font-bold">
                    Fecha: 29.05.2024
                  </HeaderCell>
                  <HeaderCell center className="font-bold">
                    Página: 1 de 1
                  </HeaderCell>
                </div>
              </div>
            </div>
          </div>

          {/* CUERPO */}
          <div className="mt-8 text-[10px] leading-[16px] text-justify">
            <p>
              YO, <span className="font-bold">{fullName}</span>{" "}
              <span className="inline-block w-[120px]" />
              identificado con DNI{" "}
              <span className="inline-block w-[120px]" />
              <span className="font-bold">{dni}</span>
            </p>

            <p className="mt-4">
              en adelante EL (LA) <span className="font-bold uppercase">TRABAJADOR (A)</span> otorgo mi
              consentimiento libre, previo, informado, expreso e inequívoco para que{" "}
              <span className="font-bold uppercase">AGUALIMA S.A.C.</span>
            </p>

            <p className="mt-4">
              (en adelante, <span className="font-bold uppercase">LA EMPRESA</span>), con dirección en Av.
              Rivera Navarrete 395, interior 1804, San Isidro, Lima y con sede productiva en el Km.512
              Carretera Panamericana, Virú, La Libertad; incluya mis datos personales sensibles o no,
              consignados en el presente documento o en fichas de datos personales o fichas
              socio-familiar y verificación domiciliaria o contratos o registros de asistencia o files
              personal, tareo móvil, registros de fotocheck, Certificados de aptitud laboral, evaluación
              de desempeño, ERP de gestión de planillas u otro análogo; en sus sistemas y base de datos y
              pueda dar tratamiento a mi información con fines relacionados estrictamente con el desarrollo
              de la relación laboral o contractual que nos vincula; teniendo conocimiento que{" "}
              <span className="font-bold uppercase">LA EMPRESA</span> asegura la confidencialidad de mis
              datos y garantiza que no los compartirá con personas ajenas, salvo lo indicado en el
              presente documento.
            </p>

            <p className="mt-4">
              Así mismo, acepto que mis datos puedan ser cedidos exclusivamente con las finalidades
              indicadas anteriormente a otras personas naturales o jurídicas con las que{" "}
              <span className="font-bold uppercase">LA EMPRESA</span> suscriba acuerdos de colaboración,
              respetando el cumplimiento de la legislación peruana sobre protección de datos de carácter
              personal.
            </p>

            <p className="mt-4">
              Declaro haber sido informado por <span className="font-bold uppercase">LA EMPRESA</span> de
              forma sencilla, expresa, inequívoca y de manera previa a su recopilación, sobre la finalidad
              de mis datos personales; quiénes son o pueden ser sus destinatarios, la existencia del banco
              de datos en que se almacenarán. En tal sentido,{" "}
              <span className="font-bold uppercase">AGUALIMA</span> como responsable del tratamiento de los
              datos personales, informa:
            </p>

            <UnderlineTitle>Responsable del tratamiento de los Datos Personales</UnderlineTitle>
            <p className="mt-3">
              El responsable de tratamiento de los datos personales es{" "}
              <span className="font-bold uppercase">AGUALIMA S.A.C.</span> con RUC N°20512217452, con
              domicilio legal en Av. Rivera Navarrete N°395, Interior 1804, Distrito de San Isidro,
              Provincia y Departamento de Lima.
            </p>
            <p>
              La existencia de este Banco de Datos ha sido declarada ante la Autoridad competente,
              mediante la inscripción del Banco de Datos denominado “TRABAJADORES” con código RNPD-PJP N°
              15783.
            </p>

            <UnderlineTitle>Recopilación y finalidad de la Información</UnderlineTitle>
            <p className="mt-3">
              La recopilación se realiza al momento de la contratación o durante la vigencia del vínculo
              laboral; su uso es con fines relacionados estrictamente con el desarrollo de la relación
              laboral o contractual.
            </p>

            <UnderlineTitle>Responsabilidad por la información proporcionada</UnderlineTitle>
            <p className="mt-3">
              Los datos personales que EL (LA) TRABAJADOR (A) proporcione deben ser, bajo su
              responsabilidad, verdaderos, completos, exactos, vigentes, y corresponder a su verdadera
              identidad.
            </p>
            <p className="mt-3">
              Cualquier tipo de daño o perjuicio, directo indirecto, que se derive para{" "}
              <span className="font-bold uppercase">AGUALIMA</span> o para terceros como consecuencia del
              incumplimiento parcial o total de la obligación referida en el punto anterior, será
              responsabilidad única y exclusiva del usuario que proporcionó la información.
            </p>

            <UnderlineTitle>Tratamiento de la Información</UnderlineTitle>
            <p className="mt-3">
              Los datos personales proporcionados serán objeto de tratamiento únicamente para la finalidad
              específica para la que fueron suministrados.
            </p>
            <p className="mt-3">
              <span className="font-bold uppercase">AGUALIMA</span> no empleará los datos personales del
              usuario para ninguna finalidad distinta, a no ser que se trate de una finalidad expresamente
              permitida o exigida por la normativa vigente aplicable o que{" "}
              <span className="font-bold uppercase">AGUALIMA</span> haya recabado previamente el debido
              consentimiento del usuario.
            </p>
            <p className="mt-3">
              <span className="font-bold uppercase">AGUALIMA</span> sólo compartirá la información necesaria
              y exigida por las autoridades laborales, tributarias, administrativas o judiciales en el
              marco de la relación laboral; así como a otras personas naturales o jurídicas con las que{" "}
              <span className="font-bold uppercase">LA EMPRESA</span> suscriba acuerdos de colaboración en
              beneficio del trabajador.
            </p>
          </div>
        </PdfPage>
      )}

      {(pagePart === 2 || pagePart === "all") && (
        <PdfPage>
          {/* Para que la firma quede al fondo */}
          <div className="flex flex-col" style={{ minHeight: "100mm" }}>
            <div className="text-[10px]" style={{ lineHeight: "2" }}>
              <H2u>El carácter obligatorio o facultativo de sus respuestas al cuestionario</H2u>
              <P2>
                Es de carácter obligatorio completar la información en los documentos de reclutamiento
                dado que son necesarios para la ejecución de la relación contractual/laboral.
              </P2>

              <H2u>Plazo de tratamiento de los datos personales</H2u>
              <P2>
                Los datos personales podrán ser almacenados en bancos de datos deben conservarlos durante
                el tiempo el tiempo que dure la relación laboral y por un plazo máximo de 02 años de
                culminada la relación laboral.
              </P2>

              <H2u>Confidencialidad de los Datos Personales</H2u>
              <P2>
                Los datos personales facilitados por los usuarios serán tratados con total
                confidencialidad. AGUALIMA se compromete a guardar secreto profesional respecto de los
                mismos y garantiza el deber de guardarlos adoptando todas las medidas de seguridad
                necesarias.
              </P2>

              <H2u>Seguridad de los Datos Personales</H2u>
              <P2>
                En cumplimiento de la normativa vigente, se cuenta con medidas organizativas y técnicas
                apropiadas para garantizar la seguridad de los datos personales, evitando su alteración,
                pérdida, tratamiento indebido o acceso no autorizado.
              </P2>

              <H2u>Transferencias de datos</H2u>
              <P2>
                Los datos serán transferidos a nivel nacional cuando cualquier autoridad competente lo
                exija o si la normatividad vigente así lo establezca, tales como: Ministerio de Trabajo y
                Promoción del Empleo/ Gerencia Regional de Trabajo, SUNAT, SUNAFIL, ESSALUD, Poder
                Judicial, Ministerio Público, Ministerio de la Mujer y Poblaciones Vulnerables, Empresas
                Prestadoras de Salud, Empresas acreditadas en servicios de salud ocupacional, entre otros
                análogos.
              </P2>

              <H2u>Ejercicio de derechos ARCO</H2u>
              <P2>
                EL (A) TRABAJADOR (A) podrá ejercitar sus derechos de Información, Acceso, Rectificación,
                Cancelación, Revocación, Oposición, etc. (ARCO) al uso de sus datos personales, de
                conformidad con la Ley de Protección de Datos Personales, Ley N° 29733. En ese sentido,
                el usuario tiene derecho, entre otros, a acceder a su información personal, a solicitar la
                rectificación de datos inexactos y a revocar su consentimiento para el tratamiento de la
                misma; asimismo, podrá solicitar la supresión de sus datos u oponerse al tratamiento de
                los mismos, incluso cuando estos ya no resulten necesarios para los fines que motivaron su
                recopilación.
              </P2>

              <P2>
                El ejercicio de estos derechos es gratuito. Para ello, puede dirigirse por correo
                electrónico a <span className="underline">acgh@agualima.com</span> adjuntando la “Solicitud
                de Atención de Derechos ARCO - Ley N° 29733, Ley de Protección de Datos Personales” y
                copia del documento de identidad (DNI/CE/Pasaporte) que acredite que acredite su
                titularidad sobre los datos personales respecto de los cuales ejercerá su derecho, puede
                solicitar un ejemplar de esta solicitud en la oficina de Asuntos Corporativos &amp;
                Gestión Humana, ubicada en la Carretera Panamericana Norte km 512, Provincia de Virú,
                Departamento de La Libertad. Si utiliza un representante legal, éste deberá acreditarse
                como tal.
              </P2>

              <P2>
                La atención de la solicitud será efectuada de acuerdo a los plazos previstos en la
                normatividad de protección de datos personales.
              </P2>
            </div>

            {/* Footer */}
            <div className="mt-auto">
              <div className="text-[10px] leading-[14px]">
                <div className="flex gap-6 items-center">
                  <span className="font-bold">Fecha:</span>
                  <span>{fechaSlash}</span>
                </div>

                <div className="mt-3 flex flex-col items-center">
                  <div className="relative w-[260px] h-[40px]">
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
                  <p className="mt-1 text-center font-bold leading-tight">
                    Firma y huella del (a) trabajador (a) en señal de recepción y conformidad
                  </p>  
                </div>
              </div>
            </div>
          </div>
        </PdfPage>
      )}

      {(pagePart === 3 || pagePart === "all") && (
        <PdfPage>
          <div className="flex flex-col" style={{ minHeight: "160mm" }}>
            {/* HEADER */}
            <div
              className="grid border border-black"
              style={{ gridTemplateColumns: "140px 1fr 300px" }}
            >
              {/* Logo */}
              <HeaderCell center className="flex items-center justify-center py-3">
                <img
                  src={LOGO_AGUALIMA_SRC}
                  alt="Logo"
                  className="w-[85px] h-auto object-contain"
                  draggable={false}
                />
              </HeaderCell>

              {/* Título */}
              <HeaderCell center className="flex items-center justify-center">
                <p className="font-bold uppercase text-[11px]">
                  COMPROMISO DE CUMPLIMIENTO DE POLÍTICA
                  <br />
                  ANTICORRUPCIÓN Y SOBORNO
                </p>
              </HeaderCell>

              {/* Bloque derecho */}
              <div className="border-l border-black">
                <div className="grid" style={{ gridTemplateRows: "1fr 1fr 1fr" }}>
                  <HeaderCell center className="font-bold">
                    ASUNTOS CORPORATIVOS Y GESTIÓN HUMANA
                  </HeaderCell>

                  <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <HeaderCell center className="font-bold">
                      Código: FO-ACG-ACGH-30
                    </HeaderCell>
                    <HeaderCell center className="font-bold">
                      Versión: 00
                    </HeaderCell>
                  </div>

                  <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <HeaderCell center className="font-bold">
                      Fecha: 10/05/2019
                    </HeaderCell>
                    <HeaderCell center className="font-bold">
                      Página: 1 de 1
                    </HeaderCell>
                  </div>
                </div>
              </div>
            </div>

            {/* CUERPO */}
            <div className="mt-12 px-10 text-[10px] text-justify" style={{ lineHeight: "2" }}>
              <p>
                Mediante el presente documento dejo expresa constancia que he tomado conocimiento de lo
                establecido en la política anticorrupción y soborno establecida por Agualima.
              </p>

              <p className="mt-6">
                Asimismo, me comprometo a asistir a los cursos, reuniones, talleres y similares sobre
                prevención de actos de corrupción y soborno, así como dar a conocer cualquier
                incumplimiento de la política que se tenga conocimiento, mediante los canales
                implementados por la empresa.
              </p>

              <p className="mt-6">
                En atención a lo expuesto, reconozco que la omisión o incumplimiento de lo antes
                mencionado constituye falta grave conforme a lo establecido en el Reglamento Interno de
                Trabajo (RIT), por lo cual asumo las consecuencias que se deriven de su incumplimiento.
              </p>

              {/* DATOS */}
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline gap-6">
                  <span className="font-bold w-[140px]">Nombres y Apellidos:</span>
                  <span className="inline-flex items-baseline gap-2">
                    <span className="font-bold">{fullName}</span>
                    
                  </span>
                </div>
                <div className="flex items-baseline gap-6">
                  <span className="font-bold w-[140px]">DNI:</span>
                  <span className="font-bold">{dni}</span>
                </div>
                <div className="flex items-baseline gap-6">
                  <span className="font-bold w-[140px]">Fecha:</span>
                  <span>{fechaSlash}</span>
                </div>
              </div>
            </div>

            {/* FIRMA (al fondo) */}
            <div className="mt-auto">
              <div className="flex flex-col items-center">
                <div className="relative w-[260px] h-[40px]">
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
                <p className="mt-1 font-bold text-[10px] text-center">FIRMA Y HUELLA</p>
              </div>
            </div>
          </div>
        </PdfPage>
      )}

      {(pagePart === 4 || pagePart === "all") && (
        <PdfPage>
          <div className="flex flex-col" style={{ minHeight: "260mm" }}>
            {/* ========== HEADER ========== */}
            <div
              className="grid border border-black"
              style={{ gridTemplateColumns: "140px 1fr 280px" }}
            >
              {/* IZQUIERDA: logo + empresa + dirección */}
              <div className="grid" style={{ gridTemplateRows: "50px auto auto" }}>
                <HeaderCell center className="flex items-center justify-center py-0">
                  <img
                    src={LOGO_AGUALIMA_SRC}
                    alt="Logo"
                    className="w-[60px] h-auto object-contain"
                    draggable={false}
                  />
                </HeaderCell>

                <div className="border border-black px-1 py-1 text-[8px] leading-[10px] text-center">
                  <p className="uppercase font-bold">
                    EMPRESA AGUALIMA S.A.C.
                  </p>
                </div>

                <div className="border border-black px-1 py-1 text-[8px] leading-[10px] text-center">
                  <p className="uppercase">
                    DIRECCIÓN: CARRETERA<br />
                    PANAMERICANA NORTE<br />
                    KM 512-VIRÚ-LA LIBERTAD
                  </p>
                </div>
              </div>

              {/* CENTRO: título */}
              <HeaderCell center className="py-6 px-4 flex items-center justify-center">
                <p className="font-bold uppercase text-[10px] leading-[13px]">
                  COMPROMISO PARA ADOPTAR LAS MEDIDAS DE PREVENCIÓN CONTRA EL COVID-19
                </p>
              </HeaderCell>

              {/* DERECHA: SSOMA + tabla 2x2 */}
              <div className="border-l border-black">
                <div className="grid">
                  <HeaderCell center className="font-bold text-[9px] py-3">
                    SSOMA
                  </HeaderCell>

                  <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <HeaderCell center className="text-[8px] leading-[10px] py-3">
                      Código: FO-ACGH-SSOMA-30
                    </HeaderCell>
                    <HeaderCell center className="text-[8px] leading-[10px] py-3">
                      Versión: 02
                    </HeaderCell>
                  </div>

                  <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <HeaderCell center className="text-[8px] leading-[10px] py-3">
                      Fecha:26/12/2025
                    </HeaderCell>
                    <HeaderCell center className="text-[8px] leading-[10px] py-3">
                      Página 1 de 1
                    </HeaderCell>
                  </div>
                </div>
              </div>
            </div>

            {/* ========== CUERPO ========== */}
            <div className="mt-16 px-10 text-[10px] leading-[18px]">
              {/* YO / DNI */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <p>YO,</p>
                <p className="font-bold">{fullName}</p>
                <p>
                  identificado con DNI <span className="inline-block w-[50px]" />
                  <span className="font-bold">{dni}</span>
                </p>
              </div>

              <p className="text-justify">
                me comprometo a seguir voluntariamente y estrictamente las medidas de prevención contra
                la transmisión del virus, en todo momento que abarca desde el ingreso a laborar a la
                empresa hasta la salida de mi labor.
              </p>

              {/* Lista 1..8 */}
              <ol className="mt-4 space-y-3 pl-4 list-decimal text-justify">
                <li>
                  Mantendré mi distanciamiento físico de 2 metros, en las áreas comunes y cuando realice
                  mi labor, pero tambien de cualquier persona que esté tosiendo o estornudando.
                </li>
                <li>
                  Lavarme con agua y jabón o desinfectarme las manos frecuentemente y con una duración
                  recomendada de por lo menos 20 segundos.
                </li>
                <li>Respetaré los aforos permitidos por la empresa.</li>
                <li>
                  Utilizar mascarilla si tuviese síntomas respiratorio y desecharla en los puntos
                  indicados por la empresa, teniendo en cuenta que son de un solo uso y, en general,
                  debemos reemplazarlas cuando estén húmedas.
                </li>
                <li>
                  Evitemos tocarnos los ojos, la nariz y la boca, especialmente si no nos hemos lavado
                  las manos.
                </li>
                <li>
                  Reportar al área médica y/o supervisor directo si presento algún síntoma respiratorio.
                </li>
                <li>Me comprometo a completar el esquema de vacunación contra COVID – 19.</li>
                <li>
                  Seguir las indicaciones del área médica conforme a las medidas de higiene y prevención
                  ante el COVID-19 DE LA EMPRESA y, según la DIRECTIVA ADMINISTRATIVA N° 349 - MINSA 2024.
                </li>
              </ol>
            </div>

            {/* ========== FOOTER ========== */}
            <div className="mt-[52px] px-10 pb-8">
              <p className="text-[10px] leading-[14px] mb-6">Firmo en señal de compromiso.</p>

              {/* Tabla inferior */}
              <div className="border border-black">
                {/* área grande con firma/huella/DNI/Fecha */}
                <div className="grid" style={{ gridTemplateColumns: "1.8fr 1fr 1.1fr 1.1fr" }}>
                  <div className="h-[85px] border-r border-black flex items-start justify-center pt-2">
                    {signatureSrc ? (
                      <img
                        src={signatureSrc}
                        alt="Firma"
                        className="h-[70px] w-[100px] object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="h-[85px] border-r border-black" />
                  <div className="h-[85px] border-r border-black flex items-center justify-center font-bold">
                    {dni}
                  </div>
                  <div className="h-[85px] flex items-center justify-center">
                    {fechaSlash}
                  </div>
                </div>

                {/* labels */}
                <div className="grid border-t border-black" style={{ gridTemplateColumns: "1.8fr 1fr 1.1fr 1.1fr" }}>
                  <div className="text-center text-[10px] py-1 font-bold border-r border-black">
                    FIRMA
                  </div>
                  <div className="text-center text-[10px] py-1 font-bold border-r border-black">
                    HUELLA
                  </div>
                  <div className="text-center text-[10px] py-1 font-bold border-r border-black">
                    DNI
                  </div>
                  <div className="text-center text-[10px] py-1 font-bold">
                    FECHA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PdfPage>
      )}

      {(pagePart === 5 || pagePart === "all") && (
        <PdfPage>
          <div className="flex flex-col" style={{ minHeight: "260mm" }}>
            {/* Header */}
            <div className="mt-6 px-10">
              <UnderTitle>AUTORIZACIÓN DE DESCUENTO DE LA REMUNERACIÓN POR EL TRABAJADOR</UnderTitle>

              <div className="mt-10 flex justify-end text-[10px]">
                <p className="font-bold">Virú, {fechaSlash}</p>
              </div>

              {/* Señores */}
              <div className="mt-10 text-[10px] leading-[14px]">
                <p className="font-bold">Señores:</p>
                <p>AGUALIMA S.A.C.</p>
                <p className="font-bold mt-2">Atención:</p>
                <p>Selene Torres Vílchez</p>
                <p className="font-bold">Responsable de AC&amp;GH</p>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="mt-10 px-10 text-[10px] leading-[16px]">
              {/* Línea Yo / DNI (similar al formato de la imagen) */}
              <div className="grid grid-cols-[1fr_1fr] gap-8">
                <p className="text-center">
                  Yo, <span className="font-bold">{fullName}</span>
                </p>
                <p className="text-center">
                  identificado con DNI N° <span className="font-bold">{dni}</span>
                </p>
              </div>

              {/* Código + autorizo */}
              <div className="mt-6 grid grid-cols-[220px_1fr] gap-x-10 items-baseline">
                <p className="text-center">
                  y Código <span className="font-bold">#N/D</span>
                </p>
                <p className="text-justify">
                  solicito y <span className="font-bold uppercase">AUTORIZO</span> se proceda a
                  descontarme de mis remuneraciones el costo del almuerzo.
                </p>
              </div>

              <p className="mt-4 text-center">
                brindado por el concesionario equivalente a{" "}
                <span className="font-bold">S/6.00</span>
              </p>

              <p className="mt-6 text-justify">
                Este descuento se ejecutará siempre y cuando consuma el almuerzo con el concesionario de
                mi elección , para tal fin, firmaré el registro de consumo de almuerzo que el
                concesionario me haga llegar en señal de conformidad.
              </p>

              <p className="mt-8">Por tanto:</p>
              <p className="mt-3 text-justify">
                Solicito a usted informe a quien corresponda, para que se proceda a hacer efectivo el
                descuento correspondiente.
              </p>

              <p className="mt-10">de Ud.</p>
            </div>

            {/* Firma (al fondo, centrada) */}
            <div className="mt-20 px-10 pb-10">
              <div className="flex flex-col items-center">
                <div className="relative w-[360px] h-[40px]">
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
                        maxWidth: "220px",
                        objectFit: "contain",
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 h-px bg-black" />
                </div>
                <p className="mt-2 font-bold text-[10px]">{fullName}</p>
                <p className="font-bold text-[10px]">{dni}</p>
              </div>

              <p className="mt-10 text-[10px] font-bold">C.C. AC&amp;GH/CONTABILIDAD</p>
            </div>
          </div>
        </PdfPage>
      )}
    </div>
  );
}

export default ConsentimientoInformadoForm;
