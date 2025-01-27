import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, NgIf, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})

export class LoginComponent {
  hide = true;
  options = this.settings.getOptions();

  constructor(private settings: CoreService, private router: Router, private loginService : LoginService, private notificacionesService : NotificacionesService) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    this.notificacionesService.showloading('Iniciando sesión...');

    this.loginService.login(this.form.value).subscribe({
      next: (resp: any) => {
        this.notificacionesService.removeLoading();
        
        if (resp.token) {
          // Almacenar el token en localStorage
          localStorage.setItem('token', resp.token);
        }
        if (resp.user) {
          // Almacenar los datos del usuario en localStorage
          const user = resp.user;
          localStorage.setItem('idUsuario', user.idUsuario);
          localStorage.setItem('rut', user.rut);
          localStorage.setItem('nombre', user.nombre);
          localStorage.setItem('apellidoPaterno', user.apellidoPaterno);
          localStorage.setItem('apellidoMaterno', user.apellidoMaterno || ''); // En caso de ser null, almacenamos una cadena vacía
          localStorage.setItem('email', user.email);
          localStorage.setItem('changePass', user.changePass.toString());

          if (user.descripcionCargo && user.descripcionCargo.nombreCargo) {
            localStorage.setItem('nombreCargo', user.descripcionCargo.nombreCargo);
          }
        }
        // Redirigir a otra página después del inicio de sesión
        this.router.navigateByUrl('/');
      },
      error: (error: any) => {
        console.log('inicio sesión error: ' + error);
        this.notificacionesService.removeLoading();
        this.notificacionesService.failure( error.error.error);
      },
    
    });
  }

  toggleShowPassword() {
    this.hide = !this.hide;
  }
}
