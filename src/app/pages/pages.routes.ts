import { BalanceComponent } from './balance/balance.component';
import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { AppAccountSettingComponent } from './account-setting/account-setting.component';
import { FormulariosComponent } from './formularios/formularios.component';
import { LotesComponent } from './lotes/lotes.component';
import { RecepcionComponent } from './recepcion/recepcion.component';
import { DespachoComponent } from './despacho/despacho.component';
import { InventarioComponent } from './inventario/inventario.component';
import { guardLogin, RoleGuard } from '../guards/rol.guard';
import { ReportesComponent } from './reportes/reportes.component';
import { TrazabilidadComponent } from './trazabilidad/trazabilidad.component';
import { DethumedadComponent } from './dethumedad/dethumedad.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    canActivate: [guardLogin],
    component: StarterComponent,
    data: {
      title: 'Bienvenido a Minerales',
    },
  },
  {
    path: 'perfil',
    canActivate: [guardLogin],    
    component: AppAccountSettingComponent,
    data: {
      title: 'Perfil de Usuario',
    },
  },
  {
    path: 'formularios',
    component: FormulariosComponent,
    canActivate: [RoleGuard, guardLogin],
    data: {
      expectedRoles: ['Admin', 'Operador', 'Encargado'],
      title: 'Creación de Servicios y Solicitudes',
    },
  },
  {
    path: 'lotes',
    canActivate: [guardLogin],
    component: LotesComponent,
    data: {
      title: 'Gestión de Lotes',
    },
  },
  {
    path: 'recepcion',
    canActivate: [guardLogin],
    component: RecepcionComponent,
    data: {
      title: 'Recepción',
    },
  },
  {
    path: 'despacho',
    canActivate: [guardLogin],
    component: DespachoComponent,
    data: {
      title: 'Despachos',
    },
  },  {
    path: 'dethumedad',
    canActivate: [guardLogin],
    component: DethumedadComponent,
    data: {
      title: 'Determinación de Humedad',
    },
  },
  {
    path: 'inventario',
    canActivate: [guardLogin],
    component: InventarioComponent,
    data: {
      title: 'Inventario de Bodegas',
    },
  },
  {
    path: 'reportes',
    canActivate: [guardLogin],
    component: ReportesComponent,
    data: {
      title: 'Reportabilidad',
    },
  },
  {
    path: 'balance',
    canActivate: [guardLogin],
    component: BalanceComponent,
    data: {
      title: 'Gestión de Balance',
    },
  },
  {
    path: 'trazabilidad',
    canActivate: [guardLogin],
    component: TrazabilidadComponent,
    data: {
      title: 'Trazabilidad de la muestra',
    },
  },
];
