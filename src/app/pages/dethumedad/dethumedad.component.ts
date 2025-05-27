import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardModule } from '@angular/material/card';
import {AsyncPipe, CommonModule} from '@angular/common';
import { SerialPort } from 'serialport';
import { NgxSerial } from 'ngx-serial';
import { interval } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { Notify } from 'notiflix';
import { LoteService } from 'src/app/services/lote.service';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { HttpClient } from '@angular/common/http';
import { RolService } from 'src/app/services/rol.service';
import { ServicioService } from 'src/app/services/servicio.service';
import { DetalleLoteComponent } from '../recepcion/detalle-lote/detalle-lote.component';
import { CrearLoteDialog } from '../recepcion/recepcion.component';
import { DetalleHumedadComponent } from './detalle-humedad/detalle-humedad.component';

export interface loteRecepcion {
  id: number;
  nLote: number;
  fLote: string;
  observacion: string;
  tipoTransporte: string;
  cantCamiones: number;
  cantVagones: number;
  cantBigbag: number;
  pesoTara: number;
  pesoNetoHumedo: number;
  pesoBrutoHumedo: number;
  porcHumedad: number;
  pesoNetoSeco: number;
  diferenciaPeso: number;
  servicio: number;
  solicitud: number;
}

const LOTE_DEFAULT: loteRecepcion[] = [
  {
    id: 0,
    nLote: 0,
    fLote: '',
    observacion: '',
    tipoTransporte: '',
    cantCamiones: 0,
    cantVagones: 0,
    cantBigbag: 0,
    pesoTara: 0,
    pesoNetoHumedo: 0,
    pesoBrutoHumedo: 0,
    porcHumedad: 0,
    pesoNetoSeco: 0,
    diferenciaPeso: 0,
    servicio: 0,
    solicitud: 0,
  },
];

const LOTE_FILTRADO: loteRecepcion[] = [];

@Component({
  selector: 'app-dethumedad',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    TablerIconsModule,
    MatCardModule,
    MatCard,
    MatCardModule,
    MatTable,
    MatFormField,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatIconModule,
    ],
  templateUrl: './dethumedad.component.html',
  styleUrl: './dethumedad.component.scss'
})


export class DethumedadComponent {
  datosBalanza: any[] = [];
  peso: number;
  pesoActual: number = 0;
  serial: NgxSerial;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  idServicio: any;
  idSolicitud: any;
  servicios: any[];
  solicitudes: any[] = [];
  solicitudesFiltradas: any[];
  lotes: any;
  sub: string;
  public isDialog: boolean;
  admin: boolean;
  operator: boolean;
  encargado: boolean;
  totalPeso: number;

    displayedColumns1: string[] = [
      'nLote',
      'observacion',
      'fLote',
      'tipoTransporte',
      'cantCamiones',
      'cantVagones',
      'porcHumedad',
      'detalle',
    ];
    dataSource1 = LOTE_DEFAULT;
    dataSource2 = new MatTableDataSource<any>();

  constructor(private cdr: ChangeDetectorRef,private dialog: MatDialog,
      private loteService: LoteService,
      private solicitudService: SolicitudService,
      private servicioService: ServicioService,
      private http: HttpClient,
      private rolService: RolService,) {
    this.serial = new NgxSerial(this.dataHandler);
  }


dataHandler(data: string) {
  console.log(data);
  const peso = data.trim();
  this.pesoActual = parseFloat(peso);
}

guardarPeso() {
  if (this.pesoActual !== 0 || this.pesoActual !== undefined) {
    const dato = {
      id: this.datosBalanza.length + 1,
      peso: this.pesoActual
    };
    this.datosBalanza.push(dato);
    this.pesoActual = 0;
  }else{
    console.log('No hay peso para guardar');
  }
}

  ngOnInit() {
    this.obtenerServicios();
    this.obtenerSolicitudes();
    this.obtenerLotes();
    this.admin = RolService.isTokenValid();
    this.rolService.hasRole(String(localStorage.getItem('email') || ''), 'Operador').subscribe(hasRole => {
    if (hasRole) {
      console.log('El usuario tiene el rol de operator');
      this.operator = true;
    } else {
      console.log('El usuario no tiene el rol de operator');
      this.operator = false;
    }
    this.rolService.hasRole(String(localStorage.getItem('email') || ''), 'Admin').subscribe(hasRole => {
      if (hasRole) {
        console.log('El usuario tiene el rol de Admin');
        this.admin = true;
      } else {
        console.log('El usuario no tiene el rol de Admin');
        this.admin = false;
      }
    });
    this.rolService.hasRole(localStorage.getItem('email') || '', 'Encargado').subscribe((hasRole) => {
      if (hasRole) {
        this.encargado = true;
        console.log('El usuario tiene el rol de Encargado');
      } else {
        this.encargado = false;
        console.log('El usuario no tiene el rol de Encargado');
      }
    });
    });
  }

