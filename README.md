# SIGEA

**Sistema de Información para la Gestión Empresarial Agropecuaria.**

SIGEA es una aplicación web integral que centraliza el registro, control y seguimiento de la actividad agropecuaria de una entidad: unidades productivas (UPs), predios, inventario (vehículos, herramientas e insumos), visitas técnicas, solicitudes, usuarios y generación de documentos. El sistema se organiza por **roles** (Administradores, Funcionarios y Productores/Usuarios), cada uno con un panel y funcionalidades específicas.

## Descripción general del aplicativo

El aplicativo consta de dos componentes que trabajan en conjunto:

| Componente | Tecnología | Carpetas |
|---|---|---|
| **Backend (API REST)** | Python · Django · Django REST Framework · PostgreSQL · Knox | `SIGEA/` |
| **Frontend (SPA)** | React 19 · Vite · MUI · Tailwind CSS · FullCalendar | `SIGEA-FRONT/` |

El **backend** expone los servicios REST que gestionan los datos, la autenticación por tokens (Knox) y la generación de documentos PDF. El **frontend** consume estos servicios mediante Axios y organiza la experiencia de cada usuario según su rol.

## Funcionalidad por rol

### Administradores (`/administrador`)
- Panel principal y dashboard.
- Gestión de usuarios: creación, edición, asignación de roles y rol de conductor.
- Gestión del inventario: insumos (con solicitudes y asignación), herramientas y vehículos.
- Validación de unidades productivas.
- Gestión de solicitudes de visita (atender, reagendar o rechazar) y consulta de visitas.
- Gestión de eventos asociados a las UPs.
- Agenda / horarios.

### Funcionarios (`/funcionario`)
- Inicio con agenda de visitas.
- Visitas de caracterización, visita técnica y **recibo de pago de servicios agropecuarios** (maquinaria e inseminación), con formularios por secciones (datos del productor, UP, predio, secciones agrícola/pecuaria/agroindustrial, insumos, firmas digitales).
- Consulta de recursos (inventario) y solicitud de insumos al administrador.

### Productores y Usuarios (`/usuario`)
- Acceso a la extensión agropecuaria.
- Solicitud de caracterización/visita de su unidad productiva (primer registro).
- Visualización de sus UPs y estado de solicitudes.
- Trámites de protección animal (la ruta existe, pero está oculta en el menú).

## Módulos del backend

| App | Descripción |
|---|---|
| `Usuarios` | Autenticación (login por email), registro, personas y roles (Administradores, Funcionarios, Productores, Usuarios). |
| `Predios` | Registro de predios y catálogos de ubicación. |
| `UPs` | Unidades productivas y su caracterización (agrícola, pecuaria, agroindustrial). |
| `Inventario` | Vehículos, herramientas, insumos, cardex y solicitudes de insumo. |
| `Visitas` | Solicitudes y visitas técnicas, formulario de visita y recibo de pago, con estados. |
| `documentos` | Generación de documentos PDF al vuelo: visita técnica, caracterización y recibo de pago (reportlab). |
| `seeders` | Datos semilla / carga inicial y seeder de permisos por rol (`seed_permisos`). |

> Documentación técnica detallada de cada app en su respectivo `README` dentro de `SIGEA/`.

## Stack tecnológico

**Backend**
- Python 3.11+ (la imagen Docker usa 3.13) · Django 6.0.1 · Django REST Framework 3.17.1
- Knox (tokens) · django-cors-headers · PostgreSQL 14+ (Docker usa 16)
- reportlab / Pillow / qrcode (generación de PDF, imágenes y QR) · gunicorn en producción

**Frontend**
- React 19 · Vite 7 · React Router 7
- MUI 7 (iconos) · Tailwind CSS 4 · FullCalendar 7
- Axios · react-hook-form · react-select · react-signature-canvas · SweetAlert2 · @yudiel/react-qr-scanner
- Cypress (pruebas e2e)

## Estructura del repositorio

