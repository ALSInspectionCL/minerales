import { SolicitudService } from './../../services/solicitud.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSelectModule } from '@angular/material/select';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Observable } from 'rxjs';
import { DateAdapter } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { OnInit } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { ServicioService } from './../../services/servicio.service';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import Notiflix from 'notiflix';
import { LoteService } from 'src/app/services/lote.service';
import {
  FiveDayRangeSelectionStrategy,
  NuevoLoteComponent,
} from './nuevo-lote/nuevo-lote.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecepcionComponent } from '../recepcion/recepcion.component';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { DespachoComponent } from '../despacho/despacho.component';

@Component({
  selector: 'app-lotes',
  standalone: true,
  imports: [
    MatInput,
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepicker,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    TablerIconsModule,
    MatCardModule,
    MatCard,
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
  templateUrl: './lotes.component.html',
  styleUrl: './lotes.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class LotesComponent {
  idServicio: any;
  idSolicitud: any;
  fechaSeleccionadaI: Date | null = null;
  fechaSeleccionadaF: Date | null = null;
  bodegas: any[] = [];

  constructor(
    private dialog: MatDialog,
    private loteService: LoteService,
    private solicitudService: SolicitudService,
    private servicioService: ServicioService,
    private http: HttpClient
  ) {}
  servicios: any;
  solicitud: any;
  lotesRecepcion: any;

  ngOnInit() {
    this.obtenerServicios();
    this.obtenerSolicitudes();
    this.getBodegas();
  }

  obtenerServicios() {
    const apiUrl = 'http://127.0.0.1:8000/api/servicio/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.servicios = data; // Asigna los servicios obtenidos a la variable
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener servicios', error);
      }
    );
  }

  obtenerSolicitudes() {
    const apiUrl = 'http://127.0.0.1:8000/api/solicitud/';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        this.solicitud = data; // Asigna las solicitudes obtenidos a la variable
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener servicios', error);
      }
    );
  }

  getBodegas() {
    this.http
      .get('http://127.0.0.1:8000/api/bodega/')
      .subscribe((data: any) => {
        this.bodegas = data; // Asumiendo que la respuesta es un array de bodegas
      });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  recepLotes = 0;
  recepCamiones = 0;
  recepVagones = 0;
  recepBruto = 0;
  recepTara = 0;
  recepHumedo = 0;
  recepPorc = 0;
  recepSeco = 0;

  despLotes = 0;
  despCamiones = 0;
  despVagones = 0;
  despBruto = 0;
  despTara = 0;
  despHumedo = 0;
  despPorc = 0;
  despSeco = 0;

  cargarData() {
    this.recepLotes = 0;
    this.recepCamiones = 0;
    this.recepVagones = 0;
    this.recepBruto = 0;
    this.recepTara = 0;
    this.recepHumedo = 0;
    this.recepPorc = 0;
    this.recepSeco = 0;

    console.log(this.fechaSeleccionadaI);
    console.log(this.fechaSeleccionadaF);

    if (this.fechaSeleccionadaI != null && this.fechaSeleccionadaF == null) {
      const fechaFormateada = this.formatDate(this.fechaSeleccionadaI);
      const apiUrl = 'http://127.0.0.1:8000/api/lote-recepcion/';
      this.http.get<any[]>(apiUrl).subscribe((data) => {
        this.lotesRecepcion = data;
        console.log(data);
        for (let i = 0; i < this.lotesRecepcion.length; i++) {
          if (this.lotesRecepcion[i].fLote >= fechaFormateada) {
            this.recepLotes = this.recepLotes + 1;
            this.recepCamiones =
              this.recepCamiones + this.lotesRecepcion[i].cantCamiones;
            this.recepVagones =
              this.recepVagones + this.lotesRecepcion[i].cantVagones;
            this.recepBruto =
              this.recepBruto +
              parseFloat(this.lotesRecepcion[i].pesoBrutoHumedo);
            this.recepTara =
              this.recepTara + parseFloat(this.lotesRecepcion[i].pesoTara);
            this.recepHumedo =
              this.recepHumedo +
              parseFloat(this.lotesRecepcion[i].pesoNetoHumedo);
            this.recepPorc =
              this.recepPorc + parseFloat(this.lotesRecepcion[i].porcHumedad);
            this.recepSeco =
              this.recepSeco + parseFloat(this.lotesRecepcion[i].pesoNetoSeco);
          }
        }
        (this.recepPorc = 11), 85;

        if (this.recepLotes == 0) {
          Notiflix.Notify.warning('No se han encontrado datos');
        } else {
          Notiflix.Notify.success('Se han encontrado datos');
        }
      });
    } else if (
      this.fechaSeleccionadaI == null &&
      this.fechaSeleccionadaF != null
    ) {
      const fechaFormateadaF = this.formatDate(this.fechaSeleccionadaF);
      const apiUrl = 'http://127.0.0.1:8000/api/lote-recepcion/';
      this.http.get<any[]>(apiUrl).subscribe((data) => {
        this.lotesRecepcion = data;
        console.log(data);
        for (let i = 0; i < this.lotesRecepcion.length; i++) {
          if (this.lotesRecepcion[i].fLote <= fechaFormateadaF) {
            this.recepLotes = this.recepLotes + 1;
            this.recepCamiones =
              this.recepCamiones + this.lotesRecepcion[i].cantCamiones;
            this.recepVagones =
              this.recepVagones + this.lotesRecepcion[i].cantVagones;
            this.recepBruto =
              this.recepBruto +
              parseFloat(this.lotesRecepcion[i].pesoBrutoHumedo);
            this.recepTara =
              this.recepTara + parseFloat(this.lotesRecepcion[i].pesoTara);
            this.recepHumedo =
              this.recepHumedo +
              parseFloat(this.lotesRecepcion[i].pesoNetoHumedo);
            this.recepPorc =
              this.recepPorc + parseFloat(this.lotesRecepcion[i].porcHumedad);
            this.recepSeco =
              this.recepSeco + parseFloat(this.lotesRecepcion[i].pesoNetoSeco);
          }
        }
        (this.recepPorc = 11), 85;

        if (this.recepLotes == 0) {
          Notiflix.Notify.warning('No se han encontrado datos');
        } else {
          Notiflix.Notify.success('Se han encontrado datos');
        }
      });
    } else if (
      this.fechaSeleccionadaI != null &&
      this.fechaSeleccionadaF != null
    ) {
      const fechaFormateadaI = this.formatDate(this.fechaSeleccionadaI);
      const fechaFormateadaF = this.formatDate(this.fechaSeleccionadaF);
      const apiUrl = 'http://127.0.0.1:8000/api/lote-recepcion/';
      this.http.get<any[]>(apiUrl).subscribe((data) => {
        this.lotesRecepcion = data;
        console.log(data);
        for (let i = 0; i < this.lotesRecepcion.length; i++) {
          if (
            fechaFormateadaI <= this.lotesRecepcion[i].fLote &&
            this.lotesRecepcion[i].fLote <= fechaFormateadaF
          ) {
            this.recepLotes = this.recepLotes + 1;
            this.recepCamiones =
              this.recepCamiones + this.lotesRecepcion[i].cantCamiones;
            this.recepVagones =
              this.recepVagones + this.lotesRecepcion[i].cantVagones;
            this.recepBruto =
              this.recepBruto +
              parseFloat(this.lotesRecepcion[i].pesoBrutoHumedo);
            this.recepTara =
              this.recepTara + parseFloat(this.lotesRecepcion[i].pesoTara);
            this.recepHumedo =
              this.recepHumedo +
              parseFloat(this.lotesRecepcion[i].pesoNetoHumedo);
            this.recepPorc =
              this.recepPorc + parseFloat(this.lotesRecepcion[i].porcHumedad);
            this.recepSeco =
              this.recepSeco + parseFloat(this.lotesRecepcion[i].pesoNetoSeco);
          }
        }
        (this.recepPorc = 11), 85;

        if (this.recepLotes == 0) {
          Notiflix.Notify.warning('No se han encontrado datos');
        } else {
          Notiflix.Notify.success('Se han encontrado datos');
        }
      });
    } else {
      if (
        this.idServicio == null ||
        this.idServicio == undefined ||
        this.idServicio == 0 ||
        this.idServicio == ''
      ) {
        Notiflix.Notify.failure('Por favor, seleccione un servicio');
        this.recepLotes = 0;
        this.recepCamiones = 0;
        this.recepVagones = 0;
        this.recepBruto = 0;
        this.recepTara = 0;
        this.recepHumedo = 0;
        this.recepPorc = 0;
        this.recepSeco = 0;
        return;
      }
      if (
        this.idSolicitud == null ||
        this.idSolicitud == undefined ||
        this.idSolicitud == 0 ||
        this.idSolicitud == ''
      ) {
        Notiflix.Notify.failure('Por favor, seleccione una solicitud');
        this.recepLotes = 0;
        this.recepCamiones = 0;
        this.recepVagones = 0;
        this.recepBruto = 0;
        this.recepTara = 0;
        this.recepHumedo = 0;
        this.recepPorc = 0;
        this.recepSeco = 0;
        return;
      }
      if (this.idServicio && this.idSolicitud) {
        const apiUrl = 'http://127.0.0.1:8000/api/lote-recepcion/';
        this.http.get<any[]>(apiUrl).subscribe((data) => {
          this.lotesRecepcion = data;
          console.log(data);
          for (let i = 0; i < this.lotesRecepcion.length; i++) {
            if (
              this.lotesRecepcion[i].servicio == this.idServicio &&
              this.lotesRecepcion[i].solicitud == this.idSolicitud
            ) {
              this.recepLotes = this.recepLotes + 1;
              this.recepLotes = this.recepLotes + 1;
              this.recepCamiones =
                this.recepCamiones + this.lotesRecepcion[i].cantCamiones;
              this.recepVagones =
                this.recepVagones + this.lotesRecepcion[i].cantVagones;
              this.recepBruto =
                this.recepBruto +
                parseFloat(this.lotesRecepcion[i].pesoBrutoHumedo);
              this.recepTara =
                this.recepTara + parseFloat(this.lotesRecepcion[i].pesoTara);
              this.recepHumedo =
                this.recepHumedo +
                parseFloat(this.lotesRecepcion[i].pesoNetoHumedo);
              this.recepPorc =
                this.recepPorc + parseFloat(this.lotesRecepcion[i].porcHumedad);
              this.recepSeco =
                this.recepSeco +
                parseFloat(this.lotesRecepcion[i].pesoNetoSeco);
            }
          }
          (this.recepPorc = 11), 85;

          if (this.recepLotes == 0) {
            Notiflix.Notify.warning('No se han encontrado datos');
          } else {
            Notiflix.Notify.success('Se han encontrado datos');
          }
        });
      } else {
        Notiflix.Notify.warning('No se han encontrado datos');
        this.recepLotes = 0;
        this.recepCamiones = 0;
        this.recepVagones = 0;
        this.recepBruto = 0;
        this.recepTara = 0;
        this.recepHumedo = 0;
        this.recepPorc = 0;
        this.recepSeco = 0;
      }
    }
  }
  // registrarLote() {
  //   this.loteService.crearLote(idServicio, idSolicitud, nLote, obs, tipoTransporte).subscribe((response: any) => {
  //     console.log(response);
  //     // Maneja la respuesta de la API
  //   }, (error: any) => {
  //     console.error(error);
  //     // Maneja el error
  //   });
  // }

  crearNuevoLote() {
    const dialogRef = this.dialog.open(NuevoLoteComponent, {
      width: '600px',
      data: {
        idServicio: this.idServicio,
        idSolicitud: this.idSolicitud,
      },
    });
  }

  verRecepcion() {
    const dialogRef = this.dialog.open(RecepcionComponent, {
      width: 'flex',
      height: '600px',
      data: {
        titulo: 'Recepción',
        sub: 'Aquí podrá acceder al detalle de los lotes ingresados',
        idServicio: this.idServicio,
        idSolicitud: this.idSolicitud,
      },
    });
  }

  verDespacho() {
    const dialogRef = this.dialog.open(DespachoComponent, {
      width: 'flex',
      height: '600px',
      data: {
        titulo: 'Despacho',
        sub: 'Aquí podrá acceder al detalle de los lotes ingresados',
        idServicio: this.idServicio,
        idSolicitud: this.idSolicitud,
      },
    });
  }

  verInventario(idBodega: number) {}
}
