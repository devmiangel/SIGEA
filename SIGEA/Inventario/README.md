# Inventario - Documentación

Aplicación encargada de la gestión del inventario del sistema. Agrupa tres módulos:

- **Vehículos**: catálogos (tipos, combustibles, marcas, líneas), registro de vehículos, conductores y asignaciones de vehículos.
- **Herramientas**: catálogo de tipos de herramienta, registro de herramientas y asignaciones a funcionarios.
- **Insumos**: registro de insumos, inventario por funcionario, cardex de asignaciones y solicitudes de insumo de los funcionarios.

Estructura interna de la app:

```
Inventario/
├── models.py               # Definición de las tablas (ORM)
├── serializers/            # Serializers de la API
│   ├── vehiculos.py
│   ├── herramientas.py
│   └── insumos.py
├── views/                  # ViewSets (CRUD)
│   ├── vehiculos.py
│   ├── herramientas.py
│   └── insumos.py
├── urls.py                 # Registro de rutas (DefaultRouter)
├── admin.py                # Registro en el panel de administración
└── migrations/             # Migraciones del ORM
```

---

## Models

Las tablas se generan a partir de `models.py` mediante el ORM de Django. Se organizan por módulo.

### Módulo Vehículos

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `TiposVehiculos` | `TipoVehiculo` (CharField) | Sin FK |
| `TiposCombustibles` | `TipoCombustible` (CharField) | Sin FK |
| `MarcasVehiculos` | `MarcaVehiculo` (CharField) | Sin FK |
| `LineasVehiculos` | `LineaVehiculo` (CharField) | FK `MarcasVehiculos` (PROTECT) |
| `Vehiculos` | Sin campos propios | FK `LineasVehiculos`, `TiposCombustibles`, `TiposVehiculos` (PROTECT) |
| `DetalleVehiculos` | `Placa`, `Modelo` (CharField); `FechaTecno`, `FechaSoat` (DateField); `Descripcion` (TextField); `Estado` (BooleanField) | FK `Vehiculos` (CASCADE) |
| `Conductores` | `Licencia` (CharField); `Estado` (BooleanField) | FK `Funcionarios` (CASCADE) — app Usuarios |
| `RegistroAsignacionVehiculos` | `FechaAsignacion`, `FechaDevolucion` (DateField); `Entregado` (BooleanField) | FK `DetalleVehiculos`, `Conductores` (CASCADE) y `Administradores` (CASCADE) — app Usuarios |

### Módulo Herramientas

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `TiposHerramientas` | `TipoHerramienta` (CharField) | Sin FK |
| `Herramientas` | `Herramienta` (CharField); `Descripcion` (TextField); `Estado` (BooleanField) | FK `TiposHerramientas` (PROTECT) |
| `AsignacionHerramientas` | `FechaAsignacion`, `FechaDevolucion` (DateField); `Entregado` (BooleanField) | FK `Herramientas` (CASCADE), `Funcionarios` (CASCADE) y `Administradores` (CASCADE) — app Usuarios |

### Módulo Insumos

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `Insumos` | `Nombre` (CharField); `Cantidad` (IntegerField); `Descripcion` (TextField); `Estado` (BooleanField) | FK `Unidades` (PROTECT) — app UPs |
| `InventarioFuncionario` | `Cantidad` (IntegerField) | FK `Insumos` (CASCADE) y `Funcionarios` (CASCADE) — app Usuarios |
| `CardexInsumoFuncionario` | `Cantidad` (IntegerField); `FechaAsignacion` (DateField) | FK `Funcionarios`, `Insumos` y `Administradores` (CASCADE) — app Usuarios |
| `SolicitudInsumo` | `Cantidad` (IntegerField); `FechaSolicitud` (DateField, `auto_now_add`); `Estado` (CharField, default `Pendiente`); `Observacion` (TextField, nullable) | FK `Insumos` (CASCADE) y `Funcionarios` (CASCADE) — app Usuarios. Solicitud de insumo creada por un funcionario y resuelta/rechazada por un administrador |

