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
import * as ExcelJS from 'exceljs';
import QRCode from 'qrcode';
import { DetalleCompositoComponent } from '../detalle-composito/detalle-composito.component';
import { DespachoTransporteService } from 'src/app/services/despacho.service';
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
  trazabilidades: any[] = [];

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    public activatedRouter: ActivatedRoute,
    public apirecep: RecepcionTransporteService,
    public despachoService : DespachoTransporteService,
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
        this.trazabilidades = data;
      },
      (error) => {
        console.error('Error fetching data', error);
      }
    );
  }

  /**
   * Verifica si la trazabilidad corresponde a un sublote de embarque
   * @param trazabilidad Objeto de trazabilidad a verificar
   * @returns true si es un sublote (nSobre existe y no es 0)
   */
  esSubLote(trazabilidad: any): boolean {
    return trazabilidad && 
           trazabilidad.nSobre !== null && 
           trazabilidad.nSobre !== undefined && 
           trazabilidad.nSobre !== '0' && 
           trazabilidad.nSobre !== '';
  }

  /**
   * Obtiene los datos del embarque (LoteDespacho) para un sublote
   * @param nLote Número de lote del embarque
   * @returns Promise con los datos del embarque
   */
  obtenerDatosEmbarque(nLote: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const apiUrl = 'https://control.als-inspection.cl/api_min/api/lote-despacho/';
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          const embarque = data.find(e => e.nLote === nLote);
          if (embarque) {
            console.log('Datos del embarque encontrados:', embarque);
            resolve(embarque);
          } else {
            console.warn('No se encontró embarque para el lote:', nLote);
            resolve(null);
          }
        },
        (error) => {
          console.error('Error al obtener datos del embarque:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Obtiene el ID del sublote de embarque desde DespachoEmbarque
   * @param nLote Número de lote del embarque
   * @param nSobre Número de sobre del sublote
   * @returns Promise con el ID del sublote
   */
  obtenerIdSubLote(nLote: string, nSobre: string): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const apiUrl = 'https://control.als-inspection.cl/api_min/api/despacho-embarque/';
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          // Buscar el sublote específico por nLote y comparando con el índice
          const sublotes = data.filter(s => s.nLote === nLote);

          // El nSobre corresponde al índice del sublote (1, 2, 3, etc.)
          // Ordenar por ID o fecha para mantener el orden correcto
          sublotes.sort((a, b) => a.id - b.id);

          const indice = parseInt(nSobre) - 1; // nSobre es 1-based, array es 0-based

          if (sublotes[indice]) {
            console.log('ID del sublote encontrado:', sublotes[indice].id);
            resolve(sublotes[indice].id);
          } else {
            console.warn('No se encontró sublote en el índice:', indice);
            resolve(null);
          }
        },
        (error) => {
          console.error('Error al obtener ID del sublote:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Obtiene los datos del sublote desde DespachoEmbarque por ID
   * @param idSubLote ID del sublote
   * @returns Promise con los datos del sublote
   */
  obtenerDatosSubLote(idSubLote: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const apiUrl = 'https://control.als-inspection.cl/api_min/api/despacho-embarque/';
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          const sublote = data.find(s => s.id == idSubLote);
          if (sublote) {
            console.log('Datos del sublote encontrados:', sublote);
            resolve(sublote);
          } else {
            console.warn('No se encontró sublote con ID:', idSubLote);
            resolve(null);
          }
        },
        (error) => {
          console.error('Error al obtener datos del sublote:', error);
          reject(error);
        }
      );
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async tieneMecanica(nLote: string, opcion: any, nSobre?: string): Promise<any> {
    // Verifica si el lote tiene preparación mecánica
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';

    // Verificar si es un sublote de embarque buscando en las trazabilidades cargadas
    let trazabilidadActual = this.trazabilidades.find(t =>
      t.nLote === nLote && (nSobre ? t.nSobre === nSobre : true)
    );

    // Si no se encuentra, usar el lote actual
    if (!trazabilidadActual) {
      trazabilidadActual = this.lote;
    }

    const esSubLoteEmbarque = this.esSubLote(trazabilidadActual);

    console.log('Verificando preparación mecánica para:');
    console.log('- nLote:', nLote);
    console.log('- nSobre:', nSobre);
    console.log('- Es sublote de embarque:', esSubLoteEmbarque);
    console.log('- Trazabilidad actual:', trazabilidadActual);

    this.http.get<any[]>(apiUrl).subscribe(
      async (data) => {
        let existePreparacion = false;
        let idSubLote: number | null = null;

        // Si es un sublote de embarque, verificar si existe trazabilidad mecánica para ese sublote específico
        if (esSubLoteEmbarque) {
          // Obtener el idSubLote correspondiente
          let idSubLoteEspecifico: number | null = null;
          try {
            idSubLoteEspecifico = await this.obtenerIdSubLote(nLote, nSobre!);
          } catch (error) {
            console.error('Error al obtener idSubLote:', error);
          }

          if (idSubLoteEspecifico) {
            // Verificar si existe trazabilidad mecánica para este sublote específico
            existePreparacion = data.some((item) =>
              item.idSubLote?.toString() === idSubLoteEspecifico.toString()
            );
            console.log('Existe preparación mecánica para el sublote específico:', existePreparacion);
          } else {
            existePreparacion = false;
          }
        } else {
          // Para lotes normales, verificar solo por nLote y tipoSobre Interno
          existePreparacion = data.some((item) =>
            item.nLote === nLote && item.tipoSobre === 'Interno'
          );
          console.log('Existe preparación mecánica para lote normal:', existePreparacion);
        }

        if (existePreparacion) {
          // Si ya existe preparación mecánica para este sublote/lote específico, mostrarla
          console.log('Mostrando preparación mecánica existente');

          // Para sublotes de embarque, obtener el idSubLote correspondiente
          if (esSubLoteEmbarque && nSobre) {
            try {
              idSubLote = await this.obtenerIdSubLote(nLote, nSobre);
            } catch (error) {
              console.error('Error al obtener idSubLote:', error);
            }
          }

          this.mecanica(nLote, opcion, nSobre, idSubLote);
        } else {
          // Si NO existe, validar roles antes de crear
          if (this.admin || this.operator || this.encargado) {

            // Si es un sublote de embarque, obtener datos del embarque primero
            let datosEmbarque = null;
            if (esSubLoteEmbarque) {
              try {
                datosEmbarque = await this.obtenerDatosEmbarque(nLote);
                if (datosEmbarque) {
                  Notiflix.Notify.info('Se detectó un sublote de embarque. Los datos del embarque se cargarán automáticamente.');
                }
              } catch (error) {
                console.error('Error al obtener datos del embarque:', error);
                Notiflix.Notify.warning('No se pudieron cargar los datos del embarque.');
              }
            }

            Notiflix.Confirm.show(
              'Preparación Mecánica',
              esSubLoteEmbarque
                ? '¿Desea iniciar la preparación mecánica para este sublote de embarque?'
                : '¿No se ha iniciado la preparación mecánica aún? ¿Deseas iniciarla ahora?',
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
                          async () => {
                            console.log('Destino: Aduana');
                            this.detalleMecanica(sobres, nLote, 'Aduana', datosEmbarque, esSubLoteEmbarque, null);
                          },
                          async () => {
                            console.log('Destino: Local');
                            this.detalleMecanica(sobres, nLote, 'Local', datosEmbarque, esSubLoteEmbarque, null);
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

  detalleMecanica(sobres: any, Num: any, destino: string, datosEmbarque: any = null, esSubLote: boolean = false, idSubLote: number | null = null) {
    console.log('Abriendo detalle mecánica con:', {
      nLote: Num,
      sobres: sobres,
      destino: destino,
      esSubLote: esSubLote,
      datosEmbarque: datosEmbarque,
      idSubLote: idSubLote
    });

    const dialogRef = this.dialog.open(DetallePrepComponent, {
      width: '40%',
      height: '90%',
      data: {
        nLote: Num,
        CantSobres: sobres,
        destino: destino,
        pesoHumedo: datosEmbarque?.pesoNetoHumedo || null,
        humedad: datosEmbarque?.porcHumedad || null,
        pesoSeco: datosEmbarque?.pesoNetoSeco || null,
        datosEmbarque: datosEmbarque,
        esSubLote: esSubLote,
        idSubLote: idSubLote  // Pasar el ID del sublote
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró con el resultado: ', result);
    });
  }

  mecanica(Num: any, opcion: any, nSobre?: string, idSubLote?: number | null) {
    if (idSubLote) {
      // Para sublotes de embarque, abrir la vista de tabla filtrada para el sublote específico
      const dialogRef = this.dialog.open(PreparacionComponent, {
        width: '90%',
        height: '90%',
        data: {
          nLote: Num,
          opcion: 1,  // Vista de tabla
          nSobre: nSobre || null,
          idSubLote: idSubLote  // Pasar el ID del sublote para filtrar
        },
      });

      dialogRef.afterClosed().subscribe(result => {

      });
    } else {
      // Para lotes normales, abrir la vista de tabla general
      const dialogRef = this.dialog.open(PreparacionComponent, {
        width: '90%',
        height: '90%',
        data: {
          nLote: Num,
          opcion: opcion,
          nSobre: nSobre || null,
          idSubLote: idSubLote || null
        },
      });

      dialogRef.afterClosed().subscribe(result => {

      });
    }
  }

  /**
   * Reimprime las etiquetas de una trazabilidad mecánica existente
   */
  reimprimirEtiquetas() {
    console.log('Reimprimiendo etiquetas para lote:', this.lote.nLote);

    // Obtener datos de trazabilidad mecánica para este lote
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        // Filtrar por el lote actual
        const trazabilidades = data.filter(item => item.nLote === this.lote.nLote);

        if (trazabilidades.length === 0) {
          Notiflix.Notify.warning('No se encontraron trazabilidades mecánicas para este lote.');
          return;
        }

        // Determinar si es sublote de embarque
        const esSubLote = trazabilidades.some(t => t.idSubLote && t.numeroSubLote);

        if (esSubLote) {
          // Para sublotes, obtener datos del embarque
          this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/lote-despacho/').subscribe(
            (embarques) => {
              const embarque = embarques.find(e => e.nLote === this.lote.nLote);
              if (embarque) {
                this.generarEtiquetasReimpresion(trazabilidades, embarque, true);
              } else {
                Notiflix.Notify.failure('No se pudo obtener los datos del embarque.');
              }
            },
            (error) => {
              console.error('Error al obtener datos del embarque:', error);
              Notiflix.Notify.failure('Error al obtener datos del embarque.');
            }
          );
        } else {
          // Para lotes normales
          this.generarEtiquetasReimpresion(trazabilidades, null, false);
        }
      },
      (error) => {
        console.error('Error al obtener trazabilidades mecánicas:', error);
        Notiflix.Notify.failure('Error al obtener las trazabilidades mecánicas.');
      }
    );
  }

  /**
   * Genera las etiquetas para reimpresión
   */
  private async generarEtiquetasReimpresion(trazabilidades: any[], embarque: any, esSubLote: boolean) {
    const workbook = new ExcelJS.Workbook();
    const camionesPorHoja = 2;
    const grupos = [];

    // Calcular cantidad de sobres (máximo nSubLote)
    const cantidadSobres = Math.max(...trazabilidades.map(t => parseInt(t.nSubLote) || 1));

    for (let i = 0; i < cantidadSobres; i += camionesPorHoja) {
      grupos.push(
        Array.from(
          { length: Math.min(camionesPorHoja, cantidadSobres - i) },
          (_, j) => i + j
        )
      );
    }

    const imagePath = '/assets/images/logos/als_logo_1.png';
    const response = await fetch(imagePath);
    const imageBuffer = await response.arrayBuffer();
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: 'png',
    });

    const formulariosGenerados = this.generarFormulariosReimpresion(trazabilidades, cantidadSobres);

    const aplicarFuenteTamanio10 = (hoja: ExcelJS.Worksheet): void => {
      hoja.eachRow((row) => {
        row.eachCell((cell) => {
          cell.font = { size: 10 };
        });
      });
    };

    // Verificar si existe un composito para este lote y agregarlo al workbook
    const apiCompositoUrl = `https://control.als-inspection.cl/api_min/api/compositos/?search=${this.lote.nLote}`;
    let composito: any = null;
    try {
      const compositosResponse = await this.http.get<any[]>(apiCompositoUrl).toPromise();
      composito = compositosResponse?.find(c => c.nLote === this.lote.nLote);
      if (composito) {
        console.log('Composito encontrado para incluir en reimpresión:', composito);
        await this.generarEtiquetaComposito(composito, workbook);
      }
    } catch (error) {
      console.error('Error al buscar composito para reimpresión:', error);
    }

    if (esSubLote) {
      // Obtener sublotes únicos
      const sublotesUnicos = [...new Set(trazabilidades.map(t => t.numeroSubLote))].sort((a, b) => a - b);

      for (let s = 0; s < sublotesUnicos.length; s++) {
        const subloteNumber = sublotesUnicos[s];
        let pageIndex = 1;
        for (const grupo of grupos) {
          const hoja = workbook.addWorksheet(`Sublote ${subloteNumber} - Página ${pageIndex++}`);
          hoja.properties.defaultRowHeight = 20;

          for (let row = 1; row <= 28; row++) {
            for (let col = 1; col <= 3; col++) {
              hoja.getCell(row, col).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' },
              };
            }
          }

          hoja.getColumn(1).width = 35;
          hoja.getColumn(2).width = 30;
          hoja.getColumn(3).width = 20;

          const fechaEmbarque: Date | null = embarque?.fLote ? new Date(embarque.fLote) : null;
          const fechaDus: Date | null = embarque?.fechaDUS ? new Date(embarque.fechaDUS) : null;
          const fechaInicioEmbarque : Date | null = composito?.fInicioEmbarque ? new Date(composito?.fInicioEmbarque) : null;
          const fechaTerminoEmbarque : Date | null = composito?.fTerminoEmbarque ? new Date(composito?.fTerminoEmbarque) : null;

          const formattedFEmbarque = this.formatDate(fechaEmbarque);
          const formattedFDus = this.formatDate(fechaDus);
          const formattedInicio = this.formatDate(fechaInicioEmbarque);
          const formattedTermino = this.formatDate(fechaTerminoEmbarque);
          let ref = ''
          try {
            const referencia = await this.despachoService.getReferenciaByIdSolicitud(embarque.solicitud).toPromise();
            ref = referencia ? referencia.nSoli : '';
          } catch (error) {
            console.error('Error al obtener datos del embarque:', error);
          }
          for (let i = 0; i < grupo.length; i++) {
            const sobreIndex = grupo[i];
            const trazabilidad = trazabilidades.find(t =>
              t.numeroSubLote == subloteNumber && t.nSubLote == (sobreIndex + 1)
            );

            if (!trazabilidad) continue;

            // Obtener datos del sublote para usar pesoLote y porcHumedad
            let datosSubLote = null;
            if (trazabilidad.idSubLote) {
              try {
                datosSubLote = await this.obtenerDatosSubLote(trazabilidad.idSubLote);
              } catch (error) {
                console.error('Error al obtener datos del sublote:', error);
              }
            }

            const codQrActual = 'E' + trazabilidad.nLote + '/' + subloteNumber + '.' + trazabilidad.nSubLote;

            const qrDataUrl = await QRCode.toDataURL(codQrActual, {
              errorCorrectionLevel: 'H',
              type: 'image/png',
              margin: 1,
              color: { dark: '#000000', light: '#ffffff' },
            });

            const base64Image = qrDataUrl.split(',')[1];
            const binaryString = atob(base64Image);
            const bufferQR = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              bufferQR[j] = binaryString.charCodeAt(j);
            }

            const imageIdQR = workbook.addImage({
              buffer: bufferQR,
              extension: 'png',
            });
            const rowOffset = i * 17;
            console.log('Data de embarque:',embarque)
            hoja.getCell(`A${2 + rowOffset}`).value = `Nave: ${trazabilidad.nave || 'N/A'}`;
            hoja.getCell(`A${3 + rowOffset}`).value = `Bodega: ${trazabilidad.bodega || 'N/A'}`;
            hoja.getCell(`A${4 + rowOffset}`).value = `Material: ${trazabilidad.material || 'Concentrado de Cobre'}`;
            hoja.getCell(`A${5 + rowOffset}`).value = `Referencia ALS: ${ref || 'N/A'}`;
            hoja.getCell(`A${6 + rowOffset}`).value = `Muestreado: ${trazabilidad.muestreadoPor || 'ALS INSPECTION'}`;
            hoja.getCell(`A${7 + rowOffset}`).value = `Exportador: ${trazabilidad.exportador || embarque?.exportador || 'ANGLO AMERICAN'}`;
            hoja.getCell(`A${8 + rowOffset}`).value = `Puerto Des: ${trazabilidad.puertoDestino || embarque?.lugarDescarga || 'N/A'}`;
            hoja.getCell(`A${9 + rowOffset}`).value = `Contrato: ${trazabilidad.contrato || embarque?.contratoAnglo || 'N/A'}`;
            hoja.getCell(`A${10 + rowOffset}`).value = `Contrato Cochilco: ${trazabilidad.cochilco || embarque?.contratoCochilco || 'N/A'}`;
            hoja.getCell(`A${11 + rowOffset}`).value = `Inicio de Embarque: ${embarque?.fLote || 'N/A'}`;
            hoja.getCell(`A${12 + rowOffset}`).value = `Termino de Embarque: ${embarque?.fechaTermino || 'N/A'}`;
            hoja.getCell(`B${2 + rowOffset}`).value = `Cliente: ${trazabilidad.cliente || embarque?.cliente || 'TO ORDER'}`;
            hoja.getCell(`B${3 + rowOffset}`).value = `Dus: ${trazabilidad.DUS || embarque?.DUS || 'No aplica'}`;
            hoja.getCell(`B${4 + rowOffset}`).value = `Fecha Dus: ${formattedFDus || 'No aplica'}`;
            hoja.getCell(`B${5 + rowOffset}`).value = `Peso Neto Húmedo: ${datosSubLote?.pesoLote || trazabilidad.pesoNetoHumedo} tmh`;
            const pesoSeco = datosSubLote?.pesoLote - (datosSubLote?.pesoLote * datosSubLote?.porcHumedad/100)
            hoja.getCell(`B${6 + rowOffset}`).value = `Humedad: ${datosSubLote?.porcHumedad || trazabilidad.porcHumedad} %`;
            hoja.getCell(`B${7 + rowOffset}`).value = `Peso Neto Seco: ${pesoSeco.toFixed(3)} tms`;
            hoja.getCell(`B${8 + rowOffset}`).value = `Responsable: ${trazabilidad.responsable || 'N/A'}`;
            hoja.getCell(`C${5 + rowOffset}`).value = `Ref Lote: ${subloteNumber}`;
            hoja.getCell(`C${6 + rowOffset}`).value = `N Sobre: ${trazabilidad.nSubLote}/${cantidadSobres}`;
            hoja.getCell(`C${7 + rowOffset}`).value = `N Sublote: ${subloteNumber}`;

            hoja.getCell(`A$|{2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };
            hoja.getCell(`B${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };

            hoja.addImage(imageIdQR, {
              tl: { col: 2, row: 6 + rowOffset },
              ext: { width: 100, height: 100 },
            });

            hoja.addImage(imageId, {
              tl: { col: 2, row: 0 + rowOffset },
              ext: { width: 70, height: 70 },
            });
          }
          aplicarFuenteTamanio10(hoja);
        }
      }
    } else {
      // Para lotes normales
      let hojaIndex = 1;
      for (const grupo of grupos) {
        const hoja = workbook.addWorksheet(`Página ${hojaIndex++}`);
        hoja.properties.defaultRowHeight = 20;

        for (let row = 1; row <= 28; row++) {
          for (let col = 1; col <= 3; col++) {
            hoja.getCell(row, col).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' },
            };
          }
        }

        hoja.getColumn(1).width = 35;
        hoja.getColumn(2).width = 30;
        hoja.getColumn(3).width = 20;

        for (let i = 0; i < grupo.length; i++) {
          const sobreIndex = grupo[i];
          const trazabilidad = trazabilidades.find(t => t.nSubLote == (sobreIndex + 1));

          if (!trazabilidad) continue;

          const codQrActual = 'E' + trazabilidad.nLote + '/' + trazabilidad.nSubLote + '.';
          const qrDataUrl = await QRCode.toDataURL(codQrActual, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
          });

          const base64Image = qrDataUrl.split(',')[1];
          const binaryString = atob(base64Image);
          const bufferQR = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bufferQR[j] = binaryString.charCodeAt(j);
          }

          const imageIdQR = workbook.addImage({
            buffer: bufferQR,
            extension: 'png',
          });
          const rowOffset = i * 17;

          hoja.getCell(`A${2 + rowOffset}`).value = `Nave: ${trazabilidad.nave || 'N/A'}`;
          hoja.getCell(`A${3 + rowOffset}`).value = `Bodega: ${trazabilidad.bodega || 'N/A'}`;
          hoja.getCell(`A${4 + rowOffset}`).value = `Material: ${trazabilidad.material || 'Concentrado de Cobre'}`;
          hoja.getCell(`A${5 + rowOffset}`).value = `Referencia ALS: ${trazabilidad.servicio || 'N/A'}`;
          hoja.getCell(`A${6 + rowOffset}`).value = `Muestreado: ${trazabilidad.muestreadoPor || 'ALS INSPECTION'}`;
          hoja.getCell(`A${7 + rowOffset}`).value = `Exportador: ${trazabilidad.exportador || 'ANGLO AMERICAN'}`;
          hoja.getCell(`A${8 + rowOffset}`).value = `Puerto Des: ${trazabilidad.puertoDestino || 'N/A'}`;
          hoja.getCell(`A${9 + rowOffset}`).value = `Contrato: ${trazabilidad.contrato || 'N/A'}`;
          hoja.getCell(`A${10 + rowOffset}`).value = `Contrato Cochilco: ${trazabilidad.cochilco || 'N/A'}`;
          hoja.getCell(`B${2 + rowOffset}`).value = `Cliente: ${trazabilidad.cliente || 'TO ORDER'}`;
          hoja.getCell(`B${3 + rowOffset}`).value = `Fecha Embarque: ${this.formatDate(trazabilidad.fechaEmbarque)}`;
          hoja.getCell(`B${4 + rowOffset}`).value = `Dus: ${trazabilidad.DUS || 'No aplica'}`;
          hoja.getCell(`B${5 + rowOffset}`).value = `Fecha Dus: ${this.formatDate(trazabilidad.fechaDUS) || 'No aplica'}`;
          hoja.getCell(`B${6 + rowOffset}`).value = `Peso Neto Húmedo: ${trazabilidad.pesoNetoHumedo} tmh`;
          hoja.getCell(`B${7 + rowOffset}`).value = `Humedad: ${trazabilidad.porcHumedad} %`;
          hoja.getCell(`B${8 + rowOffset}`).value = `Peso Neto Seco: ${trazabilidad.pesoNetoSeco} tms`;
          hoja.getCell(`B${9 + rowOffset}`).value = `Responsable: ${trazabilidad.responsable || 'N/A'}`;
          hoja.getCell(`C${5 + rowOffset}`).value = `Ref Lote: ${this.lote.observacion || 'N/A'}`;
          hoja.getCell(`C${6 + rowOffset}`).value = `N Sobre: ${trazabilidad.nSubLote}/${cantidadSobres}`;

          hoja.getCell(`A${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };
          hoja.getCell(`B${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };

          hoja.addImage(imageIdQR, {
            tl: { col: 2, row: 6 + rowOffset },
            ext: { width: 100, height: 100 },
          });

          hoja.addImage(imageId, {
            tl: { col: 2, row: 0 + rowOffset },
            ext: { width: 70, height: 70 },
          });
        }
        aplicarFuenteTamanio10(hoja);
      }
    }

    // Descargar el Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reimpresion_etiquetas_${this.lote.nLote}.xlsx`;
    link.click();

    Notiflix.Notify.success('Etiquetas reimpresas correctamente.');
  }

  /**
   * Genera formularios para reimpresión basados en trazabilidades existentes
   */
  private generarFormulariosReimpresion(trazabilidades: any[], cantidadSobres: number): any[] {
    const resultado = [];

    for (let i = 1; i <= cantidadSobres; i++) {
      const etiqueta = `${i.toString().padStart(2, '0')}/${cantidadSobres.toString().padStart(2, '0')}`;
      resultado.push({ etiqueta });
    }

    return resultado;
  }

  /**
   * Formatea una fecha para mostrar en el Excel
   */
  private formatDate(date: Date | string | null): string | null {
    if (!date) return null;
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return null;
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return null;
    }
  }

  /**
   * Genera y descarga la etiqueta del composito
   */
  private async generarEtiquetaComposito(composito: any, workbook?: ExcelJS.Workbook): Promise<ExcelJS.Workbook> {
    let wb = workbook;
    if (!wb) {
      wb = new ExcelJS.Workbook();
    }

    const imagePath = '/assets/images/logos/als_logo_1.png';
    const response = await fetch(imagePath);
    const imageBuffer = await response.arrayBuffer();
    const imageId = wb.addImage({
      buffer: imageBuffer,
      extension: 'png',
    });

    const hoja = wb.addWorksheet('Etiqueta Composito');
    hoja.properties.defaultRowHeight = 20;

    for (let row = 1; row <= 29; row++) {
      for (let col = 1; col <= 3; col++) {
        hoja.getCell(row, col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' },
        };
      }
    }

    hoja.getColumn(1).width = 35;
    hoja.getColumn(2).width = 30;
    hoja.getColumn(3).width = 20;

    // Código QR para el composito: C + nLote + .
    const codQrComposito = 'C' + composito.nLote + '.';
    const qrDataUrl = await QRCode.toDataURL(codQrComposito, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const base64Image = qrDataUrl.split(',')[1];
    const binaryString = atob(base64Image);
    const bufferQR = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      bufferQR[j] = binaryString.charCodeAt(j);
    }

    const imageIdQR = wb.addImage({
      buffer: bufferQR,
      extension: 'png',
    });

    const rowOffset = 0;

    // Información del composito
    hoja.getCell(`A2`).value = `Tipo: Composito`;
    hoja.getCell(`A3`).value = `N° Lote: ${composito.nLote}`;
    hoja.getCell(`A4`).value = `Cliente: ${composito.cliente || 'N/A'}`;
    hoja.getCell(`A5`).value = `Estado: ${composito.estado || 'N/A'}`;
    hoja.getCell(`A6`).value = `Observación: ${composito.observacion || 'Sin observaciones'}`;
    hoja.getCell(`A7`).value = `Fecha Actual: ${this.formatDate(composito.fActual)|| 'N/A'}`;
    hoja.getCell(`A8`).value = `Fecha Lote: ${this.formatDate(composito.fLote)|| 'N/A'}`;
    hoja.getCell(`A9`).value = `Referencia ALS: ${composito.servicio || 'N/A'}`;
    hoja.getCell(`A10`).value = `Inicio de Embarque: ${this.formatDate(composito.fInicioEmbarque) || 'N/A'}`;
    hoja.getCell(`A11`).value = `Termino de Embarque: ${this.formatDate(composito.fTerminoEmbarque) || 'N/A'}`;
    hoja.getCell(`B2`).value = `Bodega: ${composito.bodega || 'N/A'}`;
    hoja.getCell(`B3`).value = `N° Sobre: ${composito.nSobre || 'N/A'}`;
    hoja.getCell(`B4`).value = `Motonave: ${composito.motonave || 'N/A'}`;
    hoja.getCell(`B5`).value = `N° DUS: ${composito.nDUS || 'N/A'}`;

    hoja.getCell(`A2`).alignment = { wrapText: true, vertical: 'top' };
    hoja.getCell(`B2`).alignment = { wrapText: true, vertical: 'top' };

    hoja.addImage(imageIdQR, {
      tl: { col: 2, row: 6 },
      ext: { width: 100, height: 100 },
    });

    hoja.addImage(imageId, {
      tl: { col: 2, row: 0 },
      ext: { width: 80, height: 80 },
    });

    // Aplicar fuente tamaño 10
    hoja.eachRow((row) => {
      row.eachCell((cell) => {
        cell.font = { size: 10 };
      });
    });

    if (!workbook) {
      // Si no se pasó workbook, descargar inmediatamente
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `etiqueta_composito_${composito.nLote}.xlsx`;
      link.click();

      Notiflix.Notify.success('Etiqueta del composito descargada correctamente.');
    }

    return wb;
  }

  /**
   * Método para el botón Composito
   */
  composito() {
    console.log('Botón Composito presionado');

    // Verificar que existe una trazabilidad cargada
    if (!this.lote || !this.lote.nLote) {
      Notiflix.Notify.failure('No hay trazabilidad cargada');
      return;
    }

    const nLote = this.lote.nLote;
    const idTrazabilidad = this.lote.id; // Asumiendo que el id de la trazabilidad es el idTrazabilidad

    // Buscar si ya existe un composito para esta trazabilidad
    const apiUrl = `https://control.als-inspection.cl/api_min/api/compositos/`;

    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        const existingComposito = data.find(c => c.idTrazabilidad?.toString() === idTrazabilidad?.toString());
        if (existingComposito) {
          // Ya existe el composito, mostrar el modal con el formulario
          const dialogRef = this.dialog.open(DetalleCompositoComponent, {
            width: '80%',
            height: '90%',
            data: {
              composito: existingComposito
            },
          });

          dialogRef.afterClosed().subscribe((result) => {
            console.log('El diálogo se cerró con el resultado: ', result);
          });
        } else {
          // No existe, crear uno nuevo
          const nuevoComposito = {
            nLote: nLote,
            idTrazabilidad: idTrazabilidad,
            cliente: this.lote.cliente || null,
            idTransporte: this.lote.idTransporte || null,
            estado: this.lote.estado || null,
            observacion: this.lote.observacion || null,
            nDUS: this.lote.nDUS || null,
            fActual: this.lote.fActual || null,
            fLote: this.lote.fLote || null,
            bodega: this.lote.bodega || null,
            nSobre: this.lote.nSobre || null,
            motonave: this.lote.motonave || null,
          };

          // Crear el composito
          this.http.post('https://control.als-inspection.cl/api_min/api/compositos/', nuevoComposito).subscribe(
            (response) => {
              console.log('Composito creado:', response);
              Notiflix.Notify.success('Composito creado correctamente');

              // Generar y descargar la etiqueta del composito
              this.generarEtiquetaComposito(response);

              // Mostrar el modal con el composito recién creado
              const dialogRef = this.dialog.open(DetalleCompositoComponent, {
                width: '80%',
                height: '90%',
                data: {
                  composito: response
                },
              });

              dialogRef.afterClosed().subscribe((result) => {
                console.log('El diálogo se cerró con el resultado: ', result);
              });
            },
            (error) => {
              console.error('Error al crear composito:', error);
              Notiflix.Notify.failure('Error al crear el composito');
            }
          );
        }
      },
      (error) => {
        console.error('Error al buscar composito:', error);
        Notiflix.Notify.failure('Error al verificar el composito');
      }
    );
  }
}
