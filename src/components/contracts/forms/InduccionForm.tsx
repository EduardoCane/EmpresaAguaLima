// Exportación para compatibilidad con el resto del sistema
export const InduccionForm = InduccionPuestoTrabajo;

import * as React from "react";
import type { Cliente } from "@/types";

/* =========================================================
	 INDUCCIÓN AL PUESTO DE TRABAJO (1 página) - IGUAL A IMAGEN
	 - Header 3x3 (logo + empresa/dirección / título / SSOMA + meta)
	 - Campos centrados
	 - Tabla con firmas como IMÁGENES (placeholders)
	 - Observaciones (línea punteada)
	 - Footer DNI / FIRMA / HUELLA
	 ========================================================= */

import logoAgualima from "@/img/logo_header_1.jpeg";
import firmaTrabajadoraSocial from "@/img/firmaTrabajadoraSocial.jpeg";
import firmaIng from "@/img/firmaIng.jpeg";
// Usar logo igual que otros contratos
const LOGO_SRC = logoAgualima;
const FIRMA_ANGELA_SRC = firmaTrabajadoraSocial;
const FIRMA_CARMEN_SRC = firmaIng;

const normalize = (value?: string | number | null) => {
	if (value === null || value === undefined) return "";
	return String(value).trim();
};

const buildFullName = (client?: Cliente | null) => {
	if (!client) return "#N/D";
	const apellidosNombres = normalize(client.apellidos_y_nombres);
	if (apellidosNombres) return apellidosNombres;

	const composed = [
		normalize(client.a_paterno),
		normalize(client.a_materno),
		normalize(client.nombre),
	]
		.filter(Boolean)
		.join(" ");

	return composed || "#N/D";
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

	const ddMmYyyy = trimmed.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})/);
	if (ddMmYyyy) {
		const [, dayRaw, monthRaw, yearRaw] = ddMmYyyy;
		const day = String(dayRaw).padStart(2, "0");
		const month = String(monthRaw).padStart(2, "0");
		const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw.slice(0, 4);
		return `${day}/${month}/${year}`;
	}

	const yyyyMmDd = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
	if (yyyyMmDd) {
		const [, year, month, day] = yyyyMmDd;
		return `${day}/${month}/${year}`;
	}

	const parsed = new Date(trimmed);
	if (Number.isNaN(parsed.getTime())) return "";

	const day = String(parsed.getDate()).padStart(2, "0");
	const month = String(parsed.getMonth() + 1).padStart(2, "0");
	return `${day}/${month}/${parsed.getFullYear()}`;
};

function ImgBox({
	src,
	w,
	h,
	alt,
}: {
	src: string;
	w: number;
	h: number;
	alt: string;
}) {
	return (
		<div className="flex items-center justify-center" style={{ width: w, height: h }}>
			<img
				src={src}
				alt={alt}
				style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
				draggable={false}
			/>
		</div>
	);
}

function Cell({
	children,
	center = false,
	className = "",
	style,
}: {
	children: React.ReactNode;
	center?: boolean;
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<div
			className={[
				"border border-black px-2 py-1",
				center ? "text-center" : "",
				className,
			].join(" ")}
			style={style}
		>
			{children}
		</div>
	);
}

function MiniCell({
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
				"border border-black px-2 py-[2px] text-[8px] leading-[10px]",
				center ? "text-center" : "",
				className,
			].join(" ")}
		>
			{children}
		</div>
	);
}

function DotLine() {
	return <div className="border-b border-dotted border-black h-[14px]" />;
}

