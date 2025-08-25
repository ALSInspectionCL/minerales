# Diagrama de Procesos del Sistema de Gestión de Minerales

## 🏭 Flujo General del Sistema

```mermaid
flowchart TD
    Inicio([Inicio del Proceso]) --> Config[Configuración Inicial]
    Config --> Servicio[Crear Servicio]
    Servicio --> Solicitud[Crear Solicitud]
    Solicitud --> Bodega[Configurar Bodegas]
    Bodega --> Recepcion[Proceso de Recepción]
    Recepcion --> Inventario[Actualizar Inventario]
    Inventario --> Despacho[Proceso de Despacho]
    Despacho --> Embarque[Proceso de Embarque]
    Embarque --> Humedad[Análisis de Humedad]
    Humedad --> Trazabilidad[Trazabilidad]
    Trazabilidad --> Reportes[Generar Reportes]
    Reportes --> Fin([Fin del Proceso])

    subgraph "Gestión de Calidad"
        Humedad --> Criterios[Criterios de Aceptación]
        Humedad --> Verificacion[Verificación de Balanza]
        Humedad --> Pesaje[Pesaje y Control]
    end

    subgraph "Logística"
        Recepcion --> Transporte[Control de Transporte]
        Despacho --> Camiones[Despacho de Camiones]
        Embarque --> Naves[Embarque Marítimo]
    end
```

## 📋 Proceso Detallado por Módulos

### 1. **Gestión de Servicios**
```mermaid
flowchart LR
    A[Cliente Solicita Servicio] --> B[Crear Servicio]
    B --> C[Asignar Referencia ALS]
    C --> D[Definir Tipo de Servicio]
    D --> E[Establecer Fecha y Ubicación]
    E --> F[Asignar Estado: Pendiente/Activo/Completado]
```

### 2. **Gestión de Solicitudes**
```mermaid
flowchart LR
    A[Servicio Creado] --> B[Crear Solicitud Asociada]
    B --> C[Asignar Número de Solicitud]
    C --> D[Definir Fechas Inicio/Finalización]
    D --> E[Establecer Ubicación y Estado]
    E --> F[Vincular a Servicio]
```

### 3. **Configuración de Bodegas**
```mermaid
flowchart LR
    A[Configurar Bodega] --> B[Nombre y Ubicación]
    B --> C[Capacidad Total]
    C --> D[Imagen de Referencia]
    D --> E[Estado: Activa/Inactiva]
```

### 4. **Proceso de Recepción**
```mermaid
flowchart TD
    A[Transporte Llega] --> B[Verificar Documentación]
    B --> C[Pesar Bruto]
    C --> D[Descargar Material]
    D --> E[Pesar Tara]
    E --> F[Calcular Neto Húmedo]
    F --> G[Tomar Muestra para Humedad]
    G --> H[Análisis de Laboratorio]
    H --> I[Calcular Neto Seco]
    I --> J[Crear Lote de Recepción]
    J --> K[Actualizar Inventario]
```

### 5. **Gestión de Inventario**
```mermaid
flowchart LR
    A[Recepción Completa] --> B[Crear Lote en Inventario]
    B --> C[Asignar a Bodega]
    C --> D[Actualizar Stock Total]
    D --> E[Control de Ubicación]
    E --> F[Estado: Disponible/Reservado]
```

### 6. **Proceso de Despacho**
```mermaid
flowchart TD
    A["Servicio de Despacho"] --> B["Solicitud de Despacho"]
    B --> C["Crear Lote"]
    C --> n1["¿Tipo Embarque o camión?"]
    n1 -- Embarque --> n2["Ingresar al detalle"]
    n1 -- Camión --> n3["Ingresar al detalle"]
    n2 --> n5["Completar la información del embarque"]
    n5 --> n6["Crear registro odometro"]
    n6 --> n7["Guardar Registros"]
    n7 --> n8["Actualizar Lote"]
    n8 --> n9["Aprobar registros"] & n18["Generar Certificados del embarque"]
    n9 --> n10["Modificar Inventario"]
    n3 --> n11["Crear registro de camión"]
    n11 --> n12["Completar información del camión"]
    n12 --> n13["Guardar Registros"]
    n13 --> n14["Actualizar Lote"]
    n14 --> n15["Aprobar registros"]
    n15 --> n16["Modificar Inventario"]
    n16 --> n17["Fin"]
    n10 --> n17
    n1@{ shape: decision}
    n17@{ shape: terminal}
```

### 7. **Proceso de Embarque**
```mermaid
flowchart TD
    A["Servicio de Despacho"] --> B["Solicitud de Despacho"]
    B --> C["Crear Lote"]
    C --> n1["¿Tipo Embarque o camión?"]
    n1 -- Embarque --> n2["Ingresar al detalle"]
    n1 -- Camión --> n3["Ingresar al detalle"]
    n2 --> n5["Completar la información del embarque"]
    n5 --> n6["Crear registro odometro"]
    n6 --> n7["Guardar Registros"]
    n7 --> n8["Actualizar Lote"]
    n8 --> n9["Aprobar registros"] & n18["Generar Certificados del embarque"]
    n9 --> n10["Modificar Inventario"]
    n3 --> n11["Crear registro de camión"]
    n11 --> n12["Completar información del camión"]
    n12 --> n13["Guardar Registros"]
    n13 --> n14["Actualizar Lote"]
    n14 --> n15["Aprobar registros"]
    n15 --> n16["Modificar Inventario"]
    n16 --> n17["Fin"]
    n10 --> n17
    n1@{ shape: decision}
    n17@{ shape: terminal}
```

