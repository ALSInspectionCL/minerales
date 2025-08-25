import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import { TrazabilidadService } from 'src/app/services/trazabilidad.service';

@Component({
  selector: 'app-editsobre',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MaterialModule, CommonModule, MatCheckboxModule, MatDividerModule],
  templateUrl: './editsobre.component.html',
  styleUrl: './editsobre.component.scss'
})
export class EditsobreComponent {

  displayedColumns: string[] = [
    'select',
    'subLote',
    'observacion',
    'estado',
  ];
  constructor(private http: HttpClient, private sobresService: TrazabilidadService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<EditsobreComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      numLote: any;
      subLote: any,
      opcion: any
    },
  ) {
    console.log('Dialog data:', data);
  }


  ngAfterViewInit(): void {

    this.obtenerMecanica(this.data.numLote)

  }

  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): any {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  obtenerMecanica(Lote: any) {
    console.log(Lote);
    const api = 'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';

    this.http.get<any[]>(api).subscribe((res) => {
      const loteNormalizado = Lote.toString().trim();

      // Filtrar todos los registros que coincidan con el número de lote
      const resultados = res.filter(item => item.nLote?.toString().trim() === loteNormalizado);

      // Ordenar por nSublote como número
      const resultadosOrdenados = resultados.sort((a, b) => {
        return parseInt(a.nSublote) - parseInt(b.nSublote);
      });

      // Asignar los resultados ordenados
      this.dataSource.data = resultadosOrdenados;


    });
  }

  asignarTipoSobre(tipo: 'Interno' | 'Externo') {
    Notiflix.Confirm.show(
      'Confirmación',
      `¿Estás seguro de asignar el tipo "${tipo}" a los sobres seleccionados?`,
      'Sí, confirmar',
      'Cancelar',
      () => {
        // Lógica si el usuario confirma
        this.selection.selected.forEach((element: any) => {
          element.tipoSobre = tipo;

          // Llamada a backend (opcional)
          this.sobresService.actualizarTipoSobre(element.id, tipo).subscribe({
            next: () => console.log(`Actualizado sobre ${element.id} a ${tipo}`),
            error: err => console.error(`Error actualizando sobre ${element.id}`, err),
          });
        });

        // Refrescar la tabla
        this.dataSource.data = [...this.dataSource.data];

        // 👉 Deseleccionar todos los seleccionados
        this.selection.clear();

        // Notificación opcional
        Notiflix.Notify.success(`Sobres actualizados como "${tipo}"`);
      },
      () => {
        Notiflix.Notify.info('Acción cancelada');
      }
    );
  }

  cerrarDialog() {
    console.log('Cerrando diálogo con true');
    this.dialogRef.close(true);
  }

}
