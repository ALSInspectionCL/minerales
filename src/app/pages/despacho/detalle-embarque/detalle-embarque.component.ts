import { bodega } from './../../../services/bodega.service';
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
  cantSubLotes: number;
  pesoTara: number;
  pesoNetoHumedo: number;
  pesoBrutoHumedo: number;
  porcHumedad: number;
  pesoNetoSeco: number;
  diferenciaPeso: number;
  nombreNave: string;
  bodegaNave: string;
  servicio: number;
  solicitud: number;
}

@Component({
  selector: 'app-detalle-embarque',
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
  templateUrl: './detalle-embarque.component.html',
  styleUrl: './detalle-embarque.component.scss',
})
export class DetalleEmbarqueComponent {
  dataSource1: any[] = [];
  nLote = '0';
  lote: any;
  rdespachoTransporteForm: FormGroup;
  admin: boolean;
  operator: boolean;
  apiLotes: 'https://control.als-inspection.cl/api_min/api/lote-despacho/';
  bodegaSeleccionada: any;
  bodegas: any;
  total: number;


  cantRegistros = 0;
  tipoTransporte = 'Embarque';
  cantSublotes = 0;
  totalSublotes = 0;
  odometrosIniciales = 0.0;
  odometrosFinales = 0.0;
  fechaPrimerRegistro = null;
  fechaUltimoRegistro = null;
  horaPrimerRegistro = null;
  horaUltimoRegistro = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { idServicio: number; idSolicitud: number; lote: any },
    private loteService: LoteService,
    private http: HttpClient,
    private dialog: MatDialog,
    private rolService: RolService,
    private despachoTransporteService: DespachoTransporteService
  ) {
    // Ahora puedes acceder a idServicio y idSolicitud a través de this.data
    console.log('ID Servicio:', this.data.idServicio);
    console.log('ID Solicitud:', this.data.idSolicitud);
    console.log('Numero de lote:', this.data.lote.nLote);
    let nLote = this.data.lote.nLote;
  }

  ngOnInit() {
    this.lote = this.data.lote;
    this.obtenerBodegas();
    this.nLote = this.lote.nLote;
    this.cargarDespachosEmbarque(this.nLote);
    this.admin = RolService.isTokenValid();
    this.rolService
      .hasRole(localStorage.getItem('email') || '', 'Operador')
      .subscribe((hasRole) => {
        if (hasRole) {
          console.log('El usuario tiene el rol de operator');
          this.operator = true;
        } else {
          console.log('El usuario no tiene el rol de operator');
          this.operator = false;
        }
      });

    // this.cargarDespachoTransporte(this.data.nLote);
    // console.log('Data de dataSource:');
    // console.log(this.dataSource1);
    // this.admin = RolService.isTokenValid();
    // this.rolService
    //   .hasRole(localStorage.getItem('email') || '', 'Operador')
    //   .subscribe((hasRole) => {
    //     if (hasRole) {
    //       console.log('El usuario tiene el rol de operator');
    //       this.operator = true;
    //     } else {
    //       console.log('El usuario no tiene el rol de operator');
    //       this.operator = false;
    //     }
    //   });
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

  cargarDespachosEmbarque(Nlote: string): void {
    this.despachoTransporteService.getEmbarqueBynLote(Nlote).subscribe(
      (data: any[]) => {
        this.dataSource1 = data;
        this.cantRegistros = this.dataSource1.length;



        // Inicializa los totales
        let totalSublotes = 0;
        let odometrosIniciales = 0;
        let odometrosFinales = 0;
        let fechaPrimerRegistro = null;
        let fechaUltimoRegistro = null;
        let horaPrimerRegistro = null;
        let horaUltimoRegistro = null;

        // Recorre cada registro y suma los valores correspondientes
        this.dataSource1.forEach((registro, index) => {
          totalSublotes += 1;

          if (index === 0) {
            fechaPrimerRegistro = registro.fechaInicial;
            horaPrimerRegistro = registro.horaInicial;
          }

          if (index === this.dataSource1.length - 1) {
            fechaUltimoRegistro = registro.fechaFinal;
            horaUltimoRegistro = registro.horaFinal;
          }

          odometrosIniciales += Number(registro.odometroInicial);
          odometrosFinales += Number(registro.odometroFinal);
        });

        this.totalSublotes = totalSublotes;
        this.odometrosIniciales =odometrosIniciales;
        this.odometrosFinales = odometrosFinales;

        // this.odometrosIniciales = Number(this.odometrosIniciales.toFixed(2));
        // this.odometrosFinales = Number(this.odometrosFinales.toFixed(2));

        this.obtenerFechasYHoras(data);

        console.log('Total Sublotes:', this.totalSublotes);
        console.log('Odometros Iniciales:', this.odometrosIniciales);
        console.log('Odometros Finales:', this.odometrosFinales);
        console.log('Fecha Primer Registro:', this.fechaPrimerRegistro);
        console.log('Fecha Ultimo Registro:', this.fechaUltimoRegistro);
        console.log('Hora Primer Registro:', this.horaPrimerRegistro);
        console.log('Hora Ultimo Registro:', this.horaUltimoRegistro);
      },
      (error: any) => {
        console.error('Error fetching data', error);
      }
    );
  }

  actualizarPorcentajeHumedad(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.porcHumedad = input.value; // Actualiza el valor de porcHumedad
  }

  obtenerFechasYHoras(data: any): void {
    console.log('Obteniendo fechas y horas');
    console.log('Data source:', data);
    if (data.length > 0) {
      const primerRegistro = data[0];
      const ultimoRegistro = data[data.length - 1];

      this.fechaPrimerRegistro = primerRegistro.fechaInicial;
      this.horaPrimerRegistro = primerRegistro.horaInicial;
      this.fechaUltimoRegistro = ultimoRegistro.fechaFinal;
      this.horaUltimoRegistro = ultimoRegistro.horaFinal;
    }
  }

  crearRegistro() {
    if (this.lote && this.bodegaSeleccionada) {
      const hoy = new Date();
      const horas = String(hoy.getHours()).padStart(2, '0'); // Asegura que las horas tengan 2 dígitos
      const minutos = String(hoy.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan 2 dígitos
      const hOrigen = `${horas}:${minutos}`; // Formatea la hora en hh:mm

      const nuevoRegistro = {
        nLote: this.lote.nLote,
        odometroInicial: 0,
        odometroFinal: 0,
        horaInicial: hOrigen,
        horaFinal: null,
        fechaInicial: hoy.toISOString().split('T')[0],
        fechaFinal: null,
        pesoLote: 0,
        porcHumedad: 0,
        estado: 'pendiente',
      };

      console.log(nuevoRegistro);
      this.cantRegistros += 1;

      // Guardar en la API
      this.despachoTransporteService.crearSubLote(nuevoRegistro).subscribe(
        (response) => {
          // Agregar a la lista local si es necesario
          this.dataSource1.push(response);
          this.actualizarLote();
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

  actualizarLote() {
    const cantSubLotes = this.dataSource1.length;

    const loteActualizado = {
      ...this.lote,
      cantSubLotes: cantSubLotes,
    };

    this.despachoTransporteService
      .actualizarLote(loteActualizado)
      .subscribe((response) => {
        console.log('Lote actualizado:', response);
        this.ngOnInit();
        Notiflix.Notify.success('Se ha actualizado el lote correctamente');
      });
  }

  onBodegaChange(event: MatSelectChange) {
    const bodegaSeleccionada = event.value; // Esto ahora es el objeto bodega completo
    console.log('Bodega seleccionada:', bodegaSeleccionada);
    this.bodegaSeleccionada = bodegaSeleccionada;
    this.total = bodegaSeleccionada.total;
  }

  abrirDialogoModificarRegistro(element: any) {
    console.log(element);
    this.wip();
    // const dialogRef = this.dialog.open(CrearRegistroDialog, {
    //   width: '80vh',
    //   height: '80vh',
    //   data: element, // Pasa el elemento seleccionado al diálogo
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     // Aquí puedes manejar el registro modificado, por ejemplo, actualizar la tabla
    //     console.log('Registro modificado:', result);
    //     this.ngOnInit();
    //     // Actualiza la fuente de datos de la tabla si es necesario
    //     this.dataSource1 = this.dataSource1.map((item) =>
    //       item.nLote === result.nLote ? result : item
    //     );
    //   }
    //   else {
    //     console.log('No se modificó el registro');
    //     this.ngOnInit();
    //   }
    // });
  }

  wip(){
    console.log('wip');
    Notiflix.Notify.warning('Funcionalidad en desarrollo');
  }
}




