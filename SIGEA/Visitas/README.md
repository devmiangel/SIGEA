# Visitas - Documentación

Aplicación encargada de la gestión de **solicitudes de visita, asignación de visitas técnicas, registro de insumos usados en cada visita y el formulario de visita técnica**. La generación del **PDF de la visita técnica** se realiza en la app [`documentos`](../documentos/README.md).

Estructura interna de la app:

```
Visitas/
├── models.py               # Definición de las tablas (ORM)
├── serializers/            # Serializers de la API
│   ├── catalogs.py
│   ├── solicitudes.py
│   ├── visitas.py
│   └── formulario.py
├── views/                  # ViewSets y vistas (CRUD / acciones)
│   ├── catalogs.py
│   ├── solicitudes.py
│   └── formulario.py
├── urls.py                 # Registro de rutas (DefaultRouter + paths)
├── admin.py                # Registro en el panel de administración
└── migrations/             # Migraciones del ORM
```

---

## Models

Las tablas se generan a partir de `models.py` mediante el ORM de Django.

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `MotivosSolicitudes` | `MotivoSolicitud` (CharField) | Sin FK |
| `Estados` | `Estado` (CharField) | Sin FK |
| `Solicitudes` | `FechaSolicitud` (DateField, `auto_now_add`); `Observacion` (CharField 255); `motivoAdmin` (CharField, nullable) | FK `UP` (PROTECT, nullable) — app UPs; FK `MotivosSolicitudes` (PROTECT); FK `Estados` (PROTECT); FK `Usuario` (CASCADE, `related_name="solicitudes"`) — app Usuarios |
| `TiposVisitas` | `TipoVisita` (CharField) | Sin FK |
| `Visitas` | `FechaYHoraVisita` (DateTimeField); `Ubicacion` (CharField, nullable); `estado` (BooleanField, default False); `FirmaProductor`, `FirmaFuncionario` (TextField, nullable) | FK `Solicitudes` (CASCADE); FK `Funcionarios` (CASCADE, `related_name="visitas_funcionario"`); FK `Administradores` (CASCADE, `related_name="visitas_administrador"`); FK `TiposVisitas` (PROTECT) — apps Usuarios/UPs |
| `InsumoVisita` | `Cantidad` (IntegerField) | FK `Visitas` (CASCADE); FK `InventarioFuncionario` (PROTECT) — app Inventario. Registra el consumo de un insumo del inventario del funcionario durante la visita técnica; al crearse se descuenta `InventarioFuncionario.Cantidad`. |
| `Calificaciones` | `Calificacion` (CharField) | Sin FK |
| `InfoVisita` | `ObservacionVisita` (TextField); `AccionSeguimiento` (CharField); `Firmado` (BooleanField) | FK `Visitas` (CASCADE); FK `Calificaciones` (PROTECT) |

> **Aplicaciones externas involucradas en las FK:** `UPs.UP`, `Usuarios.Funcionarios`, `Usuarios.Administradores`, `Usuarios.Usuario` e `Inventario.InventarioFuncionario`.

---

## Serializers

### Catálogos (`serializers/catalogs.py`)

Todos `ModelSerializer` (`fields = '__all__'`):

`MotivosSolicitudesSerializer`, `EstadosSerializer`, `TiposVisitasSerializer`, `InsumoVisitaSerializer`, `CalificacionesSerializer`, `InfoVisitaSerializer`.

### Solicitudes (`serializers/solicitudes.py`)

| Serializer | Modelo | Descripción |
|---|---|---|
| `SolicitudesSerializer` | `Solicitudes` | Expone los campos principales más `solicitante` (email y nombres del usuario solicitante, calculados). |

### Visitas (`serializers/visitas.py`)

| Serializer | Modelo | Descripción |
|---|---|---|
| `VisitasSerializer` | `Visitas` | Expone los campos principales más datos calculados de lectura: `solicitud_info` (motivo, estado, UP/predio y solicitante), `funcionario_info`, `administrador_info` y `tipo_visita_label`. |

### Formulario (`serializers/formulario.py`)

