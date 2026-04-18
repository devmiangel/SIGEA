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
    path('api/me/', me, name='me'),
    path('api/', include(router.urls)),
    path('api/register/', register, name='register'),
    path('api/usuarios/', include('Usuarios.urls')),
    path(r'api/auth/', include('knox.urls'))
]
