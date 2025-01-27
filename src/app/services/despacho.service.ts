import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loteDespacho } from '../pages/despacho/despacho.component';


@Injectable({
  providedIn: 'root'
})
export class DespachoTransporteService {
  private apiUrl = 'https://control.als-inspection.cl/api_min/api/despacho-camion/';
  private apiLotes = 'https://control.als-inspection.cl/api_min/api/lote-despacho/'
  private apiEmbarques = 'https://control.als-inspection.cl/api_min/api/despacho-embarque/'
  constructor(private http: HttpClient) { }

  getDespachoTransporte(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDespachoTransporteBynLote(nLote: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '?search=' + nLote);
  }

  crearDespachoTransporte(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  actualizarLote(lote : loteDespacho): Observable<any> {
    return this.http.put(`${this.apiLotes}${lote.id}/`, lote);
  }

  obtenerCantidadTransportePorLote(nLote: string): Observable<{ cantCamiones: number, cantVagones: number }> {
    return this.http.get<{ cantCamiones: number, cantVagones: number }>(`https://control.als-inspection.cl/api_min/api/lote-despacho/${nLote}`);
  }

  getEmbarqueBynLote(nLote: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiEmbarques + '?search=' + nLote);
  }

  crearSubLote(data: any): Observable<any> {
    return this.http.post(this.apiEmbarques, data);
  }

  getSubLotesBynLote(nLote: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiEmbarques + '?search=' + nLote);
  }


//   actualizarValoresLote(nLote : number): void {
//     this.getRecepcionTransporteBynLote(nLote).subscribe(
//       (recepcionTransporte) => {
//         // Inicializa las cantidades
//         let cantCamiones = 0;
//         let cantVagones = 0;
//         let cantBigbag = 0;

//         // Suma las cantidades según el tipo de transporte
//         for (const transporte of recepcionTransporte) {
//           switch (transporte.tipoTransporte) {
//             case 'camion':
//               cantCamiones++;
//               break;
//             case 'vagon':
//               cantVagones++;
//               break;
//             case 'bigbag':
//               cantBigbag++;
//               break;
//           }
//         }

//         // Actualiza la información del lote
//         this.informacionLote.cantCamiones = cantCamiones;
//         this.informacionLote.cantVagones = cantVagones;
//         this.informacionLote.cantBigbag = cantBigbag;

//         console.log('Información del lote actualizada:', this.informacionLote);
//       },
//       (error) => {
//         console.error('Error al cargar la información de recepcion-transporte:', error);
//       }
//     );
// }
}
