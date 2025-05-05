import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import { RecepcionTransporteService } from 'src/app/services/recepcion.service';

@Component({
  selector: 'app-otm',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './otm.component.html',
  styleUrl: './otm.component.scss'
})
export class OtmComponent {
  constructor(private dialogRef: MatDialogRef<OtmComponent>,public activatedRouter: ActivatedRoute,private fb: FormBuilder, private http: HttpClient,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      nLote: any;
      nSubLote: any
    },
  ) {
  }

  form: FormGroup;
  fechaActual = new Date();

  ngOnInit() {
    this.form = this.fb.group({
      nLote: this.data.nLote,
      nSubLote: [this.data.nSubLote, Validators.required],
      observacion: ['', Validators.required],
      fechaSobre: [this.fechaActual, Validators.required],
      estado: ['Iniciado', Validators.required],
    });


  }

  onSubmit() {
    if (this.form.valid) {
      const datos = {
        nLote: this.data.nLote,
        nSubLote: this.form.value.nSubLote,
        fechaSobre: this.formatDate(this.fechaActual),
        observacion: this.form.value.observacion,
        estado: this.form.value.estado,
      };
      // Actualizar los datos de la base de datos
      const url = 'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/'
      // Buscar todas las trazabilidades-mecanica por nLote y nSubLote
      this.http.get<any[]>(url).subscribe((response) => {
        console.log(response);
        const existingData = response.find(item => item.nLote === this.data.nLote && item.nSubLote === this.data.nSubLote);
        console.log(existingData);
        if (existingData) {
          // Si ya existe, actualizar el registro
          this.http.put(`${url}${existingData.id}/`, datos).subscribe(() => {
            Notiflix.Notify.success('Registro actualizado correctamente');
            this.dialogRef.close(true);
          });
        }else{
          Notiflix.Notify.failure('No se encontró el registro para actualizar');
        }
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
        Notiflix.Notify.failure('Error al obtener los datos');
      }
      );
      
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  
  }

