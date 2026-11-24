from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    name = 'Usuarios'

    def ready(self):
        # Registra los chequeos de despliegue de SIGEA (SIGEAsite no es una app).
        from SIGEAsite import checks  # noqa: F401
