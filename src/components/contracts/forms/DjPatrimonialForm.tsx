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

function Box({
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
        "border border-black px-2 py-1 text-[8.5px] leading-[11px]",
        center ? "text-center" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Check({ size = 10, checked = false }: { size?: number; checked?: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center border border-black text-[8px] leading-none"
      style={{ width: size, height: size }}
    >
      {checked ? "X" : ""}
    </span>
  );
}

function BlueBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#2f3aa8] text-white font-bold px-2 py-1 text-[8.5px] border border-black">
      {children}
    </div>
  );
}

function GreenLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#9acd32] font-bold px-2 py-1 text-[8.5px] border border-black">
      {children}
    </div>
  );
}

function GreyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#d9d9d9] font-bold px-2 py-1 text-[8.5px] border-x border-b border-black text-center">
      {children}
    </div>
  );
}

function formatDate(dateStr?: string, separator = "/"): string {
  if (!dateStr) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}${separator}${month}${separator}${year}`;
  }
  return dateStr.split("-").reverse().join(separator);
}

export function DjPatrimonialForm({
  client,
  signatureSrc,
  fecha,
}: {
  client?: Cliente | null;
  signatureSrc?: string;
  fecha?: string;
}) {
  const apellidoPaterno = client?.a_paterno || client?.apellido || "";
  const apellidoMaterno = client?.a_materno || "";
  const nombres = client?.nombre || client?.nombre || "#N/D";
  const dni = client?.dni || "#N/D";
  const nacionalidad = "#N/D";
  const direccion = client?.direccion || "";
  const distrito = client?.distrito || "";
  const provincia = client?.provincia || "";
  const departamento = client?.departamento || "";
  const fechaSlash = formatDate(fecha, "/");
  const estadoCivil = client?.estado_civil || null;

  return (
    <div className="w-full bg-white text-black print:bg-white print:p-0" style={{ margin: 0, padding: 0 }}>
      <PdfPage>
        <div className="flex flex-col" style={{ minHeight: "260mm" }}>
        <div className="grid border border-black" style={{ gridTemplateColumns: "95px 1fr 210px" }}>
          <Box center className="flex items-center justify-center py-2">
            <img
              src={LOGO_AGUALIMA_SRC}
              alt="Logo"
              className="w-[70px] h-auto object-contain"
              draggable={false}
            />
          </Box>

          <Box center className="py-3">
            <div className="font-bold uppercase text-[9px]">
              DECLARACIÓN JURADA PATRIMONIAL DEL TRABAJADOR
            </div>
          </Box>

          <div className="border-l border-black">
            <div className="grid" style={{ gridTemplateRows: "1fr auto auto" }}>
              <Box center className="font-bold uppercase">
                ASUNTOS CORPORATIVOS Y GESTIÓN HUMANA
              </Box>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Box center className="font-bold">
                  FO-ACGH-ACGH-33
                </Box>
                <Box center className="font-bold">
                  Versión: 00
                </Box>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Box center className="font-bold">Fecha: {fechaSlash}</Box>
                <Box center className="font-bold">Página: 1 de 1</Box>
              </div>
            </div>
          </div>
        </div>

        <GreyBar>
          Para ser incorporada al Legajo Personal del trabajador del Sujeto Obligado supervisado
        </GreyBar>

        <div className="px-8 mt-3 text-[8.5px] leading-[12px]">
          <p className="text-justify">
            Declaro bajo juramento que los datos y demás información consignada en el presente documento
            son verdaderos y actuales, obligándome frente a mi empleador a presentarla anualmente, durante
            el mes de enero del año calendario siguiente, con datos actualizados a la fecha de presentación
          </p>

          <div className="mt-2">
            <div className="grid" style={{ gridTemplateColumns: "210px 1fr 1fr 1fr" }}>
              <BlueBar>INFORMACIÓN PERSONAL:</BlueBar>
              <Box center className="font-bold">{apellidoPaterno}</Box>
              <Box center className="font-bold">{apellidoMaterno}</Box>
              <Box center className="font-bold">{nombres}</Box>

              <GreenLabel>Apellido Paterno</GreenLabel>
              <GreenLabel>Apellido Materno</GreenLabel>
              <GreenLabel>Nombres</GreenLabel>
              <GreenLabel>País (De ser extranjero):</GreenLabel>

              <Box className="font-bold" center>{apellidoPaterno}</Box>
              <Box className="font-bold" center>{apellidoMaterno}</Box>
              <Box className="font-bold" center>{nombres}</Box>
              <Box center>&nbsp;</Box>

              <GreenLabel>Documento de Identidad:</GreenLabel>
              <Box>
                <span className="font-bold">D.N.I.</span>&nbsp;&nbsp; <span className="font-bold">{dni}</span>
              </Box>
              <Box center className="font-bold">{fechaSlash}</Box>
              <Box>
                <span className="font-bold">Nacionalidad:</span>&nbsp;&nbsp; <span className="font-bold">{nacionalidad}</span>
              </Box>

              <GreenLabel>Estado Civil:</GreenLabel>
              <Box className="col-span-3">
                <div className="flex flex-wrap gap-6 items-center">
                  <span>a. Soltero</span> <Check checked={estadoCivil === "SOLTERO"} />
                  <span>b. Casado</span> <Check checked={estadoCivil === "CASADO"} />
                  <span>c. Conviviente</span> <Check checked={estadoCivil === "CONVIVIENTE"} />
                  <span>d. Viudo</span> <Check checked={estadoCivil === "VIUDO"} />
                  <span>e. Divorciado</span> <Check checked={estadoCivil === "DIVORCIADO"} />
                </div>
              </Box>

              <Box className="col-span-3">
                <span className="font-bold">
                  Nombres - Apellido Paterno - Apellido Materno del cónyuge o conviviente (Si aplica)
                </span>
              </Box>
              <Box>
                <span className="font-bold">Número de dependientes</span>
              </Box>

              <Box className="col-span-3">&nbsp;</Box>
              <Box>&nbsp;</Box>

              <GreenLabel>Dirección Domiciliaria Actual:</GreenLabel>
              <Box className="col-span-3">{direccion || "\u00A0"}</Box>

              <Box className="col-span-2 text-center">Jr. / Av. / Calle / Pasaje</Box>
              <Box center>N°</Box>
              <Box center>Dpto. / Interior N°</Box>
              <Box center>Edificio / Urb. / Complejo / Zona / Sector</Box>

              <Box className="col-span-2">&nbsp;</Box>
              <Box>&nbsp;</Box>
              <Box>&nbsp;</Box>
              <Box>&nbsp;</Box>

              <Box className="col-span-2 text-center">Distrito</Box>
              <Box center>Provincia</Box>
              <Box center>Departamento</Box>

              <Box className="col-span-2">{distrito || "\u00A0"}</Box>
              <Box>{provincia || "\u00A0"}</Box>
              <Box>{departamento || "\u00A0"}</Box>

              <GreenLabel>Condición del inmueble en el que vive:</GreenLabel>
              <Box className="col-span-3">
                <div className="grid gap-y-1" style={{ gridTemplateColumns: "180px 180px 1fr" }}>
                  <div className="flex items-center gap-2">
                    <span>Casa Propia</span> <Check />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>De los Padres</span> <Check />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>De la sociedad conyugal</span> <Check />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Alquilada</span> <Check />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Cedida en uso</span> <Check />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Otra (indicar):</span> <Check />
                  </div>
                </div>
              </Box>
            </div>
          </div>

          <div className="mt-2 grid" style={{ gridTemplateColumns: "260px 1fr" }}>
            <BlueBar>INFORMACIÓN PATRIMONIAL:</BlueBar>
            <Box className="border-l-0">&nbsp;</Box>
            <div className="col-span-2 grid" style={{ gridTemplateColumns: "260px 1fr" }}>
              <GreenLabel>I.&nbsp;&nbsp; INGRESOS</GreenLabel>

              <div className="grid border border-black border-l-0" style={{ gridTemplateColumns: "1fr 70px" }}>
                <div className="border-r border-black">
                  <div className="px-2 py-1 text-[8.5px] leading-[11px]">
                    1. Remuneración bruta mensual (En planilla del Empleador)
                  </div>
                  <div className="border-t border-black px-2 py-1 text-[8.5px] leading-[11px]">
                    2. Otros Ingresos por ejercicio individual de profesión, oficio u otra labor
                  </div>
                  <div className="border-t border-black px-2 py-1 text-[8.5px] leading-[11px]">
                    3. Otros Ingresos mensuales
                  </div>
                </div>
                <div className="px-2 py-1 text-[8.5px] leading-[11px]">
                  <div className="text-right font-bold">S/.</div>
                  <div className="mt-6 text-right">&nbsp;</div>
                  <div className="mt-6 text-right">&nbsp;</div>
                </div>

                <div className="border-t border-black px-2 py-1 text-[8.5px] font-bold text-right col-span-2">
                  TOTAL:
                </div>
              </div>
            </div>

            <div className="col-span-2 grid mt-2" style={{ gridTemplateColumns: "1fr" }}>
              <GreenLabel>II.&nbsp;&nbsp; BIENES INMUEBLES</GreenLabel>

              <div className="grid border border-black border-t-0" style={{ gridTemplateColumns: "1fr 160px 90px" }}>
                <Box center className="font-bold border-t-0">
                  Dirección &nbsp; (Jr/Av/Calle - N° - Dpto o Interior - Urb/Zona/Sector/Complejo - Distrito - Provincia - Departamento)
                </Box>
                <Box center className="font-bold border-t-0">N° de Ficha o Partida Registral</Box>
                <Box center className="font-bold border-t-0">Valor S/.</Box>

                {Array.from({ length: 2 }).map((_, i) => (
                  <div className="contents" key={i}>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                  </div>
                ))}

                <Box className="bg-[#d9d9d9] col-span-3">
                  Marque P: si es bien propio; C: si es de la sociedad conyugal o los convivientes; CO si es copropietario con terceras personas
                </Box>

                <Box className="col-span-2 font-bold text-right">TOTAL:</Box>
                <Box>&nbsp;</Box>
              </div>
            </div>

            <div className="col-span-2 grid mt-2" style={{ gridTemplateColumns: "1fr" }}>
              <GreenLabel>III.&nbsp;&nbsp; BIENES MUEBLES</GreenLabel>

              <div className="grid border border-black border-t-0" style={{ gridTemplateColumns: "220px 1fr 1fr 60px 90px 90px" }}>
                <Box center className="font-bold border-t-0">Tipo de VEHICULO (Auto - Station Wagon - Camión)</Box>
                <Box center className="font-bold border-t-0">Marca</Box>
                <Box center className="font-bold border-t-0">Modelo</Box>
                <Box center className="font-bold border-t-0">Año</Box>
                <Box center className="font-bold border-t-0">Placa de Rodaje</Box>
                <Box center className="font-bold border-t-0">Valor S/.</Box>

                {Array.from({ length: 2 }).map((_, i) => (
                  <div className="contents" key={i}>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                  </div>
                ))}

                <Box center className="font-bold">OTROS</Box>
                <Box center className="font-bold col-span-2">Descripción</Box>
                <Box center className="font-bold col-span-2">Características</Box>
                <Box center className="font-bold">Valor</Box>

                <Box>&nbsp;</Box>
                <Box className="col-span-2">&nbsp;</Box>
                <Box className="col-span-2">&nbsp;</Box>
                <Box>&nbsp;</Box>

                <Box className="col-span-5 font-bold text-right">TOTAL:</Box>
                <Box>&nbsp;</Box>
              </div>
            </div>

            <div className="col-span-2 grid mt-2" style={{ gridTemplateColumns: "1fr" }}>
              <GreenLabel>IV.&nbsp;&nbsp; AHORROS, DEPÓSITOS COLOCACIONES, INVERSIONES EN EL SISTEMA FINANCIERO</GreenLabel>

              <div className="grid border border-black border-t-0" style={{ gridTemplateColumns: "1fr 220px 90px" }}>
                <Box center className="font-bold border-t-0">Nombre de la Entidad Financiera</Box>
                <Box center className="font-bold border-t-0">Tipo de Cuenta o Depósito</Box>
                <Box center className="font-bold border-t-0">Valor S/.</Box>

                {Array.from({ length: 3 }).map((_, i) => (
                  <div className="contents" key={i}>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                    <Box>&nbsp;</Box>
                  </div>
                ))}

                <Box className="col-span-3">
                  <span className="font-bold">Especificar el Origen de los Ahorros.</span>
                </Box>

                <Box className="col-span-2 font-bold text-right">TOTAL:</Box>
                <Box>&nbsp;</Box>
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <div className="grid" style={{ gridTemplateColumns: "260px 1fr" }}>
                <BlueBar>ACREENCIAS Y OBLIGACIONES:</BlueBar>
                <Box className="border-l-0">&nbsp;</Box>
              </div>

              <div className="grid border border-black border-t-0" style={{ gridTemplateColumns: "1fr 220px 90px" }}>
                <Box center className="font-bold">Detalle de la deuda u obligación</Box>
                <Box center className="font-bold">Asumida ante</Box>
                <Box center className="font-bold">Monto S/.</Box>

                {Array.from({ length: 3 }).map((_, i) => (
                  <div className="contents" key={i}>
                    <Box>&nbsp;</Box>
                    <Box>
                      <div className="grid gap-y-1" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                        <div className="flex items-center gap-2">
                          <span>Entidad Financiera</span> <Check />
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Persona Natural</span> <Check />
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Otro</span> <Check />
                        </div>
                      </div>
                    </Box>
                    <Box>&nbsp;</Box>
                  </div>
                ))}

                <Box className="col-span-2 font-bold text-right">TOTAL DEUDA:</Box>
                <Box>&nbsp;</Box>
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <div className="grid border border-black" style={{ gridTemplateColumns: "1fr 170px 90px 90px 90px" }}>
                <Box className="font-bold">ELABORADO Y SUSCRITO, EN LA CIUDAD DE</Box>
                <Box center className="font-bold">Ciudad</Box>
                <Box center className="font-bold">día (dd)</Box>
                <Box center className="font-bold">mes (mm)</Box>
                <Box center className="font-bold">año (aaaa)</Box>

                <Box>&nbsp;</Box>
                <Box>&nbsp;</Box>
                <Box>&nbsp;</Box>
                <Box>&nbsp;</Box>
                <Box>&nbsp;</Box>
              </div>

              <div className="border border-black border-t-0 px-8 py-3">
                <div className="border border-black h-[45px] flex items-end justify-center">
                  <div className="w-full px-6 pb-2 flex flex-col items-center">
                    <div className="relative" style={{ width: "200px", height: "28px", marginBottom: "4px" }}>
                      {signatureSrc && (
                        <img
                          src={signatureSrc}
                          alt="Firma"
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "50%",
                            transform: "translateX(-50%)",
                            height: "28px",
                            maxWidth: "200px",
                            objectFit: "contain",
                          }}
                          draggable={false}
                        />
                      )}
                    </div>
                    <div className="border-b border-black w-full" />
                    <p className="text-center font-bold text-[8.5px] mt-1">FIRMA DEL TRABAJADOR DECLARANTE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto" />
        </div>
      </div>
    </PdfPage>
    </div>
  );
}
