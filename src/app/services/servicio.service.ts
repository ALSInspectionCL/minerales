import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  private apiUrl = 'http://127.0.0.1:8000/api/solicitud/';

  constructor(private http: HttpClient) { }

  crearServicio(servicio: any) {
    return this.http.post(this.apiUrl, servicio);
  }

}