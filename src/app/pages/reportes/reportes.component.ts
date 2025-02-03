import { CommonModule, AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MAT_DATE_RANGE_SELECTION_STRATEGY, MatDatepickerModule } from '@angular/material/datepicker';
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

  opciones = [
    { value: 'Camiones', label: 'Camiones' },
    { value: 'Vagones', label: 'Vagones' },
    { value: 'Inventario', label: 'Inventario' },
    { value: 'Ingresos', label: 'Ingresos' },
    { value: 'Despachos', label: 'Despachos' }
  ];

  documento = new FormControl('');

  opcionesFiltradas: Observable<any[]>;

  constructor(private http: HttpClient) {
    this.opcionesFiltradas = this.documento.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarOpciones(value))
    );
  }
  obtenerCamionesRecepcion(fechaInicio: string, fechaFin: string): void {
    this.http.get(`https://control.als-inspection.cl/api_min/api/recepcion-transporte/?format=api&fOrigen=${fechaInicio}&fOrigen=${fechaFin}`)
      .subscribe(response => {
        const camionesRecepcion = (response as any[]).filter((camion: any) => camion.tipoTransporte === 'Camion');
        console.log(camionesRecepcion);
      });
  }
  
  obtenerDespachosCamiones(fechaInicio: string, fechaFin: string): void {
    this.http.get(`https://control.als-inspection.cl/api_min/api/despacho-camion/?format=api&fOrigen=${fechaInicio}&fOrigen=${fechaFin}`)
      .subscribe(response => {
        console.log(response);
      });
  }

  filtrarOpciones(value: string | null): any[] {
    if (value === null) {
      return this.opciones;
    }
    const filterValue = value.toLowerCase();
    return this.opciones.filter(opcion => opcion.label.toLowerCase().includes(filterValue));
  }

  crearDocumento() {
    console.log('Crear documento');
    this.wip();
    if (this.fechaDesde && this.fechaHasta && this.documento.value) {
      console.log('Fecha desde', this.fechaDesde);
      console.log('Fecha hasta', this.fechaHasta);
      console.log('Documento', this.documento.value);

      if(this.documento.value === 'Camiones'){
        Notiflix.Notify.success('Documento de camiones creado');

      }
      if(this.documento.value === 'Vagones'){
        Notiflix.Notify.success('Documento de vagones creado');
      }
      if(this.documento.value === 'Inventario'){
        Notiflix.Notify.success('Documento de inventario creado');
      }
      if(this.documento.value === 'Ingresos'){
        Notiflix.Notify.success('Documento de ingresos creado');
      }
      if(this.documento.value === 'Despachos'){
        Notiflix.Notify.success('Documento de despachos creado');
      }
    }else{
      Notiflix.Notify.info('Faltan datos');
    }
  }

  wip() {
    Notiflix.Notify.warning('En construcción');
  }
}
