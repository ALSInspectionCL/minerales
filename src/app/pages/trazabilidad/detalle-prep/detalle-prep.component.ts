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
  // agrega aquí otras propiedades si las hay
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
    }
  ) {
    this.cargarLote(this.data.nLote);

    if(data.destino === 'Aduana'){
      this.miFormulario = this.fb.group({
        nave: ['', Validators.required],
        bodega: ['', Validators.required],
        material: ['Concentrado de Cobre', Validators.required],
        numLote: [this.data.nLote, Validators.required],
        muestreado: ['ALS INSPECTION', Validators.required],
        exportador: ['Ocean Partners', Validators.required],
        puertoDes: ['', Validators.required],
        contrato: ['', Validators.required],
        cliente: ['TO ORDER'],
        contratoCochilco: ['', Validators.required],
        fEmbarque: [null, Validators.required],
        referenciaAls: [``],
        dus: [null, Validators.required],
        fechaDus: [null, Validators.required],
        pesoNetoHumedo: ['', Validators.required],
        humedad: ['', Validators.required],
        pesoNetoSeco: ['', Validators.required],
        responsable: ['', Validators.required],
      });
    } else {
      this.miFormulario = this.fb.group({
        nave: ['', Validators.required],
        bodega: ['', Validators.required],
        material: ['Concentrado de Cobre', Validators.required],
        numLote: [this.data.nLote, Validators.required],
        muestreado: ['ALS INSPECTION', Validators.required],
        exportador: ['Ocean Partners', Validators.required],
        puertoDes: ['', Validators.required],
        contrato: ['', Validators.required],
        cliente: ['TO ORDER'],
        contratoCochilco: ['', Validators.required],
        fEmbarque: [null, Validators.required],
        referenciaAls: [``],
        dus: [],
        fechaDus: [null],
        pesoNetoHumedo: ['', Validators.required],
        humedad: ['', Validators.required],
        pesoNetoSeco: ['', Validators.required],
        responsable: ['', Validators.required],
      });
    }

    if (this.data.destino === 'Local') {
      this.miFormulario.get('dus')?.disable();
      this.miFormulario.get('fechaDus')?.disable();
    } else {
      this.miFormulario.get('dus')?.enable();
      this.miFormulario.get('fechaDus')?.enable();
    }
  }

  ngOnInit() {}
  lote: any;
  fEmbarque: Date;
  fechaDus: Date;

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
          exportador: 'Ocean Partners',
          pesoNetoHumedo: this.lote.pesoNetoHumedo,
          humedad: parseFloat(this.lote.porcHumedad).toFixed(4),
          referenciaAls: this.lote.observacion,
          pesoNetoSeco: this.lote.pesoNetoSeco,
          responsable: 'Carlos Soto',
        });
        console.log('Lote encontrado:');
        console.log(this.lote);
      } else {
        console.error('Lote no encontrado');
      }
    });
  }

  // createSteps(count: number) {
  //   this.formGroups = Array.from({ length: count }, () =>
  //     this._formBuilder.group({
  //       nave: ['', Validators.required],
  //       bodega: ['', Validators.required],
  //       material: ['Concentrado de Cobre', Validators.required],
  //       numLote: [this.data.numLote, Validators.required],
  //       muestreado: ['ALS INSPECTION', Validators.required],
  //       exportador: ['Ocean Partners', Validators.required],
  //       puertoDes: ['', Validators.required],
  //       contrato: ['', Validators.required],
  //       cliente: ['TO ORDER', Validators.required],
  //       contratoCochilco: ['', Validators.required],
  //       fEmbarque: ['', Validators.required],
  //       referenciaAls: ['this.lote.Observacion', Validators.required],
  //       dus: ['', Validators.required],
  //       fechaDus: ['', Validators.required],
  //       pesoNetoHumedo: ['', Validators.required],
  //       humedad: ['', Validators.required],
  //       pesoNetoSeco: ['', Validators.required],
  //       responsable: ['', Validators.required],
  //     })
  //   );
  // }

  generarFormulariosConEtiqueta(): any[] {
    const cantidad = this.data.CantSobres; // la que te pasaron al abrir el diálogo
    const baseData = this.miFormulario.value;
    const resultado = [];

    for (let i = 1; i <= cantidad; i++) {
      const etiqueta = `${i.toString().padStart(2, '0')}/${cantidad}`;
      resultado.push({ ...baseData, etiqueta });
    }

    return resultado;
  }

  // Inicializar los formGroups
  // initializeFormGroups() {
  //   const numberOfSteps = this.data.CantSobres; // Cambia este valor según el número de pasos que tengas
  //   this.formGroups = [];

  //   for (let i = 0; i < numberOfSteps; i++) {
  //     const formGroup = this.fb.group({
  //       nave: [''],
  //       bodega: [''],
  //       material: ['Concentrado de Cobre'],
  //       numLote: [this.data.numLote],  // Asignamos el índice + 1 como valor por defecto
  //       muestreado: ['ALS INSPECTION'],
  //       exportador: ['Ocean Partners'],
  //       puertoDes: [''],
  //       contrato: [''],
  //       cliente: ['TO ORDER'],
  //       contratoCochilco: [''],
  //       fEmbarque: [''],
  //       referenciaAls: [this.lote.Observacion],
  //       dus: [''],
  //       fechaDus: [''],
  //       pesoNetoHumedo: [''],
  //       humedad: [''],
  //       pesoNetoSeco: [''],
  //       responsable: ['']
  //     });

  //     this.formGroups.push(formGroup);
  //   }
  // }

  // onStepChange(event: StepperSelectionEvent) {
  //   const currentIndex = event.selectedIndex;
  //   const previousIndex = event.previouslySelectedIndex;

  //   if (currentIndex > 0 && currentIndex < this.formGroups.length) {
  //     const prevForm = this.formGroups[previousIndex];
  //     const currForm = this.formGroups[currentIndex];

  //     if (prevForm && currForm) {
  //       // Clonar los valores del formulario anterior
  //       const valoresPrevios = { ...prevForm.value };

  //       // Eliminar los campos que NO queremos copiar
  //       delete valoresPrevios.pesoNetoHumedo;
  //       delete valoresPrevios.humedad;
  //       delete valoresPrevios.pesoNetoSeco;

  //       // Aplicar solo los valores permitidos
  //       currForm.patchValue(valoresPrevios);
  //     }
  //   }
  // }

  mostrarResultado() {
    const formulariosGenerados = this.generarFormulariosConEtiqueta();
    console.log(this.data.CantSobres);
    console.log('--------------------------');
    console.log(formulariosGenerados);
  }

  // Función para rellenar los formularios con los datos del primer formulario
  rellenarCamposAutomáticos() {
    const primerFormulario = this.formGroups[0].value;

    this.formGroups.forEach((formGroup, index) => {
      if (index !== 0) {
        Object.keys(formGroup.controls).forEach((controlName) => {
          if (!formGroup.controls[controlName].value) {
            // Si el campo está vacío, lo rellenamos con el valor del primer formulario
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
    // Rellenar los campos antes de finalizar el proceso
    this.rellenarCamposAutomáticos();
    console.log(this.formGroups);
    // Aquí puedes realizar cualquier otra lógica antes de finalizar
    this.generarCodigosQREnExcelUnificado();
  }

  /////GENEREAR QR Y EXCEL

  async generarCodigosQREnExcelUnificado(): Promise<void> {
    const cantidad = this.data.CantSobres;
    const codQrBase = this.data.nLote;

    if (!cantidad || !codQrBase) {
      Notiflix.Notify.failure('Completa todos los campos del formulario.');
      return;
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

    let hojaIndex = 1;

    const aplicarFuenteTamanio10 = (hoja: ExcelJS.Worksheet): void => {
      hoja.eachRow((row) => {
        row.eachCell((cell) => {
          cell.font = { size: 10 };
        });
      });
    };
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
        const codQrActual = 'E' + this.lote.nLote + '/' + String(i + 1)+'.';
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

        hoja.getCell(`A${2 + rowOffset}`).value = `Nave: ${formulario.nave}`;
        hoja.getCell(`A${3 + rowOffset}`).value = `Bodega: ${formulario.bodega}`;
        hoja.getCell(`A${4 + rowOffset}`).value = `Material: ${formulario.material}`;
        hoja.getCell(`A${5 + rowOffset}`).value = `Num Lote: ${formulario.numLote}`;
        hoja.getCell(`A${6 + rowOffset}`).value = `Muestreado: ${formulario.muestreado}`;
        hoja.getCell(`A${7 + rowOffset}`).value = `Exportador: ${formulario.exportador}`;
        hoja.getCell(`A${8 + rowOffset}`).value = `Puerto Des: ${formulario.puertoDes}`;
        hoja.getCell(`A${9 + rowOffset}`).value = `Contrato: ${formulario.contrato}`;
        hoja.getCell(`A${10 + rowOffset}`).value = `Contrato Cochilco: ${formulario.contratoCochilco}`;
        hoja.getCell(`B${2 + rowOffset}`).value = `Cliente: ${formulario.cliente}`;
        hoja.getCell(`B${3 + rowOffset}`).value = `Fecha Embarque: ${formattedFEmbarque}`;
        hoja.getCell(`B${4 + rowOffset}`).value = `Referencia Als: ${this.lote.observacion}`;
        hoja.getCell(`B${5 + rowOffset}`).value = `Dus: ${formulario.dus || 'No aplica'}`;
        hoja.getCell(`B${6 + rowOffset}`).value = `Fecha Dus: ${formattedFDus || 'No aplica'}`;
        hoja.getCell(`B${7 + rowOffset}`).value = `Peso Neto Húmedo: ${formulario.pesoNetoHumedo}`;
        hoja.getCell(`B${8 + rowOffset}`).value = `Humedad: ${formulario.humedad}`;
        hoja.getCell(`B${9 + rowOffset}`).value = `Peso Neto Seco: ${formulario.pesoNetoSeco}`;
        hoja.getCell(`B${10 + rowOffset}`).value = `Responsable: ${formulario.responsable}`;
        hoja.getCell(`C${6 + rowOffset}`).value = `N Sobre: ${formulario.etiqueta}`;
  
        hoja.getCell(`A${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };
        hoja.getCell(`B${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };

        hoja.addImage(imageIdQR, {
          tl: { col: 2, row: 6 + rowOffset },
          ext: { width: 80, height: 80 },
        });

        hoja.addImage(imageId, {
          tl: { col: 2, row: 0 + rowOffset },
          ext: { width: 100, height: 100 },
        });
      }
      aplicarFuenteTamanio10(hoja);
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
    hojaSimple.getColumn(2).width = 20;
    hojaSimple.getColumn(3).width = 20;

    const simpleForm = {
      numLote: this.data.nLote,
      material: 'Concentrado de cobre',
      muestreado: 'ALS INSPECTION',
      cliente: 'OCEAN PARTNERS',
      fechaPreparacion: '2025-04-24',
      referenciaAls: this.lote.Observacion,
      pesoNetoHumedo: this.miFormulario.get('pesoNetoHumedo')?.value,
      humedad: parseFloat(this.miFormulario.get('humedad')?.value).toFixed(4),
      pesoNetoSeco: this.miFormulario.get('pesoNetoSeco')?.value,
      responsable: 'Carlos Soto',
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
    setSimple(`A2`, `Num Lote: ${simpleForm.numLote}`);
    setSimple(`A3`, `Material: ${simpleForm.material}`);
    setSimple(`A4`, `Muestreado por: ${simpleForm.muestreado}`);
    setSimple(`A5`, `Cliente: ${simpleForm.cliente}`);
    setSimple(
      `A6`,
      `Fecha Preparación Muestra: ${simpleForm.fechaPreparacion}`
    );
    setSimple(`A7`, `Referencia ALS: ${this.lote.observacion}`);
    setSimple(`B2`, `Peso Neto Húmedo: ${simpleForm.pesoNetoHumedo}`);
    setSimple(`B3`, `% Humedad: ${simpleForm.humedad}`);
    setSimple(`B4`, `Peso Neto Seco: ${simpleForm.pesoNetoSeco}`);
    setSimple(`B5`, `Responsable: ${simpleForm.responsable}`);

    hojaSimple.addImage(imageId, {
      tl: { col: 2, row: 1 },
      ext: { width: 100, height: 100 },
    });

    hojaSimple.addImage(imageIdSimpleQR, {
      tl: { col: 2, row: 6 },
      ext: { width: 100, height: 100 },
    });
    aplicarFuenteTamanio10(hojaSimple);

    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `etiquetas_y_simple_${codQrBase}.xlsx`;
    link.click();

    // Guardar los datos en la base de datos. Se deben guardar los datos de cada formulario en la base de datos, para eso se debe hacer un post a la api de trazabilidad mecanica
    const apiUrl =
      'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';
      const dataToSend = {
        nLote: this.miFormulario.get('numLote')?.value|| this.lote[0].nLote, // Valor por defecto
        nSublote: this.miFormulario.get('numLote')?.value, // Valor por defecto
        idTransporte: '',
        nave: this.miFormulario.get('nave')?.value,
        bodega: this.miFormulario.get('bodega')?.value,
        material: this.miFormulario.get('material')?.value,
        muestreadoPor: this.miFormulario.get('muestreado')?.value,
        exportador: this.miFormulario.get('exportador')?.value,
        puertoDestino: this.miFormulario.get('puertoDes')?.value,
        contrato: this.miFormulario.get('contrato')?.value,
        cliente: this.miFormulario.get('cliente')?.value,
        cochilco: this.miFormulario.get('contratoCochilco')?.value,
        fechaEmbarque: this.formatDate(this.miFormulario.get('fEmbarque')?.value),
        DUS: this.miFormulario.get('dus')?.value?.trim() || 'No aplica',
        fechaDUS: this.miFormulario.get('fechaDus')?.value
        ? this.formatDate(this.miFormulario.get('fechaDus')!.value)
        : null,
        pesoNetoHumedo: this.miFormulario.get('pesoNetoHumedo')?.value,
        pesoNetoSeco: this.miFormulario.get('pesoNetoSeco')?.value,
        porcHumedad: this.miFormulario.get('humedad')?.value,
        responsable: this.miFormulario.get('responsable')?.value,
        observacion: 'Sin Observaciones',
        estado: 'En Preparación',
        fechaSobre: null,
      };

    // Enviar los datos a la API pero tantas veces como sobres se hayan creado. El nLote se mantiene y el nSubLote cambia segun el número de sobre
    for (let i = 0; i < cantidad; i++) {
      const dataToSendWithSubLote = {
        ...dataToSend,
        nSubLote: String(i + 1),
      };
      this.http.post(apiUrl, dataToSendWithSubLote).subscribe(
        (response) => {
          console.log('Datos enviados correctamente:', response);
        },
        (error) => {
          console.error('Error al enviar los datos:', error);
        }
      );
    }
  }

  cerrarDialogo() {
    this.dialogRef.close();
  }

  formatDate(date: Date | undefined | null): string {
    if (!date) {
      console.warn('formatDate recibió una fecha inválida:', date);
      return ''; // O podrías retornar una fecha por defecto, según lo que necesites
    }
  
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
}
