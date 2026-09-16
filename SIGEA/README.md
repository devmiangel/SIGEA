# SIGEA - Backend

SIGEA es un sistema de información que centraliza el registro, control y seguimiento de las unidades productivas, predios, inventario, visitas, usuarios y documentos de la entidad. Este repositorio corresponde al **backend**, construido sobre **Django** + **Django REST Framework**, y expone una API REST consumida por el frontend (`SIGEA-FRONT`).

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| Python | 3.x |
| Django | 6.0.1 |
| Django REST Framework | 3.17.1 |
| Knox (autenticación por tokens) | 5.0.4 |
| django-cors-headers | 4.9.0 |
| PostgreSQL | - |
| reportlab / Pillow | - |

Dependencias completas en `requirements.txt`.

## Descripción general

El proyecto está dividido en **aplicaciones** (`apps`) de Django, cada una encargada de un módulo de negocio. Todas siguen el mismo patrón:

- `models.py`: definición de tablas a través del ORM de Django.
- `serializers/`: conversión de los modelos a JSON (Django REST Framework).
- `views/`: `ViewSets` que exponen las operaciones CRUD sobre cada modelo.
- `urls.py`: registro de rutas de la API mediante `DefaultRouter`.
- `migrations/`: migraciones generadas por el ORM.
- `admin.py`: registro de los modelos en el panel de administración de Django.

Las aplicaciones pueden depender unas de otras a través de claves foráneas (FK), por lo que se recomienda revisar la documentación de cada una para entender las relaciones entre tablas.

## Permisos por rol

Los ViewSets usan `SigeaModelPermissionMixin` (`SIGEAsite/permissions.py`), que combina `IsAuthenticated` con `SigeaModelPermissions` (extiende `DjangoModelPermissions`) para exigir el permiso de modelo (`view`/`add`/`change`/`delete`) según el método HTTP.

Los permisos se asignan a los grupos `Administradores` (todos), `Funcionarios`, `Productores` y `Usuarios` mediante el comando:

```bash
python manage.py seed_permisos
```

## Aplicaciones del proyecto

| App | Descripción | Documentación |
|---|---|---|
| `Inventario` | Gestión del inventario: vehículos, herramientas e insumos. | [README Inventario](Inventario/README.md) |
| `Usuarios` | Autenticación y roles: administradores, funcionarios y productores. | [README Usuarios](Usuarios/README.md) |
| `Predios` | Registro de predios y catálogos de ubicación. | [README Predios](Predios/README.md) |
| `UPs` | Unidades productivas y su caracterización (agrícola, pecuario, etc.). | [README UPs](UPs/README.md) |
| `Visitas` | Solicitudes y visitas técnicas, formulario de visita, recibo de pago y servicios agropecuarios. | [README Visitas](Visitas/README.md) |
| `documentos` | Generación de documentos al vuelo: PDF de visita técnica, caracterización y recibo de pago (reportlab). | [README documentos](documentos/README.md) |
| `seeders` | Datos semilla / carga inicial y seeder de permisos por rol (`seed_permisos`). | Pendiente |

## Estructura del proyecto

```
SIGEA/
├── manage.py              # Utilidad de administración de Django
├── requirements.txt       # Dependencias del proyecto
├── SIGEAsite/             # Configuración general (settings, urls, permissions)
├── Inventario/            # App de inventario
├── Usuarios/              # App de usuarios y autenticación
├── Predios/               # App de predios
├── UPs/                   # App de unidades productivas
├── Visitas/               # App de visitas
├── documentos/            # App de documentos
├── seeders/               # Datos semilla
└── media/                 # Archivos subidos / media del sistema
```

## Configuración y arranque

### Base de datos

El proyecto usa **PostgreSQL**. Configuración en `SIGEAsite/settings.py`:

| Parámetro | Valor |
|---|---|
| ENGINE | `django.db.backends.postgresql` |
| NAME | `SIGEA_DB` |
| USER | `postgres` |
| PASSWORD | `SIGEA_DB` |
| HOST | `127.0.0.1` |
| PORT | `5432` |

### Entorno virtual e instalación

```bash
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

### Migraciones y servidor de desarrollo

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed          # datos maestros y usuarios de prueba
python manage.py seed_permisos # permisos por rol (grupos)
python manage.py runserver
```

## Autenticación y CORS

- La autenticación de la API se maneja con **Knox** (tokens) (`knox.auth.TokenAuthentication`), con endpoint de login en `/api/auth/`.
- CORS habilitado para el frontend en `http://localhost:5173`.

## Rutas principales de la API

| Ruta | Recurso |
|---|---|
| `/api/me/` | Usuario autenticado |
| `/api/register/` | Registro de usuarios |
| `/api/usuarios/` | Endpoints de la app Usuarios |
| `/api/inventario/` | Endpoints de la app Inventario (incluye solicitudes de insumo y asignaciones) |
| `/api/predios/` | Endpoints de la app Predios |
| `/api/UPs/` | Endpoints de la app UPs (incluye eventos y caracterización) |
| `/api/visitas/` | Endpoints de la app Visitas (solicitudes, formulario de visita y recibo de pago) |
| `/api/documentos/` | Endpoints de la app documentos (generación de PDFs: visita, caracterización y recibo) |
| `/api/auth/` | Login / tokens (Knox) |
| `/admin/` | Panel de administración de Django |

> Para el detalle de modelos, serializers, vistas y endpoints de cada app, consulta el README enlazado en la tabla de aplicaciones.
