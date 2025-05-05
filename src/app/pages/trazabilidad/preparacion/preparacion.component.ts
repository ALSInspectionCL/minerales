import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RecepcionTransporteService } from 'src/app/services/recepcion.service';

@Component({
  selector: 'app-preparacion',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './preparacion.component.html',
  styleUrl: './preparacion.component.scss'
})
export class PreparacionComponent {

  id: any;
  displayedColumns: string[] = [
    '#',
    'name',
    'email',
    'status',
    // 'action',
  ];
  paginator: MatPaginator;

  constructor(public activatedRouter: ActivatedRoute, public apirecep: RecepcionTransporteService,private fb: FormBuilder, private http: HttpClient,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      nLote: any;
      opcion: any
    },
  ) {

    this.obtenerMecanica()

    this.formulario = this.fb.group({
      observacion: ['', Validators.required]
    });
    
    this.id = activatedRouter?.snapshot?.paramMap?.get('id');
    // this.courseDetail = ''.getCourse().filter((x) => x?.Id === +this.id)[0];

    // Asignar pagina al paginator
    this.dataSource.paginator = this.paginator;
  }

  dataSource = new MatTableDataSource<any>();
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  obtenerMecanica(){
    const api = 'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/'

    this.http.get<any[]>(api).subscribe((res)=> {
      console.log(res)
      // Filtrar los datos por nLote
      const filteredData = res.filter(item => item.nLote === this.data.nLote);
      //Ordenar los datos por nSubLote
      filteredData.sort((a, b) => a.nSubLote - b.nSubLote);
      console.log(filteredData)
      // Asignar los datos filtrados a la dataSource  
      this.dataSource.data = filteredData; // Asigna los lotes obtenidos a la variable

    })

  }


  formulario: FormGroup;
  fechaActual = new Date();


  guardarCambios() {
    if (this.formulario.valid) {
      const datos = {
        fecha: this.fechaActual,
        observacion: this.formulario.value.observacion
      };
      console.log('Datos guardados:', datos);
      // Aquí puedes agregar lógica para enviar los datos al backend si es necesario
    }
  }
}