| Serializer | Descripción |
|---|---|
| `FormularioVisitaTecnicaSerializer` | Serializer (no ligado a un modelo) con los campos del formulario de visita técnica: datos del productor, diagnóstico, acciones tomadas, calificación, firmas e IDs de referencia (`funcionario_id`, `administrador_id`, `usuario_id`, `tipo_visita_id`, `calificacion_id`, `motivo_id`, `estado_id`, `up_id`). Define la constante `ACCIONES_VISITA` con las acciones posibles (seg. y control, trat. médico, visita, insumos, recomendación, manejo, cirugía). Acepta además `insumos` (lista de `{inventario_funcionario_id, cantidad}`) que se valida de forma cruzada: si la acción `insumos` está marcada, la lista debe contener al menos un ítem. |

---

## Views

### Catálogos (`views/catalogs.py`)

8 `ModelViewSet` con CRUD completo (`list`, `retrieve`, `create`, `update`, `partial_update`, `destroy`):

`MotivosSolicitudesViewSet`, `EstadosViewSet`, `SolicitudesViewSet`, `TiposVisitasViewSet`, `VisitasViewSet`, `InsumoVisitaViewSet`, `CalificacionesViewSet`, `InfoVisitaViewSet`.

> `VisitasViewSet` sobrescribe `update`: al marcar la visita como realizada (`estado=true`), si la UP vinculada a la solicitud existe, le asigna el estado `En revision` (`EstadosUP`).

### Solicitudes (`views/solicitudes.py`)

| Vistas | Tipo | Descripción |
|---|---|---|
| `crear_solicitud` | `@api_view(['POST'])` | Crea una solicitud de visita (con UP opcional), asegurando que el usuario autenticado quede registrado como productor. Requiere autenticación. |
| `atender_solicitud` | `@api_view(['POST'])` | Valida que la solicitud esté `En Proceso`, crea la `Visitas` (fecha, ubicación, funcionario, tipo) y cambia la solicitud al estado atendido. Requiere autenticación. |
| `rechazar_solicitud` | `@api_view(['POST'])` | Cambia el estado de la solicitud a rechazado (solo si está `En Proceso`). Requiere autenticación. |
| `mis_visitas` | `@api_view(['GET'])` | Devuelve las visitas asignadas al funcionario autenticado (con `select_related` optimizado y ordenadas por fecha). Requiere autenticación. |

### Formulario (`views/formulario.py`)

| Vista | Tipo | Descripción |
|---|---|---|
| `FormularioVisitaTecnicaView` | `APIView` | `GET`: lista los PDFs de `media/formularios/visitas/`. `POST`: autollenado de datos del usuario y registra en BD la solicitud, visita, calificación e `InfoVisita`. Además, si la acción `insumos` fue marcada, registra los `InsumoVisita` y descuenta el inventario del funcionario (`InventarioFuncionario.Cantidad`) de forma atómica e idempotente (si la visita ya tiene insumos asociados no vuelve a descontar). El PDF se genera al vuelo en la app `documentos` (`GET /api/documentos/visita/<id>/generar/`). |

---

## Endpoints (URLs)

Rutas registradas en `urls.py`, bajo el prefijo `/api/visitas/`.

### Router (CRUD)

| Endpoint | Vista |
|---|---|
| `/api/visitas/motivosSolicitudes/` | `MotivosSolicitudesViewSet` |
| `/api/visitas/estados/` | `EstadosViewSet` |
| `/api/visitas/solicitudes/` | `SolicitudesViewSet` |
| `/api/visitas/tiposVisitas/` | `TiposVisitasViewSet` |
| `/api/visitas/visitas/` | `VisitasViewSet` |
| `/api/visitas/insumoVisita/` | `InsumoVisitaViewSet` |
| `/api/visitas/calificaciones/` | `CalificacionesViewSet` |
| `/api/visitas/infoVisita/` | `InfoVisitaViewSet` |

### Rutas de acción

| Endpoint | Vista | Método |
|---|---|---|
| `/api/visitas/solicitudes/crear/` | `crear_solicitud` | POST |
| `/api/visitas/solicitudes/<solicitud_id>/atender/` | `atender_solicitud` | POST |
| `/api/visitas/solicitudes/<solicitud_id>/rechazar/` | `rechazar_solicitud` | POST |
| `/api/visitas/mis-visitas/` | `mis_visitas` | GET |
| `/api/visitas/formulario-visita/` | `FormularioVisitaTecnicaView` | GET/POST |

---

## Admin

En `admin.py` se registran todos los modelos. Además:

- `VisitasAdmin` configura `list_display` (solicitud, funcionario, fecha/hora y tipo de visita) e incluye `InsumoVisitaInline` (`TabularInline`) para gestionar los insumos usados directamente desde el registro de la visita.
