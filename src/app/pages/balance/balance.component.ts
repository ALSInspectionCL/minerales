import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import Notiflix from 'notiflix';
import { map, Observable, startWith } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { Bodega } from 'src/app/services/bodega.service';
import { LoteService } from 'src/app/services/lote.service';
import * as XLSX from 'xlsx';
import { FiveDayRangeSelectionStrategy } from '../formularios/formularios.component';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    TablerIconsModule,
    MatCardModule,
    MatCard,
    MatFormField,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class BalanceComponent {
  fechaDesde: Date;
  fechaHasta: Date;
  tablaCamion: boolean = false;
  tablaVagon: boolean = false;
  tablaInv: boolean = false;
  tablaRCamion: boolean = false;
  tablaRVagon: boolean = false;
  tipoVehiculo: string;
  estado: string;
  tipoBalance: string;
  servicios: any[];
  solicitudes: any[] = [];
  solicitudesFiltradas: any[];
  idServicio: any;
  idSolicitud: any;

  constructor(
    private http: HttpClient,
    private loteService: LoteService,
    private bodegaService: Bodega
  ) {}

  documento = new FormControl('');

  opcionesFiltradas: Observable<any[]>;

  camionesRecepcion: any[] = [];
  vagonesRecepcion: any[] = [];
  bodegas: any[] = [];
  lotesRecepcion: any[] = [];
  lotesDespacho: any[] = [];

  ngOnInit() {
    this.obtenerServicios();
    this.obtenerSolicitudes();
  }

  obtenerServicios() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/servicio/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.servicios = data; // Asigna los servicios obtenidos a la variable
        console.log(data);
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
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener servicios', error);
      }
    );
  }

  obtenerLotesRecepcion() {
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/lote-recepcion/?' +
      this.idServicio +
      this.idSolicitud +
      '/';
    console.log('consultando ' + apiUrl);
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.lotesRecepcion = data; // Asigna los lotes obtenidos a la variable
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener lotes', error);
      }
    );
  }

  obtenerLoteDespacho() {
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/lote-despacho/?' +
      this.idServicio +
      this.idSolicitud +
      '/';
    console.log('consultando ' + apiUrl);
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.lotesDespacho = data; // Asigna los lotes obtenidos a
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener lotes', error);
      }
    );
  }

  obtenerObservaciones(camionesRecepcion: any[]) {
    let ultimonLoteRevisado = '';
    camionesRecepcion.forEach((camion: any) => {
      if (camion.nLote !== ultimonLoteRevisado) {
        this.loteService.getLoteBynLote(camion.nLote).subscribe((response) => {
          const lote = (response as any[])[0];
          camion.observacion = lote.observacion;
          ultimonLoteRevisado = camion.nLote;
        });
      }
    });
    this.camionesRecepcion = camionesRecepcion;
  }

  obtenerNombreBodega(camionesRecepcion: any[]) {
    //buscar todas las bodegas
    this.bodegaService.getBodegas().subscribe((response) => {
      const bodegas = response as any[];
      console.log(bodegas);
      camionesRecepcion.forEach((camion: any) => {
        const bodega = bodegas.find(
          (bodega: any) => bodega.idBodega === camion.bodega
        );
        if (bodega) {
          camion.nombreBodega = bodega.nombreBodega;
        }
      });
      this.camionesRecepcion = camionesRecepcion;
    });
  }

  private registrosPorNLote: any[] = [];
  private nLoteAnterior: any;

  // } else if (this.tablaVagon){

  // }else if (this.tablaInventario){
  //   console.log('Descargar inventario');
  //   }
  // else if (this.tablaIngresos){
  // }else if (this.tablaDespachos){
  //   console.log('Descargar despachos');
  //   }
  //   }

  wip() {
    Notiflix.Notify.warning('En construcción');
  }

  generarDocumento() {
    this.wip();
    console.log('Generar documento segun las siguientes opciones');
    console.log('1. Generar tipo de vehiculo:' + this.tipoVehiculo);
    console.log('2. Generar estado:' + this.estado);
    console.log('3. Generar fecha desde:' + this.fechaDesde);
    console.log('4. Generar fecha hasta:' + this.fechaHasta);

    if (this.fechaDesde && this.fechaHasta) {
      let fechaDesde = this.formatDate(this.fechaDesde);
      let fechaHasta = this.formatDate(this.fechaHasta);
    } else {
      this.fechaDesde = new Date();
      this.fechaDesde = this.obtenerPrimerDiaDelMes(this.fechaDesde);
      //fechaDesde empieza desde el dia 01 de este mes
      let fechaHasta = new Date();
      this.fechaHasta = new Date();
      //fechaHasta termina en el dia de hoy
    }
    //buscar los registros segun el servicio y solicitud. Si no tiene servicio ni solicitud, buscar todos los registros
    let apiUrl ='https://control.als-inspection.cl/api_min/api/lote-recepcion/';
    if (this.idServicio) {
      apiUrl += '?nServ=' + this.idServicio + '&';
    }
    if (this.idSolicitud) {
      apiUrl += '?nSolicitud=' + this.idSolicitud;
    }
    //guardar una lista con los nLotes para buscar los registros de cada nLote
    let nLotes: string[] = [];
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        // Verificar si existen nServ y nSoli
        if (this.idServicio && !this.idSolicitud) {
          nLotes = data
            .filter((lote) => lote.servicio === this.idServicio)
            .map((lote) => lote.nLote);
        } else if (this.idServicio && this.idSolicitud) {
          // Filtrar datos para solo almacenar nLotes que coinciden con nServ y nSoli
          nLotes = data
            .filter(
              (lote) =>
                lote.servicio === this.idServicio &&
                lote.solicitud === this.idSolicitud
            )
            .map((lote) => lote.nLote);
        } else {
          // Almacenar todos los nLotes si no existen nServ y nSoli
          nLotes = data.map((lote) => lote.nLote);
        }
        console.log('Cantidad de lotes encontrados: ' + nLotes.length);
        // Recorrer cada nLote para obtener los registros de cada uno
      },
      (error) => {
        console.error('Error al obtener registros', error);
      }
    );
    let apiLotes =
    'https://control.als-inspection.cl/api_min/api/recepcion-transporte/';
    this.http.get<any[]>(apiLotes).subscribe(
      (data) => {
        // Filtrar data por nLote
        let registrosPorNLote = data.filter((registro) =>
          nLotes.includes(registro.nLote)
        );
        console.log('Registros por nLote: ' + registrosPorNLote.length);

        // Filtrar registros por fecha
        let registrosFiltradosPorFecha = registrosPorNLote.filter(
          (registro) => {
            let fOrigen = new Date(registro.fOrigen);
            return fOrigen >= this.fechaDesde && fOrigen <= this.fechaHasta;
          }
        );
        console.log(
          'Registros filtrados por fecha: ' +
            registrosFiltradosPorFecha.length
        );

        // Filtrar registros por estado
        let registrosFiltradosPorEstado;
        if (this.estado === 'pendiente' || this.estado === 'aprobado') {
          registrosFiltradosPorEstado = registrosFiltradosPorFecha.filter(
            (registro) => registro.estado === this.estado
          );
        } else {
          registrosFiltradosPorEstado = registrosFiltradosPorFecha;
        }
        console.log(
          'Registros filtrados por estado: ' +
            registrosFiltradosPorEstado.length
        );

        // Filtrar registros por tipo de vehiculo
        let registrosFiltradosPorTipoVehiculo;
        if (
          this.tipoVehiculo === 'Camion' ||
          this.tipoVehiculo === 'Vagon'
        ) {
          registrosFiltradosPorTipoVehiculo =
            registrosFiltradosPorEstado.filter(
              (registro) => registro.tipoTransporte === this.tipoVehiculo
            );
        } else {
          registrosFiltradosPorTipoVehiculo = registrosFiltradosPorEstado;
        }
        console.log(
          'Registros filtrados por tipo de vehiculo: ' +
            registrosFiltradosPorTipoVehiculo.length
        );

        // Generar documento
        let registrosIngresos = registrosFiltradosPorTipoVehiculo;
        console.log(registrosIngresos);
        this.descargarDocumento(registrosIngresos)
      },
      (error) => {
        console.error('Error al obtener registros', error);
      }
    );
  }

  // descargarDocumento(registrosIngresos: any[], registrosDespachos: any[]) {
  //   console.log('Descargando documento...');
  //   console.log(registrosIngresos.length);
  //   console.log(registrosDespachos.length);
  // }

  descargarDocumento(registros: any[]) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(registros);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob: Blob = new Blob([excelBuffer], {
      type: this.getMimeType('xlsx'),
    });
    const fileName = 'registros.xlsx';
    this.saveAs(blob, fileName);
  }

  // Agregar estas funciones a la clase BalanceComponent

