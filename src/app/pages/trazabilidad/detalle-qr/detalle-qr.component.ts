import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import {
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
  MatDateRangeSelectionStrategy,
} from '@angular/material/datepicker';
import { MaterialModule } from 'src/app/material.module';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';
import Notiflix from 'notiflix';
import ExcelJS from 'exceljs';

@Injectable()
export class FiveDayRangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D>
{
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this._createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createFiveDayRange(activeDate);
  }

  private _createFiveDayRange(date: D | null): DateRange<D> {
    if (date) {
      const start = this._dateAdapter.addCalendarDays(date, -2);
      const end = this._dateAdapter.addCalendarDays(date, 2);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-detalle-qr',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './detalle-qr.component.html',
  styleUrl: './detalle-qr.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class DetalleQrComponent {
  servicios: any[] = [];
  idServicio: any;
  solicitudes: any[] = [];
  idSolicitud: any;
  lote: any;
  observacion: any;
  solicitudesFiltradas: any[];
  lotesFiltrados: any[];
  lotes: any;
  camion: any;
  patente: any;
  camiones: any[] = [];
  camionesFiltrados: any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.obtenerServicios(); // Llama a la función para obtener los servicios al iniciar el componente
    this.obtenerSolicitudes(); // Llama a la función para obtener las solicitudes al iniciar el componente
    this.obtenerLotes(); // Llama a la función para obtener los lotes al iniciar el componente
    this.obtenerCamiones(); // Llama a la función para obtener los camiones al iniciar el componente
  }

  obtenerServicios() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/servicio/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.servicios = data; // Asigna los servicios obtenidos a la variable
      },
      (error) => {
        console.error('Error al obtener servicios', error);
      }
    );
  }

  obtenerSolicitudes() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/solicitud/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.solicitudes = data; // Asigna las solicitudes obtenidos a la variable
      },
      (error) => {
        console.error('Error al obtener servicios', error);
      }
    );
  }

  obtenerLotes() {
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
    console.log('consultando ' + apiUrl);
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.lotes = data; // Asigna los lotes obtenidos a la variable
      },
      (error) => {
        console.error('Error al obtener lotes', error);
      }
    );
  }

  obtenerCamiones() {
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/recepcion-transporte/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.camiones = data; // Asigna los camiones obtenidos a la variable
      },
      (error) => {
        console.error('Error al obtener camiones', error);
      }
    );
  }

  filtrarSolicitudes(servicioId: any) {
    this.solicitudesFiltradas = this.solicitudes.filter(
      (solicitud) => solicitud.nServ === servicioId
    );
  }

  filtrarLotes(solicitudId: any) {
    this.lotesFiltrados = this.lotes.filter(
      (lote: any) =>
        lote.servicio === this.idServicio && lote.solicitud === solicitudId
    );
  }

  filtrarCamiones(lote: any) {
    this.camionesFiltrados = this.camiones.filter(
      (camion: any) => camion.nLote === lote.nLote
      //&& camion.idTransporteOrigen === idTransporteOrigen
    );
  }

  enviarServicio() {}

  crearQR() {
    //Buscar y guardar el camion con id camion
    // const camion = this.camiones.find((camion) => camion.id === this.camion);
    // if (!camion) {
    //   Notiflix.Notify.failure('Camión no encontrado');
    //   return;
    // }
    //Verificar si escogio un lote, un servicio y una solicitud
    if (!this.lote.nLote || !this.idServicio || !this.idSolicitud) {
      Notiflix.Notify.failure('Faltan datos para generar el QR');
      return;
    }

    //Verificar si existe el ingreso de Trazabilidad. Si existe, solo genera QR. Si no existe, la agrega a la api https://control.als-inspection.cl/api_min/api/trazabilidad/
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/trazabilidad/';
    const datos: any = {
      nLote: this.lote.nLote,
      cliente: 'Anglo American',
      idTransporte: null,
      horaControl: this.getHoraActual(),
      fechaControl: this.formatDate(new Date()),
      horaLab: null,
      fechaLab: null,
      horaIngresoHorno: null,
      fechaIngresoHorno: null,
      horaSalidaHorno: null,
      fechaSalidaHorno: null,
      horaTestigoteca: null,
      fechaTestigoteca: null,
      estado: 'Iniciado',
    };

    //actualizar los valores de data con los valores del camion
    datos.nLote = this.lote.nLote;
    // datos.idTransporte = camion.id;
    // datos.horaControl = camion.hDestino;
    // datos.fechaControl = camion.fDestino;
    (datos.horaControl = this.getHoraActual()),
      (datos.fechaControl = this.formatDate(new Date()));
    datos.observacion = this.lote.observacion;
    datos.cantidadTransporte =
      this.lotes.find((lote: any) => lote.nLote === this.lote.nLote)
        ?.cantCamiones || 0;

    console.log('consultando ' + apiUrl);

    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        const existe = data.find((item: any) => item.nLote === this.lote.nLote);
        if (!existe) {
          console.log(datos);
          // Si no existe, almacena la trazabilidad
          this.almacenarTrazabilidad(datos);
        } else {
          Notiflix.Notify.info('La trazabilidad de este Lote ya existe');
          this.crearQRConExcel();
        }
      },
      (error) => {
        console.error('Error al obtener trazabilidad', error);
      }
    );
  }

  almacenarTrazabilidad(datos: any) {
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/trazabilidad/';
    this.http.post(apiUrl, datos).subscribe(
      (response) => {
        Notiflix.Notify.success('Trazabilidad almacenada correctamente');
        this.crearQRConExcel();
      },
      (error) => {
        console.error('Error al almacenar trazabilidad', error);
        Notiflix.Notify.failure('Error al almacenar trazabilidad');
      }
    );
  }

  borrarTodasTrazabilidades() {
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/trazabilidad/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        data.forEach((trazabilidad) => {
          this.http.delete(apiUrl + trazabilidad.id).subscribe(
            (response) => {
              console.log('Trazabilidad eliminada correctamente');
            },
            (error) => {
              console.error('Error al eliminar trazabilidad', error);
            }
          );
        });
      },
      (error) => {
        console.error('Error al obtener trazabilidades', error);
      }
    );
  }

  async crearQRConExcel() {
    const apiUrl =
      'https://control.als-inspection.cl/api_op/oceanapi/trazabilidad/';

    if (!this.lote.nLote || !this.idServicio || !this.idSolicitud) {
      Notiflix.Notify.failure('Faltan datos para generar el QR');
      return;
    }

    this.http.get<any[]>(apiUrl).subscribe(
      async (trazabilidades) => {
        const workbook = new ExcelJS.Workbook();
        const hoja = workbook.addWorksheet('Página 1');
        hoja.properties.defaultRowHeight = 20;

        // Fondo blanco global
        for (let row = 1; row <= 40; row++) {
          for (let col = 1; col <= 8; col++) {
            hoja.getCell(row, col).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' },
            };
          }
        }

        // Cargar la imagen del logo
        const imagePath = '/assets/images/logos/als_logo_1.png';
        const response = await fetch(imagePath);
        const imageBuffer = await response.arrayBuffer();
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: 'png',
        });
        const imageId2 = workbook.addImage({
          buffer: imageBuffer,
          extension: 'png',
        });

        const nLoteCamion = this.lote.nLote.toString().trim();

        const existe = trazabilidades.find((item: any) => {
          const loteItem = item.nLote?.toString().trim();
          return loteItem === nLoteCamion;
        });

        if (!existe) {
          const datos: any = {
            nLote: this.lote.nLote,
            cliente: 'Anglo American',
            horaControl: this.getHoraActual(),
            fechaControl: this.formatDate(new Date()),
            horaLab: null,
            fechaLab: null,
            horaIngresoHorno: null,
            fechaIngresoHorno: null,
            horaSalidaHorno: null,
            fechaSalidaHorno: null,
            horaTestigoteca: null,
            fechaTestigoteca: null,
            estado: 'Iniciado',
          };

          // this.almacenarTrazabilidad(datos);
        }

        const qrData = 'G' + this.lote.nLote.toString() + '.';
        const qrData2 = 'M' + this.lote.nLote.toString() + '.';

        const qrDataUrl: string = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });

        const qrDataUrl2: string = await QRCode.toDataURL(qrData2, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });

        // Buscar nombre de servicio y solicitud
        const servicio = this.servicios.find(
          (servicio) => servicio.id === this.idServicio
        );
        const solicitud = this.solicitudes.find(
          (solicitud) => solicitud.id === this.idSolicitud
        );

        hoja.getCell(`C2`).value = `Lote: ${this.lote.observacion}`;
        hoja.getCell(`C3`).value = `Cliente: Anglo American`;
        hoja.getCell(`C4`).value = `Servicio: ${servicio?.nServ}`;
        hoja.getCell(`C5`).value = `Solicitud: ${solicitud?.nSoli}`;
        hoja.getCell(`C6`).value = `Etiqueta: General`;

        hoja.getCell(`C16`).value = `Lote: ${this.lote.observacion}`;
        hoja.getCell(`C17`).value = `Cliente: Anglo American`;
        hoja.getCell(`C18`).value = `Servicio: ${servicio?.nServ}`;
        hoja.getCell(`C19`).value = `Solicitud: ${solicitud?.nSoli}`;
        hoja.getCell(`C20`).value = `Etiqueta: Muestra Natural`;

        const base64Image = qrDataUrl.split(',')[1];
        const binaryString = atob(base64Image);
        const imageBufferQR = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          imageBufferQR[j] = binaryString.charCodeAt(j);
        }

        const imageIdQR = workbook.addImage({
          buffer: imageBufferQR,
          extension: 'png',
        });

        const base64Image2 = qrDataUrl2.split(',')[1];
        const binaryString2 = atob(base64Image2);
        const imageBufferQR2 = new Uint8Array(binaryString2.length);
        for (let j = 0; j < binaryString2.length; j++) {
          imageBufferQR2[j] = binaryString2.charCodeAt(j);
        }

        const imageIdQR2 = workbook.addImage({
          buffer: imageBufferQR2,
          extension: 'png',
        });

        hoja.addImage(imageIdQR, {
          tl: { col: 6, row: 1 },
          ext: { width: 100, height: 100 },
        });

        hoja.addImage(imageIdQR2, {
          tl: { col: 6, row: 15 },
          ext: { width: 100, height: 100 },
        });

        hoja.addImage(imageId, {
          tl: { col: 0, row: 1 },
          ext: { width: 100, height: 100 },
        });
        hoja.addImage(imageId2, {
          tl: { col: 0, row: 15 },
          ext: { width: 100, height: 100 },
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'trazabilidad_lote_qr.xlsx';
        link.click();
      },
      (error) => {
        console.error('Error al obtener trazabilidad', error);
      }
    );
  }

  private getHoraActual(): string {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
