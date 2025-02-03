import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RolService {
  constructor(private http: HttpClient) { }
  private static readonly VALID_TOKEN = '14ff49485f9da000d9a22d9512cfb14beef0fb4c'; // Cambia esto por el token que deseas verificar

  public static isTokenValid(): boolean {
      const token = localStorage.getItem('token');
      return token === RolService.VALID_TOKEN;
  }

  Perfil(email: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    });
    const body = { email };
    return this.http.post(environment.apiUrl + 'profile', body, { headers });
  }

  getAllUsers(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get('https://control.als-inspection.cl/api/usuarios_api/usuarios/?habilitado=true', { headers });
  }

  checkRol(email: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    });

    // Usa GET para obtener la información del usuario, incluyendo su rol
    return this.http.get(`https://control.als-inspection.cl/api_min/api/user/?search=${email}`, { headers });
  }

  hasRole(email: string, expectedRole: string): Observable<boolean> {
    return this.checkRol(email).pipe(
      map(response => {
        // Accede directamente al campo 'rol' en la respuesta
        console.log('Respuesta completa:', response); // Para depuración
        console.log('Rol del usuario:', response[0].rol); // Para depuración
        return response[0].rol === expectedRole;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al verificar el rol:', error);

        return of(false); // Retorna false en caso de error
      })
    );
  }

  hasAnyRole(email: string, roles: string[]): Observable<boolean> {
    return this.getRoles(email).pipe(
      map((userRoles: string[]) => roles.some((role) => userRoles.includes(role)))
    );
  }

  getRoles(email: string): Observable<string[]> {
    return this.checkRol(email).pipe(
      map(response => {
        // Accede directamente al campo 'rol' en la respuesta
        console.log('Respuesta completa:', response); // Para depuración
        console.log('Rol del usuario:', response[0].rol); // Para depuración
        return [response[0].rol]; // Devuelve el rol del usuario como un arreglo
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener el rol:', error);

        return of([]); // Retorna un arreglo vacío en caso de error
      })
    );
  }


}
  // Ejemplo de uso de rolService
  // this.rolService.hasRole('usuario@example.com', 'Admin').subscribe(hasRole => {
  //   if (hasRole) {
  //     console.log('El usuario tiene el rol de Admin');
  //   } else {
  //     console.log('El usuario no tiene el rol de Admin');
  //   }
  // });



