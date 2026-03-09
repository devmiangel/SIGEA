from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from Usuarios.views import *

router = DefaultRouter()

router.register(r'personas', PersonasViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'empresas', EmpresasViewSet)
router.register(r'funcionarios', FuncionariosViewSet)
router.register(r'administradores', AdministradoresViewSet)
router.register(r'productores', ProductoresViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]