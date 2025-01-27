import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangepassService {
  constructor(private http: HttpClient) { }

  changePass(data : any){
    return this.http.post(environment.apiUrl + 'changepass', data);
  }

}
