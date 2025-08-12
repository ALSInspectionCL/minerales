import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import Notiflix from 'notiflix';
import { ServicioService } from 'src/app/services/servicio.service';
import { SolicitudService } from 'src/app/services/solicitud.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [MatDatepickerModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatCardModule,
    MatCard,
    MatFormField,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {

  servicioForm: FormGroup;
  solicitudForm: FormGroup;
  serviciosDisponibles: any[] = []; // Lista de servicios cargados desde la API
  selectedServicioId: number | null = null;
  formularioActivo: number; // 1 o 2, valor que llega ya definido
  solicitudesDisponibles: any[] = []; // solicitudes relacionadas al servicio seleccionado

  constructor(private dialog : MatDialog ,private fb: FormBuilder, private servicioService: ServicioService, private solicitudService: SolicitudService, private dialogRef: MatDialogRef<EditComponent>, @Inject(MAT_DIALOG_DATA)
  public data: {
    opcion: any
  }) {
    this.formularioActivo = data.opcion;

    this.servicioForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      refAls: [''],
      nServ: [''],
      fServ: [''],
      lServ: [''],
      eServ: [''],
      rServ: [''],
      tServ: [''],
    });

    this.solicitudForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      nSoli: [''],
      fiSoli: [''],
      ftSoli: [''],
      lSoli: [''],
      eSoli: [''],
      nServ: [''],
    });

  }

  ngOnInit() {
    this.obtenerServicios(); // para cargar los servicios en el select
    this.servicioForm.get('refAls')?.valueChanges.subscribe((valor: string) => {
      if (valor) {
        const limpio = valor.replace(/[^a-zA-Z0-9]/g, '');
        const letras = limpio.substring(0, 3).toUpperCase();
        const numeros1 = limpio.substring(3, 7);
        const numeros2 = limpio.substring(7, 11);

        let formateado = letras;
        if (numeros1) formateado += '-' + numeros1;
        if (numeros2) formateado += '-' + numeros2;

        // Evita bucles infinitos comparando el valor actual
        if (formateado !== valor) {
          this.servicioForm.get('refAls')?.setValue(formateado, { emitEvent: false });
        }
      }
    });
  }


  obtenerServicios() {
    this.servicioService.getServicios().subscribe((data: any[]) => {
      this.serviciosDisponibles = data;
    });
  }

  onSelectServicio(id: number) {
    this.selectedServicioId = id;
    this.servicioService.getServicioById(id).subscribe((data: any) => {
      if (this.formularioActivo === 2) {
        // Simula llamada a API o filtra solicitudes por servicioId
        this.cargarSolicitudesPorServicio(id);
        this.solicitudForm.reset(); // limpia formulario solicitud
      }


      this.servicioForm.patchValue({
        id: data.id,
        refAls: data.refAls,
        nServ: data.nServ,
        fServ: data.fServ,
        lServ: data.lServ,
        eServ: data.eServ,
        rServ: data.rServ,
        tServ: data.tServ,
      });
    });
  }

  onSelectSolicitud(solicitudId: number) {
    const solicitud = this.solicitudesDisponibles.find(s => s.id === solicitudId);
    if (solicitud) {
      this.solicitudForm.patchValue(solicitud);
    }
  }

  cargarSolicitudesPorServicio(servicioId: number) {
    this.solicitudService.getSolicitudes().subscribe((data: any[]) => {
      // Filtrar las que correspondan al servicio
      this.solicitudesDisponibles = data.filter(s => s.nServ === servicioId);
      console.log(this.solicitudesDisponibles)
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  guardarCambios() {
    if (this.formularioActivo === 1 && this.servicioForm.valid && this.selectedServicioId) {
      const datosActualizados = this.servicioForm.getRawValue();

      this.servicioService.actualizarServicio(this.selectedServicioId, datosActualizados)
        .subscribe({
          next: (res) => {
            console.log('Servicio actualizado correctamente', res);
            Notiflix.Notify.success('Servicio actualizado correctamente');
          },
          error: (err) => {
            console.error('Error al actualizar servicio', err);
            Notiflix.Notify.failure('Error al actualizar servicio');
          }
        });

    } else if (this.formularioActivo === 2 && this.solicitudForm.valid) {
      this.guardarSolicitud();
    }
  }

  guardarSolicitud() {
    const datosActualizados = this.solicitudForm.getRawValue();

    this.solicitudService.updateSolicitud(datosActualizados.id, datosActualizados)
      .subscribe({
        next: (res) => {
          console.log('Solicitud actualizada correctamente', res);
          this.cancelar();
        },
        error: (err) => {
          console.error('Error al actualizar solicitud', err);
        }
      });
  }

}

