import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';

@Injectable({
  providedIn: 'root'
})
export class ExcelKPIService {

  constructor() { }

  async descargarExcelResumenLote(lotes: any[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen Lote');

    // Fondo blanco
    for (let i = 1; i <= 200; i++) {
      const row = worksheet.getRow(i);
      for (let j = 1; j <= 50; j++) {
        row.getCell(j).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' },
        };
      }
    }

    worksheet.views = [{ zoomScale: 70 }];

    const headers = [
      'Nro', 'Fecha Inicio Embarque', 'Fecha Término Embarque', 'Fecha DUS', 'DUS',
      'Lista de Verificación (Ventanas)', 'Referencia Focus', 'Motonave', 'Calidad', 'Buyer',
      'Contrato Cochilco y Cuota', 'DV', 'Contrato Anglo American', 'Tonelaje Húmedo (KG)', '% Humedad',
      'Tonelaje Seco (KG)', 'Número de Lotes', 'Bodegas Cargadas', 'Fecha Envío Reporte', 'Día',
      'Fecha Entrega Lab Ensayo', 'Avances Composito', 'Finales (DUS)', 'Finales (LAL)',
      'Composito Avance TAT Lab / Desde Termino Emb', 'Entrega Certificado Avance Composito',
      'Días Entrega AU Post Avance', 'TAT Reportabilidad Lote a Lote',
      'Entrega Certificado TAT Reportabilidad Lote a Lote', 'Envío Reporte Peso',
      'Entrega Reporte ALS Puerto Cumplimiento', 'Tiempo Entrega Muestra al Lab Desde Termino Emb',
      'Entrega en Lab Cumplimiento ALS Puerto', 'Días Entrega Testigo Aduana',
      'Entrega en Aduana Cumplimiento ALS Puerto', 'Fecha Entrega Lab Aduana Valpo',
      'Lugar de Descarga', 'País de Descarga', 'Resguardo Testigo Aduana',
    ];

    const totalColumnas = headers.length;

    // Subtítulos
    const groupTitleRow = worksheet.getRow(11);
    groupTitleRow.height = 20;
    for (let i = 1; i <= totalColumnas; i++) groupTitleRow.getCell(i).value = '';

    worksheet.mergeCells('V11:W11');
    worksheet.getCell('V11').value = 'DUS';
    worksheet.mergeCells('X11:X11');
    worksheet.getCell('X11').value = 'Lote a Lote';
    worksheet.mergeCells('Y11:AI11');
    worksheet.getCell('Y11').value = 'Cumplimiento KPI';

    ['V11', 'X11', 'Y11'].forEach((ref) => {
      const cell = worksheet.getCell(ref);
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F4A261' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    const headerRow = worksheet.getRow(12);
    headerRow.values = headers;
    headerRow.height = 30;

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E88E5' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    worksheet.columns.forEach((col) => {
      col.width = 30;
    });

    let currentRow = 13;
    let contador = 1;

    const f1 = (fecha: string) => new Date(fecha);
    const safeDiff = (a: string, b: string) => {
      try {
        return Math.floor((f1(b).getTime() - f1(a).getTime()) / (1000 * 60 * 60 * 24));
      } catch {
        return null;
      }
    };
    const cumplimientoBinario = (valor: number, max: number) =>
      typeof valor === 'number' ? (valor > max ? 'No cumple' : 'Cumple') : 'Sin completar';

    lotes.forEach((lote: any) => {
      const row = worksheet.getRow(currentRow++);
      row.height = 20;

      const diasDiferencia = lote.fechaTermino && lote.DUSAvanceComposito
        ? safeDiff(lote.fechaTermino, lote.DUSAvanceComposito)
        : null;
      const cumplimiento = cumplimientoBinario(diasDiferencia as number, 2);

      const diasEntregaAU = lote.DUSAvanceComposito && lote.DUSFinales
        ? safeDiff(lote.DUSAvanceComposito, lote.DUSFinales)
        : null;

      const tatLoteALote = lote.fechaEntregaLab && lote.LALFinales
        ? safeDiff(lote.fechaEntregaLab, lote.LALFinales)
        : null;
      const cumpleTatLote = cumplimientoBinario(tatLoteALote as number, 15);

      const diasEnvioReportePeso = lote.fechaTermino && lote.fechaEnvioReporte
        ? safeDiff(lote.fechaTermino, lote.fechaEnvioReporte)
        : null;
      const cumpleReporteALS = cumplimientoBinario(diasEnvioReportePeso as number, 2);

      const diasEntregaMuestraLab = lote.fechaTermino && lote.fechaEntregaLab
        ? safeDiff(lote.fechaTermino, lote.fechaEntregaLab)
        : null;
      const cumpleEntregaLab = cumplimientoBinario(diasEntregaMuestraLab as number, 2);

      const diasEntregaTestigoAduana = lote.fechaTermino && lote.fechaEntregaLabAduana
        ? safeDiff(lote.fechaTermino, lote.fechaEntregaLabAduana)
        : null;
      const cumpleEntregaAduana = cumplimientoBinario(diasEntregaTestigoAduana as number, 20);

      // -----> Aquí aplicamos el "modelo 2": escribir celda por celda con formato
      const valores = [
        contador++,
        lote.fLote || 'No aplica',
        lote.fechaTermino || 'No aplica',
        lote.fechaDUS || 'No aplica',
        lote.DUS || '',
        lote.listaVerificacion || '',
        lote.refFocus || '',
        lote.nombreNave || '',
        lote.calidad || '',
        lote.cliente || '',
        lote.contratoCochilco || '',
        lote.DV || '',
        lote.contratoAnglo || '',
        Number(lote.pesoNetoHumedo || 0) * 1000,
        lote.porcHumedad ? Number(lote.porcHumedad) / 100 : null, // porcentaje
        Number(lote.pesoNetoSeco || 0) * 1000,
        null,
        lote.bodegaNave || '',
        lote.fechaEnvioReporte || '',
        null,
        lote.fechaEntregaLab || '',
        lote.DUSAvanceComposito || '',
        lote.DUSFinales || '',
        lote.LALFinales || '',
        diasDiferencia,
        cumplimiento,
        diasEntregaAU,
        tatLoteALote,
        cumpleTatLote,
        diasEnvioReportePeso,
        cumpleReporteALS,
        diasEntregaMuestraLab,
        cumpleEntregaLab,
        diasEntregaTestigoAduana,
        cumpleEntregaAduana,
        lote.fechaEntregaLabAduana || '',
        lote.lugarDescarga || '',
        lote.paisDescarga || '',
        lote.resguardoTestigoAduana || '',
      ];

      valores.forEach((val, i) => {
        const cell = row.getCell(i + 1);
        cell.value = val;

        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' },
        };

        if (typeof val === 'number') {
          if (i === 13 || i === 15) cell.numFmt = '#,##0'; // Tonelajes (enteros con miles)
          else if (i === 14) cell.numFmt = '0.00%';        // Porcentaje humedad
          else if ([24, 26, 27, 29, 31, 33].includes(i)) cell.numFmt = '0'; // Días (enteros)
        }
      });
    });

    // --- criterios extra
    const criterios = [
      ['Criterio Cumplimiento Puerto', 2],
      ['Criterio Entrega a Aduana', 20],
      ['Criterio Reportabilidad Lote a Lote', 15],
      ['Criterio Envío Avance Composito', 2],
      ['Envío Reporte de Peso', 2],
    ];
    const startCol = 42;
    const startRow = 12;

    criterios.forEach(([titulo], index) => {
      const cell = worksheet.getRow(startRow).getCell(startCol + index);
      cell.value = titulo;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E88E5' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    criterios.forEach(([, valor], index) => {
      const cell = worksheet.getRow(startRow + 1).getCell(startCol + index);
      cell.value = valor;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Informe_KPI.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

}
