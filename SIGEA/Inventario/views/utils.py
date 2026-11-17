from rest_framework.response import Response

from SIGEAsite.permissions import usuario_en_grupo
from Usuarios.models import Administradores, Funcionarios


class ErrorAsignacion(Exception):
    """Regla de negocio incumplida al asignar o devolver un recurso."""

    def __init__(self, mensaje, status=400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status = status

    def respuesta(self):
        return Response({'error': self.mensaje}, status=self.status)


def administrador_de(user):
    """Administrador activo del usuario autenticado, o None."""
    return Administradores.objects.filter(usuario=user, Estado=True).first()


def cantidad_entera(valor):
    """Entero > 0. Rechaza decimales (2.9), booleanos y textos no numericos
    en lugar de truncarlos en silencio."""
    if isinstance(valor, bool) or valor is None:
        raise ErrorAsignacion('La cantidad debe ser un número entero')
    if isinstance(valor, float):
        if valor != int(valor):
            raise ErrorAsignacion('La cantidad debe ser un número entero')
        valor = int(valor)
    try:
        cantidad = int(str(valor).strip())
    except (TypeError, ValueError):
        raise ErrorAsignacion('La cantidad debe ser un número entero')
    if cantidad <= 0:
        raise ErrorAsignacion('La cantidad debe ser mayor a cero')
    return cantidad


def funcionario_activo(funcionario_id):
    """Funcionario activo al que se le puede asignar un recurso."""
    if not funcionario_id:
        raise ErrorAsignacion('Debes seleccionar un funcionario')
    try:
        funcionario = Funcionarios.objects.select_related('usuario').get(pk=funcionario_id)
    except (Funcionarios.DoesNotExist, TypeError, ValueError):
        raise ErrorAsignacion('El funcionario seleccionado no existe')
    if not funcionario.Estado or not funcionario.usuario.is_active:
        raise ErrorAsignacion('El funcionario seleccionado está inactivo')
    return funcionario


class SoloPropiosFuncionarioMixin:
    """Los administradores ven todas las filas; un funcionario solo las suyas.

    ``funcionario_lookup`` es la ruta hasta el usuario del funcionario,
    p. ej. ``'Funcionario__usuario'``.
    """

    funcionario_lookup = 'Funcionario__usuario'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if usuario_en_grupo(user, 'Administradores'):
            return queryset
        return queryset.filter(**{self.funcionario_lookup: user.pk})
