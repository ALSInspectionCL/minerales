import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import Notiflix from 'notiflix';
import { Notify } from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import { OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

export interface bodega{
  idBodega: number,
  nombreBodega: string,
  total: number
}

export interface detalleBodega{
  id: number,
  tipo: string,
  fecha: string,
  hora: string,
  ingreso: number,
  despacho: number,
  idBodega: number
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    MatDatepickerModule, MatButtonModule, MatDialogModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    TablerIconsModule,
    MatCardModule, MatCard, MatFormField,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatIconModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent {

  detallesBodega: detalleBodega[] = [];
  filteredDetallesBodega: detalleBodega[] = [];
  bodegas: bodega[] = [];
  bodegaSeleccionada : number
  dataSource = new MatTableDataSource<detalleBodega>();
  displayedColumns : string[] = ['idBodega', 'tipo', 'fecha', 'hora', 'ingreso', 'despacho'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDetallesBodega();
    this.fetchBodegas();
    // this.filteredDetallesBodega = this.detallesBodega;

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  fetchDetallesBodega(): void {
    this.http.get<detalleBodega[]>('http://127.0.0.1:8000/api/detalle-bodega/')
      .subscribe(
        (data) => {
          this.detallesBodega = data;
          this.dataSource.data = data;
        },
        (error) => {
          console.error('Error al obtener detalles de bodega:', error);
        }
      );
  }
  
  fetchBodegas(): void {
    this.http.get<bodega[]>('http://127.0.0.1:8000/api/bodega/')
      .subscribe(
        (data) => {
          this.bodegas = data;
          console.log('Bodegas:', this.bodegas);
        },
        (error) => {
          console.error('Error al obtener bodegas:', error);
        }
      );
  }

  onBodegaChange(event: MatSelectChange) {
    const selectedIdBodega = event.value;
    if (event.value == 0) {
      this.ngOnInit();
    }
    this.dataSource.data = this.detallesBodega.filter(element => element.idBodega === selectedIdBodega);
  }

}
