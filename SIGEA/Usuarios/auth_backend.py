from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend

User = get_user_model()


class EmailAuthBackend(BaseBackend):
    """Login por email + contraseña.

    - Rechaza usuarios inactivos (is_active=False), igual que ModelBackend.
    - Ejecuta el hasher aunque el email no exista, para que el tiempo de respuesta
      no revele qué correos están registrados.
    """

    def authenticate(self, request, email=None, password=None, username=None, **kwargs):
        email = (email or username or '').strip()
        if not email or password is None:
            return None
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Igualar el costo de tiempo con el caso "usuario existe".
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            user = User.objects.filter(email__iexact=email).order_by('id').first()

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def user_can_authenticate(self, user):
        return getattr(user, 'is_active', True)

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None
