import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
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
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import { RolService } from 'src/app/services/rol.service';

//Crear intefrace para los datos del humedad

interface Humedad {
  id?: number;
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
  humedadForm: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      idServicio: number;
      idSolicitud: number;
      nLote: string;
      numero: number;
    },
    private http: HttpClient,
    private rolService: RolService
  ) {
    // Inicializar el formulario o cualquier otra lógica necesaria
    this.humedadForm = new FormGroup({
      id: new FormControl(0), // Este campo se actualizará después de verificar si el nLote existe
      nLote: new FormControl(this.data.nLote),
      observacion: new FormControl('Iniciado'),
      nLata1: new FormControl(0),
      nLata2: new FormControl(0),
      pLata1: new FormControl(0),
      pLata2: new FormControl(0),
      pMaterial1: new FormControl(),
      pMaterial2: new FormControl(),
      pTotal1: new FormControl(0),
      pTotal2: new FormControl(0),
      horaIngresoHorno: new FormControl('00:00'),
      horaSalidaHorno1: new FormControl('00:00'),
      horaSalidaHorno2: new FormControl('00:00'),
      horaSalidaHorno3: new FormControl('00:00'),
      pSalidaHorno1Lata1: new FormControl(0),
      pSalidaHorno1Lata2: new FormControl(0),
      pSalidaHorno2Lata1: new FormControl(0),
      pSalidaHorno2Lata2: new FormControl(0),
      pSalidaHorno3Lata1: new FormControl(0),
      pSalidaHorno3Lata2: new FormControl(0),
      porcHumedad1: new FormControl(0),
      porcHumedad2: new FormControl(0),
      porcHumedadFinal: new FormControl(0),
    });
  }
  campoSeleccionado: string | null = null;
  nLote = '';
  cliente = false;
  pesoLata1 = document.getElementById('pesoLata1');
  pesoLata2 = document.getElementById('pesoLata2');
  pesoTotal1 = document.getElementById('pesoTotal1');
  pesoTotal2 = document.getElementById('pesoTotal2');
  pesoMaterial1 = document.getElementById('pesoMaterial1');
  pesoMaterial2 = document.getElementById('pesoMaterial2');
  dataSource: any = [];
  encontrado: any = null;
  dataDefault: Humedad = {
    nLote: '0',
    observacion: 'Iniciado',
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
    this.nLote = this.data.nLote;
    this.pesar();
    // Verificar si existe en la API
    this.cargarHumedad();
        this.rolService.hasRole(localStorage.getItem('email') || '', 'Cliente').subscribe((hasRole) => {
      if (hasRole) {
        this.cliente = true;
        console.log('El usuario tiene el rol de cliente');
      } else {
        this.cliente = false;
        console.log('El usuario no tiene el rol de cliente');
      }
    });
  }

  cargarHumedad() {
    // Buscar en la API si existe el nLote
    // Si existe, cargar los datos en dataSource
    // Si no existe, dejar dataSource con los valores por defecto
    this.http
      .get<Humedad[]>(
        `https://control.als-inspection.cl/api_min/api/humedades/`
      )
      .subscribe(
        (data) => {
          console.log('Datos obtenidos de la API:', data);
          if (data && data.length > 0) {
            //Ordenar los datos por id de forma descendente
            data.sort((a, b) => (b.id || 0) - (a.id || 0));
            // Buscar el último nLote que coincida con el nLote proporcionado
            const encontrado = data.find((item) => item.nLote === this.nLote);
            if (encontrado) {
              console.log(
                'Datos encontrados para el nLote:',
                this.nLote,
                encontrado
              );
              // this.cargarCamposConDatos(encontrado);
              this.humedadForm.patchValue(encontrado);
              this.dataSource = [encontrado];
              this.actualizarPesoMaterial();
              this.CalcularResultado();
              // Actualizar los campos de pesoMaterial1 y pesoMaterial2
            } else {
              console.log('No se encontraron datos para el nLote:', this.nLote);
              this.dataSource = [this.dataDefault];
            }
          } else {
            console.log('No se encontraron datos para el nLote:', this.nLote);
            this.dataSource = [this.dataDefault];
          }
        },
        (error) => {
          console.error('Error al cargar los datos de humedad:', error);
          this.dataSource = [this.dataDefault];
        }
      );
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
    const pesoLata1 = this.humedadForm.value.pLata1;
    const pesoTotal1 = this.humedadForm.value.pTotal1;
    const pesoMaterial1 = this.calcularPesoMaterial(pesoLata1, pesoTotal1);
    if (pesoMaterial1 !== '') {
      this.humedadForm.patchValue({
        pMaterial1: parseFloat(pesoMaterial1),
      });
    } else {
      this.humedadForm.patchValue({
        pMaterial1: '',
      });
    }
    // Actualizar el pesoMaterial2
    const pesoLata2 = this.humedadForm.value.pLata2;
    const pesoTotal2 = this.humedadForm.value.pTotal2;
    const pesoMaterial2 = this.calcularPesoMaterial(pesoLata2, pesoTotal2);
    if (pesoMaterial2 !== '') {
      this.humedadForm.patchValue({
        pMaterial2: parseFloat(pesoMaterial2),
      });
    } else {
      this.humedadForm.patchValue({
        pMaterial2: '',
      });
    }
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

  guardarDatos() {
    // Verificar si el nLote ya existe en la API, si no existe, se crea un nuevo registro. Si existe, se actualiza el registro para el ultimo nLote.
    this.actualizarPesoMaterial();
    this.CalcularResultado();
    const nLote = this.nLote;
    const url = `https://control.als-inspection.cl/api_min/api/humedades/`;
    this.http.get<Humedad[]>(url).subscribe(
      (data) => {
        const existe = data.some((item) => item.nLote === nLote);
        if (existe) {
          // Si existe, se actualiza el registro
          this.actualizarPesoMaterial();
          this.actualizarPorcentajeHumedad();
          this.actualizarDatos();
        } else {
          // Si no existe, se crea un nuevo registro
          this.crearDatos();
        }
      },
      (error) => {
        console.error('Error al verificar si el nLote existe:', error);
        Notiflix.Notify.failure('Error al verificar si el nLote existe');
      }
    );
  }

  crearDatos() {
    console.log('Datos guardados:', this.humedadForm.value);
    const datosHumedad: Humedad = {
      //Dejar que django asigne el id
      nLote: this.humedadForm.value.nLote,
      observacion: this.humedadForm.value.observacion,
      nLata1: this.humedadForm.value.nLata1,
      nLata2: this.humedadForm.value.nLata2,
      pLata1: parseFloat(this.humedadForm.value.pLata1),
      pLata2: parseFloat(this.humedadForm.value.pLata2),
      pMaterial1: parseFloat(this.humedadForm.value.pMaterial1),
      pMaterial2: parseFloat(this.humedadForm.value.pMaterial2),
      pTotal1: parseFloat(this.humedadForm.value.pTotal1),
      pTotal2: parseFloat(this.humedadForm.value.pTotal2),
      horaIngresoHorno: this.humedadForm.value.horaIngresoHorno,
      horaSalidaHorno1: this.humedadForm.value.horaSalidaHorno1,
      horaSalidaHorno2: this.humedadForm.value.horaSalidaHorno2,
      horaSalidaHorno3: this.humedadForm.value.horaSalidaHorno3,
      pSalidaHorno1Lata1: parseFloat(this.humedadForm.value.pSalidaHorno1Lata1),
      pSalidaHorno1Lata2: parseFloat(this.humedadForm.value.pSalidaHorno1Lata2),
      pSalidaHorno2Lata1: parseFloat(this.humedadForm.value.pSalidaHorno2Lata1),
      pSalidaHorno2Lata2: parseFloat(this.humedadForm.value.pSalidaHorno2Lata2),
      pSalidaHorno3Lata1: parseFloat(this.humedadForm.value.pSalidaHorno3Lata1),
      pSalidaHorno3Lata2: parseFloat(this.humedadForm.value.pSalidaHorno3Lata2),
      porcHumedad1: parseFloat(this.humedadForm.value.porcHumedad1),
      porcHumedad2: parseFloat(this.humedadForm.value.porcHumedad2),
      porcHumedadFinal: parseFloat(this.humedadForm.value.porcHumedadFinal),
    };
    // Aquí se guardan los datos en la API
    this.http
      .post(
        'https://control.als-inspection.cl/api_min/api/humedades/',
        datosHumedad
      )
      .subscribe(
        (response) => {
          console.log('Datos guardados correctamente:', response);
          this.cargarDatos(); // Cargar los datos actualizados después de guardar
          this.actualizarTabla();
          this.CalcularResultado();
          Notiflix.Notify.success('Datos guardados correctamente');
        },
        (error) => {
          console.error('Error al guardar los datos:', error);
        }
      );
  }

  actualizarDatos() {
    console.log('Datos actualizados:', this.humedadForm.value);
    this.actualizarPesoMaterial();
    this.actualizarPorcentajeHumedad();
    this.CalcularResultado();
    const datosHumedad: Humedad = {
      id: this.humedadForm.value.id, // Este campo se actualizará después de verificar si el nLote existe
      nLote: this.humedadForm.value.nLote,
      observacion: this.humedadForm.value.observacion,
      nLata1: this.humedadForm.value.nLata1,
      nLata2: this.humedadForm.value.nLata2,
      pLata1: parseFloat(this.humedadForm.value.pLata1),
      pLata2: parseFloat(this.humedadForm.value.pLata2),
      pMaterial1: parseFloat(this.humedadForm.value.pMaterial1),
      pMaterial2: parseFloat(this.humedadForm.value.pMaterial2),
      pTotal1: parseFloat(this.humedadForm.value.pTotal1),
      pTotal2: parseFloat(this.humedadForm.value.pTotal2),
      horaIngresoHorno: this.humedadForm.value.horaIngresoHorno,
      horaSalidaHorno1: this.humedadForm.value.horaSalidaHorno1,
      horaSalidaHorno2: this.humedadForm.value.horaSalidaHorno2,
      horaSalidaHorno3: this.humedadForm.value.horaSalidaHorno3,
      pSalidaHorno1Lata1: parseFloat(this.humedadForm.value.pSalidaHorno1Lata1),
      pSalidaHorno1Lata2: parseFloat(this.humedadForm.value.pSalidaHorno1Lata2),
      pSalidaHorno2Lata1: parseFloat(this.humedadForm.value.pSalidaHorno2Lata1),
      pSalidaHorno2Lata2: parseFloat(this.humedadForm.value.pSalidaHorno2Lata2),
      pSalidaHorno3Lata1: parseFloat(this.humedadForm.value.pSalidaHorno3Lata1),
      pSalidaHorno3Lata2: parseFloat(this.humedadForm.value.pSalidaHorno3Lata2),
      porcHumedad1: parseFloat(this.humedadForm.value.porcHumedad1),
      porcHumedad2: parseFloat(this.humedadForm.value.porcHumedad2),
      porcHumedadFinal: parseFloat(this.humedadForm.value.porcHumedadFinal),
    };
    // Aquí se actualizan los datos en la API
    // Primero se busca el id del nLote
    const nLote = this.humedadForm.value.nLote;
    if (!datosHumedad.id) {
      console.error('El id no está definido en los datos de humedad');
      Notiflix.Notify.failure('Error de ID');
      return;
    }
    const url = `https://control.als-inspection.cl/api_min/api/humedades/${datosHumedad.id}/`;
    this.http.put<Humedad[]>(url, datosHumedad).subscribe(
      (response) => {
        Notiflix.Notify.success('Datos actualizados correctamente');
        console.log('Datos actualizados correctamente:', response);
      },
      (error) => {
        console.error('Error al verificar si el nLote existe:', error);
      }
    );
  }

  cargarDatos() {
    // Se cargan los datos del formulario desde la API
    this.http
      .get<Humedad>(`https://control.als-inspection.cl/api_min/api/humedades/`)
      .subscribe(
        (response) => {
          this.humedadForm.patchValue(response);
          this.CalcularResultado();
          console.log('Datos cargados correctamente:', response);
        },
        (error) => {
          console.error('Error al cargar los datos:', error);
        }
      );
  }

  actualizarTabla() {
    // Se actualiza dataSource con los datos del formulario para que se actualice la tabla
    this.actualizarPesoMaterial();
    this.actualizarPorcentajeHumedad();
    this.actualizarHoras();
    this.dataSource = [this.humedadForm.value];
    console.log(
      'Tabla actualizada con los datos del formulario:',
      this.dataSource
    );
    Notiflix.Notify.success('Tabla actualizada correctamente');
  }
  actualizarPorcentajeHumedad() {
    // Calcular el porcentaje de humedad
    const pLata1 = this.humedadForm.value.pLata1;
    const pLata2 = this.humedadForm.value.pLata2;
    const pTotal1 = this.humedadForm.value.pTotal1;
    const pTotal2 = this.humedadForm.value.pTotal2;
    const pMaterial1 = pTotal1 - pLata1;
    const pMaterial2 = pTotal2 - pLata2;
    const pSalidaHorno1Lata1 = this.humedadForm.value.pSalidaHorno1Lata1;
    const pSalidaHorno1Lata2 = this.humedadForm.value.pSalidaHorno1Lata2;
    const pSalidaHorno2Lata1 = this.humedadForm.value.pSalidaHorno2Lata1;
    const pSalidaHorno2Lata2 = this.humedadForm.value.pSalidaHorno2Lata2;
    const pSalidaHorno3Lata1 = this.humedadForm.value.pSalidaHorno3Lata1;
    const pSalidaHorno3Lata2 = this.humedadForm.value.pSalidaHorno3Lata2;
    //El porcentaje de humedad se calcula como: ((pMaterialx - pSalidaHornoxLatay) / pMaterialx) * 100)
    //Todos los porcentajes se guardan en el formulario y además solo se guardan los primeros 5 digitos de la parte decimal
    console.log('Calculando porcentaje de humedad...');
    console.log('pMaterial1:', pMaterial1);
    console.log('pMaterial2:', pMaterial2);
    if (pMaterial1 <= 0 || pMaterial2 <= 0) {
      return;
    }
    if (pSalidaHorno1Lata1 <= 0 && pSalidaHorno1Lata2 <= 0) {
      return;
    } else {
      const porcHumedad1 =
        ((pMaterial1 - (pSalidaHorno1Lata1 - pLata1)) / pMaterial1) * 100;
      console.log('porcHumedad1:', porcHumedad1);
      this.humedadForm.patchValue({
        porcHumedad1: parseFloat(porcHumedad1.toFixed(5)),
      });
      this.dataSource[0].porcHumedad1 = parseFloat(porcHumedad1.toFixed(5));
      const porcHumedad2 =
        ((pMaterial2 - (pSalidaHorno1Lata2 - pLata2)) / pMaterial2) * 100;
      console.log('porcHumedad2:', porcHumedad2);
      this.humedadForm.patchValue({
        porcHumedad2: parseFloat(porcHumedad2.toFixed(5)),
      });
      this.dataSource[0].porcHumedad2 = parseFloat(porcHumedad2.toFixed(5));
      const porcHumedadFinal = (porcHumedad1 + porcHumedad2) / 2;
      console.log('porcHumedadFinal:', porcHumedadFinal);
      this.humedadForm.patchValue({
        porcHumedadFinal: parseFloat(porcHumedadFinal.toFixed(5)),
      });
      this.dataSource[0].porcHumedadFinal = parseFloat(
        porcHumedadFinal.toFixed(5)
      );
    }
    if (pSalidaHorno2Lata1 <= 0 && pSalidaHorno2Lata2 <= 0) {
      return;
    } else {
      const porcHumedad1 =
        ((pMaterial1 - (pSalidaHorno2Lata1 - pLata1)) / pMaterial1) * 100;
      this.humedadForm.patchValue({
        porcHumedad1: parseFloat(porcHumedad1.toFixed(5)),
      });
      this.dataSource[0].porcHumedad1 = parseFloat(porcHumedad1.toFixed(5));
      const porcHumedad2 =
        ((pMaterial2 - (pSalidaHorno2Lata2 - pLata2)) / pMaterial2) * 100;
      this.humedadForm.patchValue({
        porcHumedad2: parseFloat(porcHumedad2.toFixed(5)),
      });
      this.dataSource[0].porcHumedad2 = parseFloat(porcHumedad2.toFixed(5));
      const porcHumedadFinal = (porcHumedad1 + porcHumedad2) / 2;
      this.humedadForm.patchValue({
        porcHumedadFinal: parseFloat(porcHumedadFinal.toFixed(5)),
      });
      this.dataSource[0].porcHumedadFinal = parseFloat(
        porcHumedadFinal.toFixed(5)
      );
    }
    if (pSalidaHorno3Lata1 <= 0 && pSalidaHorno3Lata2 <= 0) {
      return;
    } else {
      const porcHumedad1 =
        ((pMaterial1 - (pSalidaHorno3Lata1 - pLata1)) / pMaterial1) * 100;
      this.humedadForm.patchValue({
        porcHumedad1: parseFloat(porcHumedad1.toFixed(5)),
      });
      this.dataSource[0].porcHumedad1 = parseFloat(porcHumedad1.toFixed(5));
      const porcHumedad2 =
        ((pMaterial2 - (pSalidaHorno3Lata2 - pLata2)) / pMaterial2) * 100;
      this.humedadForm.patchValue({
        porcHumedad2: parseFloat(porcHumedad2.toFixed(5)),
      });
      const porcHumedadFinal = (porcHumedad1 + porcHumedad2) / 2;
      this.humedadForm.patchValue({
        porcHumedadFinal: parseFloat(porcHumedadFinal.toFixed(5)),
      });
      this.dataSource[0].porcHumedadFinal = parseFloat(
        porcHumedadFinal.toFixed(5)
      );
    }
  }

  actualizarHoras() {
    // Actualizar las horas de ingreso y salida del horno
    const horaIngresoHorno = this.humedadForm.value.horaIngresoHorno;
    const horaSalidaHorno1 = this.humedadForm.value.horaSalidaHorno1;
    const horaSalidaHorno2 = this.humedadForm.value.horaSalidaHorno2;
    const horaSalidaHorno3 = this.humedadForm.value.horaSalidaHorno3;

    // Aquí puedes agregar la lógica para actualizar las horas en la API si es necesario
    console.log('Hora de ingreso al horno:', horaIngresoHorno);
    console.log('Hora de salida del horno 1:', horaSalidaHorno1);
    console.log('Hora de salida del horno 2:', horaSalidaHorno2);
    console.log('Hora de salida del horno 3:', horaSalidaHorno3);

    this.dataSource[0].horaIngresoHorno = horaIngresoHorno;
    this.dataSource[0].horaSalidaHorno1 = horaSalidaHorno1;
    this.dataSource[0].horaSalidaHorno2 = horaSalidaHorno2;
    this.dataSource[0].horaSalidaHorno3 = horaSalidaHorno3;
  }

  displayedColumnsResultados: string[] = [
    'condicion',
    'resultado',
    'observacion',
  ];
  dataSourceResultados = [
    {
      condicion: 'Variación de peso 0.06 kg',
      resultado: '',
      observacion: '',
    },
    {
      condicion: 'Variación porcentaje 0.2%',
      resultado: '',
      observacion: '',
    },
    {
      condicion: 'Conclusión',
      resultado: '',
      observacion: '',
    },
  ];

  CalcularResultado() {
    // Tenemos 3 condiciones para calcular el resultado:
    // 1. Si la variación de peso es menor a 0.06, el resultado es "Aprobado"
    // 2. Si la variación de porcentaje es menor a 0.2%, el resultado es "Aprobado"
    // 3. Si la conclusión es "Aprobado", el resultado es "Aprobado"

    // Almacenar los pSalidaHorno1Lata1, pSalidaHorno1Lata2, pSalidaHorno2Lata1, pSalidaHorno2Lata2, pSalidaHorno3Lata1, pSalidaHorno3Lata2
    const pSalidaHorno1Lata1 = this.humedadForm.value.pSalidaHorno1Lata1;
    const pSalidaHorno1Lata2 = this.humedadForm.value.pSalidaHorno1Lata2;
    const pSalidaHorno2Lata1 = this.humedadForm.value.pSalidaHorno2Lata1;
    const pSalidaHorno2Lata2 = this.humedadForm.value.pSalidaHorno2Lata2;
    const pSalidaHorno3Lata1 = this.humedadForm.value.pSalidaHorno3Lata1;
    const pSalidaHorno3Lata2 = this.humedadForm.value.pSalidaHorno3Lata2;

    // Calcular la variación de peso y porcentaje
    if (pSalidaHorno1Lata1 <= 0 || pSalidaHorno1Lata2 <= 0) {
      this.dataSourceResultados[0].resultado = 'Pendiente';
      this.dataSourceResultados[0].observacion =
        'No se han registrado datos de salida del horno';
      this.dataSourceResultados[1].resultado = 'Pendiente';
      this.dataSourceResultados[1].observacion =
        'No se han registrado datos de salida del horno';
      this.dataSourceResultados[2].resultado = 'Pendiente';
      this.dataSourceResultados[2].observacion =
        'No se han registrado datos de salida del horno';
      this.dataSourceResultados = [...this.dataSourceResultados];
    } else if (pSalidaHorno2Lata1 <= 0 || pSalidaHorno2Lata2 <= 0) {
      this.dataSourceResultados[0].resultado = 'Pendiente';
      this.dataSourceResultados[0].observacion =
        'No se han registrado datos de salida del horno';
      this.dataSourceResultados[1].resultado = 'Pendiente';
      this.dataSourceResultados[1].observacion =
        'No se han registrado datos de salida del horno';
      this.dataSourceResultados[2].resultado = 'Pendiente';
      this.dataSourceResultados[2].observacion =
        'No se han registrado datos de salida del horno';
      this.dataSourceResultados = [...this.dataSourceResultados];
    } else if (
      pSalidaHorno1Lata1 > 0 &&
      pSalidaHorno1Lata2 > 0 &&
      pSalidaHorno2Lata1 > 0 &&
      pSalidaHorno2Lata2 > 0 &&
      pSalidaHorno3Lata1 <= 0 &&
      pSalidaHorno3Lata2 <= 0
    ) {
      // Calcular la variación de peso
      const variacionPeso1 = Math.abs(pSalidaHorno1Lata1 - pSalidaHorno2Lata1);
      const variacionPeso2 = Math.abs(pSalidaHorno1Lata2 - pSalidaHorno2Lata2);
      const variacionPesoPromedio = (variacionPeso1 + variacionPeso2) / 2;

      // Calcular el porcentaje de humedad
      const pLata1 = this.humedadForm.value.pLata1;
      const pLata2 = this.humedadForm.value.pLata2;
      const pMaterial1 = this.humedadForm.value.pMaterial1;
      const pMaterial2 = this.humedadForm.value.pMaterial2;
      const porcHumedadInicial1 =
        ((pMaterial1 - (pSalidaHorno1Lata1 - pLata1)) / pMaterial1) * 100;
      const porcHumedadInicial2 =
        ((pMaterial2 - (pSalidaHorno1Lata2 - pLata2)) / pMaterial2) * 100;
      const porcHumedadFinal1 =
        ((pMaterial1 - (pSalidaHorno2Lata1 - pLata1)) / pMaterial1) * 100;
      const porcHumedadFinal2 =
        ((pMaterial2 - (pSalidaHorno2Lata2 - pLata2)) / pMaterial2) * 100;

      //LA VARIACION ES ENTRE EL PORCENTAJE DE HUMEDAD DE LA LATA 1 Y DE LA LATA 2, NO DE LA HUMEDAD INICIAL Y LA FINAL.
      //LA VARIACION DE PESOS ES ENTRE LOS RESULTADOS DE HORNO 1 Y HORNO 2. SI ESA VARIACION ES DE MÁS DE 0,6 G, NO CUMPLE EL CRITERIO 
      
      const variacionPorcentaje1 = Math.abs(
        porcHumedadFinal1 - porcHumedadInicial1
      );
      const variacionPorcentaje2 = Math.abs(
        porcHumedadFinal2 - porcHumedadInicial2
      );
      const variacionPorcentajePromedio =
        (variacionPorcentaje1 + variacionPorcentaje2) / 2;

      // Si la condición se cumple, condicionx es 'Aprobado', si no, es 'Rechazado';
      const condicion1 = variacionPeso1 <= 60 && variacionPeso2 <= 60; // 0.06 kg = 60 g
      if (condicion1) {
        this.dataSourceResultados[0].resultado = 'Aprobado';
        this.dataSourceResultados[0].observacion = `La variación promedio de los pesos es ${variacionPesoPromedio.toFixed(
          2
        )} g, lo que está dentro del límite permitido de 0.06 kg.`;
      } else {
        this.dataSourceResultados[0].resultado = 'Rechazado';
        this.dataSourceResultados[0].observacion = `Una variación de peso (o ambas) exceden el límite permitido de 0.06 kg.`;
      }
      const condicion2 =
        variacionPorcentaje1 < 0.2 && variacionPorcentaje2 < 0.2; // 0.2% = 0.002
      if (condicion2) {
        this.dataSourceResultados[1].resultado = 'Aprobado';
        this.dataSourceResultados[1].observacion = `La variación porcentual promedio es ${variacionPorcentajePromedio.toFixed(
          2
        )}%, lo que está dentro del límite permitido de 0.2%.`;
      } else {
        this.dataSourceResultados[1].resultado = 'Rechazado';
        this.dataSourceResultados[1].observacion = `La variación porcentual excede el límite permitido de 0.2%.`;
      }
      if (condicion1 && condicion2) {
        this.dataSourceResultados[2].resultado = 'Aprobado';
        this.dataSourceResultados[2].observacion =
          'Todas las condiciones se cumplen, por lo tanto, el resultado es Aprobado.';
      } else {
        this.dataSourceResultados[2].resultado = 'Rechazado';
        this.dataSourceResultados[2].observacion =
          'Algunas condiciones no se cumplen, por lo tanto, el resultado es Rechazado.';
      }
    } else if (
      pSalidaHorno1Lata1 > 0 &&
      pSalidaHorno1Lata2 > 0 &&
      pSalidaHorno2Lata1 > 0 &&
      pSalidaHorno2Lata2 > 0 &&
      pSalidaHorno3Lata1 > 0 &&
      pSalidaHorno3Lata2 > 0
    ) {
      //Comparar solo los datos de salida del horno 2 y 3
      // Calcular la variación de peso
      const variacionPeso1 = Math.abs(pSalidaHorno3Lata1 - pSalidaHorno2Lata1);
      const variacionPeso2 = Math.abs(pSalidaHorno3Lata2 - pSalidaHorno2Lata2);
      const variacionPesoPromedio = (variacionPeso1 + variacionPeso2) / 2;

      // Calcular el porcentaje de humedad
      const pLata1 = this.humedadForm.value.pLata1;
      const pLata2 = this.humedadForm.value.pLata2;
      const pMaterial1 = this.humedadForm.value.pMaterial1;
      const pMaterial2 = this.humedadForm.value.pMaterial2;
      const porcHumedadInicial1 =
        ((pMaterial1 - (pSalidaHorno3Lata1 - pLata1)) / pMaterial1) * 100;
      const porcHumedadInicial2 =
        ((pMaterial2 - (pSalidaHorno3Lata2 - pLata2)) / pMaterial2) * 100;
      const porcHumedadFinal1 =
        ((pMaterial1 - (pSalidaHorno2Lata1 - pLata1)) / pMaterial1) * 100;
      const porcHumedadFinal2 =
        ((pMaterial2 - (pSalidaHorno2Lata2 - pLata2)) / pMaterial2) * 100;

      const variacionPorcentaje1 = Math.abs(
        porcHumedadFinal1 - porcHumedadInicial1
      );
      const variacionPorcentaje2 = Math.abs(
        porcHumedadFinal2 - porcHumedadInicial2
      );
      const variacionPorcentajePromedio =
        (variacionPorcentaje1 + variacionPorcentaje2) / 2;

      // Si la condición se cumple, condicionx es 'Aprobado', si no, es 'Rechazado';
      const condicion1 = variacionPeso1 <= 60 && variacionPeso2 <= 60; // 0.06 kg = 60 g
      if (condicion1) {
        this.dataSourceResultados[0].resultado = 'Aprobado';
        this.dataSourceResultados[0].observacion = `La variación promedio de los pesos es ${variacionPesoPromedio.toFixed(
          2
        )} g, lo que está dentro del límite permitido de 0.06 kg.`;
      } else {
        this.dataSourceResultados[0].resultado = 'Rechazado';
        this.dataSourceResultados[0].observacion = `Una variación de peso (o ambas) exceden el límite permitido de 0.06 kg.`;
      }
      const condicion2 =
        variacionPorcentaje1 < 0.2 && variacionPorcentaje2 < 0.2; // 0.2% = 0.002
      if (condicion2) {
        this.dataSourceResultados[1].resultado = 'Aprobado';
        this.dataSourceResultados[1].observacion = `La variación porcentual promedio es ${variacionPorcentajePromedio.toFixed(
          2
        )}%, lo que está dentro del límite permitido de 0.2%.`;
      } else {
        this.dataSourceResultados[1].resultado = 'Rechazado';
        this.dataSourceResultados[1].observacion = `La variación porcentual excede el límite permitido de 0.2%.`;
      }
      if (condicion1 && condicion2) {
        this.dataSourceResultados[2].resultado = 'Aprobado';
        this.dataSourceResultados[2].observacion =
          'Todas las condiciones se cumplen, por lo tanto, el resultado es Aprobado.';
      } else {
        this.dataSourceResultados[2].resultado = 'Rechazado';
        this.dataSourceResultados[2].observacion =
          'Algunas condiciones no se cumplen, por lo tanto, el resultado es Rechazado.';
      }
    }

    // const variacionPeso = Math.abs(
    //   this.humedadForm.value.pTotal1 - this.humedadForm.value.pTotal2
    // );
    // const variacionPorcentaje = Math.abs(
    //   this.humedadForm.value.porcHumedad1 - this.humedadForm.value.porcHumedad2
    // );
    // // Si la condición se cumple, condicionx es 'Aprobado', si no, es 'Rechazado';
    // const condicion1 = variacionPeso < 0.06;
    // if (condicion1) {
    //   this.dataSourceResultados[0].resultado = 'Aprobado';
    //   this.dataSourceResultados[0].observacion = `La variación de peso es ${variacionPeso.toFixed(2)}, lo que está dentro del límite permitido de 0.06.`;
    //   } else {
    //     this.dataSourceResultados[0].resultado = 'Rechazado';
    //     this.dataSourceResultados[0].observacion = `La variación de peso es ${variacionPeso.toFixed(2)}, lo que excede el límite permitido de 0.06.`;
    // }
    // const condicion2 = variacionPorcentaje < 0.2;
    // if (condicion2) {
    //   this.dataSourceResultados[1].resultado = 'Aprobado';
    //   this.dataSourceResultados[1].observacion = `La variación porcentual es ${variacionPorcentaje.toFixed(2)}%, lo que está dentro del límite permitido de 0.2%.`;
    //   } else {
    //     this.dataSourceResultados[1].resultado = 'Rechazado';
    //     this.dataSourceResultados[1].observacion = `La variación porcentual es ${variacionPorcentaje.toFixed(2)}%, lo que excede el límite permitido de 0.2%.`;
    // }
    // // Aquí puedes agregar la lógica para calcular el resultado de la conclusión si es necesario
    // const condicion3 = condicion1 && condicion2;
    // if (condicion3) {
    //   this.dataSourceResultados[2].resultado = 'Aprobado';
    //   this.dataSourceResultados[2].observacion = 'Todas las condiciones se cumplen, por lo tanto, el resultado es Aprobado.';
    //   } else {
    //     this.dataSourceResultados[2].resultado = 'Rechazado';
    //     this.dataSourceResultados[2].observacion = 'Algunas condiciones no se cumplen, por lo tanto, el resultado es Rechazado.';
    // }
    // Actualizar la tabla de resultados
    this.dataSourceResultados = [...this.dataSourceResultados];
  }

  validateInputFormat(control: any) {
    const value = control.value;
    if (!value) return null;

    const isValid = /ST\,\+[0-9]+\,\d+\s*g$/i.test(value);
    return isValid ? null : { invalidFormat: true };
  }

  extractedValues: { [key: string]: string } = {};

  processInput(event: Event, fieldName: string) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    // Extraer el valor numérico
    const numericValue = this.extractNumericValue(value);
    this.extractedValues[fieldName] = numericValue || '';

    // Actualizar validación
    this.humedadForm.get(fieldName)?.updateValueAndValidity();
  }

  private extractNumericValue(input: string): string | null {
    if (!input) return null;

    const match = input.match(/\,([0]*)(\d+\,\d+)/);
    return match && match[2] ? match[2] : null;
  }
  // Método para formatear automáticamente
  formatInput(value: string, fieldName: string) {
    if (value && value.includes('ST,+')) return value;
    const numericValue = value.replace(/[^0-9,]/g, '');
    const paddedValue = numericValue.padStart(6, '0');
    this.humedadForm.get(fieldName)?.setValue(`ST,+${paddedValue}  g`);
    
    return
  }
}
