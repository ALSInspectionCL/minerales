import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActizService {
  private apiUrl = 'https://api.actizlab.com.br/odata/AnalysisRequest/';
  private loginUrl = 'https://api.actizlab.com.br/api/auth/login';
  private currentToken: string | null = null;

  constructor(private http: HttpClient) { }

  login(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    // const data = {
    //   "username": "RLAGOS",
    //   "password": "Renita2206!",
    //   "tenantId": "als"
    // };
    const data = {
      "username": "UsuarioAPI",
      "password": "API2o25!!",
      "tenantId": "als"
    }
    return this.http.post<any>(this.loginUrl, data, { headers });
  }

  private privateGetDatos(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Construir los parámetros OData
    const params = new HttpParams()
      .set('$expand', 'Entitystatus($select=name)');

    const fullUrl = this.apiUrl;

    return this.http.get<any>(fullUrl, { headers, params }).pipe(
      tap(data => console.log('API Response Data:', data))
    );
  }

  getDatos(): Observable<any> {
    return this.login().pipe(
      switchMap((response: any) => {
        console.log(response)
        this.currentToken = response.token;
        return this.privateGetDatos(this.currentToken!);
      }))
  }

  private privateGetAnalysisRequestWithDUS(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Construir los parámetros OData
    const params = new HttpParams()
      .set('$filter', "DUS ne null and DUS ne 'N/A'")
      .set('$select', 'name,code,DUS')
      .set('$expand', 'Entitystatus($select)');

    const fullUrl = this.apiUrl;

    return this.http.get<any>(fullUrl, { headers, params }).pipe(
      tap(data => console.log('API Response Data (Analysis Request with DUS):', data))
    );
  }

  getAnalysisRequestWithDUS(): Observable<any> {
    return this.login().pipe(
      switchMap((response: any) => {
        console.log(response);
        this.currentToken = response.token;
        return this.privateGetAnalysisRequestWithDUS(this.currentToken!);
      })
    );
  }

  // Función temporal para explorar los metadatos de la API
  private privateGetMetadata(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Obtener metadatos OData
    const metadataUrl = 'https://api.actizlab.com.br/odata/$metadata';

    return this.http.get(metadataUrl, { headers, responseType: 'text' }).pipe(
      tap(data => console.log('API Metadata:', data))
    );
  }

  getMetadata(): Observable<any> {
    return this.login().pipe(
      switchMap((response: any) => {
        console.log(response);
        this.currentToken = response.token;
        return this.privateGetMetadata(this.currentToken!);
      })
    );
  }

  // Función temporal para obtener un registro de ejemplo sin filtros
  private privateGetSampleData(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Obtener solo 1 registro para ver la estructura
    const params = new HttpParams()
      .set('$top', '1');

    const fullUrl = this.apiUrl;

    return this.http.get<any>(fullUrl, { headers, params }).pipe(
      tap(data => {
        console.log('Sample Data Structure:', data);
        if (data.value && data.value.length > 0) {
          console.log('Available Fields:', Object.keys(data.value[0]));
        }
      })
    );
  }

  getSampleData(): Observable<any> {
    return this.login().pipe(
      switchMap((response: any) => {
        console.log(response);
        this.currentToken = response.token;
        return this.privateGetSampleData(this.currentToken!);
      })
    );
  }

}
