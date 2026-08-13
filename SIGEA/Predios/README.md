# Predios - Documentación

Aplicación encargada del registro y administración de **predios** y sus catálogos de ubicación (veredas, sectores), tenencia, seguros y registros ICA.

Estructura interna de la app:

```
Predios/
├── models.py               # Definición de las tablas (ORM)
├── serializers/            # Serializers de la API
│   ├── ubicacion.py
│   └── predios.py
├── views/                  # ViewSets (CRUD)
│   ├── ubicacion.py
│   └── predios.py
├── urls.py                 # Registro de rutas (DefaultRouter)
├── admin.py                # Registro en el panel de administración
└── migrations/             # Migraciones del ORM
```

---

## Models

Las tablas se generan a partir de `models.py` mediante el ORM de Django.

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `Veredas` | `NombreVereda` (CharField) | Sin FK |
| `Sectores` | `NombreSector` (CharField) | FK `Veredas` (PROTECT) |
| `TiposTenencias` | `TipoTenencia` (CharField) | Sin FK |
| `Seguros` | `NombreSeguro` (CharField, unique) | Sin FK |
| `TiposRegistrosICA` | `CodigoICA` (CharField) | Sin FK |
| `Predios` | `NombrePredio` (CharField); `AreaPredio` (Decimal 10,3); `AccesoCredito`, `UsoSuelo`, `Estado` (BooleanField); `Latitud`, `Longitud` (Decimal 16,14); `Direccion` (CharField) | FK `TiposTenencias` (PROTECT), FK `Seguros` (PROTECT, nullable), FK `Sectores` (PROTECT, nullable) y M2M `TiposRegistrosICA` |

> Nota: `Predios.TiposRegistroICA` es una relación **ManyToMany** (no FK simple), por lo que se materializa en una tabla intermedia `Predios_TiposRegistrosICA`.

---

## Serializers

Todos los serializers son `ModelSerializer` con `fields = '__all__'`, es decir, exponen **todos** los campos del modelo en JSON (las FK/M2M se representan como IDs).

### Serializers Ubicación (`serializers/ubicacion.py`)

| Serializer | Modelo asociado |
|---|---|
| `SectoresSerializer` | `Sectores` |
| `VeredasSerializer` | `Veredas` |
| `TiposTenenciasSerializer` | `TiposTenencias` |
| `SegurosSerializer` | `Seguros` |
| `TiposRegistrosICASerializer` | `TiposRegistrosICA` |

### Serializer Predios (`serializers/predios.py`)

| Serializer | Modelo asociado |
|---|---|
| `PrediosSerializer` | `Predios` |

---

## Views

Todas las vistas son `ModelViewSet`, por lo que exponen automáticamente el CRUD completo: `list`, `retrieve`, `create`, `update`, `partial_update` y `destroy`.

### Vistas Ubicación (`views/ubicacion.py`)

| Vistas | Modelo | Descripción |
|---|---|---|
| `SectoresViewSet` | `Sectores` | CRUD de sectores. |
| `VeredasViewSet` | `Veredas` | CRUD de veredas. |
| `TiposTenenciasViewSet` | `TiposTenencias` | CRUD de tipos de tenencia. |
| `SegurosViewSet` | `Seguros` | CRUD de seguros. Sobrescribe `create`: si ya existe un seguro con el mismo `NombreSeguro`, devuelve el existente en lugar de duplicar. |
| `TiposRegistrosICAViewSet` | `TiposRegistrosICA` | CRUD de registros ICA. |

### Vista Predios (`views/predios.py`)

| Vistas | Modelo | Descripción |
|---|---|---|
| `PrediosViewSet` | `Predios` | CRUD de predios. |

---

## Endpoints (URLs)

Rutas registradas con `DefaultRouter` en `urls.py`, bajo el prefijo `/api/predios/`. Cada endpoint soporta los métodos HTTP del CRUD (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

| Endpoint | Vista |
|---|---|
| `/api/predios/sectores/` | `SectoresViewSet` |
| `/api/predios/veredas/` | `VeredasViewSet` |
| `/api/predios/tiposTenencias/` | `TiposTenenciasViewSet` |
| `/api/predios/seguros/` | `SegurosViewSet` |
| `/api/predios/tiposRegistrosICA/` | `TiposRegistrosICAViewSet` |
| `/api/predios/predios/` | `PrediosViewSet` |

---

## Admin

En `admin.py` se registran todos los modelos de la app. Además:

- `PrediosAdmin` configura `list_display` (nombre, sector, área y tipo de tenencia), `list_filter` (sector, tipo de tenencia y acceso a crédito) y `search_fields` (búsqueda por nombre del predio).
