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
import { PreparacionComponent } from '../preparacion/preparacion.component';
import { CommonModule } from '@angular/common';
import { RolService } from 'src/app/services/rol.service';

@Component({
  selector: 'app-detalle-traza',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TablerIconsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    ZXingScannerModule,
    MaterialModule,
  ],
  templateUrl: './detalle-traza.component.html',
  styleUrl: './detalle-traza.component.scss',
  template: `
    <div>
      <zxing-scanner
        (scanSuccess)="onScanSuccess($event)"
        [formats]="['EAN_13', 'EAN_8', 'QR_CODE', 'CODABAR', 'CODE_128']"
        [torch]="torchEnabled"
      >
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
    BarcodeFormat.QR_CODE,
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

  admin: boolean = false;
  operator: boolean = false;
  encargado: boolean = false;

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    public activatedRouter: ActivatedRoute,
    public apirecep: RecepcionTransporteService,
    private rolService: RolService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      numLote: any;
      id: any
    }
  ) {
    this.cargarLoteTrazabilidad(data.numLote);
    this.id = activatedRouter?.snapshot?.paramMap?.get('id');

    // this.courseDetail = ''.getCourse().filter((x) => x?.Id === +this.id)[0];
  }
  lote: any;

  ngOnInit() {
    const email = localStorage.getItem('email') || '';

    this.rolService.hasRole(email, 'Operador').subscribe(hasRole => {
      this.operator = hasRole;
      console.log(`El usuario ${hasRole ? 'tiene' : 'no tiene'} el rol de Operador`);
    });

    this.rolService.hasRole(email, 'Admin').subscribe(hasRole => {
      this.admin = hasRole;
      console.log(`El usuario ${hasRole ? 'tiene' : 'no tiene'} el rol de Admin`);
    });

    this.rolService.hasRole(email, 'Encargado').subscribe(hasRole => {
      this.encargado = hasRole;
      console.log(`El usuario ${hasRole ? 'tiene' : 'no tiene'} el rol de Encargado`);
    });
  }

  cargarLoteTrazabilidad(nLote: string): any {
    //Buscar la trazabilidad por el nLote en la api de trazabilidad
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/trazabilidad/?search=' +
      nLote;
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.dataSource.data = data; // Asigna los lotes obtenidos a la variable
        console.log(data); // Muestra los lotes en la consola
        this.lote = data[0]; // Asigna el primer lote a la variable lote
      },
      (error) => {
        console.error('Error fetching data', error);
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  tieneMecanica(nLote: string, opcion: any): any {
    // Verifica si el lote tiene preparación mecánica, para eso hay que buscar en la api de trazabilidad mecanica si existe el nLote
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        const existeLote = data.some((item) => item.nLote === nLote);

        if (existeLote) {
          // Si ya existe, continuar sin restricción de roles
          this.mecanica(nLote, opcion);
        } else {
          // Si NO existe, validar roles antes de continuar
          if (this.admin || this.operator || this.encargado) {
            Notiflix.Confirm.show(
              'Preparación Mecánica',
              '¿No se ha iniciado la preparación mecánica aún? ¿Deseas iniciarla ahora?',
              'Sí',
              'No',
              () => {
                setTimeout(() => {
                  Notiflix.Confirm.prompt(
                    'Preparación Mecánica',
                    '¿Cuántos sobres desea crear?',
                    '1',
                    'Confirmar',
                    'Cancelar',
                    (sobres: any) => {
                      setTimeout(() => {
                        Notiflix.Confirm.show(
                          'Destino del Producto',
                          '¿El producto va a aduana o queda local?',
                          'Aduana',
                          'Local',
                          () => {
                            console.log('Destino: Aduana');
                            this.detalleMecanica(sobres, nLote, 'Aduana');
                          },
                          () => {
                            console.log('Destino: Local');
                            this.detalleMecanica(sobres, nLote, 'Local');
                          }
                        );
                      }, 500);
                    },
                    () => { },
                    {}
                  );
                }, 500);
              },
              () => {
                console.log('Primera confirmación rechazada.');
              }
            );
          } else {
            // Usuario sin permisos
            Notiflix.Notify.warning('Aún no se ha iniciado la preparación mecánica.');
          }
        }
      },
      (error) => {
        console.error('Error fetching data', error);
        Notiflix.Notify.failure('Error al verificar la preparación mecánica.');
      }
    );
  }

  preparacionDialog(nLote: string, opcion: number): any {
    const dialogRef = this.dialog.open(PreparacionComponent, {
      width: '80%', // Ajusta el ancho del diálogo
      // height: '90%', // Ajusta la altura del diálogo
      data: {
        nLote: nLote,
        opcion: opcion,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('El diálogo se cerró con el resultado: ', result);
    });
  }

  detalleMecanica(sobres: any, Num: any, destino: string,) {
    console.log('Locura')
    console.log(Num)
    const dialogRef = this.dialog.open(DetallePrepComponent, {
      width: '40%',
      height: '90%',
      data: {
        nLote: Num,
        CantSobres: sobres,
        destino: destino,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró con el resultado: ', result);
    });
  }

  mecanica(Num: any, opcion: any) {
    const dialogRef = this.dialog.open(PreparacionComponent, {
      width: '90%', // Ajusta el ancho del diálogo
      height: '90%', // Ajusta la altura del diálogo
      data: {
        nLote: Num,
        opcion: opcion
      },
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
}
