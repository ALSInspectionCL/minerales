import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import {CommonModule} from '@angular/common';
import { SerialPort } from 'serialport';
import { NgxSerial } from 'ngx-serial';
import { interval } from 'rxjs';

@Component({
  selector: 'app-dethumedad',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent],
  templateUrl: './dethumedad.component.html',
  styleUrl: './dethumedad.component.scss'
})
export class DethumedadComponent {
  datosBalanza: any[] = [];
  peso: number;
  pesoActual: number = 0;
  serial: NgxSerial;


  constructor(private cdr: ChangeDetectorRef) {
    this.serial = new NgxSerial(this.dataHandler);
  }
  
  ngOnInit(): void {

  }

dataHandler(data: string) {
  console.log(data);
  const peso = data.trim();
  this.pesoActual = parseFloat(peso);
}

guardarPeso() {
  if (this.pesoActual !== 0 || this.pesoActual !== undefined) {
    const dato = {
      id: this.datosBalanza.length + 1,
      peso: this.pesoActual
    };
    this.datosBalanza.push(dato);
    this.pesoActual = 0;
  }else{
    console.log('No hay peso para guardar');
  }
}
}
