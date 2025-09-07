import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImoEstibaService {

  apiEstiba = 'https://control.als-inspection.cl/api_min/api/factor-estiba/';
  apiDensidad = 'https://control.als-inspection.cl/api_min/api/densidad/';


  constructor(private http: HttpClient) { }

  getEstiba(): Observable<any> {
    return this.http.get<any>(this.apiEstiba);
  }

  getDensidad(): Observable<any> {
    return this.http.get<any>(this.apiDensidad);
  }

  actualizarEstiba(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiEstiba}${id}/`, data);
  }

  actualizarDensidad(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiDensidad}${id}/`, data);
  }

  crearEstiba(data: any): Observable<any> {
    return this.http.post(this.apiEstiba, data);
  }

  crearDensidad(data: any): Observable<any> {
    return this.http.post(this.apiDensidad, data);
  }

}
