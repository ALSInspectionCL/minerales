import { P } from '@angular/cdk/keycodes';
import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
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
import { RolService } from 'src/app/services/rol.service';

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
  ],
  templateUrl: './fluidez.component.html',
  styleUrl: './fluidez.component.scss',
})
export class FluidezComponent {
  // Recibir la información desde el componente padre
  nLote: string = '';
  idSolicitud: string = '';
  idServicio: string = '';
  sumaTonelaje: number = 10;
  nombreEmbarque: string = '';
  cliente: boolean = false;
  humedadForm: FormGroup;
  fechaPrueba: String = this.formatDate(new Date());
  constructor(
    private http: HttpClient,
    
    @Inject(MAT_DIALOG_DATA)
    public data: {
      numero: any;
      idServicio: any;
      idSolicitud: any;
      nLote: any;
    },private rolService: RolService
  ) {
    // Asignar los valores recibidos a las variables locales
    this.nLote = data.nLote;
    this.idSolicitud = data.idSolicitud;
    this.idServicio = data.idServicio;
        this.humedadForm = new FormGroup({
          id: new FormControl(0), // Este campo se actualizará después de verificar si el nLote existe
          nLote: new FormControl(this.data.nLote),
          idSolicitud: new FormControl(this.data.idSolicitud),
          idServicio: new FormControl(this.data.idServicio),
          nLata1: new FormControl(''),
          nLata2: new FormControl(''),
          pLata1: new FormControl(''),
          pLata2: new FormControl(''),
          pMaterial1: new FormControl(''),
          pMaterial2: new FormControl(''),
          pTotal1: new FormControl(''),
          pTotal2: new FormControl(''),
          porcHumedad1: new FormControl(''),
          porcHumedad2: new FormControl(''),
          porcHumedadFinal: new FormControl(''),
        });
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
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  guardarHumedad() {
    console.log('Guardar Humedad');
  }
}
