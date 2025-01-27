import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private apiUrl = 'https://tu-api.com/servicios';

  constructor(private http: HttpClient) { }

  crearSolicitud(servicio: any) {
    return this.http.post(this.apiUrl, servicio);
  }

}