> **Aplicaciones externas involucradas en las FK:**
> - `Usuarios.Funcionarios` → tabla `Funcionarios` de la app Usuarios (vinculada a un `Usuario`).
> - `Usuarios.Administradores` → tabla `Administradores` de la app Usuarios.
> - `UPs.Unidades` → tabla `Unidades` de la app UPs (catálogo de unidades de medida).

---

## Serializers

Todos los serializers son `ModelSerializer` con `fields = '__all__'`, es decir, exponen **todos** los campos del modelo en JSON (se usa la FK como ID numérico).

### Serializers Vehículos (`serializers/vehiculos.py`)

| Serializer | Modelo asociado |
|---|---|
| `TiposVehiculosSerializer` | `TiposVehiculos` |
| `TiposCombustiblesSerializer` | `TiposCombustibles` |
| `MarcasVehiculosSerializer` | `MarcasVehiculos` |
| `LineasVehiculosSerializer` | `LineasVehiculos` |
| `VehiculosSerializer` | `Vehiculos` |
| `DetalleVehiculosSerializer` | `DetalleVehiculos` |
| `ConductoresSerializer` | `Conductores` |
| `RegistroAsignacionVehiculosSerializer` | `RegistroAsignacionVehiculos` |

### Serializers Herramientas (`serializers/herramientas.py`)

| Serializer | Modelo asociado |
|---|---|
| `TiposHerramientasSerializer` | `TiposHerramientas` |
| `HerramientasSerializer` | `Herramientas` |
| `AsignacionHerramientasSerializer` | `AsignacionHerramientas` |

### Serializers Insumos (`serializers/insumos.py`)

| Serializer | Modelo asociado |
|---|---|
| `InsumosSerializer` | `Insumos` |
| `InventarioFuncionarioSerializer` | `InventarioFuncionario` |
| `CardexInsumoFuncionarioSerializer` | `CardexInsumoFuncionario` |
| `SolicitudInsumoSerializer` | `SolicitudInsumo` (añade `insumo_nombre`, `insumo_unidades`, `funcionario_nombre` y `funcionario_email`) |

---

## Views

Todas las vistas son `ModelViewSet` de Django REST Framework, por lo que exponen automáticamente las operaciones CRUD completas: `list`, `retrieve`, `create`, `update`, `partial_update` y `destroy`. Los ViewSets usan `SigeaModelPermissionMixin` (autenticación + permiso de modelo).

### Vistas Vehículos (`views/vehiculos.py`)

| Vistas | Modelo | Descripción |
|---|---|---|
| `TiposVehiculosViewSet` | `TiposVehiculos` | CRUD de tipos de vehículo. |
| `TiposCombustiblesViewSet` | `TiposCombustibles` | CRUD de tipos de combustible. |
| `MarcasVehiculosViewSet` | `MarcasVehiculos` | CRUD de marcas de vehículo. |
| `LineasVehiculosViewSet` | `LineasVehiculos` | CRUD de líneas de vehículo. |
| `VehiculosViewSet` | `Vehiculos` | CRUD de vehículos. |
| `DetalleVehiculosViewSet` | `DetalleVehiculos` | CRUD del detalle de vehículos (placa, modelo, fechas, estado). |
| `ConductoresViewSet` | `Conductores` | CRUD de conductores. |
| `RegistroAsignacionVehiculosViewSet` | `RegistroAsignacionVehiculos` | CRUD del registro de asignación/devolución de vehículos a conductores. |

### Vistas Herramientas (`views/herramientas.py`)

| Vistas | Modelo | Descripción |
|---|---|---|
| `TiposHerramientasViewSet` | `TiposHerramientas` | CRUD de tipos de herramienta. |
| `HerramientasViewSet` | `Herramientas` | CRUD de herramientas. |
| `AsignacionHerramientasViewSet` | `AsignacionHerramientas` | CRUD de asignaciones/devoluciones de herramientas a funcionarios. |

### Vistas Insumos (`views/insumos.py`)

| Vistas | Modelo | Descripción |
|---|---|---|
| `InsumosViewSet` | `Insumos` | CRUD de insumos. |
| `InventarioFuncionarioViewSet` | `InventarioFuncionario` | CRUD del inventario de insumos por funcionario. |
| `CardexInsumoFuncionarioViewSet` | `CardexInsumoFuncionario` | CRUD del cardex de asignación de insumos a funcionarios. |

