from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from Usuarios.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()

router.register(r'personas', PersonasViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'empresas', EmpresasViewSet)
router.register(r'funcionarios', FuncionariosViewSet)
router.register(r'administradores', AdministradoresViewSet)
router.register(r'productores', ProductoresViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', me, name='me'),
    path('api/', include(router.urls)),
]