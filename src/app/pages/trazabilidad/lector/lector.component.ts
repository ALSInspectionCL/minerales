import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from 'src/app/material.module';
import { Component, ElementRef, ViewChild } from '@angular/core';
import Notiflix from 'notiflix';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lector',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './lector.component.html',
  styleUrl: './lector.component.scss',
})
export class LectorComponent {
  @ViewChild('qrCode') qrCodeInput: ElementRef;
  constructor(private http: HttpClient) {}
  muestra: boolean = false; // Variable para mostrar el mensaje de error
  trazabilidades: any; // Almacena las trazabilidades obtenidas de la API

  ngOnInit() {
    this.cargarTrazabilidades();
  }

  onInput(event: any) {
    const inputValue = event.target.value;
    let codigo: string = inputValue;
    // Verificar si el código está completo (por ejemplo, si tiene un largo específico y un guión)
    if (codigo.includes('.')) {
      // Si el código contiene un punto, significa que está completo
      let codigo = inputValue.split('-')[0]; // Almacena solo la parte antes del guión
      if (codigo.includes('M')) {
        // Si el primer elemento es una M, entonces el boolean 'muestra' es true
        this.muestra = true;
      }
      // Quitar el primer y último carácter del código
      codigo = codigo.substring(1, codigo.length - 1);
      
      console.log(codigo);
      this.actualizarEstado(codigo);
    }
  }

  actualizarEstado(codigo: string) {
    //Verificar si el codigo existe en trazabilidades
    const trazabilidad = this.trazabilidades.find(
      (element: any) => element.nLote === codigo
    );
    //Utilizar trazabilidad o existe segun necesite
    if (trazabilidad && this.muestra) {
      Notiflix.Confirm.show(
        'Actualizar Estado',
        'El lote ' +
          trazabilidad.observacion +
          ' ha sido escaneado con éxito. Almacenando en Testigoteca.',
        'Confirmar',
        'Cancelar',
        () => {
          console.log('Continuar con la información escaneada');
          console.log(trazabilidad);
          this.siguienteEtapa(trazabilidad.estado, trazabilidad); // Llamar a la función para avanzar a la siguiente etapa
        },
        () => {
          console.log('No continuar con la información escaneada');
        }
      );
    }
    else if (trazabilidad && !this.muestra) {
      Notiflix.Confirm.show(
        'Actualizar Estado',
        'El lote ' +
          trazabilidad.observacion +
          ' ha sido escaneado con éxito. Estado : ' +
          trazabilidad.estado +
          '.',
        'Siguiente Etapa',
        'Cancelar',
        () => {
          console.log('Continuar con la información escaneada');
          console.log(trazabilidad);
          this.siguienteEtapa(trazabilidad.estado, trazabilidad); // Llamar a la función para avanzar a la siguiente etapa
        },
        () => {
          console.log('No continuar con la información escaneada');
        }
      );
    } else {
      //Si no existe, mostrar el mensaje de error
      Notiflix.Notify.failure('Código no válido');
    }
  }