  onPageEvent(event: any) {
    this.dataSource2.paginator = this.paginator;
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

  obtenerLotes() {
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/lote-recepcion/?' +
      this.idServicio +
      this.idSolicitud +
      '/';
    console.log('consultando ' + apiUrl);
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.lotes = data; // Asigna los lotes obtenidos a la variable
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener lotes', error);
      }
    );
  }

  crearLote() {
    const dialogRef = this.dialog.open(CrearLoteDialog, {
      width: '500px',
      data: {
        idServicio: this.idServicio,
        idSolicitud: this.idSolicitud,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ngOnInit();
        
      }
      this.cargarLotes();
    });
  }

  filtrarSolicitudes(servicioId: any) {
    this.solicitudesFiltradas = this.solicitudes.filter(solicitud => solicitud.nServ === servicioId);
  }

  detalleLote(nLote: string, numero: number) {
    console.log('Detalle del lote:', nLote); // Verifica el número de lote
    console.log('Número del lote:', numero); // Verifica el número de lote
    const dialogRef = this.dialog.open(DetalleHumedadComponent, {
      width: '90%', // Ajusta el ancho del diálogo
      height: '90%', // Ajusta la altura del diálogo
      maxWidth: '95vw', // Máximo ancho en viewport
      maxHeight: '95vh', // Máxima altura en viewport
      data: {
        numero: numero,
        idServicio: this.idServicio,
        idSolicitud: this.idSolicitud,
        nLote: nLote,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ngOnInit();
      }
    });
  }

  mostrarTabla: boolean = false;


  cargarLotes() {
    console.log(this.idServicio);
    console.log(this.idSolicitud);
    if (
      this.idServicio == null ||
      this.idServicio == '' ||
      this.idServicio == undefined
    ) {
      Notify.failure('Por favor, seleccione un servicio');
      this.dataSource1 = LOTE_DEFAULT;
      return;
    }
    if (
      this.idSolicitud == null ||
      this.idSolicitud == '' ||
      this.idSolicitud == undefined
    ) {
      Notify.failure('Por favor, seleccione una solicitud');
      this.dataSource1 = LOTE_DEFAULT;
      return;
    } else {
      const apiUrl = `https://control.als-inspection.cl/api_min/api/lote-recepcion/?solicitud=${this.idSolicitud}&servicio=${this.idServicio}/`;
      // Hacer la solicitud HTTP para obtener los lotes
      console.log('consultando ' + apiUrl);

      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          // Inicializar LOTE_FILTRADO como un array vacío
          const LOTE_FILTRADO: any[] = [];

          if (data && data.length > 0) {
            let sumaPesos = 0;
            for (let i = 0; i < data.length; i++) {
              // Filtrar lotes por idServicio e idSolicitud
              if (
                data[i].servicio === this.idServicio &&
                data[i].solicitud === this.idSolicitud
              ) {
                // Agregar a lote filtrado
                LOTE_FILTRADO.push(data[i]);
                sumaPesos += Number(data[i].pesoNetoHumedo);
              }
            }

            // Asignar el lote filtrado a dataSource1
            this.dataSource1 = LOTE_FILTRADO;
            this.dataSource2 = new MatTableDataSource<any>(LOTE_FILTRADO);
            this.dataSource2.paginator = this.paginator;
            this.totalPeso = Number(sumaPesos.toFixed(2))

            // Verificar si LOTE_FILTRADO está vacío
            if (LOTE_FILTRADO.length === 0) {
              Notify.failure('No hay lotes para mostrar');
              this.mostrarTabla = false;
              this.totalPeso = 0;
              this.dataSource1 = LOTE_DEFAULT; // Cargar datos por defecto si no hay coincidencias
            } else {
              this.mostrarTabla = true;
              Notify.success('Lotes cargados con éxito');
            }
          } else {
            Notify.failure(
              'No se encontraron lotes para la combinación de servicio y solicitud'
            );
            this.totalPeso = 0;
            this.mostrarTabla = false;
            this.dataSource1 = LOTE_DEFAULT; // Cargar datos por defecto si no hay coincidencias
          }
        },
        (error) => {
          console.error('Error al obtener lotes', error);
          Notify.failure('Error al cargar los lotes: ' + error.message);
          this.mostrarTabla = false;
          this.dataSource1 = LOTE_DEFAULT; // Cargar datos por defecto en caso de error
        }
      );
    }
  }



}




