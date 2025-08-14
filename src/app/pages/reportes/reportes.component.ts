import { bodega } from './../../services/bodega.service';
import { LoteService } from 'src/app/services/lote.service';
import { Bodega } from 'src/app/services/bodega.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { FiveDayRangeSelectionStrategy } from '../formularios/formularios.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { map, Observable, startWith } from 'rxjs';
import Notiflix from 'notiflix';
import { HttpClient } from '@angular/common/http';
import * as ExcelJS from 'exceljs';
import { ExcelKPIService } from 'src/app/services/excel-kpi.service';

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
  opciones = [
    { value: 'Reporte Ingresos', label: 'Reporte Ingresos ' },
    { value: 'Reporte KPI', label: 'Reporte KPI' },
    // { value: 'Ingresos', label: 'Ingresos' },
    // { value: 'Despachos', label: 'Despachos' },
  ];

  documento = new FormControl('');

  opcionesFiltradas: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private kpi: ExcelKPIService,
    private loteService: LoteService
  ) {
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
  }

  generarTablas() {
    console.log(this.fechaDesde);
    console.log(this.fechaHasta);
    console.log(this.idServicio);
    console.log(this.idSolicitud);
    console.log(this.documento.value);
    if (!this.fechaDesde || !this.fechaHasta) {
      Notiflix.Notify.warning('Seleccione fechas');
    } else if (!this.documento.value) {
      Notiflix.Notify.warning('Seleccione un tipo de documento');
    } else {
      if (this.documento.value === 'Reporte Ingresos') {
        this.http
          .get('https://control.als-inspection.cl/api_min/api/lote-recepcion/')
          .subscribe((response: any) => {
            let lotes = response;
            console.log('Todos los registros');
            console.log(lotes);
            //Primero, verificar si hay servicio y solicitud.
            //Si hay solicitud y servicio, traer todos los lotes cuyo solicitud y servicio corresponda.
            if (this.idServicio && this.idSolicitud) {
              lotes = lotes.filter(
                (lote: any) =>
                  lote.servicio == this.idServicio &&
                  lote.solicitud == this.idSolicitud
              );
            }
            //Si hay servicio pero no solicitud, traer todos los lotes cuyo servicio correspondan
            else if (this.idServicio) {
              lotes = lotes.filter(
                (lote: any) => lote.servicio == this.idServicio
              );
            }
            //Si no hay servicio ni solicitud, traer todos los lotes.
            else {
              lotes = lotes;
            }

            //Filtrar los lotes según las fechas ingresadas. Si no hay fecha ingresada, traer todos los lotes.
            console.log('lotes filtrados por serv y soli');
            console.log(lotes);
            if (lotes.length > 0) {
              //Consultar api recepción-transporte para obtener los camiones / trenes
              this.http
                .get(
                  'https://control.als-inspection.cl/api_min/api/recepcion-transporte/?'
                )
                .subscribe((registros: any) => {
                  console.log('Camiones y trenes');
                  console.log(registros);
                  //Separar los registros segun tipoTransporte
                  let camionesRecepcion = registros.filter(
                    (camion: any) => camion.tipoTransporte == 'Camion'
                  );
                  let trenesRecepcion = registros.filter(
                    (tren: any) => tren.tipoTransporte == 'Vagon'
                  );

                  let lotesCamion = lotes.filter(
                    (lote: any) => lote.tipoTransporte == 'Camion'
                  );
                  let lotesTren = lotes.filter(
                    (lote: any) => lote.tipoTransporte == 'Vagon'
                  );

                  this.tablaCamion = [];
                  //Por cada Lote, buscar en los camiones y trenes el que tenga el mismo nLote. Luego, crear un registro con el lote y el camion/tren.
                  //Primero los camiones. Estos deben incluir: tipoTransporte, nLote, fOrigen, hOrigen, idTransporte, sellosOrigen, brutoOrigen, taraOrigen, netoHumedad, idTransporteDestino	fDestino	hDestino	idCarroDestino	sellosDestino	brutoDestino	taraDestino	netoHumedoDestino	diferenciaHumeda	diferenciaSeca	bodegaDescarga	CuFino	estado	bodega
                  lotes.forEach((lote: any) => {
                    const camiones = camionesRecepcion.filter(
                      (camion: any) => camion.nLote === lote.nLote
                    );
                    camiones.forEach((camion: any) => {
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
                        netoHumedad: (
                          camion.brutoOrigen - camion.taraOrigen
                        ).toFixed(2),
                        camion: camion.idTransporteDestino,
                        fDestino: camion.fDestino,
                        hDestino: camion.hDestino,
                        batea: camion.idCarroDestino,
                        sellosDestino: camion.sellosDestino,
                        brutoDestino: camion.brutoDestino,
                        taraDestino: camion.taraDestino,
                        netoHumedoDestino: camion.netoHumedoDestino,
                        diferenciaHumeda: camion.diferenciaHumeda,
                        diferenciaSeca: camion.diferenciaSeca,
                        CuFino: camion.CuFino,
                        estado: camion.estado,
                        bodega: camion.bodega,
                      };
                      this.tablaCamion.push(registro);
                      // Agregar el registro a un arreglo o realizar alguna otra acción
                    });
                  });

                  this.tablaVagon = [];
                  //Ahora los trenes. Estos deben incluir: tipoTransporte, nLote, fOrigen, hOrigen, idTransporte, sellosOrigen, brutoOrigen, taraOrigen, netoHumedad, idTransporteDestino	fDestino	hDestino	idCarroDestino	sellosDestino	brutoDestino	taraDestino	netoHumedoDestino	diferenciaHumeda	diferenciaSeca	bodegaDescarga	CuFino	estado	bodega
                  lotes.forEach((lote: any) => {
                    const trenes = trenesRecepcion.filter(
                      (tren: any) => tren.nLote === lote.nLote
                    );
                    trenes.forEach((tren: any) => {
                      const registro = {
                        tipoTransporte: tren.tipoTransporte,
                        observacion: lote.observacion,
                        nLote: lote.nLote,
                        fOrigen: tren.fOrigen,
                        hOrigen: tren.hOrigen,
                        idCarro: tren.idCarro,
                        idTransporteOrigen: tren.idTransporteOrigen,
                        idTransporteDestino: tren.idTransporteDestino,
                        brutoOrigen: tren.brutoOrigen,
                        taraOrigen: tren.taraOrigen,
                        netoHumedad: (
                          tren.brutoOrigen - tren.taraOrigen
                        ).toFixed(2),
                        fDestino: tren.fDestino,
                        hDestino: tren.hDestino,
                        batea: tren.idCarroDestino,
                        brutoDestino: tren.brutoDestino,
                        taraDestino: tren.taraDestino,
                        netoHumedoDestino: tren.netoHumedoDestino,
                        diferenciaHumeda: tren.diferenciaHumeda,
                        diferenciaSeca: tren.diferenciaSeca,
                        CuFino: tren.CuFino,
                        estado: tren.estado,
                        bodega: tren.bodega,
                        humedad: lote.porcHumedad,
                      };
                      this.tablaVagon.push(registro);
                      // Agregar el registro a un arreglo o realizar alguna otra acción
                    });
                  });

                  //Filtrar camiones por fechas. Incluir todos los camiones cuya fDestino esten entre las fechas ingresadas.

                  this.tablaCamion = this.tablaCamion.filter((camion: any) => {
                    const fechaCamion = new Date(camion.fDestino);
                    return (
                      fechaCamion >= this.fechaDesde &&
                      fechaCamion <= this.fechaHasta
                    );
                  });

                  //Filtrar trenes por fechas. Incluir todos los trenes cuya fDestino esten entre las fechas ingresadas.
                  this.tablaVagon = this.tablaVagon.filter((tren: any) => {
                    const fechaTren = new Date(tren.fDestino);
                    return (
                      fechaTren >= this.fechaDesde &&
                      fechaTren <= this.fechaHasta
                    );
                  });

                  //Almacenar el nombre de la bodega en lugar del idBodega
                  this.tablaCamion.forEach((camion: any) => {
                    const bodega = this.bodegas.find(
                      (bodega: any) => bodega.idBodega == camion.bodega
                    );
                    if (bodega) {
                      camion.bodega = bodega.nombreBodega;
                    }
                  });

                  this.tablaVagon.forEach((tren: any) => {
                    const bodega = this.bodegas.find(
                      (bodega: any) => bodega.idBodega == tren.bodega
                    );
                    if (bodega) {
                      tren.bodega = bodega.nombreBodega;
                    }
                  });
                  console.log(this.tablaVagon);
                  console.log(this.tablaCamion);
                  if (this.tablaCamion.length > 0) {
                    Notiflix.Notify.success('Camiones encontrados.');
                  } else {
                    Notiflix.Notify.warning('No se encontraron camiones.');
                  }
                  if (this.tablaVagon.length > 0) {
                    Notiflix.Notify.success('Vagones encontrados.');
                  } else {
                    Notiflix.Notify.warning('No se encontraron vagones.');
                  }
                  this.cdr.detectChanges();
                });

              //Crear las tablas.
              // this.tablaCamiones = this.crearTabla(camiones);
              // this.tablaTrenes = this.crearTabla(trenes);
              // this.tablaResumen = this.crearTablaResumen(registros);
            } else {
              Notiflix.Notify.warning('No hay registros para mostrar.');
            }
          });
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
      }
    }
  }

  descargarExcel() {
    if (this.tablaCamion.length === 0 && this.tablaVagon.length === 0) {
      Notiflix.Notify.warning('No hay datos para exportar.');
      return;
    } else if (this.documento.value == 'Reporte Ingresos') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Tabla Camion');
      const worksheet2 = workbook.addWorksheet('Tabla Vagon');
      // Establecer los encabezados de la tabla
      const headers = [
        'Tipo de Transporte',
        'Referencia',
        'Fecha de Origen',
        'Hora de Origen',
        'Guía de Despacho',
        'Sellos de Origen',
        'Ticket PVSA',
        'Camión',
        'Batea',
        'Bruto de Origen',
        'Tara de Origen',
        'Neto de Humedad',
        'Fecha de Destino',
        'Hora de Destino',
        'Bruto de Destino',
        'Tara de Destino',
        'Neto de Humedad Destino',
        'Diferencia de Humedad',
        'Diferencia Seca',
        'CuFino',
        'Estado',
        'Bodega',
      ];
      for (let i = 0; i < 4; i++) {
        worksheet.addRow([]);
      }
      const headersVagon = [
        // Agrega los encabezados de la tabla Vagon aquí
        'Tipo de Transporte',
        'Referencia',
        'Fecha de Origen',
        'Hora de Origen',
        'Guía de Despacho',
        'Número de Vagones',
        'Bruto de Origen',
        'Fecha de Destino',
        'Integrado Inicial',
        'Integrado Final',
        'Diferencia Humeda',
        'Diferencia Seca',
        'CuFino',
        'Estado',
        'Bodega',
      ];
      for (let i = 0; i < 4; i++) {
        worksheet2.addRow([]);
      }

      // Título en D2
      worksheet.getCell('H2').value = 'Detalle de Camiones de Recepción';
      worksheet.getCell('H2').font = { name: 'Arial', size: 16, bold: true };
      worksheet.getCell('H2').alignment = { horizontal: 'center' };

      // Título en D2 de vagon
      worksheet2.getCell('H2').value = 'Detalle de Vagones de Recepción';
      worksheet2.getCell('H2').font = { name: 'Arial', size: 16, bold: true };
      worksheet2.getCell('H2').alignment = { horizontal: 'center' };

      // Agregar los encabezados a la tabla
      worksheet.addRow(headers).eachCell((cell) => {
        if (cell.value !== '') {
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
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      });
      // Agregar los encabezados a la tabla Vagon
      worksheet2.addRow(headersVagon).eachCell((cell) => {
        if (cell.value !== '') {
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
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      });

      worksheet.columns = [
        { width: 15 }, // tipoTransporte
        { width: 15 }, // observacion
        { width: 15 }, // fOrigen
        { width: 15 }, // hOrigen
        { width: 15 }, // idTransporteOrigen
        { width: 20 }, // sellosOrigen
        { width: 10 }, // sellosDestino
        { width: 10 }, // camion
        { width: 10 }, // batea
        { width: 15 }, // brutoOrigen
        { width: 15 }, // taraOrigen
        { width: 15 }, // netoHumedad
        { width: 15 }, // fDestino
        { width: 10 }, // hDestino
        { width: 15 }, // brutoDestino
        { width: 15 }, // taraDestino
        { width: 15 }, // netoHumedoDestino
        { width: 15 }, // diferenciaHumeda
        { width: 15 }, // diferenciaSeca
        { width: 10 }, // CuFino
        { width: 10 }, // estado
        { width: 15 }, // bodega
      ];

      worksheet2.columns = [
        { width: 15 }, // tipoTransporte
        { width: 15 }, // observacion
        { width: 15 }, // fOrigen
        { width: 15 }, // hOrigen
        { width: 15 }, // idTransporteOrigen
        { width: 20 }, // sellosOrigen
        { width: 20 }, // sellosDestino
        { width: 20 }, // camion
        { width: 20 }, // batea
        { width: 15 }, // brutoOrigen
        { width: 15 }, // taraOrigen
        { width: 15 }, // netoHumedad
        { width: 15 }, // fDestino
        { width: 10 }, // hDestino
        { width: 15 }, // brutoDestino
        { width: 15 }, // taraDestino
        { width: 15 }, // netoHumedoDestino
        { width: 15 }, // diferenciaHumeda
        { width: 15 }, // diferenciaSeca
        { width: 10 }, // CuFino
        { width: 10 }, // estado
        { width: 15 }, // bodega
      ];

      // Agregar los datos de la tabla
      this.tablaCamion.forEach((fila) => {
        worksheet.addRow([
          fila.tipoTransporte,
          fila.observacion,
          fila.fOrigen,
          fila.hOrigen,
          fila.idTransporteOrigen,
          fila.sellosOrigen,
          fila.sellosDestino,
          fila.camion,
          fila.batea,
          fila.brutoOrigen,
          fila.taraOrigen,
          fila.netoHumedad,
          fila.fDestino,
          fila.hDestino,
          fila.brutoDestino,
          fila.taraDestino,
          fila.netoHumedoDestino,
          fila.diferenciaHumeda,
          fila.diferenciaSeca,
          fila.CuFino,
          fila.estado,
          fila.bodega,
        ]);
      });

      // Agregar los datos de la tabla Vagon
      this.tablaVagon.forEach((fila) => {
        const diferenciaSeca = (
          fila.netoHumedoDestino -
          (fila.netoHumedoDestino * fila.humedad) / 100
        ).toFixed(2);
        worksheet2.addRow([
          fila.tipoTransporte,
          fila.observacion,
          fila.fOrigen,
          fila.hOrigen,
          fila.idTransporteOrigen,
          fila.idCarro,
          fila.brutoOrigen,
          fila.fDestino,
          fila.brutoDestino,
          fila.taraDestino,
          fila.netoHumedoDestino,
          diferenciaSeca,
          fila.CuFino,
          fila.estado,
          fila.bodega,
        ]);
      });

      fetch('assets/images/logos/als_logo_1.png')
        .then((res) => res.blob())
        .then((blob) => {
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

            const imageId = workbook.addImage({
              buffer: imageBuffer,
              extension: 'png',
            });

            worksheet.addImage(imageId, {
              tl: { col: 1, row: 1 },
              ext: { width: 65, height: 65 },
            });

            // Guardar archivo después de agregar imagen
            workbook.xlsx.writeBuffer().then((buffer) => {
              const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              const url = URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.href = url;
              a.download = 'Reporte Camiones.xlsx';
              a.click();
            });
          };
          reader.readAsDataURL(blob);
        });
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
      }
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
}
