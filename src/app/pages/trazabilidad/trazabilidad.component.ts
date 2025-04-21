import { Component, OnInit, ViewChild } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { DetalleTrazaComponent } from './detalle-traza/detalle-traza.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { LoteService } from 'src/app/services/lote.service';
import { DetalleQrComponent } from './detalle-qr/detalle-qr.component';
import { EscanerComponent } from './escaner/escaner.component';
import { LectorComponent } from './lector/lector.component';

export interface loteRecepcion {
  id: number;
  nLote: string;
  fLote: string;
  observacion: string;
  tipoTransporte: string;
  cantCamiones: number;
  cantVagones: number;
  cantBigbag: number;
  pesoTara: number;
  pesoNetoHumedo: number;
  pesoBrutoHumedo: number;
  porcHumedad: number;
  pesoNetoSeco: number;
  diferenciaPeso: number;
  servicio: number;
  solicitud: number;
}

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatIconModule, MatButtonModule, CommonModule, DetalleTrazaComponent, FormsModule, MaterialModule, TablerIconsModule],
  templateUrl: './trazabilidad.component.html',
  styleUrl: './trazabilidad.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
  providers: [DatePipe],
})
export class TrazabilidadComponent {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
  searchText: any;
  displayedColumns: string[] = [
    '#',
    'name',
    'email',
    'mobile',
    'date of joining',
    'action',
  ];
  lote: any | null = null;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);

  constructor(public dialog: MatDialog, public datePipe: DatePipe, private loteService: LoteService) { }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.cargarLote()
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarLote(): any {
    let lotebuscado: loteRecepcion;
    this.loteService.getLotesTrazabilidad().subscribe(
      (response: loteRecepcion[]) => {
        console.log('Respuesta del servicio:', response);
        this.dataSource.data = response
        if (response.length > 0) {
          this.lote = response[0];
          lotebuscado = response[0];
        } else {
          this.lote = null;
        }
        console.log('Lote cargado:', this.lote);
        return lotebuscado;
      },
      (error) => {
        console.error('Error al cargar el lote:', error);
        this.lote = null;
      }
    );
  }

  detalleQr() {
    const dialogRef = this.dialog.open(DetalleQrComponent, {
      width: '40%', // Ajusta el ancho del diálogo
      height: '50%', // Ajusta la altura del diálogo
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró con el resultado: ', result);
      this.cargarLote(); // Recargar los lotes después de cerrar el diálogo
    });
  }

  scanQR() {
    const dialogRef = this.dialog.open(LectorComponent, {
      width: '40%', // Ajusta el ancho del diálogo
      height: '50%', // Ajusta la altura del diálogo
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró con el resultado: ', result);
      this.cargarLote(); // Recargar los lotes después de cerrar el diálogo
    });
  }

  detalleTraza(Num: any) {
    const dialogRef = this.dialog.open(DetalleTrazaComponent, {
      width: '80%', // Ajusta el ancho del diálogo
      // height: '30%',
      data: {
        numLote: Num
      },
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró con el resultado: ', result);
    });
  }
  
  escaner() {
    const dialogRef = this.dialog.open(EscanerComponent, {
      width: '60%', // Ajusta el ancho del diálogo
      height: '60%', // Ajusta la altura del diálogo
    });

}

}

export interface PeriodicElement {
  name: string;
  position: string;
  id: number;
  project: string;
  symbol: string;
  description: string;
}

