# UPs - Documentación

Aplicación encargada de las **Unidades Productivas (UP)**. Incluye los catálogos, el registro de la UP con su código RUEA, la información de caracterización (personal, predio, producción agrícola, agroindustrial, animal e información adicional) y el flujo de validación.

Estructura interna de la app:

```
UPs/
├── models.py               # Definición de las tablas (ORM)
├── serializers/            # Serializers de la API
│   ├── catalogs.py         # Serializers de catálogos
│   ├── up.py               # Serializer de la UP
│   ├── mixins.py           # Utilidades compartidas
│   ├── info_personal.py    # Caracterización: datos personales
│   ├── info_predio.py      # Caracterización: datos del predio
│   ├── info_up.py          # Caracterización: datos de la UP
│   ├── info_agricola.py    # Caracterización: producción agrícola
│   ├── info_agroindustrial.py # Caracterización: producción agroindustrial
│   ├── info_animales.py    # Caracterización: producción animal
│   └── info_adicional.py   # Caracterización: archivos / adicional
├── views/                  # ViewSets y vistas (CRUD)
│   ├── catalogs.py
│   ├── ups.py
│   └── caracterizacion.py
├── urls.py                 # Registro de rutas (DefaultRouter + paths)
├── admin.py                # Registro en el panel de administración
└── migrations/             # Migraciones del ORM
```

---

## Models

Las tablas se generan a partir de `models.py` mediante el ORM de Django. Se organizan en: catálogos, UP principal, producción y detalle animal.

### Catálogos

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `TipoUP` | `TipoUP` (CharField) | Sin FK |
| `EstadosUP` | `Estado` (CharField) | Sin FK. Usado internamente en el flujo de validación (no expuesto en la API) |
| `ActividadUP` | `Actividad` (CharField) | Sin FK |
| `Unidades` | `Unidad` (CharField) | Sin FK |
| `ProductosUPs` | `Producto` (CharField) | FK `Unidades` (PROTECT, nullable) |
| `GrupoAnimal` | `GrupoAnimal` (CharField) | Sin FK |
| `TiposAves` | `TipoAve` (CharField) | Sin FK |
| `Propositos` | `Proposito` (CharField) | Sin FK |
| `ProductosApicolas` | `ProductoApicolas` (CharField) | Sin FK |

### UP principal

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `UP` | `RUEA` (CharField 20, unique); `FechaCaracterizacion`, `FechaActualizacion` (DateField) | FK `Productores` (CASCADE) — app Usuarios; FK `Predios` (CASCADE) — app Predios; FK `TipoUP` (PROTECT); FK `Funcionarios` (PROTECT) — app Usuarios; FK `idEstado` → `EstadosUP` (PROTECT, nullable). Genera el RUEA automáticamente (`RUDEA-0000001`) al crearse |
| `ArchivosUP` | `RutaArchivo`, `NombreArchivo`, `Descripcion` (CharField) | FK `UP` (CASCADE) |
| `DetalleUP` | `NumeroEmpleados`, `NumeroPotreros`, `NumeroInvernaderos`, `NumeroTanques`, `NumeroReservorios` (IntegerField, nullable); `Asociatividad`, `FuentesAgua` (BooleanField); `AreaCultivada`, `AreaPastos` (Decimal 10,2); `FechaActualizacion` (DateField) | FK `UP` (CASCADE); FK `ActividadUP` (PROTECT, nullable) |

### Producción

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `ProduccionUPAgricola` | `Cantidad` (IntegerField) | FK `UP` (CASCADE); FK `ProductosUPs` (PROTECT) |
| `ProduccionUPAgroindustrial` | `Cantidad` (IntegerField); `INVIMA` (BooleanField) | FK `UP` (CASCADE); FK `ProductosUPs` (PROTECT) |
| `Animales` | `Cantidad` (IntegerField) | FK `GrupoAnimal` (PROTECT); FK `UP` (CASCADE) |
| `Razas` | `Raza` (CharField) | FK `Animales` (CASCADE) |

