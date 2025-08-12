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
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
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
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
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
        return 'Sin completar';
      }
    };
    const cumplimientoBinario = (valor: number, max: number) =>
      typeof valor === 'number' ? (valor > max ? 'No cumple' : 'Cumple') : 'Sin completar';

    lotes.forEach((lote: any) => {
      const row = worksheet.getRow(currentRow++);
      row.height = 20;

      const diasDiferencia = lote.fechaTermino && lote.DUSAvanceComposito
        ? safeDiff(lote.fechaTermino, lote.DUSAvanceComposito)
        : 'Sin completar';

      const cumplimiento = cumplimientoBinario(Number(diasDiferencia), 2);

      const diasEntregaAU = lote.DUSAvanceComposito && lote.DUSFinales
        ? safeDiff(lote.DUSAvanceComposito, lote.DUSFinales)
        : 'Sin completar';

      const tatLoteALote = lote.fechaEntregaLab && lote.LALFinales
        ? safeDiff(lote.fechaEntregaLab, lote.LALFinales)
        : 'Sin completar';

      const cumpleTatLote = cumplimientoBinario(Number(tatLoteALote), 15);

      const diasEnvioReportePeso = lote.fechaTermino && lote.fechaEnvioReporte
        ? safeDiff(lote.fechaTermino, lote.fechaEnvioReporte)
        : 'Sin completar';

      const cumpleReporteALS = cumplimientoBinario(Number(diasEnvioReportePeso), 2);

      const diasEntregaMuestraLab = lote.fechaTermino && lote.fechaEntregaLab
        ? safeDiff(lote.fechaTermino, lote.fechaEntregaLab)
        : 'Sin completar';

      const cumpleEntregaLab = cumplimientoBinario(Number(diasEntregaMuestraLab), 2);

      const diasEntregaTestigoAduana = lote.fechaTermino && lote.fechaEntregaLabAduana
        ? safeDiff(lote.fechaTermino, lote.fechaEntregaLabAduana)
        : 'Sin completar';

      const cumpleEntregaAduana = cumplimientoBinario(Number(diasEntregaTestigoAduana), 20);

      row.values = [
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
        (Number(lote.pesoNetoHumedo || 0) * 1000).toLocaleString('es-CL'),
        lote.porcHumedad ?? 'No aplica',
        (Number(lote.pesoNetoSeco || 0) * 1000).toLocaleString('es-CL'),
        '',
        lote.bodegaNave || '',
        lote.fechaEnvioReporte || '',
        '',
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

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true, horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      });
    });

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
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
    });

    criterios.forEach(([, valor], index) => {
      const cell = worksheet.getRow(startRow + 1).getCell(startCol + index);
      cell.value = valor;
      cell.font = { name: 'Calibri', size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
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
