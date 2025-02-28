import { Routes } from '@angular/router';

import { AppErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';
import { AppAccountSettingComponent } from '../account-setting/account-setting.component'
import { MailresetpassComponent } from './mailresetpass/mailresetpass.component';
import { ResetpassComponent } from './resetpass/resetpass.component';

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
        path: 'register',
        component: AppSideRegisterComponent,
      },
      {
        path: 'mailresetpass',
        component: MailresetpassComponent,
      },
      {
        path: 'resetpass',
        component: ResetpassComponent,
      },
    ],
  },
];
