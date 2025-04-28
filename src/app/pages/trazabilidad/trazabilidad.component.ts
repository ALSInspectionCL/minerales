import { Component, OnInit, ViewChild } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { DetalleTrazaComponent } from './detalle-traza/detalle-traza.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { LoteService } from 'src/app/services/lote.service';
import { DetalleQrComponent } from './detalle-qr/detalle-qr.component';
import { EscanerComponent } from './escaner/escaner.component';
import { LectorComponent } from './lector/lector.component';
import Notiflix from 'notiflix';
import { HttpClient } from '@angular/common/http';

export interface loteRecepcion {
  id: number;
  nLote: string;
  fLote: string;
  observacion: string;
  tipoTransporte: string;
  cantCamiones: number;
  cantVagones: number;
  cantBigbag: number;
  pesoTara: number;
  pesoNetoHumedo: number;
  pesoBrutoHumedo: number;
  porcHumedad: number;
  pesoNetoSeco: number;
  diferenciaPeso: number;
  servicio: number;
  solicitud: number;
}

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    DetalleTrazaComponent,
    FormsModule,
    MaterialModule,
    TablerIconsModule,
  ],
  templateUrl: './trazabilidad.component.html',
  styleUrl: './trazabilidad.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
  providers: [DatePipe],
})
export class TrazabilidadComponent {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
  searchText: any;
  displayedColumns: string[] = [
    '#',
    'name',
    'email',
    'mobile',
    'date of joining',
    'action',
  ];
  lote: any | null = null;
  dataSource = new MatTableDataSource<any>();
  muestra: boolean = false; // Variable para mostrar el mensaje de error
  trazabilidades: any; // Almacena las trazabilidades obtenidas de la API
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);

  constructor(
    public dialog: MatDialog,
    public http: HttpClient,
    public datePipe: DatePipe,
    private loteService: LoteService
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.cargarLote();
    this.cargarTrazabilidades();
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarLote(): any {
    let lotebuscado: loteRecepcion;
    this.loteService.getLotesTrazabilidad().subscribe(
      (response: loteRecepcion[]) => {
        console.log('Respuesta del servicio:', response);
        this.dataSource.data = response;
        // Invertir el orden de los elementos
        this.dataSource.data = this.dataSource.data.reverse();
        if (response.length > 0) {
          this.lote = response[0];
          lotebuscado = response[0];
        } else {
          this.lote = null;
        }
        console.log('Lote cargado:', this.lote);
        return lotebuscado;
      },
      (error) => {
        console.error('Error al cargar el lote:', error);
        this.lote = null;
      }
    );
  }

  detalleQr() {
    const dialogRef = this.dialog.open(DetalleQrComponent, {
      width: '40%', // Ajusta el ancho del diálogo
      height: '50%', // Ajusta la altura del diálogo
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('El diálogo se cerró con el resultado: ', result);
      this.cargarLote(); // Recargar los lotes después de cerrar el diálogo
    });
  }

  scanQR() {
    const dialogRef = this.dialog.open(LectorComponent, {
      width: '40%', // Ajusta el ancho del diálogo
      height: '50%', // Ajusta la altura del diálogo
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('El diálogo se cerró con el resultado: ', result);
      this.cargarLote(); // Recargar los lotes después de cerrar el diálogo
    });
  }

  detalleTraza(Num: any) {
    const dialogRef = this.dialog.open(DetalleTrazaComponent, {
      width: '80%', // Ajusta el ancho del diálogo
      // height: '30%',
      data: {
        numLote: Num,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('El diálogo se cerró con el resultado: ', result);
    });
  }

  escaner() {
    const dialogRef = this.dialog.open(EscanerComponent, {
      width: '60%', // Ajusta el ancho del diálogo
      height: '60%', // Ajusta la altura del diálogo
    });
  }

  eliminarTrazabilidad(id: number, obs: string) {

    Notiflix.Confirm.show(
      'Eliminar Trazabilidad',
      '¿Está seguro de que desea eliminar la trazabilidad '+obs+'?',
      'Eliminar',
      'Cancelar',
      () => {
        this.loteService.eliminarTrazabilidad(id).subscribe(
          (response) => {
            console.log('Trazabilidad eliminada:', response);
            Notiflix.Notify.success('Trazabilidad eliminada correctamente');
            this.cargarLote(); // Recargar los lotes después de eliminar la trazabilidad
          },
          (error) => {
            console.error('Error al eliminar la trazabilidad:', error);
          }
        );
      },
      () => {
        console.log('Eliminación cancelada');
      },
      {
        width: '320px',
        borderRadius: '8px',
        titleFontSize: '20px',
        okButtonBackground: '#f44336',
        cssAnimationStyle: 'zoom',
      }
    );
  }
  onInput(event: any) {
    const inputValue = event.target.value;
    let codigo: string = inputValue;
    // Verificar si el código está completo (por ejemplo, si tiene un largo específico y un guión)
    if (codigo.includes('.')) {
      this.muestra = false; // Si el código no contiene un punto, significa que no está completo
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
        this.cargarLote(); // Recargar los lotes después de actualizar la trazabilidad
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

export interface PeriodicElement {
  name: string;
  position: string;
  id: number;
  project: string;
  symbol: string;
  description: string;
}
