import { Component, Inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from 'src/app/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { RecepcionTransporteService } from 'src/app/services/recepcion.service';
import { HttpClient } from '@angular/common/http';
import { DetallePrepComponent } from '../detalle-prep/detalle-prep.component';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-detalle-traza',
  standalone: true,
  imports: [MatCardModule, TablerIconsModule, MatStepperModule, MatInputModule, MatButtonModule, ZXingScannerModule, MaterialModule],
  templateUrl: './detalle-traza.component.html',
  styleUrl: './detalle-traza.component.scss',
  template: `
    <div>
      <zxing-scanner
        (scanSuccess)="onScanSuccess($event)"
        [formats]="['EAN_13', 'EAN_8', 'QR_CODE', 'CODABAR', 'CODE_128']"
        [torch]="torchEnabled">
      </zxing-scanner>

      <div *ngIf="scannedResult">
        <h3>Resultado del escaneo: {{ scannedResult }}</h3>
      </div>
    </div>
  `,
})
export class DetalleTrazaComponent {
  selectedFormats: BarcodeFormat[] = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.QR_CODE
  ];

  displayedColumns: string[] = [
    'controlPeso',
    'ingresoRLab',
    'ingresoLab',
    'ingresoHorno',
    'salidaHorno',
    'preparacionMuestra',
    'almacenamientoMuestraNatural',
    'distribucionMuestra',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);

  dataSource = new MatTableDataSource<any>();
  torchEnabled = false;


  id: any;
  courseDetail: '';

  constructor(public dialog: MatDialog,private http: HttpClient, public activatedRouter: ActivatedRoute, public apirecep: RecepcionTransporteService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      numLote: any;
    },
  ) {
    this.cargarLoteTrazabilidad(data.numLote)
    this.id = activatedRouter?.snapshot?.paramMap?.get('id');
    // this.courseDetail = ''.getCourse().filter((x) => x?.Id === +this.id)[0];
  }

  cargarLoteTrazabilidad(nLote : string): any {
    //Buscar la trazabilidad por el nLote en la api de trazabilidad
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/trazabilidad/?search=' + nLote;
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.dataSource.data = data; // Asigna los lotes obtenidos a la variable
        console.log(data); // Muestra los lotes en la consola
      },
      (error) => {
        console.error('Error fetching data', error);
        }
      )

  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  tieneMecanica(nLote:string): any {
      Notiflix.Confirm.show(
        'Preparación Mecánica',
        '¿No se ha iniciado la preparación mecánica aún? ¿Deseas iniciarla ahora?',
        'Sí',
        'No',
        () => {
          // Acción si el usuario acepta la primera confirmación
          setTimeout(() => {
            Notiflix.Confirm.prompt(
              'Preparación Mecánica',
              '¿Cuántos sobres desea crear?',
              '1',
              'Confirmar',
              'Cancelar',
              (clientAnswer: any) => {  // Usamos una función de flecha con tipo explícito
                this.detalleMecanica(nLote, clientAnswer);  // Ahora `this` mantiene su contexto correctamente
              },
              (clientAnswer: any) => {  // Función de flecha también aquí
              },
              {}
            );
          }, 500); // Retrasa la ejecución de la segunda confirmación en 500ms
        },
        () => {
          // Acción si el usuario rechaza la primera confirmación
          console.log('Primera confirmación rechazada.');
        }
      );
  }

  detalleMecanica(nLote:string,CantSobres: number): any {
    const dialogRef = this.dialog.open(DetallePrepComponent, {
      width: '40%', // Ajusta el ancho del diálogo
      height: '90%', // Ajusta la altura del diálogo
      data: {
        nLote: nLote,
        CantSobres: CantSobres,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró con el resultado: ', result);
    });
  }

  // mecanica(Num: any) {
  //   const dialogRef = this.dialog.open(PreparacionComponent, {
  //     width: '80%', // Ajusta el ancho del diálogo
  //     height: '80%', // Ajusta la altura del diálogo
  //     data: {
  //       numLote: Num
  //     },
  //   });
  // }

}
