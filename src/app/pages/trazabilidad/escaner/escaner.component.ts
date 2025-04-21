import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Router } from 'express';
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';

interface Resultado {
  nLote: string;
  cliente: string;
  idTransporte: number;
  horaControl: string;
  fechaControl: string;
  horaLab: string | null;
  fechaLab: string | null;
  horaIngresoHorno: string | null;
  fechaIngresoHorno: string | null;
  horaSalidaHorno: string | null;
  fechaSalidaHorno: string | null;
  horaTestigoteca: string | null;
  fechaTestigoteca: string | null;
  estado: string;
}

@Component({
  selector: 'app-escaner',
  standalone: true,
  imports: [
    MatCardModule,
    TablerIconsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    ZXingScannerModule,
    MaterialModule,
  ],
  templateUrl: './escaner.component.html',
  styleUrl: './escaner.component.scss',
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
export class EscanerComponent {
  selectedFormats: BarcodeFormat[] = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.QR_CODE,
  ];
  torchEnabled = false;
  resultado: any;
  lugarDeApertura: string;
  trazabilidades: any; // Almacena las trazabilidades obtenidas de la API

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<EscanerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit() {
    //Buscar trazabilidades por nLote
    this.cargarTrazabilidades()
  }

  cargarTrazabilidades() {
    this.http.get('https://control.als-inspection.cl/api_min/api/trazabilidad/').subscribe((response) => {
      console.log('Respuesta del servicio:', response);
      this.trazabilidades = response;
      console.log('Trazabilidades:');
      console.log(this.trazabilidades);
     });
  }


  onScanSuccess(result: string) {
    this.resultado = result; // Guarda el resultado del escaneo
    const resultado: Resultado = JSON.parse(result); // Parsear el resultado escaneado
    console.log('Escaneado con éxito:', result);
    const nLote = resultado.nLote;
    //buscar estado en trazabilidades segund nLote
    const trazabilidad = this.trazabilidades.find((t: any) => t.nLote === nLote);
    const estado = trazabilidad.estado;
    // Aquí cerramos el diálogo y pasamos el resultado al diálogo principal
    this.dialogRef.close(result);
    // Aquí puedes agregar la lógica para enviar la información a otro componente o servicio
    // Agregar Notiflix confirm para verificar la información y avanzar a la siguiente etapa
    Notiflix.Confirm.show(
      'Actualizar Estado',
      'El lote ' +
        resultado.nLote +
        ' ha sido escaneado con éxito. Estado : ' +
        estado +
        '.',
      'Siguiente Etapa',
      'Cancelar',
      () => {
        console.log('Continuar con la información escaneada');
        this.siguienteEtapa(estado, resultado); // Llamar a la función para avanzar a la siguiente etapa
      },
      () => {
        console.log('No continuar con la información escaneada');
      }
    );
  }

siguienteEtapa(estado: string, resultado: any): void {
  // Buscar en la api de trazabilidad el nLote y actualizar el estado según el estado actual.
  const api = `https://control.als-inspection.cl/api_min/api/trazabilidad/?nLote=${resultado.nLote}`;
  this.http.get<any[]>(api).subscribe(
    (data) => {
      console.log(data);
      if (data.length > 0) {
        // Si existe, almacena la trazabilidad
        let nuevoEstado = estado;
        let body = data[0];
        // Verificar el estado actual y asignar el nuevo estado correspondiente, junto a su hora y fecha
        switch (estado) {
          case 'Iniciado':
            nuevoEstado = 'Ingreso Laboratorio';
            const horaLab = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            body.estado = nuevoEstado;
            body.fechaLab = this.formatDate(new Date());
            body.horaLab = `${horaLab}`;
            break;
          case 'Ingreso Laboratorio':
            nuevoEstado = 'Ingreso Horno';
            const horaIngresoHorno = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            body.estado = nuevoEstado;
            body.fechaIngresoHorno = this.formatDate(new Date());
            body.horaIngresoHorno = `${horaIngresoHorno}`;
            break;
          case 'Ingreso Horno':
            nuevoEstado = 'Salida Horno';
            const horaSalidaHorno = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            body.estado = nuevoEstado;
            body.fechaSalidaHorno = this.formatDate(new Date());
            body.horaSalidaHorno = `${horaSalidaHorno}`;
            break;
          case 'Salida Horno':
            nuevoEstado = 'Preparación de muestra';
            const horaPreparacionMuestra = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            body.estado = nuevoEstado;
            body.fechaPreparacionMuestra = this.formatDate(new Date());
            body.horaPreparacionMuestra = `${horaPreparacionMuestra}`;
            break;
          case 'Preparación de muestra':
            nuevoEstado = 'Almacenamiento de muestra natural';
            const horaTestigoteca = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            body.estado = nuevoEstado;
            body.fechaTestigoteca = this.formatDate(new Date());
            body.horaTestigoteca = `${horaTestigoteca}`;
            break;
          case 'Almacenamiento de muestra natural':
            nuevoEstado = 'Distribución de muestra';
            body.estado = nuevoEstado;
            break;
          case 'Distribución de muestra':
            nuevoEstado = 'Finalizado';
            body.estado = nuevoEstado;
            break;
          default:
            body.estado = 'Iniciado';
            break;
        }
        // Actualizar el estado en la api de trazabilidad
        const apiUrl = `https://control.als-inspection.cl/api_min/api/trazabilidad/${data[0].id}/`;
        this.http.put(apiUrl, body).subscribe(
          (response) => {
            Notiflix.Notify.success('Trazabilidad actualizada correctamente');
          },
          (error) => {
            console.error('Error al actualizar trazabilidad', error);
            Notiflix.Notify.failure('Error al almacenar trazabilidad');
          }
        );
      } else {
        Notiflix.Notify.info('La trazabilidad de este Lote no existe');
      }
    },
    (error) => {
      console.error('Error al obtener trazabilidad', error);
    }
  );
}


formatDate(date: Date): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}
}
