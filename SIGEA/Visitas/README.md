# Visitas - Documentación

Aplicación encargada de la gestión de **solicitudes de visita, asignación de visitas técnicas, registro de insumos usados en cada visita, formulario de visita técnica y formulario de recibo de pago de servicios agropecuarios**. La generación de los PDF se realiza en la app [`documentos`](../documentos/README.md).

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
| `Solicitudes` | `FechaSolicitud` (DateField, `auto_now_add`); `Observacion` (TextField); `Direccion` (CharField 255); `motivoAdmin` (CharField, nullable); `novedad` (CharField, nullable, acumula los motivos de reagendamiento) | FK `UP` (PROTECT, nullable) — app UPs; FK `MotivosSolicitudes` (PROTECT); FK `Estados` (PROTECT); FK `Usuario` (CASCADE, `related_name="solicitudes"`) — app Usuarios |
| `TiposVisitas` | `TipoVisita` (CharField) | Sin FK |
| `Visitas` | `FechaYHoraVisita` (DateTimeField); `Ubicacion` (CharField, nullable); `estado` (BooleanField, default False); `Autorizacion` (BooleanField, default False, autorización de tratamiento de datos); `FirmaProductor`, `FirmaFuncionario` (TextField, nullable) | FK `Solicitudes` (CASCADE); FK `Funcionarios` (CASCADE, `related_name="visitas_funcionario"`); FK `Administradores` (CASCADE, `related_name="visitas_administrador"`); FK `TiposVisitas` (PROTECT) — apps Usuarios/UPs |
| `ServiciosPagos` | `ServicioPago` (CharField) | Sin FK. Catálogo (Maquinaria Agrícola, Inseminación Artificial) |
| `Aperos` | `Apero` (CharField); `ValorHora` (IntegerField) | Sin FK. Catálogo de aperos/implementos de maquinaria |
| `Pajillas` | `Pajilla` (CharField); `ValorPajilla` (IntegerField) | Sin FK. Catálogo de pajillas de inseminación |
| `VisitasServiciosPagos` | `NumeroHoras`, `NumeroPajillas`, `ValorTotal` (IntegerField, nullable); `Toro` (BooleanField, nullable) | FK `Visitas` (CASCADE); FK `ServiciosPagos` (PROTECT); FK `Aperos` (PROTECT, nullable); FK `Pajillas` (PROTECT, nullable). Detalle del servicio pagado en una visita (maquinaria o inseminación) |
| `InsumoVisita` | `Cantidad` (IntegerField) | FK `Visitas` (CASCADE); FK `InventarioFuncionario` (PROTECT) — app Inventario. Registra el consumo de un insumo del inventario del funcionario durante la visita técnica; al crearse se descuenta `InventarioFuncionario.Cantidad`. |
| `Calificaciones` | `Calificacion` (CharField) | Sin FK |
| `InfoVisita` | `ObservacionVisita` (TextField); `AccionSeguimiento` (CharField); `Firmado` (BooleanField); `DiagnosticoPresuntivo` (CharField); `Acciones` (CharField, acciones separadas por coma); `HoraInicio`, `HoraSalida` (DateTimeField) | FK `Visitas` (CASCADE); FK `Calificaciones` (PROTECT) |

> **Aplicaciones externas involucradas en las FK:** `UPs.UP`, `Usuarios.Funcionarios`, `Usuarios.Administradores`, `Usuarios.Usuario` e `Inventario.InventarioFuncionario`.

---

## Serializers

### Catálogos (`serializers/catalogs.py`)

Todos `ModelSerializer` (`fields = '__all__'`):

`MotivosSolicitudesSerializer`, `EstadosSerializer`, `TiposVisitasSerializer`, `CalificacionesSerializer`, `InfoVisitaSerializer`, `ServiciosPagosSerializer`, `AperosSerializer`, `PajillasSerializer`, `VisitasServiciosPagosSerializer`.

