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

La configuración del backend se lee de variables de entorno en `SIGEA/.env`
(plantilla: `SIGEA/.env.example`). Para desarrollo local:

```bash
cd SIGEA
copy .env.example .env      # Windows  (cp en macOS / Linux)
```

y en `.env` deja `DJANGO_DEBUG=True`, `DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1`,
`CORS_ALLOWED_ORIGINS=http://localhost:5173` y los datos de tu PostgreSQL (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).

Crea la base (si aún no existe):

```bash
psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE SIGEA_DB;"
```

> Si tu `postgres` tiene otra contraseña u host, ajústalo en `SIGEA/.env` (nunca en `settings.py`).

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

> Las migraciones están versionadas en el repositorio: se generan en local con
> `makemigrations`, se suben, y en el servidor solo se ejecuta `migrate`.

> Requiere `psycopg2-binary` (ya incluido en `requirements.txt`).

## 4. Seeders (datos iniciales) — importante este orden

Los seeders son **idempotentes** (`get_or_create`), así que se pueden volver a correr sin problema. **El orden sí importa**:

```bash
# 0. Crear las tablas (siempre primero)
python manage.py migrate

# 1. Tablas maestras + grupos (+ usuarios de prueba solo con DEBUG=True)
python manage.py seed

# 2. Maestros de UPs (+ datos de prueba de caracterización solo con DEBUG=True)
python manage.py seedup

# 3. Permisos por rol (DEBE ir al final: sobrescribe los permisos básicos del seed)
python manage.py seed_permisos
```

> `seed` y `seedup` aceptan `--demo` / `--sin-demo` para forzar si se crean los datos de prueba.
> En producción (`DJANGO_DEBUG=False`) se omiten por defecto: crea el administrador real con
> `python manage.py createsuperuser`. `seed_visitas` es un seeder local (no está en el repositorio).

> `seed_permisos` asigna los permisos reales por rol (Administradores = todo; Funcionarios/Productores/Usuarios según lo definido). Si lo corriés ANTES de `seed`, el `seed` volvería a escribir los permisos básicos.

## 5. Frontend

```bash
cd SIGEA-FRONT

pnpm install        # o npm install
pnpm dev            # http://localhost:5173
```

- La URL de la API sale de `VITE_API_BASE_URL`: en desarrollo `.env.development` → `http://127.0.0.1:8000/api`; el build de producción usa `/api` (mismo dominio).
- El backend permite CORS solo para los orígenes de `CORS_ALLOWED_ORIGINS` (en desarrollo, `http://localhost:5173`).

## 6. Usuarios de prueba (creados por `seed` solo en desarrollo, `DJANGO_DEBUG=True`)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@example.com` | `admin123` |
| Administrador | `admin@admin.com` | `administrador` |
| Funcionario | `funcionario@example.com` | `admin123` |
| Productor | `productor@example.com` | `admin123` |

`seed_visitas` agrega también `admin.visitas@example.com`, `funcionario.visitas@example.com` y `productor.visitas@example.com` (contraseña `admin123`).

## 7. Notas

- **Login**: usa **email + contraseña**; genera token (Knox) que expira tras `KNOX_TOKEN_TTL_MINUTES` de inactividad. Todas las rutas del backend exigen autenticación, salvo `/api/register/`, `/api/usuarios/login/` y los catálogos del registro.
- **Registro público**: siempre crea el rol `Usuarios`; solo un administrador autenticado puede crear usuarios con otro rol.
- **Archivos subidos**: el backend guarda uploads en `SIGEA/media/` (`MEDIA_ROOT`).
- **Panel de Django admin**: `http://127.0.0.1:8000/admin/`.

## 8. Notas de seguridad para el despliegue (Nginx)

El código ya aplica permisos por rol **y por dueño del dato**, límites de intentos de login
y validación de archivos. En el servidor, Nginx debe completar estas piezas:

```nginx
# Adjuntos de UPs: privados. Django valida el dueño y responde con X-Accel-Redirect.
location /protected/ {
    internal;
    alias /srv/sigea/private_media/;          # = PRIVATE_MEDIA_ROOT
}
location /protected-legacy/ {                # archivos antiguos guardados en media/archivos_up
    internal;
    alias /srv/sigea/SIGEA/media/;
}
location /media/archivos_up/ { deny all; }    # nunca públicos
location /media/ { alias /srv/sigea/SIGEA/media/; }   # QR de las UPs

client_max_body_size 6m;                      # >= MAX_UPLOAD_MB

# La SPA guarda el token en localStorage: una CSP estricta reduce el riesgo de XSS.
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'" always;
```

- En `.env` de producción: `USE_X_ACCEL_REDIRECT=True`, `NUM_PROXIES=1` y `PRIVATE_MEDIA_ROOT`.
- Limitar o proteger `/admin/` (por IP o con `limit_req`), ya que es público por defecto.
- Tras desplegar, ejecutar `python manage.py seed_permisos` para aplicar los permisos por rol actualizados.

