import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
      MatIconModule,],
  templateUrl: './fluidez.component.html',
  styleUrl: './fluidez.component.scss'
})
export class FluidezComponent {
  // Recibir la información desde el componente padre
  nLote: string = '';
  idSolicitud: string = '';
  idServicio: string = '';
  sumaTonelaje: number = 10;
  nombreEmbarque: string = '';
  fechaPrueba: String = this.formatDate(new Date());
  constructor(
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA)
    public data: {
        numero: any,
        idServicio: any,
        idSolicitud: any,
        nLote: any,
    }
  ) {

    // this.courseDetail = ''.getCourse().filter((x) => x?.Id === +this.id)[0];
  }

    formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
