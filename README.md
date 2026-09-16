# SIGEA

**Sistema de Información para la Gestión Empresarial Agropecuaria.**

SIGEA es una aplicación web integral que centraliza el registro, control y seguimiento de la actividad agropecuaria de una entidad: unidades productivas (UPs), predios, inventario (vehículos, herramientas e insumos), visitas técnicas, solicitudes, usuarios y generación de documentos. El sistema se organiza por **roles** (Administradores, Funcionarios y Productores/Usuarios), cada uno con un panel y funcionalidades específicas.

## Descripción general del aplicativo

El aplicativo consta de dos componentes que trabajan en conjunto:

| Componente | Tecnología | Carpetas |
|---|---|---|
| **Backend (API REST)** | Python · Django · Django REST Framework · PostgreSQL · Knox | `SIGEA/` |
| **Frontend (SPA)** | React 19 · Vite · MUI · Tailwind CSS · PrimeReact · FullCalendar | `SIGEA-FRONT/` |

El **backend** expone los servicios REST que gestionan los datos, la autenticación por tokens (Knox) y la generación de documentos PDF. El **frontend** consume estos servicios mediante Axios y organiza la experiencia de cada usuario según su rol.

## Funcionalidad por rol

### Administradores (`/administrador`)
- Panel principal y dashboard.
- Gestión de usuarios: creación, edición y asignación de roles.
- Gestión del inventario: insumos (con solicitudes y asignación), herramientas y vehículos.
- Validación de unidades productivas.
- Consulta de visitas y reportes.
- Agenda / horarios.

### Funcionarios (`/funcionario`)
- Inicio con agenda de visitas.
- Visitas de caracterización y visita técnica con formularios por secciones (datos del productor, UP, predio, secciones agrícola/pecuaria/agroindustrial, insumos, firmas digitales).
- Consulta de recursos (inventario).
- Atención de solicitudes de caracterización.

### Productores y Usuarios (`/usuario`)
- Acceso a la extensión agropecuaria.
- Solicitud de caracterización de su unidad productiva (primer registro).
- Visualización de sus UPs y estado de solicitudes.
- Trámites de protección animal.

## Módulos del backend

| App | Descripción |
|---|---|
| `Usuarios` | Autenticación (login por email), registro, personas y roles (Administradores, Funcionarios, Productores, Usuarios). |
| `Predios` | Registro de predios y catálogos de ubicación. |
| `UPs` | Unidades productivas y su caracterización (agrícola, pecuaria, agroindustrial). |
| `Inventario` | Vehículos, herramientas, insumos, cardex y solicitudes de insumo. |
| `Visitas` | Solicitudes y visitas técnicas, con formularios y estados. |
| `documentos` | Generación de documentos PDF (visita técnica, reportlab). |
| `seeders` | Datos semilla / carga inicial. |

> Documentación técnica detallada de cada app en su respectivo `README` dentro de `SIGEA/`.

## Stack tecnológico

**Backend**
- Python 3.x · Django 6.0.1 · Django REST Framework 3.17.1
- Knox (tokens) · django-cors-headers · PostgreSQL 14+
- reportlab / Pillow (generación de PDF e imágenes)

**Frontend**
- React 19 · Vite 7 · React Router 7
- MUI 7 · Tailwind CSS 4 · PrimeReact 10 · FullCalendar 7
- Axios · react-hook-form · react-signature-canvas · SweetAlert2

## Estructura del repositorio

```
SIGEA_WA/
├── SIGEA/                  # Backend (Django + DRF)
│   ├── SIGEAsite/          # Configuración general (settings, urls)
│   ├── Usuarios/           # App usuarios y autenticación
│   ├── Predios/            # App predios
│   ├── UPs/                # App unidades productivas
│   ├── Inventario/         # App inventario
│   ├── Visitas/            # App visitas y solicitudes
│   ├── documentos/         # App generación de PDFs
│   ├── seeders/            # Datos semilla
│   └── manage.py
├── SIGEA-FRONT/            # Frontend (React + Vite)
│   └── src/
│       ├── pages/          # Vistas por rol (admin, funcionario, usuario)
│       ├── components/     # Componentes reutilizables
│       ├── services/       # Consumo de la API (axios)
│       ├── context/        # Contexto de usuario / autenticación
│       ├── routes/         # Rutas protegidas por rol
│       └── layouts/        # Layouts por rol
└── README.md
```

## Guía rápida de instalación

### Backend (`SIGEA/`)

```bash
cd SIGEA
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Base de datos **PostgreSQL** (configurada en `SIGEAsite/settings.py`): base `SIGEA_DB`, usuario `postgres`.

### Frontend (`SIGEA-FRONT/`)

```bash
cd SIGEA-FRONT
pnpm install       # o npm install
pnpm dev           # http://localhost:5173
```

El frontend consume la API en `http://localhost:5173` (CORS habilitado para el backend en local).

## Autenticación

- Login por **email** y contraseña.
- Sesiones por **token** (Knox).
- Rutas y vistas protegidas por rol tanto en frontend (React Router + `ProtectedRoute`) como en backend (permissions DRF).

## Endpoints principales de la API

| Ruta | Descripción |
|---|---|
| `/api/auth/login/` | Login (email + contraseña) → token |
| `/api/me/` | Usuario autenticado |
| `/api/register/` | Registro de usuario |
| `/api/usuarios/` | Usuarios, personas, roles y catálogos |
| `/api/predios/` | Predios y ubicación |
| `/api/UPs/` | Unidades productivas y caracterización |
| `/api/inventario/` | Insumos, herramientas, vehículos y solicitudes |
| `/api/visitas/` | Visitas y solicitudes |
| `/api/documentos/` | Generación de documentos (PDF) |
| `/admin/` | Panel de administración de Django |