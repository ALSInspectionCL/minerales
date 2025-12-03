import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ActizService } from 'src/app/services/actiz.service';

export interface AnalysisRequest {
  Oid: string;
  Code: string;
  Name: string;
  Lote: string;
  Provider: string;
  Description: string;
  DateCreation: string;
  SequentialNumber: number;
  EntitystatusId: string;
  [key: string]: any;
}

@Component({
  selector: 'app-actiz',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './actiz.component.html',
  styleUrl: './actiz.component.scss'
})
export class ActizComponent implements OnInit {
  displayedColumns: string[] = [
    'Code',
    'Name',
    'Lote',
    'Provider',
    'Description',
    'DateCreation',
    'SequentialNumber'
  ];
  
  dataSource: MatTableDataSource<AnalysisRequest>;
  isLoading = true;
  totalRecords = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private actizService: ActizService) {
    this.dataSource = new MatTableDataSource<AnalysisRequest>([]);
  }

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    // Configurar ordenamiento inicial por código
    this.sort.sort({
      id: 'Code',
      start: 'asc',
      disableClear: false
    });
  }

  loadData() {
    this.isLoading = true;
    this.actizService.getDatos().subscribe({
      next: (response) => {
        console.log('Datos recibidos:', response);
        
        // La respuesta OData viene en formato { value: [...] }
        const data = response.value || response;
        this.dataSource.data = data;
        this.totalRecords = data.length;
        
        // Configurar paginador y ordenamiento después de cargar los datos
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}
