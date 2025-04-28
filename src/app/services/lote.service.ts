import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private apiUrl = 'https://control.als-inspection.cl/api_min/api/lote'; // Reemplaza con la URL de tu API
  private recepUrl = 'https://control.als-inspection.cl/api_min/api/lote-recepcion/?search=';
  private despUrl = 'https://control.als-inspection.cl/api_min/api/lote-despacho/?search=';
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

  getAllLotes(): Observable<any> {
    return this.http.get('https://control.als-inspection.cl/api_min/api/lote-recepcion/');
  }

  getLotesTrazabilidad(): Observable<any> {
    return this.http.get('https://control.als-inspection.cl/api_min/api/trazabilidad/');
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

  eliminarTrazabilidad(id: number): Observable<any> {
    return this.http.delete(`https://control.als-inspection.cl/api_min/api/trazabilidad/${id}/`);
  }

getLotesByServicioAndSolicitud(servicio: number, solicitud: number): Observable<any> {
  const params = new HttpParams()
    .set('servicio', servicio.toString())
    .set('solicitud', solicitud.toString());

  return this.http.get(this.apiUrl, { params });
}
}
