import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrazabilidadService {

  private apiUrl = 'https://control.als-inspection.cl/api_min/api/trazabilidad/'; // Cambia la URL según tu API

  constructor(private http: HttpClient) { }

  getTrazabilidad(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getTrazabilidadPorLote(nLote: string): Observable<any> {
    const url = `${this.apiUrl}?nLote=${encodeURIComponent(nLote)}/`;
    return this.http.get<any>(url);
  }


}
