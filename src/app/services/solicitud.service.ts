import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Solicitud {
  id?: number;
  nSoli: string;
  nServ: string;
  FiSoli: string;
  FtSoli: string;
  lSoli: string;
  eSoli: string;
  rSoli: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private apiUrl = 'https://control.als-inspection.cl/api_min/api/solicitud/';

  constructor(private http: HttpClient) { }

  crearSolicitud(servicio: any) {
    return this.http.post(this.apiUrl, servicio);
  }

  getSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSolicitudById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.apiUrl}/${id}`);
  }

  updateSolicitud(id: number, solicitud: Solicitud): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/`, solicitud);
  }

}