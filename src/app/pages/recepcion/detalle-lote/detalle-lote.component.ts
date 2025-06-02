import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Data } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoteService } from 'src/app/services/lote.service';
import { RecepcionTransporteService } from 'src/app/services/recepcion.service';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { FiveDayRangeSelectionStrategy } from '../../formularios/formularios.component';
import Notiflix from 'notiflix';
import { HttpClient } from '@angular/common/http';
import { RolService } from 'src/app/services/rol.service';
import { map, Observable } from 'rxjs';
import { Bodega } from 'src/app/services/bodega.service';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
// import JsBarcode from 'jsbarcode';

// import * as Xlsxstyle from 'xlsx-style';

export interface loteRecepcion {
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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource1: any[] = [];
  dataSource2 = new MatTableDataSource<any>();

  nLote = '0';
  lote: any | null = null;
  recepcionTransporteForm: FormGroup;
  admin: boolean;
  apiLotes: 'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
  totalCamiones = 0;
  totalVagones = 0;
  totalBrutoHumedo = 0;
  totalNetoHumedo = 0;
  totalNetoSeco = 0;
  totalTara = 0;
  totalDiferencias = 0;
  observacion = '';
  bodegaSeleccionada: any;
  bodegas: any;
  operator: boolean;
  encargado: boolean;

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
    private recepcionTransporteService: RecepcionTransporteService
  ) {
    // Ahora puedes acceder a idServicio y idSolicitud a través de this.data
    console.log('ID Servicio:', this.data.idServicio);
    console.log('ID Solicitud:', this.data.idSolicitud);
    console.log('Numero de lote:', this.data.nLote);
    console.log('Numero de lote generado:', this.data);
    let nLote = this.data.nLote;
  }
  ngOnInit() {
    this.nLote = this.data.nLote;
    this.cargarLote();
    this.obtenerBodegas();
    this.cargarRecepcionTransporte(this.data.nLote);
    this.guardarLote();
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
    // this.rolService
    //   .hasRole(localStorage.getItem('email') || '', 'Encargado')
    //   .subscribe((hasRole) => {
    //     if (hasRole) {
    //       this.encargado = true;
    //       console.log('El usuario tiene el rol de Encargado');
    //     } else {
    //       this.encargado = false;
    //       console.log('El usuario no tiene el rol de Encargado');
    //     }
    //   });

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

  onPageEvent(event: any) {
    this.dataSource2.paginator = this.paginator;
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

  onBodegaChange(event: MatSelectChange) {
    const bodegaSeleccionada = event.value; // Esto ahora es el objeto bodega completo
    console.log('Bodega seleccionada:', bodegaSeleccionada);
    this.bodegaSeleccionada = bodegaSeleccionada;
  }

  cargarLote(): any {
    console.log('Cargar lote:', this.nLote);
    let lotebuscado: loteRecepcion;
    this.loteService.getLoteBynLote(this.nLote).subscribe(
      (response: loteRecepcion[]) => {
        console.log('Respuesta del servicio:', response);
        if (response.length > 0) {
          this.lote = response[0];
          lotebuscado = response[0];
        } else {
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
  cargarRecepcionTransporte(Nlote: string): void {
    this.recepcionTransporteService
      .getRecepcionTransporteBynLote(Nlote)
      .subscribe(
        (data) => {
          this.dataSource1 = data;
          this.dataSource2 = new MatTableDataSource(data);
          this.dataSource2.paginator = this.paginator;
          console.log('Data de dataSource:');
          console.log(this.dataSource1);

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
            // Sumar camiones y vagones
            if (registro.tipoTransporte === 'Camion') {
              totalCamiones += 1; // O suma la cantidad específica si existe
            } else if (registro.tipoTransporte === 'Vagon') {
              totalVagones += 1; // O suma la cantidad específica si existe
            }

            // Sumar los pesos y diferencias
            totalBrutoHumedo += Number(registro.brutoDestino) || 0; // Asegúrate de que estas propiedades existan
            totalNetoHumedo += Number(registro.netoHumedoDestino) || 0;
            totalNetoSeco += Number(registro.pesoNetoSeco) || 0;
            totalTara += Number(registro.taraDestino) || 0;
            totalDiferencias += Number(registro.diferenciaHumeda) || 0; // Asegúrate de que esta propiedad exista
          });

          // Ahora puedes usar los totales como desees

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
        (error) => {
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
      this.lote.pesoBrutoHumedo = Number(this.totalBrutoHumedo.toFixed(2)) || 0;
      this.lote.pesoNetoHumedo = Number(this.totalNetoHumedo.toFixed(2)) || 0;
      this.lote.pesoNetoSeco = Number(this.totalNetoSeco.toFixed(2)) || 0;
      this.lote.pesoTara = Number(this.totalTara.toFixed(2)) || 0;
      this.lote.diferenciaPeso = Number(this.totalDiferencias.toFixed(2)) || 0;
      this.lote.observacion = this.lote.observacion || '';
      this.recepcionTransporteService.actualizarLote(this.lote).subscribe(
        (response) => {
          console.log('Lote actualizado:', response);
          Notiflix.Notify.success('Lote actualizado correctamente');
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

  actualizarCuOrigen(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.CuOrigen = input.value; // Actualiza el valor de cuOrigen
  }

  actualizarCuDestino(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.CuDestino = input.value; // Actualiza el valor de cuOrigen
  }

  actualizarObservacion(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.observacion = input.value; // Actualiza el valor de porcHumedad
  }

  abrirDialogoModificarRegistro(element: any) {
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
        console.log('No se modifico ningun registro');
        this.ngOnInit();
      }
    });
  }

  formatDate(dateString: string): string {
    const parts = dateString.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convierte a formato YYYY-MM-DD
  }

  crearRegistro() {
    if (this.lote && this.bodegaSeleccionada) {
      const hoy = new Date();
      const horas = String(hoy.getHours()).padStart(2, '0'); // Asegura que las horas tengan 2 dígitos
      const minutos = String(hoy.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan 2 dígitos
      const hOrigen = `${horas}:${minutos}`; // Formatea la hora en hh:mm

      const nuevoRegistro = {
        tipoTransporte: this.lote.tipoTransporte,
        nLote: this.lote.nLote,
        fOrigen: hoy.toISOString().split('T')[0],
        hOrigen: hOrigen,
        idTransporteOrigen: null,
        idCarro: null,
        sellosOrigen: null,
        netoHumedoOrigen: null,
        brutoOrigen: null,
        taraOrigen: null,
        idTransporteDestino: null,
        fDestino: null,
        hDestino: null,
        idCarroDestino: null,
        sellosDestino: null,
        brutoDestino: null,
        taraDestino: null,
        netoHumedoDestino: null,
        diferenciaHumeda: null,
        diferenciaSeca: null,
        CuFino: null,
        bodega: this.bodegaSeleccionada.idBodega,
        estado: 'pendiente',
      };

      console.log(nuevoRegistro);

      // Guardar en la API
      this.recepcionTransporteService
        .crearRecepcionTransporte(nuevoRegistro)
        .subscribe(
          (response) => {
            // Agregar a la lista local si es necesario
            this.dataSource1.push(response);

            // Actualizar el lote correspondiente
            this.actualizarLote(nuevoRegistro.nLote);

            this.ngOnInit();
            console.log('Registro guardado:', response);

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
      Notiflix.Notify.warning(
        'Seleccione una bodega antes de guardar el registro'
      );
      console.error(
        'No se puede crear el registro, lote no cargado / bodega no seleccionada.'
      );
      console.error(Error);
    }
  }

  cargarLote1(nLote: string): Observable<loteRecepcion> {
    return this.loteService.getLoteBynLote(nLote).pipe(
      map((response) => response[0]) // Suponiendo que siempre obtendrás un array
    );
  }

  actualizarLote(nLote: string) {
    this.cargarLote1(nLote).subscribe(
      (lote) => {
        console.log(lote);

        // Filtrar los registros de recepcionTransporte que coincidan con el nLote
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
          (total, registro) => total + registro.netoHumedoDestino,
          0
        );

        const pesoTara = registrosFiltrados.reduce(
          (total, registro) => total + registro.pesoTara,
          0
        );

        const pesoBrutoHumedo = Number(pesoNetoHumedo) + Number(pesoTara);

        const porcHumedad =
          registrosFiltrados.length > 0
            ? registrosFiltrados[0].porcHumedad // Asumiendo que todos tienen el mismo porcentaje de humedad
            : 0;

        const pesoNetoSeco =
          Number(pesoNetoHumedo) - Number(pesoNetoHumedo) * (porcHumedad / 100);

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
        return this.http
          .put(
            `https://control.als-inspection.cl/api_min/api/lote-recepcion/${this.lote.id}/`,
            lote
          )
          .subscribe(
            (response) => {
              console.log('Lote actualizado correctamente', response);
            },
            (error) => {
              console.error('Error al actualizar el lote', error);
            }
          );
      },
      (error) => {
        console.error('Error al cargar el lote', error);
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
      (response: loteRecepcion[]) => {
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

exportToExcel(): void {
  // Crear un arreglo con los datos filtrados y con los nombres de los campos
  const datos = this.dataSource1.map((dato) => {
    const bodega = this.bodegas.find((b: any) => b.idBodega === dato.bodega);
    return {
      ID: dato.id,
      'Fecha Origen': dato.fOrigen,
      'Hora Origen': dato.hOrigen,
      'Guía Despacho': dato.tipoTransporte,
      'ID Transporte Origen': dato.idTransporteOrigen,
      'Sellos Origen': dato.sellosOrigen,
      'Bruto Origen': dato.brutoOrigen,
      'Tara Origen': dato.taraOrigen,
      'Neto Húmedo Origen': dato.netoHumedoOrigen,
      'Patente Origen': dato.idTransporteDestino,
      'Fecha Destino': dato.fDestino,
      'Hora Destino': dato.hDestino,
      'Patente Destino': dato.idCarroDestino,
      'Sellos Destino': dato.sellosDestino,
      'Bruto Destino': dato.brutoDestino,
      'Tara Destino': dato.taraDestino,
      'Neto Húmedo Destino': dato.netoHumedoDestino,
      'Diferencia Húmeda': dato.diferenciaHumeda,
      'Diferencia Seca': dato.diferenciaSeca,
      'Cu Fino': dato.CuFino,
      Bodega: bodega ? bodega.nombreBodega : 'No encontrada',
      Estado: dato.estado,
    };
  });

  // Crear una hoja de trabajo de Excel
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);

  // Aplicar estilos a la primera fila (encabezado)
  const headerRange = XLSX.utils.decode_range(ws['!ref']!); // Obtener el rango de la hoja
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col }); // Obtener la dirección de la celda (fila 0, columna col)
    if (!ws[cellAddress]) continue; // Si la celda no existe, continuar

    // Aplicar estilo a la celda
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } }, // Texto en negrita y color blanco
      fill: { fgColor: { rgb: '4F81BD' } }, // Fondo azul
      alignment: { horizontal: 'center' }, // Alinear al centro
    };
  }

  // Crear un libro de trabajo y agregar la hoja de trabajo
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');

  // Guardar el archivo Excel usando xlsx-style
  XLSX.writeFile(wb, 'datos_lote.xlsx');
}

  calcularTotalSeco(netoHumedoDestino: number, porcentajeHumedad: number) {
    const totalSeco = (
      netoHumedoDestino -
      (netoHumedoDestino * porcentajeHumedad) / 100
    ).toFixed(2);
    return totalSeco;
  }

  calcularCobreFino(totalSeco: number) {
    // Verificar el Cobre de Origen y Cobre de Destino
    const CuOrigen = this.lote.CuOrigen;
    const CuDestino = this.lote.CuDestino;
    if (CuOrigen == 0 && CuDestino != 0) {
      // Calcular el Cobre Fino
      const CuFino = totalSeco * ((totalSeco * CuDestino) / 100);
      return CuFino;
    } else if (CuOrigen != 0 && CuDestino == 0) {
      // Calcular el Cobre Fino
      const CuFino = totalSeco * ((totalSeco * CuOrigen) / 100);
      return CuFino;
    } else {
      return 0;
    }
  }

  // generarCodigo(nLote: string) {

  //   // Unir nLote y sellosOrigen para formar el código de barra
  //   const codigoBarra = `${nLote}`;

  //   // Crear un elemento de canvas para mostrar el código de barra
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');
  
  //   // Generar la imagen del código de barra
  //   JsBarcode(canvas, codigoBarra, {
  //     format: 'code128',
  //     width: 2,
  //     height: 100,
  //     fontSize: 16,
  //     font: 'Arial',
  //     fontOptions: 'bold',
  //     text: codigoBarra,
  //     textPosition: 'bottom',
  //     textMargin: 2,
  //   });
  
  //   // Descargar la imagen del código de barra
  //   const link = document.createElement('a');
  //   link.href = canvas.toDataURL('image/png');
  //   link.download = `codigo_barra_${nLote}.png`;
  //   link.click();
  // }
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
  templateUrl: './crear-registro-dialog.html',
  styleUrl: './detalle-lote.component.scss',
})
export class CrearRegistroDialog {
  recepcionTransporteForm: FormGroup;
  numeroCamion = 0;
  admin: boolean;
  operator: boolean;
  encargado: boolean;
  lote: any;
  idLote: number;
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
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private loteService: LoteService,
    private rolService: RolService,
    private http: HttpClient,
    private fb: FormBuilder,
    private bodegaService: Bodega,
    private dialogRef: MatDialogRef<CrearRegistroDialog>
  ) {
    this.recepcionTransporteForm = this.fb.group({
      tipoTransporte: [this.data.tipoTransporte, Validators.required],
      nLote: [this.data.nLote, Validators.required],
      fOrigen: [this.data.fOrigen, Validators.required],
      hOrigen: [this.data.hOrigen, Validators.required],
      idTransporteOrigen: [this.data.idTransporteOrigen],
      idCarro: [this.data.idCarro],
      sellosOrigen: [this.data.sellosOrigen],
      netoHumedoOrigen: [this.data.netoHumedoOrigen],
      brutoOrigen: [this.data.brutoOrigen],
      taraOrigen: [this.data.taraOrigen],
      fDestino: [this.data.fDestino],
      hDestino: [this.data.hDestino],
      idTransporteDestino: [this.data.idTransporteDestino],
      idCarroDestino: [this.data.idCarroDestino],
      sellosDestino: [this.data.sellosDestino],
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

  cargarLote(): any {
    console.log('Cargar lote:', this.data.nLote);
    let lotebuscado: loteRecepcion;
    this.loteService.getLoteBynLote(this.data.nLote).subscribe(
      (response: loteRecepcion[]) => {
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
  calcularDifHumeda(): number {
    const valorNetoHumedoOrigen =
      this.recepcionTransporteForm.get('netoHumedoOrigen')?.value;
    const valorNetoHumedoDestino =
      this.recepcionTransporteForm.get('netoHumedoDestino')?.value;
    let diferenciaHumeda = 0;

    // Calcular la diferencia húmeda si ambos valores son diferentes de 0
    if (valorNetoHumedoOrigen > 0 && valorNetoHumedoDestino > 0) {
      diferenciaHumeda = valorNetoHumedoDestino - valorNetoHumedoOrigen;
      diferenciaHumeda = Number(diferenciaHumeda.toFixed(2));
      console.log('la diferencia humeda es: ', diferenciaHumeda);
      if (diferenciaHumeda < 0) {
        diferenciaHumeda = diferenciaHumeda * -1;
      }
      return Number(diferenciaHumeda);
    } else {
      console.log('No se calculo la diferencia seca');
      return 0;
    }
  }

  calcularDifSeca(): number {
    const valorNetoHumedoOrigen =
      this.recepcionTransporteForm.get('netoHumedoOrigen')?.value;
    const valorNetoHumedoDestino =
      this.recepcionTransporteForm.get('netoHumedoDestino')?.value;
    let diferenciaHumeda = this.calcularDifHumeda();
    let diferenciaSeca = 0;

    // Calcular la diferencia húmeda si ambos valores son diferentes de 0
    if (valorNetoHumedoOrigen > 0 && valorNetoHumedoDestino > 0) {
      diferenciaSeca =
        diferenciaHumeda -
        (diferenciaHumeda * this.porcentajeHumedad * 1) / 100;
      diferenciaSeca = Number(diferenciaSeca.toFixed(2));
      if (diferenciaSeca < 0) {
        diferenciaSeca = diferenciaSeca * -1;
      }
      console.log('la diferencia seca es: ' + diferenciaSeca);
      return Number(diferenciaSeca);
    } else {
      console.log('No se calculo la diferencia seca');
      return 0;
    }
  }

  calcularNetoHumedo(): number {
    const valorPesoBruto =
      this.recepcionTransporteForm.get('brutoDestino')?.value;
    const valorPesoTara =
      this.recepcionTransporteForm.get('taraDestino')?.value;
    let valorPesoNeto = valorPesoTara - valorPesoBruto;

    if (valorPesoNeto < 0) {
      valorPesoNeto = valorPesoNeto * -1;
    }

    console.log(valorPesoNeto.toFixed(2));
    return Number(valorPesoNeto.toFixed(2));
  }

  calcularTotalSeco(netoHumedoDestino: number, porcentajeHumedad: number) {
    const totalSeco = (
      netoHumedoDestino -
      (netoHumedoDestino * porcentajeHumedad) / 100
    ).toFixed(2);
    return totalSeco;
  }

  calcularCobreFino(totalSeco: number) {
    // Verificar el Cobre de Origen y Cobre de Destino
    const CuOrigen = this.lote.CuOrigen;
    const CuDestino = this.lote.CuDestino;
    let CuFino = 0;
    if (CuDestino != 0) {
      CuFino = totalSeco - (totalSeco * CuDestino) / 100;
    } else if (CuOrigen != 0) {
      CuFino = totalSeco - (totalSeco * CuOrigen) / 100;
    } else {
      CuFino = 0;
    }
    return CuFino.toFixed(2);
  }

  //peso neto humedo de destino es peso bruto destino menos peso tara destino

  onSubmit(): void {
    if (this.recepcionTransporteForm.valid) {
      const valorFDestino = this.recepcionTransporteForm.get('fDestino')?.value;
      const valorFOrigen = this.recepcionTransporteForm.get('fOrigen')?.value;
      // Convertir a Date si es necesario
      if (valorFDestino) {
        let fechaDestino: Date;
        if (typeof valorFDestino === 'string' && valorFDestino.includes('-')) {
          fechaDestino = new Date(valorFDestino);
        } else {
          fechaDestino = valorFDestino; // Asumimos que ya es un objeto Date
        }
        const fechaFormateada = this.formatDateToString(fechaDestino);
        this.recepcionTransporteForm.controls['fDestino'].setValue(
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
        this.recepcionTransporteForm.controls['fOrigen'].setValue(
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
        this.recepcionTransporteForm.controls['fDestino'].setValue(
          fechaFormateada
        );
      }
      let pesoNetoHumedoDestino = this.calcularNetoHumedo();
      let diferenciaHumeda = this.calcularDifHumeda();
      let diferenciaSeca = this.calcularDifSeca();
      let totalSeco = this.calcularTotalSeco(
        pesoNetoHumedoDestino,
        this.porcentajeHumedad
      );
      let CuFino = this.calcularCobreFino(Number(totalSeco));
      console.log('Total Seco:', totalSeco);
      console.log('CuFino:', CuFino);
      console.log('Diferencia Húmeda:', diferenciaHumeda);
      console.log('Diferencia Seca:', diferenciaSeca);
      const registroModificado = {
        ...this.recepcionTransporteForm.value,
        diferenciaHumeda: diferenciaHumeda,
        diferenciaSeca: diferenciaSeca,
        netoHumedoDestino: pesoNetoHumedoDestino,
        CuFino: CuFino,
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
              `https://control.als-inspection.cl/api_min/api/recepcion-transporte/${id}/`,
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

  ingresoDetalleBodega(diferenciaSeca: number, bodega: number) {
    this.bodegaService
      .crearDetalleBodega('Ingreso', diferenciaSeca, 0, bodega)
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
        const totalBodega = Number(response.total) + Number(diferenciaSeca);
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

  guardar() {
    // const valorPesoBruto =
    //   this.recepcionTransporteForm.get('brutoDestino')?.value;
    // const valorPesoTara =
    //   this.recepcionTransporteForm.get('taraDestino')?.value;
    // const valorPesoNeto =
    //   this.recepcionTransporteForm.get('netoHumedoDestino')?.value;

    // // Calcula las diferencias de peso
    // const diferenciaPeso = valorPesoBruto - valorPesoTara - valorPesoNeto;
    // const diferenciaHumeda = valorPesoNeto - valorPesoTara;
    // const diferenciaSeca =
    //   valorPesoNeto - valorPesoNeto * (this.porcentajeHumedad / 100);

    // // Actualiza los valores del formulario
    // this.recepcionTransporteForm.patchValue({
    //   diferenciaHumeda: diferenciaHumeda,
    //   diferenciaSeca: diferenciaSeca,
    //   diferenciaPeso: diferenciaPeso,
    // });
    // console.log(this.recepcionTransporteForm.value);

    const valorPesoBrutoDestino =
      this.recepcionTransporteForm.get('brutoDestino')?.value;
    const valorPesoTaraDestino =
      this.recepcionTransporteForm.get('taraDestino')?.value;
    const valorPesoNetoDestino =
      this.recepcionTransporteForm.get('netoHumedoDestino')?.value;

    if (valorPesoBrutoDestino && valorPesoTaraDestino) {
      const netoHumedoDestino = valorPesoBrutoDestino - valorPesoTaraDestino;
      valorPesoNetoDestino -
        valorPesoNetoDestino * (this.porcentajeHumedad / 100);

      this.recepcionTransporteForm.patchValue({
        netoHumedoDestino: netoHumedoDestino.toFixed(2),
      });
    }

    const valorPesoBrutoOrigen =
      this.recepcionTransporteForm.get('brutoOrigen')?.value;
    const valorPesoTaraOrigen =
      this.recepcionTransporteForm.get('taraOrigen')?.value;
    const valorPesoNetoOrigen =
      this.recepcionTransporteForm.get('netoHumedoOrigen')?.value;

    if (valorPesoBrutoOrigen && valorPesoTaraOrigen) {
      const netoHumedoOrigen = valorPesoBrutoOrigen - valorPesoTaraOrigen;
      this.recepcionTransporteForm.patchValue({
        netoHumedoOrigen: netoHumedoOrigen.toFixed(2),
      });
    } else {
      this.recepcionTransporteForm.patchValue({
        netoHumedoOrigen: valorPesoNetoOrigen,
      });
    }

    this.onSubmit();
  }

  aprobar() {
    console.log(this.recepcionTransporteForm.value);
    if (this.recepcionTransporteForm.valid) {
      const valorFDestino = this.recepcionTransporteForm.get('fDestino')?.value;
      const valorFOrigen = this.recepcionTransporteForm.get('fOrigen')?.value;
      // Convertir a Date si es necesario
      if (valorFDestino) {
        let fechaDestino: Date;
        if (typeof valorFDestino === 'string' && valorFDestino.includes('-')) {
          fechaDestino = new Date(valorFDestino);
        } else {
          fechaDestino = valorFDestino; // Asumimos que ya es un objeto Date
        }
        const fechaFormateada = this.formatDateToString(fechaDestino);
        this.recepcionTransporteForm.controls['fDestino'].setValue(
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
        this.recepcionTransporteForm.controls['fOrigen'].setValue(
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
        this.recepcionTransporteForm.controls['fDestino'].setValue(
          fechaFormateada
        );
      }

      let diferenciaHumeda = this.calcularDifHumeda();
      let diferenciaSeca = this.calcularDifSeca();

      console.log('Diferencia Húmeda:', diferenciaHumeda);
      console.log('Diferencia Seca:', diferenciaSeca);
      const registroModificado = {
        ...this.recepcionTransporteForm.value,
        diferenciaHumeda: diferenciaHumeda,
        diferenciaSeca: diferenciaSeca,
        estado: 'aprobado',
      };
      console.log(this.recepcionTransporteForm.value);
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
              `https://control.als-inspection.cl/api_min/api/recepcion-transporte/${id}/`,
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
    return fechaFormateada;
  }

  eliminarRegistro(): void {
    console.log('Eliminar registro:', this.data);
    const idLote = this.data.id; // Asegúrate de que tengas acceso a la propiedad id del lote
    const apiUrl = `https://control.als-inspection.cl/api_min/api/recepcion-transporte/${idLote}/`;

    Notiflix.Confirm.show(
      '¿Desea eliminar el registro?',
      'Esta acción no se puede deshacer',
      'Eliminar',
      'Cancelar',
      () => {
        this.http.delete(apiUrl).subscribe(
          (response) => {
            Notiflix.Notify.success('Se ha eliminado el registro');
            this.onNoClick();
            this.ngOnInit();
          },
          (error) => {
            console.error('Error al eliminar el registro:', error);
            Notiflix.Notify.failure('No se ha eliminado el registro');
          }
        );
      },
      () => {
        this.onNoClick();
      }
    );
  }

  // generarCodigo(nLote: string) {
  //   let sellosOrigen = this.recepcionTransporteForm.get('sellosOrigen')?.value;
  //   if (!sellosOrigen) {
  //     sellosOrigen = 0;
  //     }
  //   // Unir nLote y sellosOrigen para formar el código de barra
  //   const codigoBarra = `${nLote}-${sellosOrigen}`;

  //   // Crear un elemento de canvas para mostrar el código de barra
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');
  
  //   // Generar la imagen del código de barra
  //   JsBarcode(canvas, codigoBarra, {
  //     format: 'code128',
  //     width: 2,
  //     height: 100,
  //     fontSize: 16,
  //     font: 'Arial',
  //     fontOptions: 'bold',
  //     text: codigoBarra,
  //     textPosition: 'bottom',
  //     textMargin: 2,
  //   });
  
  //   // Descargar la imagen del código de barra
  //   const link = document.createElement('a');
  //   link.href = canvas.toDataURL('image/png');
  //   link.download = `codigo_barra_${nLote}_${sellosOrigen}.png`;
  //   link.click();
  // }
}