/** Header EXACTO (como tu imagen) */
function HeaderInduccion() {
	return (
		<div className="border border-black">
			<div
				className="grid"
				style={{ gridTemplateColumns: "280px 1fr 170px", gridTemplateRows: "60px 24px 24px" }}
			>
				<div className="border-r border-b border-black flex items-center justify-center">
					<ImgBox src={LOGO_SRC} w={160} h={44} alt="Logo" />
				</div>
				<div className="border-r border-black row-span-3 flex items-center justify-center px-1">
					<span className="font-bold uppercase text-[11px] tracking-tight text-center leading-tight whitespace-nowrap">
						INDUCCIÓN AL PUESTO DE TRABAJO
					</span>
				</div>
				<div className="border-b border-black flex items-center justify-center font-bold text-[8px]">SSOMA</div>

				<div className="border-r border-b border-black flex items-center justify-center font-bold text-[7.5px]">
					EMPRESA: <span className="font-normal ml-1">AGUALIMA S.A.C.</span>
				</div>
				<div className="border-b border-black grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
					<div className="border-r border-black flex items-center justify-center text-[7px]">Código: FO-ACGH-ACGH-18</div>
					<div className="flex items-center justify-center text-[7px]">Versión: 11</div>
				</div>

				<div className="border-r border-black flex items-center justify-center font-bold text-[7.5px]">
					DIRECCION: <span className="font-normal ml-1">Carretera Panamericana Norte Km 512 viru-La Libertad</span>
				</div>
				<div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
					<div className="border-r border-black flex items-center justify-center text-[7px]">Fecha: 12/12/2025</div>
					<div className="flex items-center justify-center text-[7px]">Página 1 de 1</div>
				</div>
			</div>
		</div>
	);
}

function TableCell({
	children,
	center = false,
	className = "",
	style,
}: {
	children: React.ReactNode;
	center?: boolean;
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<div
			className={[
				"border border-black px-2 py-1 text-[7.5px] leading-[10px]",
				center ? "text-center" : "",
				className,
			].join(" ")}
			style={style}
		>
			{children}
		</div>
	);
}

interface InduccionFormProps {
	client?: Cliente | null;
	cargo?: string;
	unidadArea?: string;
	codigo?: string;
	fecha?: string;
	induccionValues?: Record<string, unknown> | null;
	signatureSrc?: string;
	pdfMode?: boolean;
}


