import { SolicitudService } from './../../services/solicitud.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Injectable,
  ViewChild,
} from '@angular/core';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSelectModule } from '@angular/material/select';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatIconModule } from '@angular/material/icon';
import Notiflix from 'notiflix';
import { LoteService } from 'src/app/services/lote.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecepcionComponent } from '../recepcion/recepcion.component';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { DespachoComponent } from '../despacho/despacho.component';
import {
  FiveDayRangeSelectionStrategy,
  NuevoLoteComponent,
} from './nuevo-lote/nuevo-lote.component';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexXAxis,
  ApexTooltip,
  ApexTheme,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  NgApexchartsModule,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
interface Camion {
  tipoTransporte: string;
  fOrigen: string;
  netoHumedoDestino: number;
  // Agrega otras propiedades que se esperan en la respuesta de la API
}

export type ChartOptions2 = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: any;
  theme: ApexTheme;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors: string[];
  markers: any;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  labels: string[];
};

@Component({
  selector: 'app-starter',
  templateUrl: './starter.component.html',
  standalone: true,
  imports: [
    MatInput,
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepicker,
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
    NgApexchartsModule,
  ],
  styleUrls: ['./starter.component.scss'],
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class StarterComponent {
  idServicio: any;
  idSolicitud: any;
  fechaSeleccionadaI: Date | null = new Date();
  fechaSeleccionadaF: Date | null = new Date();
  bodegas: any[] = [];
  fechaHoy: any = new Date();

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private loteService: LoteService,
    private solicitudService: SolicitudService,
    private servicioService: ServicioService,
    private http: HttpClient
  ) {}
  servicios: any;
  solicitudes: any;
  lotesRecepcion: any;
  lotesDespacho: any;

  @ViewChild('chart') chart: ChartComponent = Object.create(null);

  public doughnutChartOptions: Partial<ChartOptions2> | any;

  ngOnInit() {
    this.crearLog();
    this.obtenerServicios();
    this.obtenerSolicitudes();
    this.getBodegas();
    this.cargarData();
    this.acumuladosMensual();
    this.fechaHoy = new Date();
    this.obtenerPrimerDiaDelMes(this.fechaHoy);
    this.cdr.detectChanges();
  }

  obtenerPrimerDiaDelMes(fecha: Date): Date {
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    this.formatDate(primerDia);
    return primerDia;
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

  getBodegas() {
    this.http
      .get('https://control.als-inspection.cl/api_min/api/bodega/')
      .subscribe((data: any) => {
        this.bodegas = data; // Asumiendo que la respuesta es un array de bodegas
      });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  recepLotes = 0;
  recepCamiones = 0;
  recepVagones = 0;
  recepBruto = 0;
  recepTara = 0;
  recepHumedo = 0;
  recepPorc = 0;
  recepSeco = 0;

  despLotes = 0;
  despCamiones = 0;
  despEmbarque = 0;
  despBruto = 0;
  despTara = 0;
  despHumedo = 0;
  despPorc = 0;
  despSeco = 0;

  cargarData() {
    this.recepLotes = 0;
    this.recepCamiones = 0;
    this.recepVagones = 0;
    this.recepBruto = 0;
    this.recepTara = 0;
    this.recepHumedo = 0;
    this.recepPorc = 0;
    this.recepSeco = 0;

    this.despLotes = 0;
    this.despCamiones = 0;
    this.despEmbarque = 0;
    this.despBruto = 0;
    this.despTara = 0;
    this.despHumedo = 0;
    this.despPorc = 0;
    this.despSeco = 0;

    console.log(this.fechaSeleccionadaI);
    console.log(this.fechaSeleccionadaF);

    if (this.fechaSeleccionadaI != null && this.fechaSeleccionadaF == null) {
      const fechaFormateada = this.formatDate(this.fechaSeleccionadaI);
      const apiUrl =
        'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
      this.http.get<any[]>(apiUrl).subscribe((data) => {
        this.lotesRecepcion = data;
        console.log(data);
        for (let i = 0; i < this.lotesRecepcion.length; i++) {
          if (this.lotesRecepcion[i].fLote >= fechaFormateada) {
            this.recepLotes = this.recepLotes + 1;
            this.recepCamiones =
              this.recepCamiones + this.lotesRecepcion[i].cantCamiones;
            this.recepVagones =
              this.recepVagones + this.lotesRecepcion[i].cantVagones;
            this.recepBruto =
              this.recepBruto +
              parseFloat(this.lotesRecepcion[i].pesoBrutoHumedo);
            this.recepTara =
              this.recepTara + parseFloat(this.lotesRecepcion[i].pesoTara);
            this.recepHumedo =
              this.recepHumedo +
              parseFloat(this.lotesRecepcion[i].pesoNetoHumedo);
            this.recepPorc =
              this.recepPorc + parseFloat(this.lotesRecepcion[i].porcHumedad);
            this.recepSeco =
              this.recepSeco + parseFloat(this.lotesRecepcion[i].pesoNetoSeco);
          }
        }
        if (this.recepPorc > 0) {
          this.recepPorc = Number(
            (this.recepPorc / this.recepLotes).toFixed(2)
          );
          this.recepSeco = Number(parseFloat(String(this.recepSeco)));
        } else {
          this.recepPorc = 0;
        }
        this.cargarDonut(this.recepCamiones, this.recepVagones);
      });

      const apiDes =
        'https://control.als-inspection.cl/api_min/api/lote-despacho/';
      this.http.get<any[]>(apiDes).subscribe((data) => {
        this.lotesDespacho = data;
        console.log(data);
        for (let i = 0; i < this.lotesDespacho.length; i++) {
          if (this.lotesDespacho[i].fLote >= fechaFormateada) {
            this.despLotes = this.despLotes + 1;
            this.despCamiones =
              this.despCamiones + this.lotesDespacho[i].cantCamiones;
            if (this.lotesDespacho[i].tipoTransporte == 'Embarque') {
              this.despEmbarque = this.despEmbarque + 1;
            }
            this.despBruto =
              this.despBruto +
              parseFloat(this.lotesDespacho[i].pesoBrutoHumedo);
            this.despTara =
              this.despTara + parseFloat(this.lotesDespacho[i].pesoTara);
            this.despHumedo =
              this.despHumedo +
              parseFloat(this.lotesDespacho[i].pesoNetoHumedo);
            this.despPorc =
              this.despPorc + parseFloat(this.lotesDespacho[i].porcHumedad);
            this.despSeco =
              this.despSeco + parseFloat(this.lotesDespacho[i].pesoNetoSeco);
          }
        }
        if (this.despPorc > 0) {
          this.despPorc = Number((this.despPorc / this.despLotes).toFixed(2));
          this.despSeco = Number(parseFloat(String(this.despSeco)));
        } else {
          this.despPorc = 0;
        }
      });

      if (this.recepLotes == 0 && this.despLotes == 0) {
        Notiflix.Notify.warning('No se han encontrado datos');
      } else {
        Notiflix.Notify.success('Se han encontrado datos');
      }
    } else if (
      this.fechaSeleccionadaI == null &&
      this.fechaSeleccionadaF != null
    ) {
      const fechaFormateadaF = this.formatDate(this.fechaSeleccionadaF);
      const apiUrl =
        'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
      this.http.get<any[]>(apiUrl).subscribe((data) => {
        this.lotesRecepcion = data;
        console.log(data);
        for (let i = 0; i < this.lotesRecepcion.length; i++) {
          if (this.lotesRecepcion[i].fLote <= fechaFormateadaF) {
            this.recepLotes = this.recepLotes + 1;
            this.recepCamiones =
              this.recepCamiones + this.lotesRecepcion[i].cantCamiones;
            this.recepVagones =
              this.recepVagones + this.lotesRecepcion[i].cantVagones;
            this.recepBruto =
              this.recepBruto +
              parseFloat(this.lotesRecepcion[i].pesoBrutoHumedo);
            this.recepTara =
              this.recepTara + parseFloat(this.lotesRecepcion[i].pesoTara);
            this.recepHumedo =
              this.recepHumedo +
              parseFloat(this.lotesRecepcion[i].pesoNetoHumedo);
            this.recepPorc =
              this.recepPorc + parseFloat(this.lotesRecepcion[i].porcHumedad);
            this.recepSeco =
              this.recepSeco + parseFloat(this.lotesRecepcion[i].pesoNetoSeco);
          }
        }
        if (this.recepPorc > 0) {
          this.recepPorc = Number(
            (this.recepPorc / this.recepLotes).toFixed(2)
          );
          this.recepSeco = Number(parseFloat(String(this.recepSeco)));
        } else {
          this.recepPorc = 0;
        }

        if (this.recepLotes == 0) {
          Notiflix.Notify.warning('No se han encontrado datos');
        } else {
          Notiflix.Notify.success('Se han encontrado datos');
        }
        this.cargarDonut(this.recepCamiones, this.recepVagones);
      });

      const apiDes =
        'https://control.als-inspection.cl/api_min/api/lote-despacho/';
      this.http.get<any[]>(apiDes).subscribe((data) => {
        this.lotesDespacho = data;
        console.log(data);
        for (let i = 0; i < this.lotesDespacho.length; i++) {
          if (this.lotesDespacho[i].fLote <= fechaFormateadaF) {
            this.despLotes = this.despLotes + 1;
            this.despCamiones =
              this.despCamiones + this.lotesDespacho[i].cantCamiones;
            if (this.lotesDespacho[i].tipoTransporte == 'Embarque') {
              this.despEmbarque = this.despEmbarque + 1;
            }
            this.despBruto =
              this.despBruto +
              parseFloat(this.lotesDespacho[i].pesoBrutoHumedo);
            this.despTara =
              this.despTara + parseFloat(this.lotesDespacho[i].pesoTara);
            this.despHumedo =
              this.despHumedo +
              parseFloat(this.lotesDespacho[i].pesoNetoHumedo);
            this.despPorc =
              this.despPorc + parseFloat(this.lotesDespacho[i].porcHumedad);
            this.despSeco =
              this.despSeco + parseFloat(this.lotesDespacho[i].pesoNetoSeco);
          }
        }
        if (this.despPorc > 0) {
          this.despPorc = Number((this.despPorc / this.despLotes).toFixed(2));
          this.despSeco = Number(parseFloat(String(this.despSeco)));
        } else {
          this.despPorc = 0;
        }
      });

      if (this.recepLotes == 0 && this.despLotes == 0) {
        Notiflix.Notify.warning('No se han encontrado datos');
      } else {
        Notiflix.Notify.success('Se han encontrado datos');
      }
    } else if (
      this.fechaSeleccionadaI != null &&
      this.fechaSeleccionadaF != null
    ) {
      const fechaFormateadaI = this.formatDate(this.fechaSeleccionadaI);
      const fechaFormateadaF = this.formatDate(this.fechaSeleccionadaF);
      const apiUrl =
        'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
      this.http.get<any[]>(apiUrl).subscribe((data) => {
        this.lotesRecepcion = data;
        console.log(data);
        for (let i = 0; i < this.lotesRecepcion.length; i++) {
          if (
            fechaFormateadaI <= this.lotesRecepcion[i].fLote &&
            this.lotesRecepcion[i].fLote <= fechaFormateadaF
          ) {
            this.recepLotes = this.recepLotes + 1;
            this.recepCamiones =
              this.recepCamiones + this.lotesRecepcion[i].cantCamiones;
            this.recepVagones =
              this.recepVagones + this.lotesRecepcion[i].cantVagones;
            this.recepBruto =
              this.recepBruto +
              parseFloat(this.lotesRecepcion[i].pesoBrutoHumedo);
            this.recepTara =
              this.recepTara + parseFloat(this.lotesRecepcion[i].pesoTara);
            this.recepHumedo =
              this.recepHumedo +
              parseFloat(this.lotesRecepcion[i].pesoNetoHumedo);
            this.recepPorc =
              this.recepPorc + parseFloat(this.lotesRecepcion[i].porcHumedad);
            this.recepSeco =
              this.recepSeco + parseFloat(this.lotesRecepcion[i].pesoNetoSeco);
          }
        }
        if (this.recepPorc > 0) {
          this.recepPorc = Number(
            (this.recepPorc / this.recepLotes).toFixed(2)
          );
          this.recepSeco = Number(parseFloat(String(this.recepSeco)));
        } else {
          this.recepPorc = 0;
        }

        this.cargarDonut(this.recepCamiones, this.recepVagones);

        const apiDes =
          'https://control.als-inspection.cl/api_min/api/lote-despacho/';
        this.http.get<any[]>(apiDes).subscribe((data) => {
          this.lotesDespacho = data;
          console.log(data);
          for (let i = 0; i < this.lotesDespacho.length; i++) {
            if (
              fechaFormateadaI <= this.lotesDespacho[i].fLote &&
              this.lotesDespacho[i].fLote <= fechaFormateadaF
            ) {
              this.despLotes = this.despLotes + 1;
              this.despCamiones =
                this.despCamiones + this.lotesDespacho[i].cantCamiones;
              if (this.lotesDespacho[i].tipoTransporte == 'Embarque') {
                this.despEmbarque = this.despEmbarque + 1;
              }
              this.despBruto =
                this.despBruto +
                parseFloat(this.lotesDespacho[i].pesoBrutoHumedo);
              this.despTara =
                this.despTara + parseFloat(this.lotesDespacho[i].pesoTara);
              this.despHumedo =
                this.despHumedo +
                parseFloat(this.lotesDespacho[i].pesoNetoHumedo);
              this.despPorc =
                this.despPorc + parseFloat(this.lotesDespacho[i].porcHumedad);
              this.despSeco =
                this.despSeco + parseFloat(this.lotesDespacho[i].pesoNetoSeco);
            }
          }
          if (this.despPorc > 0) {
            this.despPorc = Number((this.despPorc / this.despLotes).toFixed(2));
            this.despSeco = Number(parseFloat(String(this.despSeco)));
          } else {
            this.despPorc = 0;
          }
        });
        if (this.recepLotes == 0 && this.despLotes == 0) {
          Notiflix.Notify.warning('No se han encontrado datos');
        } else {
          Notiflix.Notify.success('Se han encontrado datos');
        }
      });
    } else {
      if (
        this.idServicio == null ||
        this.idServicio == undefined ||
        this.idServicio == 0 ||
        this.idServicio == ''
      ) {
        Notiflix.Notify.failure('Por favor, seleccione un servicio');
        this.recepLotes = 0;
        this.recepCamiones = 0;
        this.recepVagones = 0;
        this.recepBruto = 0;
        this.recepTara = 0;
        this.recepHumedo = 0;
        this.recepPorc = 0;
        this.recepSeco = 0;
        return;
      }
      if (
        this.idSolicitud == null ||
        this.idSolicitud == undefined ||
        this.idSolicitud == 0 ||
        this.idSolicitud == ''
      ) {
        Notiflix.Notify.failure('Por favor, seleccione una solicitud');
        this.recepLotes = 0;
        this.recepCamiones = 0;
        this.recepVagones = 0;
        this.recepBruto = 0;
        this.recepTara = 0;
        this.recepHumedo = 0;
        this.recepPorc = 0;
        this.recepSeco = 0;
        return;
      }
      if (this.idServicio && this.idSolicitud) {
        const apiUrl =
          'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
        this.http.get<any[]>(apiUrl).subscribe((data) => {
          this.lotesRecepcion = data;
          console.log(data);
          for (let i = 0; i < this.lotesRecepcion.length; i++) {
            if (
              this.lotesRecepcion[i].servicio == this.idServicio &&
              this.lotesRecepcion[i].solicitud == this.idSolicitud
            ) {
              this.recepLotes = this.recepLotes + 1;
              this.recepCamiones =
                this.recepCamiones + this.lotesRecepcion[i].cantCamiones;
              this.recepVagones =
                this.recepVagones + this.lotesRecepcion[i].cantVagones;
              this.recepBruto =
                this.recepBruto +
                parseFloat(this.lotesRecepcion[i].pesoBrutoHumedo);
              this.recepTara =
                this.recepTara + parseFloat(this.lotesRecepcion[i].pesoTara);
              this.recepHumedo =
                this.recepHumedo +
                parseFloat(this.lotesRecepcion[i].pesoNetoHumedo);
              this.recepPorc =
                this.recepPorc + parseFloat(this.lotesRecepcion[i].porcHumedad);
              this.recepSeco =
                this.recepSeco +
                parseFloat(this.lotesRecepcion[i].pesoNetoSeco);
            }
          }
          if (this.recepPorc > 0) {
            this.recepPorc = Number(
              (this.recepPorc / this.recepLotes).toFixed(2)
            );
            this.recepSeco = Number(parseFloat(String(this.recepSeco)));
          } else {
            this.recepPorc = 0;
          }

          if (this.recepLotes == 0 && this.despLotes == 0) {
            Notiflix.Notify.warning('No se han encontrado datos');
          } else {
            Notiflix.Notify.success('Se han encontrado datos');
          }
          this.cargarDonut(this.recepCamiones, this.recepVagones);
        });

        const apiDes =
          'https://control.als-inspection.cl/api_min/api/lote-despacho/';
        this.http.get<any[]>(apiDes).subscribe((data) => {
          this.lotesDespacho = data;
          console.log(data);
          for (let i = 0; i < this.lotesDespacho.length; i++) {
            if (
              this.lotesDespacho[i].servicio == this.idServicio &&
              this.lotesDespacho[i].solicitud == this.idSolicitud
            ) {
              this.despLotes = this.despLotes + 1;
              this.despCamiones =
                this.despCamiones + this.lotesDespacho[i].cantCamiones;
              if (this.lotesDespacho[i].tipoTransporte == 'Embarque') {
                this.despEmbarque = this.despEmbarque + 1;
              }
              this.despBruto =
                this.despBruto +
                parseFloat(this.lotesDespacho[i].pesoBrutoHumedo);
              this.despTara =
                this.despTara + parseFloat(this.lotesDespacho[i].pesoTara);
              this.despHumedo =
                this.despHumedo +
                parseFloat(this.lotesDespacho[i].pesoNetoHumedo);
              this.despPorc =
                this.despPorc + parseFloat(this.lotesDespacho[i].porcHumedad);
              this.despSeco =
                this.despSeco + parseFloat(this.lotesDespacho[i].pesoNetoSeco);
            }
          }
          if (this.despPorc > 0) {
            this.despPorc = Number((this.despPorc / this.despLotes).toFixed(2));
            this.despSeco = Number(parseFloat(String(this.despSeco)));
          } else {
            this.despPorc = 0;
          }
        });
        if (this.recepLotes == 0 && this.despLotes == 0) {
          Notiflix.Notify.warning('No se han encontrado datos');
        } else {
          Notiflix.Notify.success('Se han encontrado datos');
        }
      } else {
        Notiflix.Notify.warning('No se han encontrado datos');
        this.recepLotes = 0;
        this.recepCamiones = 0;
        this.recepVagones = 0;
        this.recepBruto = 0;
        this.recepTara = 0;
        this.recepHumedo = 0;
        this.recepPorc = 0;
        this.recepSeco = 0;

        this.despLotes = 0;
        this.despCamiones = 0;
        this.despEmbarque = 0;
        this.despBruto = 0;
        this.despTara = 0;
        this.despHumedo = 0;
        this.despPorc = 0;
        this.despSeco = 0;
      }
    }
  }

  crearNuevoLote() {
    const dialogRef = this.dialog.open(NuevoLoteComponent, {
      width: '600px',
      data: {
        idServicio: this.idServicio,
        idSolicitud: this.idSolicitud,
      },
    });
  }

  verRecepcion() {
    const dialogRef = this.dialog.open(RecepcionComponent, {
      width: 'flex',
      height: '600px',
      data: {
        titulo: 'Recepción',
        sub: 'Aquí podrá acceder al detalle de los lotes ingresados',
        idServicio: this.idServicio,
        idSolicitud: this.idSolicitud,
      },
    });
  }

  verDespacho() {
    const dialogRef = this.dialog.open(DespachoComponent, {
      width: 'flex',
      height: '600px',
      data: {
        titulo: 'Despacho',
        sub: 'Aquí podrá acceder al detalle de los lotes ingresados',
        idServicio: this.idServicio,
        idSolicitud: this.idSolicitud,
      },
    });
  }

  verInventario(idBodega: number) {}

  solicitudesFiltradas: any[];

  filtrarSolicitudes(servicioId: number) {
    this.solicitudesFiltradas = this.solicitudes.filter(
      (solicitud: { nServ: number }) => solicitud.nServ === servicioId
    );
  }

  valorGuardado: any;
  valorGuardado2: any;
  cargarDonut(cantCamiones: any, cantVagones: any) {
    this.doughnutChartOptions = {
      series: [cantCamiones, cantVagones],
      chart: {
        id: 'donut-chart',
        type: 'donut',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const selectedData = config.w.config.series[config.dataPointIndex];

            // Si el valor ya ha sido guardado, se deselecciona
            if (this.valorGuardado === selectedData) {
              this.valorGuardado = null;
              console.log('Valor deseleccionado:', this.valorGuardado);
            } else {
              this.valorGuardado = selectedData;
              console.log('Valor guardado:', this.valorGuardado);
            }

            // Se forzar la actualización del gráfico
            chartContext.updateOptions(
              {
                plotOptions: {
                  pie: {
                    donut: {
                      labels: {
                        total: {
                          show: true,
                          formatter: (w: any) => {
                            return this.valorGuardado
                              ? this.valorGuardado + ' Total'
                              : w.globals.seriesTotals.reduce(
                                  (a: any, b: any) => a + b,
                                  0
                                ) + ' Total';
                          },
                        },
                      },
                    },
                  },
                },
              },
              false,
              false
            );
          },
        },
      },
      labels: ['Camiones', 'Vagones'],
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: false,
              },
              value: {
                show: true,
                formatter: (val: any) => {
                  // Aquí estamos mostrando el valor solo si se ha guardado
                  if (val != null) {
                    return val + ' Total';
                  } else {
                    return val + ' Total';
                  }
                },
              },
              total: {
                show: true,
                showAlways: false,
                formatter: (w: any) => {
                  // Si el valor guardado no es el valor actual, mostrar el valor guardado
                  if (this.valorGuardado != null) {
                    return this.valorGuardado + ' Total';
                  } else {
                    // Si no, mostrar el total de la serie
                    return w != null
                      ? w.globals.seriesTotals.reduce(
                          (a: any, b: any) => a + b,
                          0
                        ) + ' Total'
                      : 'no tiene';
                  }
                },
              },
            },
          },
        },
      },
      legend: {
        show: true,
        width: '50px',
      },
      colors: ['#5D87FF', '#06d79c', '#49BEFF'],
      tooltip: {
        theme: 'dark',
        fillSeriesColor: false,
      },
    };

    // Detecta los cambios en el gráfico
    this.cdr.detectChanges();
  }

  // Mandar un mensaje a la consola con la información del usuario
  crearLog() {
    const email = localStorage.getItem('email');
    const fechaHoy = new Date();
    const fechaFormateada = fechaHoy.toISOString().split('T')[0];
    const horaHoy = `${fechaHoy.getHours().toString().padStart(2, '0')}:${fechaHoy.getMinutes().toString().padStart(2, '0')}`;
    

    const datos = {
      email: email,
      fecha: fechaFormateada,
      hora: horaHoy,
    };
    console.log(datos);
    fetch('https://control.als-inspection.cl/api_min/api/user-logs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  }

  acumuladosMensual(){
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const añoActual = fechaActual.getFullYear();
    
    fetch(`https://control.als-inspection.cl/api_min/api/recepcion-transporte/`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error(error));
  }
}
