from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'sectores', SectoresViewSet)
router.register(r'veredas', VeredasViewSet)
router.register(r'tiposTenencias', TiposTenenciasViewSet)
router.register(r'seguros', SegurosViewSet)
router.register(r'tiposRegistrosICA', TiposRegistrosICAViewSet)
router.register(r'predios', PrediosViewSet)


urlpatterns = router.urls