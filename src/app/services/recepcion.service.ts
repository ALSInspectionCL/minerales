import { loteRecepcion } from './lote.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecepcionTransporteService {
  private apiUrl = 'http://127.0.0.1:8000/api/recepcion-transporte/';
  private apiLotes = 'http://127.0.0.1:8000/api/lote-recepcion/'
  constructor(private http: HttpClient) { }

  getRecepcionTransporte(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRecepcionTransporteBynLote(nLote: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '?search=' + nLote);
  }

  crearRecepcionTransporte(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  actualizarLote(lote : loteRecepcion): Observable<any> {
    return this.http.put(`${this.apiLotes}${lote.id}/`, lote);
  }

  obtenerCantidadTransportePorLote(nLote: string): Observable<{ cantCamiones: number, cantVagones: number }> {
    return this.http.get<{ cantCamiones: number, cantVagones: number }>(`http://127.0.0.1:8000/api/lote-recepcion/${nLote}`);
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