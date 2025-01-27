import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActualizarLoteService {
  private apiUrlLote = 'http://127.0.0.1:8000/api/lote-recepcion/'; // URL para los lotes
  private apiUrlRecepcionTransporte = 'http://127.0.0.1:8000/api/recepcion-transporte/'; // URL para recepcion-transporte

  constructor(private http: HttpClient) { }

  // Método para obtener la información del lote
  cargarInformacionLote(nLote: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlLote}/${nLote}`);
  }

  // Método para obtener todos los registros de recepcion-transporte
  cargarRecepcionTransporte(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlRecepcionTransporte);
  }
}