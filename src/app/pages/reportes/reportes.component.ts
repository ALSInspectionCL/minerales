import { LoteService } from 'src/app/services/lote.service';
import { Bodega } from 'src/app/services/bodega.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import {
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { FiveDayRangeSelectionStrategy } from '../formularios/formularios.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { map, Observable, startWith } from 'rxjs';
import Notiflix from 'notiflix';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatButtonModule,
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
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class ReportesComponent {
  fechaDesde: Date;
  fechaHasta: Date;
  tablaCamion: boolean = false;
  tablaVagon : boolean = false;
  tablaInv : boolean = false;
  tablaRCamion : boolean = false;

  opciones = [
    { value: 'Detalle Camiones', label: 'Detalle Camiones ' },
    { value: 'Detalle Vagones', label: 'Detalle Vagones' },
    { value: 'Resumen Camiones' , label: 'Resumen Camiones'},
    { value: 'Resumen Vagones', label: 'Resumen Vagones'},
    { value: 'Inventario', label: 'Inventario' },
    // { value: 'Ingresos', label: 'Ingresos' },
    // { value: 'Despachos', label: 'Despachos' },
  ];

  documento = new FormControl('');

  opcionesFiltradas: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private loteService: LoteService,
    private bodegaService: Bodega
  ) {
    this.opcionesFiltradas = this.documento.valueChanges.pipe(
      startWith(''),
      map((value) => this.filtrarOpciones(value))
    );
  }


  obtenerLotesRecepción(fechaInicio: string, fechaFin: string): void {
    this.http
    .get(
      `https://control.als-inspection.cl/api_min/api/lote-recepcion/?format=api&fLote=${fechaInicio}&fLote=${fechaFin}`)
      .subscribe((response) => {
        const loteRecepcion = (response as any[]).filter(
          (lote: any) => lote.fechaRecepcion >= fechaInicio && lote.fechaRecepcion <= fechaFin
          );
        console.log(loteRecepcion);
        });
  }

  filtrarOpciones(value: string | null): any[] {
    if (value === null) {
      return this.opciones;
    }
    const filterValue = value.toLowerCase();
    return this.opciones.filter((opcion) =>
      opcion.label.toLowerCase().includes(filterValue)
    );
  }

  camionesRecepcion: any[] = [];
  vagonesRecepcion : any[] = [];
  bodegas : any[] = [];
  lotes: any[] = [];
  crearDocumento() {
    console.log('Crear documento');
    let apirecepcion =
      'https://control.als-inspection.cl/api_min/api/recepcion-transporte/';
    let apidespacho =
      'https://control.als-inspection.cl/api_min/api/despacho-camion/';

    let apiBodega = 'https://control.als-inspection.cl/api_min/api/bodega/';

    let apiDetalleBodega = 'https://control.als-inspection.cl/api_min/api/detalle-bodega/'

    let apiLote = 'https://control.als-inspection.cl/api_min/api/lote-recepcion/';

    if (this.fechaDesde && this.fechaHasta && this.documento.value) {
      console.log('Fecha desde', this.fechaDesde);
      console.log('Fecha hasta', this.fechaHasta);
      console.log('Documento', this.documento.value);
      if (this.documento.value === 'Detalle Camiones') {
        Notiflix.Notify.success('Documento de camiones creado');
        this.http
          .get(
            `${apirecepcion}?fOrigen=${this.fechaDesde}&?fOrigen=${this.fechaHasta}/`
          )
          .subscribe((response) => {
            const camionesRecepcion = (response as any[]).filter(
              (camion: any) =>
                camion.tipoTransporte === 'Camion' &&
                new Date(camion.fOrigen) >= new Date(this.fechaDesde) &&
                new Date(camion.fOrigen) <= new Date(this.fechaHasta)
            );
            this.camionesRecepcion = camionesRecepcion;
            if (camionesRecepcion.length === 0) {
              Notiflix.Notify.warning(
                'No hay camiones para la fecha seleccionada'
              );
            } else {
              let lastnLote = '';
              let nLotes: any[] = [];
              if (camionesRecepcion.length > 0) {
                lastnLote = camionesRecepcion[0].nLote;
              }
              this.obtenerObservaciones(camionesRecepcion);
              this.obtenerNombreBodega(camionesRecepcion)
              camionesRecepcion.forEach((camion: any) => {
                if (
                  camion.nLote === lastnLote &&
                  !nLotes.includes(camion.nLote)
                ) {
                  nLotes.push(camion.nLote);
                }
                lastnLote = camion.nLote;
              });
              console.log(nLotes);

              //buscar los registros de los lotes de camiones de nLotes
              const lotesCamiones: any[] = [];
              let camionesLote: any[] = [];
              for (let i = 0; i < nLotes.length; i++) {
                this.http
                  .get(
                    `https://control.als-inspection.cl/api_min/api/recepcion-transporte/?nLote=${nLotes[i]}/`
                  )
                  .subscribe((response) => {
                    camionesLote = (response as any[]).filter(
                      (camion) =>
                        camion.tipoTransporte === 'Camion' &&
                        camion.nLote === nLotes[i]
                    );
                    camionesLote.forEach((camion, index) => {
                      lotesCamiones.push({ id: camion.id, index: index });
                    });

                    for (let i = 0; i < lotesCamiones.length; i++) {
                      for (let j = 0; j < camionesRecepcion.length; j++) {
                        if (camionesRecepcion[j].id === lotesCamiones[i].id) {
                          camionesRecepcion[j].posicion =
                            lotesCamiones[i].index;
                        }
                      }
                    }
                  });
                console.log(camionesRecepcion);
              }

              Notiflix.Notify.success('Camiones encontrados');
              this.tablaCamion = true;
              this.tablaRCamion = false;
              this.tablaInv = false;
              this.tablaVagon = false
            }
          });
      }else if(this.documento.value === 'Resumen Camiones'){
        
        this.http.get(apiLote).subscribe(response => {
          const lotesResponse = response as any[];
          this.lotes = lotesResponse.filter(lote => {
            const fechaLote = new Date(lote.fLote);
            const fechaDesde = new Date(this.fechaDesde);
            const fechaHasta = new Date(this.fechaHasta);
            return (fechaLote >= fechaDesde && fechaLote <= fechaHasta) && lote.tipoTransporte === 'Camion';
          });
          console.log(this.lotes);
        });
      
        this.tablaRCamion = true;
        this.tablaInv = false;
        this.tablaVagon = false;
        this.tablaCamion = false;

      }else if (this.documento.value === 'Detalle Vagones') {
        this.http
        .get(
          `${apirecepcion}?fOrigen=${this.fechaDesde}&?fOrigen=${this.fechaHasta}/`
        )
        .subscribe((response) => {
          const vagonesRecepcion = (response as any[]).filter(
            (vagon: any) =>
              vagon.tipoTransporte === 'Vagon' &&
              new Date(vagon.fOrigen) >= new Date(this.fechaDesde) &&
              new Date(vagon.fOrigen) <= new Date(this.fechaHasta)
          );
          this.vagonesRecepcion = vagonesRecepcion;
          if (vagonesRecepcion.length === 0) {
            Notiflix.Notify.warning(
              'No hay camiones para la fecha seleccionada'
            );
          } else {
            let lastnLote = '';
            let nLotes: any[] = [];
            if (vagonesRecepcion.length > 0) {
              lastnLote = vagonesRecepcion[0].nLote;
            }
            this.obtenerObservaciones(vagonesRecepcion);
            this.obtenerNombreBodega(vagonesRecepcion)
            vagonesRecepcion.forEach((vagon: any) => {
              if (
                vagon.nLote === lastnLote &&
                !nLotes.includes(vagon.nLote)
              ) {
                nLotes.push(vagon.nLote);
              }
              lastnLote = vagon.nLote;
            });
            //buscar los registros de los lotes de Vagones de nLotes
            const lotesVagones: any[] = [];
            let vagonesLote: any[] = [];
            for (let i = 0; i < nLotes.length; i++) {
              this.http
                .get(
                  `https://control.als-inspection.cl/api_min/api/recepcion-transporte/?nLote=${nLotes[i]}/`
                )
                .subscribe((response) => {
                  vagonesLote = (response as any[]).filter(
                    (vagon) =>
                      vagon.tipoTransporte === 'Vagon' &&
                      vagon.nLote === nLotes[i]
                  );
                  vagonesLote.forEach((vagon, index) => {
                    lotesVagones.push({ id: vagon.id, index: index });
                  });

                  for (let i = 0; i < lotesVagones.length; i++) {
                    for (let j = 0; j < vagonesRecepcion.length; j++) {
                      if (vagonesRecepcion[j].id === lotesVagones[i].id) {
                        vagonesRecepcion[j].posicion =
                        lotesVagones[i].index;
                      }
                    }
                  }
                });
              console.log(vagonesRecepcion);
            }

            Notiflix.Notify.success('Vagones encontrados');
            this.tablaRCamion = false;
            this.tablaCamion = false;
            this.tablaVagon = true;
            this.tablaInv = false;
          }
        });
        Notiflix.Notify.success('Documento de vagones creado');
        this.tablaCamion = false;
      } else if (this.documento.value === 'Inventario') {
        this.bodegaService.getBodegas().subscribe((response) => {
          const bodegas = response as any[];
          this.bodegas = bodegas.map((bodega) => {
            return {
              idBodega: bodega.idBodega,
              nombreBodega: bodega.nombreBodega,
              total: bodega.total,
              // Agrega aquí las propiedades adicionales que necesites
            }
          })
        });
        console.log(this.bodegas)


        this.wip();
        Notiflix.Notify.success('Documento de inventario creado');
        this.tablaInv = true;
        this.tablaVagon = false;
        this.tablaCamion = false;
        this.tablaRCamion = false;
      
      } else if (this.documento.value === 'Ingresos') {
        this.wip();
        Notiflix.Notify.success('Documento de ingresos creado');
        this.tablaCamion = false;
        this.tablaVagon = false;
        this.tablaInv = false;
        this.tablaRCamion = false;
      } else if (this.documento.value === 'Despachos') {
        this.wip();
        Notiflix.Notify.success('Documento de despachos creado');
        this.tablaCamion = false;
        this.tablaVagon = false;
        this.tablaInv = false;
        this.tablaRCamion = false;
      } else {
        Notiflix.Notify.warning('Seleccione un documento valido');
        this.tablaCamion = false;
        this.tablaVagon = false;
      }
    } else {
      Notiflix.Notify.info('Faltan datos');
    }
  }

  obtenerObservaciones(camionesRecepcion: any[]) {
    let ultimonLoteRevisado = '';
    camionesRecepcion.forEach((camion: any) => {
      if (camion.nLote !== ultimonLoteRevisado) {
        this.loteService.getLoteBynLote(camion.nLote).subscribe((response) => {
          const lote = (response as any[])[0];
          camion.observacion = lote.observacion;
          ultimonLoteRevisado = camion.nLote;
        });
      }
    });
    this.camionesRecepcion = camionesRecepcion;
  }

  obtenerNombreBodega(camionesRecepcion: any[]) {
    //buscar todas las bodegas
    this.bodegaService.getBodegas().subscribe((response) => {
      const bodegas = response as any[];
      console.log(bodegas)
      camionesRecepcion.forEach((camion: any) => {
        const bodega = bodegas.find(
          (bodega: any) => bodega.idBodega === camion.bodega
        );
        if (bodega) {
          camion.nombreBodega = bodega.nombreBodega;
        }
      });
      this.camionesRecepcion = camionesRecepcion;
    });
  }

  private registrosPorNLote: any[] = [];
  private nLoteAnterior: any;

  getNroLote(camion: any): number {
    if (camion.nLote !== this.nLoteAnterior) {
      this.nLoteAnterior = camion.nLote;
      this.registrosPorNLote = [];
      console.log(this.nLoteAnterior);
      // this.http.get(`https://control.als-inspection.cl/api_min/api/recepcion-transporte/?nLote=${camion.nLote}/`)
      //   .subscribe(response => {
      //     this.registrosPorNLote = response as any[];
      //     console.log(this.registrosPorNLote);
      //   });
    } else {
      console.log('No hay cambios');
    }
    const posicion = this.registrosPorNLote.findIndex(
      (registro) => registro.id === camion.id
    );
    return posicion + 1;
  }

  descargarDocumento() {
    console.log('Descargar documento');
    if (this.tablaCamion) {
      const camionesRecepcionFormateados = this.camionesRecepcion.map(
        (camion) => ({
          'Fecha de Origen': camion.fOrigen,
          'Hora de Origen': camion.hOrigen,
          'Fecha de Destino': camion.fDestino,
          'Hora de Destino': camion.hDestino,
          Referencia: camion.observacion,
          'N° de Lote': camion.posicion + 1,
          'Guía Despacho': camion.idTransporteOrigen,
          Patente: camion.idTransporteDestino,
          Batea: camion.idCarroDestino,
          'Bruto de Origen': camion.brutoOrigen,
          'Bruto de Destino': camion.brutoDestino,
          'Tara de Origen': camion.taraOrigen,
          'Tara de Destino': camion.taraDestino,
          'Neto Húmedo de Origen': camion.netoHumedoOrigen,
          'Neto Húmedo de Destino': camion.netoHumedoDestino,
          'Diferencia Húmeda': camion.diferenciaHumeda,
          'Diferencia Seca': camion.diferenciaSeca,
          'Bodega' : camion.nombreBodega,
          'Sellos de Origen': camion.sellosOrigen,
          'Sellos de Destino': camion.sellosDestino,
          Estado: camion.estado,
        })
      );
      Notiflix.Notify.success('Documento de camiones descargado');
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
        camionesRecepcionFormateados
      );
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Camiones de Recepción': worksheet },
        SheetNames: ['Camiones de Recepción'],
      };
      XLSX.writeFile(workbook, 'Camiones de Recepción.xlsx');
    } else if(this.tablaVagon){
      const vagonRecepcionFormateados = this.vagonesRecepcion.map(
        (vagon) => ({
          'Fecha de Origen': vagon.fOrigen,
          'Hora de Origen': vagon.hOrigen,
          'Fecha de Destino': vagon.fDestino,
          'Hora de Destino': vagon.hDestino,
          Referencia: vagon.observacion,
          'N° de Lote': vagon.posicion + 1,
          'Guía Despacho': vagon.idTransporteOrigen,
          'Carro' : vagon.idCarro,
          Patente: vagon.idTransporteDestino,
          Batea: vagon.idCarroDestino,
          'Bruto de Origen': vagon.brutoOrigen,
          'Bruto de Destino': vagon.brutoDestino,
          'Tara de Origen': vagon.taraOrigen,
          'Tara de Destino': vagon.taraDestino,
          'Neto Húmedo de Origen': vagon.netoHumedoOrigen,
          'Neto Húmedo de Destino': vagon.netoHumedoDestino,
          'Diferencia Húmeda': vagon.diferenciaHumeda,
          'Diferencia Seca': vagon.diferenciaSeca,
          'Bodega' : vagon.nombreBodega,
          'Sellos de Origen': vagon.sellosOrigen,
          'Sellos de Destino': vagon.sellosDestino,
          Estado: vagon.estado,
        })
      );
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
        vagonRecepcionFormateados
        );
      const workbook: XLSX.WorkBook = {
          Sheets: { 'Vagones de Recepción': worksheet },
          SheetNames: ['Vagones de Recepción'],
        };
      XLSX.writeFile(workbook, 'Camiones de Recepción.xlsx');
      Notiflix.Notify.success('Documento de vagones descargado');  
    
    }


    }
    // } else if (this.tablaVagon){

    // }else if (this.tablaInventario){
    //   console.log('Descargar inventario');
    //   }
    // else if (this.tablaIngresos){
    // }else if (this.tablaDespachos){
    //   console.log('Descargar despachos');
    //   }
    //   }

  wip() {
    Notiflix.Notify.warning('En construcción');
  }

  calcularPesoBrutoTotal(): number {
    return parseFloat(this.lotes.reduce((total, lote) => total + parseFloat(lote.pesoBrutoHumedo), 0).toFixed(2));
  }
  
  calcularPesoTaraTotal(): number {
    return parseFloat(this.lotes.reduce((total, lote) => total + parseFloat(lote.pesoTara), 0).toFixed(2));
  }
  
  calcularPesoNetoTotal(): number {
    return parseFloat(this.lotes.reduce((total, lote) => total + parseFloat(lote.pesoNetoHumedo), 0).toFixed(2));
  }
  
  calcularDiferenciaTotal(): number {
    return parseFloat(this.lotes.reduce((total, lote) => total + parseFloat(lote.diferenciaPeso), 0).toFixed(2));
  }
}
