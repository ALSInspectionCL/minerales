import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { Form, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { ImoEstibaService } from 'src/app/services/imo-estiba.service';
import { RolService } from 'src/app/services/rol.service';

@Component({
  selector: 'app-estiba',
  standalone: true,
  imports: [MatDatepickerModule,
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
    MatIconModule,],
  templateUrl: './estiba.component.html',
  styleUrl: './estiba.component.scss'
})
export class EstibaComponent {

  formfe: FormGroup
  formden: FormGroup
  Fecha: any
  fechaDet: any
  Responsable: any
  Responsableapi: any
  ResponsableFinal: any

  constructor(
    private http: HttpClient,
    private rolService: RolService,
    private estibaService: ImoEstibaService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      numero: any,
      idServicio: any,
      idSolicitud: any,
      nLote: any,
      observacion: any,
      nave: any
    }
  ) {

    const now = new Date();
    const formatted = now.toISOString().split('T')[0]; // devuelve "2025-09-07"
    this.Fecha = formatted;



    // Obtener datos del localStorage
    const nombre = localStorage.getItem('nombre');
    const apellido = localStorage.getItem('apellidoPaterno');

    this.Responsable = `${nombre || ''} ${apellido || ''}`.trim();


    console.log(this.Responsable)

    console.log(data.numero)
    console.log(data.idServicio)
    console.log(data.idSolicitud)
    console.log(data.nLote)
    console.log(data.observacion)
    console.log(data.nave)
    // Inicializar el formulario o cualquier otra lógica necesaria
    this.formfe = new FormGroup({
      id: new FormControl(0), // Este campo se actualizará después de verificar si el nLote existe
      nLote: new FormControl(data.nLote),
      nSublote: new FormControl(this.Responsable),
      fDeterminacion: new FormControl(formatted), // Fecha de inicio actual
      realizado: new FormControl(''),
      nave: new FormControl(data.nave),
      observacion: new FormControl(data.observacion),
      volumen1: new FormControl(),
      volumen2: new FormControl(),
      volumen3: new FormControl(),
      tara1: new FormControl(),
      tara2: new FormControl(),
      tara3: new FormControl(),
      pesoNeto1: new FormControl(),
      pesoNeto2: new FormControl(),
      pesoNeto3: new FormControl(),
      pesoBruto1: new FormControl(),
      pesoBruto2: new FormControl(),
      pesoBruto3: new FormControl(),
      fe1: new FormControl(),
      fe2: new FormControl(),
      fe3: new FormControl(),
      totalfe: new FormControl(),
    });

    this.formden = new FormGroup({
      id: new FormControl(0), // Este campo se actualizará después de verificar si el nLote existe
      nLote: new FormControl(data.nLote),
      nSublote: new FormControl(''),
      fDeterminacion: new FormControl(formatted), // Fecha de inicio actual
      realizado: new FormControl(''),
      nave: new FormControl(data.nave),
      observacion: new FormControl(data.observacion),
      volumen1: new FormControl(),
      volumen2: new FormControl(),
      volumen3: new FormControl(),
      tara1: new FormControl(),
      tara2: new FormControl(),
      tara3: new FormControl(),
      pesoNeto1: new FormControl(),
      pesoNeto2: new FormControl(),
      pesoNeto3: new FormControl(),
      pesoBruto1: new FormControl(),
      pesoBruto2: new FormControl(),
      pesoBruto3: new FormControl(),
      densidad1: new FormControl(),
      densidad2: new FormControl(),
      densidad3: new FormControl(),
      totalDen: new FormControl(),
    });

    this.obtenerEstiba(data.nLote)
    this.obtenerDensidad(data.nLote)

  }

  obtenerEstiba(nLote: string | number) {
    this.estibaService.getEstiba().subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : res.results;

        if (!lista || !Array.isArray(lista)) {
          console.error("❌ La API no devolvió una lista de estibas");
          return;
        }

        // 🔍 Filtrar por nLote exacto
        const filtradas = lista.filter((item: any) => String(item.nLote) === String(nLote));

        if (filtradas.length > 0) {
          const data = filtradas[0]; // Tomamos la primera coincidencia

          console.log("✅ Estiba encontrada:", data);

          // 📝 Llenar formulario con la estiba encontrada
          this.formfe.patchValue({
            id: data.id || 0,
            nLote: data.nLote || '',
            nSublote: data.nSublote || '',
            realizado: data.realizado || '',
            fDeterminacion: data.fDeterminacion || '',
            nNave: data.nNave || '',
            observacion: data.observacion || '',
            volumen1: data.volumen1 || '',
            volumen2: data.volumen2 || '',
            volumen3: data.volumen3 || '',
            tara1: data.tara1 || '',
            tara2: data.tara2 || '',
            tara3: data.tara3 || '',
            pesoNeto1: data.pesoNeto1 || '',
            pesoNeto2: data.pesoNeto2 || '',
            pesoNeto3: data.pesoNeto3 || '',
            pesoBruto1: data.pesoBruto1 || '',
            pesoBruto2: data.pesoBruto2 || '',
            pesoBruto3: data.pesoBruto3 || '',
            fe1: data.fe1 || '',
            fe2: data.fe2 || '',
            fe3: data.fe3 || '',
            totalfe: data.totalfe || '',
          });

          this.fechaDet = data.fDeterminacion
          this.Responsableapi = data.realizado ?? '';
          console.log(data.realizado)
          console.log(data)

          this.ResponsableFinal = (this.Responsableapi.trim() !== '')
            ? this.Responsableapi
            : this.Responsable;

        } else {
          console.warn("⚠️ No se encontraron estibas con ese nLote");
        }
      },
      error: (err) => {
        console.error("❌ Error al obtener estibas:", err);
      }
    });


  }

  obtenerDensidad(nLote: string | number) {
    this.estibaService.getDensidad().subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : res.results;

        if (!lista || !Array.isArray(lista)) {
          console.error("❌ La API no devolvió una lista de Densidad");
          return;
        }

        // 🔍 Filtrar por nLote exacto
        const filtradas = lista.filter((item: any) => String(item.nLote) === String(nLote));

        if (filtradas.length > 0) {
          const data = filtradas[0]; // Tomamos la primera coincidencia

          console.log("✅ Estiba encontrada:", data);

          // 📝 Llenar formulario con la estiba encontrada
          this.formden.patchValue({
            id: data.id || 0,
            nLote: data.nLote || '',
            nSublote: data.nSublote || '',
            realizado: data.realizado || '',
            fDeterminacion: data.fDeterminacion || '',
            nNave: data.nNave || '',
            observacion: data.observacion || '',
            volumen1: data.volumen1 || '',
            volumen2: data.volumen2 || '',
            volumen3: data.volumen3 || '',
            tara1: data.tara1 || '',
            tara2: data.tara2 || '',
            tara3: data.tara3 || '',
            pesoNeto1: data.pesoNeto1 || '',
            pesoNeto2: data.pesoNeto2 || '',
            pesoNeto3: data.pesoNeto3 || '',
            pesoBruto1: data.pesoBruto1 || '',
            pesoBruto2: data.pesoBruto2 || '',
            pesoBruto3: data.pesoBruto3 || '',
            densidad1: data.densidad1 || '',
            densidad2: data.densidad2 || '',
            densidad3: data.densidad3 || '',
            totalDen: data.totalDen || '',
          });

          this.fechaDet = data.fDeterminacion
          this.Responsableapi = data.realizado ?? '';
          console.log(data.realizado)
          console.log(data)

          this.ResponsableFinal = (this.Responsableapi.trim() !== '')
            ? this.Responsableapi
            : this.Responsable;

        } else {
          console.warn("⚠️ No se encontraron Densidad con ese nLote");
        }
      },
      error: (err) => {
        console.error("❌ Error al obtener Densidad:", err);
      }
    });
  }

  calcularFactorEstiba() {
    const volumen1 = Number(this.formfe.get('volumen1')?.value) || 0;
    const volumen2 = Number(this.formfe.get('volumen2')?.value) || 0;
    const volumen3 = Number(this.formfe.get('volumen3')?.value) || 0;

    // --- Muestra 1 ---
    const tara1 = Number(this.formfe.get('tara1')?.value) || 0;
    const pesoNeto1 = Number(this.formfe.get('pesoNeto1')?.value) || 0;
    const pesoBruto1 = tara1 + pesoNeto1;

    this.formfe.get('pesoBruto1')?.setValue(pesoBruto1 || 0);
    if (pesoNeto1 > 0 && volumen1 > 0) {
      const fe1 = volumen1 / pesoNeto1;
      console.log(fe1)
      this.formfe.get('fe1')?.setValue(Number(fe1.toFixed(2)));
    } else {
      this.formfe.get('fe1')?.setValue(0);
    }

    // // --- Muestra 2 ---
    const tara2 = Number(this.formfe.get('tara2')?.value) || 0;
    const pesoNeto2 = Number(this.formfe.get('pesoNeto2')?.value) || 0;
    const pesoBruto2 = tara2 + pesoNeto2;

    this.formfe.get('pesoBruto2')?.setValue(pesoBruto2 || 0);

    if (pesoNeto2 > 0 && volumen2 > 0) {
      const fe2 = volumen2 / pesoNeto2
      this.formfe.get('fe2')?.setValue(Number(fe2.toFixed(2)));
    } else {
      this.formfe.get('fe2')?.setValue(0);
    }

    // // --- Muestra 3 ---
    const tara3 = Number(this.formfe.get('tara3')?.value) || 0;
    const pesoNeto3 = Number(this.formfe.get('pesoNeto3')?.value) || 0;
    const pesoBruto3 = tara3 + pesoNeto3;

    this.formfe.get('pesoBruto3')?.setValue(pesoBruto3 || 0);

    if (pesoNeto3 > 0 && volumen3 > 0) {
      const fe3 = volumen3 / pesoNeto3;
      this.formfe.get('fe3')?.setValue(Number(fe3.toFixed(2)));
    } else {
      this.formfe.get('fe3')?.setValue(0);
    }

    // --- Calcular promedio de FE ---
    const fe1Val = volumen1 / Number(this.formfe.get('pesoNeto1')?.value) || 0;;
    const fe2Val = volumen2 / Number(this.formfe.get('pesoNeto2')?.value) || 0;
    const fe3Val = volumen3 / Number(this.formfe.get('pesoNeto3')?.value) || 0;

    if (fe1Val > 0 && fe2Val > 0 && fe3Val > 0) {
      const promedio = (fe1Val + fe2Val + fe3Val) / 3;
      this.formfe.get('totalfe')?.setValue(Number(promedio.toFixed(2)));
    } else {
      this.formfe.get('totalfe')?.setValue(0);
    }
    this.guardarFactorEstiba()
  }

  guardarFactorEstiba() {
    const factorEstiba = {
      nLote: this.formfe.get('nLote')?.value,
      nReferencia: this.formfe.get('nReferencia')?.value,
      tipoMaterial: 'Concentrado de Cobre',
      cliente: this.formfe.get('cliente')?.value,
      realizado: this.formfe.get('realizado')?.value,
      nNave: this.formfe.get('nave')?.value,
      nSublote: this.formfe.get('nSublote')?.value,
      fDeterminacion: this.formfe.get('fDeterminacion')?.value,
      observacion: this.formfe.get('observacion')?.value,

      volumen1: this.formfe.get('volumen1')?.value,
      volumen2: this.formfe.get('volumen2')?.value,
      volumen3: this.formfe.get('volumen3')?.value,

      tara1: this.formfe.get('tara1')?.value,
      tara2: this.formfe.get('tara2')?.value,
      tara3: this.formfe.get('tara3')?.value,

      pesoNeto1: this.formfe.get('pesoNeto1')?.value,
      pesoNeto2: this.formfe.get('pesoNeto2')?.value,
      pesoNeto3: this.formfe.get('pesoNeto3')?.value,

      pesoBruto1: this.formfe.get('pesoBruto1')?.value,
      pesoBruto2: this.formfe.get('pesoBruto2')?.value,
      pesoBruto3: this.formfe.get('pesoBruto3')?.value,

      fe1: this.formfe.get('fe1')?.value,
      fe2: this.formfe.get('fe2')?.value,
      fe3: this.formfe.get('fe3')?.value,

      totalfe: this.formfe.get('totalfe')?.value,
    };

    console.log(this.formfe.get('nNave')?.value)
    console.log(factorEstiba.nNave)

    const nLote = factorEstiba.nLote;
    console.log(factorEstiba)
    if (!nLote) {
      console.error("Debe ingresar un NLote válido para guardar.");
      return;
    }

    this.estibaService.getEstiba().subscribe({
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : data.results;

        if (!lista || !Array.isArray(lista)) {
          console.error("La API no devolvió una lista de estibas");
          return;
        }

        // 🔍 Filtrar por nLote exacto
        const encontrados = lista.filter((e: any) => String(e.nLote) === String(nLote));

        let responsables
        let fechaDet

        if (this.Responsable != '') {
          responsables = this.Responsable
        } else {
          responsables = factorEstiba.realizado
        }

        if (this.fechaDet != '') {
          fechaDet = this.fechaDet
        } else {
          fechaDet = factorEstiba.fDeterminacion
        }

        if (encontrados.length > 0) {
          // ✅ Existe → actualizar
          const estibaExistente = encontrados[0];
          this.estibaService.actualizarEstiba(estibaExistente.id, {
            nLote: nLote,
            factorEstiba: factorEstiba,
            observacion: factorEstiba.observacion,
            nReferencia: factorEstiba.nReferencia,
            tipoMaterial: factorEstiba.tipoMaterial,
            cliente: factorEstiba.cliente,
            realizado: responsables,
            nNave: factorEstiba.nNave,
            nSublote: factorEstiba.nSublote,
            fDeterminacion: fechaDet,

            volumen1: factorEstiba.volumen1,
            volumen2: factorEstiba.volumen2,
            volumen3: factorEstiba.volumen3,

            tara1: factorEstiba.tara1,
            tara2: factorEstiba.tara2,
            tara3: factorEstiba.tara3,

            pesoNeto1: factorEstiba.pesoNeto1,
            pesoNeto2: factorEstiba.pesoNeto2,
            pesoNeto3: factorEstiba.pesoNeto3,

            pesoBruto1: factorEstiba.pesoBruto1,
            pesoBruto2: factorEstiba.pesoBruto2,
            pesoBruto3: factorEstiba.pesoBruto3,

            fe1: factorEstiba.fe1,
            fe2: factorEstiba.fe2,
            fe3: factorEstiba.fe3,

            totalfe: factorEstiba.totalfe,
          }).subscribe({
            next: (res) => {
              console.log("Factor de estiba actualizado con éxito", res);
            },
            error: (err) => {
              console.error("Error al actualizar factor de estiba", err);
            }
          });
        } else {
          // ❌ No existe → crear
          this.estibaService.crearEstiba({
            nLote: nLote,
            factorEstiba: factorEstiba,
            observacion: factorEstiba.observacion,
            nReferencia: factorEstiba.nReferencia,
            tipoMaterial: factorEstiba.tipoMaterial,
            cliente: factorEstiba.cliente,
            realizado: responsables,
            nNave: factorEstiba.nNave,
            nSublote: factorEstiba.nSublote,
            fDeterminacion: fechaDet,

            volumen1: factorEstiba.volumen1,
            volumen2: factorEstiba.volumen2,
            volumen3: factorEstiba.volumen3,

            tara1: factorEstiba.tara1,
            tara2: factorEstiba.tara2,
            tara3: factorEstiba.tara3,

            pesoNeto1: factorEstiba.pesoNeto1,
            pesoNeto2: factorEstiba.pesoNeto2,
            pesoNeto3: factorEstiba.pesoNeto3,

            pesoBruto1: factorEstiba.pesoBruto1,
            pesoBruto2: factorEstiba.pesoBruto2,
            pesoBruto3: factorEstiba.pesoBruto3,

            fe1: factorEstiba.fe1,
            fe2: factorEstiba.fe2,
            fe3: factorEstiba.fe3,

            totalfe: factorEstiba.totalfe,
          }).subscribe({
            next: (res) => {
              console.log("Factor de estiba creado con éxito", res);
            },
            error: (err) => {
              console.error("Error al crear factor de estiba", err);
            }
          });
        }
      },
      error: (err) => {
        console.error("Error al obtener estibas", err);
      }
    });
  }

  calcularDensidad() {

    // --- Muestra 1 ---
    const tara1 = Number(this.formden.get('tara1')?.value) || 0;
    const pesoNeto1 = Number(this.formden.get('pesoNeto1')?.value) || 0;
    const pesoBruto1 = tara1 + pesoNeto1;

    this.formden.get('pesoBruto1')?.setValue(pesoBruto1.toFixed(2) || 0);

    // // --- Muestra 2 ---
    const tara2 = Number(this.formden.get('tara2')?.value) || 0;
    const pesoNeto2 = Number(this.formden.get('pesoNeto2')?.value) || 0;
    const pesoBruto2 = tara2 + pesoNeto2;

    this.formden.get('pesoBruto2')?.setValue(pesoBruto2.toFixed(2) || 0);

    // // --- Muestra 3 ---
    const tara3 = Number(this.formden.get('tara3')?.value) || 0;
    const pesoNeto3 = Number(this.formden.get('pesoNeto3')?.value) || 0;
    const pesoBruto3 = tara3 + pesoNeto3;

    this.formden.get('pesoBruto3')?.setValue(pesoBruto3.toFixed(2) || 0);

    // --- Calcular promedio de FE ---
    const fe1Val = Number(this.formden.get('densidad1')?.value) || 0;;
    const fe2Val = Number(this.formden.get('densidad2')?.value) || 0;
    const fe3Val = Number(this.formden.get('densidad3')?.value) || 0;

    if (fe1Val > 0 && fe2Val > 0 && fe3Val > 0) {
      const promedio = (fe1Val + fe2Val + fe3Val) / 3;
      this.formden.get('totalDen')?.setValue(Number(promedio.toFixed(2)));
    } else {
      this.formden.get('totalDen')?.setValue(0);
    }

    this.guardarDensidad()

  }

  guardarDensidad() {
    const densidad = {

      nLote: this.formden.get('nLote')?.value,
      nReferencia: this.formden.get('nReferencia')?.value,
      tipoMaterial: 'Concentrado de Cobre',
      cliente: this.formden.get('cliente')?.value,
      realizado: this.formden.get('realizado')?.value,
      nNave: this.formden.get('nave')?.value,
      nSublote: this.formden.get('nSublote')?.value,
      fDeterminacion: this.formden.get('fDeterminacion')?.value,
      observacion: this.formden.get('observacion')?.value,

      volumen1: this.formden.get('volumen1')?.value,
      volumen2: this.formden.get('volumen2')?.value,
      volumen3: this.formden.get('volumen3')?.value,

      tara1: this.formden.get('tara1')?.value,
      tara2: this.formden.get('tara2')?.value,
      tara3: this.formden.get('tara3')?.value,

      pesoNeto1: this.formden.get('pesoNeto1')?.value,
      pesoNeto2: this.formden.get('pesoNeto2')?.value,
      pesoNeto3: this.formden.get('pesoNeto3')?.value,

      pesoBruto1: this.formden.get('pesoBruto1')?.value,
      pesoBruto2: this.formden.get('pesoBruto2')?.value,
      pesoBruto3: this.formden.get('pesoBruto3')?.value,

      densidad1: this.formden.get('densidad1')?.value,
      densidad2: this.formden.get('densidad2')?.value,
      densidad3: this.formden.get('densidad3')?.value,

      totalDen: this.formden.get('totalDen')?.value,

    };

    const nLote = densidad.nLote;
    if (!nLote) {
      console.error("Debe ingresar un NLote válido para guardar.");
      return;
    }

    this.estibaService.getDensidad().subscribe({
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : data.results;

        if (!lista || !Array.isArray(lista)) {
          console.error("La API no devolvió una lista de estibas");
          return;
        }

        // 🔍 Filtrar por nLote exacto
        const encontrados = lista.filter((e: any) => String(e.nLote) === String(nLote));

        let responsables
        let fechaDet

        if (this.Responsable != '') {
          responsables = this.Responsable
        } else {
          responsables = densidad.realizado
        }

        if (this.Responsable != '') {
          fechaDet = this.Responsable
        } else {
          fechaDet = densidad.fDeterminacion
        }

        if (encontrados.length > 0) {
          // ✅ Existe → actualizar
          const estibaExistente = encontrados[0];
          this.estibaService.actualizarDensidad(estibaExistente.id, {
            nLote: nLote,
            nSublote: densidad.nSublote,
            observacion: densidad.observacion,

            nReferencia: densidad.nReferencia,
            tipoMaterial: densidad.tipoMaterial,
            cliente: densidad.cliente,
            realizado: responsables,
            nNave: densidad.nNave,
            fDeterminacion: fechaDet,

            volumen1: densidad.volumen1,
            volumen2: densidad.volumen2,
            volumen3: densidad.volumen3,

            tara1: densidad.tara1,
            tara2: densidad.tara2,
            tara3: densidad.tara3,

            pesoNeto1: densidad.pesoNeto1,
            pesoNeto2: densidad.pesoNeto2,
            pesoNeto3: densidad.pesoNeto3,

            pesoBruto1: densidad.pesoBruto1,
            pesoBruto2: densidad.pesoBruto2,
            pesoBruto3: densidad.pesoBruto3,

            densidad1: densidad.densidad1,
            densidad2: densidad.densidad2,
            densidad3: densidad.densidad3,

            totalDen: densidad.totalDen,
          }).subscribe({
            next: (res) => {
              console.log("✅ Densidad actualizada con éxito", res);
            },
            error: (err) => {
              console.error("❌ Error al actualizar densidad", err);
            }
          });
        } else {
          // ❌ No existe → crear
          this.estibaService.crearDensidad({
            nLote: nLote,
            nSublote: densidad.nSublote,
            observacion: densidad.observacion,

            nReferencia: densidad.nReferencia,
            tipoMaterial: densidad.tipoMaterial,
            cliente: densidad.cliente,
            realizado: responsables,
            nNave: densidad.nNave,
            fDeterminacion: fechaDet,

            volumen1: densidad.volumen1,
            volumen2: densidad.volumen2,
            volumen3: densidad.volumen3,

            tara1: densidad.tara1,
            tara2: densidad.tara2,
            tara3: densidad.tara3,

            pesoNeto1: densidad.pesoNeto1,
            pesoNeto2: densidad.pesoNeto2,
            pesoNeto3: densidad.pesoNeto3,

            pesoBruto1: densidad.pesoBruto1,
            pesoBruto2: densidad.pesoBruto2,
            pesoBruto3: densidad.pesoBruto3,

            densidad1: densidad.densidad1,
            densidad2: densidad.densidad2,
            densidad3: densidad.densidad3,

            totalDen: densidad.totalDen,
          }).subscribe({
            next: (res) => {
              console.log("✅ Densidad creada con éxito", res);
            },
            error: (err) => {
              console.error("❌ Error al crear densidad", err);
            }
          });
        }
      },
      error: (err) => {
        console.error("❌ Error al obtener densidad", err);
      }
    });
  }

}
