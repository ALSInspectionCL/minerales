import { bodega } from './../../services/bodega.service';
import { LoteService } from 'src/app/services/lote.service';
import { Bodega } from 'src/app/services/bodega.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import {
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { FiveDayRangeSelectionStrategy } from '../formularios/formularios.component';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { map, Observable, startWith } from 'rxjs';
import Notiflix from 'notiflix';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import * as ExcelJS from 'exceljs';
import { ExcelKPIService } from 'src/app/services/excel-kpi.service';
import { ExcelsService } from 'src/app/services/excels.service';

@Component({
  selector: 'app-reportes',
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
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class ReportesComponent {
  fechaDesde: Date;
  fechaHasta: Date;
  f2FechaDesde: Date;
  f2FechaHasta: Date;
  f2IdServicio: any;
  f2Servicios: any;
  f2IdSolicitud: any;
  f2SolicitudesFiltradas: any[];
  camionesRecepcion: any[] = [];
  vagonesRecepcion: any[] = [];
  lotesResumen: any[] = [];
  bodegas: any[] = [];
  lotes: any[] = [];
  solicitudesFiltradas: any[];
  solicitudes: any[] = [];
  servicios: any[] = [];
  tablaCamion: any[] = [];
  tablaVagon: any[] = [];
  idServicio: any;
  idSolicitud: any;
  tipoDocumento: string;
  generado: any;
  loteKPI: any;

  opciones = [
    { value: 'Reporte Ingresos', label: 'Reporte Ingresos ' },
    { value: 'Reporte KPI', label: 'Reporte KPI' },
    { value: 'Informe Ingresos', label: 'Informe Ingresos'}
    // { value: 'Control de Actividad', label: 'Control de Actividades' },
    // { value: 'Ingresos', label: 'Ingresos' },
    // { value: 'Despachos', label: 'Despachos' },
  ];

  documento = new FormControl('');
  @ViewChild('paginator1', { static: true }) paginator: MatPaginator;
  @ViewChild('paginator2', { static: true }) paginator2: MatPaginator;
  opcionesFiltradas: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private kpi: ExcelKPIService,
    private loteService: LoteService,
    private dateAdapter: DateAdapter<Date>,
    private excelService: ExcelsService
    
  ) {

    this.dateAdapter.setLocale('es-ES');

    this.opcionesFiltradas = this.documento.valueChanges.pipe(
      startWith(''),
      map((value) => this.filtrarOpciones(value))
    );
  }

  ngOnInit() {
    this.obtenerServicios();
    this.obtenerSolicitudes();
    this.obtenerBodegas();
    this.fechaDesde = new Date();
    this.fechaDesde.setDate(1);
    this.fechaDesde.setHours(0, 0, 0, 0);
    this.fechaHasta = new Date();
    this.getLotes();
  }

  descargarKPI() {
    // console.log(this.fechaDesde);
    // console.log(this.fechaHasta);
    // console.log(this.idServicio);
    // console.log(this.idSolicitud);
    // console.log('--------------');
    // console.log(this.loteKPI);
    // console.log('--------------');

    if (!this.fechaDesde || !this.fechaHasta) {
      Notiflix.Notify.warning('Debe seleccionar un rango de fechas válido');
      return;
    }

    // 🔍 Filtrar lotes por rango de fechas + servicio/solicitud
    const loteFiltrado = this.loteKPI.filter((lote: any) => {
      if (!lote.fLote) return false; // por si algún lote no tiene fecha

      const fechaLote = new Date(lote.fLote);

      // Validación de rango de fechas
      const dentroDeRango = fechaLote >= this.fechaDesde && fechaLote <= this.fechaHasta;

      // Validación de servicio/solicitud (si están seleccionados)
      const coincideServicio = !this.idServicio || lote.servicio === this.idServicio;
      const coincideSolicitud = !this.idSolicitud || lote.solicitud === this.idSolicitud;

      return dentroDeRango && coincideServicio && coincideSolicitud;
    });

    if (loteFiltrado.length === 0) {
      Notiflix.Notify.warning('No hay lotes que coincidan con los filtros seleccionados');
      return;
    }

    // 📌 Ordenar primero por servicio, luego por solicitud, y finalmente por fecha fLote
    loteFiltrado.sort((a: any, b: any) => {
      if (a.nombre_servicio !== b.nombre_servicio) {
        return a.nombre_servicio.localeCompare(b.nombre_servicio);
      }
      if (a.nombre_solicitud !== b.nombre_solicitud) {
        return a.nombre_solicitud.localeCompare(b.nombre_solicitud);
      }
      return new Date(a.fLote).getTime() - new Date(b.fLote).getTime();
    });

    // 📥 Descargar Excel con los lotes filtrados y ordenados
    this.kpi.descargarExcelResumenLote(loteFiltrado);

    // console.log('📊 Lotes filtrados y ordenados para KPI:', loteFiltrado);
  }


  generarTablas() {
    console.log(this.fechaDesde);
    console.log(this.fechaHasta);
    console.log(this.idServicio);
    console.log(this.idSolicitud);
    console.log(this.documento.value);

    if (!this.fechaDesde || !this.fechaHasta) {
      Notiflix.Notify.warning('Seleccione fechas');
      return;
    }

    if (!this.documento.value) {
      Notiflix.Notify.warning('Seleccione un tipo de documento');
      return;
    }

    // 👉 Condicional según el tipo de documento
    if (this.documento.value === 'Reporte Ingresos') {
      let apiLote = 'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
      if (this.idServicio) {
        apiLote += `?servicio=${this.idServicio}`;
      }

      this.http.get<any[]>(apiLote).subscribe((lotes) => {
        if (this.idSolicitud) {
          lotes = lotes.filter((lote) => lote.solicitud === this.idSolicitud);
        }

        if (lotes.length === 0) {
          Notiflix.Notify.warning('No hay registros para mostrar.');
          return;
        }

        this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/recepcion-transporte/').subscribe((registros) => {
          let camionesRecepcion = registros.filter((camion) => camion.tipoTransporte === 'Camion');
          this.tablaCamion = [];

          let nLotes: string[] = [];

          lotes.forEach((lote) => {
            const camiones = camionesRecepcion.filter((camion) => camion.nLote === lote.nLote);
            camiones.forEach((camion) => {
              const registro = {
                tipoTransporte: camion.tipoTransporte,
                observacion: lote.observacion,
                nLote: lote.nLote,
                fOrigen: camion.fOrigen,
                hOrigen: camion.hOrigen,
                idTransporteOrigen: camion.idTransporteOrigen,
                idTransporteDestino: camion.idTransporteDestino,
                sellosOrigen: camion.sellosOrigen,
                brutoOrigen: camion.brutoOrigen,
                taraOrigen: camion.taraOrigen,
                netoHumedad: (camion.brutoOrigen - camion.taraOrigen).toFixed(2),
                netoHumedoOrigen: camion.netoHumedoOrigen,
                camion: camion.idTransporteDestino,
                fDestino: camion.fDestino,
                hDestino: camion.hDestino,
                batea: camion.idCarroDestino,
                sellosDestino: camion.sellosDestino,
                brutoDestino: camion.brutoDestino,
                taraDestino: camion.taraDestino,
                netoHumedoDestino: camion.netoHumedoDestino,
                // ✅ Cálculo del neto seco del camión:
                netoSeco: (
                  camion.netoHumedoDestino -
                  (camion.netoHumedoDestino * (lote.porcHumedad || 0)) / 100
                ).toFixed(3),

                diferenciaHumeda: (camion.netoHumedoOrigen - camion.netoHumedoDestino).toFixed(2),
                diferenciaSeca: (
                  camion.netoHumedoOrigen -
                  (camion.netoHumedoOrigen * (lote.porcHumedad || 0)) / 100 -
                  (
                    camion.netoHumedoDestino -
                    (camion.netoHumedoDestino * (lote.porcHumedad || 0)) / 100
                  )
                ).toFixed(2),

                CuFino: camion.CuFino,
                estado: camion.estado,
                bodega: camion.bodega,
                pesoNetoSeco: lote.pesoNetoSeco ?? 0, // 👈 directo del lote
                porcHumedad: Number(lote.porcHumedad) || 0,    // 👈 tomado del lote
                id: camion.id
              };
              this.tablaCamion.push(registro);

              if (!nLotes.includes(lote.nLote)) {
                nLotes.push(lote.nLote);
              }
            });
          });

          // Normalizar fechas seleccionadas a YYYY-MM-DD
          const desdeStr = this.toFechaStr(this.fechaDesde);
          const hastaStr = this.toFechaStr(this.fechaHasta);

          this.tablaCamion = this.tablaCamion.filter((camion) => {
            const fechaStr = this.toFechaStr(camion.fDestino);
            return fechaStr >= desdeStr && fechaStr <= hastaStr;
          });

          // Mapear bodegas
          this.tablaCamion.forEach((camion) => {
            const bodega = this.bodegas.find((b) => b.idBodega == camion.bodega);
            if (bodega) camion.bodega = bodega.nombreBodega;
          });

          // Obtener posición dentro del lote
          let conteos: any = {};
          this.tablaCamion.forEach((camion) => {
            conteos[camion.nLote] = (conteos[camion.nLote] || 0) + 1;
            camion.posicion = conteos[camion.nLote] - 1;
          });

          console.log(this.tablaCamion);

          this.camionesRecepcion = this.tablaCamion;
          this.lotesResumen = this.generarResumenLotes(this.tablaCamion);
          this.generado = true;

          if (this.tablaCamion.length > 0) {
            Notiflix.Notify.success('Camiones encontrados.');
          } else {
            Notiflix.Notify.warning('No se encontraron camiones.');
          }

          this.cdr.detectChanges();
        });
      });

    } else if (this.documento.value === 'Control de Actividad') {
      // 🔽 Nuevo flujo: solo descargar KPI
      this.descargarKPI();
    } else if (this.documento.value === 'Reporte KPI') {
      this.http
        .get('https://control.als-inspection.cl/api_min/api/lote-despacho/')
        .subscribe((response: any) => {
          const registros = response;
          console.log('Todos los registros de despacho');
          console.log(registros);
          //Filtrar los registros según las fechas ingresadas. Si no hay fecha ingresada, traer todos los lotes.
          const lotes = registros.filter((lote: any) => {
            const fechaLote = new Date(lote.fLote);
            return (
              fechaLote >= this.fechaDesde && fechaLote <= this.fechaHasta
            );
          });
          this.kpi.descargarExcelResumenLote(lotes);
        });
    } else if (this.documento.value === 'Informe Ingresos'){
      this.generarInformeIngresos();
      
    }


  }

  private toFechaStr(fecha: string | Date): string {
    if (!fecha) return '';

    if (typeof fecha === 'string' && fecha.length === 10) {
      return fecha; // ya viene como YYYY-MM-DD
    }

    const f = new Date(fecha);

    if (isNaN(f.getTime())) {
      console.warn('Fecha inválida detectada:', fecha);
      return '';
    }

    const year = f.getFullYear();
    const month = String(f.getMonth() + 1).padStart(2, '0');
    const day = String(f.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private generarResumenLotes(camiones: any[]) {
    return camiones.reduce((lotes: any[], camion: any) => {
      const index = lotes.findIndex((l) => l.nLote === camion.nLote);

      // Convertir siempre a number
      const netoHumedoOrigen = parseFloat(camion.netoHumedoOrigen) || 0;
      const netoHumedoDestino = parseFloat(camion.netoHumedoDestino) || 0;
      const diferenciaHumeda = parseFloat(camion.diferenciaHumeda) || 0;
      const diferenciaSeca = parseFloat(camion.diferenciaSeca) || 0;
      const porcHumedad = parseFloat(camion.porcHumedad) || 0; // 👈 desde el lote
      const pesoNetoSeco = parseFloat(camion.pesoNetoSeco) || 0; // 👈 desde el lote

      if (index === -1) {
        lotes.push({
          nLote: camion.nLote,
          observacion: camion.observacion,
          cantidadCamiones: 1,
          netoHumedoOrigen,
          netoHumedoDestino,
          diferenciaHumeda,
          diferenciaSeca,
          porcHumedad,
          pesoNetoSeco, // ✅ directo del lote
        });
      } else {
        lotes[index].cantidadCamiones += 1;
        lotes[index].netoHumedoOrigen += netoHumedoOrigen;
        lotes[index].netoHumedoDestino += netoHumedoDestino;
        lotes[index].diferenciaHumeda += diferenciaHumeda;
        lotes[index].diferenciaSeca += diferenciaSeca;

        // ✅ Mantener valores del lote (no se promedian ni suman)
        lotes[index].porcHumedad = porcHumedad;
        lotes[index].pesoNetoSeco = pesoNetoSeco;
      }

      return lotes;
    }, []).map((lote) => ({
      ...lote,
      netoHumedoOrigen: lote.netoHumedoOrigen.toFixed(3),
      netoHumedoDestino: lote.netoHumedoDestino.toFixed(3),
      diferenciaHumeda: lote.diferenciaHumeda.toFixed(3),
      diferenciaSeca: lote.diferenciaSeca.toFixed(3),
      pesoNetoSeco: lote.pesoNetoSeco ? lote.pesoNetoSeco.toFixed(3) : '0.000',
      porcHumedad: lote.porcHumedad ? lote.porcHumedad.toFixed(4) : '0.0000',
    }));
  }


  // descargarExcel() {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('Tabla Camion');
  //   // Establecer los encabezados de la tabla
  //   const headers = [
  //     'Tipo de Transporte',
  //     'Referencia',
  //     'Fecha de Origen',
  //     'Hora de Origen',
  //     'Guía de Despacho',
  //     'Sellos de Origen',
  //     'TPC',
  //     'Camión',
  //     'Batea',
  //     'Bruto de Origen',
  //     'Tara de Origen',
  //     'Neto de Humedad',
  //     'Fecha de Destino',
  //     'Hora de Destino',
  //     'Bruto de Destino',
  //     'Tara de Destino',
  //     'Neto de Humedad Destino',
  //     'Diferencia de Humedad',
  //     'Diferencia Seca',
  //     'CuFino',
  //     'Estado',
  //     'Bodega'
  //   ];
  //   for (let i = 0; i < 4; i++) {
  //     worksheet.addRow([]);
  //   }


  //   // Título en D2
  //   worksheet.getCell('H2').value = 'Detalle de Camiones de Recepción';
  //   worksheet.getCell('H2').font = { name: 'Arial', size: 16, bold: true };
  //   worksheet.getCell('H2').alignment = { horizontal: 'center' };

  //   // Agregar los encabezados a la tabla
  //   worksheet.addRow(headers).eachCell((cell) => {
  //     if (cell.value !== '') {
  //       cell.font = {
  //         name: 'Calibri',
  //         size: 11,
  //         bold: true,
  //         color: { argb: 'FFFFFF' },
  //       };
  //       cell.alignment = { horizontal: 'center' };
  //       cell.fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: '337dff' },
  //       };
  //       cell.border = {
  //         top: { style: 'thin' },
  //         left: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         right: { style: 'thin' },
  //       };
  //     }
  //   });


  //   worksheet.columns = [
  //     { width: 15 }, // tipoTransporte
  //     { width: 15 }, // observacion
  //     { width: 15 }, // fOrigen
  //     { width: 15 }, // hOrigen
  //     { width: 15 }, // idTransporteOrigen
  //     { width: 20 }, // sellosOrigen
  //     { width: 10 }, // sellosDestino
  //     { width: 10 }, // camion
  //     { width: 10 }, // batea
  //     { width: 15 }, // brutoOrigen
  //     { width: 15 }, // taraOrigen
  //     { width: 15 }, // netoHumedad
  //     { width: 15 }, // fDestino
  //     { width: 10 }, // hDestino
  //     { width: 15 }, // brutoDestino
  //     { width: 15 }, // taraDestino
  //     { width: 15 }, // netoHumedoDestino
  //     { width: 15 }, // diferenciaHumeda
  //     { width: 15 }, // diferenciaSeca
  //     { width: 10 }, // CuFino
  //     { width: 10 }, // estado
  //     { width: 15 }, // bodega
  //   ];

  //   // Agregar los datos de la tabla
  //   this.tablaCamion.forEach((fila) => {
  //     worksheet.addRow([
  //       fila.tipoTransporte,
  //       fila.observacion,
  //       fila.fOrigen,
  //       fila.hOrigen,
  //       fila.idTransporteOrigen,
  //       fila.sellosOrigen,
  //       fila.sellosDestino,
  //       fila.camion,
  //       fila.batea,
  //       fila.brutoOrigen,
  //       fila.taraOrigen,
  //       fila.netoHumedad,
  //       fila.fDestino,
  //       fila.hDestino,
  //       fila.brutoDestino,
  //       fila.taraDestino,
  //       fila.netoHumedoDestino,
  //       fila.diferenciaHumeda,
  //       fila.diferenciaSeca,
  //       fila.CuFino,
  //       fila.estado,
  //       fila.bodega
  //     ])
  //   })

  //   fetch('assets/images/logos/als_logo_1.png')
  //     .then((res) => res.blob())
  //     .then((blob) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const base64data = reader.result as string;
  //         const base64 = base64data.split(',')[1];

  //         const binary = atob(base64);
  //         const len = binary.length;
  //         const imageBuffer = new Uint8Array(len);
  //         for (let i = 0; i < len; i++) {
  //           imageBuffer[i] = binary.charCodeAt(i);
  //         }

  //         const imageId = workbook.addImage({
  //           buffer: imageBuffer,
  //           extension: 'png',
  //         });

  //         worksheet.addImage(imageId, {
  //           tl: { col: 1, row: 1 },
  //           ext: { width: 65, height: 65 },
  //         });

  //         // Guardar archivo después de agregar imagen
  //         workbook.xlsx.writeBuffer().then((buffer) => {
  //           const blob = new Blob([buffer], {
  //             type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //           });
  //           const url = URL.createObjectURL(blob);

  //           const a = document.createElement('a');
  //           a.href = url;
  //           a.download = 'Reporte Camiones.xlsx';
  //           a.click();

  //         });
  //       };
  //       reader.readAsDataURL(blob);
  //     });


  // }

  obtenerServicios() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/servicio/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.servicios = data; // Asigna los servicios obtenidos a la variable
        this.f2Servicios = data;
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

  obtenerBodegas() {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/bodega/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.bodegas = data; // Asigna los servicios obtenidos a la variable
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener bodegas', error);
      }
    );
  }

  obtenerLotesRecepción(fechaInicio: string, fechaFin: string): void {
    this.http
      .get(
        `https://control.als-inspection.cl/api_min/api/lote-recepcion/?format=api&fLote=${fechaInicio}&fLote=${fechaFin}`
      )
      .subscribe((response) => {
        const loteRecepcion = (response as any[]).filter(
          (lote: any) =>
            lote.fechaRecepcion >= fechaInicio &&
            lote.fechaRecepcion <= fechaFin
        );
        console.log(loteRecepcion);
      });
  }

  filtrarOpciones(value: string | null): any[] {
    if (value === null) {
      return this.opciones;
    }
    const filterValue = value.toLowerCase();
    return this.opciones.filter((opcion) =>
      opcion.label.toLowerCase().includes(filterValue)
    );
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

  f2FiltrarSolicitudes(servicioId: any) {
    this.f2SolicitudesFiltradas = this.solicitudes.filter(
      (solicitud) => solicitud.nServ === servicioId
    );
  }

  f2GenerarTablas() {

  }

  f2DescargarExcel() {
    const solicitudId = this.f2IdSolicitud;
    const fechaInicio = this.f2FechaDesde ? new Date(this.f2FechaDesde) : null;
    const fechaFin = this.f2FechaHasta ? new Date(this.f2FechaHasta) : null;

    // Validaciones previas
    if (!solicitudId && (!fechaInicio || !fechaFin)) {
      Notiflix.Notify.failure('Debe seleccionar una solicitud o un rango de fechas para continuar.');
      return;
    }

    const apiUrl = `https://control.als-inspection.cl/api_min/api/lote-recepcion/`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: (todosLotes) => {
        let lotesFiltrados = todosLotes;

        // Filtrar por solicitud si está presente
        if (solicitudId) {
          lotesFiltrados = lotesFiltrados.filter(lote => lote.solicitud === solicitudId);
        }

        // Filtrar por fechas si ambas están presentes
        if (fechaInicio && fechaFin) {
          lotesFiltrados = lotesFiltrados.filter(lote => {
            const fechaLote = new Date(lote.fLote);
            return fechaLote >= fechaInicio && fechaLote <= fechaFin;
          });
        }

        if (lotesFiltrados.length > 0) {
          this.descargarExcelTrazabilidadDesdeLotes(lotesFiltrados);
        } else {
          Notiflix.Notify.warning('No se encontraron lotes que cumplan los criterios seleccionados.');
        }
      },
      error: (error) => {
        Notiflix.Notify.failure('Error al obtener los lotes.');
        console.error('Error al obtener los lotes:', error);
      }
    });
  }

  async descargarExcelTrazabilidadDesdeLotes(lotes: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Trazabilidad Mecánica');
    const servicios = await this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/servicio/').toPromise();
    const solicitudes = await this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/solicitud/').toPromise();


    const headers = [
      'ID',
      'Solicitud',
      'Servicio',
      'Ref ALS',
      'N° De Sobre',
      'Nave',
      'Bodega',
      'Material',
      'Muestreado Por',
      'Exportador',
      'Puerto Destino',
      'Contrato',
      'Cliente',
      'Cochilco',
      'Fecha Embarque',
      'DUS',
      'Fecha DUS',
      'Peso Neto Húmedo',
      'Peso Neto Seco',
      '% Humedad',
      'Responsable',
      'Observación',
      'Estado',
      'Fecha Instrucción Despacho',
      'Fecha Confirmación Despacho',
      'Fecha Despacho',
      'Número Guía',
      'Laboratorio',
      'Fecha Llegada Laboratorio',
      'País',
      'N° Interno',
    ];

    worksheet.mergeCells('E2:H2');
    worksheet.getCell('E2').value = 'Reporte de Trazabilidad Mecánica';
    worksheet.getCell('E2').font = { name: 'Arial', size: 16, bold: true };
    worksheet.getCell('E2').alignment = { horizontal: 'center' };

    worksheet.columns = new Array(headers.length).fill({ width: 18 });

    let currentRow = 5;

    // Título de la tabla
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value = `Sobres Externos`;
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial', size: 14, bold: true };
    worksheet.getCell(`B${currentRow}`).alignment = { horizontal: 'left' };
    currentRow++;

    // Encabezados
    const headerRow = worksheet.getRow(currentRow);
    headers.forEach((header, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '337dff' } };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    currentRow++;

    const data = await this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/').toPromise();

    for (const lote of lotes) {
      const Nlote = String(lote.nLote).trim().toLowerCase();

      const filtrado = data!.filter(item =>
        String(item.nLote).trim().toLowerCase() === Nlote &&
        item.tipoSobre === 'Externo'
      );

      filtrado.sort((a, b) => Number(a.nSublote) - Number(b.nSublote));

      filtrado.forEach(item => {
        const row = worksheet.getRow(currentRow++);
        const loteBase = lotes.find(l => String(l.nLote).trim().toLowerCase() === String(item.nLote).trim().toLowerCase());

        // Buscar nombre del servicio y solicitud a partir de los IDs en el lote
        const nombreServicio = servicios!.find(s => s.id === loteBase?.servicio)?.nServ || 'N/A';
        const refALS = servicios!.find(s => s.id === loteBase?.servicio)?.refAls || 'N/A';
        const nombreSolicitud = solicitudes!.find(s => s.id === loteBase?.solicitud)?.nSoli || 'N/A';

        row.values = [
          item.id,
          nombreSolicitud,
          nombreServicio,
          refALS,
          item.nSublote,
          item.nave,
          item.bodega,
          item.material,
          item.muestreadoPor,
          item.exportador,
          item.puertoDestino,
          item.contrato,
          item.cliente,
          item.cochilco,
          item.fechaEmbarque,
          item.DUS,
          item.fechaDUS || 'N/A',
          item.pesoNetoHumedo,
          item.pesoNetoSeco,
          item.porcHumedad,
          item.responsable,
          item.observacion,
          item.estado,
          item.fechaInstruccionDespacho || 'N/A',
          item.fechaConfirmacionDespacho || 'N/A',
          item.fechaDespacho || 'N/A',
          item.numeroGuia || 'N/A',
          item.laboratorio || 'N/A',
          item.fechaLlegadaLaboratorio || 'N/A',
          item.pais || 'N/A',
          item.nLote,
        ];
      });
    }

    // Agregar logo
    const logoBlob = await fetch('assets/images/logos/als_logo_1.png').then(res => res.blob());
    const reader = new FileReader();

    return new Promise<void>((resolve) => {
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const binary = atob(base64);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);

        const imageId = workbook.addImage({ buffer, extension: 'png' });

        worksheet.addImage(imageId, {
          tl: { col: 1, row: 1 },
          ext: { width: 65, height: 65 },
        });

        const bufferXlsx = await workbook.xlsx.writeBuffer();
        const blob = new Blob([bufferXlsx], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Trazabilidad_Mecanica.xlsx`;
        a.click();

        resolve();
      };
      reader.readAsDataURL(logoBlob);
    });
  }


  allLotes: any
  documento2: any

  getLotes() {
    const apiLote = 'https://control.als-inspection.cl/api_min/api/lote-recepcion/'
    this.http.get(apiLote).subscribe((res) => {
      this.allLotes = res
      this.loteKPI = res
      console.log('Locura:');
      console.log('allLotes:', this.allLotes);
      this.cargarServiciosYSolicitudes()
    })
  }

  descargarExcel2() {
    console.log('Camiones:', this.camionesRecepcion);
    console.log('Lotes resumen:', this.lotesResumen);
    console.log('Todos los lotes:', this.allLotes);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Camiones de Recepción');
    // Fondo blanco en todas las celdas hasta columna Z y fila 200
    for (let i = 1; i <= 200; i++) {
      const row = worksheet.getRow(i);
      for (let j = 1; j <= 26; j++) { // A-Z
        const cell = row.getCell(j);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' },
        };
      }
    }

    // Zoom al 85%
    worksheet.views = [{ state: 'normal', zoomScale: 70 }];

    worksheet.columns = new Array(26).fill({ width: 20 }); // 26 columnas
    worksheet.getColumn(1).width = 5; // Columna A más pequeña

    // --- BLOQUE NUEVO: Campos extra desde C11 ---
    const camposExtraHeaders = [
      'CLIENTE',
      'MATERIAL',
      'PESO NETO HÚMEDO RECEPCIÓN A LA FECHA',
      'PESO NETO SECO RECEPCIÓN A LA FECHA',
      'FECHA RECEPCIÓN',
      'LUGAR DE RECEPCIÓN',
      'TOTAL DE CAMIONES',
    ];

    const valoresExtra = [
      'ANGLO AMERICAN',
      'CONCENTRADO DE COBRE',
      `${this.calcularPesoNetoRecepcionTotal() || 0} KG HÚMEDOS`,
      `${this.calcularPesoNetoSecoTotal() || 0} KG SECOS`,
      (() => {
        if (this.fechaDesde) {
          const fecha = new Date(this.fechaDesde);
          const opciones = { year: 'numeric', month: 'long' } as const;
          return fecha.toLocaleDateString('es-ES', opciones).toUpperCase();
        }
        return 'SIN FECHA';
      })(),
      'TPC',
      this.calcularTotalCamiones() || 0,
    ];

    const filaInicio = 11;
    const colTitulo = 3; // C
    const colSeparador = 6; // F
    const colValor = 7; // G

    camposExtraHeaders.forEach((titulo, index) => {
      const row = worksheet.getRow(filaInicio + index);

      const cellTitulo = row.getCell(colTitulo);
      cellTitulo.value = titulo;
      cellTitulo.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '000000' } };
      cellTitulo.alignment = { horizontal: 'left' };

      const cellSeparador = row.getCell(colSeparador);
      cellSeparador.value = ':';
      cellSeparador.alignment = { horizontal: 'center' };

      const cellValor = row.getCell(colValor);
      cellValor.value = valoresExtra[index];
      cellValor.font = { name: 'Calibri', size: 11, bold: true, };
      cellValor.alignment = { horizontal: 'left' };
    });

    // Texto en J3 y J4
    const cellTitulo1 = worksheet.getCell('J3');
    cellTitulo1.value = 'ALS INSPECTION CHILE SPA';
    cellTitulo1.font = {
      name: 'Calibri',
      size: 24,
      bold: true,
    };
    cellTitulo1.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    const cellTitulo2 = worksheet.getCell('J4');
    cellTitulo2.value = 'SERVICIO DE RECEPCIÓN DE CONCENTRADO DE COBRE';
    cellTitulo2.font = {
      name: 'Calibri',
      size: 22,
      bold: false,
    };
    cellTitulo2.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    // Línea gris con título centrado arriba del resumen
    const filaTitulo = 6;
    const colInicio = 2; // B
    const colFin = 18;   // R

    worksheet.mergeCells(filaTitulo, colInicio, filaTitulo, colFin);
    const celdaTitulo = worksheet.getCell(filaTitulo, colInicio);
    celdaTitulo.value = `RECEPCIÓN CAMIONES (${(valoresExtra[4] || '').toString().toUpperCase()})`;
    celdaTitulo.font = {
      name: 'Calibri',
      size: 14,
      bold: true,
      color: { argb: '000000' },
    };
    celdaTitulo.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    celdaTitulo.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'd9d9d9' },
    };
    celdaTitulo.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // --- RESUMEN ---
    const resumenStartRow = 8;
    const resumenStartCol = 9; // Columna I

    // Título principal
    const titleCell = worksheet.getCell(resumenStartRow, resumenStartCol + 1);
    titleCell.value = 'Información Resumida de Lotes';
    titleCell.font = {
      name: 'Calibri',
      size: 16,
      bold: true,
    };
    titleCell.alignment = { horizontal: 'center' };
    worksheet.getCell(resumenStartRow, resumenStartCol).alignment = { horizontal: 'center' };

    // Encabezados con la nueva columna
    const resumenHeaders = [
      'Solicitud',
      'Lote',
      'Total de Camiones',
      'Neto Humedo Despacho',
      'Neto Humedo Recepción',
      'Porcentaje de Humedad',
      'Neto Seco',
      'Dif Recepción - Despacho (Neto Humedo)', // Nueva columna
    ];

    // Ajuste ancho columnas (ahora hay 8 columnas)
    const anchoColumnas = [35, 25, 35, 35, 35, 25, 35, 40];
    for (let i = 0; i < resumenHeaders.length; i++) {
      worksheet.getColumn(resumenStartCol + i).width = anchoColumnas[i];
    }

    const headerRow = worksheet.getRow(resumenStartRow + 1);
    resumenHeaders.forEach((header, i) => {
      const cell = headerRow.getCell(resumenStartCol + i);
      cell.value = header;
      cell.font = {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFF' },
      };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '337dff' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
    });

    // === Encabezados de la tabla extra al lado del resumen ===
    const extraHeaders = [
      'Masa por Recargo',
      'Cantidad total a ponderar (gr)'
    ];

    // Ajustar ancho columnas extra
    const anchoExtra = [30, 40]; // 👈 puedes aumentar a lo que necesites
    for (let i = 0; i < extraHeaders.length; i++) {
      worksheet.getColumn(resumenStartCol + resumenHeaders.length + i + 1).width = anchoExtra[i];
    }


    extraHeaders.forEach((header, i) => {
      const cell = headerRow.getCell(resumenStartCol + resumenHeaders.length + i + 1);
      cell.value = header;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '337dff' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let currentRow = resumenStartRow + 2; // fila 10

    this.lotesResumen.forEach((lote: any, index: number) => {
      const row = worksheet.getRow(currentRow + index);
      const relacionado = this.allLotes.find((l: any) => l.nLote === lote.nLote);
      const nombreSolicitud = relacionado?.nombre_solicitud || '';
      const porcHumedad = relacionado?.porcHumedad || '';

      const difRecepcionDespacho = Number(lote.netoHumedoOrigen) - Number(lote.netoHumedoDestino);

      // Valores del resumen
      const values = [
        nombreSolicitud,
        lote.observacion,
        Number(lote.cantidadCamiones),
        Number(lote.netoHumedoOrigen),
        Number(lote.netoHumedoDestino),
        Number(lote.porcHumedad),
        Number(lote.pesoNetoSeco),
        Number(difRecepcionDespacho),
      ];

      values.forEach((val, i) => {
        const cell = row.getCell(resumenStartCol + i);
        cell.value = val;
        cell.alignment = { horizontal: 'center' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        if ([3, 4, 6, 7].includes(i)) cell.numFmt = '0.000';
        else if (i === 5) cell.numFmt = '0.0000'; // Humedad con 4 decimales
      });

      // Valor de Masa por Recargo (fila por fila)
      const masaRecargo = Number(this.calcularMasaRecargototal(lote.pesoNetoSeco, this.calcularPesoNetoSecoTotal()));
      const cellMasa = row.getCell(resumenStartCol + resumenHeaders.length + 1);
      cellMasa.value = masaRecargo;
      cellMasa.alignment = { horizontal: 'center' };
      cellMasa.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cellMasa.numFmt = '0.0';
    });

    // --- Merge de "Cantidad total a ponderar (gr)" sobre todas las filas ---
    worksheet.mergeCells(
      currentRow,
      resumenStartCol + resumenHeaders.length + 2,
      currentRow + this.lotesResumen.length - 1,
      resumenStartCol + resumenHeaders.length + 2
    );
    const mergedCell = worksheet.getCell(
      currentRow,
      resumenStartCol + resumenHeaders.length + 2
    );
    mergedCell.value = 2000;
    mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
    mergedCell.numFmt = '0';
    mergedCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // --- Fila de totales ---
    const totalRowIndex = currentRow + this.lotesResumen.length + 1;
    const totalHeaderRow = worksheet.getRow(totalRowIndex);
    const totalHeaders = [
      '',
      '',
      'Cantidad de Lotes',
      'Total de Camiones',
      'Neto Humedo Despacho Total',
      'Neto Humedo Recepción Total',
      'Porcentaje de Humedad Promedio',
      'Neto Seco Total',
      'Dif Total Recepción - Despacho',
      '',
      'Total Masa por Recargo',
    ];
    totalHeaders.forEach((header, i) => {
      const cell = totalHeaderRow.getCell(resumenStartCol + i - 1);
      if (header !== '') {
        cell.value = header;
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '337dff' } };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      }
    });

    // --- Cálculos de totales ---
    const totalDifRecepcionDespacho =
      this.calcularNetoHumedoOrigenTotal() - this.calcularNetoHumedoDespachoTotal();

    // 👇 Sumar masas por recargo calculándolas
    const totalMasaRecargo = this.lotesResumen.reduce(
      (sum: number, lote: any) =>
        sum + this.calcularMasaRecargototal(lote.pesoNetoSeco, this.calcularPesoNetoSecoTotal()),
      0
    );

    // --- Fila de valores ---
    const totalValueRow = worksheet.getRow(totalRowIndex + 1);
    const totalValues = [
      '',
      '',
      this.lotesResumen.length,
      parseFloat(this.calcularTotalCamiones()),
      parseFloat(this.calcularPesoNetoDespachoTotal()),
      parseFloat(this.calcularPesoNetoRecepcionTotal()),
      parseFloat(this.calcularHumedad()),
      parseFloat(this.calcularPesoNetoSecoTotal()),
      parseFloat(totalDifRecepcionDespacho.toFixed(3)),
      '',
      Number(totalMasaRecargo), // 👈 Aquí agregamos el total de masa por recargo
    ];

    totalValues.forEach((val, i) => {
      const cell = totalValueRow.getCell(resumenStartCol + i - 1);
      if (val !== '') {
        cell.value = val;
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '000000' } };
        cell.alignment = { horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'd9d9d9' } };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        // formato numérico
        if ([5, 6, 7, 8].includes(i)) {
          cell.numFmt = i === 6 ? '0.0000' : '0.000';
        }

        if (i === 10) { // columna Total Masa por Recargo
          cell.numFmt = '0'; // sin decimales
        }
      }
    });

    // --- DETALLE ---
    // Calcular inicio dinámico del detalle
    let detalleStartRow = 23; // valor por defecto si no hay muchos lotes

    if (this.lotesResumen.length > 10) {
      // Cada lote ocupa una fila, más las cabeceras y totales (~3 filas más)
      const filasResumen = this.lotesResumen.length + 3;
      const filaBaseResumen = 8; // desde la fila 8 empieza el resumen
      detalleStartRow = filaBaseResumen + filasResumen + 3; // 3 filas extra de separación
    }
    let detalleStartCol = 2; // B

    worksheet.getCell(detalleStartRow, detalleStartCol + 3).value = 'Detalle de Camiones de Recepción';
    worksheet.getCell(detalleStartRow, detalleStartCol + 3).font = { name: 'Arial', size: 16, bold: true };
    worksheet.getCell(detalleStartRow, detalleStartCol + 3).alignment = { horizontal: 'center' };

    detalleStartRow++;

    // Estructura: Servicio → Solicitud → Lote
    const jerarquiaCamiones = this.camionesRecepcion.reduce((acc: any, camion: any) => {
      const loteRelacionado = this.allLotes.find((l: any) => l.nLote === camion.nLote);
      const nombreServicio = loteRelacionado?.nombre_servicio || 'Sin Servicio';
      const nombreSolicitud = loteRelacionado?.nombre_solicitud || '';
      const refALS = loteRelacionado?.refAls || 'Ref ALS Desconocido';
      const nombreLote = loteRelacionado.observacion || 'Lote Desconocido';

      if (!acc[nombreServicio]) acc[nombreServicio] = {};
      if (!acc[nombreServicio][refALS]) acc[nombreServicio][refALS] = {};
      if (!acc[nombreServicio][refALS][nombreSolicitud]) acc[nombreServicio][refALS][nombreSolicitud] = {};
      if (!acc[nombreServicio][refALS][nombreSolicitud][nombreLote]) acc[nombreServicio][refALS][nombreSolicitud][nombreLote] = [];

      acc[nombreServicio][refALS][nombreSolicitud][nombreLote].push({
        ...camion,
        nombreServicio,
        nombreSolicitud,
        refALS,
        nombreLote
      });

      return acc;
    }, {});

    for (const servicio in jerarquiaCamiones) {
      worksheet.getRow(detalleStartRow++).getCell(detalleStartCol).value = `Servicio: ${servicio}`;
      worksheet.getRow(detalleStartRow - 1).getCell(detalleStartCol).font = { bold: true, size: 14 };

      for (const refALS in jerarquiaCamiones[servicio]) {
        worksheet.getRow(detalleStartRow++).getCell(detalleStartCol).value = `Ref ALS: ${refALS}`;
        worksheet.getRow(detalleStartRow - 1).getCell(detalleStartCol).font = { bold: true, size: 14 };

        for (const solicitud in jerarquiaCamiones[servicio][refALS]) {
          worksheet.getRow(detalleStartRow++).getCell(detalleStartCol).value = `Solicitud: ${solicitud}`;
          worksheet.getRow(detalleStartRow - 1).getCell(detalleStartCol).font = { bold: true, size: 14 };

          for (const lote in jerarquiaCamiones[servicio][refALS][solicitud]) {
            worksheet.getRow(detalleStartRow++).getCell(detalleStartCol).value = `Lote: ${lote}`;
            worksheet.getRow(detalleStartRow - 1).getCell(detalleStartCol).font = { bold: true, size: 14 };

            // --- Agrupaciones originales con colores para ORIGEN y RECEPCIÓN ---
            const agrupacionRow = worksheet.getRow(detalleStartRow++);

            // Posiciones de columnas para las agrupaciones (ajustadas para tabla 1)
            const origenStartCol = detalleStartCol + 7; // columna G (0-based index + 1)
            const origenEndCol = origenStartCol + 2;    // columnas G, H, I
            const destinoStartCol = origenEndCol + 1;   // columna J
            const destinoEndCol = destinoStartCol + 4; // columnas J, K, L, M, N

            worksheet.mergeCells(agrupacionRow.number, origenStartCol, agrupacionRow.number, origenEndCol);
            const cellOrigen = agrupacionRow.getCell(origenStartCol);
            cellOrigen.value = 'INFORMACIÓN ORIGEN';
            cellOrigen.alignment = { horizontal: 'center', vertical: 'middle' };
            cellOrigen.font = { bold: true };
            cellOrigen.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'c6efce' },
            };
            cellOrigen.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' },
            };

            worksheet.mergeCells(agrupacionRow.number, destinoStartCol, agrupacionRow.number, destinoEndCol);
            const cellDestino = agrupacionRow.getCell(destinoStartCol);
            cellDestino.value = 'RECEPCIÓN';
            cellDestino.alignment = { horizontal: 'center', vertical: 'middle' };
            cellDestino.font = { bold: true };
            cellDestino.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'fff2cc' },
            };
            cellDestino.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' },
            };

            // --- Encabezados tabla 1 ---
            const detalleHeadersTabla1 = [
              'Camión (ID)', 'Día', 'Hora Ingreso', 'Guía Despacho', 'Sellos', 'Camión (Carro)', 'Tolva',
              'Bruto', 'Tara', 'Neto Húmedo',
              'Bruto', 'Tara', 'Neto Húmedo',
              'Humedad', 'Neto Seco'
            ];

            const headerRowTabla1 = worksheet.getRow(detalleStartRow++);
            detalleHeadersTabla1.forEach((header, i) => {
              const cell = headerRowTabla1.getCell(detalleStartCol + i);
              cell.value = header;
              cell.font = { bold: true };
              cell.alignment = { horizontal: 'center' };

              // Color según grupo ORIGEN / RECEPCIÓN
              let colorFondo = '337dff';
              let colorTexto = 'FFFFFFFF'; // blanco para fondo azul

              if (['Bruto', 'Tara', 'Neto Húmedo'].includes(header) && i >= 7 && i <= 9) { // ORIGEN columnas G,H,I
                colorFondo = 'c6efce';
                colorTexto = '000000';
              }
              if (['Bruto', 'Tara', 'Neto Húmedo', 'Humedad', 'Neto Seco'].includes(header) && i >= 10) { // RECEPCIÓN columnas J-N + humedad, neto seco
                colorFondo = 'fff2cc';
                colorTexto = '000000';
              }

              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: colorFondo }
              };
              cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' },
              };
              cell.font.color = { argb: colorTexto };
            });

            // --- Encabezados tabla 2 ---
            const detalleHeadersTabla2 = [
              'Dif Origen - Destino(peso neto humedo)', 'Masa por Recargo', 'Cantidad Total a Ponderar(gr)'
            ];

            // Fila actual donde están los encabezados de tabla 1 (detalleStartRow - 1)
            // Queremos fusionar con la fila de arriba (detalleStartRow - 2)
            const headerRowTabla2 = worksheet.getRow(detalleStartRow - 1);
            const headerRowArriba = worksheet.getRow(detalleStartRow - 2);
            const startColTabla2 = detalleStartCol + detalleHeadersTabla1.length + 1; // espacio 2 columnas

            detalleHeadersTabla2.forEach((header, i) => {
              const col = startColTabla2 + i;

              // Fusionar verticalmente las celdas: fila de arriba y fila actual
              worksheet.mergeCells(detalleStartRow - 2, col, detalleStartRow - 1, col);

              // Celda fusionada queda en la fila superior
              const cell = worksheet.getCell(detalleStartRow - 2, col);

              cell.value = header;
              cell.font = { bold: true };
              cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true,  // Ajusta el texto para que se adapte en varias líneas
              };
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'fff2cc' },
              };
              cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' },
              };
            });

            // Guardamos fila inicial para merge vertical de "Cantidad Total a Ponderar(gr)"
            const startRowDetalleLote = detalleStartRow;

            // Detalle por camión
            const camionesLote = jerarquiaCamiones[servicio][refALS][solicitud][lote];
            const totalNetoSecoLote = camionesLote.reduce((acc: number, c: any) => acc + Number(c.netoSeco || 0), 0);

            camionesLote.forEach((camion: any) => {
              const row = worksheet.getRow(detalleStartRow++);

              const valoresTabla1 = [
                camion.id,
                camion.fDestino,
                camion.hDestino,
                camion.idTransporteOrigen,
                camion.sellosOrigen,
                camion.idTransporteDestino,
                camion.batea,
                Number(camion.brutoOrigen),
                Number(camion.taraOrigen),
                Number(camion.netoHumedoOrigen),
                Number(camion.brutoDestino),
                Number(camion.taraDestino),
                Number(camion.netoHumedoDestino),
                Number(camion.porcHumedad),
                Number(camion.netoSeco)
              ];

              valoresTabla1.forEach((val, i) => {
                const cell = row.getCell(detalleStartCol + i);
                cell.value = val;
                cell.alignment = { horizontal: 'center' };
                cell.border = {
                  top: { style: 'thin' }, left: { style: 'thin' },
                  bottom: { style: 'thin' }, right: { style: 'thin' },
                };

                // Aplica formato numérico para que Excel muestre los decimales con ceros
                if (typeof val === 'number') {
                  if (i === 13) {
                    // Porc Humedad, dos decimales
                    cell.numFmt = '0.00';
                  } else if (i >= 7) {
                    // Otros números con tres decimales
                    cell.numFmt = '0.000';
                  }
                }
              });

              // Valores tabla 2
              const valoresTabla2 = [
                Number(camion.netoHumedoOrigen) - Number(camion.netoHumedoDestino), // diferencia numérica
                Number(this.calcularMasaRecargo(camion.netoSeco, totalNetoSecoLote)),
                2500 // valor fijo
              ];

              valoresTabla2.forEach((val, i) => {
                const cell = row.getCell(startColTabla2 + i);
                cell.value = val;
                cell.alignment = { horizontal: 'center' };
                cell.border = {
                  top: { style: 'thin' }, left: { style: 'thin' },
                  bottom: { style: 'thin' }, right: { style: 'thin' },
                };

                // Aplica formato numérico
                if (typeof val === 'number') {
                  if (i === 0) {
                    // Diferencia neto húmedo, 3 decimales
                    cell.numFmt = '0.000';
                  } else if (i === 1) {
                    // Masa por recargo, 3 decimales
                    cell.numFmt = '0.0';
                  } else if (i === 2) {
                    // Cantidad total a ponderar, entero (sin decimales)
                    cell.numFmt = '0';
                  }
                }
              });
            });

            // Merge vertical en la columna "Cantidad Total a Ponderar(gr)" (tabla 2)
            const colCantidadPonderar = startColTabla2 + 2;
            const endRowDetalleLote = detalleStartRow - 1; // última fila con datos del lote

            if (endRowDetalleLote > startRowDetalleLote) {
              worksheet.mergeCells(startRowDetalleLote, colCantidadPonderar, endRowDetalleLote, colCantidadPonderar);

              // Centrar el valor en la celda mergeada
              const cellMerged = worksheet.getCell(startRowDetalleLote, colCantidadPonderar);
              cellMerged.alignment = { horizontal: 'center', vertical: 'middle' };
            }

            // --- FILA EN BLANCO ENTRE TABLA Y RESUMEN ---
            detalleStartRow++; // fila vacía para separación

            // --- FILA DE RESUMEN DEL LOTE ---
            const filaResumenLote = worksheet.getRow(detalleStartRow);

            // Columnas fijas para facilitar lectura
            const colA = 1; // A
            const colD = 4; // D
            const colE = 6; // E
            const colG = 8; // G
            const colH = 9; // H
            const colO = 15; // O

            // Unir celdas E a G para "Total Día"
            worksheet.mergeCells(filaResumenLote.number, colE, filaResumenLote.number, colG);

            const cellTotalDia = filaResumenLote.getCell(colE);
            cellTotalDia.value = 'Total Día';
            cellTotalDia.font = { bold: true };
            cellTotalDia.alignment = { horizontal: 'center', vertical: 'middle' };
            cellTotalDia.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'd9d9d9' },
            };
            cellTotalDia.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' },
            };

            // Cálculo totales
            const totalCantidadCamiones = camionesLote.length;
            const totalBrutoOrigen = camionesLote.reduce((acc: number, c: any) => acc + Number(c.brutoOrigen || 0), 0);
            const totalTaraOrigen = camionesLote.reduce((acc: number, c: any) => acc + Number(c.taraOrigen || 0), 0);
            const totalNetoHumedoOrigen = camionesLote.reduce((acc: number, c: any) => acc + Number(c.netoHumedoOrigen || 0), 0);
            const totalBrutoDestino = camionesLote.reduce((acc: number, c: any) => acc + Number(c.brutoDestino || 0), 0);
            const totalTaraDestino = camionesLote.reduce((acc: number, c: any) => acc + Number(c.taraDestino || 0), 0);
            const totalNetoHumedoDestino = camionesLote.reduce((acc: number, c: any) => acc + Number(c.netoHumedoDestino || 0), 0);
            const totals = camionesLote.reduce(
              (acc: any, c: any) => {
                acc.hum += Number(c.netoHumedoDestino) || 0;
                acc.seco += Number(c.netoSeco) || 0;
                return acc;
              },
              { hum: 0, seco: 0 }
            );

            const humedadLote =
              totals.hum === 0
                ? 0
                : ((totals.hum - totals.seco) / totals.hum) * 100;

            console.log(humedadLote.toFixed(4)); // → 8.4994
            const totalNetoSeco = camionesLote.reduce((acc: number, c: any) => acc + Number(c.netoSeco || 0), 0);

            const valoresNumericos = [
              totalBrutoOrigen,
              totalTaraOrigen,
              totalNetoHumedoOrigen,
              totalBrutoDestino,
              totalTaraDestino,
              totalNetoHumedoDestino,
              humedadLote,
              totalNetoSeco
            ];

            // Columnas A-D vacías
            for (let col = colA; col <= colD; col++) {
              const cell = filaResumenLote.getCell(col);
              cell.value = null;
            }

            // Columnas H a O con valores y estilos
            for (let i = 0; i < valoresNumericos.length; i++) {
              const col = colH + i;
              const cell = filaResumenLote.getCell(col);
              const val = valoresNumericos[i];
              cell.value = val;
              cell.font = { bold: true };
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'd9d9d9' },
              };
              cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' },
              };

              // Formatos numéricos
              if (i === 6) {
                // promedioHumedad con 4 decimales
                cell.numFmt = '0.0000';
              } else {
                // resto con 3 decimales
                cell.numFmt = '0.000';
              }
            }

            const colQ = 18; // Columna Q
            const colR = 19; // Columna R

            // Suma masa por recargo
            const sumaMasaPorRecargo = camionesLote.reduce((acc: number, c: any) => {
              return acc + Number(this.calcularMasaRecargo(c.netoSeco, totalNetoSecoLote));
            }, 0);

            // Columna Q - Diferencia humedad (número con 3 decimales)
            const cellQ = filaResumenLote.getCell(colQ);
            cellQ.value = totalNetoHumedoOrigen - totalNetoHumedoDestino;
            cellQ.font = { bold: true };
            cellQ.alignment = { horizontal: 'center', vertical: 'middle' };
            cellQ.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'd9d9d9' },
            };
            cellQ.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' },
            };
            cellQ.numFmt = '0.000';

            // Columna R - Masa por recargo (número con 3 decimales)
            const cellR = filaResumenLote.getCell(colR);
            cellR.value = sumaMasaPorRecargo;
            cellR.font = { bold: true };
            cellR.alignment = { horizontal: 'center', vertical: 'middle' };
            cellR.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'd9d9d9' },
            };
            cellR.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' },
            };
            cellR.numFmt = '0';

            detalleStartRow++; // fila en blanco para separación
          }
        }
      }
    }

    // === Crear nueva hoja ===
    const newSheet = workbook.addWorksheet('Movilización');

    // --- Título principal ---
    const titleCell2 = newSheet.getCell(2, 2);
    titleCell2.value = 'Resumen de Movilización';
    titleCell2.font = { name: 'Calibri', size: 16, bold: true };
    titleCell2.alignment = { horizontal: 'center' };
    newSheet.mergeCells(2, 2, 2, 7); // ahora hay 7 columnas

    // --- Encabezados ---
    const movilizacionHeaders = [
      'Mes',
      'Día',
      'Turno',
      'Ton Movilizado',
      'EVENTO',
      'OBSERVACIONES',
    ];

    const headerRow2 = newSheet.getRow(4);
    movilizacionHeaders.forEach((header, i) => {
      const cell = headerRow2.getCell(i + 1);
      cell.value = header;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '337dff' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // --- Ajustar anchos de columnas ---
    const colWidths = [15, 15, 15, 20, 30, 30];
    colWidths.forEach((w, i) => {
      newSheet.getColumn(i + 1).width = w;
    });

    // ======================
    // Procesar camionesRecepcion
    // ======================
    function getTurno(fechaHora: Date | null): string {
      if (!fechaHora) return "DESCONOCIDO";
      const hora = fechaHora.getHours();
      if (hora >= 8 && hora < 16) return "A";   // 08:00 - 16:00
      if (hora >= 16 && hora < 24) return "B";  // 16:00 - 00:00
      return "C";                               // 00:00 - 08:00
    }

    const resumen: Record<string, any> = {};

    this.camionesRecepcion.forEach(c => {
      let fecha: Date | null = null;
      let turno = "DESCONOCIDO";

      if (c.fDestino && c.hDestino) {
        const f = new Date(`${c.fDestino}T${c.hDestino}`);
        if (!isNaN(f.getTime())) {
          fecha = f;
          turno = getTurno(f);
        } else {
          console.warn("Fecha inválida combinada:", c.fDestino, c.hDestino);
        }
      } else if (c.fDestino) {
        // Si tiene solo fecha sin hora
        const f = new Date(c.fDestino);
        if (!isNaN(f.getTime())) {
          fecha = f;
          // turno queda como "DESCONOCIDO"
        }
      }

      // Si no hay fecha válida, ignoramos el registro
      if (!fecha) {
        console.warn("Registro sin fecha válida:", c);
        return;
      }

      const mes = fecha.toLocaleString("es-ES", { month: "long" });
      const dia = fecha.getDate();
      const key = `${fecha.toISOString().split("T")[0]}-${turno}`;

      if (!resumen[key]) {
        resumen[key] = {
          mes,
          dia,
          turno,
          toneladas: 0,
          camiones: 0,
          obs: "S/N",
        };
      }

      resumen[key].toneladas += Number(c.netoHumedoDestino) || 0; // SUMA netoHumedoDestino
      resumen[key].camiones += 1; // CONTAR camiones
    });

    // --- Escribir filas en la hoja ---
    let rowIndex = 5;
    Object.values(resumen)
      .sort((a: any, b: any) => {
        if (a.mes === b.mes) {
          if (a.dia === b.dia) return a.turno.localeCompare(b.turno);
          return a.dia - b.dia;
        }
        return a.mes.localeCompare(b.mes);
      })
      .forEach((r: any) => {
        const row = newSheet.getRow(rowIndex);
        row.getCell(1).value = r.mes;
        row.getCell(2).value = r.dia;
        row.getCell(3).value = r.turno;
        row.getCell(4).value = r.toneladas;
        row.getCell(5).value = `SE RECIBEN ${r.camiones} CAMIONES`; // 👈 Evento dinámico
        row.getCell(6).value = r.obs;

        row.getCell(4).numFmt = '0.000';
        row.eachCell(cell => {
          cell.alignment = { horizontal: 'center' };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        rowIndex++;
      });

    // Imagen (igual)
    Promise.all([
      fetch('assets/images/logos/als_logo_1.png').then(res => res.blob()),
      fetch('assets/images/logos/ALS Inspection Chile Spa.png').then(res => res.blob()),
    ]).then(([blob1, blob2]) => {
      const procesarImagen = (blob: Blob): Promise<Uint8Array> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const base64 = base64data.split(',')[1];
            const binary = atob(base64);
            const len = binary.length;
            const imageBuffer = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              imageBuffer[i] = binary.charCodeAt(i);
            }
            resolve(imageBuffer);
          };
          reader.readAsDataURL(blob);
        });
      };

      Promise.all([
        procesarImagen(blob1),
        procesarImagen(blob2),
      ]).then(([img1, img2]) => {
        const imageId1 = workbook.addImage({ buffer: img1, extension: 'png' });
        const imageId2 = workbook.addImage({ buffer: img2, extension: 'png' });

        // Imagen 1: ALS
        // worksheet.addImage(imageId1, {
        //   tl: { col: 15, row: 1 }, // Posición original
        //   ext: { width: 75, height: 75 },
        // });

        // Imagen 2: Cliente
        worksheet.addImage(imageId2, {
          tl: { col: 2, row: 1 },
          ext: { width: 150, height: 85 }, // Ancho aumentado
        });

        // Imagen 3: Mineral
        worksheet.addImage(imageId1, {
          tl: { col: 16, row: 1 },
          ext: { width: 150, height: 85 }, // Ancho aumentado
        });

        // Generar archivo
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Servicio de recepción de concentrado de cobre.xlsx';
          a.click();

          this.documento2 = new File([blob], 'CamionesRecepcion.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          // this.enviarCorreo();
        });
      });
    });
  }

  // Función para calcular el peso neto recepción total
  calcularPesoNetoRecepcionTotal() {
    return this.lotesResumen
      .reduce((suma: any, lote: any) => {
        return suma + parseFloat(lote.netoHumedoDestino);
      }, 0).toFixed(3);
  }

  calcularTotalCamiones() {
    return this.lotesResumen.reduce((suma: any, lote: any) => {
      return suma + lote.cantidadCamiones;
    }, 0);
  }

  calcularPesoNetoSecoTotal() {
    return this.lotesResumen
      .reduce((suma: any, lote: any) => {
        return suma + parseFloat(lote.pesoNetoSeco);
      }, 0)
      .toFixed(3);
  }

  calcularPesoNetoDespachoTotal() {
    return this.lotesResumen
      .reduce((suma: any, lote: any) => {
        return suma + parseFloat(lote.netoHumedoOrigen);
      }, 0)
      .toFixed(3);
  }

  calcularNetoHumedoOrigenTotal(): number {
    return this.lotesResumen.reduce(
      (total, lote) => total + (Number(lote.netoHumedoOrigen) || 0),
      0
    );
  }

  calcularNetoHumedoDespachoTotal(): number {
    return this.lotesResumen.reduce(
      (total, lote) => total + (Number(lote.netoHumedoDestino) || 0),
      0
    );
  }

  calcularHumedad() {
    const lotesConHumedad = this.lotesResumen.filter((lote: any) =>
      lote.netoHumedoDestino != null &&
      lote.pesoNetoSeco != null &&
      parseFloat(lote.netoHumedoDestino) > 0 &&
      parseFloat(lote.pesoNetoSeco) > 0
    );

    const pesoNetoHumedoTotal = lotesConHumedad.reduce((acum: number, lote: any) => {
      const val = parseFloat(String(lote.netoHumedoDestino).replace(',', '.')) || 0;
      return acum + val;
    }, 0);

    const pesoNetoSecoTotal = lotesConHumedad.reduce((acum: number, lote: any) => {
      const val = parseFloat(String(lote.pesoNetoSeco).replace(',', '.')) || 0;
      return acum + val;
    }, 0);

    if (pesoNetoHumedoTotal === 0) return '0.0000';

    const humedad = ((pesoNetoHumedoTotal - pesoNetoSecoTotal) / pesoNetoHumedoTotal) * 100;

    return humedad.toFixed(4);
  }


  calcularMasaRecargo(pesoNetoSeco: number, sumaPesosNetosSecos: number): number {
    if (sumaPesosNetosSecos === 0) {
      return 0;
    } else {
      const masaRecargo = (pesoNetoSeco / Number(sumaPesosNetosSecos.toFixed(3))) * 2500;
      return Math.round(masaRecargo * 100) / 100; // 👉 redondea a 1 decimal
    }
  }

  calcularMasaRecargototal(pesoNetoSeco: any, sumaPesosNetosSecos: any): number {
    console.log('albo locura')
    console.log(pesoNetoSeco)
    console.log('albo locura 2')
    console.log(sumaPesosNetosSecos)
    const pesoSeco = Number(pesoNetoSeco) || 0;
    const totalSeco = Number(sumaPesosNetosSecos) || 0;

    if (totalSeco === 0) {
      return 0;
    }

    const masaRecargo = (pesoSeco / totalSeco) * 2000;
    return Math.round(masaRecargo * 100) / 100; // ✅ devuelve con 2 decimales exactos
  }

  cargarServiciosYSolicitudes(): void {
    const apiServicios = 'https://control.als-inspection.cl/api_min/api/servicio/';
    const apiSolicitudes = 'https://control.als-inspection.cl/api_min/api/solicitud/';

    this.http.get<any[]>(apiServicios).subscribe({
      next: (servicios) => {
        this.servicios = servicios;
        console.log('Servicios cargados:', this.servicios);

        this.http.get<any[]>(apiSolicitudes).subscribe({
          next: (solicitudes) => {
            this.solicitudes = solicitudes;
            console.log('Solicitudes cargadas:', this.solicitudes);
            // console.log('allLotes:', this.allLotes);

            // (Opcional) Si quieres agregar nombres a los lotes en allLotes más adelante:
            this.agregarNombresAServiciosYSolicitudes();
          },
          error: (err) => {
            console.error('Error al cargar solicitudes:', err);
            Notiflix.Notify.failure('No se pudieron cargar las solicitudes.');
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        Notiflix.Notify.failure('No se pudieron cargar los servicios.');
      }
    });
  }

  agregarNombresAServiciosYSolicitudes(): void {

    console.log('Ejecutando agregarNombresAServiciosYSolicitudes');
    console.log('allLotes:', this.allLotes);

    if (!this.allLotes || this.allLotes.length === 0) return;

    console.log('Servicios cargados:22222222')
    console.log(this.servicios)
    console.log('Solicitudes cargadas 2222222:')
    console.log(this.solicitudes)
    // Actualiza allLotes
    this.allLotes = this.allLotes.map((lote: any) => {
      const servicio = this.servicios.find(s => s.id === lote.servicio);
      const solicitud = this.solicitudes.find(s => s.id === lote.solicitud);
      const refALS = this.servicios.find(s => s.id === lote.servicio);

      return {
        ...lote,
        nombre_servicio: servicio?.nServ || 'Sin nombre',
        nombre_solicitud: solicitud?.nSoli || 'Sin nombre',
        refAls: refALS?.refAls || 'Sin nombre',
      };
    });

    // Actualiza loteKPI si existe
    if (this.loteKPI && this.loteKPI.length > 0) {
      this.loteKPI = this.loteKPI.map((lote: any) => {
        const servicio = this.servicios.find(s => s.id === lote.servicio);
        const solicitud = this.solicitudes.find(s => s.id === lote.solicitud);
        const refALS = this.servicios.find(s => s.id === lote.servicio);

        return {
          ...lote,
          nombre_servicio: servicio?.nServ || 'Sin nombre',
          nombre_solicitud: solicitud?.nSoli || 'Sin nombre',
          refAls: refALS?.refAls || 'Sin nombre',
        };
      });
    }
    // this.obtenerDatosCamion()
    // console.log('Lotes actualizados con nombres:', this.allLotes);
    // console.log('LoteKPI actualizado con nombres:', this.loteKPI);
  }

  obtenerDatosCamion() {
    // 👉 Primero traemos los camiones desde la API
    this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/recepcion-transporte/')
      .subscribe((camiones) => {

        if (this.loteKPI && this.loteKPI.length > 0) {
          this.loteKPI = this.loteKPI.map((lote: any) => {
            const servicio = this.servicios.find(s => s.id === lote.servicio);
            const solicitud = this.solicitudes.find(s => s.id === lote.solicitud);
            const refALS = this.servicios.find(s => s.id === lote.servicio);

            // 🔍 Filtrar camiones por nLote
            const camionesDelLote = camiones.filter((c: any) => c.nLote === lote.nLote);

            let fOrigenPrimero: string | null = null;
            let fOrigenUltimo: string | null = null;

            if (camionesDelLote.length > 0) {
              // Ordenar por fOrigen
              camionesDelLote.sort((a: any, b: any) => new Date(a.fOrigen).getTime() - new Date(b.fOrigen).getTime());

              fOrigenPrimero = camionesDelLote[0].fOrigen;
              fOrigenUltimo = camionesDelLote[camionesDelLote.length - 1].fOrigen;
            }

            return {
              ...lote,
              fOrigenPrimero: fOrigenPrimero,
              fOrigenUltimo: fOrigenUltimo,
            };
          });
        }
        this.obtenerDatosTrazabilidad()
        // console.log("📦 LoteKPI actualizado con primeros y últimos camiones:", this.loteKPI);
      });
  }

  obtenerDatosTrazabilidad() {
    this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/trazabilidad/')
      .subscribe((trazabilidades) => {

        if (this.loteKPI && this.loteKPI.length > 0) {
          this.loteKPI = this.loteKPI.map((lote: any) => {
            // 🔍 Filtrar trazabilidades por nLote
            const trazasDelLote = trazabilidades.filter((t: any) => t.nLote === lote.nLote);

            let primeraPrepMuestra: string | null = null;
            let ultimaPrepMuestra: string | null = null;

            if (trazasDelLote.length > 0) {
              // Ordenar por fecha + hora
              trazasDelLote.sort((a: any, b: any) => {
                const fechaA = new Date(`${a.fPrepMuestra}T${a.hPrepMuestra}`);
                const fechaB = new Date(`${b.fPrepMuestra}T${b.hPrepMuestra}`);
                return fechaA.getTime() - fechaB.getTime();
              });

              // ✅ La más antigua siempre es la primera
              primeraPrepMuestra = trazasDelLote[0].fPrepMuestra;

              // ✅ Buscar la última válida desde el final hacia atrás
              for (let i = trazasDelLote.length - 1; i >= 0; i--) {
                if (trazasDelLote[i].fPrepMuestra) {
                  ultimaPrepMuestra = trazasDelLote[i].fPrepMuestra;
                  break;
                }
              }
            }

            return {
              ...lote,
              primeraPrepMuestra,
              ultimaPrepMuestra
            };
          });
        }
        this.obtenerFechasReportes()
        // console.log("📦 LoteKPI actualizado con primera y última fPrepMuestra:", this.loteKPI);
      });
  }

  obtenerFechasReportes(): void {
    this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/reportes/')
      .subscribe((reportes) => {
        if (this.loteKPI && this.loteKPI.length > 0) {
          this.loteKPI = this.loteKPI.map((lote: any) => {
            const reporte = reportes.find(r =>
              String(r.servicio) === String(lote.servicio) &&
              String(r.solicitud) === String(lote.solicitud)
            );

            return {
              ...lote,
              fechaInformeCliente: reporte?.fechaInformeCliente || null,
              fechaFacturacion: reporte?.fechaFacturacion || null,
            };
          });
        }
        this.obtenerDatosTrazabilidadMecanica()
        // console.log('Reportes:', reportes);
        // console.log('LoteKPI actualizado con fechas:', this.loteKPI);
      });
  }

  obtenerDatosTrazabilidadMecanica(): void {
    this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/')
      .subscribe((trazasMecanicas) => {
        if (this.loteKPI && this.loteKPI.length > 0) {
          this.loteKPI = this.loteKPI.map((lote: any) => {
            // 🔍 Filtrar trazas mecánicas por nLote
            const trazasDelLote = trazasMecanicas.filter((t: any) => t.nLote === lote.nLote);

            // Crear objeto con los 9 campos, todos inicializados en null
            const datosMecanica: any = {
              fechaDespacho1: null, laboratorio1: null, fechaInstruccionDespacho1: null,
              fechaDespacho2: null, laboratorio2: null, fechaInstruccionDespacho2: null,
              fechaDespacho3: null, laboratorio3: null, fechaInstruccionDespacho3: null
            };

            // 🔄 Tomar sublotes 1, 2 y 3 en ese orden (comparando como string y número)
            [1, 2, 3].forEach((subIdx) => {
              const traza = trazasDelLote.find((t: any) =>
                t.nSublote == subIdx // 👈 uso == para que funcione "1" o 1
              );
              if (traza) {
                datosMecanica[`fechaDespacho${subIdx}`] = traza.fechaDespacho || null;
                datosMecanica[`laboratorio${subIdx}`] = traza.laboratorio || null;
                datosMecanica[`fechaInstruccionDespacho${subIdx}`] = traza.fechaInstruccionDespacho || null;
              }
            });

            return {
              ...lote,
              ...datosMecanica
            };
          });
        }
        this.asignarProveedor();
        // console.log("🔧 LoteKPI actualizado con trazabilidad mecánica:", this.loteKPI);
      });
  }

  asignarProveedor(): void {
    if (this.loteKPI && this.loteKPI.length > 0) {
      this.loteKPI = this.loteKPI.map((lote: any) => {
        // Obtener las primeras 2 letras en minúsculas
        const prefijo = (lote.nombre_servicio || '').substring(0, 2).toLowerCase();

        let proveedor = 'Desconocido';
        switch (prefijo) {
          case 'la': proveedor = 'La Patagua'; break;
          case 'ch': proveedor = 'Codelco'; break;
          case 'te': proveedor = 'Teck'; break;
          case 'sa': proveedor = 'San Geronimo'; break;
          case 'co': proveedor = 'Codelco'; break;
          case 'om': proveedor = 'Omint'; break;
          case 'pu': proveedor = 'Pucobre'; break;
          case 'so': proveedor = 'Sominor'; break;
          case 'al': proveedor = 'Altiplano'; break;
        }

        return {
          ...lote,
          proveedor
        };
      });
    }
    this.unificarLoteKPI()
    // console.log("📦 LoteKPI actualizado con proveedor:", this.loteKPI);
  }

  unificarLoteKPI(): void {
    if (!this.loteKPI || this.loteKPI.length === 0) return;

    const grupos = new Map<string, any>();

    this.loteKPI.forEach((lote: any) => {
      const key = `${lote.servicio}_${lote.solicitud}`;

      if (!grupos.has(key)) {
        // Creo el grupo inicializando acumuladores
        grupos.set(key, {
          ...lote,
          cantCamiones: lote.cantCamiones || 0,
          cantBigbag: lote.cantBigbag || 0,
          pesoNetoHumedo: parseFloat(lote.pesoNetoHumedo) || 0,
          nLotes: [lote.nLote],
          cantidadLotes: 1,
          todasUltimasPrep: lote.ultimaPrepMuestra ? [lote.ultimaPrepMuestra] : [],
          primeraPrepMuestra: lote.ultimaPrepMuestra || null, // 👈 guardar la primera
        });
      } else {
        const existente = grupos.get(key);

        // 🔹 Acumulaciones
        existente.cantCamiones = (existente.cantCamiones || 0) + (lote.cantCamiones || 0);
        existente.cantBigbag = (existente.cantBigbag || 0) + (lote.cantBigbag || 0);
        existente.pesoNetoHumedo =
          (parseFloat(existente.pesoNetoHumedo) || 0) + (parseFloat(lote.pesoNetoHumedo) || 0);

        // 🔹 Fechas mínimas y máximas
        existente.fOrigenPrimero =
          existente.fOrigenPrimero < lote.fOrigenPrimero ? existente.fOrigenPrimero : lote.fOrigenPrimero;
        existente.fOrigenUltimo =
          existente.fOrigenUltimo > lote.fOrigenUltimo ? existente.fOrigenUltimo : lote.fOrigenUltimo;

        // 🔹 Guardar todos los nLotes
        existente.nLotes = [...(existente.nLotes || []), lote.nLote];

        // 🔹 Contador de lotes
        existente.cantidadLotes = (existente.cantidadLotes || 0) + 1;

        // 🔹 Guardar todas las ultimasPrepMuestra válidas
        if (lote.ultimaPrepMuestra) {
          existente.todasUltimasPrep.push(lote.ultimaPrepMuestra);
        }

        // 🔹 Mantener la primera prep registrada (no se sobreescribe)
        if (!existente.primeraPrepMuestra && lote.ultimaPrepMuestra) {
          existente.primeraPrepMuestra = lote.ultimaPrepMuestra;
        }
      }
    });

    // 🔍 Post-procesar para elegir ultimaPrepMuestra
    this.loteKPI = Array.from(grupos.values()).map(grupo => {
      let ultimaPrep: string | null = null;

      if (grupo.ultimaPrepMuestra) {
        ultimaPrep = grupo.ultimaPrepMuestra;
      } else if (grupo.todasUltimasPrep.length > 0) {
        ultimaPrep = grupo.todasUltimasPrep[grupo.todasUltimasPrep.length - 1];
      }

      return {
        ...grupo,
        ultimaPrepMuestra: ultimaPrep,
        // ✅ ahora también tienes disponible
        // la primera muestra encontrada en el grupo
        primeraPrepMuestra: grupo.primeraPrepMuestra || null,
        todasUltimasPrep: undefined, // opcional: limpiar
      };
    });

    // console.log("📦 loteKPI unificado por servicio+solicitud:", this.loteKPI);
  }

  descargarDocumento(){
    console.log(this.tipoDocumento)
  }

  generarInformeIngresos(){
    console.log('Generando informe de ingresos...');
    console.log('id service: ' + this.idServicio
    + ' id solicitud: ' + this.idSolicitud
    + ' fecha inicio: ' + this.fechaDesde
    + ' fecha fin: ' + this.fechaHasta
    )

    this.excelService.generarExceldeRegistros(this.idServicio || 0, this.idSolicitud || 0, this.fechaDesde, this.fechaHasta);
    
  }


}