export function InduccionPuestoTrabajo({
			 client,
			 cargo,
			 unidadArea,
			 codigo,
			 fecha,
			 induccionValues,
			 signatureSrc,
			 pdfMode = false,
}: InduccionFormProps = {}) {
			 const hasPersistedValues = !!(induccionValues && typeof induccionValues === "object");
			 const valuesObj = (induccionValues && typeof induccionValues === "object"
			 	? induccionValues
			 	: {}) as Record<string, unknown>;
			 const savedFechaRegistro = normalize(valuesObj.fecha_registro as string);
			 const savedFechaDisplay = savedFechaRegistro ? formatDate(savedFechaRegistro) : "";
			 const fullName = buildFullName(client);
			 const cargoDisplay = normalize(cargo) || normalize(client?.cargo) || "#N/D";
			 const areaDisplay = normalize(unidadArea) || normalize(client?.area) || "#N/D";
			 const codigoDisplay = normalize(codigo) || normalize(client?.cod) || "#N/D";
			 const dniDisplay = normalize(client?.dni) || "#N/D";
			 const fechaDisplay = savedFechaDisplay || (!hasPersistedValues ? formatDate(fecha) : "");

			 return (
							<div
											className="pdf-page mx-auto bg-white text-black shadow-sm print:shadow-none"
											data-pdf-page={pdfMode ? "1" : undefined}
											style={{
															width: "100%",
															maxWidth: "210mm",
															minHeight: pdfMode ? "297mm" : "260mm",
															boxSizing: "border-box",
															paddingTop: pdfMode ? "8mm" : undefined,
											}}
							>
											<div className="flex flex-col" style={{ minHeight: pdfMode ? "280mm" : "260mm" }}>
															{/* HEADER alineado */}
															<div className="px-8">
																			<HeaderInduccion />
															</div>

															{/* CAMPOS (centrados como imagen) */}
															<div className="mt-7 flex flex-col items-start text-[8px] leading-[10px]">
															 <div className="grid gap-y-2 gap-x-1 w-max ml-[15%]" style={{ gridTemplateColumns: "185px max-content" }}>
																			 <div className="font-bold">NOMBRE DE LA PERSONA INDUCIDA:</div>
																			 <div className="font-bold whitespace-nowrap pl-2">{fullName}</div>

																			 <div className="font-bold">CARGO DE LA PERSONA INDUCIDA:</div>
																			 <div className="font-bold whitespace-nowrap pl-2">{cargoDisplay}</div>
															 </div>

															 <div className="mt-5 w-[85%] ml-[10%] grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
																			 {/* ÁREA */}
																			 <div className="flex items-end gap-2">
																							 <div className="font-bold">ÁREA:</div>
																							 <div className="flex-1">
																											 <div className="font-bold text-center mb-[2px]">{areaDisplay}</div>
																											 <div className="border-b border-black" />
																							 </div>
																			 </div>

																			 {/* CÓDIGO */}
																			 <div className="flex items-end gap-2 justify-end">
																							 <div className="font-bold">CÓDIGO:</div>
																							 <div className="w-[220px]">
																											 <div className="font-bold text-center mb-[2px]">{codigoDisplay}</div>
																											 <div className="border-b border-black" />
																							 </div>
																			 </div>
															 </div>
											 </div>

															{/* TABLA */}
															<div className="mt-5 px-8">
															 <div
																			 className="grid border border-black"
																			 style={{
																							 gridTemplateColumns: "56px 1fr 170px 130px 90px",
																			 }}
															 >
																			 {/* Header row */}
																			 <TableCell center className="font-bold text-[7px]">
																							 ITEM
																			 </TableCell>
																			 <TableCell center className="font-bold text-[7px]">
																							 TEMAS A TRATAR
																			 </TableCell>
																			 <TableCell center className="font-bold text-[7px]">
																							 NOMBRE DEL INDUCTOR
																			 </TableCell>
																			 <TableCell center className="font-bold text-[7px]">
																							 FIRMA
																			 </TableCell>
																			 <TableCell center className="font-bold text-[7px]">
																							 FECHA
																			 </TableCell>

																			 {[
																							 {
																											 i: "1",
																											 t: "Misión, visión, valores corporativos y políticas de responsabilidad social.",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 26,
																							 },
																							 {
																											 i: "2",
																											 t: "Inducción en Buenas Prácticas Agrícolas y Buenas Prácticas en Manufacturas.",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 28,
																							 },
																							 {
																											 i: "3",
																											 t:
																															 "Presentación y explicación de la estructura y organización de la empresa.\n" +
																															 "Programa de prevención del riesgo de corrupción y soborno: Código de ética y conducta y Uso de canal de denuncias y línea ética.",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 56,
																							 },
																							 {
																											 i: "4",
																											 t:
																															 "Explicación de los horarios, ordenamiento de beneficios sociales y costumbres de la empresa y presentación a los compañeros de trabajo.",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 46,
																							 },
																							 {
																											 i: "5",
																											 t: "Presentación de las jefaturas y ambiente de trabajo.",
																											 n: "ANGELA CAMPOS BAZAN",
																											 firma: "ANGELA",
																											 fecha: "",
																											 h: 30,
																							 },
																							 {
																											 i: "6",
																											 t:
																															 "Programa de responsabilidad social: Código de Comercio Ético y Política de Derechos Humanos de AGUALIMA S.A.C; Política de trabajo libre, libertad de asociación, no discriminación, trabajo seguro y cuidado de medio ambiente; política salarial, anticorrupción y antisoborno.",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 64,
																							 },
																							 {
																											 i: "7",
																											 t:
																															 "Ley N° 27942, Ley de prevención y sanción de hostigamiento sexual y D.S. N° 014-2019-MIMP. Procedimiento y canal de denuncias para casos de acoso u hostigamiento.",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 56,
																							 },
																							 {
																											 i: "8",
																											 t: "Descripción de las responsabilidades del puesto (MOF), Reglamento Interno de Trabajo.",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 32,
																							 },
																							 {
																											 i: "9",
																											 t: "Reglamento de Higiene para trabajadores y visitantes Código:PL-GT-GT-01 Versión 1.0",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 30,
																							 },
																							 {
																											 i: "10",
																											 t:
																															 "Inducción en conocimientos generales SSOMA. Inducción en conocimientos generales de las normas de la empresa.",
																											 n: "CARMEN CECILIA ARCE PRIETO",
																											 firma: "CARMEN",
																											 fecha: "17/02/2026",
																											 h: 44,
																							 },
																							 {
																											 i: "11",
																											 t:
																															 "Programa de Prevención de Adicciones. Política SSOMA, Reglamento Interno de Seguridad y Salud en el Trabajo, Política Biodiversidad, Política de seguridad y regulación vial. Política de reciclaje",
																											 n: "",
																											 firma: null,
																											 fecha: "",
																											 h: 56,
																							 },
																			 ].map((r, idx) => (
																							 <React.Fragment key={idx}>
																											 <TableCell center style={{ height: r.h }}>
																															 {r.i}
																											 </TableCell>

																											 <TableCell className="whitespace-pre-line" style={{ height: r.h }}>
																															 {r.t}
																											 </TableCell>

																											 {/* 1-8: ANGELA / 9-11: CARMEN */}
																											 {idx === 0 && (
																															 <TableCell center className="font-bold row-span-8 flex items-center justify-center">
																																			 ANGELA CAMPOS BAZAN
																															 </TableCell>
																											 )}
																											 {idx === 8 && (
																															 <TableCell center className="font-bold row-span-3 flex items-center justify-center">
																																			 CARMEN CECILIA ARCE PRIETO
																															 </TableCell>
																											 )}

																											 {/* Firmas unidas por bloque igual a referencia */}
																											 {idx === 0 && (
																															 <TableCell center className="row-span-8 flex items-center justify-center">
																																			 <ImgBox src={FIRMA_ANGELA_SRC} w={195} h={68} alt="Firma Angela" />
																															 </TableCell>
																											 )}
																											 {idx === 8 && (
																															 <TableCell center className="row-span-3">
																																			 <div className="flex h-full items-center justify-center">
																																							 <ImgBox src={FIRMA_CARMEN_SRC} w={195} h={68} alt="Firma Carmen" />
																																			 </div>
																															 </TableCell>
																											 )}

																											 {/* Fecha única para toda la inducción */}
																											 {idx === 0 && (
																															 <TableCell center className="row-span-11 flex items-center justify-center">
																																			 {fechaDisplay}
																															 </TableCell>
																											 )}
																							 </React.Fragment>
																			 ))}
															 </div>
											 </div>

															{/* OBSERVACIONES */}
															<div className="px-8 mt-5 text-[8px]">
																			<div className="font-bold mb-1">OBSERVACIONES:</div>
																			<div className="space-y-1">
																							<DotLine />
																							<DotLine />
																							<DotLine />
																			</div>
															</div>

															{/* TEXTO FINAL */}
															<div className="px-8 mt-4 text-[7.5px] leading-[10px] text-justify">
																			<p>
																							DEJO CONSTANCIA DE HABER RECIBIDO LA INDUCCIÓN POR PARTE DE LA EMPRESA AGUALIMA S.A.C. Y DE
																							CONOCER MIS RESPONSABILIDADES EN MATERIA DE SEGURIDAD Y SALUD EN EL TRABAJO, POLÍTICAS DE LA
																							EMPRESA Y DEMÁS INFORMACIÓN QUE SE INDICA EN EL PRESENTE DOCUMENTO, COMPROMETIENDO A CUMPLIR
																							CON TODO LO EXPUESTO.
																			</p>
															</div>

															{/* FOOTER (igual a imagen) */}
															<div className="mt-auto px-8 pb-6 pt-4">
																			<div className="grid items-end" style={{ gridTemplateColumns: "1fr 1fr 120px" }}>
																							<div className="text-[8px]">
																											<span className="font-bold">DNI:</span>&nbsp;&nbsp;<span className="font-bold">{dniDisplay}</span>
																							</div>

																							<div className="text-[8px] flex items-center gap-2 justify-center">
																											<span className="font-bold">FIRMA:</span>
																											<div className="flex flex-col">
																															<div className="relative" style={{ width: "205px", height: "44px" }}>
																																			{signatureSrc && (
																																							<img
																																											src={signatureSrc}
																																											alt="Firma del trabajador"
																																											style={{
																																															position: "absolute",
																																															bottom: "2px",
																																															left: "0",
																																															height: "40px",
																																															maxWidth: "205px",
																																															objectFit: "contain",
																																											}}
																																											draggable={false}
																																							/>
																																			)}
																															</div>
																															<div className="border-b border-black w-[205px]" />
																											</div>
																							</div>

																							<div className="flex flex-col items-center">
																											<div className="border border-black w-[76px] h-[90px]" />
																											<div className="text-[8px] font-bold mt-1">HUELLA</div>
																							</div>
																			</div>
															</div>
											</div>
							</div>
			 );
}