private getMimeType(fileExtension: string): string {
  switch (fileExtension) {
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}

private saveAs(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

  porAgregar() {
    let nLotes: string[] = [];
    let apiEmbarque =
      'https://control.als-inspection.cl/api_min/api/despacho-embarque/';
    this.http.get<any[]>(apiEmbarque).subscribe(
      (data) => {
        // Filtrar data por nLote
        let registrosPorNLote = data.filter((registro) =>
          nLotes.includes(registro.nLote)
        );
        console.log('Registros por nLote: ' + registrosPorNLote.length);

        // Filtrar registros por fecha
        let registrosFiltradosPorFecha = registrosPorNLote.filter(
          (registro) => {
            let fOrigen = new Date(registro.fOrigen);
            return fOrigen >= this.fechaDesde && fOrigen <= this.fechaHasta;
          }
        );
        console.log(
          'Registros filtrados por fecha: ' + registrosFiltradosPorFecha.length
        );

        // Filtrar registros por estado
        let registrosFiltradosPorEstado;
        if (this.estado === 'pendiente' || this.estado === 'aprobado') {
          registrosFiltradosPorEstado = registrosFiltradosPorFecha.filter(
            (registro) => registro.estado === this.estado
          );
        } else {
          registrosFiltradosPorEstado = registrosFiltradosPorFecha;
        }
        console.log(
          'Registros filtrados por estado: ' +
            registrosFiltradosPorEstado.length
        );

        // Filtrar registros por tipo de vehiculo
        let registrosFiltradosPorTipoVehiculo;
        if (this.tipoVehiculo === 'Camion' || this.tipoVehiculo === 'Vagon') {
          registrosFiltradosPorTipoVehiculo =
            registrosFiltradosPorEstado.filter(
              (registro) => registro.tipoTransporte === this.tipoVehiculo
            );
        } else {
          registrosFiltradosPorTipoVehiculo = registrosFiltradosPorEstado;
        }
        console.log(
          'Registros filtrados por tipo de vehiculo: ' +
            registrosFiltradosPorTipoVehiculo.length
        );

        // Generar documento
        this.registrosPorNLote = registrosFiltradosPorTipoVehiculo;
        console.log(this.registrosPorNLote);
        return this.registrosPorNLote;
      },
      (error) => {
        console.error('Error al obtener registros', error);
      }
    );
  }

  obtenerPrimerDiaDelMes(fecha: Date): Date {
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    this.formatDate(primerDia);
    return primerDia;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  filtrarSolicitudes(servicioId: any) {
    this.solicitudesFiltradas = this.solicitudes.filter(
      (solicitud) => solicitud.nServ === servicioId
    );
  }
}
