import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
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
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-ver-balanza',
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
  templateUrl: './ver-balanza.component.html',
  styleUrl: './ver-balanza.component.scss'
})
export class VerBalanzaComponent {
  // Aquí se verifica el estado de la balanza y si su peso corresponde a los pesos guía
  // Primero, un formulario reactivo para manejar los datos de la balanza
  formVerificacionBalanza : FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe los datos del diálogo
    private http : HttpClient // Inyecta el servicio HTTP para realizar peticiones
  ) {
    // Inicializar el formulario con los controles necesarios
    this.formVerificacionBalanza = new FormGroup({
      codigoBalanza: new FormControl('',Validators.required),
      selloCalibracion: new FormControl('',Validators.required),
      //La fecha debe tener formato DD-MM-YYYY
      fechaCalibracion: new FormControl(new Date().toISOString().split('T')[0],Validators.required), // Formato YYYY-MM-DD
      //La hora debe tener formato HH:MM
      // Se usa la hora actual como valor por defecto
      horaCalibracion: new FormControl(new Date().getHours() + ':' + new Date().getMinutes(),Validators.required),
      nombreTecnico: new FormControl(localStorage.getItem('nombre') + ' '+localStorage.getItem('apellidoPaterno') || '',Validators.required),
      mailTecnico: new FormControl(localStorage.getItem('email'),Validators.required),
      codigoMasaPatron1: new FormControl('ANF05',Validators.required),
      codigoMasaPatron2: new FormControl('ANF06',Validators.required),
      pesoTeoricoMasaPatron1: new FormControl('',Validators.required),
      pesoTeoricoMasaPatron2: new FormControl('',Validators.required),
      masa1peso1: new FormControl('',Validators.required),
      masa1peso2: new FormControl('',Validators.required),
      masa2peso1: new FormControl('',Validators.required),
      masa2peso2: new FormControl('',Validators.required),
      masa3peso1: new FormControl('',Validators.required),
      masa3peso2: new FormControl('',Validators.required),
      masa4peso1: new FormControl('',Validators.required),
      masa4peso2: new FormControl('',Validators.required),
      masa5peso1: new FormControl('',Validators.required),
      masa5peso2: new FormControl('',Validators.required),
      intervaloAceptacion: new FormControl(0.2,Validators.required),
      estado: new FormControl('',Validators.required),
    });
        
  }

  ngOnInit() {

  }

  onSubmit() {
    console.log('Formulario enviado:', this.formVerificacionBalanza.value);
    // Aquí se debe realizar la petición HTTP para verificar el estado de la balanza
    if (this.formVerificacionBalanza.valid) {
      // Enviar el formulario a la API
      this.http.post('https://control.als-inspection.cl/api_min/api/verificacion-balanza/', this.formVerificacionBalanza.value)
      .subscribe(
        response => {
          console.log('Respuesta del servidor:', response);
          Notiflix.Notify.success('Balanza verificada correctamente');
          // Aquí se puede manejar la respuesta del servidor
        },
        error => {
          console.error('Error al verificar la balanza:', error);
          Notiflix.Notify.failure('Error al verificar la balanza');
          // Aquí se puede manejar el error
        }
      );
    } else {
      console.log('Formulario inválido');
      Notiflix.Notify.failure('Por favor, completa todos los campos requeridos correctamente');
      // Puedes mostrar un mensaje de error al usuario
    }
  }
}

