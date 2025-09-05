import { P } from '@angular/cdk/keycodes';
import { CommonModule, AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import Notiflix from 'notiflix';
import { MaterialModule } from 'src/app/material.module';
import { RolService } from 'src/app/services/rol.service';

@Component({
  selector: 'app-fluidez',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    TablerIconsModule,
    MatCardModule,
    MatCard,
    MatCardModule,
    MatTable,
    MatFormField,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './fluidez.component.html',
  styleUrl: './fluidez.component.scss',
})
export class FluidezComponent implements OnInit {
  // Recibir la información desde el componente padre
  nLote: string = '';
  idSolicitud: string = '';
  idServicio: string = '';
  sumaTonelaje: number = 10;
  nombreEmbarque: string = '';
  cliente: boolean = false;
  humedadForm: FormGroup;
  fluidezForms: FormGroup[] = [];
  fechaPrueba: String = this.formatDate(new Date());

  // New properties for summary data
  avgHumedad: string = '';
  avgDesplazamiento: string = '';

  constructor(
    private http: HttpClient,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      numero: any;
      idServicio: any;
      idSolicitud: any;
      nLote: any;
    },
    private rolService: RolService
  ) {
    // Asignar los valores recibidos a las variables locales
    this.nLote = data.nLote;
    this.idSolicitud = data.idSolicitud;
    this.idServicio = data.idServicio;
    this.humedadForm = new FormGroup({
      id: new FormControl(0), // Este campo se actualizará después de verificar si el nLote existe
      nLote: new FormControl(this.data.nLote),
      nSublote: new FormControl(''),
      observacion: new FormControl('Iniciado'),
      fInicio: new FormControl(null),
      fFin: new FormControl(null),
      idSolicitud: new FormControl(this.data.idSolicitud),
      idServicio: new FormControl(this.data.idServicio),
      nLata1: new FormControl(''),
      nLata2: new FormControl(''),
      pLata1: new FormControl(''),
      pLata2: new FormControl(''),
      pBrutoHumedo1: new FormControl(''),
      pBrutoHumedo2: new FormControl(''),
      pBrutoSeco1: new FormControl(''),
      pBrutoSeco2: new FormControl(''),
      porcHumedad1: new FormControl(''),
      porcHumedad2: new FormControl(''),
      porcHumedadPromedio: new FormControl(''),
      estado: new FormControl('Iniciado'),
    });
  }
  
  // New method to calculate summary data
  calculateSummary() {
    // Calculate average humidity from humedadForm
    this.avgHumedad = this.humedadForm.get('porcHumedadPromedio')?.value || '';

    // Calculate average displacement from fluidezForms
    let totalDesplazamiento = 0;
    let countDesplazamiento = 0;
    this.fluidezForms.forEach((form) => {
      const desplazamiento = parseFloat(form.get('desplazamiento')?.value);
      if (!isNaN(desplazamiento)) {
        totalDesplazamiento += desplazamiento;
        countDesplazamiento++;
      }
    });
    this.avgDesplazamiento =
      countDesplazamiento > 0
        ? (totalDesplazamiento / countDesplazamiento).toFixed(2)
        : '';
  }

  ngOnInit(): void {
    console.log('Datos recibidos:', this.data);
    this.rolService
      .hasRole(localStorage.getItem('email') || '', 'Cliente')
      .subscribe((hasRole) => {
        if (hasRole) {
          this.cliente = true;
          console.log('El usuario tiene el rol de cliente');
        } else {
          this.cliente = false;
          console.log('El usuario no tiene el rol de cliente');
        }
      });

    // Preload fluidez data if exists
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/fluidez/`)
      .subscribe(
        (data) => {
          const existente = data.find((item) => item.nLote === this.nLote);
          if (existente) {
            console.log('Fluidez existente encontrada:', existente);
            const formatted = {
              ...existente,
              pLata1: this.formatDecimal(existente.pLata1),
              pLata2: this.formatDecimal(existente.pLata2),
              pBrutoHumedo1: this.formatDecimal(existente.pBrutoHumedo1),
              pBrutoHumedo2: this.formatDecimal(existente.pBrutoHumedo2),
              pBrutoSeco1: this.formatDecimal(existente.pBrutoSeco1),
              pBrutoSeco2: this.formatDecimal(existente.pBrutoSeco2),
              porcHumedad1: this.formatDecimal(existente.porcHumedad1),
              porcHumedad2: this.formatDecimal(existente.porcHumedad2),
              porcHumedadPromedio: this.formatDecimal(existente.porcHumedadPromedio),
            };
            this.humedadForm.patchValue(formatted);
          } else {
            console.log('No existe fluidez para nLote:', this.nLote);
          }
        },
        (error) => {
          console.error('Error al buscar fluidez:', error);
        }
      );

    // Suscripciones para cálculo automático de porcHumedad1
    this.humedadForm
      .get('pLata1')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad1());
    this.humedadForm
      .get('pBrutoHumedo1')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad1());
    this.humedadForm
      .get('pBrutoSeco1')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad1());

    // Suscripciones para cálculo automático de porcHumedad2
    this.humedadForm
      .get('pLata2')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad2());
    this.humedadForm
      .get('pBrutoHumedo2')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad2());
    this.humedadForm
      .get('pBrutoSeco2')
      ?.valueChanges.subscribe(() => this.updatePorcHumedad2());

    // Initialize fluidezForms
    for (let i = 0; i < 7; i++) {
      this.fluidezForms[i] = new FormGroup({
        id: new FormControl(0),
        nLote: new FormControl(this.data.nLote),
        nPrueba: new FormControl(i + 1),
        nLata1: new FormControl(''),
        nLata2: new FormControl(''),
        pLata1: new FormControl(''),
        pLata2: new FormControl(''),
        pBrutoHumedo1: new FormControl(''),
        pBrutoHumedo2: new FormControl(''),
        pBrutoSeco1: new FormControl(''),
        pBrutoSeco2: new FormControl(''),
        porcHumedad1: new FormControl(''),
        porcHumedad2: new FormControl(''),
        porcHumedadPromedio: new FormControl(''),
        desplazamiento: new FormControl(''),
        estado: new FormControl('Iniciado'),
      });
    }

    // Preload fluidez data for each step
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/prueba-fluidez/`)
      .subscribe(
        (data) => {
          console.log('Datos de prueba-fluidez recibidos:', data);
          for (let i = 0; i < 7; i++) {
            const existente = data.find(
              (item) => item.nLote === this.nLote && Number(item.nPrueba) === i + 1
            );
            if (existente) {
              console.log(`Fluidez existente encontrada para paso ${i}:`, existente);
              const formatted = {
                ...existente,
                pLata1: this.formatDecimal(existente.pLata1),
                pLata2: this.formatDecimal(existente.pLata2),
                pBrutoHumedo1: this.formatDecimal(existente.pBrutoHumedo1),
                pBrutoHumedo2: this.formatDecimal(existente.pBrutoHumedo2),
                pBrutoSeco1: this.formatDecimal(existente.pBrutoSeco1),
                pBrutoSeco2: this.formatDecimal(existente.pBrutoSeco2),
                porcHumedad1: this.formatDecimal(existente.porcHumedad1),
                porcHumedad2: this.formatDecimal(existente.porcHumedad2),
                porcHumedadPromedio: this.formatDecimal(existente.porcHumedadPromedio),
                desplazamiento: this.formatDecimal(existente.desplazamiento),
              };
              this.fluidezForms[i].patchValue(formatted);
            } else {
              console.log(`No existe fluidez para nLote: ${this.nLote}, paso: ${i + 1}`);
            }
          }
        },
        (error) => {
          console.error('Error al buscar prueba-fluidez:', error);
        }
      );

    // Suscripciones para cálculo automático de porcHumedad en cada fluidezForm
    for (let i = 0; i < 7; i++) {
      this.fluidezForms[i]
        .get('pLata1')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 1));
      this.fluidezForms[i]
        .get('pBrutoHumedo1')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 1));
      this.fluidezForms[i]
        .get('pBrutoSeco1')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 1));
      this.fluidezForms[i]
        .get('desplazamiento')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 1));
      this.fluidezForms[i]
        .get('pLata2')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 2));
      this.fluidezForms[i]
        .get('pBrutoHumedo2')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 2));
      this.fluidezForms[i]
        .get('pBrutoSeco2')
        ?.valueChanges.subscribe(() => this.updatePorcHumedadFluidez(i, 2));
    }

    // After loading data, calculate summary
    this.calculateSummary();

    // Subscribe to changes to recalculate summary dynamically
    this.humedadForm.get('porcHumedadPromedio')?.valueChanges.subscribe(() => {
      this.calculateSummary();
    });
    this.fluidezForms.forEach((form) => {
      form.get('desplazamiento')?.valueChanges.subscribe(() => {
        this.calculateSummary();
      });
    });
  }

  updatePorcHumedad1() {
    const pLata1 = this.humedadForm.get('pLata1')?.value;
    const pBrutoHumedo1 = this.humedadForm.get('pBrutoHumedo1')?.value;
    const pBrutoSeco1 = this.humedadForm.get('pBrutoSeco1')?.value;
    const porcHumedad1 = this.calcularPorcentajeHumedad(
      pBrutoHumedo1,
      pBrutoSeco1,
      pLata1
    );
    this.humedadForm.patchValue({ porcHumedad1 }, { emitEvent: false });
    this.updatePorcHumedadPromedio();
  }

  updatePorcHumedad2() {
    const pLata2 = this.humedadForm.get('pLata2')?.value;
    const pBrutoHumedo2 = this.humedadForm.get('pBrutoHumedo2')?.value;
    const pBrutoSeco2 = this.humedadForm.get('pBrutoSeco2')?.value;
    const porcHumedad2 = this.calcularPorcentajeHumedad(
      pBrutoHumedo2,
      pBrutoSeco2,
      pLata2
    );
    this.humedadForm.patchValue({ porcHumedad2 }, { emitEvent: false });
    this.updatePorcHumedadPromedio();
  }

  updatePorcHumedadPromedio() {
    const porcHumedad1 =
      parseFloat(this.humedadForm.get('porcHumedad1')?.value) || 0;
    const porcHumedad2 =
      parseFloat(this.humedadForm.get('porcHumedad2')?.value) || 0;
    if (porcHumedad1 > 0 && porcHumedad2 > 0) {
      const promedio = ((porcHumedad1 + porcHumedad2) / 2).toFixed(2);
      this.humedadForm.patchValue(
        { porcHumedadPromedio: promedio },
        { emitEvent: false }
      );
    } else {
      this.humedadForm.patchValue(
        { porcHumedadPromedio: '' },
        { emitEvent: false }
      );
    }
  }

  updatePorcHumedadFluidez(step: number, bandeja: number) {
    const form = this.fluidezForms[step];
    const pLata = form.get(`pLata${bandeja}`)?.value;
    const pBrutoHumedo = form.get(`pBrutoHumedo${bandeja}`)?.value;
    const pBrutoSeco = form.get(`pBrutoSeco${bandeja}`)?.value;
    const porcHumedad = this.calcularPorcentajeHumedad(
      pBrutoHumedo,
      pBrutoSeco,
      pLata
    );
    form.patchValue({ [`porcHumedad${bandeja}`]: porcHumedad }, { emitEvent: false });
    this.updatePorcHumedadPromedioFluidez(step);
  }

  updatePorcHumedadPromedioFluidez(step: number) {
    const form = this.fluidezForms[step];
    const porcHumedad1 = parseFloat(form.get('porcHumedad1')?.value) || 0;
    const porcHumedad2 = parseFloat(form.get('porcHumedad2')?.value) || 0;
    if (porcHumedad1 > 0 && porcHumedad2 > 0) {
      const promedio = ((porcHumedad1 + porcHumedad2) / 2).toFixed(2);
      form.patchValue({ porcHumedadPromedio: promedio }, { emitEvent: false });
    } else {
      form.patchValue({ porcHumedadPromedio: '' }, { emitEvent: false });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatDecimal(value: any): string {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(2);
    }
    return value;
  }
  actualizarPesoMaterial() {
    const pesoLata1 = this.humedadForm.value.pLata1;
    const pesoMaterial1 = this.humedadForm.value.pMaterial1;
    const pesoTotal1 = this.calcularPesoMaterial(pesoLata1, pesoMaterial1);
    if (pesoTotal1 !== '') {
      this.humedadForm.patchValue({
        pTotal1: parseFloat(pesoTotal1),
      });
    } else {
      this.humedadForm.patchValue({
        pTotal1: '',
      });
    }
    // Actualizar el pesoMaterial2
    const pesoLata2 = this.humedadForm.value.pLata2;
    const pesoMaterial2 = this.humedadForm.value.pMaterial2;
    const pesoTotal2 = this.calcularPesoMaterial(pesoLata2, pesoMaterial2);
    if (pesoTotal2 !== '') {
      this.humedadForm.patchValue({
        pTotal2: parseFloat(pesoTotal2),
      });
    } else {
      this.humedadForm.patchValue({
        pTotal2: '',
      });
    }
  }
  guardarHumedad() {
    this.actualizarPesoMaterial();
    // Ensure estado is set
    this.humedadForm.patchValue({ estado: 'Iniciado' }, { emitEvent: false });
    const nLote = this.humedadForm.value.nLote;
    console.log('Verificando existencia de fluidez para nLote:', nLote);
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/fluidez/`)
      .subscribe(
        (data) => {
          const existente = data.find((item) => item.nLote === nLote);
          if (existente) {
            console.log('El nLote ya existe:', nLote);
            this.humedadForm.patchValue(
              { id: existente.id },
              { emitEvent: false }
            );
            // Si fInicio no existe, establecer la fecha actual
            if (!this.humedadForm.get('fInicio')?.value) {
              this.humedadForm.patchValue({ fInicio: this.formatDate(new Date()) }, { emitEvent: false });
            }
            //Actualizar el registro existente
            this.http
              .put(
                `https://control.als-inspection.cl/api_min/api/fluidez/${existente.id}/`,
                this.humedadForm.value
              )
              .subscribe(
                (response) => {
                  console.log('Registro de fluidez actualizado:', response);
                  Notiflix.Notify.success('Registro de fluidez actualizado');
                },
                (error) => {
                  console.error('Error al actualizar fluidez:', error);
                  Notiflix.Notify.failure('Error al actualizar fluidez');
                }
              );
          } else {
            console.log('El nLote no existe, se creará uno nuevo:', nLote);
            this.humedadForm.patchValue({ id: 0 }, { emitEvent: false });
            //Crear un nuevo registro
            this.http
              .post(
                `https://control.als-inspection.cl/api_min/api/fluidez/`,
                this.humedadForm.value
              )
              .subscribe(
                (response) => {
                  console.log('Registro de fluidez creado:', response);
                  Notiflix.Notify.success('Registro de fluidez creado');
                },
                (error) => {
                  console.error('Error al crear fluidez:', error);
                  Notiflix.Notify.failure('Error al crear fluidez');
                }
              );
          }
        },
        (error) => {
          console.error('Error al verificar existencia de fluidez:', error);
          // Handle error, perhaps show an error message
        }
      );
  }

  calcularPesoMaterial(pesoLata: any, pesoTotal: any) {
    const lataVal = parseFloat(pesoLata);
    const totalVal = parseFloat(pesoTotal);
    if (isNaN(lataVal) || isNaN(totalVal)) {
      return '';
    }
    const diferencia = totalVal + lataVal;
    return diferencia >= 0 ? diferencia.toFixed(2) : '';
  }

  calcularPorcentajeHumedad(
    pesoBrutoHumedo: any,
    pesoBrutoSeco: any,
    taraBandeja: any
  ) {
    const brutoHumedoVal = parseFloat(pesoBrutoHumedo);
    const brutoSecoVal = parseFloat(pesoBrutoSeco);
    const taraBandejaVal = parseFloat(taraBandeja);
    if (
      isNaN(brutoHumedoVal) ||
      isNaN(brutoSecoVal) ||
      brutoHumedoVal === 0 ||
      isNaN(taraBandejaVal)
    ) {
      console.log('Invalid input values:', {
        pesoBrutoHumedo,
        pesoBrutoSeco,
        taraBandeja,
      });
      return '';
    }
    const diferencia =
      ((brutoHumedoVal - brutoSecoVal) / (brutoHumedoVal - taraBandejaVal)) *
      100;
    console.log('Calculated humidity percentage:', diferencia);
    return diferencia >= 0 ? diferencia.toFixed(2) : '';
  }

  calcularPorcentajeHumedadPromedio() {
    const porcHumedad1 = parseFloat(
      this.calcularPorcentajeHumedad(
        this.humedadForm.value.pBrutoHumedo1,
        this.humedadForm.value.pBrutoSeco1,
        this.humedadForm.value.pLata1
      )
    );
    const porcHumedad2 = parseFloat(
      this.calcularPorcentajeHumedad(
        this.humedadForm.value.pBrutoHumedo2,
        this.humedadForm.value.pBrutoSeco2,
        this.humedadForm.value.pLata2
      )
    );
    if (isNaN(porcHumedad1) || isNaN(porcHumedad2)) {
      console.log('Invalid input values for average humidity:', {
        porcHumedad1,
        porcHumedad2,
      });
      return '';
    }
    const promedio = (porcHumedad1 + porcHumedad2) / 2;
    console.log('Calculated average humidity percentage:', promedio);
    return promedio >= 0 ? promedio.toFixed(2) : '';
  }

  guardarFluidez(step: number) {
    const form = this.fluidezForms[step];
    form.patchValue({ estado: 'Iniciado' }, { emitEvent: false });
    const nLote = form.value.nLote;
    const nPrueba = form.value.nPrueba;
    console.log(`Verificando existencia de prueba-fluidez para nLote: ${nLote}, nPrueba: ${nPrueba}`);
    this.http
      .get<any[]>(`https://control.als-inspection.cl/api_min/api/prueba-fluidez/`)
      .subscribe(
        (data) => {
          const existente = data.find(
            (item) => item.nLote === nLote && Number(item.nPrueba) === Number(nPrueba)
          );
          if (existente) {
            console.log(`El registro ya existe para nLote: ${nLote}, nPrueba: ${nPrueba}`);
            console.log('Existente:', existente);
            form.patchValue({ id: existente.id }, { emitEvent: false });
            // Si fInicio no existe, establecer la fecha actual
            if (!form.get('fInicio')?.value) {
              form.patchValue({ fInicio: this.formatDate(new Date()) }, { emitEvent: false });
            }
            // Actualizar el registro existente
            this.http
              .put(
                `https://control.als-inspection.cl/api_min/api/prueba-fluidez/${existente.id}/`,
                form.value
              )
              .subscribe(
                (response) => {
                  console.log(`Registro de prueba-fluidez actualizado para paso ${step}:`, response);
                  Notiflix.Notify.success(`Registro de prueba-fluidez actualizado para paso ${step + 1}`);
                },
                (error) => {
                  console.error(`Error al actualizar prueba-fluidez para paso ${step}:`, error);
                  Notiflix.Notify.failure(`Error al actualizar prueba-fluidez para paso ${step + 1}`);
                }
              );
          } else {
            console.log(`El registro no existe para nLote: ${nLote}, nPrueba: ${nPrueba}, se creará uno nuevo`);
            form.patchValue({ id: 0 }, { emitEvent: false });
            // Crear un nuevo registro
            this.http
              .post(
                `https://control.als-inspection.cl/api_min/api/prueba-fluidez/`,
                form.value
              )
              .subscribe(
                (response) => {
                  console.log(`Registro de prueba-fluidez creado para paso ${step}:`, response);
                  Notiflix.Notify.success(`Registro de prueba-fluidez creado para paso ${step + 1}`);
                },
                (error) => {
                  console.error(`Error al crear prueba-fluidez para paso ${step}:`, error);
                  Notiflix.Notify.failure(`Error al crear prueba-fluidez para paso ${step + 1}`);
                }
              );
          }
        },
        (error) => {
          console.error(`Error al verificar existencia de prueba-fluidez para paso ${step}:`, error);
        }
      );
  }

  step = -1;
  setStep(index: number) {
    this.step = index;
  }
  nextStep(index: number) {
    this.step = index;
    this.step++;
  }
  prevStep(index: number) {
    this.step = index;
    this.step--;
  }
  panelOpenState = false;

  // Getter to calculate humidity percentage for table
  getHumedadTable(form: FormGroup): string {
    const pBrutoHumedo1 = +form.get('pBrutoHumedo1')?.value || 0;
    const pBrutoHumedo2 = +form.get('pBrutoHumedo2')?.value || 0;
    const pBrutoSeco1 = +form.get('pBrutoSeco1')?.value || 0;
    const pBrutoSeco2 = +form.get('pBrutoSeco2')?.value || 0;
    const pLata1 = +form.get('pLata1')?.value || 0;
    const pLata2 = +form.get('pLata2')?.value || 0;

    // Round sums to 2 decimal places
    const sumHumedo = ((pBrutoHumedo1 + pBrutoHumedo2));
    const sumSeco = ((pBrutoSeco1 + pBrutoSeco2));
    const sumLata = ((pLata1 + pLata2));

    if (sumHumedo - sumLata === 0) return '0.00';
    if (sumHumedo === 0 || sumSeco === 0 || sumLata === 0) return '';

    const result = ((sumHumedo - sumSeco) / (sumHumedo - sumLata)) * 100;
    return result.toFixed(2);
  }
}
