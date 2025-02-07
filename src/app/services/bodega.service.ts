import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface bodega {
  idBodega: number;
  nombreBodega: string;
  total: number;
}
export interface detalleBodega {
  tipo: string;
  fecha: string;
  hora: string;
  ingreso: number;
  despacho: number;
  idBodega: number;
}

@Injectable({
  providedIn: 'root',
})
export class Bodega {
  private apiBodega = 'https://control.als-inspection.cl/api_min/api/bodega/';
  private apiDetalle = 'https://control.als-inspection.cl/api_min/api/detalle-bodega/';

  constructor(private http: HttpClient) { }

  // Función para modificar el total de una bodega
  modificarTotalBodega(idBodega: number,nuevoTotal: number): Observable<bodega> {
    const url = `${this.apiBodega}${idBodega}/`; // URL para la bodega específica
    const body = {
      total: nuevoTotal
    }; // Cuerpo de la solicitud con el nuevo total
    return this.http.patch<bodega>(url, body); // Realizar la solicitud PUT
  }

    // Función para crear un detalle de bodega
    crearDetalleBodega(tipo: string, ingreso: number, despacho: number, idBodega: number): Observable<detalleBodega> {
      const url = this.apiDetalle; // URL para crear un nuevo detalle
      const fecha = new Date(); // Fecha actual

      // Formatear la fecha a YYYY-MM-DD
      const fechaFormateada = fecha.toISOString().split('T')[0]; // Obtiene la parte de la fecha

      // Formatear la hora a HH:MM
      const horaFormateada = fecha.toTimeString().split(' ')[0].slice(0, 5); // Obtiene HH:MM

      const body: detalleBodega = {
        tipo: tipo,
        fecha: fechaFormateada, // Usar la fecha formateada
        hora: horaFormateada, // Usar la hora formateada
        ingreso: ingreso,
        despacho: despacho,
        idBodega: idBodega,
      };

      return this.http.post<detalleBodega>(url, body); // Realiza la solicitud POST

    }

    obtenerTotalBodega(idBodega: number): Observable<bodega> {
      const url = `${this.apiBodega}${idBodega}/`; // URL para la bodega específica
      return this.http.get<bodega>(url); // Realiza la solicitud GET
    }

    getBodegas(){
      const url = this.apiBodega; // URL para obtener todas las bodegas
      return this.http.get<bodega[]>(url); // Realiza la solicitud GET
    }



}
