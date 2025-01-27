import { Routes } from '@angular/router';

import { AppErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';
import { ChangepassComponent } from './changepass/changepass.component';
import { AppAccountSettingComponent } from '../account-setting/account-setting.component'

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'error',
        component: AppErrorComponent,
      },

      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'changepass',
        component: ChangepassComponent,
      },
      {
        path: 'register',
        component: AppSideRegisterComponent,
      },
    ],
  },
];
