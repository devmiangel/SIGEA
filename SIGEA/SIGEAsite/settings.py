import os
from datetime import timedelta
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Variables de entorno: se leen de SIGEA/.env (ver .env.example).
# Las variables ya definidas en el sistema tienen prioridad sobre el archivo.
load_dotenv(BASE_DIR / '.env')


def env_bool(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in ('1', 'true', 'yes', 'on')


def env_list(name, default=''):
    value = os.environ.get(name, default)
    return [item.strip() for item in value.split(',') if item.strip()]


def env_int(name, default):
    value = os.environ.get(name)
    return int(value) if value not in (None, '') else default


# SECURITY WARNING: don't run with debug turned on in production!
# Por defecto es False: solo se activa explícitamente en desarrollo.
DEBUG = env_bool('DJANGO_DEBUG', False)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'django-insecure-solo-desarrollo-no-usar-en-produccion'
    else:
        raise ImproperlyConfigured('DJANGO_SECRET_KEY es obligatoria cuando DJANGO_DEBUG=False.')

ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1' if DEBUG else '')

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'Predios',
    'Inventario',
    'Visitas',
    'Usuarios',
    'UPs',
    'corsheaders',
    'knox',
    'seeders',
    'documentos',
]

DEFAULT_RENDERER_CLASSES = ['rest_framework.renderers.JSONRenderer']
if DEBUG:
    # La API navegable solo en desarrollo.
    DEFAULT_RENDERER_CLASSES.append('rest_framework.renderers.BrowsableAPIRenderer')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'knox.auth.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_RENDERER_CLASSES': tuple(DEFAULT_RENDERER_CLASSES),
    'DEFAULT_PAGINATION_CLASS': 'SIGEAsite.pagination.SigeaPagination',
    'PAGE_SIZE': 50,
    # Límite de peticiones (anti fuerza bruta / abuso). El caché por defecto es en
    # memoria por proceso de Gunicorn: suficiente con pocos workers.
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.environ.get('THROTTLE_ANON', '60/min'),
        'user': os.environ.get('THROTTLE_USER', '600/min'),
        # Login: por IP y, aparte, por email intentado (ver Usuarios/throttles.py)
        'login': os.environ.get('THROTTLE_LOGIN', '5/min'),
        'login_email': os.environ.get('THROTTLE_LOGIN_EMAIL', '10/hour'),
        'register': os.environ.get('THROTTLE_REGISTER', '10/hour'),
    },
    # Detrás de Nginx: toma la IP real del cliente desde X-Forwarded-For.
    'NUM_PROXIES': env_int('NUM_PROXIES', 0 if DEBUG else 1),
}

# Tokens Knox con expiración (se renuevan con cada uso mientras la sesión esté activa).
REST_KNOX = {
    'TOKEN_TTL': timedelta(minutes=env_int('KNOX_TOKEN_TTL_MINUTES', 600)),
    'AUTO_REFRESH': True,
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'SIGEAsite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'SIGEAsite.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'SIGEA_DB'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# CORS: solo los orígenes listados. En producción (front y API en el mismo dominio)
# puede quedar vacío; en desarrollo debe incluir http://localhost:5173.
# Caché compartida. Los límites de intentos (throttling de login, registro y API)
# se cuentan en la caché: con la caché local por defecto, cada worker de gunicorn
# lleva su propia cuenta y el límite real se multiplica por el número de workers.
# En producción define REDIS_URL (docker-compose.yml ya levanta Redis).
REDIS_URL = os.environ.get('REDIS_URL', '').strip()
if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,
            'KEY_PREFIX': 'sigea',
        }
    }
else:
    # Solo para desarrollo y pruebas: memoria del proceso, no compartida.
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'sigea-local',
        }
    }

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS', 'http://localhost:5173' if DEBUG else '')

# Orígenes de confianza para CSRF (necesario para /admin/ detrás de HTTPS).
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS')

AUTH_USER_MODEL = 'Usuarios.Usuario'

AUTHENTICATION_BACKENDS = [
    'Usuarios.auth_backend.EmailAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = os.environ.get('DJANGO_LANGUAGE_CODE', 'es-co')

TIME_ZONE = os.environ.get('DJANGO_TIME_ZONE', 'America/Bogota')

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Archivos privados (adjuntos de UPs): fuera de MEDIA_ROOT, nunca servidos por Nginx
# directamente. Se descargan por la API, que valida el dueño.
PRIVATE_MEDIA_ROOT = Path(os.environ.get('PRIVATE_MEDIA_ROOT', BASE_DIR / 'private_media'))
# En producción, Django delega la entrega a Nginx con X-Accel-Redirect (location internal).
USE_X_ACCEL_REDIRECT = env_bool('USE_X_ACCEL_REDIRECT', False)
# Tamaño máximo por archivo subido (MB). Ajustar también client_max_body_size en Nginx.
MAX_UPLOAD_MB = env_int('MAX_UPLOAD_MB', 5)


# Seguridad en producción: todo el tráfico por HTTPS, de modo que los tokens Knox
# nunca viajan en texto plano. Se asume un proxy (Nginx) que termina TLS y envía
# X-Forwarded-Proto.
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = env_bool('DJANGO_SECURE_SSL_REDIRECT', True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = env_int('DJANGO_SECURE_HSTS_SECONDS', 3600)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool('DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS', False)
    SECURE_HSTS_PRELOAD = False
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'same-origin'
    X_FRAME_OPTIONS = 'DENY'


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {'format': '{asctime} {levelname} {name}: {message}', 'style': '{'},
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'simple'},
    },
    'root': {'handlers': ['console'], 'level': os.environ.get('DJANGO_LOG_LEVEL', 'INFO')},
}