### Detalle animal (por especie)

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `DetalleBovinos` | `NumeroMachos`, `NumeroHembras` (IntegerField); `RUV` (CharField) | FK `Razas` (PROTECT, nullable); FK `Propositos` (PROTECT, nullable) |
| `DetalleAves` | `Cantidad` (IntegerField) | FK `Razas` (PROTECT, nullable); FK `TiposAves` (PROTECT, nullable) |
| `DetallePorcinos` | `Chapeta` (BooleanField) | FK `Razas` (PROTECT, nullable); FK `Propositos` (PROTECT, nullable) |
| `DetalleEquinos` | Sin campos propios | FK `Razas` (PROTECT, nullable); FK `Propositos` (PROTECT, nullable) |
| `DetalleCaprinos` | Sin campos propios | FK `Razas` (PROTECT, nullable); FK `Propositos` (PROTECT, nullable) |
| `DetalleOvinos` | Sin campos propios | FK `Razas` (PROTECT, nullable); FK `Propositos` (PROTECT, nullable) |
| `DetalleConejos` | Sin campos propios | FK `Razas` (PROTECT, nullable); FK `Propositos` (PROTECT, nullable) |
| `DetalleCuries` | Sin campos propios | FK `Razas` (PROTECT, nullable); FK `Propositos` (PROTECT, nullable) |
| `DetallePeces` | `NumeroEstanques` (IntegerField) | FK `Razas` (PROTECT, nullable) |
| `DetalleApicolas` | Sin campos propios | FK `Razas` (PROTECT, nullable); FK `ProductosApicolas` (PROTECT, nullable) |

> **Aplicaciones externas involucradas en las FK:**
> - `Usuarios.Productores` y `Usuarios.Funcionarios` → apps de usuarios.
> - `Predios.Predios` → app Predios.

---

## Serializers

### Catálogos (`serializers/catalogs.py`)

24 serializers `ModelSerializer` (`fields = '__all__'`), uno por cada tabla de catálogo/producción/detalle:

`TipoUPSerializer`, `ActividadUPSerializer`, `UnidadesSerializer`, `ArchivosUPSerializer`, `DetalleUPSerializer`, `ProductosUPsSerializer`, `ProduccionUPAgricolaSerializer`, `ProduccionUPAgroindustrialSerializer`, `GrupoAnimalSerializer`, `TiposAvesSerializer`, `PropositosSerializer`, `AnimalesSerializer`, `RazasSerializer`, `ProductosApicolasSerializer`, `DetalleBovinosSerializer`, `DetalleAvesSerializer`, `DetallePorcinosSerializer`, `DetalleEquinosSerializer`, `DetalleCaprinosSerializer`, `DetalleOvinosSerializer`, `DetalleConejosSerializer`, `DetalleCuriesSerializer`, `DetallePecesSerializer`, `DetalleApicolasSerializer`.

### UP (`serializers/up.py`)

| Serializer | Modelo | Descripción |
|---|---|---|
| `UPSerializer` | `UP` | ModelSerializer con campos adicionales de solo lectura: `estado_label`, `tipo_up_label`, `nombre_predio` y `productor_nombre` (nombre completo del productor). |

### Utilidades (`serializers/mixins.py`)

| Función/Clase | Descripción |
|---|---|
| `_normalizar_vacios(value)` | Convierte recursivamente las cadenas vacías `''` en `None` (el formulario de caracterización envía `''` en campos numéricos opcionales). |
| `PermitirVaciosMixin` | Mixin para serializers; normaliza los vacíos antes de la validación de DRF. |
| `get_o_crear(model, defaults, **kwargs)` | Variante tolerante de `get_or_create`: recupera el primer registro o lo crea, evitando el error `MultipleObjectsReturned` por duplicados. |

### Caracterización (serializers por sección)

Todos los serializers de caracterización sobrescriben `update` para persistir los datos de su sección (creando catálogos si no existen) y `to_representation` para devolver los valores legibles. Usan `PermitirVaciosMixin`.

