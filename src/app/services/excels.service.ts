import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as QRCode from 'qrcode';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExcelsService {

  apiUrl = 'https://control.als-inspection.cl/api_min/api/trazabilidad/';
  apiRecepcion = "https://control.als-inspection.cl/api_min/api/lote-recepcion/";
  apiDespacho = 'https://control.als-inspection.cl/api_min/api/lote-despacho/';
  
  

  constructor(private http: HttpClient) { }

  //GENERAR ETIQUETA CON GUARDADO EN LA API

  async generarExcelQRConDatos(datos: {
    nLote: string;
    nDUS: string;
    fLote: Date; // Fecha del lote
    motonave: string;
    observacion: string;
    estado: string;
    bodega: string;
    fechaLote: Date;
    cantidadSobres: number;
  }): Promise<void> {
    const {
      nLote,
      nDUS,
      fLote,
      estado,
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

    for (const grupo of grupos) {
      const hoja = workbook.addWorksheet(`Página ${hojaIndex++}`);

      hoja.columns = [
        { key: 'A', width: 25 },
        { key: 'B', width: 20 },
        { key: 'C', width: 20 },
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

        const qrTexto = `D${nLote}-${subLote}.`;
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
    estado: string;
    fLote: Date;
    cantidadSobres: number;
  }) {
    const {
      nLote,
      nDUS,
      motonave,
      observacion,
      estado,
      bodega,
      fLote,
      cantidadSobres,
    } = datos;

    const now = new Date();

    for (let i = 0; i < cantidadSobres; i++) {
      const nroSobre = i + 1;
      const nroFormateado = nroSobre.toString().padStart(2, '0');
      const totalFormateado = cantidadSobres.toString().padStart(2, '0');
      const textoNroSobre = `${nroFormateado}`;

      const datosEtiqueta = {
      nLote: nLote,
      estado: 'Iniciado',
      nDUS: nDUS,
      motonave: motonave,
      observacion: observacion,
      bodega: bodega,
      fechaControl: fLote,
      horaControl : now.toTimeString().split(' ')[0],
      fActual: now.toISOString().split('T')[0],
      nSobre: nroSobre, // ← Aquí guardas la cantidad total
      };

      try {
        await this.guardarEtiqueta(datosEtiqueta);
      } catch (error) {
        console.error(`Error al guardar el sobre ${textoNroSobre}:`, error);
      }
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
    cantidadSobres: number; // total sobres por lote
    nSobre: number; // número del sobre actual
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

    // Dividir lista en grupos de camionesPorHoja (3) para cada hoja
    for (let i = 0; i < lista.length; i += camionesPorHoja) {
      const grupo = lista.slice(i, i + camionesPorHoja);
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
        const qrTexto = `D${nLote}-${subLote}.`;
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

  async generarExceldeRegistros(servicio: any, solicitud: any, fechaInicial: any, fechaFinal: any) {
    try {
      // 1. Obtener datos de todas las APIs necesarias
      const [servicios, solicitudes, lotes, transportes, bodegas] = await Promise.all([
        this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/servicio/').toPromise(),
        this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/solicitud/').toPromise(),
        this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/lote-recepcion/').toPromise(),
        this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/recepcion-transporte/').toPromise(),
        this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/bodega/').toPromise()
      ]);

      // 2. Separar camiones y vagones
      let camiones = transportes!.filter((t: any) => t.tipoTransporte === 'Camion');
      let vagones = transportes!.filter((t: any) => t.tipoTransporte === 'Vagon');

      // 3. Filtrar por servicio y solicitud si existen
      let lotesFiltrados = lotes!;

      if (servicio && servicio !== 0) {
        lotesFiltrados = lotesFiltrados.filter((l: any) => l.servicio === servicio);
      }

      if (solicitud && solicitud !== 0) {
        lotesFiltrados = lotesFiltrados.filter((l: any) => l.solicitud === solicitud);
      }

      // 4. Obtener los nLotes de los lotes filtrados
      const nLotesFiltrados = lotesFiltrados.map((l: any) => l.nLote);

      // 5. Filtrar camiones y vagones por los lotes filtrados
      camiones = camiones.filter((c: any) => nLotesFiltrados.includes(c.nLote));
      vagones = vagones.filter((v: any) => nLotesFiltrados.includes(v.nLote));

      // 6. Filtrar por rango de fechas (solo fecha, sin hora)
      if (fechaInicial && fechaFinal) {
        const fechaIni = new Date(fechaInicial);
        fechaIni.setHours(0, 0, 0, 0);
        
        const fechaFin = new Date(fechaFinal);
        fechaFin.setHours(23, 59, 59, 999);

        camiones = camiones.filter((c: any) => {
          if (!c.fDestino) return false;
          
          const fechaCamion = new Date(c.fDestino);
          fechaCamion.setHours(0, 0, 0, 0);
          
          return fechaCamion >= fechaIni && fechaCamion <= fechaFin;
        });

        vagones = vagones.filter((v: any) => {
          if (!v.fDestino) return false;
          
          const fechaVagon = new Date(v.fDestino);
          fechaVagon.setHours(0, 0, 0, 0);
          
          return fechaVagon >= fechaIni && fechaVagon <= fechaFin;
        });
      }

      // 7. Enriquecer datos de camiones con información de servicio, solicitud y lote
      const datosCamionesEnriquecidos = camiones.map((camion: any) => {
        const lote = lotesFiltrados.find((l: any) => l.nLote === camion.nLote);
        const servicioData = servicios!.find((s: any) => s.id === lote?.servicio);
        const solicitudData = solicitudes!.find((s: any) => s.id === lote?.solicitud);
        const bodegaData = bodegas!.find((b: any) => b.idBodega == camion.bodega);

        return {
          nombreServicio: servicioData?.nServ || 'N/A',
          nombreSolicitud: solicitudData?.nSoli || 'N/A',
          referenciaLote: lote?.observacion || 'N/A',
          tipoTransporte: camion.tipoTransporte,
          fOrigen: camion.fOrigen,
          hOrigen: camion.hOrigen,
          guiaDespacho: camion.idTransporteOrigen,
          sellosOrigen: camion.sellosOrigen,
          sellosDestino: camion.sellosDestino,
          tpc: camion.sellosDestino,
          camion: camion.idTransporteDestino,
          batea: camion.idCarroDestino,
          brutoOrigen: Number(camion.brutoOrigen) || 0,
          taraOrigen: Number(camion.taraOrigen) || 0,
          netoHumedad: Number(camion.brutoOrigen - camion.taraOrigen) || 0,
          fDestino: camion.fDestino,
          hDestino: camion.hDestino,
          brutoDestino: Number(camion.brutoDestino) || 0,
          taraDestino: Number(camion.taraDestino) || 0,
          netoHumedoDestino: Number(camion.netoHumedoDestino) || 0,
          diferenciaHumeda: Number(camion.netoHumedoOrigen - camion.netoHumedoDestino) || 0,
          diferenciaSeca: Number(
            camion.netoHumedoOrigen -
            (camion.netoHumedoOrigen * (lote?.porcHumedad || 0)) / 100 -
            (camion.netoHumedoDestino - (camion.netoHumedoDestino * (lote?.porcHumedad || 0)) / 100)
          ) || 0,
          cuFino: camion.CuFino || 'N/A',
          estado: camion.estado,
          bodega: bodegaData?.nombreBodega || 'N/A',
          porcHumedad: Number(lote?.porcHumedad) || 0
        };
      });

      // 8. Enriquecer datos de vagones con información de servicio, solicitud y lote
      const datosVagonesEnriquecidos = vagones.map((vagon: any) => {
        const lote = lotesFiltrados.find((l: any) => l.nLote === vagon.nLote);
        const servicioData = servicios!.find((s: any) => s.id === lote?.servicio);
        const solicitudData = solicitudes!.find((s: any) => s.id === lote?.solicitud);
        const bodegaData = bodegas!.find((b: any) => b.idBodega == vagon.bodega);

        // Calcular peso neto destino (netoHumedoDestino)
        const pesoNetoDestino = Number(vagon.netoHumedoDestino) || 0;
        
        // Calcular peso neto seco (asegurando que sea positivo)
        const pesoNetoSeco = Math.abs(
          pesoNetoDestino - (pesoNetoDestino * (Number(lote?.porcHumedad) || 0)) / 100
        );
        
        // Calcular diferencia (Peso neto destino - Bruto origen)
        const diferencia = pesoNetoDestino - (Number(vagon.brutoOrigen) || 0);

        return {
          nombreServicio: servicioData?.nServ || 'N/A',
          nombreSolicitud: solicitudData?.nSoli || 'N/A',
          referenciaLote: lote?.observacion || 'N/A',
          tipoTransporte: vagon.tipoTransporte,
          fOrigen: vagon.fOrigen,
          hOrigen: vagon.hOrigen,
          guiaDespacho: vagon.idTransporteOrigen,
          idCarro: vagon.idCarro, // Para vagones usamos idCarro
          brutoOrigen: Number(vagon.brutoOrigen) || 0,
          fDestino: vagon.fDestino,
          integradoInicial: Number(vagon.brutoDestino) || 0,
          integradoFinal: Number(vagon.taraDestino) || 0,
          pesoNetoDestino: Number(pesoNetoDestino) || 0,
          pesoNetoSeco: Number(pesoNetoSeco) || 0,
          diferencia: Number(diferencia) || 0,
          cuFino: vagon.CuFino || 'N/A',
          estado: vagon.estado,
          bodega: bodegaData?.nombreBodega || 'N/A',
          porcHumedad: Number(lote?.porcHumedad) || 0
        };
      });

      // 9. Crear el Excel con ambas hojas
      await this.crearExcelInformeIngresos(datosCamionesEnriquecidos, datosVagonesEnriquecidos);

    } catch (error) {
      console.error('Error al generar el Excel de registros:', error);
    }
  }

  private async crearExcelInformeIngresos(datosCamiones: any[], datosVagones: any[]) {
    const workbook = new ExcelJS.Workbook();
    
    // ========== HOJA 1: INGRESO CAMIONES ==========
    const worksheetCamiones = workbook.addWorksheet('Ingreso Camiones');

    // Configurar zoom
    worksheetCamiones.views = [{ state: 'normal', zoomScale: 85 }];

    // Espacios iniciales
    for (let i = 0; i < 4; i++) {
      worksheetCamiones.addRow([]);
    }

    // Título en la fila 2
    worksheetCamiones.mergeCells('H2:L2');
    worksheetCamiones.getCell('H2').value = 'Ingreso Camiones';
    worksheetCamiones.getCell('H2').font = { name: 'Arial', size: 16, bold: true };
    worksheetCamiones.getCell('H2').alignment = { horizontal: 'center', vertical: 'middle' };

    // Encabezados
    const headers = [
      'Servicio',
      'Solicitud',
      'Referencia',
      'Tipo de Transporte',
      'Fecha de Origen',
      'Hora de Origen',
      'Guía de Despacho',
      'Sellos de Origen',
      'Ticket PVSA',
      'Camión',
      'Batea',
      'Bruto de Origen',
      'Tara de Origen',
      'Neto de Humedad',
      'Fecha de Destino',
      'Hora de Destino',
      'Bruto de Destino',
      'Tara de Destino',
      'Neto de Humedad Destino',
      'Diferencia de Humedad',
      'Diferencia Seca',
      'CuFino',
      'Estado',
      'Bodega'
    ];

    // Agregar encabezados
    const headerRowCamiones = worksheetCamiones.addRow(headers);
    headerRowCamiones.eachCell((cell) => {
      cell.font = {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFF' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '337dff' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Configurar anchos de columna
    worksheetCamiones.columns = [
      { width: 25 }, // Servicio
      { width: 25 }, // Solicitud
      { width: 20 }, // Referencia
      { width: 18 }, // Tipo de Transporte
      { width: 18 }, // Fecha de Origen
      { width: 15 }, // Hora de Origen
      { width: 18 }, // Guía de Despacho
      { width: 20 }, // Sellos de Origen
      { width: 15 }, // Ticket PVSA
      { width: 15 }, // Camión
      { width: 15 }, // Batea
      { width: 18 }, // Bruto de Origen
      { width: 18 }, // Tara de Origen
      { width: 18 }, // Neto de Humedad
      { width: 18 }, // Fecha de Destino
      { width: 15 }, // Hora de Destino
      { width: 18 }, // Bruto de Destino
      { width: 18 }, // Tara de Destino
      { width: 22 }, // Neto de Humedad Destino
      { width: 20 }, // Diferencia de Humedad
      { width: 18 }, // Diferencia Seca
      { width: 12 }, // CuFino
      { width: 15 }, // Estado
      { width: 20 }, // Bodega
    ];

    // Agregar datos de camiones
    datosCamiones.forEach((fila) => {
      const row = worksheetCamiones.addRow([
        fila.nombreServicio,
        fila.nombreSolicitud,
        fila.referenciaLote,
        fila.tipoTransporte,
        fila.fOrigen,
        fila.hOrigen,
        fila.guiaDespacho,
        fila.sellosOrigen,
        fila.sellosDestino,
        fila.camion,
        fila.batea,
        fila.brutoOrigen,
        fila.taraOrigen,
        fila.netoHumedad,
        fila.fDestino,
        fila.hDestino,
        fila.brutoDestino,
        fila.taraDestino,
        fila.netoHumedoDestino,
        fila.diferenciaHumeda,
        fila.diferenciaSeca,
        fila.cuFino,
        fila.estado,
        fila.bodega
      ]);

      // Aplicar formato numérico español (punto miles, coma decimales)
      row.getCell(12).numFmt = '#,##0.000'; // Bruto de Origen
      row.getCell(13).numFmt = '#,##0.000'; // Tara de Origen
      row.getCell(14).numFmt = '#,##0.000'; // Neto de Humedad
      row.getCell(17).numFmt = '#,##0.000'; // Bruto de Destino
      row.getCell(18).numFmt = '#,##0.000'; // Tara de Destino
      row.getCell(19).numFmt = '#,##0.000'; // Neto de Humedad Destino
      row.getCell(20).numFmt = '#,##0.000'; // Diferencia de Humedad
      row.getCell(21).numFmt = '#,##0.000'; // Diferencia Seca

      // Centrar todas las celdas
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // ========== HOJA 2: INGRESO VAGONES ==========
    if (datosVagones.length > 0) {
      const worksheetVagones = workbook.addWorksheet('Ingreso Vagones');
      
      // Configurar zoom
      worksheetVagones.views = [{ state: 'normal', zoomScale: 85 }];

      // Espacios iniciales
      for (let i = 0; i < 4; i++) {
        worksheetVagones.addRow([]);
      }

      // Título en la fila 2
      worksheetVagones.mergeCells('H2:L2');
      worksheetVagones.getCell('H2').value = 'Ingreso Vagones';
      worksheetVagones.getCell('H2').font = { name: 'Arial', size: 16, bold: true };
      worksheetVagones.getCell('H2').alignment = { horizontal: 'center', vertical: 'middle' };

      // Encabezados para vagones (ajustados con ID Carro)
      const headersVagones = [
        'Servicio',
        'Solicitud',
        'Referencia',
        'Tipo de Transporte',
        'Fecha de Origen',
        'Hora de Origen',
        'Guía de Despacho',
        'Cantidad de Vagones',
        'Bruto de Origen',
        'Fecha de Destino',
        'Integrado Inicial',
        'Integrado Final',
        'Peso Neto Destino',
        'Peso Neto Seco',
        'Diferencia',
        'CuFino',
        'Estado',
        'Bodega'
      ];

      // Agregar encabezados
      const headerRowVagones = worksheetVagones.addRow(headersVagones);
      headerRowVagones.eachCell((cell) => {
        cell.font = {
          name: 'Calibri',
          size: 11,
          bold: true,
          color: { argb: 'FFFFFF' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '337dff' },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Configurar anchos de columna para vagones
      worksheetVagones.columns = [
        { width: 25 }, // Servicio
        { width: 25 }, // Solicitud
        { width: 20 }, // Referencia
        { width: 18 }, // Tipo de Transporte
        { width: 18 }, // Fecha de Origen
        { width: 15 }, // Hora de Origen
        { width: 18 }, // Guía de Despacho
        { width: 20 }, // Cantidad de Vagones
        { width: 18 }, // Bruto de Origen
        { width: 18 }, // Fecha de Destino
        { width: 18 }, // Integrado Inicial
        { width: 18 }, // Integrado Final
        { width: 20 }, // Peso Neto Destino
        { width: 18 }, // Peso Neto Seco
        { width: 18 }, // Diferencia
        { width: 12 }, // CuFino
        { width: 15 }, // Estado
        { width: 20 }, // Bodega
      ];

      // Agregar datos de vagones
      datosVagones.forEach((fila) => {
        const row = worksheetVagones.addRow([
          fila.nombreServicio,
          fila.nombreSolicitud,
          fila.referenciaLote,
          fila.tipoTransporte,
          fila.fOrigen,
          fila.hOrigen,
          fila.guiaDespacho,
          fila.idCarro,
          fila.brutoOrigen,
          fila.fDestino,
          fila.integradoInicial,
          fila.integradoFinal,
          fila.pesoNetoDestino,
          fila.pesoNetoSeco,
          fila.diferencia,
          fila.cuFino,
          fila.estado,
          fila.bodega
        ]);

        // Aplicar formato numérico español (punto miles, coma decimales)
        row.getCell(9).numFmt = '#,##0.000';  // Bruto de Origen
        row.getCell(11).numFmt = '#,##0.000'; // Integrado Inicial
        row.getCell(12).numFmt = '#,##0.000'; // Integrado Final
        row.getCell(13).numFmt = '#,##0.000'; // Peso Neto Destino
        row.getCell(14).numFmt = '#,##0.000'; // Peso Neto Seco
        row.getCell(15).numFmt = '#,##0.000'; // Diferencia

        // Centrar todas las celdas
        row.eachCell((cell) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });
    }

    // ========== AGREGAR LOGO Y DESCARGAR ==========
    try {
      const logoBlob = await fetch('assets/images/logos/als_logo_1.png').then(res => res.blob());
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];
        const binary = atob(base64);
        const len = binary.length;
        const imageBuffer = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          imageBuffer[i] = binary.charCodeAt(i);
        }

        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: 'png',
        });

        // Agregar logo a la hoja de camiones
        worksheetCamiones.addImage(imageId, {
          tl: { col: 1, row: 1 },
          ext: { width: 65, height: 65 },
        });

        // Agregar logo a la hoja de vagones si existe
        if (datosVagones.length > 0) {
          const worksheetVagones = workbook.getWorksheet('Ingreso Vagones');
          if (worksheetVagones) {
            worksheetVagones.addImage(imageId, {
              tl: { col: 1, row: 1 },
              ext: { width: 65, height: 65 },
            });
          }
        }

        // Guardar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Informe_Ingresos.xlsx';
        a.click();

        URL.revokeObjectURL(url);
      };

      reader.readAsDataURL(logoBlob);
    } catch (error) {
      console.error('Error al cargar el logo:', error);
      
      // Si falla el logo, descargar sin él
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'Informe_Ingresos.xlsx';
      a.click();

      URL.revokeObjectURL(url);
    }
  }

}
