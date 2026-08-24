# SIGEA — Guía de Inicio

Documento corto para arrancar el proyecto en local. La arquitectura son **dos procesos**:

| Servicio | Carpeta | Tecnología | URL |
|---|---|---|---|
| Backend (API REST) | `SIGEA/` | Python · Django · DRF · PostgreSQL | `http://127.0.0.1:8000/api` |
| Frontend (SPA) | `SIGEA-FRONT/` | React · Vite | `http://localhost:5173` |

---

## 1. Prerrequisitos

- **Python 3.11+**
- **PostgreSQL 14+** (servidor corriendo en `127.0.0.1:5432`)
- **Node.js 18+** y **pnpm** (o `npm`)

## 2. Crear la base de datos

El backend está configurado en `SIGEA/SIGEAsite/settings.py` con:

- Base: `SIGEA_DB`
- Usuario: `postgres` / Contraseña: `SIGEA_DB`
- Host: `127.0.0.1` · Puerto: `5432`

Crea la base (si aún no existe):

```bash
psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE SIGEA_DB;"
```

> Si tu `postgres` tiene otra contraseña u host, ajústalo en `settings.py`.

## 3. Backend

```bash
cd SIGEA

python -m venv venv
venv\Scripts\activate            # Windows
# source venv/bin/activate       # macOS / Linux

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver       # http://127.0.0.1:8000
```

> Requiere `psycopg2-binary` (ya incluido en `requirements.txt`).

## 4. Seeders (datos iniciales) — importante este orden

Los seeders son **idempotentes** (`get_or_create`), así que se pueden volver a correr sin problema. **El orden sí importa**:

```bash
# 1. Tablas maestras + usuarios y grupos básicos
python manage.py seed

# 2. Datos de prueba de Unidades Productivas / caracterización
python manage.py seedup

# 3. Datos de prueba de visitas técnicas
python manage.py seed_visitas

# 4. Permisos por rol (DEBE ir al final: sobrescribe los permisos básicos del seed)
python manage.py seed_permisos
```

> `seed_permisos` asigna los permisos reales por rol (Administradores = todo; Funcionarios/Productores/Usuarios según lo definido). Si lo corriés ANTES de `seed`, el `seed` volvería a escribir los permisos básicos.

## 5. Frontend

```bash
cd SIGEA-FRONT

pnpm install        # o npm install
pnpm dev            # http://localhost:5173
```

- El front lee la API desde `src/services/api.js` → `http://127.0.0.1:8000/api`.
- El backend tiene CORS habilitado para `http://localhost:5173`.

## 6. Usuarios de prueba (creados por `seed`)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@example.com` | `admin123` |
| Administrador | `admin@admin.com` | `administrador` |
| Funcionario | `funcionario@example.com` | `admin123` |
| Productor | `productor@example.com` | `admin123` |

`seed_visitas` agrega también `admin.visitas@example.com`, `funcionario.visitas@example.com` y `productor.visitas@example.com` (contraseña `admin123`).

## 7. Notas

- **Login**: usa **email + contraseña**; genera token (Knox). Todas las rutas del backend exigen autenticación, salvo `/api/register/` y `/api/usuarios/login/`.
- **Archivos subidos**: el backend guarda uploads en `SIGEA/media/` (`MEDIA_ROOT`).
- **Panel de Django admin**: `http://127.0.0.1:8000/admin/`.
