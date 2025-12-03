import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, Injectable, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RecepcionTransporteService } from 'src/app/services/recepcion.service';
import * as ExcelJS from 'exceljs';
import { EditsobreComponent } from '../editsobre/editsobre.component';
import Notiflix from 'notiflix';
import { DateRange, MAT_DATE_RANGE_SELECTION_STRATEGY, MatDatepickerModule, MatDateRangeSelectionStrategy } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';


@Injectable()
export class FiveDayRangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) { }

  selectionFinished(date: D | null): DateRange<D> {
    return this._createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createFiveDayRange(activeDate);
  }

  private _createFiveDayRange(date: D | null): DateRange<D> {
    if (date) {
      const start = this._dateAdapter.addCalendarDays(date, -2);
      const end = this._dateAdapter.addCalendarDays(date, 2);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-preparacion',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule, CommonModule, ReactiveFormsModule, MatDatepickerModule, MatInputModule],
  templateUrl: './preparacion.component.html',
  styleUrl: './preparacion.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class PreparacionComponent {

  id: any;
  displayedColumns: string[] = [
    'subLote',
    'fid',
    'fcd',
    'fd',
    'observacion',
    'numguia',
    'lab',
    'fll',
    'pais',
    'estado',
    'opciones',
  ];

  displayedColumns2: string[] = [
    'subLote',
    'observacion',
    'estado',
    'opciones',
  ];

  @ViewChild('paginatorInterno') paginatorInterno!: MatPaginator;
  @ViewChild('paginatorExterno') paginatorExterno!: MatPaginator;

  constructor(public activatedRouter: ActivatedRoute, public apirecep: RecepcionTransporteService, private fb: FormBuilder, private http: HttpClient,
    private dialogRef: MatDialogRef<PreparacionComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      nLote: any;
      subLote: any,
      opcion: any,
      nSobre?: any,
      idSubLote?: number | null
    },
  ) {

    this.cargarLote(data.nLote)
    this.getPreparacion(data.nLote)
    
    console.log('PreparacionComponent inicializado con:');
    console.log('- nSobre:', data.nSobre);
    console.log('- idSubLote:', data.idSubLote);

    this.formulario = this.fb.group({
      observacion: ['', Validators.required]
    });

    this.id = activatedRouter?.snapshot?.paramMap?.get('id');
    // this.courseDetail = ''.getCourse().filter((x) => x?.Id === +this.id)[0];

  }

  dataSourceInternos = new MatTableDataSource<any>();
  dataSourceExternos = new MatTableDataSource<any>();

  referencia: any
  servicio: any
  solicitud: any
  refALS: any


  ngOnInit() {
    // Inicializar el formulario primero
    this.form = this.fb.group({
      nLote: [{ value: this.data.nLote, disabled: true }],
      nSubLote: [{ value: this.data.subLote, disabled: true }],
      DUS: [''],
      fechaDUS: [''],
      observacion: [''],
      fechaSobre: [this.fechaActual],
      estado: [{ value: '', disabled: true }],
      fechaInstruccionDespacho: [''],
      fechaConfirmacionDespacho: [''],
      fechaDespacho: [''],
      numeroGuia: [''],
      laboratorio: [''],
      fechaLlegadaLaboratorio: [''],
      pais: ['']
    });

    // Suscribirse a cambios en numeroGuia
    this.form.get('numeroGuia')?.valueChanges.subscribe((numeroGuia) => {
      const estado = numeroGuia ? 'Despachado' : 'En preparación';
      this.form.get('estado')?.setValue(estado, { emitEvent: false });
    });

    // Establecer estado inicial
    const numeroGuia = this.form.get('numeroGuia')?.value;
    const estadoInicial = numeroGuia ? 'Despachado' : 'En preparación';
    this.form.get('estado')?.setValue(estadoInicial, { emitEvent: false });

    // Cargar datos existentes si corresponde
    this.cargarDatosSiExisten();
  }

  cargarDatosSiExisten() {
    const nLote = this.data.nLote?.toString().trim();
    const nSubLote = this.data.subLote?.toString().trim();

    const api = 'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';
    this.http.get<any[]>(api).subscribe((res) => {
      if (!res || res.length === 0) return;

      // Filtrar por nLote y luego por nSubLote
      const datosFiltrados = res.find(item =>
        item.nLote?.toString().trim() === nLote &&
        item.nSubLote?.toString().trim() === nSubLote
      );

      if (datosFiltrados) {
        this.form.patchValue({
          observacion: datosFiltrados.observacion || '',
          estado: datosFiltrados.estado || 'Iniciado',
          DUS: datosFiltrados.DUS || '',
          fechaDUS: datosFiltrados.fechaDUS || '',
          fechaInstruccionDespacho: datosFiltrados.fechaInstruccionDespacho || '',
          fechaConfirmacionDespacho: datosFiltrados.fechaConfirmacionDespacho || '',
          fechaDespacho: datosFiltrados.fechaDespacho || '',
          numeroGuia: datosFiltrados.numeroGuia || '',
          laboratorio: datosFiltrados.laboratorio || '',
          fechaLlegadaLaboratorio: datosFiltrados.fechaLlegadaLaboratorio || '',
          pais: datosFiltrados.pais || ''
        });
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSourceInternos.filter = filterValue.trim().toLowerCase();
    this.dataSourceExternos.filter = filterValue.trim().toLowerCase();
  }


  obtenerMecanica(Lote: any) {
    const api = 'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/'

    this.http.get<any[]>(api).subscribe((res) => {
      const loteNormalizado = Lote.toString().trim();

      // Filtrar todos los registros que coincidan con el número de lote
      let resultados = res.filter(item => item.nLote?.toString().trim() === loteNormalizado);

      // Si hay un idSubLote específico (sublote de embarque), filtrar SOLO por ese idSubLote
      if (this.data.idSubLote) {
        const idSubLoteStr = this.data.idSubLote.toString();
        console.log('Filtrando por idSubLote:', idSubLoteStr);

        // Filtrar solo los registros que pertenecen a este sublote específico
        resultados = resultados.filter(item =>
          item.idSubLote?.toString() === idSubLoteStr
        );

        console.log('Resultados filtrados por idSubLote:', resultados);
      } else if (this.data.nSobre) {
        // Fallback: Si no hay idSubLote pero hay nSobre, filtrar por numeroSubLote
        console.log('Filtrando por numeroSubLote (fallback):', this.data.nSobre);
        resultados = resultados.filter(item =>
          item.numeroSubLote?.toString() === this.data.nSobre?.toString()
        );
        console.log('Resultados filtrados por numeroSubLote:', resultados);
      }

      // Ordenar por nSublote como número
      const resultadosOrdenados = resultados.sort((a, b) => parseInt(a.nSubLote) - parseInt(b.nSubLote));

      // Separar por tipoSobre
      const sobresInternos = resultadosOrdenados.filter(s => s.tipoSobre === 'Interno');
      const sobresExternos = resultadosOrdenados.filter(s => s.tipoSobre === 'Externo');

      // Asignar a las dataSource
      this.dataSourceInternos.data = sobresInternos;
      this.dataSourceExternos.data = sobresExternos;

      console.log('Sobres Internos:', this.dataSourceInternos.data);
      console.log('Sobres Externos:', this.dataSourceExternos.data);
      
      // Para otros datos generales
      this.loteGeneral = resultadosOrdenados.length > 0 ? resultadosOrdenados[0] : null;
    });

  }

  form: FormGroup;

  formulario: FormGroup;
  fechaActual = new Date();
  loteGeneral: any;

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

  isSubmitting = false;

  onSubmit() {
    if (!this.isSubmitting) {
      this.isSubmitting = true;

      const formData = this.form.getRawValue(); // incluye campos deshabilitados

      const datos = {
        nLote: formData.nLote,
        nSubLote: formData.nSubLote, // 👈 unificado en "nSublote"
        observacion: formData.observacion,
        estado: formData.estado,
        fechaInstruccionDespacho: this.formatDateToISO(formData.fechaInstruccionDespacho),
        fechaConfirmacionDespacho: this.formatDateToISO(formData.fechaConfirmacionDespacho),
        fechaDespacho: this.formatDateToISO(formData.fechaDespacho),
        numeroGuia: formData.numeroGuia,
        laboratorio: formData.laboratorio,
        fechaLlegadaLaboratorio: this.formatDateToISO(formData.fechaLlegadaLaboratorio),
        pais: formData.pais,
        DUS: formData.DUS || '',
        fechaDUS: this.formatDateToISO(formData.fechaDUS),
      };

      const url = 'https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/';

      this.http.get<any[]>(url).subscribe(
        (response) => {
          console.log('Datos buscados:', {
            nLote: this.data.nLote,
            nSubLote: this.data.subLote, // 👈 usar el mismo nombre
          });

          const existingData = response.find((item) =>
            String(item.nLote).trim() === String(this.data.nLote).trim() &&
            String(item.nSubLote).trim() === String(this.data.subLote).trim()
          );

          if (existingData) {
            this.http.put(`${url}${existingData.id}/`, datos).subscribe(() => {
              Notiflix.Notify.success('Registro actualizado correctamente');
              this.dialogRef.close(true);
              this.isSubmitting = false;
            });
          } else {
            console.warn('No se encontró coincidencia con:', {
              nLote: this.data.nLote,
              nSubLote: this.data.subLote,
            });
            Notiflix.Notify.failure('No se encontró el registro para actualizar');
            this.isSubmitting = false;
          }
        },
        (error) => {
          console.error('Error al obtener los datos:', error);
          Notiflix.Notify.failure('Error al obtener los datos');
          this.isSubmitting = false;
        }
      );
    }
  }

  ngAfterViewInit(): void {
    this.dataSourceInternos.paginator = this.paginatorInterno;
    this.dataSourceExternos.paginator = this.paginatorExterno
    this.obtenerMecanica(this.data.nLote)

  }

  editar(Num: any, subLote: any, opcion: any) {
    console.log(Num)
    console.log(subLote)
    console.log(opcion)
    const dialogRef = this.dialog.open(PreparacionComponent, {
      width: '80%', // Ajusta el ancho del diálogo
      height: '80%', // Ajusta la altura del diálogo
      data: {
        nLote: Num,
        subLote: subLote,
        opcion: opcion
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.obtenerMecanica(this.data.nLote);  // Aquí llama a la función que recarga tus tablas
      }
    });
  }

  tuFuncion(Num: any, subLote: any, opcion: any) {
    console.log('Abriendo diálogo con datos:', { Num, subLote, opcion });
    const dialogRef = this.dialog.open(EditsobreComponent, {
      width: '80%', // Ajusta el ancho del diálogo
      height: '80%', // Ajusta la altura del diálogo

      data: {
        numLote: Num,
        subLote: subLote,
        opcion: opcion
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Valor devuelto por el diálogo:', result);
      if (result === true) {
        console.log('Ejecutando obtenerMecanica...');
        this.obtenerMecanica(this.data.nLote);
      }
    });
  }

  async descargarExcelTrazabilidad(Nlote: any) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Trazabilidad Mecánica');

    // Mismos encabezados que el primer Excel
    const headers = [
      'ID',
      'Solicitud',
      'Servicio',
      'Ref ALS',
      'N° De Sobre',
      'Nave',
      'Bodega',
      'Material',
      'Muestreado Por',
      'Exportador',
      'Puerto Destino',
      'Contrato',
      'Cliente',
      'Cochilco',
      'Fecha Embarque',
      'DUS',
      'Fecha DUS',
      'Peso Neto Húmedo',
      'Peso Neto Seco',
      '% Humedad',
      'Responsable',
      'Observación',
      'Estado',
      'Fecha Instrucción Despacho',
      'Fecha Confirmación Despacho',
      'Fecha Despacho',
      'Número Guía',
      'Laboratorio',
      'Fecha Llegada Laboratorio',
      'País',
      'N° Interno',
    ];

    // Título
    worksheet.mergeCells('E2:H2');
    worksheet.getCell('E2').value = 'Reporte de Trazabilidad Mecánica';
    worksheet.getCell('E2').font = { name: 'Arial', size: 16, bold: true };
    worksheet.getCell('E2').alignment = { horizontal: 'center' };

    worksheet.columns = new Array(headers.length).fill({ width: 18 });

    // Cargar datos desde APIs
    const [data, servicios, solicitudes] = await Promise.all([
      this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/trazabilidad-mecanica/').toPromise(),
      this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/servicio/').toPromise(),
      this.http.get<any[]>('https://control.als-inspection.cl/api_min/api/solicitud/').toPromise(),
    ]);

    const filtrado = data!.filter(item =>
      String(item.nLote).trim().toLowerCase() === String(Nlote).trim().toLowerCase()
    );

    const externos = filtrado.filter(item => item.tipoSobre === 'Externo');
    const internos = filtrado.filter(item => item.tipoSobre === 'Interno');

    externos.sort((a, b) => Number(a.nSublote) - Number(b.nSublote));
    internos.sort((a, b) => Number(a.nSublote) - Number(b.nSublote));

    let currentRow = 5;

    const escribirTabla = (titulo: string, datos: any[]) => {
      worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
      worksheet.getCell(`B${currentRow}`).value = `Sobres ${titulo}`;
      worksheet.getCell(`B${currentRow}`).font = { name: 'Arial', size: 14, bold: true };
      worksheet.getCell(`B${currentRow}`).alignment = { horizontal: 'left' };
      currentRow++;

      // Encabezados
      const headerRow = worksheet.getRow(currentRow);
      headers.forEach((header, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '337dff' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      currentRow++;

      datos.forEach(item => {
        const nombreServicio = servicios!.find(s => s.id === item.servicio)?.nServ || 'N/A';
        const refALS = servicios!.find(s => s.id === item.servicio)?.refAls || 'N/A';
        const nombreSolicitud = solicitudes!.find(s => s.id === item.solicitud)?.nSoli || 'N/A';

        const row = worksheet.getRow(currentRow++);
        row.values = [
          item.id,
          this.solicitud || 'N/A',
          this.servicio || 'N/A',
          this.refALS || 'N/A',
          item.nSubLote || 'N/A',
          item.nave || 'N/A',
          item.bodega || 'N/A',
          item.material || 'N/A',
          item.muestreadoPor || 'N/A',
          item.exportador || 'N/A',
          item.puertoDestino || 'N/A',
          item.contrato || 'N/A',
          item.cliente || 'N/A',
          item.cochilco || 'N/A',
          item.fechaEmbarque || 'N/A',
          item.DUS || 'N/A',
          item.fechaDUS || 'N/A',
          item.pesoNetoHumedo || 'N/A',
          item.pesoNetoSeco || 'N/A',
          item.porcHumedad || 'N/A',
          item.responsable || 'N/A',
          item.observacion || 'N/A',
          item.estado || 'N/A',
          item.fechaInstruccionDespacho || 'N/A',
          item.fechaConfirmacionDespacho || 'N/A',
          item.fechaDespacho || 'N/A',
          item.numeroGuia || 'N/A',
          item.laboratorio || 'N/A',
          item.fechaLlegadaLaboratorio || 'N/A',
          item.pais || 'N/A',
          item.nLote || 'N/A',
        ];
      });

      currentRow += 2;
    };

    if (externos.length > 0) escribirTabla('Externos', externos);
    if (internos.length > 0) escribirTabla('Internos', internos);

    // Logo
    const logoBlob = await fetch('assets/images/logos/als_logo_1.png').then(res => res.blob());
    const reader = new FileReader();

    return new Promise<void>((resolve) => {
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const binary = atob(base64);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          buffer[i] = binary.charCodeAt(i);
        }

        const imageId = workbook.addImage({ buffer, extension: 'png' });

        worksheet.addImage(imageId, {
          tl: { col: 1, row: 1 },
          ext: { width: 65, height: 65 },
        });

        const bufferXlsx = await workbook.xlsx.writeBuffer();
        const blob = new Blob([bufferXlsx], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Trazabilidad.xlsx`;
        a.click();

        resolve();
      };
      reader.readAsDataURL(logoBlob);
    });
  }

  cargarLote(nLote: string): void {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/lote-recepcion/';
    const servicioUrl = 'https://control.als-inspection.cl/api_min/api/servicio/';
    const solicitudUrl = 'https://control.als-inspection.cl/api_min/api/solicitud/';

    this.http.get<any[]>(apiUrl).subscribe(
      (response) => {
        const loteFiltrado = response.find(item => item.nLote === nLote);

        if (loteFiltrado) {
          this.referencia = loteFiltrado.observacion || '';

          // Obtener datos del servicio por ID
          if (loteFiltrado.servicio) {
            this.http.get<any>(`${servicioUrl}${loteFiltrado.servicio}/`).subscribe(
              (servicioData) => {
                this.servicio = servicioData.nServ || 'Sin nombre';
                this.refALS = servicioData.refAls || 'Sin nombre'
              },
              (error) => {
                console.error('Error al obtener servicio:', error);
                this.servicio = '';
              }
            );
          } else {
            this.servicio = '';
          }

          // Obtener datos de la solicitud por ID
          if (loteFiltrado.solicitud) {
            this.http.get<any>(`${solicitudUrl}${loteFiltrado.solicitud}/`).subscribe(
              (solicitudData) => {
                this.solicitud = solicitudData.nSoli || 'Sin nombre';
              },
              (error) => {
                console.error('Error al obtener solicitud:', error);
                this.solicitud = '';
              }
            );
          } else {
            this.solicitud = '';
          }

        } else {
          this.referencia = '';
          this.servicio = '';
          this.solicitud = '';
          console.warn('No se encontró un lote con ese número.');
        }
      },
      (error) => {
        console.error('Error al cargar el lote:', error);
        this.referencia = '';
        this.servicio = '';
        this.solicitud = '';
      }
    );
  }

  getPreparacion(nLote: string) {
    const apiUrl = 'https://control.als-inspection.cl/api_min/api/lote-recepcion/';

    this.http.get<any[]>(apiUrl).subscribe(
      (response) => {
        // Filtrar por el nLote que recibes como parámetro
        const loteFiltrado = response.find(item => item.nLote === nLote);

        if (loteFiltrado) {
          this.referencia = loteFiltrado.observacion || ''; // Asigna la observación o string vacío si no hay
        } else {
          this.referencia = '';
          console.warn('No se encontró un lote con ese número.');
        }
      },
      (error) => {
        console.error('Error al cargar el lote:', error);
        this.referencia = '';
      }
    );
  }

  formatDateToISO(date: Date | string | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null; // fecha inválida
    // Obtener año, mes y día con padding
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onClose() {
    this.dialogRef.close(true);
  }

}
