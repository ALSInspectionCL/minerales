import { Observable } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import Notiflix from 'notiflix';
import { Notify } from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import { LoteService } from 'src/app/services/lote.service';
import { ServicioService } from 'src/app/services/servicio.service';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { DetalleLoteComponent } from './detalle-lote/detalle-lote.component';
import { RolService } from 'src/app/services/rol.service';

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
  selector: 'app-recepcion',
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
  templateUrl: './recepcion.component.html',
  styleUrl: './recepcion.component.scss',
})
export class RecepcionComponent {
  idServicio: any;
  idSolicitud: any;
  servicios: any;
  solicitud: any;
  lotes: any;
  sub: string;
  public isDialog: boolean;
  admin: boolean;
  operator: boolean;

  displayedColumns1: string[] = [
    'nLote',
    'fLote',
    'tipoTransporte',
    'cantCamiones',
    'cantVagones',
    'pesoTara',
    'pesoNetoHumedo',
    'porcHumedad',
    'pesoNetoSeco',
    'diferenciaPeso',
    'detalle',
  ];
  dataSource1 = LOTE_DEFAULT;

  constructor(
    private dialog: MatDialog,
    private loteService: LoteService,
    private solicitudService: SolicitudService,
    private servicioService: ServicioService,
    private http: HttpClient,
    private rolService: RolService,
  ) {}

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
    });
  }

  obtenerServicios() {
    const apiUrl = 'http://127.0.0.1:8000/api/servicio/';
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
    const apiUrl = 'http://127.0.0.1:8000/api/solicitud/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.solicitud = data; // Asigna las solicitudes obtenidos a la variable
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener servicios', error);
      }
    );
  }

  obtenerLotes() {
    const apiUrl =
      'http://127.0.0.1:8000/api/lote-recepcion/?' +
      this.idServicio +
      this.idSolicitud +
      '/';
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
    });
  }

  detalleLote(nLote: string) {
    const dialogRef = this.dialog.open(DetalleLoteComponent, {
      width: '90%', // Ajusta el ancho del diálogo
      height: '90%', // Ajusta la altura del diálogo
      maxWidth: '95vw', // Máximo ancho en viewport
      maxHeight: '95vh', // Máxima altura en viewport
      data: {
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
      const apiUrl = `http://127.0.0.1:8000/api/lote-recepcion/?solicitud=${this.idSolicitud}&servicio=${this.idServicio}/`;
      // Hacer la solicitud HTTP para obtener los lotes
      console.log('consultando ' + apiUrl);

      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          // Inicializar LOTE_FILTRADO como un array vacío
          const LOTE_FILTRADO: any[] = [];

          if (data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              // Filtrar lotes por idServicio e idSolicitud
              if (
                data[i].servicio === this.idServicio &&
                data[i].solicitud === this.idSolicitud
              ) {
                // Agregar a lote filtrado
                LOTE_FILTRADO.push(data[i]);
              }
            }

            // Asignar el lote filtrado a dataSource1
            this.dataSource1 = LOTE_FILTRADO;

            // Verificar si LOTE_FILTRADO está vacío
            if (LOTE_FILTRADO.length === 0) {
              Notify.failure('No hay lotes para mostrar');
              this.dataSource1 = LOTE_DEFAULT; // Cargar datos por defecto si no hay coincidencias
            } else {
              this.mostrarTabla = true;
              Notify.success('Lotes cargados con éxito');
            }
          } else {
            Notify.failure(
              'No se encontraron lotes para la combinación de servicio y solicitud'
            );
            this.dataSource1 = LOTE_DEFAULT; // Cargar datos por defecto si no hay coincidencias
          }
        },
        (error) => {
          console.error('Error al obtener lotes', error);
          Notify.failure('Error al cargar los lotes: ' + error.message);
          this.dataSource1 = LOTE_DEFAULT; // Cargar datos por defecto en caso de error
        }
      );
    }
  }

  // else {
  //   Notify.failure('No se encontraron lotes para el servicio seleccionado');
  //   this.dataSource1 = LOTE_DEFAULT
  // }
}

