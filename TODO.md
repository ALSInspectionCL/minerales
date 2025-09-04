# TODO: Implementar verificación y actualización/creación de Fluidez antes de guardar

## Pasos a completar:

1. Modificar método guardarHumedad en src/app/pages/imo/fluidez/fluidez.component.ts:
   - [x] Antes de guardar, hacer una consulta GET a la API para verificar si existe un registro de Fluidez para el nLote actual.
   - [x] Si existe, actualizar el registro con PUT usando el id del registro existente.
   - [x] Si no existe, crear un nuevo registro con POST.
   - [x] Manejar respuestas exitosas y errores para ambas operaciones.

2. Probar la funcionalidad:
   - Verificar que al guardar, si el registro existe se actualice.
   - Verificar que si no existe, se cree un nuevo registro.
   - Confirmar que los mensajes de éxito y error se muestran correctamente en consola.

3. Actualizar TODO:
   - [x] Marcar pasos como completados.

---

# TODO: Implementar formularios de fluidez en mat-expansion-panels

## Pasos a completar:

1. Actualizar fluidez.component.ts:
   - [ ] Agregar array fluidezForms: FormGroup[] para 7 formularios (uno por panel).
   - [ ] Inicializar 7 FormGroups en ngOnInit con campos: id, nLote, nPrueba, nLata1/2, pLata1/2, pBrutoHumedo1/2, pBrutoSeco1/2, porcHumedad1/2, porcHumedadPromedio, estado, etc.
   - [ ] Agregar métodos de cálculo: updatePorcHumedadFluidez(step), updatePorcHumedadPromedioFluidez(step).
   - [ ] Agregar método guardarFluidez(step: number) para guardar datos en API con nPrueba = step + 1.
   - [ ] Agregar lógica de preload para datos existentes de fluidez por paso.

2. Actualizar fluidez.component.html:
   - [ ] Reemplazar contenido placeholder en cada mat-expansion-panel con campos de formulario reales ligados a fluidezForms[step].
   - [ ] Agregar botón "Guardar" en mat-action-row de cada panel para llamar guardarFluidez(step).

3. Probar la funcionalidad:
   - [ ] Verificar que los formularios funcionen correctamente.
   - [ ] Confirmar integración con API.
   - [ ] Verificar cálculos automáticos.
   - [ ] Asegurar navegación entre paneles funcione correctamente.

4. Actualizar TODO:
   - [ ] Marcar pasos como completados.
