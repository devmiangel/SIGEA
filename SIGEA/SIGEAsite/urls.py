from django.contrib import admin
from django.urls import path, include
from Usuarios.views import me, register
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/me/', me, name='me'),
    path('api/register/', register, name='register'),
    path('api/usuarios/', include('Usuarios.urls')),
<<<<<<< HEAD
    path(r'api/auth/', include('knox.urls'))
]
=======
    path('api/inventario/', include('Inventario.urls')),
    path('api/predios/', include('Predios.urls')),
    path('api/UPs/', include('UPs.urls')),
    path('api/visitas/', include('Visitas.urls')),
    path(r'api/auth/', include('knox.urls'))
]
>>>>>>> origin/Backend
