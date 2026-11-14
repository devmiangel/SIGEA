from rest_framework.permissions import BasePermission, DjangoModelPermissions, IsAuthenticated


class SigeaModelPermissions(DjangoModelPermissions):
    """Permiso de modelo (view/add/change/delete). Se combina con IsAuthenticated
    en el mixin para exigir tanto sesión válida como el permiso del modelo,
    alineado con los roles del seeder seed_permisos."""

    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


class SigeaModelPermissionMixin:
    """Mixin para viewsets: exige autenticación + permiso de modelo."""

    permission_classes = [IsAuthenticated, SigeaModelPermissions]


ROLES_STAFF = ('Administradores', 'Funcionarios')


def usuario_en_grupo(user, *grupos):
    """True si el usuario autenticado es superusuario o pertenece a alguno de los grupos."""
    if not (user and user.is_authenticated):
        return False
    if user.is_superuser:
        return True
    return user.groups.filter(name__in=grupos).exists()


def IsInGroup(*grupos):
    """Fábrica de permiso DRF por rol (grupo). Uso:
    @permission_classes([IsAuthenticated, IsInGroup('Administradores', 'Funcionarios')])"""

    class _IsInGroup(BasePermission):
        message = 'No tiene el rol requerido para esta acción.'

        def has_permission(self, request, view):
            return usuario_en_grupo(request.user, *grupos)

    _IsInGroup.__name__ = f"IsInGroup_{'_'.join(grupos)}"
    return _IsInGroup


def es_staff(user):
    """Administradores y Funcionarios (o superusuario) ven todos los registros."""
    return usuario_en_grupo(user, *ROLES_STAFF)


IsStaff = IsInGroup(*ROLES_STAFF)


class OwnedQuerysetMixin:
    """Restringe las FILAS que ve cada usuario (no solo la tabla).

    - Staff (Administradores/Funcionarios): queryset completo.
    - Resto de roles: solo filas cuyo ``owner_lookup`` apunta al usuario autenticado,
      p. ej. ``owner_lookup = 'UP__Productor__usuario'``.
    - Sin ``owner_lookup``: el recurso es solo para staff (queryset vacío).

    Como ``get_object()`` usa ``get_queryset()``, protege list, retrieve, update y delete
    (un registro ajeno responde 404). Debe ir antes de ``viewsets.ModelViewSet`` en las bases.
    """

    owner_lookup = None

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if es_staff(user):
            return queryset
        if not self.owner_lookup or not (user and user.is_authenticated):
            return queryset.none()
        return queryset.filter(**{self.owner_lookup: user.pk}).distinct()