`InsumoVisitaSerializer` añade campos calculados de solo lectura: `insumo_nombre`, `insumo_unidades` y `stock_disponible` (cantidad actual del `InventarioFuncionario`).

### Solicitudes (`serializers/solicitudes.py`)

| Serializer | Modelo | Descripción |
|---|---|---|
| `SolicitudesSerializer` | `Solicitudes` | Expone `id`, `UP`, `tipo_up` (tipo de la UP), `FechaSolicitud`, `MotivoSolicitud`, `Observacion`, `Direccion`, `Estado`, `Usuario`, `solicitante` (email y nombres del usuario) y `novedad`. |

### Visitas (`serializers/visitas.py`)

| Serializer | Modelo | Descripción |
|---|---|---|
| `VisitasSerializer` | `Visitas` | Expone los campos principales (incluida `Autorizacion`) más datos calculados de lectura: `solicitud_info` (motivo, estado, dirección, UP/predio, estado de la UP y solicitante), `funcionario_info`, `administrador_info` y `tipo_visita_label`. |

### Formulario (`serializers/formulario.py`)

| Serializer | Descripción |
|---|---|
| `FormularioVisitaTecnicaSerializer` | Serializer (no ligado a un modelo) con los campos del formulario de visita técnica: datos del productor, diagnóstico, acciones tomadas, calificación, firmas e IDs de referencia (`funcionario_id`, `administrador_id`, `usuario_id`, `tipo_visita_id`, `calificacion_id`, `motivo_id`, `estado_id`, `up_id`, `visita_id`, `motivo_admin`). Define la constante `ACCIONES_VISITA` con las acciones posibles (seg. y control, trat. médico, visita, insumos, recomendación, manejo, cirugía). Acepta además `insumos` (lista de `{inventario_funcionario_id, cantidad}`) que se valida de forma cruzada: si la acción `insumos` está marcada, la lista debe contener al menos un ítem. Las firmas se validan como base64. |
| `InsumoConsumoSerializer` | Serializer anidado para cada insumo consumido (`inventario_funcionario_id`, `cantidad`). |
| `FormularioReciboPagoSerializer` | Serializer del recibo de pago: `servicio_pago`/`servicio_pago_id`, `apero_id`, `numero_horas`, `pajilla_id`, `numero_pajillas`, `toro`, `valor_total`, `visita_id` y firmas. Valida que sea **Maquinaria Agrícola** o **Inseminación Artificial** y exige los campos correspondientes. |

---

## Views

### Catálogos (`views/catalogs.py`)

12 `ModelViewSet` con CRUD completo (`list`, `retrieve`, `create`, `update`, `partial_update`, `destroy`), todos protegidos con `SigeaModelPermissionMixin` (autenticación + permiso de modelo):

`MotivosSolicitudesViewSet`, `EstadosViewSet`, `SolicitudesViewSet`, `TiposVisitasViewSet`, `VisitasViewSet`, `InsumoVisitaViewSet`, `CalificacionesViewSet`, `InfoVisitaViewSet`, `ServiciosPagosViewSet`, `AperosViewSet`, `PajillasViewSet`, `VisitasServiciosPagosViewSet`.

> `VisitasViewSet` sobrescribe `update`: al marcar la visita como realizada (`estado=true`), **solo si el tipo de visita es `Caracterización`** asigna el estado `En revision` (`EstadosUP`) a la UP vinculada a la solicitud. Las visitas de seguimiento/técnica no reabren la validación de la UP.

### Solicitudes (`views/solicitudes.py`)

