import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  private apiUrl = 'https://control.als-inspection.cl/api_min/solicitud/';

  constructor(private http: HttpClient) { }

  crearServicio(servicio: any) {
    return this.http.post(this.apiUrl, servicio);
  }

}
