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
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RecepcionTransporteService } from 'src/app/services/recepcion.service';
import { HttpClient } from '@angular/common/http';

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

  onScanSuccess(result: string) {
    console.log('Escaneado con éxito:', result);
  }


  id: any;
  courseDetail: '';

  constructor(private http: HttpClient, public activatedRouter: ActivatedRoute, public apirecep: RecepcionTransporteService,
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
      },
      (error) => {
        console.error('Error fetching data', error);
        }
      )

  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
