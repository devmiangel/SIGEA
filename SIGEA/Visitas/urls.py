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

urlpatterns = router.urls