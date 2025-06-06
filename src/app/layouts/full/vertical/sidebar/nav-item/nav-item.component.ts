import {
  Component,
  HostBinding,
  Input,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { NavService } from '../../../../../services/nav.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { RolService } from 'src/app/services/rol.service';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [TranslateModule, TablerIconsModule, MaterialModule, CommonModule],
  templateUrl: './nav-item.component.html',
  styleUrls: [],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ]),
  ],
})
export class AppNavItemComponent implements OnChanges {
  @Output() toggleMobileLink: any = new EventEmitter<void>();
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();

  expanded: any = false;
  disabled: any = false;
  twoLines: any = false;
  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() item: NavItem | any;
  @Input() depth: any;

  constructor(public navService: NavService, public router: Router, private rol : RolService) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  showItem: boolean;

  ngOnInit(): void{
    const adminSections = ['Administración'];

    // Verificamos si la sección actual es una de administración
    if (adminSections.includes(this.item.displayName)) {
      this.rol.checkRol(localStorage.getItem('email')!).subscribe((res) => {
        // Comprobamos el rol del usuario
        const userRole = res[0].rol;
    
        // Si es un cliente, ocultamos la sección de administración
        if (userRole === 'Cliente') {
          this.item.displayName === 'Recepción'  || this.item.displayName === 'Inventario' || this.item.displayName === 'Despachos' || this.item.displayName === 'Reportes' || this.item.displayName === 'Inicio'
          this.showItem = false;
        } else {
          this.showItem = true; // Si no es cliente, mostramos la sección
        }
      });
    } else {
      // Si no es una sección de administración, la mostramos
      this.showItem = true;
    }
}


  ngOnChanges() {
    this.navService.currentUrl.subscribe((url: string) => {
      if (this.item.route && url) {
        // console.log(`Checking '/${this.item.route}' against '${url}'`);
        this.expanded = url.indexOf(`/${this.item.route}`) === 0;
        this.ariaExpanded = this.expanded;
        //console.log(`${this.item.route} is expanded: ${this.expanded}`);
      }
    });
  }

  onItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
      
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
    //scroll
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    if (!this.expanded){
    if (window.innerWidth < 1024) {
      this.notify.emit();
    }
  }
  }

  onSubItemSelected(item: NavItem) {
    if (!item.children || !item.children.length){
      if (this.expanded && window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }
}
