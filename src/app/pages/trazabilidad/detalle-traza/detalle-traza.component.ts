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
    'numeroLote',
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

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    public activatedRouter: ActivatedRoute,
    public apirecep: RecepcionTransporteService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      numLote: any;
    }
  ) {
    this.cargarLoteTrazabilidad(data.numLote);
    this.id = activatedRouter?.snapshot?.paramMap?.get('id');

    // this.courseDetail = ''.getCourse().filter((x) => x?.Id === +this.id)[0];
  }
  lote: any;

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

  tieneMecanica(nLote: string): any {
    // Verifica si el lote tiene preparación mecánica, para eso hay que buscar en la api de trazabilidad mecanica si existe el nLote
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        const existeLote = data.some((item) => item.nLote === nLote); // Verifica si el lote existe en la respuesta
        if (existeLote) {
          console.log('El lote tiene preparación mecánica.');
          // Abre el diálogo de preparación mecánica
          let opcion = 1;
          this.preparacionDialog(nLote, opcion); // Llama a la función para abrir el diálogo de preparación mecánica
        } else {
          console.log('El lote no tiene preparación mecánica.');
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
                  (clientAnswer: any) => {
                    // Usamos una función de flecha con tipo explícito
                    // Segunda pregunta: ¿Local o Aduana?
                    setTimeout(() => {
                      Notiflix.Confirm.show(
                        'Destino del Producto',
                        '¿El producto va a aduana o queda local?',
                        'Aduana',
                        'Local',
                        () => {
                          console.log('Destino: Aduana');
                          this.detalleMecanica(nLote, clientAnswer, 'Aduana');
                        },
                        () => {
                          console.log('Destino: Local');
                          this.detalleMecanica(nLote, clientAnswer, 'Aduana');
                        }
                      );
                    }, 500);
                  },
                  (clientAnswer: any) => {
                    // Función de flecha también aquí
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
      },
      (error) => {
        console.error('Error fetching data', error); // Maneja el error de la solicitud
        Notiflix.Notify.failure('Error al verificar la preparación mecánica.'); // Muestra un mensaje de error
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

  detalleMecanica(nLote: string, CantSobres: number, destino: string): any {
    const dialogRef = this.dialog.open(DetallePrepComponent, {
      width: '40%', // Ajusta el ancho del diálogo
      height: '90%', // Ajusta la altura del diálogo
      data: {
        nLote: nLote,
        CantSobres: CantSobres,
        destino: destino,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('El diálogo se cerró con el resultado: ', result);
    });
  }

  redescargarQR(): any {
    // Preguntar que QR desea descargar, el de muestra natural o el general
    Notiflix.Confirm.show(
      'Descargar QR',
      '¿Qué QR deseas descargar?',
      'Muestra Natural',
      'General',
      () => {
        // Acción si el usuario acepta la primera confirmación
        console.log(this.lote);
      },
      () => {
        // Acción si el usuario rechaza la primera confirmación
        console.log(this.lote);
      }
    );
  }
  // crearQR() {
  //   //Buscar y guardar el camion con id camion
  //   // const camion = this.camiones.find((camion) => camion.id === this.camion);
  //   // if (!camion) {
  //   //   Notiflix.Notify.failure('Camión no encontrado');
  //   //   return;
  //   // }
  //   //Verificar si escogio un lote, un servicio y una solicitud
  //   if (!this.lote.nLote || !this.idServicio || !this.idSolicitud) {
  //     Notiflix.Notify.failure('Faltan datos para generar el QR');
  //     return;
  //   }
  //   console.log('Lote seleccionado:');
  //   console.log(this.lote);

  //   //Verificar si existe el ingreso de Trazabilidad. Si existe, solo genera QR. Si no existe, la agrega a la api https://control.als-inspection.cl/api_min/api/trazabilidad/
  //   const apiUrl =
  //     'https://control.als-inspection.cl/api_min/api/trazabilidad/';
  //   const datos: any = {
  //     nLote: this.lote.nLote,
  //     cliente: 'Anglo American',
  //     idTransporte: null,
  //     horaControl: this.getHoraActual(),
  //     fechaControl: this.lote.fLote,
  //     horaLab: null,
  //     fechaLab: null,
  //     horaIngresoHorno: null,
  //     fechaIngresoHorno: null,
  //     horaSalidaHorno: null,
  //     fechaSalidaHorno: null,
  //     horaTestigoteca: null,
  //     fechaTestigoteca: null,
  //     estado: 'Iniciado',
  //   };

  //   //actualizar los valores de data con los valores del camion
  //   datos.nLote = this.lote.nLote;
  //   // datos.idTransporte = camion.id;
  //   // datos.horaControl = camion.hDestino;
  //   // datos.fechaControl = camion.fDestino;
  //   datos.horaControl = this.getHoraActual();
  //   datos.fechaControl = this.lote.fLote;
  //   datos.observacion = this.lote.observacion;
  //   datos.cantidadTransporte =
  //     this.lotes.find((lote: any) => lote.nLote === this.lote.nLote)
  //       ?.cantCamiones || 0;

  //   console.log('consultando ' + apiUrl);

  //   this.http.get<any[]>(apiUrl).subscribe(
  //     (data) => {
  //       const existe = data.find((item: any) => item.nLote === this.lote.nLote);
  //       if (!existe) {
  //         console.log(datos);
  //         // Si no existe, almacena la trazabilidad
  //         this.almacenarTrazabilidad(datos);
  //       } else {
  //         Notiflix.Notify.info('La trazabilidad de este Lote ya existe');
  //         this.crearQRConExcel();
  //       }
  //     },
  //     (error) => {
  //       console.error('Error al obtener trazabilidad', error);
  //     }
  //   );
  // }

  // async crearQRConExcel() {
  //   const apiUrl =
  //     'https://control.als-inspection.cl/api_op/oceanapi/trazabilidad/';

  //   if (!this.lote.nLote || !this.idServicio || !this.idSolicitud) {
  //     Notiflix.Notify.failure('Faltan datos para generar el QR');
  //     return;
  //   }

  //   this.http.get<any[]>(apiUrl).subscribe(
  //     async (trazabilidades) => {
  //       const workbook = new ExcelJS.Workbook();
  //       const hoja = workbook.addWorksheet('Página 1');
  //       hoja.properties.defaultRowHeight = 20;

  //       // Fondo blanco global
  //       for (let row = 1; row <= 40; row++) {
  //         for (let col = 1; col <= 8; col++) {
  //           hoja.getCell(row, col).fill = {
  //             type: 'pattern',
  //             pattern: 'solid',
  //             fgColor: { argb: 'FFFFFFFF' },
  //           };
  //         }
  //       }

  //       // Cargar la imagen del logo
  //       const imagePath = '/assets/images/logos/als_logo_1.png';
  //       const response = await fetch(imagePath);
  //       const imageBuffer = await response.arrayBuffer();
  //       const imageId = workbook.addImage({
  //         buffer: imageBuffer,
  //         extension: 'png',
  //       });
  //       const imageId2 = workbook.addImage({
  //         buffer: imageBuffer,
  //         extension: 'png',
  //       });

  //       const nLoteCamion = this.lote.nLote.toString().trim();

  //       const existe = trazabilidades.find((item: any) => {
  //         const loteItem = item.nLote?.toString().trim();
  //         return loteItem === nLoteCamion;
  //       });

  //       if (!existe) {
  //         const datos: any = {
  //           nLote: this.lote.nLote,
  //           cliente: 'Anglo American',
  //           horaControl: this.getHoraActual(),
  //           fechaControl: this.formatDate(new Date()),
  //           horaLab: null,
  //           fechaLab: null,
  //           horaIngresoHorno: null,
  //           fechaIngresoHorno: null,
  //           horaSalidaHorno: null,
  //           fechaSalidaHorno: null,
  //           horaTestigoteca: null,
  //           fechaTestigoteca: null,
  //           estado: 'Iniciado',
  //         };

  //         // this.almacenarTrazabilidad(datos);
  //       }

  //       const qrData = 'G' + this.lote.nLote.toString() + '.';
  //       const qrData2 = 'M' + this.lote.nLote.toString() + '.';

  //       const qrDataUrl: string = await QRCode.toDataURL(qrData, {
  //         errorCorrectionLevel: 'H',
  //         type: 'image/png',
  //         margin: 1,
  //         color: { dark: '#000000', light: '#ffffff' },
  //       });

  //       const qrDataUrl2: string = await QRCode.toDataURL(qrData2, {
  //         errorCorrectionLevel: 'H',
  //         type: 'image/png',
  //         margin: 1,
  //         color: { dark: '#000000', light: '#ffffff' },
  //       });

  //       // Buscar nombre de servicio y solicitud
  //       const servicio = this.servicios.find(
  //         (servicio) => servicio.id === this.idServicio
  //       );
  //       const solicitud = this.solicitudes.find(
  //         (solicitud) => solicitud.id === this.idSolicitud
  //       );

  //       hoja.getCell(`C2`).value = `Lote: ${this.lote.observacion}`;
  //       hoja.getCell(`C3`).value = `Cliente: Anglo American`;
  //       hoja.getCell(`C4`).value = `Servicio: ${servicio?.nServ}`;
  //       hoja.getCell(`C5`).value = `Solicitud: ${solicitud?.nSoli}`;
  //       hoja.getCell(`C6`).value = `Etiqueta: General`;

  //       hoja.getCell(`C16`).value = `Lote: ${this.lote.observacion}`;
  //       hoja.getCell(`C17`).value = `Cliente: Anglo American`;
  //       hoja.getCell(`C18`).value = `Servicio: ${servicio?.nServ}`;
  //       hoja.getCell(`C19`).value = `Solicitud: ${solicitud?.nSoli}`;
  //       hoja.getCell(`C20`).value = `Etiqueta: Muestra Natural`;

  //       const base64Image = qrDataUrl.split(',')[1];
  //       const binaryString = atob(base64Image);
  //       const imageBufferQR = new Uint8Array(binaryString.length);
  //       for (let j = 0; j < binaryString.length; j++) {
  //         imageBufferQR[j] = binaryString.charCodeAt(j);
  //       }

  //       const imageIdQR = workbook.addImage({
  //         buffer: imageBufferQR,
  //         extension: 'png',
  //       });

  //       const base64Image2 = qrDataUrl2.split(',')[1];
  //       const binaryString2 = atob(base64Image2);
  //       const imageBufferQR2 = new Uint8Array(binaryString2.length);
  //       for (let j = 0; j < binaryString2.length; j++) {
  //         imageBufferQR2[j] = binaryString2.charCodeAt(j);
  //       }

  //       const imageIdQR2 = workbook.addImage({
  //         buffer: imageBufferQR2,
  //         extension: 'png',
  //       });

  //       hoja.addImage(imageIdQR, {
  //         tl: { col: 6, row: 1 },
  //         ext: { width: 100, height: 100 },
  //       });

  //       hoja.addImage(imageIdQR2, {
  //         tl: { col: 6, row: 15 },
  //         ext: { width: 100, height: 100 },
  //       });

  //       hoja.addImage(imageId, {
  //         tl: { col: 0, row: 1 },
  //         ext: { width: 100, height: 100 },
  //       });
  //       hoja.addImage(imageId2, {
  //         tl: { col: 0, row: 15 },
  //         ext: { width: 100, height: 100 },
  //       });

  //       const buffer = await workbook.xlsx.writeBuffer();
  //       const blob = new Blob([buffer], {
  //         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //       });

  //       const link = document.createElement('a');
  //       link.href = URL.createObjectURL(blob);
  //       link.download = 'trazabilidad_lote_qr.xlsx';
  //       link.click();
  //     },
  //     (error) => {
  //       console.error('Error al obtener trazabilidad', error);
  //     }
  //   );
  // }

  private getHoraActual(): string {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
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
