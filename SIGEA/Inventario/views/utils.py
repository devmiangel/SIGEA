import hashlib

from django.db import connection, transaction
from rest_framework.exceptions import APIException
from rest_framework.response import Response

from SIGEAsite.permissions import usuario_en_grupo
from Usuarios.models import Administradores, Funcionarios
from ..validators import normalizar_placa, normalizar_texto


class Conflicto(APIException):
    """Estado inconsistente o conflicto de concurrencia (HTTP 409)."""

    status_code = 409
    default_detail = 'Conflicto de estado.'
    default_code = 'conflicto'


def bloquear_clave(clave):
    """Serializa operaciones concurrentes sobre la misma clave.

    Usa un advisory lock transaccional de PostgreSQL: no crea indices ni tablas
    y no modifica el esquema. En otros motores (tests con SQLite) es no-op.
    Debe llamarse dentro de transaction.atomic().
    """
    if connection.vendor != 'postgresql':
        return
    lock_id = int.from_bytes(
        hashlib.blake2b(clave.encode('utf-8'), digest_size=8).digest(),
        'big',
        signed=True,
    )
    with connection.cursor() as cursor:
        cursor.execute('SELECT pg_advisory_xact_lock(%s)', [lock_id])


class CatalogoUnicoMixin:
    """Evita duplicados (case-insensitive) en catalogos sin constraints de BD.

    - create: si el valor ya existe, devuelve el registro existente (200).
    - update: si el nuevo valor choca con otro registro, responde 409.
    El advisory lock serializa altas concurrentes de la misma clave.
    """

    campos_unicos = ()
    prefijo_clave = 'catalogo'

    def _valores_unicos(self, datos):
        return [datos.get(campo) for campo in self.campos_unicos]

    @staticmethod
    def _parte_clave(valor):
        if hasattr(valor, 'pk'):
            return str(valor.pk)
        return normalizar_texto(valor).lower()

    def _clave(self, valores):
        partes = [self._parte_clave(valor) for valor in valores]
        return f'{self.prefijo_clave}:' + '|'.join(partes)

    def _filtrar_unicos(self, queryset, valores):
        for campo, valor in zip(self.campos_unicos, valores):
            if hasattr(valor, 'pk'):
                queryset = queryset.filter(**{campo: valor})
            else:
                queryset = queryset.filter(
                    **{f'{campo}__iexact': normalizar_texto(valor)}
                )
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        valores = self._valores_unicos(serializer.validated_data)
        with transaction.atomic():
            bloquear_clave(self._clave(valores))
            existente = self._filtrar_unicos(self.get_queryset(), valores).first()
            if existente is not None:
                return Response(self.get_serializer(existente).data, status=200)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=201, headers=headers)

    def update(self, request, *args, **kwargs):
        parcial = kwargs.pop('partial', False)
        instancia = self.get_object()
        serializer = self.get_serializer(
            instancia, data=request.data, partial=parcial
        )
        serializer.is_valid(raise_exception=True)
        valores = [
            serializer.validated_data.get(campo, getattr(instancia, campo))
            for campo in self.campos_unicos
        ]
        with transaction.atomic():
            bloquear_clave(self._clave(valores))
            duplicado = (
                self._filtrar_unicos(self.get_queryset(), valores)
                .exclude(pk=instancia.pk)
                .exists()
            )
            if duplicado:
                raise Conflicto('Ya existe un registro con ese valor.')
            self.perform_update(serializer)
            return Response(serializer.data)


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
