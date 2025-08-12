import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as QRCode from 'qrcode';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExcelsService {

  apiUrl = 'http://127.0.0.1:8000/api/trazabilidad/'

  constructor(private http: HttpClient) { }

  //GENERAR ETIQUETA CON GUARDADO EN LA API

  async generarExcelQRConDatos(datos: {
    nLote: string;
    nDUS: string;
    motonave: string;
    observacion: string;
    bodega: string;
    fechaLote: Date;
    cantidadSobres: number;
  }): Promise<void> {
    const {
      nLote,
      nDUS,
      motonave,
      observacion,
      bodega,
      fechaLote,
      cantidadSobres,
    } = datos;

    const workbook = new ExcelJS.Workbook();
    const camionesPorHoja = 3;
    const grupos = [];

    for (let i = 0; i < cantidadSobres; i += camionesPorHoja) {
      grupos.push(
        Array.from(
          { length: Math.min(camionesPorHoja, cantidadSobres - i) },
          (_, j) => i + j
        )
      );
    }

    const imagePath = '/assets/images/logos/als_logo_1.png';
    const response = await fetch(imagePath);
    const imageBuffer = await response.arrayBuffer();
    const logoId = workbook.addImage({
      buffer: imageBuffer,
      extension: 'png',
    });

    const formatDate = (date: Date) =>
      date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    let hojaIndex = 1;

    // copiar todo el for de abajo y modificar esta variable const camionesPorHoja = 3; tiene que quedar en 3


    for (const grupo of grupos) {
      const hoja = workbook.addWorksheet(`Página ${hojaIndex++}`);

      hoja.columns = [
        { key: 'A', width: 10 },
        { key: 'B', width: 10 },
        { key: 'C', width: 25 },
        { key: 'D', width: 20 },
        { key: 'E', width: 20 },
      ];

    

      for (let i = 0; i < grupo.length; i++) {
        const nroSobre = grupo[i] + 1;
        const nroFormateado = nroSobre.toString().padStart(2, '0');
        const totalFormateado = cantidadSobres.toString().padStart(2, '0');
        const textoNroSobre = `${nroFormateado}/${totalFormateado}`;
        const subLote = `${nroFormateado}`;

        const rowOffset = i * 14;

        for (let row = 1 + rowOffset; row <= 15 + rowOffset; row++) {
          for (let col = 1; col <= 5; col++) {
            hoja.getCell(row, col).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' },
            };
          }
        }

        const qrTexto = `D${nLote}.`;
        const qrDataUrl = await QRCode.toDataURL(qrTexto);

        const base64 = qrDataUrl.split(',')[1];
        const binary = atob(base64);
        const bufferQR = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) {
          bufferQR[j] = binary.charCodeAt(j);
        }

        const qrId = workbook.addImage({
          buffer: bufferQR,
          extension: 'png',
        });

        const now = new Date();

        hoja.getCell(`C${2 + rowOffset}`).value = `N° DUS: ${nDUS}`;
        hoja.getCell(`C${3 + rowOffset}`).value = `Fecha Actual: ${formatDate(now)}`;
        hoja.getCell(`C${4 + rowOffset}`).value = `Motonave: ${motonave}`;
        hoja.getCell(`C${5 + rowOffset}`).value = `Observación: ${observacion}`;
        hoja.getCell(`C${6 + rowOffset}`).value = `Bodega: ${bodega}`;
        hoja.getCell(`C${7 + rowOffset}`).value = `Fecha Lote: ${formatDate(fechaLote)}`;
        hoja.getCell(`D${7 + rowOffset}`).value = `N° Sobre: ${textoNroSobre}`;

        hoja.addImage(logoId, {
          tl: { col: 4, row: 1 + rowOffset },
          ext: { width: 100, height: 100 },
        });

        hoja.addImage(qrId, {
          tl: { col: 3, row: 1 + rowOffset },
          ext: { width: 100, height: 100 },
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `etiquetas_QR_${nLote}.xlsx`;
    link.click();

    // 👉 Guardar los datos en el backend
    await this.guardarTrazabilidadDespacho(datos);
  }

  async guardarTrazabilidadDespacho(datos: {
    nLote: string;
    nDUS: string;
    motonave: string;
    observacion: string;
    bodega: string;
    fechaLote: Date;
    cantidadSobres: number;
  }) {
    const {
      nLote,
      nDUS,
      motonave,
      observacion,
      bodega,
      fechaLote,
      cantidadSobres,
    } = datos;

    const now = new Date();

    const datosEtiqueta = {
      nLote: nLote,
      nDUS: nDUS,
      motonave: motonave,
      observacion: observacion,
      bodega: bodega,
      fLote: fechaLote.toISOString().split('T')[0],
      fActual: now.toISOString().split('T')[0],
      nSobre: cantidadSobres.toString(), // ← Aquí guardas la cantidad total
    };

    try {
      await this.guardarEtiqueta(datosEtiqueta);
    } catch (error) {
      console.error('Error al guardar trazabilidad:', error);
    }
  }

  guardarEtiqueta(datosEtiqueta: any) {
    return this.http.post(this.apiUrl, datosEtiqueta).toPromise();
  }

  // GENERAR ETIQUETAS SIN GUARDAR

  async generarExcelQR(lista: {
    nLote: string;
    nDUS: string;
    motonave: string;
    observacion: string;
    bodega: string;
    fLote: Date | string;
    nSobre: number | string; // se usa como cantidad total de sobres
  }[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const camionesPorHoja = 3;
    const imagePath = '/assets/images/logos/als_logo_1.png';
    const response = await fetch(imagePath);
    const imageBuffer = await response.arrayBuffer();
    const logoId = workbook.addImage({
      buffer: imageBuffer,
      extension: 'png',
    });

    const formatDate = (date: Date | string) =>
      new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    let hojaIndex = 1;
    let sobresGenerados: any[] = [];

    // Generar los sobres por cada lote: desde 1 hasta nSobre
    lista.forEach((item) => {
      const totalSobres = parseInt(item.nSobre as string, 10) || 1; // por si viene como string
      for (let i = 1; i <= totalSobres; i++) {
        sobresGenerados.push({
          ...item,
          nSobre: i,
          cantidadSobres: totalSobres,
        });
      }
    });

    // copiar todo el for de abajo y  const camionesPorHoja = 3;

    // Agrupar de a 3 sobres por hoja
    for (let i = 0; i < sobresGenerados.length; i += camionesPorHoja) {
      const grupo = sobresGenerados.slice(i, i + camionesPorHoja);
      const hoja = workbook.addWorksheet(`Página ${hojaIndex++}`);

      hoja.columns = [
        { key: 'A', width: 10 },
        { key: 'B', width: 10 },
        { key: 'C', width: 25 },
        { key: 'D', width: 20 },
        { key: 'E', width: 20 },
      ];

      for (let j = 0; j < grupo.length; j++) {
        const item = grupo[j];
        const {
          nLote,
          nDUS,
          motonave,
          observacion,
          bodega,
          fLote,
          cantidadSobres,
          nSobre,
        } = item;

        const nroFormateado = nSobre.toString().padStart(2, '0');
        const totalFormateado = cantidadSobres.toString().padStart(2, '0');
        const textoNroSobre = `${nroFormateado}/${totalFormateado}`;
        const subLote = nroFormateado;
        const rowOffset = j * 14;

        // Pintar fondo blanco
        for (let row = 1 + rowOffset; row <= 15 + rowOffset; row++) {
          for (let col = 1; col <= 5; col++) {
            hoja.getCell(row, col).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' },
            };
          }
        }

        // QR
        const qrTexto = `D${nLote}.`;
        const qrDataUrl = await QRCode.toDataURL(qrTexto);
        const base64 = qrDataUrl.split(',')[1];
        const binary = atob(base64);
        const bufferQR = new Uint8Array(binary.length);
        for (let k = 0; k < binary.length; k++) {
          bufferQR[k] = binary.charCodeAt(k);
        }

        const qrId = workbook.addImage({
          buffer: bufferQR,
          extension: 'png',
        });

        const now = new Date();

        hoja.getCell(`C${2 + rowOffset}`).value = `N° DUS: ${nDUS}`;
        hoja.getCell(`C${3 + rowOffset}`).value = `Fecha Actual: ${formatDate(now)}`;
        hoja.getCell(`C${4 + rowOffset}`).value = `Motonave: ${motonave}`;
        hoja.getCell(`C${5 + rowOffset}`).value = `Observación: ${observacion}`;
        hoja.getCell(`C${6 + rowOffset}`).value = `Bodega: ${bodega}`;
        hoja.getCell(`C${7 + rowOffset}`).value = `Fecha Lote: ${formatDate(fLote)}`;
        hoja.getCell(`E${7 + rowOffset}`).value = `N° Sobre: ${textoNroSobre}`;

        hoja.addImage(logoId, {
          tl: { col: 4, row: 1 + rowOffset },
          ext: { width: 100, height: 100 },
        });

        hoja.addImage(qrId, {
          tl: { col: 3, row: 1 + rowOffset },
          ext: { width: 100, height: 100 },
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `etiquetas_QR_lotes.xlsx`;
    link.click();
  }
}
