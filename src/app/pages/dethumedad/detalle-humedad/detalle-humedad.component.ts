import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-detalle-humedad',
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
  ],
  templateUrl: './detalle-humedad.component.html',
  styleUrl: './detalle-humedad.component.scss',
})
export class DetalleHumedadComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      idServicio: number;
      idSolicitud: number;
      nLote: string;
      numero: number;
    }
  ) { }

  pesoLata1 = document.getElementById('pesoLata1');
  pesoLata2 = document.getElementById('pesoLata2');
  pesoTotal1 = document.getElementById('pesoTotal1');
  pesoTotal2 = document.getElementById('pesoTotal2');
  pesoMaterial1 = document.getElementById('pesoMaterial1');
  pesoMaterial2 = document.getElementById('pesoMaterial2');

  calcularPesoMaterial(pesoLata : any, pesoTotal : any) {
    const lataVal = parseFloat(pesoLata);
    const totalVal = parseFloat(pesoTotal);
    if (isNaN(lataVal) || isNaN(totalVal)) {
      return '';
    }
    const diferencia = totalVal - lataVal;
    return diferencia >= 0 ? diferencia.toFixed(2) : '';
}
actualizarPesoMaterial() {
  // this.pesoMaterial1.value = calcularPesoMaterial(pesoLata1, pesoTotal1);
  // pesoMaterial2.value = calcularPesoMaterial(pesoLata2, pesoTotal2);
}

// pesoLata1.addEventListener('input', actualizarPesoMaterial);
// pesoTotal1.addEventListener('input', actualizarPesoMaterial);
// pesoLata2.addEventListener('input', actualizarPesoMaterial);
// pesoTotal2.addEventListener('input', actualizarPesoMaterial);
}
