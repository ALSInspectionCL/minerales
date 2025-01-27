import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface loteRecepcion {
  id:number;
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

export interface loteDespacho {
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

@Injectable({
  providedIn: 'root',
})
export class LoteService {
  private apiUrl = 'http://127.0.0.1:8000/api/lote'; // Reemplaza con la URL de tu API
  private recepUrl = 'http://127.0.0.1:8000/api/lote-recepcion/?search=';
  private despUrl = 'http://127.0.0.1:8000/api/lote-despacho/?search=';
  constructor(private http: HttpClient) {}

  crearLote(idServicio: number, idSolicitud: number, nLote : string, observacion : string, tipoTransporte : string) {
    
    let lote = {
      nLote: nLote,
      fLote: new Date().toISOString().slice(0, 10),
      observacion: observacion,
      tipoTransporte: tipoTransporte,
      cantCamiones: 0,
      cantVagones: 0,
      cantBigbag: 0,
      pesoBrutoHumedo: 0,
      pesoTara: 0,
      pesoNetoHumedo: 0,
      porcHumedad: 0,
      pesoNetoSeco: 0,
      diferenciaPeso: 0,
      servicio: idServicio,
      solicitud: idSolicitud,
    };

    return this.http.post(this.apiUrl, lote);
  }

  existeLote(nLote: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}exists/${nLote}`);
  }

  getLoteBynLote(nLote: string): Observable<loteRecepcion[]> {
    return this.http.get<loteRecepcion[]>(`${this.recepUrl}${nLote}`);
}
  getLoteBynLoteD(nLote: string): Observable<loteDespacho[]> {
  return this.http.get<loteDespacho[]>(`${this.despUrl}${nLote}`);
}
}
