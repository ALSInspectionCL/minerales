import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Servicio {
  id?: number;
  refAls: string;
  nServ: string;
  fServ: string;
  lServ: string;
  eServ: string;
  rServ: string;
  tServ: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  private apiUrl = 'https://control.als-inspection.cl/api_min/api/servicio/';

  constructor(private http: HttpClient) { }

  crearServicio(servicio: any) {
    return this.http.post(this.apiUrl, servicio);
  }

  getServicios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getServicioById(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.apiUrl}/${id}`);
  }

  actualizarServicio(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/`, datos); // O PATCH si solo envías campos modificados
  }

}
