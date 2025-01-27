import { bodega } from './../../services/bodega.service';
import { HttpClient } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { RolService } from 'src/app/services/rol.service';
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
} from 'ng-apexcharts';
 

export type ChartOptions = {
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
  imports: [NgApexchartsModule, MaterialModule],
  styleUrls: ['./starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent {
  @ViewChild('chart') chart: ChartComponent;
  displayedColumns: string[] = ['idBodega', 'nombreBodega', 'total'];
  dataSource: any[] = [];

  public pieChartOptions: Partial<ChartOptions> | any;

  constructor(private http: HttpClient) {
    this.pieChartOptions = {
      series: [78, 15, 27, 18, 35],
      chart: {
        id: 'pie-chart',
        type: 'pie',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70px',
          },
        },
      },
      legend: {
        show: true,
        position: 'bottom',
        width: '50px',
      },
      colors: ['#5D87FF', '#ECF2FF', '#49BEFF', '#E8F7FF', '#FFAE1F'],
      tooltip: {
        fillSeriesColor: false,
      },
    };
  }

  ngOnInit() {
    console.log(localStorage.getItem('token'));
    console.log(RolService.isTokenValid());
    this.cargarDatos();
    this.completarChart();
  }

  completarChart(){
    console.log(this.dataSource)
  }

  cargarDatos(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/api/bodega/').subscribe(
      (data) => {
        this.dataSource = data;
        this.pieChartOptions = {
          series: this.dataSource.map((item) => Number(item.total)),
          labels: this.dataSource.map((item) => String(item.nombreBodega)),
          chart: {
            id: 'pie-chart',
            type: 'pie',
            height: 350,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            foreColor: '#adb0bb',
            toolbar: {
              show: false,
            },
          },
          dataLabels: {
            enabled: true,
          },
          plotOptions: {
            pie: {
              donut: {
                size: '70px',
              },
            },
          },
          legend: {
            show: true,
            position: 'bottom',
            width: '50px',
            formatter: (bodega: string, opts: string) => {
              return bodega;
            },
          },
          colors: ['#5D87FF', '#ECF2FF', '#49BEFF', '#E8F7FF', '#FFAE1F'],
          tooltip: {
            fillSeriesColor: false,
          },
        };
      },
      (error) => {
        console.error('Error al cargar los datos:', error);
      }
    );
  }
}