| Serializer | Sección | Descripción |
|---|---|---|
| `InfoPersonalCaracterizacionSerializer` | Datos personales | Datos del productor (nombres, documento, celular, correo, fecha nacimiento, edad calculada, nivel educativo, sisben). Actualiza `Personas`, `Empresas`, `Contactos`, nivel educativo y sisben. |
| `InfoPredioCaracterizacionSerializer` | Predio | Datos del predio (nombre, área, registros ICA, seguro, tenencia, vereda, sector, coordenadas). Crea/actualiza los catálogos de Predios. |
| `InfoUPCaracterizacionSerializer` | UP | Tipo de UP, actividad, RUEA y detallado de la UP (empleados, asociatividad, áreas, potreros, etc.) sobre `DetalleUP`. |
| `InfoProduccionAgricolaSerializer` | Producción agrícola | Lista de productos agrícolas (producto, cantidad, unidad). Reemplaza los registros existentes. |
| `InfoProduccionAgroindustrialSerializer` | Producción agroindustrial | Lista de productos agroindustriales (producto, cantidad, unidad, INVIMA). Reemplaza los registros existentes. |
| `InfoProduccionAnimalSerializer` | Producción animal | Grupos de animales con cantidad total y detalle por especie (bovinos, aves, porcinos, equinos, caprinos, ovinos, conejos, curies, peces, abejas). Reemplaza los registros existentes. |
| `InfoAdicionalCaracterizacionSerializer` | Adicional | Actualiza `FechaActualizacion` y la lista de archivos (`ArchivosUP`). Reemplaza los archivos existentes. |

---

## Views

### Catálogos (`views/catalogs.py`)

24 `ModelViewSet` con CRUD completo (`list`, `retrieve`, `create`, `update`, `partial_update`, `destroy`):

`TipoUPViewSet`, `ActividadUPViewSet`, `UnidadesViewSet`, `ArchivosUPViewSet`, `DetalleUPViewSet`, `ProductosUPsViewSet`, `ProduccionUPAgricolaViewSet`, `ProduccionUPAgroindustrialViewSet`, `GrupoAnimalViewSet`, `TiposAvesViewSet`, `PropositosViewSet`, `AnimalesViewSet`, `RazasViewSet`, `ProductosApicolasViewSet`, `DetalleBovinosViewSet`, `DetalleAvesViewSet`, `DetallePorcinosViewSet`, `DetalleEquinosViewSet`, `DetalleCaprinosViewSet`, `DetalleOvinosViewSet`, `DetalleConejosViewSet`, `DetalleCuriesViewSet`, `DetallePecesViewSet`, `DetalleApicolasViewSet`.

### UP (`views/ups.py`)

| Vistas | Tipo | Descripción |
|---|---|---|
| `UPViewSet` | `ModelViewSet` | CRUD de unidades productivas. |
| `validar_ups` | `@api_view(['POST'])` | Acepta o rechaza una UP (`aprobada`), asignando el estado `Aceptada`/`Rechazada` en `EstadosUP`. Requiere autenticación. |
| `mis_ups` | `@api_view(['GET'])` | Devuelve las UP del productor autenticado. Requiere autenticación. |
| `upload_archivo_up` | `@api_view(['POST'])` | Sube un archivo (imágenes o PDF) a `media/archivos_up/`, validando la extensión. Devuelve la ruta pública. Requiere autenticación. |

### Caracterización (`views/caracterizacion.py`)

Vistas por sección del formulario. Todas aceptan `GET` y `POST`, reciben `userId` (más opcionalmente `solicitud_id` o `up_id`) y usan un handler común que:
1. Resuelve el productor y su UP (por `up_id` o por la UP vinculada a la solicitud de visita).
2. Si no existe UP, crea un borrador y lo vincula a la solicitud (caracterización de visita nueva).
3. Si llega vacío, devuelve el estado actual o un borrador con campos en `null`.

