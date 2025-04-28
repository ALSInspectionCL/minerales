import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import QRCode from 'qrcode';
import * as ExcelJS from 'exceljs';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';


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
  styleUrl: './detalle-prep.component.scss'
})
export class DetallePrepComponent {
  formGroups: FormGroup[] = [];
  miFormulario: FormGroup;

  constructor(private _formBuilder: FormBuilder,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<DetallePrepComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      nLote: string;
      CantSobres: number;
    },
  ) {
    this.cargarLote(this.data.nLote);
    this.miFormulario = this.fb.group({
      nave: [''],
      bodega: [''],
      material: ['Concentrado de Cobre'],
      numLote: [this.data.nLote],
      muestreado: ['ALS INSPECTION'],
      exportador: ['Ocean Partners'],
      puertoDes: [''],
      contrato: [''],
      cliente: ['TO ORDER'],
      contratoCochilco: [''],
      fEmbarque: [''],
      referenciaAls: [''],
      dus: [''],
      fechaDus: [''],
      pesoNetoHumedo: [''],
      humedad: [''],
      pesoNetoSeco: [''],
      responsable: [''],
    });

  }

  ngOnInit() {
    
  }
  lote : any;

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
    console.log(this.data.CantSobres)
    console.log('--------------------------')
    console.log(formulariosGenerados)
  }

  // Función para rellenar los formularios con los datos del primer formulario
  rellenarCamposAutomáticos() {
    const primerFormulario = this.formGroups[0].value;

    this.formGroups.forEach((formGroup, index) => {
      if (index !== 0) {
        Object.keys(formGroup.controls).forEach((controlName) => {
          if (!formGroup.controls[controlName].value) {
            // Si el campo está vacío, lo rellenamos con el valor del primer formulario
            formGroup.controls[controlName].setValue(primerFormulario[controlName]);
          }
        });
      }
    });
  }

  finalizarProceso() {
    console.log(this.formGroups)
    // Rellenar los campos antes de finalizar el proceso
    this.rellenarCamposAutomáticos();
    console.log(this.formGroups)
    // Aquí puedes realizar cualquier otra lógica antes de finalizar
    this.generarCodigosQREnExcelUnificado()
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
      grupos.push(Array.from({ length: Math.min(camionesPorHoja, cantidad - i) }, (_, j) => i + j));
    }
  
    const imagePath = '/assets/images/logos/als_logo_1.png';
    const response = await fetch(imagePath);
    const imageBuffer = await response.arrayBuffer();
    const imageId = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
  
    const formulariosGenerados = this.generarFormulariosConEtiqueta();
  
    let hojaIndex = 1;
  
    for (const grupo of grupos) {
      const hoja = workbook.addWorksheet(`Página ${hojaIndex++}`);
      hoja.properties.defaultRowHeight = 20;
  
      for (let row = 1; row <= 50; row++) {
        for (let col = 1; col <= 4; col++) {
          hoja.getCell(row, col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
          };
        }
      }
  
      hoja.getColumn(1).width = 35;
      hoja.getColumn(2).width = 40;
      hoja.getColumn(3).width = 20;
  
      for (let i = 0; i < grupo.length; i++) {
        const codQrActual = `${codQrBase}_${(grupo[i] + 1).toString().padStart(2, '0')}`;
        const datosQR = { codQr: codQrActual };
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(datosQR), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        });
  
        const base64Image = qrDataUrl.split(',')[1];
        const binaryString = atob(base64Image);
        const bufferQR = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bufferQR[j] = binaryString.charCodeAt(j);
        }
  
        const imageIdQR = workbook.addImage({ buffer: bufferQR, extension: 'png' });
        const rowOffset = i * 17;
        const formulario = formulariosGenerados[grupo[i]];
  
        hoja.getCell(`A${2 + rowOffset}`).value = `Nave: ${formulario.nave}`;
        hoja.getCell(`A${3 + rowOffset}`).value = `Bodega: ${formulario.bodega}`;
        hoja.getCell(`A${4 + rowOffset}`).value = `Material: ${formulario.material}`;
        hoja.getCell(`A${5 + rowOffset}`).value = `Num Lote: ${formulario.numLote}`;
        hoja.getCell(`A${6 + rowOffset}`).value = `Muestreado: ${formulario.muestreado}`;
        hoja.getCell(`A${7 + rowOffset}`).value = `Exportador: ${formulario.exportador}`;
        hoja.getCell(`A${8 + rowOffset}`).value = `Puerto Des: ${formulario.puertoDes}`;
        hoja.getCell(`A${9 + rowOffset}`).value = `Contrato: ${formulario.contrato}`;
        hoja.getCell(`A${10 + rowOffset}`).value = `Cliente: ${formulario.cliente}`;
        hoja.getCell(`B${2 + rowOffset}`).value = `Contrato Cochilco: ${formulario.contratoCochilco}`;
        hoja.getCell(`B${3 + rowOffset}`).value = `Fecha Embarque: ${formulario.fEmbarque}`;
        hoja.getCell(`B${4 + rowOffset}`).value = `Referencia Als: ${formulario.referenciaAls}`;
        hoja.getCell(`B${5 + rowOffset}`).value = `Dus: ${formulario.dus}`;
        hoja.getCell(`B${6 + rowOffset}`).value = `Fecha Dus: ${formulario.fechaDus}`;
        hoja.getCell(`B${7 + rowOffset}`).value = `Peso Neto Húmedo: ${formulario.pesoNetoHumedo}`;
        hoja.getCell(`B${8 + rowOffset}`).value = `Humedad: ${formulario.humedad}`;
        hoja.getCell(`B${9 + rowOffset}`).value = `Peso Neto Seco: ${formulario.pesoNetoSeco}`;
        hoja.getCell(`B${10 + rowOffset}`).value = `Responsable: ${formulario.responsable}`;
        hoja.getCell(`C${6 + rowOffset}`).value = `N Sobre: ${formulario.etiqueta}`;
  
        hoja.getCell(`A${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };
        hoja.getCell(`B${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };
  
        hoja.addImage(imageIdQR, {
          tl: { col: 2, row: 6 + rowOffset },
          ext: { width: 80, height: 80 }
        });
  
        hoja.addImage(imageId, {
          tl: { col: 2, row: 0 + rowOffset },
          ext: { width: 100, height: 100 }
        });
      }
    }
  
    // Página adicional para etiqueta simple
    const hojaSimple = workbook.addWorksheet('Etiqueta Simple');
    hojaSimple.properties.defaultRowHeight = 20;
  
    for (let row = 1; row <= 36; row++) {
      for (let col = 1; col <= 8; col++) {
        hojaSimple.getCell(row, col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' }
        };
      }
    }
  
    hojaSimple.getColumn(1).width = 35;
    hojaSimple.getColumn(2).width = 40;
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
      localidad: this.lote.region,
    };
    
    const qrDataUrlSimple = await QRCode.toDataURL(JSON.stringify({ codQr: codQrBase }), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });
  
    const base64ImageSimple = qrDataUrlSimple.split(',')[1];
    const binarySimple = atob(base64ImageSimple);
    const bufferSimpleQR = new Uint8Array(binarySimple.length);
    for (let j = 0; j < binarySimple.length; j++) {
      bufferSimpleQR[j] = binarySimple.charCodeAt(j);
    }
  
    const imageIdSimpleQR = workbook.addImage({ buffer: bufferSimpleQR, extension: 'png' });
  
    const rowOffsetSimple = 0;
    const setSimple = (cell: any, text: any) => hojaSimple.getCell(cell).value = text;
    setSimple(`A2`, `Num Lote: ${simpleForm.numLote}`);
    setSimple(`A3`, `Material: ${simpleForm.material}`);
    setSimple(`A4`, `Muestreado por: ${simpleForm.muestreado}`);
    setSimple(`A5`, `Cliente: ${simpleForm.cliente}`);
    setSimple(`A6`, `Fecha Preparación Muestra: ${simpleForm.fechaPreparacion}`);
    setSimple(`A7`, `Referencia ALS: ${simpleForm.referenciaAls}`);
    setSimple(`B2`, `Peso Neto Húmedo: ${simpleForm.pesoNetoHumedo}`);
    setSimple(`B3`, `% Humedad: ${simpleForm.humedad}`);
    setSimple(`B4`, `Peso Neto Seco: ${simpleForm.pesoNetoSeco}`);
    setSimple(`B5`, `Responsable: ${simpleForm.responsable}`);
    setSimple(`B6`, `Localidad: ${simpleForm.localidad}`);
  
    hojaSimple.addImage(imageId, {
      tl: { col: 2, row: 1 },
      ext: { width: 100, height: 100 }
    });
  
    hojaSimple.addImage(imageIdSimpleQR, {
      tl: { col: 2, row: 6 },
      ext: { width: 100, height: 100 }
    });
  
    hojaSimple.pageSetup.printArea = 'A1:H100';
  
    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `etiquetas_y_simple_${codQrBase}.xlsx`;
    link.click();
  }

  cerrarDialogo() {
    this.dialogRef.close();
  }
  async crearEtiqueta() {
    // const apiUrl = `https://control.als-inspection.cl/api_min/api/lote-recepcion/${this.data.idLote}/`;

    // this.http.get<Lote>(apiUrl).subscribe((res) => {
    //   console.log('Respuesta completa desde la API:', res.nLote);
    //   console.log('Respuesta completa desde la API:', 'Cobre');
    //   console.log('Respuesta completa desde la API:', 'ALS');
    //   console.log('Respuesta completa desde la API:', 'OCEAN ');
    //   console.log('Respuesta completa desde la API:', 'trazabilidad');
    //   console.log('Respuesta completa desde la API:', res.observacion);
    //   console.log('Respuesta completa desde la API:', res.pesoNetoHumedo);
    //   console.log('Respuesta completa desde la API:', res.porcHumedad);
    //   console.log('Respuesta completa desde la API:', res.pesoNetoSeco);
    //   console.log('Respuesta completa desde la API:', 'responsable');
    //   console.log('Respuesta completa desde la API:', 'localidad');

    //   const cantidad = this.data.CantSobres;
    //   const codQrBase = this.data.numLote;

    //   if (!cantidad || !codQrBase) {
    //     Notiflix.Notify.failure('Completa todos los campos del formulario.');
    //     return;
    //   }

    //   const workbook = new ExcelJS.Workbook();
    //   const camionesPorHoja = 3;  // Cambié de 4 a 3 sobres por hoja
    //   const grupos = [];

    //   // Dividir la cantidad de sobres en grupos de 3
    //   for (let i = 0; i < cantidad; i += camionesPorHoja) {
    //     grupos.push(Array.from({ length: Math.min(camionesPorHoja, cantidad - i) }, (_, j) => i + j));
    //   }

    //   let hojaIndex = 1;

    //   const formulariosGenerados = this.generarFormulariosConEtiqueta();

    //   for (const grupo of grupos) {
    //     const hoja = workbook.addWorksheet(`Página ${hojaIndex}`);
    //     hoja.properties.defaultRowHeight = 20;

    //     // Fondo blanco global
    //     for (let row = 1; row <= 36; row++) {
    //       for (let col = 1; col <= 8; col++) {
    //         hoja.getCell(row, col).fill = {
    //           type: 'pattern',
    //           pattern: 'solid',
    //           fgColor: { argb: 'FFFFFFFF' }
    //         };
    //       }
    //     }

    //     // Cargar la imagen
    //     const imagePath = '/assets/images/logos/als_logo_1.png';
    //     const response = await fetch(imagePath);
    //     const imageBuffer = await response.arrayBuffer(); // Convertir a un buffer
    //     const imageId = workbook.addImage({
    //       buffer: imageBuffer,
    //       extension: 'png',
    //     });

    //     // Ajuste del tamaño de las columnas
    //     hoja.getColumn(1).width = 35; // Ajusta el ancho de la columna B para los datos concatenados
    //     hoja.getColumn(2).width = 40; // Ajusta el ancho de la columna B para los datos concatenados
    //     hoja.getColumn(3).width = 20; // Ajusta el ancho de la columna C DEL QR

    //     for (let i = 0; i < grupo.length; i++) {
    //       const codQrActual = `${codQrBase}_${(grupo[i] + 1).toString().padStart(2, '0')}`;

    //       // Crear objeto con los datos del formulario para el código QR
    //       const datosQR = {
    //         codQr: codQrActual,
    //       };

    //       // Generar imagen QR como base64
    //       const qrDataUrl = await QRCode.toDataURL(JSON.stringify(datosQR), {
    //         errorCorrectionLevel: 'H',
    //         type: 'image/png',
    //         margin: 1,
    //         color: { dark: '#000000', light: '#ffffff' }
    //       });

    //       // Convertir base64 a buffer
    //       const base64Image = qrDataUrl.split(',')[1];
    //       const binaryString = atob(base64Image);
    //       const bufferQR = new Uint8Array(binaryString.length);
    //       for (let j = 0; j < binaryString.length; j++) {
    //         bufferQR[j] = binaryString.charCodeAt(j);
    //       }

    //       const imageIdQR = workbook.addImage({
    //         buffer: bufferQR,
    //         extension: 'png',
    //       });

    //       // Ajustar rowOffset para empezar desde la fila 2
    //       const rowOffset = i * 12; // Inicia desde la fila 2

    //       const formulario = formulariosGenerados[grupo[i]];

    //       // Insertar los datos concatenados en la columna B
    //       hoja.getCell(`A${2 + rowOffset}`).value = `Nave: ${formulario.nave}`;
    //       hoja.getCell(`A${3 + rowOffset}`).value = `Bodega: ${formulario.bodega}`;
    //       hoja.getCell(`A${4 + rowOffset}`).value = `Material: ${formulario.material}`;
    //       hoja.getCell(`A${5 + rowOffset}`).value = `Num Lote: ${formulario.numLote}`;
    //       hoja.getCell(`A${6 + rowOffset}`).value = `Muestreado: ${formulario.muestreado}`;
    //       hoja.getCell(`A${7 + rowOffset}`).value = `Exportador: ${formulario.exportador}`;
    //       hoja.getCell(`A${8 + rowOffset}`).value = `Puerto Des: ${formulario.puertoDes}`;
    //       hoja.getCell(`A${9 + rowOffset}`).value = `Contrato: ${formulario.contrato}`;
    //       hoja.getCell(`A${10 + rowOffset}`).value = `Cliente: ${formulario.cliente}`;
    //       hoja.getCell(`B${2 + rowOffset}`).value = `Contrato Cochilco: ${formulario.contratoCochilco}`;
    //       hoja.getCell(`B${3 + rowOffset}`).value = `Fecha Embarque: ${formulario.fEmbarque}`;
    //       // Activar el ajuste de texto para que se vean las líneas dentro de la celda
    //       hoja.getCell(`A${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };
    //       hoja.getCell(`B${2 + rowOffset}`).alignment = { wrapText: true, vertical: 'top' };

    //       // Insertar imagen QR en la columna C
    //       hoja.addImage(imageIdQR, {
    //         tl: { col: 2, row: 6 + rowOffset },
    //         ext: { width: 100, height: 100 } // Ajusta el tamaño de la imagen QR
    //       });

    //       hoja.getCell(`C${6 + rowOffset}`).value = `N Sobre: ${formulario.etiqueta}`;

    //       // Insertar la imagen de logo en la columna B para cada camión (ajustado para que empiece en B2)
    //       hoja.addImage(imageId, {
    //         tl: { col: 2, row: 1 + rowOffset },  // Columna B (columna 2), fila 2 ajustada
    //         ext: { width: 100, height: 100 }     // Tamaño de la imagen
    //       });
    //     }

    //     hoja.pageSetup.printArea = 'A1:H100';

    //     hojaIndex++;
    //   }

    //   // Descargar el archivo Excel
    //   const buffer = await workbook.xlsx.writeBuffer();
    //   const blob = new Blob([buffer], {
    //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //   });

    //   const link = document.createElement('a');
    //   link.href = URL.createObjectURL(blob);
    //   link.download = `codigos_qr_${codQrBase}.xlsx`;
    //   link.click();


    // });

  }

}