| Vistas | Tipo | Descripción |
|---|---|---|
| `crear_solicitud` | `@api_view(['POST'])` | Crea una solicitud de visita. Requiere `observacion` y `direccion`; acepta `up_id`, `motivo_id` y opcionalmente `usuario_id` (para que un funcionario/administrador cree la solicitud a nombre de un productor). Asegura el registro del `Productores`. Requiere autenticación. |
| `reagendar_solicitud` | `@api_view(['POST'])` | Permite reagendar una solicitud en estado `En Proceso`/`Reagendado`; exige `motivo_reagendamiento`, lo acumula en `novedad` y cambia el estado a `Reagendado`. |
| `atender_solicitud` | `@api_view(['POST'])` | Valida que la solicitud esté `En Proceso` o `Reagendado`, crea/actualiza la `Visitas` (fecha, ubicación, funcionario, tipo) y pasa la solicitud a atendida. En caso de reagendamiento reutiliza la visita existente. Requiere autenticación. |
| `rechazar_solicitud` | `@api_view(['POST'])` | Cambia el estado de la solicitud a rechazado (solo si está `En Proceso`/`Reagendado`), guardando opcionalmente `novedad`. Requiere autenticación. |
| `info_visita_observaciones` | `@api_view(['GET','POST'])` | `GET`: devuelve la observación de la `InfoVisita`. `POST`: crea o actualiza la observación de la visita (crea una `InfoVisita` con calificación `Sin calificación` si no existe). |
| `mis_visitas` | `@api_view(['GET'])` | Devuelve las visitas asignadas al funcionario autenticado (excluye las reagendadas), con `select_related` optimizado y ordenadas por fecha. Requiere autenticación. |

### Formulario (`views/formulario.py`)

| Vista | Tipo | Descripción |
|---|---|---|
| `FormularioVisitaTecnicaView` | `APIView` | `GET`: lista los PDFs de `media/formularios/visitas/` y autollena datos del usuario si se pasa `usuario_id`. `POST`: autollenado de datos del usuario y registra en BD la solicitud, visita, calificación e `InfoVisita`; si llega `visita_id`, reutiliza la solicitud/visita creadas al atender. Además, si la acción `insumos` fue marcada, registra los `InsumoVisita` y descuenta el inventario del funcionario (`InventarioFuncionario.Cantidad`) de forma atómica e idempotente (si la visita ya tiene insumos asociados no vuelve a descontar). El PDF se genera al vuelo en la app `documentos`. |
| `FormularioReciboPagoView` | `APIView` | `POST`: registra un `VisitasServiciosPagos` para una visita (maquinaria agrícola o inseminación artificial), calcula el valor total y guarda las firmas en la visita. El PDF del recibo se genera al vuelo en la app `documentos`. |

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
| `/api/visitas/serviciosPagos/` | `ServiciosPagosViewSet` |
| `/api/visitas/aperos/` | `AperosViewSet` |
| `/api/visitas/pajillas/` | `PajillasViewSet` |
| `/api/visitas/visitasServiciosPagos/` | `VisitasServiciosPagosViewSet` |

### Rutas de acción

| Endpoint | Vista | Método |
|---|---|---|
| `/api/visitas/solicitudes/crear/` | `crear_solicitud` | POST |
| `/api/visitas/solicitudes/<solicitud_id>/atender/` | `atender_solicitud` | POST |
| `/api/visitas/solicitudes/<solicitud_id>/reagendar/` | `reagendar_solicitud` | POST |
| `/api/visitas/solicitudes/<solicitud_id>/rechazar/` | `rechazar_solicitud` | POST |
| `/api/visitas/mis-visitas/` | `mis_visitas` | GET |
| `/api/visitas/infoVisita/<visita_id>/observaciones/` | `info_visita_observaciones` | GET/POST |
| `/api/visitas/formulario-visita/` | `FormularioVisitaTecnicaView` | GET/POST |
| `/api/visitas/formulario-recibo/` | `FormularioReciboPagoView` | POST |

---

## Admin

En `admin.py` se registran todos los modelos. Además:

- `VisitasAdmin` configura `list_display` (solicitud, funcionario, fecha/hora y tipo de visita) e incluye `InsumoVisitaInline` (`TabularInline`) para gestionar los insumos usados directamente desde el registro de la visita.
