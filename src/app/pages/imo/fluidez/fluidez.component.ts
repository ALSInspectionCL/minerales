  import { P } from '@angular/cdk/keycodes';
import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import { RolService } from 'src/app/services/rol.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-fluidez',
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
    MatCardModule,
    MatTable,
    MatFormField,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './fluidez.component.html',
  styleUrl: './fluidez.component.scss',
})
export class FluidezComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  // D3 chart variables
  private svg: any;
  private margin = { top: 20, right: 30, bottom: 40, left: 50 };
  private width = 600 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  private chartData: any[] = [];
  trendlineFormula: string = '';
  private chartUpdateTimeout: any;
  // Recibir la información desde el componente padre
  nLote: string = '';
  idSolicitud: string = '';
  idServicio: string = '';
  tonelaje: number;
  nombreEmbarque: string = '';
  cliente: boolean = false;
  humedadForm: FormGroup;
  fluidezForms: FormGroup[] = [];
  fechaPrueba: String = this.formatDate(new Date());

  // New properties for summary data
  avgHumedad: string = '';
  avgDesplazamiento: string = '';
  avgDiametroBase: string = '';

  constructor(
    private http: HttpClient,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      numero: any;
      idServicio: any;
      idSolicitud: any;
      nLote: any;
      observacion: any;
      nave: any;
    },
    private rolService: RolService
  ) {
    // Asignar los valores recibidos a las variables locales
    this.nLote = data.nLote;
    this.idSolicitud = data.idSolicitud;
    this.idServicio = data.idServicio;
    this.humedadForm = new FormGroup({
      id: new FormControl(0), // Este campo se actualizará después de verificar si el nLote existe
      nLote: new FormControl(this.data.nLote),
      fechaPrueba: new FormControl(this.formatDate(new Date())),
      nSublote: new FormControl(''),
      observacion: new FormControl('Iniciado'),
      fInicio: new FormControl(null),
      fFin: new FormControl(null),
      idSolicitud: new FormControl(this.data.idSolicitud),
      idServicio: new FormControl(this.data.idServicio),
      nLata1: new FormControl(''),
      nLata2: new FormControl(''),
      pLata1: new FormControl(''),
      pLata2: new FormControl(''),
      pBrutoHumedo1: new FormControl(''),
      pBrutoHumedo2: new FormControl(''),
      pBrutoSeco1: new FormControl(''),
      pBrutoSeco2: new FormControl(''),
      porcHumedad1: new FormControl(''),
      porcHumedad2: new FormControl(''),
      porcHumedadPromedio: new FormControl(''),
      tonelaje: new FormControl(0),
      estado: new FormControl('Iniciado'),
    });
  }
  
  // New method to calculate summary data
  calculateSummary() {
    // Calculate average humidity from humedadForm
    this.avgHumedad = this.humedadForm.get('porcHumedadPromedio')?.value || '';

    // Calculate average displacement from fluidezForms
    let totalDesplazamiento = 0;
    let countDesplazamiento = 0;
    this.fluidezForms.forEach((form) => {
      const desplazamiento = parseFloat(form.get('desplazamiento')?.value);
      if (!isNaN(desplazamiento)) {
        totalDesplazamiento += desplazamiento;
        countDesplazamiento++;
      }
    });
    this.avgDesplazamiento =
      countDesplazamiento > 0
        ? (totalDesplazamiento / countDesplazamiento).toFixed(2)
        : '';

    // Calculate average diametroBase from fluidezForms
    let totalDiametroBase = 0;
    let countDiametroBase = 0;
    this.fluidezForms.forEach((form) => {
      const diametroBase = parseFloat(form.get('diametroBase')?.value);
      if (!isNaN(diametroBase)) {
        totalDiametroBase += diametroBase;
        countDiametroBase++;
      }
    });
    this.avgDiametroBase = countDiametroBase > 0 ? (totalDiametroBase / countDiametroBase).toFixed(2) : '';
  }

  ngOnInit(): void {
    console.log('Datos recibidos:', this.data);
    this.rolService
      .hasRole(localStorage.getItem('email') || '', 'Cliente')
      .subscribe((hasRole) => {
        if (hasRole) {
          this.cliente = true;
          console.log('El usuario tiene el rol de cliente');
        } else {
          this.cliente = false;
          console.log('El usuario no tiene el rol de cliente');
        }
      });

    // Preload fluidez data if exists
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/fluidez/`)
      .subscribe(
        (data) => {
          const existente = data.find((item) => item.nLote === this.nLote);
          if (existente) {
            console.log('Fluidez existente encontrada:', existente);
            const formatted = {
              ...existente,
              pLata1: this.formatDecimal(existente.pLata1),
              pLata2: this.formatDecimal(existente.pLata2),
              pBrutoHumedo1: this.formatDecimal(existente.pBrutoHumedo1),
              pBrutoHumedo2: this.formatDecimal(existente.pBrutoHumedo2),
              pBrutoSeco1: this.formatDecimal(existente.pBrutoSeco1),
              pBrutoSeco2: this.formatDecimal(existente.pBrutoSeco2),
              porcHumedad1: this.formatDecimal(existente.porcHumedad1),
              porcHumedad2: this.formatDecimal(existente.porcHumedad2),
              porcHumedadPromedio: this.formatDecimal(existente.porcHumedadPromedio),
              tonelaje: 0, // Don't load tonnage from fluidez table, it will be loaded from lote-despacho
            };
            this.humedadForm.patchValue(formatted);
          } else {
            console.log('No existe fluidez para nLote:', this.nLote);
          }
        },
        (error) => {
          console.error('Error al buscar fluidez:', error);
        }
      );

    // Suscripciones para cálculo automático de porcHumedad1
    this.humedadForm
      .get('pLata1')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad1());
    this.humedadForm
      .get('pBrutoHumedo1')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad1());
    this.humedadForm
      .get('pBrutoSeco1')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad1());

    // Suscripciones para cálculo automático de porcHumedad2
    this.humedadForm
      .get('pLata2')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad2());
    this.humedadForm
      .get('pBrutoHumedo2')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad2());
    this.humedadForm
      .get('pBrutoSeco2')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad2());

    // Initialize fluidezForms
    for (let i = 0; i < 7; i++) {
      this.fluidezForms[i] = new FormGroup({
        id: new FormControl(0),
        nLote: new FormControl(this.data.nLote),
        nPrueba: new FormControl(i + 1),
        nLata1: new FormControl(''),
        nLata2: new FormControl(''),
        pLata1: new FormControl(''),
        pLata2: new FormControl(''),
        pBrutoHumedo1: new FormControl(''),
        pBrutoHumedo2: new FormControl(''),
        pBrutoSeco1: new FormControl(''),
        pBrutoSeco2: new FormControl(''),
        porcHumedad1: new FormControl(''),
        porcHumedad2: new FormControl(''),
        porcHumedadPromedio: new FormControl(''),
        desplazamiento: new FormControl(''),
        diametroBase: new FormControl(''),
        estado: new FormControl('Iniciado'),
      });
    }
    // Preload fluidez data for each step
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/prueba-fluidez/`)
      .subscribe(
        (data) => {
          console.log('Datos de prueba-fluidez recibidos:', data);
          for (let i = 0; i < 7; i++) {
            const existente = data.find(
              (item) => item.nLote === this.nLote && Number(item.nPrueba) === i + 1
            );
            if (existente) {
              console.log(`Fluidez existente encontrada para paso ${i}:`, existente);
              const formatted = {
                ...existente,
                pLata1: this.formatDecimal(existente.pLata1),
                pLata2: this.formatDecimal(existente.pLata2),
                pBrutoHumedo1: this.formatDecimal(existente.pBrutoHumedo1),
                pBrutoHumedo2: this.formatDecimal(existente.pBrutoHumedo2),
                pBrutoSeco1: this.formatDecimal(existente.pBrutoSeco1),
                pBrutoSeco2: this.formatDecimal(existente.pBrutoSeco2),
                porcHumedad1: this.formatDecimal(existente.porcHumedad1),
                porcHumedad2: this.formatDecimal(existente.porcHumedad2),
                porcHumedadPromedio: this.formatDecimal(existente.porcHumedadPromedio),
                desplazamiento: this.formatDecimal(existente.desplazamiento),
                diametroBase: this.formatDecimal(existente.diametroBase),
              };
              this.fluidezForms[i].patchValue(formatted);
            } else {
              console.log(`No existe fluidez para nLote: ${this.nLote}, paso: ${i + 1}`);
            }
          }
        },
        (error) => {
          console.error('Error al buscar prueba-fluidez:', error);
        }
      );

    // Suscripciones para cálculo automático de porcHumedad en cada fluidezForm
    for (let i = 0; i < 7; i++) {
      this.fluidezForms[i]
        .get('pLata1')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 1));
      this.fluidezForms[i]
        .get('pBrutoHumedo1')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 1));
      this.fluidezForms[i]
        .get('pBrutoSeco1')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 1));
      this.fluidezForms[i]
        .get('desplazamiento')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 1));
      this.fluidezForms[i]
        .get('pLata2')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 2));
      this.fluidezForms[i]
        .get('pBrutoHumedo2')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 2));
      this.fluidezForms[i]
        .get('pBrutoSeco2')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 2));
    }

    // After loading data, calculate summary
    this.calculateSummary();

    // Subscribe to changes to recalculate summary dynamically
    this.humedadForm.get('porcHumedadPromedio')?.valueChanges.subscribe(() => {
      this.calculateSummary();
    });
    this.fluidezForms.forEach((form) => {
      form.get('desplazamiento')?.valueChanges.subscribe(() => {
        this.calculateSummary();
      });
      form.get('diametroBase')?.valueChanges.subscribe(() => {
        this.calculateSummary();
      });
    });

    this.nombreEmbarque = this.data.observacion || '';

    // Load fluidez data and tonnage from API
    this.cargarFluidez();

    // Subscribe to fluidezForms changes to update chart dynamically
    this.fluidezForms.forEach((form, index) => {
      form.get('diametroBase')?.valueChanges.subscribe(() => {
        this.updateChart();
      });
      form.get('porcHumedadPromedio')?.valueChanges.subscribe(() => {
        this.updateChart();
      });
    });
  }

  ngAfterViewInit(): void {
    this.createChart();
    this.updateChart();
  }

  // Metodo para cargar solo los datos validos, verificando que la humedad sea mayor a 0. Ordenados por humedad
  getChartData(): any[] {
    const data: any[] = [];

    this.fluidezForms.forEach((form, index) => {
      const diametroBase = parseFloat(form.get('diametroBase')?.value);
      const humedad = parseFloat(form.get('porcHumedadPromedio')?.value);
      const desplazamiento = parseFloat(form.get('desplazamiento')?.value);

      // Include points that have both values, including cases where desplazamiento = 0
      if (!isNaN(diametroBase) && !isNaN(humedad) && humedad > 0) {
        // Include points where diametroBase > 0 OR desplazamiento = 0
        if (diametroBase > 0 || (!isNaN(desplazamiento) && desplazamiento === 0)) {
          data.push({
            prueba: index + 1,
            diametroBase: diametroBase,
            humedad: humedad,
            desplazamiento: desplazamiento
          });
        }
      }
    });

    // Sort data by humidity from lowest to highest
    return data.sort((a, b) => a.humedad - b.humedad);
  }

  // Nueva función para calcular porcentaje de humedad sin redondear (para el gráfico)
  calcularPorcentajeHumedadParaGrafico(
    pesoBrutoHumedo: any,
    pesoBrutoSeco: any,
    taraBandeja: any
  ): number {
    const brutoHumedoVal = parseFloat(pesoBrutoHumedo);
    const brutoSecoVal = parseFloat(pesoBrutoSeco);
    const taraBandejaVal = parseFloat(taraBandeja);

    if (
      isNaN(brutoHumedoVal) ||
      isNaN(brutoSecoVal) ||
      brutoHumedoVal === 0 ||
      isNaN(taraBandejaVal)
    ) {
      return 0;
    }

    const diferencia = ((brutoHumedoVal - brutoSecoVal) / (brutoHumedoVal - taraBandejaVal)) * 100;
    return diferencia >= 0 ? diferencia : 0;
  }

  // Nueva función para obtener datos del gráfico con valores completos de humedad
  getChartDataWithCompleteValues(): any[] {
    const data: any[] = [];

    this.fluidezForms.forEach((form, index) => {
      const diametroBase = parseFloat(form.get('diametroBase')?.value);
      const desplazamiento = parseFloat(form.get('desplazamiento')?.value);

      // Calcular humedad completa (sin redondear) para el gráfico
      const pBrutoHumedo1 = form.get('pBrutoHumedo1')?.value;
      const pBrutoHumedo2 = form.get('pBrutoHumedo2')?.value;
      const pBrutoSeco1 = form.get('pBrutoSeco1')?.value;
      const pBrutoSeco2 = form.get('pBrutoSeco2')?.value;
      const pLata1 = form.get('pLata1')?.value;
      const pLata2 = form.get('pLata2')?.value;

      // Calcular humedad promedio completa para el gráfico
      const humedad1 = this.calcularPorcentajeHumedadParaGrafico(pBrutoHumedo1, pBrutoSeco1, pLata1);
      const humedad2 = this.calcularPorcentajeHumedadParaGrafico(pBrutoHumedo2, pBrutoSeco2, pLata2);

      let humedadCompleta = 0;
      if (humedad1 > 0 && humedad2 > 0) {
        humedadCompleta = (humedad1 + humedad2) / 2;
      }

      // Include points that have both values, including cases where desplazamiento = 0
      if (!isNaN(diametroBase) && humedadCompleta > 0) {
        // Include points where diametroBase > 0 OR desplazamiento = 0
        if (diametroBase > 0 || (!isNaN(desplazamiento) && desplazamiento === 0)) {
          data.push({
            prueba: index + 1,
            diametroBase: diametroBase,
            humedad: humedadCompleta, // Usar valor completo sin redondear
            desplazamiento: desplazamiento
          });
          // Console log para debug: mostrar diámetro y humedad
          console.log(`Prueba ${index + 1}: diámetro=${diametroBase.toFixed(2)}cm, humedad=${humedadCompleta}%`);
        }
      }
    });

    // Sort data by humidity from lowest to highest
    return data.sort((a, b) => a.humedad - b.humedad);
  }

  // Calcular linea de tendencia
  calculateTrendline(data: any[]): { slope: number; intercept: number; r2: number } {
    const n = data.length;
    if (n < 2) {
      return { slope: 0, intercept: 0, r2: 0 };
    }

    // X = humedad (variable independiente)
    // Y = diámetro base (variable dependiente)
    const sumX = data.reduce((sum, point) => sum + point.humedad, 0);
    const sumY = data.reduce((sum, point) => sum + point.diametroBase, 0);
    const sumXY = data.reduce((sum, point) => sum + point.humedad * point.diametroBase, 0);
    const sumXX = data.reduce((sum, point) => sum + point.humedad * point.humedad, 0);
    const sumYY = data.reduce((sum, point) => sum + point.diametroBase * point.diametroBase, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = data.reduce((sum, point) => sum + Math.pow(point.diametroBase - yMean, 2), 0);
    const residualSumSquares = data.reduce((sum, point) => {
      const predicted = slope * point.humedad + intercept;
      return sum + Math.pow(point.diametroBase - predicted, 2);
    }, 0);

    const r2 = totalSumSquares !== 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;

    return { slope, intercept, r2 };
  }

  // Crear la estructura inicial del gráfico
  createChart(): void {
    if (!this.chartContainer) return;

    // Clear previous chart
    d3.select(this.chartContainer.nativeElement).select('svg').remove();

    // Create SVG
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Add grid lines
    this.svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.createXScale([])).tickSize(-this.height).tickFormat(null));

    this.svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(this.createYScale([])).tickSize(-this.width).tickFormat(null));
  }

  // Actualizar grafico con nuevos datos (con debounce para evitar duplicados)
  updateChart(): void {
    // Clear existing timeout to debounce multiple rapid calls
    if (this.chartUpdateTimeout) {
      clearTimeout(this.chartUpdateTimeout);
    }

    // Set new timeout to delay chart update
    this.chartUpdateTimeout = setTimeout(() => {
      this.performChartUpdate();
    }, 100); // 100ms debounce delay
  }

  // Perform the actual chart update
  private performChartUpdate(): void {
    if (!this.svg) return;

    const data = this.getChartDataWithCompleteValues();
    this.chartData = data;

    if (data.length === 0) {
      this.trendlineFormula = 'No hay datos válidos para mostrar';
      return;
    }

    // Calculate scales
    const xScale = this.createXScale(data);
    const yScale = this.createYScale(data);

    // Calculate trendline
    const trendline = this.calculateTrendline(data);
    this.trendlineFormula = `y = ${trendline.slope.toFixed(3)}x + ${trendline.intercept.toFixed(3)} (R² = ${trendline.r2.toFixed(3)})`;

    // Clear ALL previous elements (more comprehensive cleanup)
    this.svg.selectAll('*').remove();

    // Re-add grid lines
    this.svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(xScale).tickSize(-this.height).tickFormat(null));

    this.svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).tickSize(-this.width).tickFormat(null));

    // // Add X axis
    // this.svg.append('g')
    //   .attr('class', 'axis')
    //   .attr('transform', `translate(0,${this.height})`)
    //   .call(d3.axisBottom(xScale));

    // // Add Y axis
    // this.svg.append('g')
    //   .attr('class', 'axis')
    //   .call(d3.axisLeft(yScale));

    // Add X axis label
    this.svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', this.width / 2)
      .attr('y', this.height + this.margin.bottom - 5)
      .style('text-anchor', 'middle')
      .text('Humedad (%)');

    // Add Y axis label
    this.svg.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -this.margin.left + 15)
      .style('text-anchor', 'middle')
      .text('Diámetro Base (cm)');

    // Add points
    this.svg.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d: any) => xScale(d.humedad))  // X = humedad
      .attr('cy', (d: any) => yScale(d.diametroBase))  // Y = diámetro base
      .attr('r', 6)
      .style('fill', '#3b82f6')
      .style('stroke', '#1e40af')
      .style('stroke-width', 2)
      .append('title')
      .text((d: any) => `Prueba ${d.prueba}: Humedad ${d.humedad}%, Diámetro ${d.diametroBase} cm`);

    // Add trendline
    if (data.length > 1) {
      const line = d3.line()
        .x((d: any) => xScale(d.humedad))  // X = humedad
        .y((d: any) => yScale(trendline.slope * d.humedad + trendline.intercept));  // Y = predicción

      this.svg.append('path')
        .datum(data)
        .attr('class', 'trendline')
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', line);
    }
  }

  // Helper method to create X scale (now uses humedad data)
  private createXScale(data: any[]): any {
    const minX = d3.min(data, (d: any) => d.humedad) || 0;
    const maxX = d3.max(data, (d: any) => d.humedad) || 10;

    return d3.scaleLinear()
      .domain([Math.max(0, minX - 1), maxX + 1])
      .range([0, this.width]);
  }

  // Helper method to create Y scale (now uses diametroBase data)
  private createYScale(data: any[]): any {
    const minY = d3.min(data, (d: any) => d.diametroBase) || 0;
    const maxY = d3.max(data, (d: any) => d.diametroBase) || 10;

    return d3.scaleLinear()
      .domain([Math.max(0, minY - 1), maxY + 1])
      .range([this.height, 0]);
  }

  cargarFluidez(){
    // Load tonnage data from lote-despacho API first
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/lote-despacho/${this.nLote}/`)
      .subscribe(
        (dataDespacho) => {
          if(dataDespacho.length > 0){
            // Find the dispatch that matches the current service and request
            const despacho = dataDespacho.find((item) => item.idServicio === this.idServicio && item.idSolicitud === this.idSolicitud);
            if (despacho) {
              this.nombreEmbarque = despacho.nombreEmbarque || '';
              this.tonelaje = despacho.pesoNetoHumedo || 0;

              console.log('Tonnage loaded from lote-despacho:', this.tonelaje);

              // Update the form with the loaded tonnage value
              this.humedadForm.patchValue({ tonelaje: this.tonelaje });

              // Also update the component property to ensure consistency
              this.humedadForm.get('tonelaje')?.setValue(this.tonelaje);
            } else {
              this.nombreEmbarque = '';
              this.tonelaje = 0;
              this.humedadForm.patchValue({ tonelaje: 0 });
            }
          } else {
            this.nombreEmbarque = '';
            this.tonelaje = 0;
            this.humedadForm.patchValue({ tonelaje: 0 });
          }
        },
        (error) => {
          console.error('Error loading lote-despacho:', error);
          this.tonelaje = 0;
          this.humedadForm.patchValue({ tonelaje: 0 });
        }
      );

    // Also check if there's existing fluidez data to load other fields
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/fluidez/`)
      .subscribe(
        (data) => {
          const existente = data.find((item) => item.nLote === this.nLote);
          if (existente) {
            console.log('Existing fluidez data found:', existente);
            this.fechaPrueba = existente.fInicio || this.formatDate(new Date());

            // Load other fields from fluidez but NOT the tonnage (we already loaded it from lote-despacho)
            const formatted = {
              ...existente,
              pLata1: this.formatDecimal(existente.pLata1),
              pLata2: this.formatDecimal(existente.pLata2),
              pBrutoHumedo1: this.formatDecimal(existente.pBrutoHumedo1),
              pBrutoHumedo2: this.formatDecimal(existente.pBrutoHumedo2),
              pBrutoSeco1: this.formatDecimal(existente.pBrutoSeco1),
              pBrutoSeco2: this.formatDecimal(existente.pBrutoSeco2),
              porcHumedad1: this.formatDecimal(existente.porcHumedad1),
              porcHumedad2: this.formatDecimal(existente.porcHumedad2),
              porcHumedadPromedio: this.formatDecimal(existente.porcHumedadPromedio),
              // Don't override tonnage here - it's already loaded from lote-despacho
            };
            this.humedadForm.patchValue(formatted);
          } else {
            console.log('No existing fluidez data for nLote:', this.nLote);
          }
        },
        (error) => {
          console.error('Error loading fluidez data:', error);
        }
      );
  }

  updatePorcHumedad1() {
    const pLata1 = this.humedadForm.get('pLata1')?.value;
    const pBrutoHumedo1 = this.humedadForm.get('pBrutoHumedo1')?.value;
    const pBrutoSeco1 = this.humedadForm.get('pBrutoSeco1')?.value;
    const porcHumedad1 = this.calcularPorcentajeHumedad(
      pBrutoHumedo1,
      pBrutoSeco1,
      pLata1
    );
    this.humedadForm.patchValue({ porcHumedad1 }, { emitEvent: false });
    this.updatePorcHumedadPromedio();
  }

  updatePorcHumedad2() {
    const pLata2 = this.humedadForm.get('pLata2')?.value;
    const pBrutoHumedo2 = this.humedadForm.get('pBrutoHumedo2')?.value;
    const pBrutoSeco2 = this.humedadForm.get('pBrutoSeco2')?.value;
    const porcHumedad2 = this.calcularPorcentajeHumedad(
      pBrutoHumedo2,
      pBrutoSeco2,
      pLata2
    );
    this.humedadForm.patchValue({ porcHumedad2 }, { emitEvent: false });
    this.updatePorcHumedadPromedio();
  }

  updatePorcHumedadPromedio() {
    const porcHumedad1 =
      parseFloat(this.humedadForm.get('porcHumedad1')?.value) || 0;
    const porcHumedad2 =
      parseFloat(this.humedadForm.get('porcHumedad2')?.value) || 0;
    if (porcHumedad1 > 0 && porcHumedad2 > 0) {
      const promedio = ((porcHumedad1 + porcHumedad2) / 2).toFixed(2);
      this.humedadForm.patchValue(
        { porcHumedadPromedio: promedio },
        { emitEvent: false }
      );
    } else {
      this.humedadForm.patchValue(
        { porcHumedadPromedio: '' },
        { emitEvent: false }
      );
    }
  }

  updatePorcHumedadFluidez(step: number, bandeja: number) {
    const form = this.fluidezForms[step];
    const pLata = form.get(`pLata${bandeja}`)?.value;
    const pBrutoHumedo = form.get(`pBrutoHumedo${bandeja}`)?.value;
    const pBrutoSeco = form.get(`pBrutoSeco${bandeja}`)?.value;
    const porcHumedad = this.calcularPorcentajeHumedad(
      pBrutoHumedo,
      pBrutoSeco,
      pLata
    );
    form.patchValue({ [`porcHumedad${bandeja}`]: porcHumedad }, { emitEvent: false });
    this.updatePorcHumedadPromedioFluidez(step);
  }

  updatePorcHumedadPromedioFluidez(step: number) {
    const form = this.fluidezForms[step];
    const porcHumedad1 = parseFloat(form.get('porcHumedad1')?.value) || 0;
    const porcHumedad2 = parseFloat(form.get('porcHumedad2')?.value) || 0;
    if (porcHumedad1 > 0 && porcHumedad2 > 0) {
      const promedio = ((porcHumedad1 + porcHumedad2) / 2).toFixed(2);
      form.patchValue({ porcHumedadPromedio: promedio }, { emitEvent: false });
    } else {
      form.patchValue({ porcHumedadPromedio: '' }, { emitEvent: false });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatDecimal(value: any): string {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(2);
    }
    return value;
  }
  actualizarPesoMaterial() {
    const pesoLata1 = this.humedadForm.value.pLata1;
    const pesoMaterial1 = this.humedadForm.value.pMaterial1;
    const pesoTotal1 = this.calcularPesoMaterial(pesoLata1, pesoMaterial1);
    if (pesoTotal1 !== '') {
      this.humedadForm.patchValue({
        pTotal1: parseFloat(pesoTotal1),
      });
    } else {
      this.humedadForm.patchValue({
        pTotal1: '',
      });
    }
    // Actualizar el pesoMaterial2
    const pesoLata2 = this.humedadForm.value.pLata2;
    const pesoMaterial2 = this.humedadForm.value.pMaterial2;
    const pesoTotal2 = this.calcularPesoMaterial(pesoLata2, pesoMaterial2);
    if (pesoTotal2 !== '') {
      this.humedadForm.patchValue({
        pTotal2: parseFloat(pesoTotal2),
      });
    } else {
      this.humedadForm.patchValue({
        pTotal2: '',
      });
    }
  }
  guardarHumedad() {
    this.actualizarPesoMaterial();

    // Update tonnage value from form before saving
    this.tonelaje = this.humedadForm.get('tonelaje')?.value || 0;

    // Ensure estado is set
    this.humedadForm.patchValue({ estado: 'Iniciado' }, { emitEvent: false });
    const nLote = this.humedadForm.value.nLote;
    console.log('Verificando existencia de fluidez para nLote:', nLote);
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/fluidez/`)
      .subscribe(
        (data) => {
          const existente = data.find((item) => item.nLote === nLote);
          if (existente) {
            console.log('El nLote ya existe:', nLote);
            this.humedadForm.patchValue(
              { id: existente.id },
              { emitEvent: false }
            );
            // Si fInicio no existe, establecer la fecha actual
            if (!this.humedadForm.get('fInicio')?.value) {
              this.humedadForm.patchValue({ fInicio: this.formatDate(new Date()) }, { emitEvent: false });
            }
            //Actualizar el registro existente
            this.http
              .put(
                `https://control.als-inspection.cl/api_min/api/fluidez/${existente.id}/`,
                this.humedadForm.value
              )
              .subscribe(
                (response) => {
                  console.log('Registro de fluidez actualizado:', response);
                  Notiflix.Notify.success('Registro de fluidez actualizado');
                },
                (error) => {
                  console.error('Error al actualizar fluidez:', error);
                  Notiflix.Notify.failure('Error al actualizar fluidez');
                }
              );
          } else {
            console.log('El nLote no existe, se creará uno nuevo:', nLote);
            this.humedadForm.patchValue({ id: 0 }, { emitEvent: false });
            //Crear un nuevo registro
            this.http
              .post(
                `https://control.als-inspection.cl/api_min/api/fluidez/`,
                this.humedadForm.value
              )
              .subscribe(
                (response) => {
                  console.log('Registro de fluidez creado:', response);
                  Notiflix.Notify.success('Registro de fluidez creado');
                },
                (error) => {
                  console.error('Error al crear fluidez:', error);
                  Notiflix.Notify.failure('Error al crear fluidez');
                }
              );
          }
        },
        (error) => {
          console.error('Error al verificar existencia de fluidez:', error);
          // Handle error, perhaps show an error message
        }
      );
  }

  calcularPesoMaterial(pesoLata: any, pesoTotal: any) {
    const lataVal = parseFloat(pesoLata);
    const totalVal = parseFloat(pesoTotal);
    if (isNaN(lataVal) || isNaN(totalVal)) {
      return '';
    }
    const diferencia = totalVal + lataVal;
    return diferencia >= 0 ? diferencia.toFixed(2) : '';
  }

  calcularPorcentajeHumedad(
    pesoBrutoHumedo: any,
    pesoBrutoSeco: any,
    taraBandeja: any
  ) {
    const brutoHumedoVal = parseFloat(pesoBrutoHumedo);
    const brutoSecoVal = parseFloat(pesoBrutoSeco);
    const taraBandejaVal = parseFloat(taraBandeja);
    if (
      isNaN(brutoHumedoVal) ||
      isNaN(brutoSecoVal) ||
      brutoHumedoVal === 0 ||
      isNaN(taraBandejaVal)
    ) {
      console.log('Invalid input values:', {
        pesoBrutoHumedo,
        pesoBrutoSeco,
        taraBandeja,
      });
      return '';
    }
    const diferencia =
      ((brutoHumedoVal - brutoSecoVal) / (brutoHumedoVal - taraBandejaVal)) *
      100;
    console.log('Calculated humidity percentage:', diferencia);
    return diferencia >= 0 ? diferencia.toFixed(2) : '';
  }

  calcularPorcentajeHumedadPromedio() {
    const porcHumedad1 = parseFloat(
      this.calcularPorcentajeHumedad(
        this.humedadForm.value.pBrutoHumedo1,
        this.humedadForm.value.pBrutoSeco1,
        this.humedadForm.value.pLata1
      )
    );
    const porcHumedad2 = parseFloat(
      this.calcularPorcentajeHumedad(
        this.humedadForm.value.pBrutoHumedo2,
        this.humedadForm.value.pBrutoSeco2,
        this.humedadForm.value.pLata2
      )
    );
    if (isNaN(porcHumedad1) || isNaN(porcHumedad2)) {
      console.log('Invalid input values for average humidity:', {
        porcHumedad1,
        porcHumedad2,
      });
      return '';
    }
    const promedio = (porcHumedad1 + porcHumedad2) / 2;
    console.log('Calculated average humidity percentage:', promedio);
    return promedio >= 0 ? promedio.toFixed(2) : '';
  }

  guardarFluidez(step: number) {
    const form = this.fluidezForms[step];
    form.patchValue({ estado: 'Iniciado' }, { emitEvent: false });
    const nLote = form.value.nLote;
    const nPrueba = form.value.nPrueba;
    console.log(`Verificando existencia de prueba-fluidez para nLote: ${nLote}, nPrueba: ${nPrueba}`);
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/prueba-fluidez/`)
      .subscribe(
        (data) => {
          const existente = data.find(
            (item) => item.nLote === nLote && Number(item.nPrueba) === Number(nPrueba)
          );
          if (existente) {
            console.log(`El registro ya existe para nLote: ${nLote}, nPrueba: ${nPrueba}`);
            console.log('Existente:', existente);
            form.patchValue({ id: existente.id }, { emitEvent: false });
            // Si fInicio no existe, establecer la fecha actual
            if (!form.get('fInicio')?.value) {
              form.patchValue({ fInicio: this.formatDate(new Date()) }, { emitEvent: false });
            }
            // Actualizar el registro existente
            this.http
              .put(
                `https://control.als-inspection.cl/api_min/api/prueba-fluidez/${existente.id}/`,
                form.value
              )
              .subscribe(
                (response) => {
                  console.log(`Registro de prueba-fluidez actualizado para paso ${step}:`, response);
                  Notiflix.Notify.success(`Registro de prueba-fluidez actualizado para paso ${step + 1}`);
                },
                (error) => {
                  console.error(`Error al actualizar prueba-fluidez para paso ${step}:`, error);
                  Notiflix.Notify.failure(`Error al actualizar prueba-fluidez para paso ${step + 1}`);
                }
              );
          } else {
            console.log(`El registro no existe para nLote: ${nLote}, nPrueba: ${nPrueba}, se creará uno nuevo`);
            form.patchValue({ id: 0 }, { emitEvent: false });
            // Crear un nuevo registro
            this.http
              .post(
                `https://control.als-inspection.cl/api_min/api/prueba-fluidez/`,
                form.value
              )
              .subscribe(
                (response) => {
                  console.log(`Registro de prueba-fluidez creado para paso ${step}:`, response);
                  Notiflix.Notify.success(`Registro de prueba-fluidez creado para paso ${step + 1}`);
                },
                (error) => {
                  console.error(`Error al crear prueba-fluidez para paso ${step}:`, error);
                  Notiflix.Notify.failure(`Error al crear prueba-fluidez para paso ${step + 1}`);
                }
              );
          }
        },
        (error) => {
          console.error(`Error al verificar existencia de prueba-fluidez para paso ${step}:`, error);
        }
      );
  }

  guardarDiametrosBase() {
    console.log('Guardando diametros base para todas las pruebas de fluidez');
    let successCount = 0;
    let errorCount = 0;
    this.fluidezForms.forEach((form, index) => {
      const id = form.get('id')?.value;
      if (id && id > 0) {
        const diametroBase = form.get('diametroBase')?.value;
        this.http
          .put(
            `https://control.als-inspection.cl/api_min/api/prueba-fluidez/${id}/`,
            { diametroBase: diametroBase }
          )
          .subscribe(
            (response) => {
              console.log(`Diametro base actualizado para prueba ${index + 1}:`, response);
              successCount++;
              if (successCount + errorCount === this.fluidezForms.length) {
                if (errorCount === 0) {
                  Notiflix.Notify.success('Todos los diametros base han sido guardados');
                } else {
                  Notiflix.Notify.warning(`${successCount} diametros base guardados, ${errorCount} errores`);
                }
              }
            },
            (error) => {
              console.error(`Error al actualizar diametro base para prueba ${index + 1}:`, error);
              errorCount++;
              if (successCount + errorCount === this.fluidezForms.length) {
                if (errorCount === 0) {
                  Notiflix.Notify.success('Todos los diametros base han sido guardados');
                } else {
                  Notiflix.Notify.warning(`${successCount} diametros base guardados, ${errorCount} errores`);
                }
              }
            }
          );
      } else {
        console.log(`Prueba ${index + 1} no tiene ID, omitiendo`);
        errorCount++;
        if (successCount + errorCount === this.fluidezForms.length) {
          if (errorCount === 0) {
            Notiflix.Notify.success('Todos los diametros base han sido guardados');
          } else {
            Notiflix.Notify.warning(`${successCount} diametros base guardados, ${errorCount} errores`);
          }
        }
      }
    });
  }

  step = -1;
  setStep(index: number) {
    this.step = index;
  }
  nextStep(index: number) {
    this.step = index;
    this.step++;
  }
  prevStep(index: number) {
    this.step = index;
    this.step--;
  }
  panelOpenState = false;

  // Getter to calculate humidity percentage for table
  getHumedadTable(form: FormGroup): string {
    const pBrutoHumedo1 = +form.get('pBrutoHumedo1')?.value || 0;
    const pBrutoHumedo2 = +form.get('pBrutoHumedo2')?.value || 0;
    const pBrutoSeco1 = +form.get('pBrutoSeco1')?.value || 0;
    const pBrutoSeco2 = +form.get('pBrutoSeco2')?.value || 0;
    const pLata1 = +form.get('pLata1')?.value || 0;
    const pLata2 = +form.get('pLata2')?.value || 0;

    // Round sums to 2 decimal places
    const sumHumedo = ((pBrutoHumedo1 + pBrutoHumedo2));
    const sumSeco = ((pBrutoSeco1 + pBrutoSeco2));
    const sumLata = ((pLata1 + pLata2));

    if (sumHumedo - sumLata === 0) return '0.00';
    if (sumHumedo === 0 || sumSeco === 0 || sumLata === 0) return '';

    const result = ((sumHumedo - sumSeco) / (sumHumedo - sumLata)) * 100;
    return result.toFixed(2);
  }
}
