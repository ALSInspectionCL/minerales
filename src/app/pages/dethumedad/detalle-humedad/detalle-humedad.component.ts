import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';

//Crear intefrace para los datos del humedad

interface Humedad {
  id: number;
  nLote: string;
  observacion: string;
  nLata1: string;
  nLata2: string;
  pLata1: number;
  pLata2: number;
  pMaterial1: number;
  pMaterial2: number;
  pTotal1: number;
  pTotal2: number;
  horaIngresoHorno: string;
  horaSalidaHorno1: string;
  horaSalidaHorno2: string;
  horaSalidaHorno3: string;
  pSalidaHorno1Lata1: number;
  pSalidaHorno1Lata2: number;
  pSalidaHorno2Lata1: number;
  pSalidaHorno2Lata2: number;
  pSalidaHorno3Lata1: number;
  pSalidaHorno3Lata2: number;
  porcHumedad1: number;
  porcHumedad2: number;
  porcHumedadFinal: number;
}

@Component({
  selector: 'app-detalle-humedad',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    TablerIconsModule,
    MatCardModule,
    MatCard,
    MatCardModule,
    MatTable,
    MatFormField,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatIconModule,
  ],
  templateUrl: './detalle-humedad.component.html',
  styleUrl: './detalle-humedad.component.scss',
})
export class DetalleHumedadComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      idServicio: number;
      idSolicitud: number;
      nLote: string;
      numero: number;
    }
  ) {}
  campoSeleccionado: string | null = null;
  pesoLata1 = document.getElementById('pesoLata1');
  pesoLata2 = document.getElementById('pesoLata2');
  pesoTotal1 = document.getElementById('pesoTotal1');
  pesoTotal2 = document.getElementById('pesoTotal2');
  pesoMaterial1 = document.getElementById('pesoMaterial1');
  pesoMaterial2 = document.getElementById('pesoMaterial2');
  dataSource: any = [];
  dataDefault: any = {
    id: 0,
    nLote: '0',
    observacion: 'lote sin observación',
    nLata1: '1',
    nLata2: '2',
    pLata1: 0,
    pLata2: 0,
    pMaterial1: 0,
    pMaterial2: 0,
    pTotal1: 0,
    pTotal2: 0,
    horaIngresoHorno: '00:00',
    horaSalidaHorno1: '00:00',
    horaSalidaHorno2: '00:00',
    horaSalidaHorno3: '00:00',
    pSalidaHorno1Lata1: 0,
    pSalidaHorno1Lata2: 0,
    pSalidaHorno2Lata1: 0,
    pSalidaHorno2Lata2: 0,
    pSalidaHorno3Lata1: 0,
    pSalidaHorno3Lata2: 0,
    porcHumedad1: 0,
    porcHumedad2: 0,
    porcHumedadFinal: 0,
  };

  seleccionarCampo(id: string) {
    this.campoSeleccionado = id;
  }
  botonPesar = document.getElementById('boton-pesar');
  ngOnInit() {
    this.dataSource = [this.dataDefault];
    console.log(this.dataSource);
    console.log(this.data);
    this.pesar();
  }

  displayedColumns: string[] = [
    'nLata',
    'pesoLata',
    'pesoTotal',
    'pesoMaterial',
    'horaIngresoHorno',
    'horaSalidaHorno1',
    'pSalidaHorno1',
    'horaSalidaHorno2',
    'pSalidaHorno2',
    'horaSalidaHorno3',
    'pSalidaHorno3',
    'porcHumedad',
    'porcHumedadFinal',
  ];

  calcularPesoMaterial(pesoLata: any, pesoTotal: any) {
    const lataVal = parseFloat(pesoLata);
    const totalVal = parseFloat(pesoTotal);
    if (isNaN(lataVal) || isNaN(totalVal)) {
      return '';
    }
    const diferencia = totalVal - lataVal;
    return diferencia >= 0 ? diferencia.toFixed(2) : '';
  }
  actualizarPesoMaterial() {
    // this.pesoMaterial1.value = calcularPesoMaterial(pesoLata1, pesoTotal1);
    // pesoMaterial2.value = calcularPesoMaterial(pesoLata2, pesoTotal2);
  }

  pesar() {
    // const SerialPort = require('serialport');
    // // Aquí puedes configurar la conexión al puerto serie de la báscula digital
    // // Configuración de la conexión
    // const port = new SerialPort('COM3', { // Reemplaza COM3 con el puerto USB-RS232 que esté utilizando
    //   baudRate: 9600,
    //   dataBits: 8,
    //   parity: 'none',
    //   stopBits: 1,
    //   flowControl: false
    // });
    // function leerValorBalanza() {
    //   port.write('P'); // Envía el comando para leer el valor de la balanza
    //   port.on('data', (data:any) => {
    //     const valor = data.toString().trim(); // Lee el valor de la balanza
    //     console.log(`Valor de la balanza: ${valor}`);
    //   });
    // }
    // port.open((err:any) => {
    //   if (err) {
    //     console.error('Error al abrir la conexión:', err);
    //   } else {
    //     console.log('Conexión establecida');
    //     leerValorBalanza();
    //   }
    // });

    let campoPesoSeleccionado: HTMLInputElement | null = null;
    // Agrega un evento de foco a los campos de texto para almacenar el campo seleccionado
    document.querySelectorAll('input[type="text"]').forEach((campo) => {
      campo.addEventListener('focus', () => {
        campoPesoSeleccionado = campo as HTMLInputElement;
      });
    });
    const botonPesar = document.getElementById('boton-pesar');
    if (botonPesar) {
      botonPesar.addEventListener('click', () => {
        // Simulación del valor de la báscula
        //const peso = leerValorBalanzaDigital();
        const peso = '10.5'; // Reemplaza esto con el valor real de la báscula
        // Si se ha seleccionado un campo de peso, llena el valor
        if (this.campoSeleccionado) {
          const campo = document.getElementById(
            this.campoSeleccionado
          ) as HTMLInputElement;
          campo.value = peso;
        } else {
          console.log('No se ha seleccionado un campo de peso');
        }
      });
    } else {
      console.error('No se encontró el botón con el ID "boton-pesar"');
    }
  }

  leerValorBalanzaDigital(): number {
  // Implementa la lógica para leer el valor de la balanza digital
  // Por ejemplo, utilizando un controlador o una biblioteca para interactuar con la balanza
  // Devuelve el valor leído como un número
  return 0;
}

  // pesoLata1.addEventListener('input', actualizarPesoMaterial);
  // pesoTotal1.addEventListener('input', actualizarPesoMaterial);
  // pesoLata2.addEventListener('input', actualizarPesoMaterial);
  // pesoTotal2.addEventListener('input', actualizarPesoMaterial);
}