### 8. **Análisis de Humedad**
```mermaid
flowchart TD
    A["Toma de Muestra"] --> B["Preparación de Muestra"]
    B --> C["Pesaje Inicial"]
    C --> D["Secado en Horno"]
    D --> E["Pesaje Final"]
    E --> F["Calcular % Humedad"]
    F --> G["Validar Criterios"]
    G --> H["Aprobar/Rechazar"]
    H --> I["Fin"]
    n1["Seleccionar Servicio"] --> n2["Seleccionar Solicitud"]
    n2 --> n3["Seleccionar Lote"]
    n3 --> n4["¿Es un embarque?"]
    n4 -- Si --> n5["Seleccionar Sublote"]
    n4 -- No --> A
    n5 --> A
    I@{ shape: terminal}
    n1@{ shape: proc}
    n4@{ shape: decision}
```

### 9. **Trazabilidad**
```mermaid
flowchart TD
 subgraph s1["Crear Trazabilidad"]
        n1["Seleccionar Servicio"]
        n2["Seleccionar Solicitud"]
        n3["Seleccionar Lote"]
        n4["Se crea Trazabilidad"]
        n5["Se crean QR"]
  end
 subgraph s2["Actualizar Trazabilidad"]
        n6["Se escanea QR de trazabilidad"]
        n7["¿Muestra Natural, General o Preparación mecánica?"]
        n8["Se guarda la fecha y hora"]
        n9["Se guarda la fecha y hora"]
        n11["Se actualiza su estado"]
        n12["Se actualiza su estado"]
        n13["Se despliega interfaz de preparación mecánica"]
        n14["Se completa la infomación del sobre"]
        n15["Se guarda la información"]
  end
    n1 --> n2
    n2 --> n3
    n3 --> n4 & n5
    n6 --> n7
    n7 -- Natural --> n8
    n7 -- General --> n9
    n8 --> n11
    n9 --> n12
    n7 -- Mecánica --> n13
    n13 --> n14
    n14 --> n15
    s1 --> s2
    n1@{ shape: proc}
    n4@{ shape: event}
    n5@{ shape: event}
    n7@{ shape: decision}
```

### 10. **Generación de Reportes**
```mermaid
flowchart LR
    A[Datos del Sistema] --> B[Reportes de Inventario]
    A --> C[Reportes de Despacho]
    A --> D[Reportes de Calidad]
    A --> E[Reportes de Trazabilidad]
    A --> F[Reportes de Humedad]
    B --> G[Exportar Excel/PDF]
    C --> G
    D --> G
    E --> G
    F --> G
```

## 🔍 Estados del Sistema

### Estados de Servicio
- **Pendiente**: Servicio creado, pendiente de inicio
- **Activo**: Servicio en proceso
- **Completado**: Servicio finalizado
- **Cancelado**: Servicio anulado

### Estados de Lotes
- **Recepción**: Lote en proceso de recepción
- **Inventario**: Lote disponible en bodega
- **Reservado**: Lote asignado para despacho
- **Despachado**: Lote enviado
- **Embarcado**: Lote en embarque final

### Estados de Transporte
- **En tránsito**: Transporte en movimiento
- **En destino**: Transporte llegó a destino
- **Descargado**: Material descargado
- **Cargado**: Material cargado para despacho

## 📊 Integración de Sistemas

### Frontend (Angular)
- **Páginas**: Recepción, Despacho, Inventario, Humedad, Trazabilidad, Reportes
- **Servicios**: HTTP Client para comunicación con API
- **Estado**: Gestión en tiempo real

### Backend (Django REST Framework)
- **API Endpoints**: CRUD para todos los módulos
- **Serializers**: Transformación de datos
- **Autenticación**: Control de acceso por roles
- **Base de Datos**: SQLite3 con modelos relacionales

### Flujo de Datos
```mermaid
flowchart LR
    Angular[Frontend Angular] --> API[REST API Django]
    API --> DB[(SQLite Database)]
    DB --> API
    API --> Angular
    API --> Reports[Generador de Reportes]
    Reports --> Excel[Excel/PDF]
```

## 🔄 Procesos Automatizados

### Cálculos Automáticos
- **Neto Seco**: Basado en % de humedad
- **Diferencias**: Entre origen y destino
- **Totales**: Inventario por bodega
- **Trazabilidad**: Códigos QR automáticos

### Notificaciones
- **Alertas**: Vencimiento de fechas
- **Estados**: Cambios en lotes
- **Reportes**: Generación programada

## 📱 Acceso Móvil y Web

### Diseño Responsivo
- **Desktop**: Acceso completo a todas funciones
- **Tablet**: Funcionalidad básica
- **Móvil**: Consulta de información y escaneo QR

### Integración con Hardware
- **Balanza**: Lectura automática de pesos
- **Escáner**: Código QR para trazabilidad
- **Impresora**: Etiquetas y reportes

---

## 🎯 Resumen de Procesos Clave

1. **Inicio**: Cliente solicita servicio → Sistema crea servicio y solicitud
2. **Recepción**: Transporte llega → Se recepciona → Se analiza → Se almacena
3. **Inventario**: Control de stock → Ubicación en bodega → Estado disponible
4. **Despacho**: Solicitud → Selección de lotes → Despacho → Actualización
5. **Embarque**: Finalización → Documentación → Envío al cliente
6. **Trazabilidad**: Seguimiento completo desde origen hasta destino final
7. **Reportes**: Generación automática de todos los indicadores del sistema
