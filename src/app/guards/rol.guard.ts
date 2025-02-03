import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { RolService } from '../services/rol.service'; // Importa tu servicio de roles
import { map } from 'rxjs/operators';
import Notiflix from 'notiflix';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private rolService: RolService, // Inyecta el servicio de roles
    private router: Router // Inyecta el Router para redireccionar
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const email = localStorage.getItem('email'); // Obtén el email del usuario desde el localStorage
    const expectedRoles = route.data['expectedRoles']; // Obtén la lista de roles esperados desde la ruta

    if (!email) {
      // Si no hay un email, redirige al login
      return this.router.createUrlTree(['/authentication/login']);
    }

    // Verifica si el usuario tiene alguno de los roles esperados
    return this.rolService.hasAnyRole(email, expectedRoles).pipe(
      map((hasRole) => {
        if (hasRole) {
          return true; // Permite el acceso
        } else {
          // Redirige a una página de acceso denegado
          Notiflix.Notify.failure('No puede acceder a esta dirección');
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}

