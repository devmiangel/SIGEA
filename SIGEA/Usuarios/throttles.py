"""Throttles del login y registro (protección contra fuerza bruta)."""
from rest_framework.throttling import ScopedRateThrottle, SimpleRateThrottle


class LoginIPThrottle(ScopedRateThrottle):
    """Intentos de login por IP (scope 'login')."""

    def get_cache_key(self, request, view):
        # Solo cuenta los intentos (POST), no consultas.
        if request.method != 'POST':
            return None
        return super().get_cache_key(request, view)


class LoginEmailThrottle(SimpleRateThrottle):
    """Intentos de login por email, aunque el atacante rote de IP (scope 'login_email')."""

    scope = 'login_email'

    def get_cache_key(self, request, view):
        if request.method != 'POST':
            return None
        email = str(request.data.get('email') or '').strip().lower()
        if not email:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': email}


class RegisterThrottle(SimpleRateThrottle):
    """Registros por IP (scope 'register')."""

    scope = 'register'

    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}