@Component({
  selector: 'app-lote-dialog',
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
  templateUrl: './crear-lote-dialog.html',
})
export class CrearLoteDialog {
  loteForm: FormGroup;
  nuevoLote: loteRecepcion;

  public constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA)
    public data: { idServicio: number; idSolicitud: number },
    private dialogRef: MatDialogRef<CrearLoteDialog>
  ) {
    this.loteForm = this.fb.group({
      NLote: ['', Validators.required],
      FLote: ['', Validators.required],
      Observacion: [''],
      TipoTransporte: ['', Validators.required],
      CantCamiones: [0, Validators.required],
      CantVagones: [0, Validators.required],
      CantBigbag: [0, Validators.required],
      PesoTara: [0, Validators.required],
      PesoNetoHumedo: [0, Validators.required],
      PorcHumedad: [0, Validators.required],
      PesoNetoSeco: [0, Validators.required],
      DiferenciaPeso: [0, Validators.required],
      idServicio: ['', Validators.required],
      idSolicitud: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.generarNumeroLote();
    this.setFechaActual();
    this.setIds();
    console.log(this.loteForm);
  }

  crearNuevoLote() {
    if (this.loteForm.valid) {
      Notiflix.Loading.standard('Loading...', {
        backgroundColor: 'rgba(0,0,0,0.8)',
      });

      const nuevoLote = {
        nLote: this.loteForm.value.NLote,
        fLote: this.formatDate(this.loteForm.value.FLote),
        observacion: this.loteForm.value.Observacion || '',
        tipoTransporte: this.loteForm.value.TipoTransporte,
        cantCamiones: this.loteForm.value.CantCamiones,
        cantVagones: this.loteForm.value.CantVagones,
        cantBigbag: this.loteForm.value.cantBigBag,
        pesoBrutoHumedo: this.loteForm.value.PesoNetoHumedo,
        pesoTara: this.loteForm.value.PesoTara,
        pesoNetoHumedo: this.loteForm.value.PesoNetoHumedo,
        porcHumedad: this.loteForm.value.PorcHumedad,
        pesoNetoSeco: this.loteForm.value.PesoNetoSeco,
        diferenciaPeso: this.loteForm.value.DiferenciaPeso,
        servicio: this.data.idServicio,
        solicitud: this.data.idSolicitud,
      };

      console.log('Nuevo Lote a enviar:', nuevoLote); // Verifica el objeto antes de enviarlo

      const apiUrl = 'http://127.0.0.1:8000/api/lote-recepcion/';

      this.http.post(apiUrl, nuevoLote).subscribe(
        (response) => {
          Notiflix.Loading.remove(); // Eliminar el loading
          Notiflix.Notify.success('Lote registrado con éxito');
          console.log('Lote guardado:', response);
          this.dialogRef.close(true); // Cerrar el diálogo
        },
        (error) => {
          Notiflix.Loading.remove(); // Eliminar el loading
          Notiflix.Notify.failure(
            'Error al registrar el lote: ' + error.message
          );
          console.error('Error al guardar el lote:', error);
          console.error('Detalles del error:', error.error); // Detalles del error
        }
      );
    } else {
      Notiflix.Notify.failure('Error al registrar el lote');
    }
  }

  // Función para formatear la fecha
  formatDate(dateString: string): string {
    const parts = dateString.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convierte a formato YYYY-MM-DD
  }

  setFechaActual() {
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia}/${mes}/${anio}`;
    this.loteForm.patchValue({ FLote: fechaFormateada });
  }

  setIds() {
    this.loteForm.patchValue({ idServicio: this.data.idServicio });
    this.loteForm.patchValue({ idSolicitud: this.data.idSolicitud });
  }

  generarNumeroLote() {
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const anio = fechaActual.getFullYear();
    const hora = String(fechaActual.getHours()).padStart(2, '0');
    const minuto = String(fechaActual.getMinutes()).padStart(2, '0');
    const segundo = String(fechaActual.getSeconds()).padStart(2, '0');
    const nuevoLote = `${anio}${mes}${dia}${hora}${minuto}${segundo}`;
    this.loteForm.patchValue({ NLote: nuevoLote });
  }
}