### Vistas de acción (asignaciones y solicitudes)

| Vista | Tipo | Descripción |
|---|---|---|
| `listar_solicitudes_insumo` | `@api_view(['GET'])` | Lista las solicitudes de insumo. El funcionario ve solo las suyas; el administrador ve todas. Requiere autenticación. |
| `crear_solicitud_insumo` | `@api_view(['POST'])` | El funcionario solicita un insumo (valida disponibilidad y stock). Requiere autenticación. |
| `asignar_solicitud_insumo` | `@api_view(['POST'])` | El administrador atiende una solicitud: crea el `CardexInsumoFuncionario`, incrementa `InventarioFuncionario` y descuenta el stock del `Insumos` (atómico). |
| `rechazar_solicitud_insumo` | `@api_view(['POST'])` | El administrador rechaza una solicitud pendiente, guardando la observación. |
| `asignar_insumo_directo` | `@api_view(['POST'])` | El administrador asigna insumos directamente a un funcionario sin solicitud previa. |
| `asignar_herramienta_directo` | `@api_view(['POST'])` | El administrador asigna una herramienta disponible a un funcionario. |
| `asignar_vehiculo_directo` | `@api_view(['POST'])` | El administrador asigna un vehículo disponible a un funcionario con licencia de conductor. |

---

## Endpoints (URLs)

Las rutas se registran con `DefaultRouter` en `urls.py`, bajo el prefijo `/api/inventario/` (definido en `SIGEAsite/urls.py`). Cada endpoint soporta los métodos HTTP del CRUD (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

| Endpoint | Vista |
|---|---|
| `/api/inventario/tiposVehiculos/` | `TiposVehiculosViewSet` |
| `/api/inventario/tiposCombustibles/` | `TiposCombustiblesViewSet` |
| `/api/inventario/marcasVehiculos/` | `MarcasVehiculosViewSet` |
| `/api/inventario/lineasVehiculos/` | `LineasVehiculosViewSet` |
| `/api/inventario/vehiculos/` | `VehiculosViewSet` |
| `/api/inventario/detalleVehiculos/` | `DetalleVehiculosViewSet` |
| `/api/inventario/conductores/` | `ConductoresViewSet` |
| `/api/inventario/registroAsignacionVehiculos/` | `RegistroAsignacionVehiculosViewSet` |
| `/api/inventario/tiposHerramientas/` | `TiposHerramientasViewSet` |
| `/api/inventario/herramientas/` | `HerramientasViewSet` |
| `/api/inventario/asignacionHerramientas/` | `AsignacionHerramientasViewSet` |
| `/api/inventario/insumos/` | `InsumosViewSet` |
| `/api/inventario/inventarioFuncionario/` | `InventarioFuncionarioViewSet` |
| `/api/inventario/cardexInsumoFuncionario/` | `CardexInsumoFuncionarioViewSet` |

### Rutas de acción

| Endpoint | Vista | Método |
|---|---|---|
| `/api/inventario/solicitudInsumo/` | `listar_solicitudes_insumo` | GET |
| `/api/inventario/solicitudInsumo/crear/` | `crear_solicitud_insumo` | POST |
| `/api/inventario/solicitudInsumo/<solicitud_id>/asignar/` | `asignar_solicitud_insumo` | POST |
| `/api/inventario/solicitudInsumo/<solicitud_id>/rechazar/` | `rechazar_solicitud_insumo` | POST |
| `/api/inventario/insumos/<insumo_id>/asignar/` | `asignar_insumo_directo` | POST |
| `/api/inventario/herramientas/<herramienta_id>/asignar/` | `asignar_herramienta_directo` | POST |
| `/api/inventario/detalleVehiculos/<detalle_vehiculo_id>/asignar/` | `asignar_vehiculo_directo` | POST |

---

## Admin

En `admin.py` se registran todos los modelos de la app. Además:

- `VehiculosAdmin` configura `list_display` (línea, tipo y combustible) e incluye `DetalleVehiculoInline` (`TabularInline`), permitiendo gestionar los detalles de placa, modelo y fechas directamente desde el registro del vehículo.
