from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from Usuarios.views import me, register


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/me/', me, name='me'),
    path('api/register/', register, name='register'),
    path('api/usuarios/', include('Usuarios.urls')),
    path('api/inventario/', include('Inventario.urls')),
    path('api/predios/', include('Predios.urls')),
    path('api/UPs/', include('UPs.urls')),
    path('api/visitas/', include('Visitas.urls')),
    path('api/documentos/', include('documentos.urls')),
    path(r'api/auth/', include('knox.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

