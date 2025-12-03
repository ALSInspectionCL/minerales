import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-detalle-composito',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './detalle-composito.component.html',
  styleUrl: './detalle-composito.component.scss',
})
export class DetalleCompositoComponent {
  compositoForm: FormGroup;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<DetalleCompositoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { composito: any }
  ) {
    this.compositoForm = this.fb.group({
      nLote: [{ value: '', disabled: true }, Validators.required],
      idTrazabilidad: [{ value: '', disabled: true }, Validators.required],
      cliente: [''],
      idTransporte: [''],
      estado: [''],
      observacion: [''],
      nDUS: [''],
      fActual: [null],
      fLote: [null],
      bodega: [''],
      nSobre: [''],
      motonave: [''],
      fInicioEmbarque: [null],
      fTerminoEmbarque: [null],
    });

    if (this.data.composito) {
      const composito = { ...this.data.composito };
      if (composito.fActual) {
        composito.fActual = new Date(composito.fActual);
      }
      if (composito.fLote) {
        composito.fLote = new Date(composito.fLote);
      }
      if (composito.fInicioEmbarque && typeof composito.fInicioEmbarque === 'string') {
        composito.fInicioEmbarque = new Date(composito.fInicioEmbarque);
      }
      if (composito.fTerminoEmbarque && typeof composito.fTerminoEmbarque === 'string') {
        composito.fTerminoEmbarque = new Date(composito.fTerminoEmbarque);
      }
      this.compositoForm.patchValue(composito);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.compositoForm.enable();
      this.compositoForm.get('nLote')?.disable();
      this.compositoForm.get('idTrazabilidad')?.disable();
    } else {
      this.compositoForm.disable();
      this.compositoForm.get('observacion')?.enable();
      this.compositoForm.get('estado')?.enable();
      this.compositoForm.get('fActual')?.enable();
      this.compositoForm.get('fLote')?.enable();
      this.compositoForm.get('fInicioEmbarque')?.enable();
      this.compositoForm.get('fTerminoEmbarque')?.enable();
    }
  }

  save() {
    if (this.compositoForm.valid) {
      const updatedComposito = this.compositoForm.getRawValue();
      console.log('Raw form values:', updatedComposito);

      // Formatear fechas a formato YYYY-MM-DD para la API
      if (updatedComposito.fInicioEmbarque) {
        updatedComposito.fInicioEmbarque = updatedComposito.fInicioEmbarque.toISOString().split('T')[0];
      }
      if (updatedComposito.fTerminoEmbarque) {
        updatedComposito.fTerminoEmbarque = updatedComposito.fTerminoEmbarque.toISOString().split('T')[0];
      }
      if (updatedComposito.fActual) {
        updatedComposito.fActual = updatedComposito.fActual.toISOString().split('T')[0];
      }
      if (updatedComposito.fLote) {
        updatedComposito.fLote = updatedComposito.fLote.toISOString().split('T')[0];
      }

      console.log('Composito actualizado:', updatedComposito);

      const apiUrl = `https://control.als-inspection.cl/api_min/api/compositos/${this.data.composito.id}/`;

      this.http.put(apiUrl, updatedComposito).subscribe(
        (response) => {
          console.log('Composito actualizado:', response);
          Notiflix.Notify.success('Composito actualizado correctamente');
          this.dialogRef.close(response);
        },
        (error) => {
          console.error('Error al actualizar composito:', error);
          Notiflix.Notify.failure('Error al actualizar el composito');
        }
      );
    }
  }

  onDateChange(event: any, fieldName: string) {
    this.compositoForm.get(fieldName)?.setValue(event.value);
  }

  close() {
    this.dialogRef.close();
  }
}
