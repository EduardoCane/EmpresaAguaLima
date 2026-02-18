import { Cliente, Contrato, ClienteFirma } from '@/types';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { differenceInYears, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

export function useReportGenerator() {
  const filterClientesByDate = (clientes: Cliente[], startDate: Date, endDate: Date): Cliente[] => {
    const toDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startKey = toDateKey(startDate);
    const endKey = toDateKey(endDate);

    const getClientDateKey = (value: string | Date | null | undefined) => {
      if (!value) return '';
      if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return toDateKey(parsed);
        return '';
      }
      return toDateKey(value);
    };

    return clientes.filter(cliente => {
      const clientKey = getClientDateKey(cliente.created_at);
      if (!clientKey) return false;
      return clientKey >= startKey && clientKey <= endKey;
    });
  };

  const getLatestContratoByCliente = (contratos: Contrato[]) => {
    const map = new Map<string, Contrato>();
    contratos.forEach(contrato => {
      const existing = map.get(contrato.cliente_id);
      if (!existing) {
        map.set(contrato.cliente_id, contrato);
        return;
      }
      const existingDate = new Date(existing.created_at).getTime();
      const nextDate = new Date(contrato.created_at).getTime();
      if (nextDate > existingDate) {
        map.set(contrato.cliente_id, contrato);
      }
    });
    return map;
  };

  const toDateOrNull = (value?: string | Date | null) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const localDate = new Date(year, month - 1, day);
        return Number.isNaN(localDate.getTime()) ? null : localDate;
      }
    }
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDateOrND = (value?: string | Date | null) => {
    const date = toDateOrNull(value);
    return date ? format(date, 'dd/MM/yyyy', { locale: es }) : '';
  };

  const formatTextOrND = (value?: string | null) => {
    const trimmed = value?.toString().trim();
    return trimmed ? trimmed : '';
  };

  const formatNumberOrND = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '';
    return value;
  };

  const formatNuevaAfiliacion = (value?: boolean | null) => {
    if (value === null || value === undefined) return '';
    return value ? 'SI' : 'NO';
  };

  const buildReportRows = (clientes: Cliente[], contratos: Contrato[]) => {
    const contratosMap = getLatestContratoByCliente(contratos);
    return clientes.map(cliente => {
      const contrato = contratosMap.get(cliente.id);
      const ficha = contrato?.ficha_datos as any;
      
      const apellidos = [
        cliente.a_paterno || '',
        cliente.a_materno || '',
      ].filter(Boolean).join(' ').trim();
      const nombres = (cliente.nombre || '').trim();
      const apellidosNombres = (
        cliente.apellidos_y_nombres ||
        [apellidos, nombres].filter(Boolean).join(' ')
      ).trim();
      const fechaNacimiento = toDateOrNull(cliente.fecha_nac);
      const edad = cliente.edad ?? (fechaNacimiento ? differenceInYears(new Date(), fechaNacimiento) : null);

      return [
        formatDateOrND(cliente.fecha_reclutamiento),
        formatTextOrND(cliente.cod),
        formatTextOrND((cliente as any).repetir_codigo ?? cliente.cod),
        formatTextOrND(cliente.a_paterno),
        formatTextOrND(cliente.a_materno),
        formatTextOrND(nombres),
        formatTextOrND(apellidosNombres),
        formatTextOrND(cliente.dni),
        formatDateOrND(cliente.fecha_nac),
        formatNumberOrND(edad),
        formatTextOrND(cliente.area ?? ficha?.unidadArea),
        formatTextOrND(cliente.descripcion_zona ?? ficha?.descripcion_zona),
        formatTextOrND(cliente.id_afp),
        formatTextOrND(cliente.cuspp),
        formatDateOrND(cliente.fecha_inicio_afiliacion),
        formatNumberOrND(cliente.porcentaje_comision ?? null),
        formatNuevaAfiliacion(cliente.nueva_afiliacion ?? null),
        formatTextOrND(cliente.grado_instruccion),
        formatTextOrND(cliente.asignacion ?? ficha?.asignacion),
        formatTextOrND(cliente.estado_actual ?? contrato?.estado),
        formatTextOrND(cliente.sexo),
        formatTextOrND(cliente.estado_civil),
        formatTextOrND(cliente.direccion),
        formatTextOrND(cliente.distrito),
        formatTextOrND(cliente.provincia),
        formatTextOrND(cliente.departamento),
        formatTextOrND(cliente.cargo ?? ficha?.puesto),
        formatDateOrND(cliente.fecha_inicio_contrato ?? ficha?.periodoDesde),
        formatDateOrND(cliente.fecha_termino_contrato ?? ficha?.periodoHasta),
        formatNumberOrND(cliente.remuneracion ?? ficha?.remuneracion ?? null),
        formatTextOrND(cliente.tipo_contrato ?? contrato?.contenido?.split('\n')[0]),
        formatTextOrND(cliente.planilla ?? ficha?.planilla),
        formatTextOrND(cliente.observaciones ?? ficha?.observaciones),
        formatTextOrND(cliente.referido ?? ficha?.referido),
        formatTextOrND(cliente.lugar ?? ficha?.lugar),
        formatTextOrND(cliente.cooperador ?? ficha?.cooperador),
      ];
    });
  };

  const generateExcelReport = async (
    clientes: Cliente[],
    reportName: string,
    contratos: Contrato[] = []
  ) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ClientScan Hub';
    workbook.created = new Date();

    // Cargar el logo de Igualima
    let logoImageId: number | null = null;
    try {
      const logoUrl = new URL('/src/img/logo_header_1.jpeg', import.meta.url).href;
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      logoImageId = workbook.addImage({
        buffer: arrayBuffer,
        extension: 'jpeg',
      });
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
    }

    // Cargar firmas de los clientes desde Supabase
    const firmasMap = new Map<string, { imageId: number; url: string }>();
    try {
      const clienteIds = clientes.map(c => c.id);
      
      if (clienteIds.length > 0) {
        const { data: firmas, error } = await supabase
          .from('cliente_firmas')
          .select('cliente_id, firma_url')
          .in('cliente_id', clienteIds)
          .eq('activa', true);

        if (error) {
          console.warn('Error al cargar firmas:', error);
        } else if (firmas && firmas.length > 0) {
          // Descargar y agregar cada firma al workbook
          for (const firma of firmas) {
            try {
              const response = await fetch(firma.firma_url);
              const blob = await response.blob();
              const arrayBuffer = await blob.arrayBuffer();
              
              // Detectar extensión desde la URL o tipo MIME
              let extension: 'png' | 'jpeg' | 'gif' = 'png';
              if (firma.firma_url.toLowerCase().includes('.jpg') || firma.firma_url.toLowerCase().includes('.jpeg') || blob.type.includes('jpeg')) {
                extension = 'jpeg';
              } else if (firma.firma_url.toLowerCase().includes('.gif') || blob.type.includes('gif')) {
                extension = 'gif';
              }
              
              const imageId = workbook.addImage({
                buffer: arrayBuffer,
                extension: extension,
              });
              
              firmasMap.set(firma.cliente_id, { imageId, url: firma.firma_url });
            } catch (imgError) {
              console.warn(`Error al cargar firma para cliente ${firma.cliente_id}:`, imgError);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error al obtener firmas de clientes:', error);
    }

    const worksheet = workbook.addWorksheet('Clientes', {
      views: [{ state: 'frozen', ySplit: 4 }],
    });

    const headers = [
      'FECHA DE RECLUTAMIENTO',
      'COD',
      'REPETIR CODIGO',
      'A_PATERNO',
      'A_MATERNO',
      'NOMBRE',
      'APELLIDOS Y NOMBRES',
      'DNI',
      'FECHA DE NAC.',
      'EDAD',
      'AREA',
      'DESCRIPCION_ZONA',
      'ID AFP',
      'CUSPP',
      'FECHA DE INICIO DE AFILIACION',
      '% DE COMISION',
      'NUEVA AFILIACION',
      'GRADO DE INSTRUCCION',
      'ASIGNACION',
      'ESTADO ACTUAL',
      'SEXO',
      'ESTADO CIVIL',
      'DIRECCION',
      'DISTRITO',
      'PROVINCIA',
      'DEPARTAMENTO',
      'CARGO',
      'FECHA DE INICIO DE CONTRATO',
      'FECHA DE TERMINO DE CONTRATO',
      'REMUNERACION',
      'TIPO DE CONTRATO',
      'PLANILLA',
      'OBSERVACIONES',
      'REFERIDO',
      'LUGAR',
      'COOPERADOR',
    ];

    const getColumnLetter = (index: number) => {
      let result = '';
      let n = index;
      while (n > 0) {
        const rem = (n - 1) % 26;
        result = String.fromCharCode(65 + rem) + result;
        n = Math.floor((n - 1) / 26);
      }
      return result;
    };

    const lastCol = getColumnLetter(headers.length);

    worksheet.mergeCells(`A1:${lastCol}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Reporte de Clientes Registrados';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells(`A2:${lastCol}2`);
    const generatedCell = worksheet.getCell('A2');
    generatedCell.value = `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`;
    generatedCell.font = { size: 10, color: { argb: 'FF6B7280' } };
    generatedCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells(`A3:${lastCol}3`);
    const totalCell = worksheet.getCell('A3');
    totalCell.value = `Total de clientes: ${clientes.length}`;
    totalCell.font = { size: 10, color: { argb: 'FF6B7280' } };
    totalCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8BC34A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
    });

    buildReportRows(clientes, contratos).forEach(rowData => {
      const row = worksheet.addRow(rowData);

      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });

    const columnWidths = [
      16, 10, 22, 16, 16, 18, 28, 12, 14, 8, 18, 22, 12, 16, 20, 14, 16, 22,
      18, 16, 10, 16, 28, 16, 16, 16, 22, 20, 22, 16, 22, 16, 22, 24, 16, 18,
    ];
    headers.forEach((_, index) => {
      const width = columnWidths[index] ?? 16;
      worksheet.getColumn(index + 1).width = width;
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 5 && rowNumber % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      }
    });

    // Segunda hoja: Formato de Entrega de Fotocheck
    const fotocheckSheet = workbook.addWorksheet('Entrega de Fotocheck', {
      views: [{ state: 'frozen', ySplit: 4 }],
    });

    // Configurar anchos de columna
    fotocheckSheet.getColumn(1).width = 6;  // N°
    fotocheckSheet.getColumn(2).width = 12; // CÓDIGO
    fotocheckSheet.getColumn(3).width = 35; // APELLIDOS Y NOMBRES
    fotocheckSheet.getColumn(4).width = 18; // ÁREA
    fotocheckSheet.getColumn(5).width = 25; // FIRMA (aumentado para mejor visualización)
    fotocheckSheet.getColumn(6).width = 18; // FECHA DE ENTREGA

    // Configurar alturas de filas del encabezado
    fotocheckSheet.getRow(1).height = 20;
    fotocheckSheet.getRow(2).height = 20;
    fotocheckSheet.getRow(3).height = 20;

    // Fila 1-3: Logo (A1:B3)
    fotocheckSheet.mergeCells('A1:B3');
    const logoCell = fotocheckSheet.getCell('A1');
    logoCell.alignment = { vertical: 'middle', horizontal: 'center' };
    logoCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };
    
    if (logoImageId !== null) {
      // Centrar el logo en la celda combinada (A1:B3)
      fotocheckSheet.addImage(logoImageId, {
        tl: { col: 0.1, row: 0.2 },
        ext: { width: 110, height: 48 },
      });
    } else {
      logoCell.value = 'Igualima';
      logoCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      logoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
    }

    // Fila 1-3: Título centrado (C1:D3)
    fotocheckSheet.mergeCells('C1:D3');
    const tituloCell = fotocheckSheet.getCell('C1');
    tituloCell.value = 'FORMATO DE ENTREGA DE FOTOCHECK';
    tituloCell.font = { size: 13, bold: true };
    tituloCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    tituloCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Fila 1: Asuntos corporativos (E1:F1)
    fotocheckSheet.mergeCells('E1:F1');
    const asuntosCell = fotocheckSheet.getCell('E1');
    asuntosCell.value = 'ASUNTOS CORPORATIVOS Y DE GESTIÓN HUMANA';
    asuntosCell.font = { size: 8, bold: true };
    asuntosCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    asuntosCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Fila 2: Código (E2)
    fotocheckSheet.getCell('E2').value = 'FO-ACG-ACG-12';
    fotocheckSheet.getCell('E2').font = { size: 9 };
    fotocheckSheet.getCell('E2').alignment = { vertical: 'middle', horizontal: 'center' };
    fotocheckSheet.getCell('E2').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Fila 2: Versión (F2)
    fotocheckSheet.getCell('F2').value = 'Versión: 00';
    fotocheckSheet.getCell('F2').font = { size: 9 };
    fotocheckSheet.getCell('F2').alignment = { vertical: 'middle', horizontal: 'center' };
    fotocheckSheet.getCell('F2').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Fila 3: Fecha (E3)
    fotocheckSheet.getCell('E3').value = 'Fecha: 22/06/16';
    fotocheckSheet.getCell('E3').font = { size: 9 };
    fotocheckSheet.getCell('E3').alignment = { vertical: 'middle', horizontal: 'center' };
    fotocheckSheet.getCell('E3').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Fila 3: Página (F3)
    fotocheckSheet.getCell('F3').value = 'Página: 1 de 1';
    fotocheckSheet.getCell('F3').font = { size: 9 };
    fotocheckSheet.getCell('F3').alignment = { vertical: 'middle', horizontal: 'center' };
    fotocheckSheet.getCell('F3').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Fila 4: Encabezados de la tabla
    const fotocheckHeaders = ['N°', 'CÓDIGO', 'APELLIDOS Y NOMBRES', 'ÁREA', 'FIRMA', 'FECHA DE ENTREGA'];
    const headerRow2 = fotocheckSheet.addRow(fotocheckHeaders);
    headerRow2.height = 30;
    headerRow2.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      
      // Asegurarse de que solo las primeras 6 columnas tengan el formato
      if (colNumber > 6) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.border = {};
      }
    });

    // Agregar datos de los clientes
    clientes.forEach((cliente, index) => {
      const apellidosNombres = (
        cliente.apellidos_y_nombres ||
        [cliente.a_paterno, cliente.a_materno, cliente.nombre]
          .filter(Boolean)
          .join(' ')
      ).trim().toUpperCase();
      const fechaEntrega = formatDateOrND(cliente.created_at ?? cliente.fecha_reclutamiento);

      const rowData = [
        index + 1,
        formatTextOrND(cliente.cod) || '',
        apellidosNombres || '',
        formatTextOrND(cliente.area) || '',
        '', // FIRMA (vacío, se agregará como imagen si existe)
        fechaEntrega,
      ];

      const dataRow = fotocheckSheet.addRow(rowData);
      dataRow.height = 55; // Aumentar altura para la firma
      const currentRowNumber = dataRow.number;
      
      dataRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      dataRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
      dataRow.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      dataRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
      dataRow.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
      dataRow.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };

      // Aplicar bordes solo a las primeras 6 columnas
      for (let col = 1; col <= 6; col++) {
        dataRow.getCell(col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }

      // Agregar firma si existe
      const firmaData = firmasMap.get(cliente.id);
      if (firmaData) {
        try {
          // Centrar la firma en la celda E (columna 4, índice 0)
          // Posicionamiento: col 4 es la quinta columna (FIRMA)
          // Offset 0.13 para centrar horizontalmente
          // Offset 0.13 para centrar verticalmente
          fotocheckSheet.addImage(firmaData.imageId, {
            tl: { col: 4.1, row: currentRowNumber - 1 + 0.1 }, // Centrado horizontal y vertical
            ext: { width: 160, height: 50 }, // Tamaño más grande para mejor visualización
          });
        } catch (error) {
          console.warn(`Error al insertar firma para cliente ${cliente.id}:`, error);
        }
      }
    });

    // Agregar filas vacías adicionales (hasta completar al menos 14 filas como en el diseño)
    const rowsToAdd = Math.max(14 - clientes.length, 2);
    for (let i = 0; i < rowsToAdd; i++) {
      const emptyRow = fotocheckSheet.addRow(['', '', '', '', '', '']);
      emptyRow.height = 45;
      
      // Aplicar bordes solo a las primeras 6 columnas
      for (let col = 1; col <= 6; col++) {
        emptyRow.getCell(col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    // Agregar autofiltros a la tabla de fotocheck
    const totalRows = 4 + clientes.length + rowsToAdd;
    fotocheckSheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: totalRows, column: 6 }
    };

    // Tercera hoja: TM {AÑO}
    const currentYear = new Date().getFullYear();
    const tmSheet = workbook.addWorksheet(`TM ${currentYear}`, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Obtener contratos para la hoja TM
    const contratosMapTM = getLatestContratoByCliente(contratos);

    // Configurar anchos de columna para la hoja TM
    tmSheet.getColumn(1).width = 12;  // DNI
    tmSheet.getColumn(2).width = 10;  // COD
    tmSheet.getColumn(3).width = 15;  // A_PATERNO
    tmSheet.getColumn(4).width = 15;  // A_MATERNO
    tmSheet.getColumn(5).width = 15;  // NOMBRE
    tmSheet.getColumn(6).width = 35;  // APELLIDOS Y NOMBRES
    tmSheet.getColumn(7).width = 15;  // FECHA DE...
    tmSheet.getColumn(8).width = 8;   // EDAD
    tmSheet.getColumn(9).width = 30;  // ÁREA
    tmSheet.getColumn(10).width = 35; // DESCRIPCIÓN_ZONA
    tmSheet.getColumn(11).width = 15; // FECHA DE...
    tmSheet.getColumn(12).width = 10; // Total
    // Separador (columna vacía)
    tmSheet.getColumn(13).width = 3;  // Separador
    // Segunda tabla
    tmSheet.getColumn(14).width = 10; // COD
    tmSheet.getColumn(15).width = 30; // CARGO
    tmSheet.getColumn(16).width = 25; // FECHA DE TERMINO DE CONTRATO
    tmSheet.getColumn(17).width = 25; // PLANILLA
    tmSheet.getColumn(18).width = 8;  // SEXO

    // Encabezados de la hoja TM
    const tmHeaders = [
      'DNI',
      'COD',
      'A_PATERNO',
      'A_MATERNO',
      'NOMBRE',
      'APELLIDOS Y NOMBRES',
      'FECHA DE...',
      'EDAD',
      'ÁREA',
      'DESCRIPCIÓN_ZONA',
      'FECHA DE...',
      'Total',
      '',  // Columna separadora
      'COD',
      'CARGO',
      'FECHA DE TERMINO DE CONTRATO',
      'PLANILLA',
      'SEXO',
    ];

    const tmHeaderRow = tmSheet.addRow(tmHeaders);
    tmHeaderRow.height = 25;
    
    // Estilo para primera tabla (columnas 1-12)
    for (let col = 1; col <= 12; col++) {
      const cell = tmHeaderRow.getCell(col);
      cell.font = { bold: true, size: 10, color: { argb: 'FF000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Amarillo
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
    
    // Estilo para segunda tabla (columnas 14-18)
    for (let col = 14; col <= 18; col++) {
      const cell = tmHeaderRow.getCell(col);
      cell.font = { bold: true, size: 10, color: { argb: 'FF000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Amarillo
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }

    // Agregar datos de clientes a la hoja TM
    clientes.forEach(cliente => {
      const contrato = contratosMapTM.get(cliente.id);
      const ficha = contrato?.ficha_datos as any;

      // Construir apellidos y nombres completo
      const apellidosNombres = (
        cliente.apellidos_y_nombres ||
        [cliente.a_paterno, cliente.a_materno, cliente.nombre]
          .filter(Boolean)
          .join(' ')
      ).trim();

      const rowData = [
        formatTextOrND(cliente.dni),
        formatTextOrND(cliente.cod),
        formatTextOrND(cliente.a_paterno),
        formatTextOrND(cliente.a_materno),
        formatTextOrND(cliente.nombre),
        apellidosNombres, // APELLIDOS Y NOMBRES completo
        formatDateOrND(cliente.fecha_nac),
        formatNumberOrND(cliente.edad ?? (cliente.fecha_nac ? differenceInYears(new Date(), toDateOrNull(cliente.fecha_nac) || new Date()) : null)),
        formatTextOrND(cliente.area),
        formatTextOrND(cliente.descripcion_zona),
        formatDateOrND(cliente.fecha_reclutamiento),
        '', // Total
        '', // Separador
        formatTextOrND(cliente.cod), // COD
        formatTextOrND(ficha?.cargo || cliente.area), // CARGO
        formatDateOrND(contrato?.fecha_termino_contrato), // FECHA DE TERMINO DE CONTRATO
        formatTextOrND(cliente.area), // PLANILLA
        formatTextOrND(cliente.sexo), // SEXO
      ];

      const dataRow = tmSheet.addRow(rowData);
      dataRow.height = 20;

      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        };

        // Centrar algunas columnas en primera tabla (DNI, COD, EDAD)
        if ([1, 2, 8].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
        
        // Centrar algunas columnas en segunda tabla (COD, SEXO)
        if ([14, 18].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    // Agregar autofiltros a ambas tablas
    tmSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: clientes.length + 1, column: 12 }
    };
    
    // Autofiltro para segunda tabla (columnas 14-18)
    // Nota: Excel solo permite un autofilter por hoja, así que comentamos este
    // Los usuarios pueden añadirlo manualmente si lo necesitan
    /*
    tmSheet.autoFilter = {
      from: { row: 1, column: 14 },
      to: { row: clientes.length + 1, column: 18 }
    };
    */

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${reportName}.xlsx`);
  };

  return {
    filterClientesByDate,
    generateExcelReport,
  };
}