| Vista | Descripción |
|---|---|
| `info_personal_caracterizacion` | Sección de datos personales del productor. |
| `info_predio_caracterizacion` | Sección de datos del predio. |
| `info_up_caracterizacion` | Sección de datos de la UP. |
| `info_produccion_agricola` | Sección de producción agrícola. |
| `info_produccion_animal` | Sección de producción animal. |
| `info_produccion_agroindustrial` | Sección de producción agroindustrial. |
| `info_adicional_caracterizacion` | Sección de archivos/información adicional. |

---

## Endpoints (URLs)

Rutas registradas en `urls.py`, bajo el prefijo `/api/UPs/`.

### Router (CRUD)

| Endpoint | Vista |
|---|---|
| `/api/UPs/tiposUP/` | `TipoUPViewSet` |
| `/api/UPs/actividadesUP/` | `ActividadUPViewSet` |
| `/api/UPs/unidades/` | `UnidadesViewSet` |
| `/api/UPs/archivosUP/` | `ArchivosUPViewSet` |
| `/api/UPs/detalleUP/` | `DetalleUPViewSet` |
| `/api/UPs/productosUPs/` | `ProductosUPsViewSet` |
| `/api/UPs/produccionAgricola/` | `ProduccionUPAgricolaViewSet` |
| `/api/UPs/produccionAgroindustrial/` | `ProduccionUPAgroindustrialViewSet` |
| `/api/UPs/gruposAnimales/` | `GrupoAnimalViewSet` |
| `/api/UPs/tiposAves/` | `TiposAvesViewSet` |
| `/api/UPs/propositos/` | `PropositosViewSet` |
| `/api/UPs/animales/` | `AnimalesViewSet` |
| `/api/UPs/razas/` | `RazasViewSet` |
| `/api/UPs/productosApicolas/` | `ProductosApicolasViewSet` |
| `/api/UPs/detalleBovinos/` | `DetalleBovinosViewSet` |
| `/api/UPs/detalleAves/` | `DetalleAvesViewSet` |
| `/api/UPs/detallePorcinos/` | `DetallePorcinosViewSet` |
| `/api/UPs/detalleEquinos/` | `DetalleEquinosViewSet` |
| `/api/UPs/detalleCaprinos/` | `DetalleCaprinosViewSet` |
| `/api/UPs/detalleOvinos/` | `DetalleOvinosViewSet` |
| `/api/UPs/detalleConejos/` | `DetalleConejosViewSet` |
| `/api/UPs/detalleCuries/` | `DetalleCuriesViewSet` |
| `/api/UPs/detallePeces/` | `DetallePecesViewSet` |
| `/api/UPs/detalleApicolas/` | `DetalleApicolasViewSet` |
| `/api/UPs/UPs/` | `UPViewSet` |

### Rutas de acción

| Endpoint | Vista | Método |
|---|---|---|
| `/api/UPs/mis-ups/` | `mis_ups` | GET |
| `/api/UPs/validar-ups/<upId>/` | `validar_ups` | POST |
| `/api/UPs/upload-archivo-up/` | `upload_archivo_up` | POST |
| `/api/UPs/info_personal_caracterizacion/<userId>/` | `info_personal_caracterizacion` | GET/POST |
| `/api/UPs/info_predio_caracterizacion/<userId>/` | `info_predio_caracterizacion` | GET/POST |
| `/api/UPs/info_up_caracterizacion/<userId>/` | `info_up_caracterizacion` | GET/POST |
| `/api/UPs/info_produccion_agricola/<userId>/` | `info_produccion_agricola` | GET/POST |
| `/api/UPs/info_produccion_animal/<userId>/` | `info_produccion_animal` | GET/POST |
| `/api/UPs/info_produccion_agroindustrial/<userId>/` | `info_produccion_agroindustrial` | GET/POST |
| `/api/UPs/info_adicional_caracterizacion/<userId>/` | `info_adicional_caracterizacion` | GET/POST |

---

## Admin

En `admin.py` se registran los modelos principales. Además:

- `UPAdmin` configura `list_display` (id, productor, predio, tipo y fecha de caracterización), `list_filter` (tipo de UP y fecha) e incluye `DetalleUPInline` (`StackedInline`) para gestionar el detallado de la UP desde el registro principal.
