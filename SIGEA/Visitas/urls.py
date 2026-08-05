from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'motivosSolicitudes', MotivosSolicitudesViewSet)
router.register(r'estados', EstadosViewSet)
router.register(r'solicitudes', SolicitudesViewSet)
router.register(r'tiposVisitas', TiposVisitasViewSet)
router.register(r'visitas', VisitasViewSet)
router.register(r'insumoVisita', InsumoVisitaViewSet)
router.register(r'calificaciones', CalificacionesViewSet)
router.register(r'infoVisita', InfoVisitaViewSet)

urlpatterns = [
    path('solicitudes/crear/', crear_solicitud, name='crear_solicitud'),
    path('solicitudes/<int:solicitud_id>/atender/', atender_solicitud, name='atender_solicitud'),
    path('solicitudes/<int:solicitud_id>/rechazar/', rechazar_solicitud, name='rechazar_solicitud'),
    path('mis-visitas/', mis_visitas, name='mis_visitas'),
    path('formulario-visita/', FormularioVisitaTecnicaView.as_view(), name='llenar_formulario_visita_tecnica'),
] + router.urls