  siguienteEtapa(estado: string, resultado: any): void {
    // Buscar en la api de trazabilidad el nLote y actualizar el estado según el estado actual.
    const api = `https://control.als-inspection.cl/api_min/api/trazabilidad/${resultado.id}/`;
    this.http.get<any>(api).subscribe(
      (data) => {
        console.log(data);
        if (data) {
          console.log('La trazabilidad existe');
          console.log('Estado actual:', estado);
          console.log('ID:', data.id);
          // Si existe, almacena la trazabilidad
          let nuevoEstado = estado;
          // Crear un objeto para almacenar los datos a enviar a la API
          //Buscar en data una trazabilidad que contenga el nLote
          const trazabilidad = data;
          const body = {
            id: trazabilidad.id,
            idTransporte: trazabilidad.idTransporte,
            nLote: trazabilidad.nLote,
            estado: trazabilidad.estado,
            fechaLab: trazabilidad.fechaLab,
            horaLab: trazabilidad.horaLab,
            fechaRLab: trazabilidad.fechaRLab,
            horaRLab: trazabilidad.horaRLab,
            fechaIngresoHorno: trazabilidad.fechaIngresoHorno,
            horaIngresoHorno: trazabilidad.horaIngresoHorno,
            fechaSalidaHorno: trazabilidad.fechaSalidaHorno,
            horaSalidaHorno: trazabilidad.horaSalidaHorno,
            fechaPreparacionMuestra: trazabilidad.fechaPreparacionMuestra,
            horaPreparacionMuestra: trazabilidad.horaPreparacionMuestra,
            fechaTestigoteca: trazabilidad.fechaTestigoteca,
            horaTestigoteca: trazabilidad.horaTestigoteca,
            fechaDistribucionMuestra: trazabilidad.fechaDistribucionMuestra,
            horaDistribucionMuestra: trazabilidad.horaDistribucionMuestra,
          };

          if (this.muestra) {
            if(data.horaTestigoteca !== null){
              Notiflix.Notify.failure('La trazabilidad ya ha sido actualizada');
              return;
            }
            // Si el boolean 'muestra' es true, mantener todos los valores de la trazabilidad, agregar 
            const horaTestigoteca = new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            });
            body.fechaTestigoteca = this.formatDate(new Date());
            body.horaTestigoteca = `${horaTestigoteca}`;
          }else{
            switch (estado) {
              case 'Iniciado':
                nuevoEstado = 'Recep. Laboratorio';
                const horaRLab = new Date().toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                body.estado = nuevoEstado;
                body.fechaRLab = this.formatDate(new Date());
                body.horaRLab = `${horaRLab}`;
                break;
              case 'Recep. Laboratorio':
                nuevoEstado = 'Ingreso Laboratorio';
                const horaLab = new Date().toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                body.estado = nuevoEstado;
                body.fechaLab = this.formatDate(new Date());
                body.horaLab = `${horaLab}`;
                break;
              case 'Ingreso Laboratorio':
                nuevoEstado = 'Ingreso Horno';
                const horaIngresoHorno = new Date().toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                body.estado = nuevoEstado;
                body.fechaIngresoHorno = this.formatDate(new Date());
                body.horaIngresoHorno = `${horaIngresoHorno}`;
                break;
              case 'Ingreso Horno':
                nuevoEstado = 'Salida Horno';
                const horaSalidaHorno = new Date().toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                body.estado = nuevoEstado;
                body.fechaSalidaHorno = this.formatDate(new Date());
                body.horaSalidaHorno = `${horaSalidaHorno}`;
                break;
              case 'Salida Horno':
                nuevoEstado = 'Prep. de muestra';
                const horaPreparacionMuestra = new Date().toLocaleTimeString(
                  'es-ES',
                  { hour: '2-digit', minute: '2-digit' }
                );
                body.estado = nuevoEstado;
                body.fechaPreparacionMuestra = this.formatDate(new Date());
                body.horaPreparacionMuestra = `${horaPreparacionMuestra}`;
                break;
              case 'Prep. de muestra':
                nuevoEstado = 'Distribución muestra';
                body.estado = nuevoEstado;
                break;
              case 'Distribución muestra':
                nuevoEstado = 'Finalizado';
                body.estado = nuevoEstado;
                break;
              default:
                Notiflix.Notify.failure('No se ha actualizado correctamente...');
                break;
            }
          }

          // Actualizar el estado en la api de trazabilidad
          const apiUrl = `https://control.als-inspection.cl/api_min/api/trazabilidad/${data.id}/`;
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

  cargarTrazabilidades() {
    this.http
      .get('https://control.als-inspection.cl/api_min/api/trazabilidad/')
      .subscribe((response) => {
        console.log('Respuesta del servicio:', response);
        this.trazabilidades = response;
        console.log('Trazabilidades:');
        console.log(this.trazabilidades);
      });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

}
