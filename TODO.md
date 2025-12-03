# TODO: Implementar guardado de fInicioEmbarque y fTerminoEmbarque en detalle-composito

## Información Recopilada
- El modelo Django `Compositos` tiene campos `fInicioEmbarque` y `fTerminoEmbarque`.
- El componente Angular usa `fechaInicioEmbarque` y `fechaTerminoEmbarque` en el FormGroup y HTML.
- Hay discrepancia en los nombres de campos, lo que impide el guardado correcto.
- Los campos están presentes en el formulario, pero no se envían con los nombres correctos al backend.

## Plan
- Cambiar los nombres en el FormGroup de `fechaInicioEmbarque` a `fInicioEmbarque` y `fechaTerminoEmbarque` a `fTerminoEmbarque`.
- Actualizar el HTML para usar los nuevos formControlName.
- Ajustar el código en el componente para manejar los nuevos nombres en patchValue, save(), y conversión de fechas.

## Pasos
- [ ] Editar detalle-composito.component.ts: Cambiar nombres en FormGroup y ajustar código.
- [ ] Editar detalle-composito.component.html: Cambiar formControlName.
- [ ] Verificar que los campos se guarden correctamente (usuario realizará testing).

## Dependencias
- Ninguna, cambios locales en el componente.

## Seguimiento
- Después de cambios, el usuario testeará.
