import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { LoteService } from '../../../services/lote.service';
import { MatCard, MatCardContent, MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MatCommonModule, MatNativeDateModule } from '@angular/material/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MaterialModule } from 'src/app/material.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TablerIconsModule } from 'angular-tabler-icons';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Injectable()
export class FiveDayRangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D>
{
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this._createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createFiveDayRange(activeDate);
  }

  private _createFiveDayRange(date: D | null): DateRange<D> {
    if (date) {
      const start = this._dateAdapter.addCalendarDays(date, -2);
      const end = this._dateAdapter.addCalendarDays(date, 2);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-nuevo-lote',
  standalone: true,
  imports: [MatDatepickerModule,MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    TablerIconsModule,
    MatCardModule,MatCard,MatFormField,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatAutocompleteModule,MatNativeDateModule,
    AsyncPipe,
  ],
  templateUrl: './nuevo-lote.component.html',
  styleUrl: './nuevo-lote.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class NuevoLoteComponent implements OnInit {
  lote = {
    nLote: '',
    fLote: new Date().toISOString().slice(0, 10),
    observacion: '',
    tipoTransporte: '',
    cantCamiones: 0,
    cantVagones: 0,
    cantBigbag: 0,
    pesoBrutoHumedo: 0,
    pesoTara: 0,
    pesoNetoHumedo: 0,
    porcHumedad: 0,
    pesoNetoSeco: 0,
    diferenciaPeso: 0,
    servicio: null,
    solicitud: null,
  };

  idServicio: any;
  idSolicitud: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data:any, private loteService: LoteService) {

    this.idServicio = data.idServicio;
    this.idSolicitud = data.idSolicitud;

  }

  ngOnInit(): void {
    // Carga los servicios y solicitudes desde la API
    console.log(this.idServicio)
    console.log(this.idSolicitud)
    this.lote.servicio =this.idServicio
    this.lote.solicitud = this.idSolicitud
  }
  observacion:string;

  // registrarLote() {
  //   this.loteService.crearLote(idServicio, idSolicitud, nLote, obs, tipoTransporte).subscribe((response: any) => {
  //     console.log(response);
  //     // Maneja la respuesta de la API
  //   }, (error: any) => {
  //     console.error(error);
  //     // Maneja el error
  //   });

  guardarLote(){
    console.log(this.observacion)
    this.lote.observacion
    this.registrarLote()
  }

  registrarLote() {
    console.log('registrando lote');
    console.log(this.lote)
    this.loteService.crearLote(this.idServicio, this.idSolicitud, this.lote.nLote, this.lote.observacion, this.lote.tipoTransporte).subscribe((response: any) => {
      console.log(response);
      console.log('se guardo el lote')
      // Maneja la respuesta de la API
    }, (error: any) => {
      console.error(error);
      // Maneja el error
    });
  }
}
