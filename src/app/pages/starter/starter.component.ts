import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import Notiflix from 'notiflix';
import { Notify } from 'notiflix';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-starter',
  templateUrl: './starter.component.html',
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
  styleUrls: ['./starter.component.scss'],
})
export class StarterComponent {
  camiones = [];
  pesoNetoHumedoTotal = 0;
  despachosRealizadosEsteMes = 0;
  fechaActual = new Date().toLocaleTimeString();
  constructor(private http: HttpClient) { }

ngOnInit(): void {
  const fechaActual = new Date().toISOString().split('T')[0];
  console.log(fechaActual)
  this.http.get(`https://control.als-inspection.cl/api_min/api/recepcion-transporte/?fOrigen=${fechaActual}`)
    .subscribe((response: any) => {
      console.log(response); // Verificar la respuesta de la API
      let data = response;
      if (data) {
        this.camiones = data.filter((camion: any) => camion.tipoTransporte === 'Camion' && camion.fOrigen === fechaActual);
        this.pesoNetoHumedoTotal = this.camiones.reduce((acumulado, camion: any) => acumulado + camion.pesoNetoHumedo, 0);

      } else {
        console.error('La respuesta de la API no contiene la propiedad "results"');
      }
    });

    const fechaActual2 = new Date();
    const mesActual = fechaActual2.getMonth() + 1;
    const añoActual = fechaActual2.getFullYear();
    const fechaReferencia = new Date(añoActual, mesActual + 1, 0).toISOString().split('T')[0];
    
    this.http.get(`https://control.als-inspection.cl/api_min/api/lote-despacho/`)
    .subscribe((response: any) => {
      let data = response;
      if (data) {
        if (mesActual === 12) {
          this.despachosRealizadosEsteMes = data.filter((lote: any) => lote.fLote >= añoActual + '-' + mesActual + '-' + '01' && lote.fLote <= añoActual + '-' + (mesActual + 1) + '-' + '01').length;
        } else {
          this.despachosRealizadosEsteMes = data.filter((lote: any) => lote.fLote >= añoActual + '-' + (mesActual < 10 ? '0' + mesActual : mesActual) + '-' + '01' && lote.fLote <= fechaReferencia).length;
        }
      } else {
        console.error('La respuesta de la API no contiene la propiedad "results"');
      }
    });
}

}
