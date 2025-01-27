import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Menu',
  },
  {
    displayName: 'Inicio',
    iconName: 'home',
    route: '/home',
  },
  {
    displayName: 'General',
    iconName:  'stack-2',
    route: '/home/lotes'
  },
  {
    displayName: 'Recepción',
    iconName:  'truck-return',
    route: '/home/recepcion'
  },
  {
    displayName: 'Inventario',
    iconName: 'building-warehouse',
    route: '/home/inventario',
  },
  {
    displayName: 'Despachos',
    iconName:  'truck-delivery',
    route: '/home/despacho'
  },
  // {
  //   displayName: 'Inicio de Sesión',
  //   iconName: 'lock',
  //   route: '/authentication/login',
  // },
  {
    navCap: 'MIN-USUARIO',
  },
  {
    displayName: 'Administración',
    iconName:  'forms',
    route: '/home/formularios'
  },
  
  
  // {
  //   displayName: 'Registrar',
  //   iconName: 'home',
  //   route: '/authentication/register',
  // },
  // {
  //   navCap: 'Otro',
  // },
  // {
  //   displayName: 'Menú',
  //   iconName: 'box-multiple',
  //   route: '/menu-level',
  //   children: [
  //     {
  //       displayName: 'Menú 1',
  //       iconName: 'point',
  //       route: '/menu-1',
  //       children: [
  //         {
  //           displayName: 'Menú 1',
  //           iconName: 'point',
  //           route: '/menu-1',
  //         },

  //         {
  //           displayName: 'Menú 2',
  //           iconName: 'point',
  //           route: '/menu-2',
  //         },
  //       ],
  //     },

  //     {
  //       displayName: 'Menú 2',
  //       iconName: 'point',
  //       route: '/menu-2',
  //     },
  //   ],
  // },
  // {
  //   displayName: 'Deshabilitado',
  //   iconName: 'ban',
  //   route: '/disabled',
  //   disabled: true,
  // },
  // {
  //   displayName: 'Chip',
  //   iconName: 'mood-smile',
  //   route: '/',
  //   chip: true,
  //   chipClass: 'bg-primary text-white',
  //   chipContent: '9',
  // },
  // {
  //   displayName: 'Outlined',
  //   iconName: 'mood-smile',
  //   route: '/',
  //   chip: true,
  //   chipClass: 'b-1 border-primary text-primary',
  //   chipContent: 'outlined',
  // },
  // {
  //   displayName: 'Link Externo',
  //   iconName: 'star',
  //   route: 'https://www.google.com/',
  //   external: true,
  // },
];
