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
  encargado: boolean;
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
  sumaPesos = 0;
  fechaPrimerRegistro = null;
  fechaUltimoRegistro = null;
  horaPrimerRegistro = null;
  horaUltimoRegistro = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      idServicio: number;
      idSolicitud: number;
      lote: any;
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
    this.rolService
      .hasRole(localStorage.getItem('email') || '', 'Encargado')
      .subscribe((hasRole) => {
        if (hasRole) {
          this.encargado = true;
          console.log('El usuario tiene el rol de Encargado');
        } else {
          this.encargado = false;
          console.log('El usuario no tiene el rol de Encargado');
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
        let sumaPesos = 0;  

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

          sumaPesos += Number(registro.pesoLote);
          odometrosIniciales += Number(registro.odometroInicial);
          odometrosFinales += Number(registro.odometroFinal);
        });

        this.totalSublotes = totalSublotes;
        this.odometrosIniciales = odometrosIniciales;
        this.odometrosFinales = odometrosFinales;
        this.sumaPesos = sumaPesos

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
      pesoNetoHumedo: this.sumaPesos,

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

  wip() {
    console.log('wip');
    Notiflix.Notify.warning('Funcionalidad en desarrollo');
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
  embarqueTransporteForm: FormGroup;
  numeroCamion = 0;
  admin: boolean;
  operator: boolean;
  encargado: boolean;
  lote: any;
  porcentajeHumedad = 0;
  // ngOnInit(): void {
  //   this.admin = RolService.isTokenValid();
  //   this.cargarLote();
  //   console.log('El lote es: ' + this.lote);
  //   this.despachoTransporteForm.valueChanges.subscribe((changes) => {
  //     const valorPesoBruto = this.despachoTransporteForm.get('brutoDestino')?.value;
  //     const valorPesoTara = this.despachoTransporteForm.get('taraDestino')?.value;
  //     const valorPesoNeto = this.despachoTransporteForm.get('netoHumedoDestino')?.value;

  //     if (valorPesoBruto && valorPesoTara) {
  //       const diferenciaPeso = valorPesoBruto - valorPesoTara - valorPesoNeto;
  //       const diferenciaHumeda = valorPesoNeto - valorPesoTara;
  //       const diferenciaSeca = valorPesoNeto - valorPesoNeto * (this.porcentajeHumedad / 100);

  //       this.despachoTransporteForm.patchValue(
  //         {
  //           diferenciaHumeda: diferenciaHumeda,
  //           diferenciaSeca: diferenciaSeca,
  //           diferenciaPeso: diferenciaPeso,
  //         },
  //         { emitEvent: false } // Evita que se dispare valueChanges nuevamente
  //       );
  //     }
  //   });
  // }

  ngOnInit(): void {
    this.admin = RolService.isTokenValid();
    this.rolService
      .hasRole(localStorage.getItem('email') || '', 'Operador')
      .subscribe((hasRole) => {
        if (hasRole) {
          this.operator = true;
          console.log('El usuario tiene el rol de Operador');
        } else {
          this.operator = false;
          console.log('El usuario no tiene el rol de Operador');
        }
      });
    this.rolService
      .hasRole(localStorage.getItem('email') || '', 'Encargado')
      .subscribe((hasRole) => {
        if (hasRole) {
          this.encargado = true;
          console.log('El usuario tiene el rol de Encargado');
        } else {
          this.encargado = false;
          console.log('El usuario no tiene el rol de Encargado');
        }
      });
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    private loteService: LoteService,
    private rolService: RolService,
    private bodegaService: Bodega,
    private dialogRef: MatDialogRef<CrearRegistroDialog>
  ) {
    this.embarqueTransporteForm = this.fb.group({
      id: [this.data.id],
      nLote: [this.data.nLote, Validators.required],
      odometroInicial: [this.data.odometroInicial],
      odometroFinal: [this.data.odometroFinal],
      horaInicial: [this.data.horaInicial],
      horaFinal: [this.data.horaFinal],
      fechaInicial: [new Date(this.data.fechaInicial)],
      fechaFinal: [new Date(this.data.fechaFinal)],
      pesoLote: [this.data.pesoLote],
      porcHumedad: [this.data.porcHumedad],
      estado: [this.data.estado],
    });
    this.embarqueTransporteForm = this.fb.group({
      id: [this.data.id],
      nLote: [this.data.nLote, Validators.required],
      odometroInicial: [this.data.odometroInicial],
      odometroFinal: [this.data.odometroFinal],
      horaInicial: [this.data.horaInicial],
      horaFinal: [this.data.horaFinal],
      fechaInicial: [this.parseDate(this.data.fechaInicial) || null],
      fechaFinal: [this.parseDate(this.data.fechaFinal) || null],
      pesoLote: [this.data.pesoLote],
      porcHumedad: [this.data.porcHumedad],
      estado: [this.data.estado],
    });
  }

  parseDate(dateString: string): Date {
    if (!dateString) {
      return new Date();
    } else {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  }

  // Función para formatear la fecha
  formatDate(dateString: Date): string {
    const fecha = new Date(dateString);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const anio = fecha.getFullYear();

    const fechaFormateada = `${anio}-${mes}-${dia}`;
    return fechaFormateada;
  }

  onSubmit(): void {
    if (this.embarqueTransporteForm.valid) {
      // Enviar el formulario a la API
      console.log('Formulario enviado:', this.embarqueTransporteForm.value);
      this.http
        .put(
          'https://control.als-inspection.cl/api_min/api/despacho-embarque/' +
            this.embarqueTransporteForm.value.id +
            '/',
          this.embarqueTransporteForm.value
        )
        .subscribe(
          (response) => {
            console.log('Formulario enviado correctamente:', response);
            Notiflix.Notify.success('Embarque guardado correctamente');
            this.dialogRef.close();
          },
          (error) => {
            console.error('Error al enviar el formulario:', error);
            Notiflix.Notify.failure('Error al enviar el formulario');
          }
        );
    } else {
      Notiflix.Notify.failure('El formulario no es válido');
    }
  }

  // guardar() {
  //   const formData = this.embarqueTransporteForm.value;
  //   const fechaFormateada = this.formatDate(formData.fechaInicial);
  //   const fechaFormateada2 = this.formatDate(formData.fechaFinal);

  //   formData.fechaInicial = fechaFormateada;
  //   formData.fechaFinal = fechaFormateada2;

  //   const pesoLote = formData.pesoLote;

  //   if (
  //     pesoLote &&
  //     pesoLote.toString().split('.')[1] &&
  //     pesoLote.toString().split('.')[1].length > 2
  //   ) {
  //     Notiflix.Notify.failure(
  //       'El campo "Peso Lote" debe tener máximo 2 decimales'
  //     );
  //     return;
  //   }
  //   Notiflix.Confirm.show(
  //     'Guardar cambios',
  //     '¿Estás seguro de guardar los cambios?',
  //     'Sí',
  //     'No',
  //     () => {
  //       // Enviar el formulario a la API
  //       this.embarqueTransporteForm.controls['pesoLote'].setValue(pesoLote);
  //       this.embarqueTransporteForm.controls['fechaInicial'].setValue(
  //         fechaFormateada
  //       );
  //       this.embarqueTransporteForm.controls['fechaFinal'].setValue(
  //         fechaFormateada2
  //       );
  //       this.onSubmit();
  //     },
  //     () => {
  //       Notiflix.Notify.failure('No se guardaron los cambios');
  //     },
  //     {}
  //   );
  // }

  guardar() {
    this.embarqueTransporteForm.patchValue({
      pesoLote: Math.abs(this.embarqueTransporteForm.get('odometroFinal')?.value - this.embarqueTransporteForm.get('odometroInicial')?.value).toFixed(2)
    })
    const formData = this.embarqueTransporteForm.value;
    const valorFechaInicial =
      this.embarqueTransporteForm.get('fechaInicial')?.value;

    if (valorFechaInicial) {
      let fechaInicial: Date;
      if (
        typeof valorFechaInicial === 'string' &&
        valorFechaInicial.includes('-')
      ) {
        fechaInicial = new Date(valorFechaInicial);
      } else {
        fechaInicial = valorFechaInicial;
      }
      const fechaFormateada = this.formatDate(fechaInicial);
      formData.fechaInicial = fechaFormateada;
    }
    const valorFechaFinal =
      this.embarqueTransporteForm.get('fechaFinal')?.value;
    if (valorFechaFinal) {
      let fechaFinal: Date;
      if (
        typeof valorFechaFinal === 'string' &&
        valorFechaFinal.includes('-')
      ) {
        fechaFinal = new Date(valorFechaFinal);
      } else {
        fechaFinal = valorFechaFinal;
      }
      const fechaFormateada2 = this.formatDate(fechaFinal);
      formData.fechaFinal = fechaFormateada2;


      if (formData.porcHumedad > 100) {
        Notiflix.Notify.failure(
          'El porcentaje de humedad no puede ser mayor a 100'
        );
        return;
      }
      if (formData.porcHumedad < 0) {
        Notiflix.Notify.failure(
          'El porcentaje de humedad no puede ser menor a 0'
        );
        return;
      }
      if (formData.pesoLote < 0) {
        Notiflix.Notify.failure('El peso lote no puede ser menor a 0');
        return;
      }
      if (formData.odometroInicial < 0) {
        Notiflix.Notify.failure('El odometro inicial no puede ser menor a 0');
        return;
      }
      if (formData.odometroFinal < 0) {
        Notiflix.Notify.failure('El odometro final no puede ser menor a 0');
      }
    }
    console.log('Formulario enviado:', formData);
    Notiflix.Confirm.show(
      'Guardar cambios',
      '¿Estás seguro de guardar los cambios?',
      'Sí',
      'No',
      () => {
        // Enviar el formulario a la API
        if (this.embarqueTransporteForm.valid) {
          // Enviar el formulario a la API
          console.log('Formulario enviado:', this.embarqueTransporteForm.value);
          this.http
            .put(
              'https://control.als-inspection.cl/api_min/api/despacho-embarque/' +
                this.embarqueTransporteForm.value.id +
                '/',
              formData
            )
            .subscribe(
              (response) => {
                console.log('Formulario enviado correctamente:', response);
                Notiflix.Notify.success('Embarque guardado correctamente');
                this.dialogRef.close();
              },
              (error) => {
                console.error('Error al enviar el formulario:', error);
                Notiflix.Notify.failure('Error al enviar el formulario');
              }
            );
        } else {
          Notiflix.Notify.failure('El formulario no es válido');
        }
      },
      () => {
        Notiflix.Notify.failure('No se guardaron los cambios');
      },
      {}
    );
  }

  onCancel(): void {
    this.onNoClick();
  }

  onNoClick(): void {
    this.dialogRef.close();
    this.ngOnInit() // Cierra el diálogo sin devolver valor
  }

  aprobar() {
    const formData = this.embarqueTransporteForm.value;
    const valorFechaInicial =
      this.embarqueTransporteForm.get('fechaInicial')?.value;

    if (valorFechaInicial) {
      let fechaInicial: Date;
      if (
        typeof valorFechaInicial === 'string' &&
        valorFechaInicial.includes('-')
      ) {
        fechaInicial = new Date(valorFechaInicial);
      } else {
        fechaInicial = valorFechaInicial;
      }
      const fechaFormateada = this.formatDate(fechaInicial);
      formData.fechaInicial = fechaFormateada;
    }
    const valorFechaFinal =
      this.embarqueTransporteForm.get('fechaFinal')?.value;
    if (valorFechaFinal) {
      let fechaFinal: Date;
      if (
        typeof valorFechaFinal === 'string' &&
        valorFechaFinal.includes('-')
      ) {
        fechaFinal = new Date(valorFechaFinal);
      } else {
        fechaFinal = valorFechaFinal;
      }
      const fechaFormateada2 = this.formatDate(fechaFinal);
      formData.fechaFinal = fechaFormateada2;

      if (formData.odometroInicial > formData.odometroFinal) {
        Notiflix.Notify.failure(
          'El odometro inicial no puede ser mayor al final'
        );
        return;
      }
      if (formData.fechaInicial > formData.fechaFinal) {
        Notiflix.Notify.failure(
          'La fecha inicial no puede ser mayor a la final'
        );
        return;
      }
      if (formData.horaInicial > formData.horaFinal) {
        Notiflix.Notify.failure(
          'La hora inicial no puede ser mayor a la final'
        );
        return;
      }
      if (formData.porcHumedad > 100) {
        Notiflix.Notify.failure(
          'El porcentaje de humedad no puede ser mayor a 100'
        );
        return;
      }
      if (formData.porcHumedad < 0) {
        Notiflix.Notify.failure(
          'El porcentaje de humedad no puede ser menor a 0'
        );
        return;
      }
      if (formData.pesoLote < 0) {
        Notiflix.Notify.failure('El peso lote no puede ser menor a 0');
        return;
      }
      if (formData.odometroInicial < 0) {
        Notiflix.Notify.failure('El odometro inicial no puede ser menor a 0');
        return;
      }
      if (formData.odometroFinal < 0) {
        Notiflix.Notify.failure('El odometro final no puede ser menor a 0');
      }
    }
    console.log(this.embarqueTransporteForm.value);
    if(this.embarqueTransporteForm.value.odometroInicial === 0 || this.embarqueTransporteForm.value.odometroFinal === 0){
      Notiflix.Notify.failure('Debe ingresar los odometros para aprobar');
      return;
    }
    if (this.embarqueTransporteForm.value.id === null || this.embarqueTransporteForm.value.id === undefined) {
      Notiflix.Notify.failure('Debe guardar el registro antes de aprobar');
      return;
    }
    if(this.embarqueTransporteForm.value.estado === 'aprobado'){
      Notiflix.Notify.failure('El registro ya se encuentra aprobado');
      return;
    }
    console.log('Formulario enviado:', formData);
    if(this.embarqueTransporteForm.valid){
      
      Notiflix.Confirm.show(
        '¿Desea aprobar el registro de embarque de transporte?',
        'Al aprobar el registro, no podrá ser modificado',
        'Aprobar',
        'Cancelar',
        () => {
          formData.estado = 'aprobado';
          this.http
          .put(
            'https://control.als-inspection.cl/api_min/api/despacho-embarque/' +
              this.embarqueTransporteForm.value.id +
              '/',
            formData
          )
          .subscribe(
            (response) => {
              console.log('Formulario enviado correctamente:', response);
              Notiflix.Notify.success('Embarque aprobado correctamente');
              this.dialogRef.close(true);
            },
            (error) => {
              console.error('Error al enviar el formulario:', error);
              Notiflix.Notify.failure('Error al enviar el formulario');
            }
          );
        },
        () => {
          Notiflix.Notify.failure('No se aprobo el registro');
          this.dialogRef.close();
        },
      );

    }else{
      Notiflix.Notify.failure('El formulario no es válido');
    }
  }

}
