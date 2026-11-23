"""Chequeos de despliegue propios de SIGEA (``python manage.py check --deploy``)."""
from django.conf import settings
from django.core.checks import Warning, register


@register(deploy=True)
def cache_compartida(app_configs, **kwargs):
    """Avisa si producción usa una caché por proceso (los límites de intentos no se comparten)."""
    backend = settings.CACHES.get('default', {}).get('BACKEND', '')
    if backend.endswith(('locmem.LocMemCache', 'dummy.DummyCache')):
        return [
            Warning(
                'La caché es local a cada proceso: los límites de intentos de login, '
                'registro y API se cuentan por separado en cada worker de gunicorn.',
                hint='Define REDIS_URL (por ejemplo redis://redis:6379/0).',
                id='sigea.W001',
            )
        ]
    return []
