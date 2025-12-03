import { TrazabilidadService } from './../../../services/trazabilidad.service';
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
import { ExcelsService } from 'src/app/services/excels.service';
import { PesometroService } from 'src/app/services/pesometro.service';
import * as ExcelJS from 'exceljs';

export interface loteDespachoEmbarque {
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
  CuFino: number;
  CuOrigen: number;
  CuDestino: number;
  servicio: number;
  solicitud: number;
  DUS: string;
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
  bodegaSeleccionada: 1;
  bodegas: any;
  total: number;

  cantRegistros = 0;
  tipoTransporte = 'Embarque';
  cantSublotes = 0;
  totalSublotes = 0;
  odometrosIniciales = 0.0;
  odometrosFinales = 0.0;
  sumaPesos = 0;
  porcHumedad = 0;
  pesoSeco = 0;
  CuFino = 0;
  fechaPrimerRegistro = null;
  fechaUltimoRegistro = null;
  horaPrimerRegistro = null;
  horaUltimoRegistro = null;
  sublote: any;
  pesometro: any;
  lotesDespacho: any;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      idServicio: number;
      idSolicitud: number;
      lote: any;
      numero: number;
    },
    private loteService: LoteService,
    private pesometroService: PesometroService,
    private TrazabilidadService: TrazabilidadService,
    private ExcelService: ExcelsService,  
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
    console.log('Lote:', this.lote);
    this.obtenerBodegas();
    this.nLote = this.data.lote.nLote;
    this.cargarDespachosEmbarque(this.nLote);
    this.admin = RolService.isTokenValid();
    this.getPesometro();
    this.rolService.getRoles(localStorage.getItem('email') || '')
      .subscribe(roles => {
        if (roles.includes('Admin')) {
          this.admin = true;
          this.operator = false;
          this.encargado = false;
          return;
        }else if (roles.includes('Operador')) {
          this.operator = true;
          this.admin = false;
          this.encargado = false;
          return;
        }
        else if (roles.includes('Encargado')) {
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
        this.sublote = data;
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
        let porcHumedad = 0;
        let pesoSeco = 0;

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
          porcHumedad += Number(registro.porcHumedad);
          odometrosIniciales += Number(registro.odometroInicial);
          odometrosFinales += Number(registro.odometroFinal);
        });
        // Calcula el porcentaje de humedad promedio
        porcHumedad = porcHumedad / totalSublotes;
        this.porcHumedad = porcHumedad;
        this.totalSublotes = totalSublotes;
        this.odometrosIniciales = odometrosIniciales;
        this.odometrosFinales = odometrosFinales;
        this.sumaPesos = sumaPesos;
        this.CuFino = Number(
          this.calcularCobreFino(Number(this.pesoSeco.toFixed(2)))
        );

        //calcular el peso seco como suma de cada sublote's pesoNetoSeco
        this.pesoSeco = this.dataSource1.reduce((total, sublote) => {
          const pesoBrutoHumedo = Number(sublote.pesoLote) || 0;
          const humedad = Number(sublote.porcHumedad) || 0;
          const pesoNetoSecoSublote = pesoBrutoHumedo * (1 - humedad / 100);
          return total + pesoNetoSecoSublote;
        }, 0);

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
        console.log('Suma Pesos:', this.sumaPesos);
        console.log('Porcentaje Humedad:', this.porcHumedad);
        console.log('Peso Seco:', this.pesoSeco);
        console.log('Cu Fino:', this.CuFino);
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
  actualizarFechaDUS(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.fechaDUS = input.value; // Actualiza el valor de DUS
  }

  actualizarCuOrigen(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.CuOrigen = input.value; // Actualiza el valor de cuOrigen
  }

  actualizarCuDestino(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.CuDestino = input.value; // Actualiza el valor de cuOrigen
  }

  actualizarCuFino(event: Event): void {
    const input = event.target as HTMLInputElement; // Aserción de tipo
    this.lote.CuFino = input.value; // Actualiza el valor de cuOrigen
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
    if (this.lote) {
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
      // if (!this.bodegaSeleccionada) {
      //   Notiflix.Notify.warning('Debes seleccionar una bodega para continuar');
      // } else {
        console.error('No se puede crear el registro, lote no cargado.');
      // }
    }
  }
  actualizarLote() {
    const cantSubLotes = this.dataSource1.length;

    let porcHumedad = this.porcHumedad;
    if (porcHumedad === null || porcHumedad === undefined || isNaN(Number(porcHumedad))) {
      porcHumedad = 0;
    }else{
      porcHumedad = Number(this.porcHumedad.toFixed(2));
    }

    let pesoNetoHumedo = this.sumaPesos;
    if (pesoNetoHumedo === null || pesoNetoHumedo === undefined || isNaN(Number(pesoNetoHumedo))) {
      pesoNetoHumedo = 0;
    }else{
      pesoNetoHumedo = Number(this.sumaPesos.toFixed(2));
    }

    let pesoNetoSeco = this.pesoSeco;
    if (pesoNetoSeco === null || pesoNetoSeco === undefined || isNaN(Number(pesoNetoSeco))) {
      pesoNetoSeco = 0;
    }else{
      pesoNetoSeco = Number(this.pesoSeco.toFixed(2));
    }
    let CuFino = this.calcularCobreFino(Number(this.pesoSeco.toFixed(2)));
    if (CuFino === null || CuFino === undefined || isNaN(Number(CuFino))) {
      CuFino = 0;
    }
  
    // Actualizar el CuFino en el objeto lote
    this.lote.CuFino = CuFino || 0;

    // Crear objeto con TODOS los campos del lote, incluyendo los campos calculados
    const loteActualizado = {
      ...this.lote,
      cantSubLotes: cantSubLotes,
      pesoNetoHumedo: pesoNetoHumedo,
      porcHumedad: porcHumedad,
      pesoNetoSeco: pesoNetoSeco,
      CuFino: CuFino || 0,
      // Asegurar que todos los campos del embarque estén incluidos
      DUS: this.lote.DUS || null,
      fechaDUS: this.lote.fechaDUS || null,
      listaVerificacion: this.lote.listaVerificacion || null,
      refFocus: this.lote.refFocus || null,
      calidad: this.lote.calidad || null,
      cliente: this.lote.cliente || null,
      CuOrigen: this.lote.CuOrigen || null,
      CuDestino: this.lote.CuDestino || null,
      fechaTermino: this.lote.fechaTermino || null,
      contratoCochilco: this.lote.contratoCochilco || null,
      contratoAnglo: this.lote.contratoAnglo || null,
      DV: this.lote.DV || null,
      fechaEnvioReporte: this.lote.fechaEnvioReporte || null,
      fechaEntregaLab: this.lote.fechaEntregaLab || null,
      DUSAvanceComposito: this.lote.DUSAvanceComposito || null,
      DUSFinales: this.lote.DUSFinales || null,
      LALFinales: this.lote.LALFinales || null,
      fechaEntregaLabAduana: this.lote.fechaEntregaLabAduana || null,
      lugarDescarga: this.lote.lugarDescarga || null,
      paisDescarga: this.lote.paisDescarga || null,
      resguardoTestigoAduana: this.lote.resguardoTestigoAduana || null,
      numResolucionSNA: this.lote.numResolucionSNA || null,
      exportador: this.lote.exportador || null,
      aduana: this.lote.aduana || null,
      registroINN: this.lote.registroINN || null,
      rutExportador: this.lote.rutExportador || null,
      laboratorioDeEnsayo: this.lote.laboratorioDeEnsayo || null,
      muestreadoPor: this.lote.muestreadoPor || null,
      rutEmpresaMuestreadora: this.lote.rutEmpresaMuestreadora || null,
    };
    
    console.log('Lote actualizado:', loteActualizado);

    this.despachoTransporteService
      .actualizarLoteEmbarque(loteActualizado)
      .subscribe(
        (response) => {
          console.log('Lote actualizado correctamente:', response);
          this.data.lote = loteActualizado;
          this.lote = loteActualizado;
          Notiflix.Notify.success('Se ha actualizado el lote correctamente');
        },
        (error) => {
          console.error('Error al actualizar el lote:', error);
          Notiflix.Notify.failure('Error al actualizar el lote');
        }
      );
  }

  calcularCobreFino(totalSeco: number) : number {
    // Verificar el Cobre de Origen y Cobre de Destino
    const CuOrigen = this.lote.CuOrigen;
    const CuDestino = this.lote.CuDestino;
    console.log('Cobre Origen:', CuOrigen);
    console.log('Cobre Destino:', CuDestino);
    console.log('Total Seco:', totalSeco);
    let CuFino = 0;
    if (CuDestino != 0 || CuDestino != null) {
      CuFino = totalSeco - (totalSeco * CuDestino) / 100;
    } else if (CuOrigen != 0 || CuOrigen != null) {
      CuFino = totalSeco - (totalSeco * CuOrigen) / 100;
    } else {
      CuFino = 0; 
    }
    if (CuFino <= 0) {
      CuFino = 0; // Asegura que CuFino no sea negativo
    }
    return Number(CuFino.toFixed(2));
  }

  // onBodegaChange(event: MatSelectChange) {
  //   const bodegaSeleccionada = event.value; // Esto ahora es el objeto bodega completo
  //   console.log('Bodega seleccionada:', bodegaSeleccionada);
  //   this.bodegaSeleccionada = bodegaSeleccionada;
  //   this.total = bodegaSeleccionada.total;
  // }

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

  descargarEtiquetasEmbarques() {
    const lote = this.data.lote || {};

    // Paso 1: Verificar que el DUS no sea null o vacío
    if (!lote.DUS) {
      Notiflix.Notify.failure('El campo DUS no puede estar vacío.');
      return;
    }

    // Paso 2: Obtener todas las trazabilidades
    this.TrazabilidadService.getTrazabilidad().subscribe(
      (trazabilidades) => {
        // Paso 2.1: Filtrar por nLote
        const trazabilidadesFiltradas = trazabilidades.filter(
          (t: any) =>
            t.nLote?.trim().toLowerCase() === lote.nLote?.trim().toLowerCase()
        );

        if (trazabilidadesFiltradas.length > 0) {
          // Paso 3: Calcular cantidadSobres y agregarlo a cada registro
          const cantidadSobres = trazabilidadesFiltradas.length;

          // Calcular pesoNetoSeco para cada sublote correspondiente
          trazabilidadesFiltradas.forEach((item: any, index: number) => {
            const sublote = this.dataSource1[index];
            if (sublote) {
              const odometroInicial = Number(sublote.odometroInicial) || 0;
              const odometroFinal = Number(sublote.odometroFinal) || 0;
              const humedad = Number(sublote.porcHumedad) || 0;
              const tmh = odometroFinal - odometroInicial;
              const tms = tmh * (1 - humedad / 100);
              item.pesoNetoSeco = Number(tms.toFixed(2));
            }
          });

          const trazabilidadesConCantidad = trazabilidadesFiltradas.map((item : any) => ({
            ...item,
            cantidadSobres,
          }));

          // Paso 4: Enviar el array modificado al servicio Excel
          this.ExcelService.generarExcelQR(trazabilidadesConCantidad);
        } else {
          // Paso 5: No hay trazabilidad → solicitar cantidad de sobres manual
          Notiflix.Confirm.prompt(
            'Cantidad de sobres',
            'No se encontraron trazabilidades para este lote. Ingrese la cantidad de sobres que desea crear:',
            '',
            'Aceptar',
            'Cancelar',
            (valor) => {
              const cantidadSobres = parseInt(valor, 10);

              if (isNaN(cantidadSobres) || cantidadSobres <= 0) {
                Notiflix.Notify.failure(
                  'Cantidad inválida. Debe ser un número mayor a 0.'
                );
                return;
              }

              this.ExcelService.generarExcelQRConDatos({
                nLote: lote.nLote,
                nDUS: lote.DUS,
                motonave: lote.nombreNave,
                observacion: lote.observacion,
                bodega: lote.bodegaNave,
                fechaLote: new Date(lote.fLote),
                cantidadSobres: cantidadSobres,
                fLote: lote.fLote,
                estado: 'Iniciado',
              });
            },
            () => {
              Notiflix.Notify.info('Operación cancelada.');
            }
          );
        }
      },
      (error) => {
        console.error('Error al consultar trazabilidad:', error);
        Notiflix.Notify.failure('Error al verificar trazabilidad.');
      }
    );
  }

  // GENERADOR DE PDFS

//esto va al final

  getPesometro() {
    this.pesometroService.obtenerPesometro().subscribe((data) => {
      this.pesometro = data;
    })
  }

  getallLotesDespacho() {
    this.despachoTransporteService.getDespachoEmbarque().subscribe((data) => {
      this.lotesDespacho = data;
      console.log(this.lotesDespacho);
    })
  }

  generarCertificados() {
    Notiflix.Loading.standard('Generando certificados...');

    // Ejecutar las funciones inmediatamente
    this.descargarExcelResumenLote2();
    this.descargarExcelInformePesos();

    // Ocultar el loader después de 5 segundos
    setTimeout(() => {
      Notiflix.Loading.remove();
    }, 5000);
  }

  async descargarExcelResumenLote2() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen Lote');

    const imagePath = '/assets/images/logos/als_logo_1.png';
    const response = await fetch(imagePath);
    const imageBuffer = await response.arrayBuffer();
    const imageId = workbook.addImage({ buffer: imageBuffer, extension: 'png' });

    worksheet.addImage(imageId, { tl: { col: 1, row: 3 }, ext: { width: 80, height: 80 } });

    worksheet.getColumn('B').width = 30;
    worksheet.getColumn('C').width = 5;
    worksheet.getColumn('D').width = 30;
    worksheet.getColumn('E').width = 30;
    worksheet.getColumn('F').width = 20;
    worksheet.getColumn('G').width = 30;

    worksheet.getCell('G2').value = 'ALS Inspection Chile Spa';
    worksheet.getCell('G3').value = 'Calle Limache 3405, Office 61';
    worksheet.getCell('G4').value = 'Viña del Mar, CHILE';
    worksheet.getCell('G5').value = 'T +56 32 254 5500';

    worksheet.mergeCells('B6:G6');
    worksheet.getCell('B6').value = 'ALS INPECTION CHILE SPA';
    worksheet.getCell('B6').font = { bold: true, size: 14 };
    worksheet.getCell('B6').alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('B7:G7');
    worksheet.getCell('B7').value = 'INFORME FINAL DE EMBARQUE';
    worksheet.getCell('B7').font = { size: 10 };
    worksheet.getCell('B7').alignment = { horizontal: 'center', vertical: 'middle' };

    const detalleColumna1 = [
      { label: 'Referencia ALS', key: 'refFocus' },
      { label: 'N° Resolución vigente SNA', key: 'numResolucionSNA' },
      { label: 'DUS / Fecha', key: 'fechaDUS' },
      { label: 'EXPORTADOR', key: 'exportador' },
      { label: 'CONTRATO COCHILCO / CUOTA', key: 'contratoCochilco' },
      { label: 'PUERTO EMBARQUE', key: 'lugarDescarga' },
      { label: 'CONSIGNATARIO', key: 'cliente' },
      { label: 'PROCEDIMIENTO CERTIFICADO', key: 'listaVerificacion' },
      { label: 'NOMBRE LABORATORIO DE ENSAYO', key: 'laboratorioDeEnsayo' },
      { label: 'FECHA INICIO/TERMINO EMBARQUE', key: 'fLote' },
    ];

    const detalleColumna2 = [
      { label: 'ADUANA', key: 'aduana' },
      { label: 'N° REGISTRO INN', key: 'registroINN' },
      { label: 'CANTIDAD DE ITEM DEL DUS', key: 'cantSubLotes' },
      { label: 'RUT EXPORTADOR', key: 'rutExportador' },
      { label: 'N° CONTRATO', key: 'contratoAnglo' },
      { label: 'NOMBRE DE LA MOTO NAVE', key: 'nombreNave' },
      { label: 'CALIDAD', key: 'calidad' },
      { label: 'MUESTREADO POR', key: 'muestreadoPor' },
      { label: 'RUT EMPRESA MUESTREADORA', key: 'rutEmpresaMuestreadora' },
      { label: 'DESTINO', key: 'paisDescarga' },
    ];

    const lote = this.data.lote || {};
    let fila = 10;

    detalleColumna1.forEach(({ label, key }) => {
      worksheet.getCell(`B${fila}`).value = label;
      worksheet.getCell(`C${fila}`).value = ':';
      worksheet.getCell(`D${fila}`).value = label === 'DUS / Fecha'
        ? `${lote.DUS ?? 'No DUS'} / ${lote.fechaDUS ?? 'No Fecha'}`
        : label === 'FECHA INICIO/TERMINO EMBARQUE'
        ? `${lote.fLote ?? 'No aplica'} // ${lote.fechaTermino ?? 'No aplica'}`
        : lote[key] ?? 'No aplica';
      fila++;
    });

    fila = 10;
    detalleColumna2.forEach(({ label, key }) => {
      worksheet.getCell(`E${fila}`).value = label;
      worksheet.getCell(`F${fila}`).value = ':';
      worksheet.getCell(`G${fila}`).value = label === 'CANTIDAD DE ITEM DEL DUS' ? 1 : lote[key] ?? 'No aplica';
      if (label === 'CANTIDAD DE ITEM DEL DUS') {
        worksheet.getCell(`G${fila}`).alignment = { horizontal: 'left' };
      }
      fila++;
    });

    const startRowTabla = 10 + Math.max(detalleColumna1.length, detalleColumna2.length) + 1;

    worksheet.mergeCells(`B${startRowTabla}:C${startRowTabla}`);
    worksheet.getCell(`B${startRowTabla}`).value = 'Lote';
    worksheet.getCell(`B${startRowTabla}`).font = { bold: true };
    worksheet.getCell(`B${startRowTabla}`).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(`B${startRowTabla}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.getCell(`D${startRowTabla}`).value = 'Bodega';
    worksheet.getCell(`E${startRowTabla}`).value = 'T.M.H';
    worksheet.getCell(`F${startRowTabla}`).value = '% Humedad';
    worksheet.getCell(`G${startRowTabla}`).value = 'TMS (KG)';

    ['D', 'E', 'F', 'G'].forEach((col) => {
      const cell = worksheet.getCell(`${col}${startRowTabla}`);
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });

    const sublotes = this.sublote || [];
    let contador = 1;
    let currentRow = startRowTabla + 1;

    sublotes.forEach((sublote: any) => {
      const row = worksheet.getRow(currentRow++);
      worksheet.mergeCells(`B${row.number}:C${row.number}`);
      row.getCell(2).value = contador++;
      row.getCell(4).value = sublote.bodega || 'No aplica';

      const odometroInicial = Number(sublote.odometroInicial) || 0;
      const odometroFinal = Number(sublote.odometroFinal) || 0;
      const humedad = Number(sublote.porcHumedad) || 0;

      const tmh = odometroFinal - odometroInicial;
      const tms = tmh * (1 - humedad / 100);

      // Formatear valores con 2 decimales siempre
      row.getCell(5).value = tmh > 0 ? tmh.toFixed(2) : 'No aplica';
      row.getCell(6).value = humedad >= 0 ? humedad.toFixed(2) : 'No aplica';
      row.getCell(7).value = tms > 0 ? tms.toFixed(2) : '0.00';

      sublote.pesoBruto = Number(tmh.toFixed(2));
      sublote.pesoNetoSeco = Number(tms.toFixed(2));

      [2, 4, 5, 6, 7].forEach(col => {
        const cell = row.getCell(col);
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    const filaTituloTabla = 51;
    worksheet.mergeCells(`D${filaTituloTabla}:G${filaTituloTabla}`);
    worksheet.getCell(`D${filaTituloTabla}`).value = 'PESOS DE EMBARQUE POR BODEGAS';
    worksheet.getCell(`D${filaTituloTabla}`).font = { bold: true, size: 12 };
    worksheet.getCell(`D${filaTituloTabla}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`D${filaTituloTabla}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

    const filaEncabezados = filaTituloTabla + 1;
    worksheet.getCell(`D${filaEncabezados}`).value = 'BODEGA';
    worksheet.getCell(`E${filaEncabezados}`).value = 'T.M.H';
    worksheet.getCell(`F${filaEncabezados}`).value = '% HUMEDAD';
    worksheet.getCell(`G${filaEncabezados}`).value = 'T.M.S';

    ['D', 'E', 'F', 'G'].forEach(col => {
      const cell = worksheet.getCell(`${col}${filaEncabezados}`);
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });

    const resumenBodegas: Record<string, { tmh: number, humedad: number[], tms: number }> = {};
    sublotes.forEach((sublote: any) => {
      const bodega = sublote.bodega || 'No aplica';
      const tmh = Number(sublote.pesoBruto) || 0;
      const humedad = Number(sublote.porcHumedad) || 0;
      const tms = Number(sublote.pesoNetoSeco) || 0;

      if (!resumenBodegas[bodega]) resumenBodegas[bodega] = { tmh: 0, humedad: [], tms: 0 };

      resumenBodegas[bodega].tmh += tmh;
      resumenBodegas[bodega].humedad.push(humedad);
      resumenBodegas[bodega].tms += tms;
    });

    let filaActual = filaEncabezados + 1;
    let totalTMH = 0;
    let totalTMS = 0;

    Object.entries(resumenBodegas).forEach(([bodega, valores]) => {
      const promedioHumedad = valores.humedad.length
        ? valores.humedad.reduce((a, b) => a + b, 0) / valores.humedad.length
        : 0;

      worksheet.getCell(`D${filaActual}`).value = bodega;
      worksheet.getCell(`E${filaActual}`).value = valores.tmh.toFixed(2);
      worksheet.getCell(`F${filaActual}`).value = promedioHumedad.toFixed(2) + '%';
      worksheet.getCell(`G${filaActual}`).value = valores.tms.toFixed(2);

      ['D', 'E', 'F', 'G'].forEach(col => {
        worksheet.getCell(`${col}${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' },
        };
      });

      totalTMH += valores.tmh;
      totalTMS += valores.tms;
      filaActual++;
    });

    worksheet.getCell(`D${filaActual}`).value = 'PESO TOTAL EMBARCADO';
    worksheet.getCell(`E${filaActual}`).value = totalTMH.toFixed(2);
    worksheet.getCell(`F${filaActual}`).value = '';
    worksheet.getCell(`G${filaActual}`).value = totalTMS.toFixed(2);

    ['D', 'E', 'F', 'G'].forEach(col => {
      worksheet.getCell(`${col}${filaActual}`).font = { bold: true };
      worksheet.getCell(`${col}${filaActual}`).border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    worksheet.getCell('G62').value = 'BRUNO ACEVEDO';
    worksheet.getCell('G63').value = 'SUPERVISOR TECNICO';
    worksheet.getCell('G62').alignment = { horizontal: 'center' };
    worksheet.getCell('G63').alignment = { horizontal: 'center' };
    worksheet.getCell('G62').font = { italic: true };
    worksheet.getCell('G63').font = { italic: true };

    for (let i = 1; i <= 100; i++) {
      const row = worksheet.getRow(i);
      for (let j = 1; j <= 26; j++) {
        row.getCell(j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
      }
    }

    worksheet.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      verticalCentered: true,
      margins: {
        top: 0.1, bottom: 0.1, left: 0.1, right: 0.1, header: 0.0, footer: 0.0
      }
    };

    worksheet.pageSetup.printArea = `B1:G${filaActual + 5}`;

    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.font = { size: 9 };
    });

    const bordeExterior: Partial<ExcelJS.Borders> = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    const filaInicio = 1;
    const filaFin = filaActual + 5;
    const colInicio = 2;
    const colFin = 7;

    for (let fila = filaInicio; fila <= filaFin; fila++) {
      for (let col = colInicio; col <= colFin; col++) {
        const cell = worksheet.getCell(fila, col);
        const borde: Partial<ExcelJS.Borders> = {};

        if (fila === filaInicio) borde.top = bordeExterior.top;
        if (fila === filaFin) borde.bottom = bordeExterior.bottom;
        if (col === colInicio) borde.left = bordeExterior.left;
        if (col === colFin) borde.right = bordeExterior.right;

        cell.border = { ...cell.border, ...borde };
      }
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const formData = new FormData();
      const archivoExcel = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      formData.append('file', archivoExcel, 'Informe_Final_Embarques.xlsx');

      this.http.post('https://control.als-inspection.cl/api_min/api/convertirexcelpdf/', formData, {
        responseType: 'blob'
      }).subscribe((pdfBlob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'Informe_Final_Embarques.pdf';
        link.click();
      }, error => {
        console.error('Error al convertir a PDF:', error);
      });
    });
  }

  // INFORME DE PESOS

  async descargarExcelInformePesos() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Informe de Pesos');

    const imagePath = '/assets/images/logos/als_logo_1.png'; // o el logo que necesites
    const response = await fetch(imagePath);
    const imageBuffer = await response.arrayBuffer();
    const imageId = workbook.addImage({ buffer: imageBuffer, extension: 'png' });

    // Insertar logo en hoja
    worksheet.addImage(imageId, {
      tl: { col: 2, row: 4 },
      ext: { width: 80, height: 80 }
    });

    // Insertar logo en hoja
    worksheet.addImage(imageId, {
      tl: { col: 56, row: 4 },
      ext: { width: 80, height: 80 }
    });

    // Insertar logo en segunda sección (segunda hoja visualmente)
    worksheet.addImage(imageId, {
      tl: { col: 2, row: 54 }, // Puedes ajustar la fila/columna si deseas moverlo
      ext: { width: 80, height: 80 }
    });

    worksheet.addImage(imageId, {
      tl: { col: 56, row: 54 }, // Segundo logo al extremo derecho
      ext: { width: 80, height: 80 }
    });

    // ----------- DEFINIR ANCHO DE COLUMNAS A a O ----------------
    worksheet.getColumn('A').width = 2;   // puedes ajustar según necesidad
    worksheet.getColumn('B').width = 2;
    worksheet.getColumn('C').width = 30;
    worksheet.getColumn('D').width = 8;
    worksheet.getColumn('E').width = 15;
    worksheet.getColumn('F').width = 15;
    worksheet.getColumn('G').width = 10;
    worksheet.getColumn('H').width = 18;
    worksheet.getColumn('I').width = 10;
    worksheet.getColumn('J').width = 5;
    worksheet.getColumn('K').width = 15;
    worksheet.getColumn('L').width = 15;
    worksheet.getColumn('M').width = 15;
    worksheet.getColumn('N').width = 15;
    worksheet.getColumn('O').width = 5;

    worksheet.getCell('N3').value = 'ALS Inspection Chile Spa';
    worksheet.getCell('N4').value = 'Calle Limache 3405, Office 61';
    worksheet.getCell('N5').value = 'Viña del Mar, CHILE';
    worksheet.getCell('N6').value = 'T +56 32 254 5500';

    ['N3', 'N4', 'N5', 'N6'].forEach(cell => {
      worksheet.getCell(cell).alignment = { horizontal: 'right' };
      worksheet.getCell(cell).font = { size: 10 }; // Puedes ajustar tamaño
    });

    // ----------- APLICAR FONDO BLANCO A TODA LA HOJA ----------------
    for (let i = 1; i <= 200; i++) {
      const row = worksheet.getRow(i);
      for (let j = 1; j <= 26; j++) {
        row.getCell(j).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' },
        };
      }
    }

    // ----------- DATOS GENERALES ----------------
    const lote = this.data.lote || {};
    const cantidadDUS = this.sublote?.length || 0;
    const bodegasUnicasString = [...new Set(this.sublote?.map((s: any) => s.bodega))].sort().join(' - ');

    // ----------- TÍTULOS ----------------
    worksheet.mergeCells('D6:H6');
    worksheet.getCell('D6').value = 'INFORME DE PESO';
    worksheet.getCell('D6').font = { bold: true, size: 14 };
    worksheet.getCell('D6').alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('D7:H7');
    worksheet.getCell('D7').value = 'CONCENTRADO DE COBRE QUE AMPARA EL DUS N° DUS';
    worksheet.getCell('D7').font = { bold: true, size: 12 };
    worksheet.getCell('D7').alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('D8:H8');
    worksheet.getCell('D8').value = 'ALS INSPECTION CHILE SpA';
    worksheet.getCell('D8').font = { bold: true, size: 12 };
    worksheet.getCell('D8').alignment = { horizontal: 'center', vertical: 'middle' };

    // ----------- INFORMACIÓN GENERAL ----------------
    let filaInfo = 9;
    worksheet.mergeCells(`C${filaInfo}:E${filaInfo}`);
    worksheet.getCell(`C${filaInfo}`).value = 'I INFORMACIÓN GENERAL';
    worksheet.getCell(`C${filaInfo}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${filaInfo}`).alignment = { horizontal: 'left', vertical: 'middle' };
    filaInfo++;

    const datosCol1 = [
      { label: 'Referencia ALS', value: lote.refFocus },
      { label: 'N° Resolución Vigente S.N.A', value: lote.numResolucionSNA },
      { label: 'DUS / Fecha', value: `${lote.DUS ?? 'No DUS'} / ${lote.fechaDUS ?? 'No Fecha'}` },
      { label: 'Exportador', value: lote.exportador },
      { label: 'Contrato COCHILCO y cuota', value: lote.contratoCochilco },
      { label: 'Puerto embarque', value: 'Puerto Ventanas' },
      { label: 'Consignatario', value: lote.cliente },
      { label: 'Procedimiento Certificado', value: lote.certificado },
      { label: 'Nombre laboratorio de ensayo', value: 'ALS INSPECTION' },
    ];

    datosCol1.forEach(({ label, value }) => {
      worksheet.getCell(`C${filaInfo}`).value = label;
      worksheet.getCell(`D${filaInfo}`).value = ':';
      worksheet.getCell(`E${filaInfo}`).value = value ?? 'No aplica';
      filaInfo++;
    });

    let filaCol2 = 10;
    const datosCol2 = [
      { label: 'Aduana', value: lote.aduana },
      { label: 'N° de registro INN', value: lote.registroINN },
      { label: 'Cantidad item del DUS', value: cantidadDUS },
      { label: 'Rut del Exportador', value: lote.rutExportador },
      { label: 'N° de Contrato', value: lote.contratoAnglo },
      { label: 'Nombre de la Motonave', value: lote.nombreNave },
    ];

    datosCol2.forEach(({ label, value }) => {
      worksheet.mergeCells(`H${filaCol2}:I${filaCol2}`);
      worksheet.getCell(`H${filaCol2}`).value = label;
      worksheet.getCell(`J${filaCol2}`).value = ':';
      worksheet.getCell(`K${filaCol2}`).value = value ?? 'No aplica';
      filaCol2++;
    });

    // ----------- PESO EMBARCADO POR ITEM DEL DUS ----------------
    let filaPeso = Math.max(filaInfo, filaCol2) + 1;
    worksheet.mergeCells(`C${filaPeso}:K${filaPeso}`);
    worksheet.getCell(`C${filaPeso}`).value = 'II PESO EMBARCADO POR ITEM DEL DUS';
    worksheet.getCell(`C${filaPeso}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${filaPeso}`).alignment = { horizontal: 'left', vertical: 'middle' };
    filaPeso++;

    const formatPeso = (valor: number | string | null | undefined): string => {
      const num = Number(valor);
      if (isNaN(num)) return '';
      return (num * 1000).toLocaleString('es-CL'); // Formato chileno: punto como separador de miles
    };

    const datosPesoCol1 = [
      { label: 'N° de item del DUS', value: '' },
      { label: 'Fecha de inicio muestreo', value: lote.fLote },
      { label: 'Fecha inicio embarque', value: lote.fLote },
      { label: 'Cantidad de contenedores', value: '' },
      { label: 'Peso bruto húmedo (kg)', value: formatPeso(lote.pesoBrutoHumedo) + ' kg' },
      { label: 'Peso neto húmedo (kg)', value: formatPeso(lote.pesoNetoHumedo) + ' kg' },
      { label: 'Peso neto seco (kg)', value: formatPeso(lote.pesoNetoSeco) + ' kg' },
      { label: 'Identificación bodega', value: bodegasUnicasString },
    ];

    let filaCol3 = filaPeso;
    datosPesoCol1.forEach(({ label, value }) => {
      worksheet.getCell(`C${filaCol3}`).value = label;
      worksheet.getCell(`D${filaCol3}`).value = ':';
      worksheet.getCell(`E${filaCol3}`).value = value ?? 'No aplica';
      filaCol3++;
    });

    let filaCol4 = filaPeso;
    const datosPesoCol2 = [
      { label: 'Término muestreo', value: lote.fechaTermino },
      { label: 'Término embarque', value: lote.fechaTermino },
      { label: 'Cantidad de sacos', value: '' },
      { label: 'Peso tara (kg)', value: formatPeso(lote.pesoTara) + ' kg' },
      { label: 'Humedad', value: lote.porcHumedad },
    ];

    datosPesoCol2.forEach(({ label, value }) => {
      worksheet.mergeCells(`H${filaCol4}:I${filaCol4}`);
      worksheet.getCell(`H${filaCol4}`).value = label;
      worksheet.getCell(`J${filaCol4}`).value = ':';
      worksheet.getCell(`K${filaCol4}`).value = value ?? 'No aplica';
      filaCol4++;
    });

    // ----------- PESOS EMBARCADOS DEL DUS ----------------
    let filaPesosDUS = Math.max(filaCol3, filaCol4) + 1;
    worksheet.mergeCells(`C${filaPesosDUS}:K${filaPesosDUS}`);
    worksheet.getCell(`C${filaPesosDUS}`).value = 'III PESOS EMBARCADOS DEL DUS';
    worksheet.getCell(`C${filaPesosDUS}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${filaPesosDUS}`).alignment = { horizontal: 'left', vertical: 'middle' };
    filaPesosDUS++;

    worksheet.getCell(`C${filaPesosDUS}`).value = 'Peso Neto Húmedo (kg)';
    worksheet.getCell(`D${filaPesosDUS}`).value = ':';
    // Obtener el valor original (puede venir como string o número)
    let pesoNetoHumedo = lote.pesoNetoHumedo ?? null;

    if (pesoNetoHumedo !== null && !isNaN(Number(pesoNetoHumedo))) {
      const valor = Number(pesoNetoHumedo) * 1000;

      // Formatear como string con punto como separador
      const valorConPuntos = valor.toLocaleString('de-DE'); // Ej: 10.000.000

      worksheet.getCell(`E${filaPesosDUS}`).value = `${valorConPuntos} kg`;
    } else {
      worksheet.getCell(`E${filaPesosDUS}`).value = 'No aplica';
    }
    filaPesosDUS++;

    worksheet.getCell(`C${filaPesosDUS}`).value = 'Determinación de peso realizada por';
    worksheet.getCell(`D${filaPesosDUS}`).value = ':';
    worksheet.getCell(`E${filaPesosDUS}`).value = 'Pesómetro';

    let filaCasilla = filaPesosDUS + 1;

    const metodosPeso = [
      { nombre: 'Pesómetro', nota: false },
      { nombre: 'Báscula', nota: false },
      { nombre: 'Draft Survey*', nota: true },
    ];

    metodosPeso.forEach(({ nombre, nota }) => {
      worksheet.getCell(`F${filaCasilla}`).value = nombre;

      // Agregar bordes negros a la casilla en G
      worksheet.getCell(`G${filaCasilla}`).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };

      // Marcar con "X" si es Pesómetro
      if (nombre === 'Pesómetro') {
        worksheet.getCell(`G${filaCasilla}`).value = 'X';
        worksheet.getCell(`G${filaCasilla}`).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(`G${filaCasilla}`).font = { bold: true };
      }

      if (nota) {
        worksheet.getCell(`H${filaCasilla}`).value = '(*Solo cuando está autorizado por el servicio)';
        worksheet.getCell(`H${filaCasilla}`).font = { italic: true, size: 9 };
        worksheet.getCell(`H${filaCasilla}`).alignment = { horizontal: 'left' };
      }

      filaCasilla++;
    });

    // ----------- INFORMACIÓN DE EQUIPO CONTROL ----------------
    let filaEquipoControl = filaCasilla + 1;
    worksheet.mergeCells(`C${filaEquipoControl}:K${filaEquipoControl}`);
    worksheet.getCell(`C${filaEquipoControl}`).value = 'IV INFORMACIÓN DE EQUIPO CONTROL';
    worksheet.getCell(`C${filaEquipoControl}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${filaEquipoControl}`).alignment = { horizontal: 'left', vertical: 'middle' };
    filaEquipoControl++;

    const datosEquipo = [
      { label: 'Marca del equipo de control de peso', value: this.pesometro.marca },
      { label: 'Capacidad del equipo de control de peso', value: this.pesometro.capacidad + ' tmh/hr' },
      { label: 'Código y fecha de última calibración', value: this.pesometro.codigo + ' / ' + this.pesometro.fechaCalibracion },
    ];
    datosEquipo.forEach(({ label, value }) => {
      worksheet.getCell(`C${filaEquipoControl}:D${filaEquipoControl}`).value = label;
      worksheet.getCell(`E${filaEquipoControl}`).value = ':';
      worksheet.getCell(`F${filaEquipoControl}`).value = value;
      filaEquipoControl++;
    });

    // ----------- NOTAS ----------------
    filaEquipoControl++;
    const notasPie = [
      '1: Indicar el nombre del laboratorio a quien entrega la muestra y emitirá el informe de calidad',
      '2: Este dato solo se completa cuando se trate de embarques de concentrado acondicionado en contenedores',
      '3: Este dato solo se completa cuando el concentrado se embarca en maxisacos',
      '4: El peso bruto húmedo y peso tara solo se indica cuando el concentrado se embarca en contenedores. ' +
      'Adicionalmente en la siguiente página, se deberá identificar cada contenedor, señalando peso bruto, ' +
      'peso neto húmedo y porcentaje de humedad',
      '5: En embarque de concentrado a granel y si la bodega es compartida por más de un DUS, indicar la bodega y el DUS que la comparte',
      '   Ej: BODEGA 1 (N° DUS (1), cantidad kg; N° DUS (2), cantidad Kg); BODEGA 2 (N° DUS(1), cantidad kg)',
    ];
    notasPie.forEach((nota) => {
      worksheet.mergeCells(`C${filaEquipoControl}:N${filaEquipoControl}`);
      worksheet.getCell(`C${filaEquipoControl}`).value = nota;
      worksheet.getCell(`C${filaEquipoControl}`).font = { size: 8, italic: true };
      worksheet.getCell(`C${filaEquipoControl}`).alignment = { horizontal: 'left', wrapText: true };
      filaEquipoControl++;
    });

    // ----------- ESPACIO MANUAL PARA SEPARAR LAS PARTES ----------------
    const filaInicioSegundaParte = 58;

    // ----------- SEGUNDA PARTE (CONTENEDORES) ----------------
    let filaCont = filaInicioSegundaParte;

    worksheet.getCell(`N55`).value = 'ALS Inspection Chile Spa';
    worksheet.getCell(`N56`).value = 'Calle Limache 3405, Office 61';
    worksheet.getCell(`N57`).value = 'Viña del Mar, CHILE';
    worksheet.getCell(`N58`).value = 'T +56 32 254 5500';

    ['N55', 'N56', 'N57', 'N58'].forEach(cell => {
      worksheet.getCell(cell).alignment = { horizontal: 'right' };
      worksheet.getCell(cell).font = { size: 10 }; // Puedes ajustar tamaño
    });

    worksheet.mergeCells(`D${filaCont}:H${filaCont}`);
    worksheet.getCell(`D${filaCont}`).value = 'INFORME DE PESO';
    worksheet.getCell(`D${filaCont}`).font = { bold: true, size: 14 };
    worksheet.getCell(`D${filaCont}`).alignment = { horizontal: 'center', vertical: 'middle' };
    filaCont++;

    worksheet.mergeCells(`D${filaCont}:H${filaCont}`);
    worksheet.getCell(`D${filaCont}`).value = 'CONCENTRADO DE COBRE QUE AMPARA EL DUS N° DUS';
    worksheet.getCell(`D${filaCont}`).font = { bold: true, size: 12 };
    worksheet.getCell(`D${filaCont}`).alignment = { horizontal: 'center', vertical: 'middle' };
    filaCont++;

    worksheet.mergeCells(`D${filaCont}:H${filaCont}`);
    worksheet.getCell(`D${filaCont}`).value = 'ALS INSPECTION CHILE SpA';
    worksheet.getCell(`D${filaCont}`).font = { bold: true, size: 12 };
    worksheet.getCell(`D${filaCont}`).alignment = { horizontal: 'center', vertical: 'middle' };
    filaCont++;

    // ----------- PRIMERA TABLA ----------------
    filaCont += 1;
    // Encabezado principal
    worksheet.mergeCells(`C${filaCont}:H${filaCont}`);
    worksheet.getCell(`C${filaCont}`).value = 'V INFORMACIÓN GENERAL PARA EMBARQUES EN CONTENEDORES';
    worksheet.getCell(`C${filaCont}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${filaCont}`).alignment = { horizontal: 'left' };
    filaCont++;

    // Subencabezado
    worksheet.mergeCells(`C${filaCont}:C${filaCont + 1}`);
    worksheet.getCell(`C${filaCont}`).value = 'Lote';
    worksheet.getCell(`C${filaCont}`).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(`C${filaCont}`).font = { bold: true };

    worksheet.mergeCells(`D${filaCont}:E${filaCont}`);
    worksheet.getCell(`D${filaCont}`).value = 'Fecha de consolidación';
    worksheet.getCell(`D${filaCont}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`D${filaCont}`).font = { bold: true };

    worksheet.mergeCells(`F${filaCont}:H${filaCont}`);
    worksheet.getCell(`F${filaCont}`).value = 'Peso húmedo (kg)';
    worksheet.getCell(`F${filaCont}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`F${filaCont}`).font = { bold: true };

    worksheet.mergeCells(`I${filaCont}:J${filaCont}`); // Fusión horizontal
    worksheet.getCell(`I${filaCont}`).value = 'Humedad';
    worksheet.getCell(`I${filaCont}`).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(`I${filaCont}`).font = { bold: true };

    worksheet.mergeCells(`K${filaCont + 1}`);
    worksheet.getCell(`K${filaCont}`).value = 'Peso seco neto';
    worksheet.getCell(`K${filaCont}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`K${filaCont}`).font = { bold: true };

    filaCont += 1;

    // Segunda fila (inicio/término/tara/etc.)
    worksheet.getCell(`D${filaCont}`).value = 'Inicio';
    worksheet.getCell(`E${filaCont}`).value = 'Término';
    worksheet.getCell(`F${filaCont}`).value = 'Tara';
    worksheet.getCell(`G${filaCont}`).value = 'Bruto';
    worksheet.getCell(`H${filaCont}`).value = 'Neto';

    // Aplicar bordes delgados (encabezado y subencabezado: C a K)
    for (let col = 3; col <= 11; col++) {
      for (let row = filaCont - 1; row <= filaCont; row++) {
        const cell = worksheet.getRow(row).getCell(col);
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      }
    }

    filaCont++;

    // Celdas vacías para ingresar datos
    for (let i = 0; i < 5; i++) {
      for (let col = 3; col <= 11; col++) {
        const cell = worksheet.getRow(filaCont + i).getCell(col);
        cell.value = '';
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      }
    }
    filaCont += 5 + 2;

    // ----------- SEGUNDA TABLA ----------------

    worksheet.mergeCells(`C${filaCont}:O${filaCont}`);
    worksheet.getCell(`C${filaCont}`).value = 'VI DETALLE PESO EMBARCADO POR LOTE PARA EMBARQUES EN CONTENEDORES';
    worksheet.getCell(`C${filaCont}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${filaCont}`).alignment = { horizontal: 'left' };
    filaCont++;

    worksheet.mergeCells(`C${filaCont}:O${filaCont}`);
    worksheet.getCell(`C${filaCont}`).value = '(Si se embarca en contenedores, se debe completar este cuadro y se debe replicar para cada lote)';
    worksheet.getCell(`C${filaCont}`).font = { italic: true, size: 10 };
    worksheet.getCell(`C${filaCont}`).alignment = { horizontal: 'left' };
    filaCont += 2;

    // Fusión vertical de encabezados principales
    worksheet.mergeCells(`C${filaCont}:C${filaCont + 1}`);
    worksheet.getCell(`C${filaCont}`).value = 'Lote';

    worksheet.mergeCells(`D${filaCont}:D${filaCont + 1}`);
    worksheet.getCell(`D${filaCont}`).value = 'Fecha';

    worksheet.mergeCells(`E${filaCont}:E${filaCont + 1}`);
    worksheet.getCell(`E${filaCont}`).value = 'Contenedor';

    worksheet.mergeCells(`F${filaCont}:F${filaCont + 1}`);
    worksheet.getCell(`F${filaCont}`).value = 'Sello O.I.';

    worksheet.getCell(`G${filaCont}`).value = 'Sacos';
    worksheet.getCell(`G${filaCont + 1}`).value = 'Cantidad';

    // Peso húmedo general (título principal)
    worksheet.mergeCells(`H${filaCont}:L${filaCont}`);
    worksheet.getCell(`H${filaCont}`).value = 'Peso húmedo (kg)';

    // Subcolumnas de peso húmedo
    worksheet.getCell(`H${filaCont + 1}`).value = 'Tara';
    worksheet.mergeCells(`I${filaCont + 1}:J${filaCont + 1}`);
    worksheet.getCell(`I${filaCont + 1}`).value = 'Bruto';
    worksheet.mergeCells(`K${filaCont + 1}:L${filaCont + 1}`);
    worksheet.getCell(`K${filaCont + 1}`).value = 'Neto';

    // Humedad y peso seco
    worksheet.mergeCells(`M${filaCont}:M${filaCont + 1}`);
    worksheet.getCell(`M${filaCont}`).value = 'Humedad';

    worksheet.mergeCells(`N${filaCont}:N${filaCont + 1}`);
    worksheet.getCell(`N${filaCont}`).value = 'Peso seco neto';

    // Bordes para encabezado (2 filas desde C hasta N)
    for (let rowOffset = 0; rowOffset <= 1; rowOffset++) {
      const row = worksheet.getRow(filaCont + rowOffset);
      for (let col = 3; col <= 14; col++) { // C=3 ... N=14
        const cell = row.getCell(col);
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
    filaCont += 2;

    // 6 filas en blanco con bordes gruesos para ingreso manual
    for (let i = 0; i < 6; i++) {
      for (let col = 3; col <= 14; col++) {
        const cell = worksheet.getRow(filaCont + i).getCell(col);
        cell.value = '';
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      }
    }
    filaCont += 6 + 1;

    // ----------- MODULO DE ORGANISMO ----------------

    worksheet.mergeCells(`C${filaCont}:H${filaCont}`);
    worksheet.getCell(`C${filaCont}`).value = 'VII DATOS ORGANISMO DE INSPECCION';
    worksheet.getCell(`C${filaCont}`).font = { bold: true };
    filaCont++;

    worksheet.getCell(`C${filaCont}`).value = 'RUT ALS INSPECTION CHILE SPA';
    filaCont++;

    worksheet.getCell(`C${filaCont}`).value = 'NOMBRE REPRESENTANTE LEGAL: HUMBERTO ARROYO';
    filaCont++;

    worksheet.getCell(`C${filaCont}`).value = 'RUT REPRESENTANTE LEGAL: 9.271.486-1';
    filaCont += 3;

    const datosPie = [
      'BRUNO ACEVEDO',
      'ALSINSPECTION CHILE SPA',
      '(AREA MINERALES)'
    ];

    datosPie.forEach((texto, i) => {
      worksheet.mergeCells(`J${filaCont + i}:N${filaCont + i}`);
      worksheet.getCell(`J${filaCont + i}`).value = texto;
      worksheet.getCell(`J${filaCont + i}`).alignment = { horizontal: 'right' };
    });

    // ----------- BORDES EXTERNOS PRIMERA PÁGINA ----------------
    // Página 1: de B2 a O48
    for (let row = 2; row <= 48; row++) {
      for (let col = 2; col <= 15; col++) { // B (2) hasta O (15)
        const cell = worksheet.getRow(row).getCell(col);

        // Borde superior
        if (row === 2) {
          cell.border = { ...cell.border, top: { style: 'thick', color: { argb: '000000' } } };
        }

        // Borde inferior
        if (row === 48) {
          cell.border = { ...cell.border, bottom: { style: 'thick', color: { argb: '000000' } } };
        }

        // Borde izquierdo
        if (col === 2) {
          cell.border = { ...cell.border, left: { style: 'thick', color: { argb: '000000' } } };
        }

        // Borde derecho
        if (col === 15) {
          cell.border = { ...cell.border, right: { style: 'thick', color: { argb: '000000' } } };
        }
      }
    }

    // ----------- BORDES EXTERNOS SEGUNDA PÁGINA ----------------
    for (let row = 54; row <= 100; row++) {
      for (let col = 2; col <= 15; col++) {
        const cell = worksheet.getRow(row).getCell(col);
        if (row === 54) {
          cell.border = { ...cell.border, top: { style: 'thick', color: { argb: '000000' } } };
        }
        if (row === 100) {
          cell.border = { ...cell.border, bottom: { style: 'thick', color: { argb: '000000' } } };
        }
        if (col === 2) {
          cell.border = { ...cell.border, left: { style: 'thick', color: { argb: '000000' } } };
        }
        if (col === 15) {
          cell.border = { ...cell.border, right: { style: 'thick', color: { argb: '000000' } } };
        }
      }
    }

    worksheet.pageSetup.margins = {
      top: 0.5,
      bottom: 0.5,
      left: 0.4,
      right: 0.4,
      header: 0.5,
      footer: 0.5
    };

    worksheet.pageSetup.orientation = 'landscape';
    worksheet.pageSetup.fitToPage = false;    // ← Desactiva para usar scale
    worksheet.pageSetup.scale = 70;          // ← Aumenta tamaño del contenido

    worksheet.pageSetup.printArea = 'A1:O100';
    worksheet.pageSetup.horizontalCentered = true;
    worksheet.pageSetup.verticalCentered = true;

    // ----------- EXPORTAR EXCEL Y CONVERTIR A PDF ----------------
    workbook.xlsx.writeBuffer().then((buffer) => {
      const formData = new FormData();
      const archivoExcel = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      formData.append('file', archivoExcel, 'Informe_Pesos.xlsx');

      this.http.post('https://control.als-inspection.cl/api_min/api/convertirexcelpdf/', formData, {
        responseType: 'blob'
      }).subscribe((pdfBlob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'Informe_Pesos.pdf';
        link.click();
      }, error => {
        console.error('Error al convertir a PDF:', error);
      });
    });
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
    this.rolService.getRoles(localStorage.getItem('email') || '')
      .subscribe(roles => {
        if (roles.includes('Admin')) {
          this.admin = true;
          this.operator = false;
          this.encargado = false;
          return;
        }else if (roles.includes('Operador')) {
          this.operator = true;
          this.admin = false;
          this.encargado = false;
          return;
        }
        else if (roles.includes('Encargado')) {
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
      bodega: [this.data.bodega],
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
      bodega: [this.data.bodega],
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

  guardar() {
    this.embarqueTransporteForm.patchValue({
      pesoLote: Math.abs(
        this.embarqueTransporteForm.get('odometroFinal')?.value -
          this.embarqueTransporteForm.get('odometroInicial')?.value
      ).toFixed(2),
    });
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
    this.ngOnInit(); // Cierra el diálogo sin devolver valor
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

      // if (formData.odometroInicial > formData.odometroFinal) {
      //   Notiflix.Notify.failure(
      //     'El odometro inicial no puede ser mayor al final'
      //   );
      //   return;
      // }
      // if (formData.fechaInicial > formData.fechaFinal) {
      //   Notiflix.Notify.failure(
      //     'La fecha inicial no puede ser mayor a la final'
      //   );
      //   return;
      // }
      // if (formData.horaInicial > formData.horaFinal) {
      //   Notiflix.Notify.failure(
      //     'La hora inicial no puede ser mayor a la final'
      //   );
      //   return;
      // }
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
    if (
      this.embarqueTransporteForm.value.odometroInicial === 0 ||
      this.embarqueTransporteForm.value.odometroFinal === 0
    ) {
      Notiflix.Notify.failure('Debe ingresar los odometros para aprobar');
      return;
    }
    if (
      this.embarqueTransporteForm.value.id === null ||
      this.embarqueTransporteForm.value.id === undefined
    ) {
      Notiflix.Notify.failure('Debe guardar el registro antes de aprobar');
      return;
    }
    if (this.embarqueTransporteForm.value.estado === 'aprobado') {
      Notiflix.Notify.failure('El registro ya se encuentra aprobado');
      return;
    }
    console.log('Formulario enviado:', formData);
    if (this.embarqueTransporteForm.valid) {
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
        }
      );
    } else {
      Notiflix.Notify.failure('El formulario no es válido');
    }
  }

  eliminarSublote(): void {
    const subloteId = this.embarqueTransporteForm.value.id;
    const nLote = this.embarqueTransporteForm.value.nLote;

    // Validar que el sublote existe
    if (!subloteId) {
      Notiflix.Notify.failure('No se puede eliminar un sublote sin ID');
      return;
    }

    // Validar que el sublote no esté aprobado
    if (this.embarqueTransporteForm.value.estado === 'aprobado') {
      Notiflix.Notify.failure('No se puede eliminar un sublote aprobado');
      return;
    }

    // Mostrar confirmación de Notiflix
    Notiflix.Confirm.show(
      'Confirmar eliminación',
      `¿Está seguro que desea eliminar este sublote del lote ${nLote}?`,
      'Sí, eliminar',
      'Cancelar',
      () => {
        // Usuario confirmó la eliminación
        this.http
          .delete(
            `https://control.als-inspection.cl/api_min/api/despacho-embarque/${subloteId}/`
          )
          .subscribe(
            (response) => {
              console.log('Sublote eliminado correctamente:', response);
              Notiflix.Notify.success('Sublote eliminado correctamente');
              // Cerrar el diálogo y notificar al componente padre para que actualice
              this.dialogRef.close({ deleted: true });
            },
            (error) => {
              console.error('Error al eliminar el sublote:', error);
              Notiflix.Notify.failure('Error al eliminar el sublote');
            }
          );
      },
      () => {
        // Usuario canceló la eliminación
        Notiflix.Notify.info('Eliminación cancelada');
      },
      {
        width: '400px',
        borderRadius: '8px',
      }
    );
  }
}
