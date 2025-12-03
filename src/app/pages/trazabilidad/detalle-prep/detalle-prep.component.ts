import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import QRCode from 'qrcode';
import * as ExcelJS from 'exceljs';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { FiveDayRangeSelectionStrategy } from '../detalle-qr/detalle-qr.component';
import { forkJoin } from 'rxjs';

interface Lote {
  find(arg0: (lote: any) => boolean): any;
  id: any;
  Observacion: string;
  CuDestino: any;
  CuOrigen: any;
  cantBigbag: any;
  cantCamiones: any;
  cantVagones: any;
  diferenciaPeso: any;
  fLote: any;
  nLote: any;
  observacion: any;
  pesoBrutoHumedo: any;
  pesoNetoHumedo: any;
  pesoNetoSeco: any;
  pesoTara: any;
  porcHumedad: any;
  servicio: any;
  solicitud: any;
  tipoTransporte: any;
  nombreServicio?: string;
  nombreSolicitud?: string;
}

@Component({
  selector: 'app-detalle-prep',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './detalle-prep.component.html',
  styleUrl: './detalle-prep.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class DetallePrepComponent {
  formGroups: FormGroup[] = [];
  miFormulario: FormGroup;
  lote: any;
  fEmbarque: Date;
  fechaDus: Date;

  constructor(
    private _formBuilder: FormBuilder,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<DetallePrepComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      nLote: string;
      CantSobres: number;
      destino: string;
      pesoHumedo: any,
      humedad: any,
      pesoSeco: any,
      datosEmbarque?: any,
      esSubLote?: boolean,
      idSubLote?: number | null
    }
  ) {
    console.log('DetallePrepComponent inicializado con datos:', this.data);

    // Inicializar formulario según destino
    if (data.destino === 'Aduana') {
      this.miFormulario = this.fb.group({
        nave: [''],
        bodega: [''],
        material: ['Concentrado de Cobre', Validators.required],
        numLote: [this.data.nLote, Validators.required],
        muestreado: ['ALS INSPECTION', Validators.required],
        exportador: ['ANGLO AMERICAN', Validators.required],
        puertoDes: [''],
        contrato: [''],
        cliente: ['TO ORDER'],
        contratoCochilco: [''],
        fEmbarque: [null, Validators.required],
        referenciaAls: [``],
        dus: [null, Validators.required],
        fechaDus: [null, Validators.required],
        pesoNetoHumedo: [this.data.pesoHumedo, Validators.required],
        humedad: [this.data.humedad, Validators.required],
        pesoNetoSeco: [this.data.pesoSeco, Validators.required],
        responsable: ['', Validators.required],
      });
    } else {
      this.miFormulario = this.fb.group({
        nave: [''],
        bodega: [''],
        material: ['Concentrado de Cobre', Validators.required],
        numLote: [this.data.nLote, Validators.required],
        muestreado: ['ALS INSPECTION', Validators.required],
        exportador: ['ANGLO AMERICAN', Validators.required],
        puertoDes: [''],
        contrato: [''],
        cliente: ['TO ORDER'],
        contratoCochilco: [''],
        fEmbarque: [null, Validators.required],
        referenciaAls: [``],
        dus: [null],
        fechaDus: [null],
        pesoNetoHumedo: [this.data.pesoHumedo, Validators.required],
        humedad: [this.data.humedad, Validators.required],
        pesoNetoSeco: [this.data.pesoSeco, Validators.required],
        responsable: ['', Validators.required],
      });
    }

    // Habilitar/deshabilitar campos según destino
    if (this.data.destino === 'Local') {
      this.miFormulario.get('dus')?.disable();
      this.miFormulario.get('fechaDus')?.disable();
    } else {
      this.miFormulario.get('dus')?.enable();
      this.miFormulario.get('fechaDus')?.enable();
    }

    // Si es un sublote de embarque, cargar datos del embarque
    if (this.data.esSubLote && this.data.datosEmbarque) {
      console.log('Es un sublote de embarque. Pre-llenando formulario con datos del embarque...');
      this.cargarDatosEmbarque(this.data.datosEmbarque);
    } else {
      // Cargar lote normal
      this.cargarLote(this.data.nLote);
    }
  }

  ngOnInit() {
    this.obtenerLoteConNombres(this.data.nLote)
  }

  /**
   * Carga los datos del embarque en el formulario cuando es un sublote
   * @param embarque Datos del embarque (LoteDespacho)
   */
  cargarDatosEmbarque(embarque: any) {
    console.log('Cargando datos del embarque:', embarque);
    
    // Crear objeto lote con los datos del embarque
    this.lote = {
      nLote: embarque.nLote,
      observacion: embarque.observacion || '',
      pesoNetoHumedo: embarque.pesoNetoHumedo,
      porcHumedad: embarque.porcHumedad,
      pesoNetoSeco: embarque.pesoNetoSeco,
      servicio: embarque.servicio,
      solicitud: embarque.solicitud,
      nombreServicio: '',
      nombreSolicitud: ''
    };

    // Pre-llenar el formulario con datos del embarque
    this.miFormulario.patchValue({
      nave: embarque.nombreNave || '',
      bodega: embarque.bodegaNave || '',
      material: 'Concentrado de Cobre',
      numLote: embarque.nLote,
      muestreado: 'ALS INSPECTION',
      exportador: embarque.exportador || 'ANGLO AMERICAN',
      puertoDes: embarque.lugarDescarga || '',
      contrato: embarque.contratoAnglo || '',
      cliente: embarque.cliente || 'TO ORDER',
      contratoCochilco: embarque.contratoCochilco || '',
      fEmbarque: embarque.fLote ? new Date(embarque.fLote) : null,
      referenciaAls: embarque.observacion || '',
      dus: embarque.DUS || null,
      fechaDus: embarque.fechaDUS ? new Date(embarque.fechaDUS) : null,
      pesoNetoHumedo: embarque.pesoNetoHumedo,
      humedad: embarque.porcHumedad ? parseFloat(embarque.porcHumedad).toFixed(4) : '',
      pesoNetoSeco: embarque.pesoNetoSeco,
    });

    // Obtener nombres de servicio y solicitud
    this.obtenerLoteConNombres(embarque.nLote);
    
    console.log('Formulario pre-llenado con datos del embarque');
  }

  cargarLote(nLote: any) {
    console.log('Cargando lote con nLote:', nLote);
    const apiUrl = `https://control.als-inspection.cl/api_min/api/lote-recepcion/`;
    this.http.get<Lote>(apiUrl).subscribe((res) => {
      console.log('Respuesta completa desde la API:', res);
      // Buscar y guardar el lote correspondiente
      this.lote = res.find((lote) => lote.nLote === nLote);
      if (this.lote) {
        this.miFormulario.patchValue({
          numLote: this.lote.nLote,
          material: 'Concentrado de Cobre',
          muestreado: 'ALS INSPECTION',
          exportador: 'ANGLO AMERICAN',
          pesoNetoHumedo: this.lote.pesoNetoHumedo,
          humedad: parseFloat(this.lote.porcHumedad).toFixed(4),
          referenciaAls: this.lote.observacion,
          pesoNetoSeco: this.lote.pesoNetoSeco,
        });
        console.log('Lote encontrado:');
        console.log(this.lote);
      } else {
        console.error('Lote no encontrado');
      }
    });
  }

  generarFormulariosConEtiqueta(): any[] {
    const cantidad = this.data.CantSobres;
    const baseData = this.miFormulario.value;
    const resultado = [];

    for (let i = 1; i <= cantidad; i++) {
      const etiqueta = `${i.toString().padStart(2, '0')}/${cantidad}`;
      resultado.push({ ...baseData, etiqueta });
    }

    return resultado;
  }

  obtenerLoteConNombres(loteId: any): void {
    const apiLote = 'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
    const apiServicio = 'https://control.als-inspection.cl/api_min/api/servicio/';
    const apiSolicitud = 'https://control.als-inspection.cl/api_min/api/solicitud/';

    this.http.get<any[]>(apiLote).subscribe((resLotes) => {
      const loteEncontrado = resLotes.find(lote => lote.nLote === loteId);

      if (!loteEncontrado && !this.lote) {
        Notiflix.Notify.failure('Lote no encontrado.');
        return;
      }

      // Si ya tenemos lote (de embarque), usar ese, sino usar el encontrado
      if (!this.lote) {
        this.lote = loteEncontrado;
      }

      forkJoin({
        servicios: this.http.get<any[]>(apiServicio),
        solicitudes: this.http.get<any[]>(apiSolicitud),
      }).subscribe(({ servicios, solicitudes }) => {
        const servicioEncontrado = servicios.find(s => s.id === this.lote.servicio);
        const solicitudEncontrada = solicitudes.find(s => s.id === this.lote.solicitud);

        this.lote.nombreServicio = servicioEncontrado?.nServ || 'Desconocido';
        this.lote.nombreSolicitud = solicitudEncontrada?.nSoli || 'Desconocido';

        console.log('Lote con nombres:', this.lote);
      });
    });
  }

  /**
   * Obtiene todos los sublotes del embarque desde la API despacho-embarque
   * @param nLote Número del lote del embarque
   * @returns Promise con la lista de sublotes ordenados por ID
   */
  obtenerSublotesEmbarque(nLote: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const apiUrl = 'https://control.als-inspection.cl/api_min/api/despacho-embarque/';
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          const sublotes = data.filter(s => s.nLote === nLote);
          // Ordenar por ID para mantener el orden correcto
          sublotes.sort((a, b) => a.id - b.id);
          console.log('Sublotes del embarque obtenidos:', sublotes);
          resolve(sublotes);
        },
        (error) => {
          console.error('Error al obtener sublotes del embarque:', error);
          reject(error);
        }
      );
    });
  }

  mostrarResultado() {
    const formulariosGenerados = this.generarFormulariosConEtiqueta();
    console.log(this.data.CantSobres);
    console.log('--------------------------');
    console.log(formulariosGenerados);
  }

  rellenarCamposAutomáticos() {
    const primerFormulario = this.formGroups[0].value;

    this.formGroups.forEach((formGroup, index) => {
      if (index !== 0) {
        Object.keys(formGroup.controls).forEach((controlName) => {
          if (!formGroup.controls[controlName].value) {
            formGroup.controls[controlName].setValue(
              primerFormulario[controlName]
            );
          }
        });
      }
    });
  }

  finalizarProceso() {
    console.log(this.formGroups);
    this.rellenarCamposAutomáticos();
    console.log(this.formGroups);
    this.generarCodigosQREnExcelUnificado();
  }

  cerrarDialogo() {
    this.dialogRef.close();
  }

  formatDate(date: Date | undefined | null): string | null {
    if (!date) {
      return null;
    }

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return null;
      }

      const year = dateObj.getFullYear().toString();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return null;
    }
  }

  async generarCodigosQREnExcelUnificado(): Promise<void> {
    const cantidad = this.data.CantSobres;
    const codQrBase = this.data.nLote;

    if (!cantidad || !codQrBase) {
      Notiflix.Notify.failure('Completa todos los campos del formulario.');
      return;
    }

    // Validar que los campos requeridos estén completos
    if (!this.miFormulario.valid) {
      Notiflix.Notify.failure('Por favor completa todos los campos requeridos del formulario.');
      return;
    }

    let sublotes: any[] = [];
    if (this.data.esSubLote) {
      try {
        sublotes = await this.obtenerSublotesEmbarque(this.data.nLote);
      } catch (error) {
        Notiflix.Notify.failure('Error al obtener sublotes del embarque.');
        return;
      }
    }

    const workbook = new ExcelJS.Workbook();
    const camionesPorHoja = 2;
    const grupos = [];

    for (let i = 0; i < cantidad; i += camionesPorHoja) {
      grupos.push(
        Array.from(
          { length: Math.min(camionesPorHoja, cantidad - i) },
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

    const formulariosGenerados = this.generarFormulariosConEtiqueta();

    const aplicarFuenteTamanio10 = (hoja: ExcelJS.Worksheet): void => {
      hoja.eachRow((row) => {
        row.eachCell((cell) => {
          cell.font = { size: 10 };
        });
      });
    };

    if (this.data.esSubLote) {
      for (let s = 0; s < sublotes.length; s++) {
        const subloteNumber = s + 1;
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

          const fechaEmbarque: Date | null = this.miFormulario.get('fEmbarque')?.value;
          const fechaDus: Date | null = this.miFormulario.get('fechaDus')?.value;

          const formattedFEmbarque = this.formatDate(fechaEmbarque);
          const formattedFDus = this.formatDate(fechaDus);

          for (let i = 0; i < grupo.length; i++) {
            const formulario = formulariosGenerados[grupo[i]];
            const codQrActual = 'E' + this.lote.nLote + '/' + subloteNumber + '.' + String(grupo[i] + 1);
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

            hoja.getCell(`A${2 + rowOffset}`).value = `Nave: ${formulario.nave || 'N/A'}`;
            hoja.getCell(`A${3 + rowOffset}`).value = `Bodega: ${formulario.bodega || 'N/A'}`;
            hoja.getCell(`A${4 + rowOffset}`).value = `Material: ${formulario.material}`;
            hoja.getCell(`A${5 + rowOffset}`).value = `Solicitud: ${this.lote.nombreSolicitud}`;
            hoja.getCell(`A${6 + rowOffset}`).value = `Muestreado: ${formulario.muestreado}`;
            hoja.getCell(`A${7 + rowOffset}`).value = `Exportador: ${formulario.exportador}`;
            hoja.getCell(`A${8 + rowOffset}`).value = `Puerto Des: ${formulario.puertoDes || 'N/A'}`;
            hoja.getCell(`A${9 + rowOffset}`).value = `Contrato: ${formulario.contrato || 'N/A'}`;
            hoja.getCell(`A${10 + rowOffset}`).value = `Contrato Cochilco: ${formulario.contratoCochilco || 'N/A'}`;
            hoja.getCell(`B${2 + rowOffset}`).value = `Cliente: ${formulario.cliente}`;
            hoja.getCell(`B${3 + rowOffset}`).value = `Fecha Embarque: ${formattedFEmbarque}`;
            hoja.getCell(`B${4 + rowOffset}`).value = `Referencia Als: ${this.lote.nombreServicio}`;
            hoja.getCell(`B${5 + rowOffset}`).value = `Dus: ${formulario.dus || 'No aplica'}`;
            hoja.getCell(`B${6 + rowOffset}`).value = `Fecha Dus: ${formattedFDus || 'No aplica'}`;
            hoja.getCell(`B${7 + rowOffset}`).value = `Peso Neto Húmedo: ${formulario.pesoNetoHumedo} tmh`;
            hoja.getCell(`B${8 + rowOffset}`).value = `Humedad: ${formulario.humedad} %`;
            hoja.getCell(`B${9 + rowOffset}`).value = `Peso Neto Seco: ${formulario.pesoNetoSeco} tms`;
            hoja.getCell(`B${10 + rowOffset}`).value = `Responsable: ${formulario.responsable}`;
            hoja.getCell(`C${5 + rowOffset}`).value = `Ref Lote: ${this.lote.observacion}`;
            hoja.getCell(`C${6 + rowOffset}`).value = `N Sobre: ${formulario.etiqueta}`;
            hoja.getCell(`C${7 + rowOffset}`).value = `N Sublote: ${subloteNumber}`;

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
    } else {
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

        const fechaEmbarque: Date | null = this.miFormulario.get('fEmbarque')?.value;
        const fechaDus: Date | null = this.miFormulario.get('fechaDus')?.value;

        const formattedFEmbarque = this.formatDate(fechaEmbarque);
        const formattedFDus = this.formatDate(fechaDus);

        for (let i = 0; i < grupo.length; i++) {
          const formulario = formulariosGenerados[grupo[i]];
          const codQrActual = 'E' + this.lote.nLote + '/' + String(grupo[i] + 1) + '.';
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

          hoja.getCell(`A${2 + rowOffset}`).value = `Nave: ${formulario.nave || 'N/A'}`;
          hoja.getCell(`A${3 + rowOffset}`).value = `Bodega: ${formulario.bodega || 'N/A'}`;
          hoja.getCell(`A${4 + rowOffset}`).value = `Material: ${formulario.material}`;
          hoja.getCell(`A${5 + rowOffset}`).value = `Solicitud: ${this.lote.nombreSolicitud}`;
          hoja.getCell(`A${6 + rowOffset}`).value = `Muestreado: ${formulario.muestreado}`;
          hoja.getCell(`A${7 + rowOffset}`).value = `Exportador: ${formulario.exportador}`;
          hoja.getCell(`A${8 + rowOffset}`).value = `Puerto Des: ${formulario.puertoDes || 'N/A'}`;
          hoja.getCell(`A${9 + rowOffset}`).value = `Contrato: ${formulario.contrato || 'N/A'}`;
          hoja.getCell(`A${10 + rowOffset}`).value = `Contrato Cochilco: ${formulario.contratoCochilco || 'N/A'}`;
          hoja.getCell(`B${2 + rowOffset}`).value = `Cliente: ${formulario.cliente}`;
          hoja.getCell(`B${3 + rowOffset}`).value = `Fecha Embarque: ${formattedFEmbarque}`;
          hoja.getCell(`B${4 + rowOffset}`).value = `Referencia Als: ${this.lote.nombreServicio}`;
          hoja.getCell(`B${5 + rowOffset}`).value = `Dus: ${formulario.dus || 'No aplica'}`;
          hoja.getCell(`B${6 + rowOffset}`).value = `Fecha Dus: ${formattedFDus || 'No aplica'}`;
          hoja.getCell(`B${7 + rowOffset}`).value = `Peso Neto Húmedo: ${formulario.pesoNetoHumedo} tmh`;
          hoja.getCell(`B${8 + rowOffset}`).value = `Humedad: ${formulario.humedad} %`;
          hoja.getCell(`B${9 + rowOffset}`).value = `Peso Neto Seco: ${formulario.pesoNetoSeco} tms`;
          hoja.getCell(`B${10 + rowOffset}`).value = `Responsable: ${formulario.responsable}`;
          hoja.getCell(`C${5 + rowOffset}`).value = `Ref Lote: ${this.lote.observacion}`;
          hoja.getCell(`C${6 + rowOffset}`).value = `N Sobre: ${formulario.etiqueta}`;

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

    // Página adicional para etiqueta simple
    const hojaSimple = workbook.addWorksheet('Etiqueta Simple');
    hojaSimple.properties.defaultRowHeight = 20;

    for (let row = 1; row <= 29; row++) {
      for (let col = 1; col <= 3; col++) {
        hojaSimple.getCell(row, col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' },
        };
      }
    }

    hojaSimple.getColumn(1).width = 35;
    hojaSimple.getColumn(2).width = 30;
    hojaSimple.getColumn(3).width = 20;

    const simpleForm = {
      numLote: this.data.nLote,
      material: 'Concentrado de cobre',
      muestreado: 'ALS INSPECTION',
      cliente: 'ANGLO AMERICAN',
      fechaPreparacion: new Date().toLocaleDateString('es-CL'),
      referenciaAls: this.lote.Observacion,
      pesoNetoHumedo: this.miFormulario.get('pesoNetoHumedo')?.value,
      humedad: parseFloat(this.miFormulario.get('humedad')?.value).toFixed(4),
      pesoNetoSeco: this.miFormulario.get('pesoNetoSeco')?.value,
      responsable: this.miFormulario.get('responsable')?.value,
    };

    const codQrActual2 = 'S' + this.data.nLote;

    const qrDataUrl2: string = await QRCode.toDataURL(codQrActual2, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const base64ImageSimple = qrDataUrl2.split(',')[1];
    const binarySimple = atob(base64ImageSimple);
    const bufferSimpleQR = new Uint8Array(binarySimple.length);

    for (let j = 0; j < binarySimple.length; j++) {
      bufferSimpleQR[j] = binarySimple.charCodeAt(j);
    }

    const imageIdSimpleQR = workbook.addImage({
      buffer: bufferSimpleQR,
      extension: 'png',
    });

    const rowOffsetSimple = 0;
    const setSimple = (cell: any, text: any) =>
      (hojaSimple.getCell(cell).value = text);
    setSimple(`A2`, `Solicitud: ${this.lote.nombreSolicitud}`);
    setSimple(`A3`, `Material: ${simpleForm.material}`);
    setSimple(`A4`, `Muestreado por: ${simpleForm.muestreado}`);
    setSimple(`A5`, `Cliente: ${simpleForm.cliente}`);
    setSimple(`A6`, `Fecha Preparación Muestra: ${simpleForm.fechaPreparacion}`);
    setSimple(`A7`, `Referencia ALS: ${this.lote.nombreServicio}`);
    setSimple(`B2`, `Peso Neto Húmedo: ${simpleForm.pesoNetoHumedo} tmh`);
    setSimple(`B3`, `% Humedad: ${simpleForm.humedad} %`);
    setSimple(`B4`, `Peso Neto Seco: ${simpleForm.pesoNetoSeco} tms`);
    setSimple(`B5`, `Responsable: ${this.miFormulario.get('responsable')?.value}`);
    setSimple(`B6`, `Ref Lote: ${this.lote.observacion}`);
    hojaSimple.addImage(imageId, {
      tl: { col: 2, row: 1 },
      ext: { width: 80, height: 80 },
    });

    hojaSimple.addImage(imageIdSimpleQR, {
      tl: { col: 2, row: 5 },
      ext: { width: 80, height: 80 },
    });
    aplicarFuenteTamanio10(hojaSimple);

    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this.data.esSubLote ? `etiquetas_sublotes_${codQrBase}.xlsx` : `etiquetas_y_simple_${codQrBase}.xlsx`;
    link.click();

    // Guardar los datos en la base de datos
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';

    // Obtener y formatear valores numéricos con máximo 2 decimales
    const pesoNetoHumedo = this.miFormulario.get('pesoNetoHumedo')?.value;
    const pesoNetoSeco = this.miFormulario.get('pesoNetoSeco')?.value;
    const humedad = this.miFormulario.get('humedad')?.value;

    const dataToSendBase = {
      nLote: this.miFormulario.get('numLote')?.value || this.lote.nLote,
      nSubLote: this.miFormulario.get('numLote')?.value,
      idSubLote: this.data.idSubLote ? this.data.idSubLote.toString() : null,  // Guardar el ID del sublote
      idTransporte: '',
      nave: this.miFormulario.get('nave')?.value || '',
      bodega: this.miFormulario.get('bodega')?.value || '',
      material: this.miFormulario.get('material')?.value,
      muestreadoPor: this.miFormulario.get('muestreado')?.value,
      exportador: this.miFormulario.get('exportador')?.value,
      puertoDestino: this.miFormulario.get('puertoDes')?.value || '',
      contrato: this.miFormulario.get('contrato')?.value || '',
      cliente: this.miFormulario.get('cliente')?.value,
      cochilco: this.miFormulario.get('contratoCochilco')?.value || '',
      fechaEmbarque: this.formatDate(this.miFormulario.get('fEmbarque')?.value) || null,
      DUS: this.miFormulario.get('dus')?.value?.trim() || 'No aplica',
      fechaDUS: this.miFormulario.get('fechaDus')?.value
        ? this.formatDate(this.miFormulario.get('fechaDus')!.value)
        : null,
      pesoNetoHumedo: pesoNetoHumedo ? parseFloat(Number(pesoNetoHumedo).toFixed(2)) : 0,
      pesoNetoSeco: pesoNetoSeco ? parseFloat(Number(pesoNetoSeco).toFixed(2)) : 0,
      porcHumedad: humedad ? parseFloat(Number(humedad).toFixed(2)) : 0,
      responsable: this.miFormulario.get('responsable')?.value,
      observacion: 'Sin Observaciones',
      estado: 'En Preparación',
      fechaSobre: null,
      fechaInstruccionDespacho: null,
      fechaConfirmacionDespacho: null,
      fechaDespacho: null,
      numeroGuia: null,
      laboratorio: null,
      fechaLlegadaLaboratorio: null,
      pais: null,
      tipoSobre: this.data.esSubLote ? 'Externo' : 'Interno'
    };

    if (this.data.esSubLote) {
      // Para sublotes de embarque, crear trazabilidades mecánicas para TODOS los sobres de TODOS los sublotes
      const promises: Promise<any>[] = [];

      sublotes.forEach((sublote, index) => {
        const subloteNumber = index + 1; // Número del sublote (1, 2, 3, ...)

        // Crear CantSobres trazabilidades para cada sublote
        for (let j = 0; j < cantidad; j++) {
          const dataToSend = {
            ...dataToSendBase,
            nSubLote: String(j + 1),  // nSubLote como "1", "2", "3", etc. (número del sobre dentro del sublote)
            numeroSubLote: subloteNumber,  // numeroSubLote como 1, 2, 3, etc. (número del sublote del embarque)
            idSubLote: sublote.id.toString(),  // ID real del sublote desde despacho-embarque
          };

          promises.push(
            new Promise((resolve, reject) => {
              this.http.post(apiUrl, dataToSend).subscribe(
                (response) => {
                  console.log(`Trazabilidad mecánica creada para sublote ${subloteNumber}, sobre ${j + 1}:`, response);
                  resolve(response);
                },
                (error) => {
                  console.error(`Error al crear trazabilidad mecánica para sublote ${subloteNumber}, sobre ${j + 1}:`, error);
                  reject(error);
                }
              );
            })
          );
        }
      });

      try {
        await Promise.all(promises);
        Notiflix.Notify.success(`Trazabilidades mecánicas creadas para todos los ${sublotes.length} sublotes del embarque (${cantidad} sobres por sublote).`);
      } catch (error) {
        Notiflix.Notify.failure('Error al crear algunas trazabilidades mecánicas.');
        return;
      }
    } else {
      // Para lotes normales, crear trazabilidades mecánicas para la cantidad de sobres especificada
      const promises = [];
      for (let i = 0; i < cantidad; i++) {
        const dataToSend = {
          ...dataToSendBase,
          nSubLote: String(i + 1),
          idSubLote: null,  // No hay sublote para lotes normales
        };

        promises.push(
          new Promise((resolve, reject) => {
            this.http.post(apiUrl, dataToSend).subscribe(
              (response) => {
                console.log(`Trazabilidad mecánica creada para sobre ${i + 1}:`, response);
                resolve(response);
              },
              (error) => {
                console.error(`Error al crear trazabilidad mecánica para sobre ${i + 1}:`, error);
                reject(error);
              }
            );
          })
        );
      }

      try {
        await Promise.all(promises);
        Notiflix.Notify.success(`Trazabilidades mecánicas creadas para ${cantidad} sobres.`);
      } catch (error) {
        Notiflix.Notify.failure('Error al crear algunas trazabilidades mecánicas.');
        return;
      }
    }

    this.cerrarDialogo();
  }
}
