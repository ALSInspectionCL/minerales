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
  camion : any;
  patente : any;
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
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/recepcion-transporte/';
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
      (lote: any) => lote.servicio === this.idServicio && lote.solicitud === solicitudId
    );
  }

  filtrarCamiones(lote: any) {
    this.camionesFiltrados = this.camiones.filter(
      (camion: any) => camion.nLote === lote.nLote 
      //&& camion.idTransporteOrigen === idTransporteOrigen
    );
  }

  enviarServicio() {
  }

  crearQR() {
    //Buscar y guardar el camion con id camion
    const camion = this.camiones.find((camion) => camion.id === this.camion);
    if (!camion) {
      Notiflix.Notify.failure('Camión no encontrado');
      return;
    }
    //Verificar si escogio un lote, un servicio y una solicitud
    if (!this.lote.nLote || !this.idServicio || !this.idSolicitud) {
      Notiflix.Notify.failure('Faltan datos para generar el QR');
      return;
    }


    //Verificar si existe el ingreso de Trazabilidad. Si existe, solo genera QR. Si no existe, la agrega a la api https://control.als-inspection.cl/api_min/api/trazabilidad/
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/trazabilidad/';
    const datos : any = {
      "nLote": this.lote.nLote,
      "cliente": "Anglo American",
      "idTransporte": camion.id,
      "horaControl": camion.hDestino,
      "fechaControl":camion.fDestino,
      "horaLab": null,
      "fechaLab": null,
      "horaIngresoHorno": null,
      "fechaIngresoHorno": null,
      "horaSalidaHorno": null,
      "fechaSalidaHorno": null,
      "horaTestigoteca": null,
      "fechaTestigoteca": null,
      "estado": "Iniciado"
    }
    //actualizar los valores de data con los valores del camion
    datos.nLote = this.lote.nLote;
    datos.idTransporte = camion.id;
    datos.horaControl = camion.hDestino;
    datos.fechaControl = camion.fDestino;
    datos.observacion = this.lote.observacion;
    datos.cantidadTransporte = this.lotes.find((lote: any) => lote.nLote === this.lote.nLote)?.cantCamiones || 0;

    const qrData = JSON.stringify(datos);
    console.log('consultando ' + apiUrl);
    
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        const existe = data.find((item: any) => item.nLote === this.lote.nLote);
        if (!existe) {
          console.log(datos)
          // Si no existe, almacena la trazabilidad
          this.almacenarTrazabilidad(datos);
        } else {
          Notiflix.Notify.info('La trazabilidad de este Lote ya existe');
        }
      },
      (error) => {
        console.error('Error al obtener trazabilidad', error);
      }
    );
    
    const opciones: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };
  
    QRCode.toDataURL(qrData, opciones).then((url: string) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr.png';
      a.click();
    });
  }

  almacenarTrazabilidad(datos : any) {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/trazabilidad/';
    this.http.post(apiUrl, datos).subscribe(
      (response) => {
        Notiflix.Notify.success('Trazabilidad almacenada correctamente');
      },
      (error) => {
        console.error('Error al almacenar trazabilidad', error);
        Notiflix.Notify.failure('Error al almacenar trazabilidad');
      }
    );
  }

  borrarTodasTrazabilidades() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/trazabilidad/';
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
  
}
