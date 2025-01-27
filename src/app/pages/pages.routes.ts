import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { AppAccountSettingComponent } from './account-setting/account-setting.component'
import { FormulariosComponent } from './formularios/formularios.component';
import { LotesComponent } from './lotes/lotes.component';
import { RecepcionComponent } from './recepcion/recepcion.component';
import { DespachoComponent } from './despacho/despacho.component';
import { InventarioComponent } from './inventario/inventario.component';
import { RoleGuard } from '../guards/rol.guard';


export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Bienvenido a Minerales',
    },
  },{
    path: 'perfil',
    component: AppAccountSettingComponent,
    data: {
      title: 'Perfil de Usuario',
    },
  },{
    path: 'formularios',
    component: FormulariosComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: 'Admin',      
      title: 'Cración de Servicios y Solicitudes',
    }
  },{
    path: 'lotes',
    component: LotesComponent,
    data: {
      title: 'Gestión de Lotes',
    }
  },{
    path: 'recepcion',
    component: RecepcionComponent,
    data: {
      title: 'Gestión de Recepción',
    }
  },{
    path: 'despacho',
    component: DespachoComponent,
    data: {
      title: 'Gestión de Despachos',
    }
  },{
    path: 'inventario',
    component: InventarioComponent,
    data: {
      title: 'Inventario de Bodegas',
    }
  }

];
