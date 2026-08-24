from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated


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