```
SIGEA_WA/
├── SIGEA/                  # Backend (Django + DRF)
│   ├── SIGEAsite/          # Configuración general (settings, urls, permissions)
│   ├── Usuarios/           # App usuarios y autenticación
│   ├── Predios/            # App predios
│   ├── UPs/                # App unidades productivas
│   ├── Inventario/         # App inventario
│   ├── Visitas/            # App visitas y solicitudes
│   ├── documentos/         # App generación de PDFs
│   ├── seeders/            # Datos semilla
│   ├── docker/             # entrypoint.sh del contenedor
│   ├── Dockerfile
│   └── manage.py
├── SIGEA-FRONT/            # Frontend (React + Vite)
│   ├── cypress/            # Pruebas e2e
│   ├── nginx.conf          # Nginx del contenedor (SPA + proxy /api)
│   ├── Dockerfile
│   └── src/
│       ├── pages/          # Vistas por rol (admin, funcionario, usuario) y páginas públicas
│       ├── components/     # Componentes reutilizables
│       ├── hooks/          # Carga de datos y formularios por dominio
│       ├── services/       # Consumo de la API (axios)
│       ├── context/        # Contexto de usuario / autenticación
│       ├── routes/         # Rutas protegidas por rol
│       ├── layouts/        # Layouts por rol
│       ├── styles/         # CSS global y cardTokens.js
│       └── utils/          # Constantes y helpers
├── docker-compose.yml      # db + backend + frontend
└── README.md
```

## Guía rápida de instalación

### Backend (`SIGEA/`)

```bash
cd SIGEA
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # y ajustar DJANGO_DEBUG=True y los datos de PostgreSQL
python manage.py migrate
python manage.py seed
python manage.py seedup
python manage.py seed_permisos  # siempre al final
python manage.py runserver
```

Base de datos **PostgreSQL**: la conexión se lee de `SIGEA/.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`; por defecto base `SIGEA_DB`, usuario `postgres`). Detalle paso a paso en `README_Inicio.md`.

### Frontend (`SIGEA-FRONT/`)

```bash
cd SIGEA-FRONT
npm install       # usa package-lock.json
npm run dev       # http://localhost:5173
```

El frontend corre en `http://localhost:5173` y consume la API en `http://127.0.0.1:8000/api` (variable `VITE_API_BASE_URL` de `.env.development`). En local el backend permite CORS para `http://localhost:5173`.

### Docker (producción)

```bash
cp .env.example .env           # en la raíz; definir DJANGO_SECRET_KEY y DB_PASSWORD
docker compose up -d --build
```

Levanta PostgreSQL 16, el backend (gunicorn) y el frontend (Nginx sirve la SPA y hace proxy de `/api` y `/admin`) en `127.0.0.1:${HTTP_PORT:-8080}`. Las migraciones y `collectstatic` se ejecutan al arrancar el contenedor del backend.

## Autenticación y permisos

- Login por **email** y contraseña.
- Sesiones por **token** (Knox).
- Rutas y vistas protegidas por rol tanto en frontend (React Router + `ProtectedRoute`) como en backend (permissions DRF).
- Los ViewSets del backend usan `SigeaModelPermissionMixin` (`SIGEAsite/permissions.py`), que exige autenticación **y** el permiso de modelo (`view`/`add`/`change`/`delete`) correspondiente al rol. Los permisos por rol se cargan con `python manage.py seed_permisos`.

## Endpoints principales de la API

| Ruta | Descripción |
|---|---|
| `/api/usuarios/login/` | Login (email + contraseña) → token Knox |
| `/api/auth/logout/` | Cierra la sesión (invalida el token; `logoutall/` cierra todas) |
| `/api/me/` | Usuario autenticado |
| `/api/register/` | Registro de usuario |
| `/api/usuarios/` | Usuarios, personas, roles y catálogos |
| `/api/predios/` | Predios y ubicación |
| `/api/UPs/` | Unidades productivas y caracterización |
| `/api/inventario/` | Insumos, herramientas, vehículos, solicitudes de insumo y asignaciones |
| `/api/visitas/` | Visitas, solicitudes, formulario de visita y recibo de pago |
| `/api/documentos/` | Generación de documentos PDF (visita, caracterización, recibo) |
| `/admin/` | Panel de administración de Django |