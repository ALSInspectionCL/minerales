// import { LoteService } from './../../../services/lote.service';
import { Data } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, NgModule } from '@angular/core';
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
import {
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoteService } from 'src/app/services/lote.service';
import { DespachoTransporteService } from 'src/app/services/despacho.service';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { FiveDayRangeSelectionStrategy } from '../../formularios/formularios.component';
import Notiflix from 'notiflix';
import { HttpClient } from '@angular/common/http';
import { RolService } from 'src/app/services/rol.service';
import { map, Observable } from 'rxjs';
import moment from 'moment';
import { Bodega } from 'src/app/services/bodega.service';

export interface loteDespacho {
  id: number;
  nLote: string;
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

@Component({
  selector: 'app-detalle-lote',
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
  templateUrl: './detalle-lote.component.html',
  styleUrl: './detalle-lote.component.scss',
})
export class DetalleLoteComponent {
  dataSource1: any[] = [];
  nLote = '0';
  lote: any;
  rdespachoTransporteForm: FormGroup;
  admin: boolean;
  operator: boolean;
  encargado: boolean;
  apiLotes: 'https://control.als-inspection.cl/api_min/api/lote-despacho/';
  totalCamiones = 0;
  totalVagones = 0;
  totalBrutoHumedo = 0;
  totalNetoHumedo = 0;
  totalNetoSeco = 0;
  totalTara = 0;
  totalDiferencias = 0;
  bodegaSeleccionada: any;
  bodegas: any;
  total: number;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      idServicio: number;
      idSolicitud: number;
      nLote: string;
      numero: number;
    },
    private loteService: LoteService,
    private http: HttpClient,
    private dialog: MatDialog,
    private rolService: RolService,
    private despachoTransporteService: DespachoTransporteService
  ) {
    // Ahora puedes acceder a idServicio y idSolicitud a través de this.data
    console.log('ID Servicio:', this.data.idServicio);
    console.log('ID Solicitud:', this.data.idSolicitud);
    console.log('Numero de lote:', this.data.nLote);
    this.nLote = this.data.nLote;
  }
  ngOnInit() {
    console.log(this.data);
    this.obtenerBodegas();
    this.nLote = this.data.nLote;
    this.cargarLote();
    this.cargarDespachoTransporte(this.data.nLote);
    console.log('Data de dataSource:');
    console.log(this.dataSource1);
    this.rolService
      .getRoles(localStorage.getItem('email') || '')
      .subscribe((roles) => {
        if (roles.includes('Admin')) {
          this.admin = true;
          this.operator = false;
          this.encargado = false;
          return;
        } else if (roles.includes('Operador')) {
          this.operator = true;
          this.admin = false;
          this.encargado = false;
          return;
        } else if (roles.includes('Encargado')) {
          this.encargado = true;
          this.admin = false;
          this.operator = false;
          return;
        } else {
          this.admin = false;
          this.operator = false;
          this.encargado = false;
        }
      });
  }

  obtenerBodegas() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/bodega/'; // Cambia la URL según API
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.bodegas = data;
        this.bodegaSeleccionada = this.bodegas[0]; // Selecciona la primera bodega por defecto
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener servicios', error);
      }
    );
  }

  onBodegaChange(event: MatSelectChange) {
    const bodegaSeleccionada = event.value; // Esto ahora es el objeto bodega completo
    console.log('Bodega seleccionada:', bodegaSeleccionada);
    this.bodegaSeleccionada = bodegaSeleccionada;
    this.total = bodegaSeleccionada.total;
  }

  cargarLote(): any {
    console.log('Cargar lote:', this.nLote);
    let lotebuscado: any;
    this.loteService.getLoteByNLoteDes(this.nLote).subscribe(
      (response: loteDespacho[]) => {
        console.log('Respuesta del servicio:', response);
        if (response.length > 0) {
          // LoteBuscado es el lote que tenga el mismo nLote
          lotebuscado = response.filter((lote) => lote.nLote === this.nLote);
          this.lote = lotebuscado[0]; // Asignar el primer lote encontrado
        } else {
          this.lote = null;
          console.log('Lote no cargado');
        }
        console.log('Lote cargado:', this.lote);
        return this.lote; // Retorna el lote cargado
      },
      (error) => {
        console.error('Error al cargar el lote:', error);
        this.lote = null;
      }
    );
  }

  cargarDespachoTransporte(Nlote: string): void {
    this.despachoTransporteService
      .getDespachoTransporteBynLote(Nlote)
      .subscribe(
        (data: any[]) => {
          this.dataSource1 = data;

          // Inicializa los totales
          let totalCamiones = 0;
          let totalVagones = 0;
          let totalBrutoHumedo = 0;
          let totalNetoHumedo = 0;
          let totalNetoSeco = 0;
          let totalTara = 0;
          let totalDiferencias = 0;

          // Recorre cada registro y suma los valores correspondientes
          this.dataSource1.forEach((registro) => {
            totalCamiones += 1;
            totalBrutoHumedo += Number(registro.brutoDestino) || 0; // Asegúrate de que estas propiedades existan
            totalNetoHumedo += Number(registro.netoHumedoDestino || 0);
            totalNetoSeco += Number(registro.pesoNetoSeco || 0);
            totalTara += Number(registro.taraDestino) || 0;
            totalDiferencias += Number(registro.diferenciaHumeda) || 0; // Asegúrate de que esta propiedad exista
          });

          this.totalCamiones = totalCamiones;
          this.totalVagones = totalVagones;
          this.totalBrutoHumedo = totalBrutoHumedo;
          this.totalNetoHumedo = totalNetoHumedo;
          this.totalNetoSeco =
            totalNetoHumedo - (this.lote.porcHumedad / 100) * totalNetoHumedo;
          this.totalTara = totalTara;
          this.totalDiferencias = totalDiferencias;

          console.log('Total Camiones:', this.totalCamiones);
          console.log('Total Vagones:', this.totalVagones);
          console.log('Total Bruto Húmedo:', this.totalBrutoHumedo);
          console.log('Total Neto Húmedo:', this.totalNetoHumedo);
          console.log('Total Neto Seco:', this.totalNetoSeco);
          console.log('Total Tara:', this.totalTara);
          console.log('Total Diferencias:', this.totalDiferencias);
        },
        (error: any) => {
          console.error('Error fetching data', error);
        }
      );
  }

  guardarLote(): void {
    if (this.lote) {
      console.log(this.lote);
      this.lote.porcHumedad = +this.lote.porcHumedad;

      // Asignar los totales calculados a las propiedades del lote
      this.lote.cantCamiones = this.totalCamiones || 0;
      this.lote.cantVagones = this.totalVagones || 0;
      this.lote.cantBigBag = 0;
      this.lote.pesoBrutoHumedo = parseFloat(this.totalBrutoHumedo.toFixed(2));
      this.lote.pesoNetoHumedo = parseFloat(this.totalNetoHumedo.toFixed(2));
      this.lote.pesoNetoSeco = parseFloat(this.totalNetoSeco.toFixed(2));
      this.lote.pesoTara = parseFloat(this.totalTara.toFixed(2));
      this.lote.diferenciaPeso = parseFloat(this.totalDiferencias.toFixed(2));

      this.despachoTransporteService.actualizarLote(this.lote).subscribe(
        (response) => {
          console.log('Lote actualizado:', response);
          Notiflix.Notify.success('Lote actualizado correctamente');
          this.ngOnInit();
          // Aquí puedes hacer otras acciones, como recargar datos si es necesario
        },
        (error) => {
          console.error('Error al actualizar el lote:', error);
          Notiflix.Notify.failure('Error al actualizar el lote');
        }
      );
    } else {
      console.error('No se puede guardar el lote, lote no cargado.');
    }
  }

  actualizarPorcentajeHumedad(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.porcHumedad = input.value; // Actualiza el valor de porcHumedad
  }

  abrirDialogoModificarRegistro(element: any) {
    console.log(element);
    const dialogRef = this.dialog.open(CrearRegistroDialog, {
      width: '80vh',
      height: '80vh',
      data: element, // Pasa el elemento seleccionado al diálogo
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Aquí puedes manejar el registro modificado, por ejemplo, actualizar la tabla
        console.log('Registro modificado:', result);
        this.ngOnInit();
        // Actualiza la fuente de datos de la tabla si es necesario
        this.dataSource1 = this.dataSource1.map((item) =>
          item.nLote === result.nLote ? result : item
        );
      } else {
        console.log('No se modificó el registro');
        this.ngOnInit();
      }
    });
  }

  formatDate(dateString: string): string {
    const parts = dateString.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convierte a formato YYYY-MM-DD
  }

  crearRegistro() {
    console.log(this.lote);
    if (this.lote && this.bodegaSeleccionada) {
      const hoy = new Date();
      const horas = String(hoy.getHours()).padStart(2, '0'); // Asegura que las horas tengan 2 dígitos
      const minutos = String(hoy.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan 2 dígitos
      const hOrigen = `${horas}:${minutos}`; // Formatea la hora en hh:mm

      const nuevoRegistro = {
        nLote: this.lote.nLote,
        fOrigen: hoy.toISOString().split('T')[0],
        hOrigen: hOrigen,
        guiaDespacho: this.lote.tipoTransporte,
        sellosOrigen: 0,
        netoHumedoOrigen: 0,
        camion: 0,
        fDestino: null,
        hDestino: null,
        batea: 0,
        pvsa: 0,
        brutoDestino: 0,
        taraDestino: 0,
        netoHumedoDestino: 0,
        diferenciaHumeda: 0,
        diferenciaSeca: 0,
        estado: 'pendiente',
        bodega: this.bodegaSeleccionada.idBodega,
      };

      // const nuevoRegistro = {
      //   fDespacho: hoy.toISOString().split('T')[0],
      //   hDespacho: hOrigen,
      //   nServicio: 0,
      //   nCamion: 0,
      //   patenteCamion: '',
      //   guiaDespacho: '',
      //   taraCamion: 0,
      //   pesoBrutoCamion: 0,
      //   pesoNeto: 0,
      //   nLote: this.lote.nLote,
      //   estado: 'pendiente',
      // };

      console.log(nuevoRegistro);

      // Guardar en la API
      this.despachoTransporteService
        .crearDespachoTransporte(nuevoRegistro)
        .subscribe(
          (response) => {
            // Agregar a la lista local si es necesario
            this.dataSource1.push(response);

            // Actualizar el lote correspondiente
            this.actualizarLote(nuevoRegistro.nLote);

            console.log('Registro guardado:', response);
            this.ngOnInit();
            // Mostrar notificación de éxito
            Notiflix.Notify.success('Se ha guardado correctamente');
          },
          (error) => {
            console.error('Error al guardar el registro:', error);
            // Mostrar notificación de error
            Notiflix.Notify.failure('Error al guardar el registro');
          }
        );
    } else {
      if (!this.bodegaSeleccionada) {
        Notiflix.Notify.warning('Debes seleccionar una bodega para continuar');
      } else {
        console.error('No se puede crear el registro, lote no cargado.');
      }
    }
  }

  actualizarLote(nLote: string) {
    // Paso 1: Cargar el lote
    let lote = this.lote;
    if (!lote) {
      console.error('No se puede actualizar el lote, no se ha cargado.');
      return;
    }
    // Paso 2: Actualizar el lote
    // Filtrar los registros de rdespachoTransporte que coincidan con el nLote
    const registrosFiltrados = this.dataSource1.filter(
      (registro) => registro.nLote === lote.nLote
    );

    // Calcular los valores requeridos
    const cantCamiones = registrosFiltrados.filter(
      (registro) => registro.tipoTransporte === 'camion'
    ).length;

    const cantVagones = registrosFiltrados.filter(
      (registro) => registro.tipoTransporte === 'vagon'
    ).length;

    const pesoNetoHumedo = registrosFiltrados.reduce(
      (total, registro) => total + registro.pesoNetoHumedoOrigen,
      0
    );

    const pesoTara = registrosFiltrados.reduce(
      (total, registro) => total + registro.pesoTara,
      0
    );

    const pesoBrutoHumedo = pesoNetoHumedo + pesoTara;

    const porcHumedad =
      registrosFiltrados.length > 0
        ? registrosFiltrados[0].porcHumedad // Asumiendo que todos tienen el mismo porcentaje de humedad
        : 0;

    const pesoNetoSeco = pesoNetoHumedo - pesoNetoHumedo * (porcHumedad / 100);

    const diferenciaPeso = registrosFiltrados.reduce(
      (total, registro) => total + registro.diferencia,
      0
    );

    // Actualizar los campos del lote
    lote.cantCamiones = cantCamiones;
    lote.cantVagones = cantVagones;
    lote.pesoNetoHumedo = pesoNetoHumedo;
    lote.pesoTara = pesoTara;
    lote.pesoBrutoHumedo = pesoBrutoHumedo;
    lote.pesoNetoSeco = pesoNetoSeco;
    lote.diferenciaPeso = diferenciaPeso;
    console.log(lote);

    // Realizar la llamada HTTP para actualizar el lote
    return this.http.put(`${this.apiLotes}${this.lote.id}/`, lote).subscribe(
      (response) => {
        console.log('Lote actualizado correctamente', response);
      },
      (error) => {
        console.error('Error al actualizar el lote', error);
      }
    );
  }

  formatTime(hora: string | number): string {
    if (!hora) return '';

    const date = new Date(typeof hora === 'string' ? hora : hora * 1000);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  actualizarValorLote(nLote: string, nuevoValor: number): void {
    // Paso 1: Cargar el lote
    this.loteService.getLoteBynLote(nLote).subscribe(
      (response: loteDespacho[]) => {
        if (response.length > 0) {
          // Paso 2: Modificar el dato que deseas cambiar
          const lote = response[0]; // Suponiendo que siempre obtendrás un array
          lote.porcHumedad = nuevoValor; // Modifica el campo que desees

          // Paso 3: Guardar el lote modificado de nuevo en la API
          this.http.put(`${this.apiLotes}${lote.id}/`, lote).subscribe(
            (response) => {
              console.log('Lote actualizado correctamente', response);
              Notiflix.Notify.success('Lote actualizado correctamente');
            },
            (error) => {
              console.error('Error al actualizar el lote', error);
              Notiflix.Notify.failure('Error al actualizar el lote');
            }
          );
        } else {
          console.error('Lote no encontrado');
          Notiflix.Notify.failure('Lote no encontrado');
        }
      },
      (error) => {
        console.error('Error al cargar el lote', error);
        Notiflix.Notify.failure('Error al cargar el lote');
      }
    );
  }

  wip() {
    Notiflix.Notify.warning('Función en desarrollo');
  }
}

@Component({
  selector: 'app-registro-dialog',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
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
    MatDatepickerModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
  templateUrl: 'crear-registro-dialog.html',
})
export class CrearRegistroDialog {
  despachoTransporteForm: FormGroup;
  numeroCamion = 0;
  admin: boolean;
  operator: boolean;
  encargado: boolean;
  lote: any;
  porcentajeHumedad = 0;
  ngOnInit(): void {
        this.rolService
      .getRoles(localStorage.getItem('email') || '')
      .subscribe((roles) => {
        if (roles.includes('Admin')) {
          this.admin = true;
          this.operator = false;
          this.encargado = false;
          return;
        } else if (roles.includes('Operador')) {
          this.operator = true;
          this.admin = false;
          this.encargado = false;
          return;
        } else if (roles.includes('Encargado')) {
          this.encargado = true;
          this.admin = false;
          this.operator = false;
          return;
        } else {
          this.admin = false;
          this.operator = false;
          this.encargado = false;
        }
      });
    this.cargarLote();
    console.log('El lote es: ' + this.lote);
    this.despachoTransporteForm.valueChanges.subscribe((changes) => {
      const valorPesoBruto =
        this.despachoTransporteForm.get('brutoDestino')?.value;
      const valorPesoTara =
        this.despachoTransporteForm.get('taraDestino')?.value;
      const valorPesoNeto =
        this.despachoTransporteForm.get('netoHumedoDestino')?.value;

      if (valorPesoBruto && valorPesoTara) {
        const diferenciaPeso = valorPesoBruto - valorPesoTara - valorPesoNeto;
        const diferenciaHumeda = valorPesoNeto - valorPesoTara;
        const diferenciaSeca =
          valorPesoNeto - valorPesoNeto * (this.porcentajeHumedad / 100);

        this.despachoTransporteForm.patchValue(
          {
            diferenciaHumeda: diferenciaHumeda,
            diferenciaSeca: diferenciaSeca,
            diferenciaPeso: diferenciaPeso,
          },
          { emitEvent: false } // Evita que se dispare valueChanges nuevamente
        );
      }
    });
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private rolService: RolService,
    private http: HttpClient,
    private fb: FormBuilder,
    private loteService: LoteService,
    private bodegaService: Bodega,
    private dialogRef: MatDialogRef<CrearRegistroDialog>
  ) {
    this.despachoTransporteForm = this.fb.group({
      tipoTransporte: ['Camion', Validators.required],
      nLote: [this.data.nLote, Validators.required],
      fOrigen: [this.data.fOrigen, Validators.required],
      hOrigen: [this.data.hOrigen, Validators.required],
      guiaDespacho: [this.data.guiaDespacho],
      sellosOrigen: [this.data.sellosOrigen],
      netoHumedoOrigen: [this.data.netoHumedoOrigen],
      camion: [this.data.camion],
      fDestino: [this.data.fDestino],
      hDestino: [this.data.hDestino],
      batea: [this.data.batea],
      pvsa: [this.data.pvsa],
      brutoDestino: [this.data.brutoDestino],
      taraDestino: [this.data.taraDestino],
      netoHumedoDestino: [this.data.netoHumedoDestino],
      diferenciaHumeda: [this.data.diferenciaHumeda],
      diferenciaSeca: [this.data.diferenciaSeca],
      bodega: [this.data.bodega],
      estado: [this.data.estado],
    });
  }

  // Función para formatear la fecha
  formatDateToString(date: Date): string {
    const year = date.getFullYear(); // Obtiene el año
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtiene el mes (0-11) y lo convierte a 1-12
    const day = String(date.getDate()).padStart(2, '0'); // Obtiene el día del mes

    return `${year}-${month}-${day}`; // Devuelve la fecha en formato YYYY-MM-DD
  }

  onSubmit(): void {
    if (this.despachoTransporteForm.valid) {
      const pesoBrutoCamion =
        this.despachoTransporteForm.get('brutoDestino')?.value;
      const taraCamion = this.despachoTransporteForm.get('taraDestino')?.value;
      let pesoNeto: number = 0;
      // Calcular la diferencia húmeda si ambos valores son diferentes de 0
      if (pesoBrutoCamion > 0 && taraCamion > 0) {
        pesoNeto = pesoBrutoCamion - taraCamion;
      } else {
        pesoNeto = 0;
      }
      const registroModificado = {
        ...this.despachoTransporteForm.value,
        pesoNeto: pesoNeto,
      };
      console.log(this.despachoTransporteForm.value);
      Notiflix.Confirm.show(
        'Guardar Registro',
        '¿Esta seguro de guardar el registro?',
        'Yes',
        'No',
        () => {
          const id = this.data.id;
          this.http
            .put(
              `https://control.als-inspection.cl/api_min/api/despacho-camion/${id}/`,
              registroModificado
            )
            .subscribe(
              (response) => {
                console.log('Registro guardado:', response);
                // Cerrar el diálogo o realizar otras acciones
                this.dialogRef.close(true);
                Notiflix.Notify.success('Se ha guardado el registro');
              },
              (error) => {
                Notiflix.Notify.failure('No se ha guardado el registro');
                console.error('Error al guardar el registro:', error);
              }
            );
        },
        () => {
          Notiflix.Notify.failure('No se ha guardado el registro');
        },
        {}
      );
      // Aquí puedes agregar la lógica para enviar el formulario
    } else {
      Notiflix.Notify.failure('No se ha guardado el registro');
    }
  }

  guardar() {
    const valorFOrigen = this.despachoTransporteForm.get('fOrigen')?.value;
    // Convertir a Date si es necesario
    if (valorFOrigen) {
      let fechaDestino: Date;
      if (typeof valorFOrigen === 'string' && valorFOrigen.includes('-')) {
        fechaDestino = new Date(valorFOrigen);
      } else {
        fechaDestino = valorFOrigen; // Asumimos que ya es un objeto Date
      }
      const fechaFormateada = this.formatDateToString(fechaDestino);
      this.despachoTransporteForm.controls['fOrigen'].setValue(fechaFormateada);
    }

    if (valorFOrigen) {
      let fechaDestino: moment.Moment;
      if (typeof valorFOrigen === 'string' && valorFOrigen.includes('-')) {
        fechaDestino = moment(valorFOrigen, 'YYYY-MM-DD');
      } else {
        fechaDestino = moment(valorFOrigen);
      }
      const fechaFormateada = fechaDestino.format('YYYY-MM-DD');
      this.despachoTransporteForm.controls['fOrigen'].setValue(fechaFormateada);
    }

    const valorFDestino = this.despachoTransporteForm.get('fDestino')?.value;
    console.log('Valor de fDestino:', valorFDestino);
    // Convertir a Date si es necesario
    if (valorFDestino) {
      let fechaDestino: Date;
      if (typeof valorFDestino === 'string' && valorFDestino.includes('-')) {
        fechaDestino = new Date(valorFDestino);
      } else {
        fechaDestino = valorFDestino; // Asumimos que ya es un objeto Date
      }
      const fechaFormateada = this.formatDateToString(fechaDestino);
      this.despachoTransporteForm.controls['fDestino'].setValue(
        fechaFormateada
      );
    }

    if (valorFDestino) {
      let fechaDestino: moment.Moment;
      if (typeof valorFDestino === 'string' && valorFDestino.includes('-')) {
        fechaDestino = moment(valorFDestino, 'YYYY-MM-DD');
      } else {
        fechaDestino = moment(valorFDestino);
      }
      const fechaFormateada = fechaDestino.format('YYYY-MM-DD');
      this.despachoTransporteForm.controls['fDestino'].setValue(
        fechaFormateada
      );
    }

    const pesoBrutoCamion =
      this.despachoTransporteForm.get('pesoBrutoCamion')?.value;
    const taraCamion = this.despachoTransporteForm.get('taraCamion')?.value;
    let pesoNeto: number = 0;
    // Calcular la diferencia si ambos valores son diferentes de 0
    if (pesoBrutoCamion > 0 && taraCamion > 0) {
      pesoNeto = pesoBrutoCamion - taraCamion;
    } else {
      pesoNeto = 0;
    }
    const registroModificado = {
      ...this.despachoTransporteForm.value,
      pesoNeto: pesoNeto,
    };
    console.log(registroModificado);
    Notiflix.Confirm.show(
      'Guardar Registro',
      '¿Esta seguro de guardar el registro?',
      'Yes',
      'No',
      () => {
        const id = this.data.id;
        this.http
          .put(
            'https://control.als-inspection.cl/api_min/api/despacho-camion/' +
              id +
              '/',
            registroModificado
          )
          .subscribe((response) => {
            console.log('Registro guardado:', response);
            Notiflix.Notify.success('Se ha guardado el registro');
          });
      },
      () => {
        Notiflix.Notify.failure('No se ha guardado el registro');
      },
      {}
    );
  }

  onCancel(): void {
    this.onNoClick();
  }

  onNoClick(): void {
    this.dialogRef.close(); // Cierra el diálogo sin devolver valor
  }

  setFechaActual() {
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia}/${mes}/${anio}`;
  }

  cargarLote(): any {
    console.log('Cargar lote:', this.data.nLote);
    let lotebuscado: loteDespacho;
    this.loteService.getLoteBynLote(this.data.nLote).subscribe(
      (response: loteDespacho[]) => {
        console.log('Respuesta del servicio:', response);
        if (response.length > 0) {
          console.log('guardando lote');
          this.lote = response[0];
          this.porcentajeHumedad = +this.lote.porcHumedad;
          console.log('porc humedad: ' + this.porcentajeHumedad);
          lotebuscado = response[0];
        } else {
          console.log('No se encontró el lote');
          this.lote = null;
        }
        console.log('Lote cargado:', this.lote);
        return lotebuscado;
      },
      (error) => {
        console.error('Error al cargar el lote:', error);
        this.lote = null;
      }
    );
  }

  aprobar() {
    console.log(this.despachoTransporteForm.value);
    if (this.despachoTransporteForm.valid) {
      const valorFDestino = this.despachoTransporteForm.get('fDestino')?.value;
      const valorFOrigen = this.despachoTransporteForm.get('fOrigen')?.value;
      // Convertir a Date si es necesario
      if (valorFDestino) {
        let fechaDestino: Date;
        if (typeof valorFDestino === 'string' && valorFDestino.includes('-')) {
          fechaDestino = new Date(valorFDestino);
        } else {
          fechaDestino = valorFDestino; // Asumimos que ya es un objeto Date
        }
        const fechaFormateada = this.formatDateToString(fechaDestino);
        this.despachoTransporteForm.controls['fDestino'].setValue(
          fechaFormateada
        );
      }
      if (valorFOrigen) {
        let fechaOrigen: moment.Moment;
        if (typeof valorFOrigen === 'string' && valorFOrigen.includes('-')) {
          fechaOrigen = moment(valorFOrigen, 'YYYY-MM-DD');
        } else {
          fechaOrigen = moment(valorFOrigen);
        }
        const fechaFormateada1 = fechaOrigen.format('YYYY-MM-DD');
        this.despachoTransporteForm.controls['fOrigen'].setValue(
          fechaFormateada1
        );
      }

      if (valorFDestino) {
        let fechaDestino: moment.Moment;
        if (typeof valorFDestino === 'string' && valorFDestino.includes('-')) {
          fechaDestino = moment(valorFDestino, 'YYYY-MM-DD');
        } else {
          fechaDestino = moment(valorFDestino);
        }
        const fechaFormateada = fechaDestino.format('YYYY-MM-DD');
        this.despachoTransporteForm.controls['fDestino'].setValue(
          fechaFormateada
        );
      }

      let diferenciaHumeda = this.calcularDifHumeda();
      let diferenciaSeca = this.calcularDifSeca();

      console.log('Diferencia Húmeda:', diferenciaHumeda);
      console.log('Diferencia Seca:', diferenciaSeca);
      const registroModificado = {
        ...this.despachoTransporteForm.value,
        diferenciaHumeda: diferenciaHumeda,
        diferenciaSeca: diferenciaSeca,
        estado: 'aprobado',
      };
      console.log(this.despachoTransporteForm.value);
      Notiflix.Confirm.show(
        'Guardar Registro',
        '¿Esta seguro de guardar el registro?',
        'Yes',
        'No',
        () => {
          const id = this.data.id;
          const totalNetoHumedo = this.data.netoHumedoDestino;

          this.ingresoDetalleBodega(totalNetoHumedo, registroModificado.bodega);
          this.calcularTotalBodega(totalNetoHumedo, registroModificado.bodega);
          this.http
            .put(
              `https://control.als-inspection.cl/api_min/api/despacho-camion/${id}/`,
              registroModificado
            )
            .subscribe(
              (response) => {
                console.log('Registro guardado:', response);
                // Cerrar el diálogo o realizar otras acciones
                this.dialogRef.close(true);
                Notiflix.Notify.success('Se ha guardado el registro');
              },
              (error) => {
                Notiflix.Notify.failure('No se ha guardado el registro');
                console.error('Error al guardar el registro:', error);
              }
            );
        },
        () => {
          Notiflix.Notify.failure('No se ha guardado el registro');
        },
        {}
      );
      // Aquí puedes agregar la lógica para enviar el formulario
    } else {
      Notiflix.Notify.failure('No se ha guardado el registro');
    }
  }

  calcularDifHumeda(): number {
    const valorNetoHumedoOrigen =
      this.despachoTransporteForm.get('netoHumedoOrigen')?.value;
    const valorNetoHumedoDestino =
      this.despachoTransporteForm.get('netoHumedoDestino')?.value;
    let diferenciaHumeda = 0;

    // Calcular la diferencia húmeda si ambos valores son diferentes de 0
    if (valorNetoHumedoOrigen > 0 && valorNetoHumedoDestino > 0) {
      diferenciaHumeda = valorNetoHumedoOrigen - valorNetoHumedoDestino;
      diferenciaHumeda = Number(diferenciaHumeda.toFixed(2));
      console.log('la diferencia humeda es: ', diferenciaHumeda);
      return Number(diferenciaHumeda);
    } else {
      console.log('No se calculo la diferencia seca');
      return 0;
    }
  }

  calcularDifSeca(): number {
    const valorNetoHumedoOrigen =
      this.despachoTransporteForm.get('netoHumedoOrigen')?.value;
    const valorNetoHumedoDestino =
      this.despachoTransporteForm.get('netoHumedoDestino')?.value;
    let diferenciaHumeda = this.calcularDifHumeda();
    let diferenciaSeca = 0;

    // Calcular la diferencia húmeda si ambos valores son diferentes de 0
    if (valorNetoHumedoOrigen > 0 && valorNetoHumedoDestino > 0) {
      diferenciaSeca =
        diferenciaHumeda -
        (diferenciaHumeda * this.porcentajeHumedad * 1) / 100;
      diferenciaSeca = Number(diferenciaSeca.toFixed(2));
      console.log('la diferencia seca es: ' + diferenciaSeca);
      return Number(diferenciaSeca);
    } else {
      console.log('No se calculo la diferencia seca');
      return 0;
    }
  }

  calcularNetoHumedo(): number {
    const valorPesoBruto =
      this.despachoTransporteForm.get('brutoDestino')?.value;
    const valorPesoTara = this.despachoTransporteForm.get('taraDestino')?.value;
    const valorPesoNeto = valorPesoBruto - valorPesoTara;
    console.log(valorPesoNeto.toFixed(2));
    return Number(valorPesoNeto.toFixed(2));
  }

  ingresoDetalleBodega(diferenciaSeca: number, bodega: number) {
    this.bodegaService
      .crearDetalleBodega('Despacho', 0, diferenciaSeca, bodega)
      .subscribe(
        (response: any) => {
          console.log('Detalle de bodega creado:', response);
        },
        (error: any) => {
          console.error('Error al crear el detalle de bodega:', error);
        }
      );
  }

  calcularTotalBodega(diferenciaSeca: number, idBodega: number) {
    //buscar el total actual de la bodega
    this.bodegaService.obtenerTotalBodega(idBodega).subscribe(
      (response: { total: any }) => {
        console.log('Total almacenado en bodega:', response.total);
        //sumar el total antiguo con la diferencia seca
        const totalBodega = Number(response.total) - Number(diferenciaSeca);
        console.log(totalBodega);
        //guardar el registro
        this.bodegaService
          .modificarTotalBodega(idBodega, totalBodega)
          .subscribe(
            (response: any) => {
              console.log('Total modificado:', response);
            },
            (error: any) => {
              console.error('Error al modificar el total:', error);
            }
          );
      },
      (error: any) => {
        console.error('Error al obtener el total de la bodega:', error);
      }
    );
  }
}
