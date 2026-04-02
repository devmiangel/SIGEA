from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from Usuarios.views import me, register
from UPs.views import UPsViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'FormCaracterizacionUPs', UPsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', me, name='me'),
    path('api/', include(router.urls)),
    path('api/register/', register, name='register'),
    path('api/usuarios/', include('Usuarios.urls')),
    path('api/inventario/', include('Inventario.urls')),
    path('api/predios/', include('Predios.urls')),
    path('api/UPs/', include('UPs.urls')),
    path('api/visitas/', include('Visitas.urls'))
]