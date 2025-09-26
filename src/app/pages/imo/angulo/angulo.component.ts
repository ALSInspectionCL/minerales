import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import Notiflix from 'notiflix';
import { RolService } from 'src/app/services/rol.service';

@Component({
  selector: 'app-angulo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './angulo.component.html',
  styleUrls: ['./angulo.component.scss'],
})
export class AnguloComponent implements OnInit {
  anguloForm: FormGroup;

  nLote: string = '';
  idSolicitud: string = '';
  idServicio: string = '';
  cliente: boolean = false;

  constructor(
    private http: HttpClient,
    private rolService: RolService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      nLote: any;
      idSolicitud: any;
      idServicio: any;
    }
  ) {
    this.nLote = data.nLote;
    this.idSolicitud = data.idSolicitud;
    this.idServicio = data.idServicio;

    this.anguloForm = new FormGroup({
      id: new FormControl(0),
      nLote: new FormControl(this.nLote, Validators.required),
      nSublote: new FormControl(''),
      tipoMaterial: new FormControl(''),
      referencia: new FormControl(''),
      fechaDeterminacion: new FormControl(new Date().toISOString().substring(0, 10)),
      nombreNave: new FormControl(''),
      cliente: new FormControl(''),
      pruebasRealizadas: new FormControl(''),
      observacion: new FormControl(''),
      prueba1: new FormControl(''),
      prueba2: new FormControl(''),
      prueba3: new FormControl(''),
      promedio: new FormControl(''),
      estado: new FormControl('Iniciado'),
    });
  }

  ngOnInit(): void {
    this.loadAnguloData();
    this.rolService
      .hasRole(localStorage.getItem('email') || '', 'Cliente')
      .subscribe((hasRole: boolean) => {
        this.cliente = hasRole;
      });
    this.anguloForm.get('prueba1')?.valueChanges.subscribe(() => this.updatePromedio());
    this.anguloForm.get('prueba2')?.valueChanges.subscribe(() => this.updatePromedio());
    this.anguloForm.get('prueba3')?.valueChanges.subscribe(() => this.updatePromedio());
  }

  loadAnguloData() {
    this.http.get<any[]>(`https://control.als-inspection.cl/api_min/api/angulo/`).subscribe(
      (data) => {
        const existente = data.find((item) => item.nLote === this.nLote);
        if (existente) {
          this.anguloForm.patchValue({
            id: existente.id,
            nSublote: existente.nSublote,
            tipoMaterial: existente.tipoMaterial,
            referencia: existente.referencia,
            fechaDeterminacion: existente.fechaDeterminacion,
            nombreNave: existente.nombreNave,
            cliente: existente.cliente,
            pruebasRealizadas: existente.pruebasRealizadas,
            observacion: existente.observacion,
            prueba1: existente.prueba1,
            prueba2: existente.prueba2,
            prueba3: existente.prueba3,
            promedio: existente.promedio,
            estado: existente.estado,
          });
          Notiflix.Notify.info('Datos de ángulo de reposo cargados');
        } else {
          Notiflix.Notify.info('No existen datos previos para este lote');
        }
      },
      (error) => {
        console.error('Error al cargar datos de ángulo de reposo:', error);
        Notiflix.Notify.failure('Error al cargar datos de ángulo de reposo');
      }
    );
  }

  updatePromedio() {
    const p1 = parseFloat(this.anguloForm.get('prueba1')?.value) || 0;
    const p2 = parseFloat(this.anguloForm.get('prueba2')?.value) || 0;
    const p3 = parseFloat(this.anguloForm.get('prueba3')?.value) || 0;
    const count = [p1, p2, p3].filter((v) => v > 0).length;
    if (count > 0) {
      const avg = ((p1 + p2 + p3) / count).toFixed(3);
      this.anguloForm.patchValue({ promedio: avg }, { emitEvent: false });
    } else {
      this.anguloForm.patchValue({ promedio: '' }, { emitEvent: false });
    }
  }

  guardarAngulo() {
    this.anguloForm.patchValue({ estado: 'Iniciado' }, { emitEvent: false });
    const id = this.anguloForm.value.id;
    if (id && id > 0) {
      this.http
        .put(`https://control.als-inspection.cl/api_min/api/angulo/${id}/`, this.anguloForm.value)
        .subscribe(
          (response) => {
            Notiflix.Notify.success('Registro de ángulo de reposo actualizado');
          },
          (error) => {
            console.error('Error al actualizar ángulo de reposo:', error);
            Notiflix.Notify.failure('Error al actualizar ángulo de reposo');
          }
        );
    } else {
      this.http.post(`https://control.als-inspection.cl/api_min/api/angulo/`, this.anguloForm.value).subscribe(
        (response) => {
          Notiflix.Notify.success('Registro de ángulo de reposo creado');
        },
        (error) => {
          console.error('Error al crear ángulo de reposo:', error);
          Notiflix.Notify.failure('Error al crear ángulo de reposo');
        }
      );
    }
  }
}
