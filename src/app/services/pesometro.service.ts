import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PesometroService {

  api = 'https://control.als-inspection.cl/api_min/api/equipo-control/'

  constructor(private http: HttpClient) { }

  obtenerPesometro(): Observable<any> {
    return this.http.get(`${this.api}1/`); // o cambiar por lista y tomar el primero si no tienes endpoint por ID
  }

  actualizarPesometro(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}${id}/`, data);
  }

  crearPesometro(data: any): Observable<any> {
    return this.http.post(this.api, data);
  }

}
