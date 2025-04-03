import { Token } from '@angular/compiler';
import { SolicitudService } from './../../services/solicitud.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Injectable, ViewChild } from '@angular/core';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Observable } from 'rxjs';
import { DateAdapter } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { OnInit } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { ServicioService } from './../../services/servicio.service';
import { HttpClient } from '@angular/common/http';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Notiflix from 'notiflix';
import { RolService } from 'src/app/services/rol.service';
import { LoteService } from 'src/app/services/lote.service';
import { MatTableDataSource } from '@angular/material/table';
import { Bodega } from 'src/app/services/bodega.service';
import { ReportesComponent } from 'src/app/pages/reportes/reportes.component';
import * as XLSX from 'xlsx';

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

interface Servicio {
  id: number;
  nServ: string;
  eServ: string;
  fServ: string;
  lServ: string;
}
interface Solicitud {
  id: number;
  nSoli: string;
  nServ: string;
  FiSoli: string;
  FtSoli: string;
  lSoli: string;
  eSoli: string;
}

interface User {
  username: string;
  email: string;
  rol: string;
}

export interface Userlogs {
  email: string;
  fecha: string;
  hora: string;
}

filteredOptions: Observable<any[]>;

@Component({
  selector: 'app-formularios',
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
  templateUrl: './formularios.component.html',
  styleUrl: './formularios.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class FormulariosComponent {
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  myControl = new FormControl('');
  options: string[] = ['Ventanas', 'San Antonio', 'Otro'];
  filteredOptions: Observable<string[]>;
  estadoServ: string = 'Iniciado';
  estadoSoli: string = 'Iniciado';
  nServ: number;
  nombreBodega: string;
  servicios: Servicio[];
  solicitudes: Solicitud[];
  bodegas: any[];
  admin: boolean;
  bodegaSeleccionada: {
    idBodega: number;
    nombreBodega: string;
    total: number;
    imagen: any;
  } = {
    nombreBodega: '',
    idBodega: 0,
    total: 0,
    imagen: null,
  };
  correoElectronico = '';

  // const reportes = new ReportesComponent(http, loteService,Bodega);

  imagenPreview: any;
  imagenBodega: any;
  verificarCorreo = new FormControl('', [Validators.required, Validators.email]);
  usuarios: any[];
  servicio = {
    nServ: '',
    fServ: '',
    lServ: '',
    eServ: '',
  };

  solicitud = {
    nSoli: '',
    nServ: '',
    FiSoli: '',
    FtSoli: '',
    lSoli: '',
    eSoli: '',
  };

  roles: string[] = ['Cliente', 'Operador', 'Encargado', 'Admin'];
  rolSeleccionado: string;
  userSeleccionado: string;
  lotes: any[];
  displayedColumns: string[] = ['email', 'fecha', 'hora'];
  constructor(
    private RolService: RolService,
    private loteService: LoteService,
    private bodegaService: Bodega,
    private solicitudService: SolicitudService,
    private servicioService: ServicioService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.obtenerServicios();
    this.obtenerSolicitudes();
    this.obtenerUsuarios();
    this.obtenerBodegas();
    this.obtenerLogs();
    this.admin = true;
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }
  obtenerBodegas() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/bodega/'; // Cambia la URL según API
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.bodegas = data; // Asigna las bodegas obtenidos a la variable
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener servicios', error);
      }
    );
  }

  obtenerServicios() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/servicio/'; // Cambia la URL según API
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

  obtenerUsuarios() {
    const Token = localStorage.getItem('token');
    this.RolService.getAllUsers(Token || '').subscribe(
      (users) => {
        this.usuarios = users;
        console.log(users);
      },
      (error) => {
        console.error('Error al obtener los usuarios', error); // Manejar el error
      }
    );
  }

  logs: any;
  obtenerLogs() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/user-logs/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.dataSource.data = data.reverse();
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener los logs', error);
      }
    );
  }

  obtenerLotes(): void {
    const servicioId = this.selectedServicioId;
    const solicitudId = this.selectedSolicitudId;

    console.log('Servicio seleccionado:', servicioId);
    console.log('Solicitud seleccionada:', solicitudId);
    if (servicioId && solicitudId) {
      const apiUrl =
        'https://control.als-inspection.cl/api_min/api/lote-recepcion/?solicitud=' +
        solicitudId +
        '&servicio=' +
        servicioId +
        '/';
      ('/');
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          this.lotes = data.filter(
            (lote) =>
              lote.servicio === servicioId && lote.solicitud === solicitudId
          );
          console.log(this.lotes);
        },
        (error) => {
          console.error('Error al obtener lotes', error);
        }
      );
    }
  }

  selectedLoteId: any;
  preEliminarLote() {
    const loteId = this.selectedLoteId;
    console.log('Lote seleccionado para eliminar:', this.selectedLoteId);
    Notiflix.Confirm.show(
      '¿Estás seguro de eliminar el lote?',
      'Esta acción no se puede deshacer',
      'Eliminar',
      'Cancelar',
      () => {
        this.eliminarLote(loteId);
        Notiflix.Notify.success('Lote eliminado');
      },
      () => {
        Notiflix.Notify.warning('No se elimino el lote');
      }
    );
  }

  eliminarLote(loteId: number) {
    const apiUrl = `https://control.als-inspection.cl/api_min/api/lote-recepcion/${loteId}/`;
    this.http.delete(apiUrl).subscribe(
      (respuesta) => {
        console.log('Lote eliminado:', respuesta);
        this.lotes = this.lotes.filter((lote) => lote.id !== loteId);
        this.selectedLoteId = null;
        Notiflix.Notify.success('Lote eliminado con éxito');
      },
      (error) => {
        console.error('Error al eliminar el lote:', error);
        Notiflix.Notify.failure('Error al eliminar el lote');
      }
    );
  }

  enviarServicio() {
    this.servicioService.crearServicio(this.servicio).subscribe(
      (respuesta) => {
        console.log(respuesta);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  enviarSolicitud() {
    this.solicitudService.crearSolicitud(this.solicitud).subscribe(
      (respuesta) => {
        console.log(respuesta);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  crearServicio() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/servicio/';
    const dateFServ = new Date(this.servicio.fServ);
    const formattedFServ = this.formatDate(dateFServ);
    const servicio = {
      nServ: this.servicio.nServ,
      fServ: formattedFServ,
      lServ: this.servicio.lServ,
      eServ: 'pendiente',
    };
    console.log(servicio);
    this.http.post(apiUrl, servicio).subscribe(
      (respuesta) => {
        console.log(respuesta);
        Notiflix.Notify.success('Servicio creado');
        this.ngOnInit();
        // Aquí puedes mostrar un mensaje de éxito o realizar otras acciones
      },
      (error) => {
        console.error(error);
        Notiflix.Notify.failure('Servicio no creado');
        this.ngOnInit();
        // Aquí puedes mostrar un mensaje de error o realizar otras acciones
      }
    );
  }
  onBodegaChange(event: MatSelectChange) {
    const bodegaSeleccionada = event.value; // Esto ahora es el objeto bodega completo
    console.log('Bodega seleccionada:', bodegaSeleccionada);
    this.bodegaSeleccionada = bodegaSeleccionada;
  }

  guardarBodega() {
    if (
      this.bodegaSeleccionada.idBodega !== undefined &&
      this.bodegaSeleccionada.idBodega !== null &&
      this.bodegaSeleccionada.idBodega !== 0
    ) {
      // Si hay una bodega seleccionada, actualiza sus datos
      this.actualizarBodega(this.bodegaSeleccionada);
    } else {
      // Si no hay bodega seleccionada, crea una nueva
      this.crearBodega(this.bodegaSeleccionada);
    }
  }

  // Método para crear una nueva bodega
  crearBodega(bodega: { nombreBodega: string; total?: number; imagen?: any }) {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/bodega/';

    const formData = new FormData();
    formData.append('nombreBodega', bodega.nombreBodega);
    formData.append('imagen', this.imagenBodega || null);

    this.http.post(apiUrl, bodega).subscribe(
      (respuesta) => {
        console.log('Bodega creada:', respuesta);
        console.log(bodega);
        // Aquí puedes actualizar la lista de bodegas si es necesario
        Notiflix.Notify.success('Bodega creada');
        this.obtenerBodegas(); // Llama a un método para obtener la lista actualizada
      },
      (error) => {
        Notiflix.Notify.failure('Error al crear la bodega');
        console.error('Error al crear la bodega:', error);
      }
    );
  }

  // Método para actualizar una bodega existente
  actualizarBodega(bodega: {
    idBodega: number;
    nombreBodega: string;
    total: number;
    imagen?: any;
  }) {
    const formData = new FormData();
    formData.append('idBodega', bodega.idBodega.toString());
    formData.append('nombreBodega', bodega.nombreBodega);
    formData.append('imagen', bodega.imagen || this.imagenBodega);
    formData.append('total', bodega.total.toFixed(2).toString() || '0'); // Asegúrate de que el total sea un número

    const apiUrl = `https://control.als-inspection.cl/api_min/api/bodega/${bodega.idBodega}/`;
    //bodega.total = 0; // Si deseas actualizar el total, hazlo aquí
    this.http.put(apiUrl, formData).subscribe(
      (respuesta) => {
        console.log('Bodega actualizada:', respuesta);
        console.log(formData);
        Notiflix.Notify.success('La bodega ha sido actualizada con éxito');
        this.obtenerBodegas();
      },
      (error) => {
        console.error('Error al actualizar la bodega:', error);
        Notiflix.Notify.failure('Ha ocurrido un error al actualizar la bodega');
      }
    );
  }

  crearSolicitud() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/solicitud/';
    console.log(this.solicitud);
    const dateFiServ = new Date(this.solicitud.FiSoli);
    const formattedFiServ = this.formatDate(dateFiServ);
    let formattedFtServ: any;
    if (this.solicitud.FtSoli) {
      const dateFtServ = new Date(this.solicitud.FtSoli);
      formattedFtServ = this.formatDate(dateFtServ);
    } else {
      formattedFtServ = null;
    }
    const solicitud = {
      nSoli: this.solicitud.nSoli,
      nServ: this.solicitud.nServ,
      fiSoli: formattedFiServ,
      ftSoli: formattedFtServ,
      lSoli: this.solicitud.lSoli,
      eSoli: 'pendiente',
    };
    console.log(solicitud);

    this.http.post(apiUrl, solicitud).subscribe(
      (respuesta) => {
        Notiflix.Notify.success('Solicitud creada');
        this.ngOnInit();
        console.log(respuesta);
        // Aquí puedes mostrar un mensaje de éxito o realizar otras acciones
      },
      (error) => {
        Notiflix.Notify.failure('Solicitud no creada');
        console.error(error);
        // Aquí puedes mostrar un mensaje de error o realizar otras acciones
      }
    );
  }

  selectedServicioId: any;
  eliminarServicio() {
    console.log(
      'Servicio seleccionado para eliminar:',
      this.selectedServicioId
    );
    const apiUrl = `https://control.als-inspection.cl/api_min/api/servicio/${this.selectedServicioId}/`; // Cambia la URL según tu API
    this.http.delete(apiUrl).subscribe(
      (respuesta) => {
        console.log('Servicio eliminado:', respuesta);
        // Aquí puedes filtrar el array de servicios para eliminar el servicio localmente
        this.servicios = this.servicios.filter(
          (servicio: Servicio) => servicio.id !== this.selectedServicioId
        );
        this.selectedServicioId = null; // Reinicia la selección después de eliminar
      },
      (error) => {
        console.error('Error al eliminar el servicio:', error);
        // Aquí puedes mostrar un mensaje de error o realizar otras acciones
      }
    );
  }

  eliminarRegistros() {
    this.http
      .delete(
        'https://control.als-inspection.cl/api_min/api/recepcion-transporte/'
      )
      .subscribe(
        (response) => {
          Notiflix.Notify.success('Registros eliminados');
          console.log('Todos los registros han sido eliminados:', response);
          // Aquí puedes manejar la actualización de la vista o mostrar un mensaje
        },
        (error) => {
          console.error('Error al eliminar los registros:', error);
        }
      );
  }

  preEliminarServicio() {
    Notiflix.Confirm.show(
      'Eliminar servicio',
      '¿Desea elimiar el servicio?',
      'Si',
      'No',
      () => {
        this.eliminarServicio();
        Notiflix.Notify.success('Se ha eliminado el servicio');
      },
      () => {
        Notiflix.Notify.info('No se ha eliminado el servicio');
      },
      {}
    );
  }
  selectedSolicitudId: any; // Esta variable debe estar aquí
  eliminarSolicitud() {
    const apiUrl = `https://control.als-inspection.cl/api_min/api/solicitud/${this.selectedSolicitudId}/`; // Cambia la URL según tu API
    this.http.delete(apiUrl).subscribe(
      (respuesta) => {
        console.log('Solicitud eliminada:', respuesta);
        // Aquí puedes filtrar el array de solicitudes para eliminar la solicitud localmente
        this.solicitudes = this.solicitudes.filter(
          (solicitud: Solicitud) => solicitud.id !== this.selectedSolicitudId
        );
        this.selectedSolicitudId = null; // Reinicia la selección después de eliminar

        // Mostrar notificación de éxito
      },
      (error) => {
        console.error('Error al eliminar la solicitud:', error);
        // Aquí puedes mostrar un mensaje de error o realizar otras acciones
      }
    );
  }

  asignarRol() {
    // Verificar que se haya seleccionado un rol y un email
    if (!this.rolSeleccionado || !this.userSeleccionado) {
      Notiflix.Notify.warning('Seleccione un rol y un usuario');
      return;
    }

    const apiUrl = 'https://control.als-inspection.cl/api_min/api/user/';

    // Buscar el usuario en la API
    this.http
      .get<any[]>(`${apiUrl}/?search=${this.userSeleccionado}`)
      .subscribe(
        (usuarios) => {
          if (usuarios.length > 0) {
            // El usuario existe, actualizar su rol
            const usuarioExistente = usuarios[0];
            const updatedUser = {
              ...usuarioExistente,
              rol: this.rolSeleccionado,
            };
            console.log(usuarioExistente);

            this.http
              .patch(`${apiUrl}/${usuarioExistente.id}/`, updatedUser)
              .subscribe(
                (respuesta) => {
                  console.log(respuesta);
                  Notiflix.Notify.success('Rol actualizado con éxito');
                },
                (error) => {
                  console.error('Error al actualizar el rol:', error);
                  if (error.error) {
                    console.error('Detalles del error:', error.error);
                  }
                  Notiflix.Notify.failure('Error al actualizar el rol');
                }
              );
          } else {
            // El usuario no existe, mostrar confirmación para crear
            Notiflix.Confirm.show(
              'Notiflix Confirm',
              'El usuario no existe ¿Desea crearlo?',
              'Si',
              'No',
              () => {
                alert('Creando usuario.');
                this.nuevoUsuario(); // Llamar a la función para crear el nuevo usuario
              },
              () => {
                alert('No se han realizado cambios');
              },
              {}
            );
          }
        },
        (error) => {
          console.error('Error al buscar el usuario:', error);
          Notiflix.Notify.failure('Error al buscar el usuario');
        }
      );
  }

  nuevoUsuario() {
    // Verificar que se haya seleccionado un rol y un email
    if (!this.rolSeleccionado || !this.userSeleccionado) {
      Notiflix.Notify.warning('Seleccione un rol y un usuario');
      return;
    }

    // Buscar el usuario en el arreglo de usuarios
    const usuarioEncontrado = this.usuarios.find(
      (user) => user.email === this.userSeleccionado
    );

    if (!usuarioEncontrado) {
      Notiflix.Notify.warning('Usuario no encontrado en la lista de usuarios');
      return;
    }

    // Crear el nuevo objeto de usuario
    const nuevoUser = {
      username:
        usuarioEncontrado.nombre + ' ' + usuarioEncontrado.apellidoPaterno, // Asumiendo que el nombre está en el objeto encontrado
      email: this.userSeleccionado,
      rol: this.rolSeleccionado,
    };

    // Enviar el nuevo usuario a la API
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/user/';
    this.http.post(apiUrl, nuevoUser).subscribe(
      (respuesta) => {
        console.log(respuesta);
        Notiflix.Notify.success('Usuario creado con éxito');
        this.usuarios.push(nuevoUser); // Agregar el nuevo usuario al arreglo local si es necesario
      },
      (error) => {
        console.error(error);
        Notiflix.Notify.failure('Error al crear el usuario');
      }
    );
  }

  preEliminarSolicitud() {
    Notiflix.Confirm.show(
      'Eliminar Solicitud',
      '¿Desea elimiar la solicitud?',
      'Si',
      'No',
      () => {
        this.eliminarSolicitud();
        Notiflix.Notify.success('Se ha eliminado la solicitud');
      },
      () => {
        Notiflix.Notify.info('No se ha eliminado la solicitud');
      },
      {}
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  onFileChange(event: any) {
    this.imagenBodega = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result;
    };
    reader.readAsDataURL(this.imagenBodega);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  camionesRecepcion : any = [];
  lotesResumen : any = [];
  cierreDia() {
    //Generar y enviar el informe de cierre de día. Es el mismo que se genera en reportes.
    let apirecepcion =
      'https://control.als-inspection.cl/api_min/api/recepcion-transporte/';
    let apiLote =
      'https://control.als-inspection.cl/api_min/api/lote-recepcion/';

    //fecha desde es la fecha de hoy - 2
    let fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - 1);
    let fechaHasta = new Date();
    Notiflix.Notify.success('Documento de camiones creado');
    this.http
      .get(
        `${apirecepcion}?fOrigen=${fechaDesde}&?fOrigen=${fechaHasta}/`
      )
      .subscribe((response) => {
        const camionesRecepcion = (response as any[]).filter(
          (camion: any) =>
            camion.tipoTransporte === 'Camion' &&
            new Date(camion.fOrigen) >= new Date(fechaDesde) &&
            new Date(camion.fOrigen) <= new Date(fechaHasta)
        );
        this.camionesRecepcion = camionesRecepcion;
        if (camionesRecepcion.length === 0) {
          Notiflix.Notify.warning('No hay camiones para la fecha seleccionada');
        } else {
          let lastnLote = '';
          let nLotes: any[] = [];
          if (camionesRecepcion.length > 0) {
            lastnLote = camionesRecepcion[0].nLote;
          }
          this.obtenerObservaciones(camionesRecepcion);
          this.obtenerNombreBodega(camionesRecepcion);
          camionesRecepcion.forEach((camion: any) => {
            if (camion.nLote === lastnLote && !nLotes.includes(camion.nLote)) {
              nLotes.push(camion.nLote);
            }
            lastnLote = camion.nLote;
          });
          console.log(nLotes);

          //buscar los lotes en la api lote-recepcion para comparar su posición y asignarsela al camión
          this.http
            .get(`${apiLote}?nLote=${nLotes.join(',')}/`)
            .subscribe((response) => {
              const lotes = (response as any[]).filter((lote: any) =>
                nLotes.includes(lote.nLote)
              );
              console.log(lotes);
              camionesRecepcion.forEach((camion: any) => {
                const lote = lotes.find(
                  (lote: any) => lote.nLote === camion.nLote
                );
                if (lote) {
                  camion.porcHumedad = lote.porcHumedad;
                  camion.netoSeco = (
                    camion.netoHumedoDestino -
                    (camion.netoHumedoDestino * lote.porcHumedad) / 100
                  ).toFixed(2);
                  camion.diferenciaHumeda = (
                    camion.netoHumedoOrigen - camion.netoHumedoDestino
                  ).toFixed(2);
                  camion.diferenciaSeca = (
                    camion.netoHumedoOrigen -
                    (camion.netoHumedoOrigen * lote.porcHumedad) / 100 -
                    camion.netoSeco
                  ).toFixed(2);
                } else {
                  camion.netoSeco = camion.netoHumedoDestino;
                }
              });
              this.lotesResumen = this.camionesRecepcion.reduce(
                (lotes : any, camion : any) => {
                  const indice = lotes.findIndex(
                    (lote: any) => lote.nLote === camion.nLote
                  );
                  if (indice === -1) {
                    lotes.push({
                      nLote: camion.nLote,
                      observacion: camion.observacion,
                      porcHumedad: camion.porcHumedad || 0,
                      cantidadCamiones: 1,
                      netoHumedoOrigen: parseFloat(
                        camion.netoHumedoOrigen
                      ).toFixed(2),
                      netoHumedoDestino: parseFloat(
                        camion.netoHumedoDestino
                      ).toFixed(2),
                      netoSeco: parseFloat(camion.netoSeco).toFixed(2),
                      diferenciaHumeda: parseFloat(
                        camion.diferenciaHumeda
                      ).toFixed(2),
                      diferenciaSeca: parseFloat(camion.diferenciaSeca).toFixed(
                        2
                      ),
                    });
                  } else {
                    lotes[indice].cantidadCamiones += 1;
                    lotes[indice].netoHumedoOrigen = (
                      parseFloat(lotes[indice].netoHumedoOrigen) +
                      parseFloat(camion.netoHumedoOrigen)
                    ).toFixed(2);
                    lotes[indice].netoHumedoDestino = (
                      parseFloat(lotes[indice].netoHumedoDestino) +
                      parseFloat(camion.netoHumedoDestino)
                    ).toFixed(2);
                    lotes[indice].netoSeco = (
                      parseFloat(lotes[indice].netoSeco) +
                      parseFloat(camion.netoSeco)
                    ).toFixed(2);
                    lotes[indice].diferenciaHumeda = (
                      parseFloat(lotes[indice].diferenciaHumeda) +
                      parseFloat(camion.diferenciaHumeda)
                    ).toFixed(2);
                    lotes[indice].diferenciaSeca = (
                      parseFloat(lotes[indice].diferenciaSeca) +
                      parseFloat(camion.diferenciaSeca)
                    ).toFixed(2);
                  }
                  console.log(lotes)
                  return lotes;
                },
                []
              );
              console.log('Lotes resumen:');
              console.log(this.lotesResumen);
            });

          //buscar los registros de los lotes de camiones de nLotes
          const lotesCamiones: any[] = [];
          let camionesLote: any[] = [];
          for (let i = 0; i < nLotes.length; i++) {
            this.http
              .get(
                `https://control.als-inspection.cl/api_min/api/recepcion-transporte/?nLote=${nLotes[i]}/`
              )
              .subscribe((response) => {
                camionesLote = (response as any[]).filter(
                  (camion) =>
                    camion.tipoTransporte === 'Camion' &&
                    camion.nLote === nLotes[i]
                );
                camionesLote.forEach((camion, index) => {
                  lotesCamiones.push({ id: camion.id, index: index });
                });

                for (let i = 0; i < lotesCamiones.length; i++) {
                  for (let j = 0; j < camionesRecepcion.length; j++) {
                    if (camionesRecepcion[j].id === lotesCamiones[i].id) {
                      camionesRecepcion[j].posicion = lotesCamiones[i].index;
                    }
                  }
                }
              });
            console.log(camionesRecepcion);
          }
          console.log()

          Notiflix.Notify.success('Camiones encontrados');
          this.descargarDocumento(camionesRecepcion,this.lotesResumen)
        }
      });
  }

  descargarDocumento(camionesRecepcion:any, loteResumen:any){
          const sumas = [
            {
              'Total de Camiones': this.calcularTotalCamiones(),
              'Peso Neto Despacho Total': this.calcularPesoNetoDespachoTotal(),
              'Peso Neto Recepción Total': this.calcularPesoNetoRecepcionTotal(),
              'Peso Neto Seco Total': this.calcularPesoNetoSecoTotal(),
              'Diferencia Seca Total': this.calcularDiferenciaSecaTotal(),
              'Promedio de Humedades': this.calcularPromedioHumedades(),
            },
          ];
          const resumen = loteResumen.map(
            (lote: any) =>({
              'Lote': lote.observacion,
              'Total de Camiones': lote.cantidadCamiones,
              'Neto Humedo Despacho': lote.netoHumedoOrigen,
              'Neto Humedo Recepción': lote.netoHumedoDestino,
              'Porcentaje de Humedad':lote.porcHumedad,
              'Neto Seco':lote.netoSeco,
              'Diferencia Humeda':lote.diferenciaHumeda,
              'Diferencia Seca':lote.diferenciaSeca
            })
          )
          const camionesRecepcionFormateados = camionesRecepcion.map(
            (camion:any) => ({
              'Fecha Despacho': camion.fOrigen,
              'Hora Despacho': camion.hOrigen,
              'Fecha Recepción': camion.fDestino,
              'Hora Recepción': camion.hDestino,
              'Referencia': camion.observacion,
              // 'N° de Lote': camion.posicion + 1,
              'Guía Despacho': camion.idTransporteOrigen,
              Patente: camion.idTransporteDestino,
              Batea: camion.idCarroDestino,
              'Bruto Despacho': camion.brutoOrigen,
              'Bruto Recepción': camion.brutoDestino,
              'Tara Despacho': camion.taraOrigen,
              'Tara Recepción': camion.taraDestino,
              'Neto Húmedo Despacho': camion.netoHumedoOrigen,
              'Neto Húmedo Recepción': camion.netoHumedoDestino,
              'Porcentaje Humedad': camion.porcHumedad,
              'Neto Seco': camion.netoSeco,
              'Diferencia Húmeda': camion.diferenciaHumeda,
              'Diferencia Seca': camion.diferenciaSeca,
              Bodega: camion.nombreBodega,
              'Sellos Despacho': camion.sellosOrigen,
              'Sellos de Destino': camion.sellosDestino,
              Estado: camion.estado,
            })
          );
          const resumenWorksheet = XLSX.utils.json_to_sheet(resumen);
          const worksheet = XLSX.utils.json_to_sheet(camionesRecepcionFormateados);
          
          if (worksheet['!rows']) {
            for (let i = 0; i < 4; i++) {
              worksheet['!rows'].push({}); // Agregar un objeto vacío en lugar de un arreglo vacío
            }
          }
          const workbook: any = {
            Sheets: { 'Camiones de Recepción': worksheet },
            SheetNames: ['Camiones de Recepción'],
          };
          // Agregar la tabla resumen al workbook
          (workbook.Sheets as any)['Resumen'] = resumenWorksheet;
          (workbook.SheetNames as any).unshift('Resumen');
          
          XLSX.utils.sheet_add_json((workbook.Sheets as any)['Resumen'], sumas, {
            header: [],
            skipHeader: false,
            origin: 'A' + (resumen.length + 6),
          });
    
          Notiflix.Notify.success('Documento de camiones descargado');
          XLSX.writeFile(workbook, 'Camiones de Recepción.xlsx');
  }



  
  private calcularNetoSeco(
    netoHumedoDestino: number,
    porcentajeHumedad: number
  ): number {
    if (porcentajeHumedad === 0 || !porcentajeHumedad) {
      return netoHumedoDestino;
    }
    const netoSeco =
      netoHumedoDestino - netoHumedoDestino * (porcentajeHumedad / 100);
    return parseFloat(netoSeco.toFixed(2));
  }

obtenerObservaciones(camionesRecepcion: any[]) {
  let ultimonLoteRevisado = '';
  let resultados = [];
  camionesRecepcion.forEach((camion: any) => {
    if (camion.nLote !== ultimonLoteRevisado) {
      this.loteService.getLoteBynLote(camion.nLote).subscribe((response) => {
        const lote = (response as any[])[0];
        camion.observacion = lote.observacion;
        ultimonLoteRevisado = camion.nLote;
        resultados.push(camion);
        if (resultados.length === camionesRecepcion.length) {
          this.camionesRecepcion = resultados;
        }
      });
    } else {
      resultados.push(camion);
    }
  });
}

obtenerNombreBodega(camionesRecepcion: any[]) {
  //buscar todas las bodegas
  this.bodegaService.getBodegas().subscribe((response) => {
    const bodegas = response as any[];
    console.log(bodegas);
    let resultados = [];
    camionesRecepcion.forEach((camion: any) => {
      const bodega = bodegas.find(
        (bodega: any) => bodega.idBodega === camion.bodega
      );
      if (bodega) {
        camion.nombreBodega = bodega.nombreBodega;
      }
      resultados.push(camion);
      if (resultados.length === camionesRecepcion.length) {
        this.camionesRecepcion = resultados;
      }
    });
  });
}

  private registrosPorNLote: any[] = [];
  private nLoteAnterior: any;

  getNroLote(camion: any): number {
    if (camion.nLote !== this.nLoteAnterior) {
      this.nLoteAnterior = camion.nLote;
      this.registrosPorNLote = [];
      console.log(this.nLoteAnterior);
      // this.http.get(`https://control.als-inspection.cl/api_min/api/recepcion-transporte/?nLote=${camion.nLote}/`)
      //   .subscribe(response => {
      //     this.registrosPorNLote = response as any[];
      //     console.log(this.registrosPorNLote);
      //   });
    } else {
      console.log('No hay cambios');
    }
    const posicion = this.registrosPorNLote.findIndex(
      (registro) => registro.id === camion.id
    );
    return posicion + 1;
  }

  calcularTotalCamiones() {
    return this.lotesResumen.reduce((suma : any, lote : any) => {
      return suma + lote.cantidadCamiones;
    }, 0);
  }
  calcularPesoNetoDespachoTotal() {
    return this.lotesResumen.reduce((suma:any, lote:any) => {
      return suma + parseFloat(lote.netoHumedoOrigen);
    }, 0).toFixed(2);
  }
  
  // Función para calcular el peso neto recepción total
  calcularPesoNetoRecepcionTotal() {
    return this.lotesResumen.reduce((suma:any, lote:any) => {
      return suma + parseFloat(lote.netoHumedoDestino);
    }, 0).toFixed(2);
  }

  calcularPesoNetoSecoTotal() {
    return this.lotesResumen.reduce((suma:any, lote:any) => {
      return suma + parseFloat(lote.netoSeco);
    }, 0).toFixed(2);
  }
  
  // Función para calcular la diferencia seca total
  calcularDiferenciaSecaTotal() {
    return this.lotesResumen.reduce((suma:any, lote:any) => {
      return suma + parseFloat(lote.diferenciaSeca);
    }, 0).toFixed(2);
  }

  calcularPromedioHumedades() {
    const lotesConHumedad = this.lotesResumen.filter((lote:any) => lote.porcHumedad !== 0);
    const sumaHumedades = lotesConHumedad.reduce((suma:any, lote:any) => {
      return suma + (parseFloat(lote.porcHumedad) || 0);
    }, 0);
    const totalCamiones = lotesConHumedad.length;
    return (sumaHumedades / totalCamiones).toFixed(2);
  }
  
}
