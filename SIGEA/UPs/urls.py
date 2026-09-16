from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path

router = DefaultRouter()
router.register(r'tiposUP', TipoUPViewSet)
router.register(r'actividadesUP', ActividadUPViewSet)
router.register(r'unidades', UnidadesViewSet)
router.register(r'archivosUP', ArchivosUPViewSet)
router.register(r'detalleUP', DetalleUPViewSet)
router.register(r'productosUPs', ProductosUPsViewSet)
router.register(r'produccionAgricola', ProduccionUPAgricolaViewSet)
router.register(r'produccionAgroindustrial', ProduccionUPAgroindustrialViewSet)
router.register(r'gruposAnimales', GrupoAnimalViewSet)
router.register(r'tiposAves', TiposAvesViewSet)
router.register(r'propositos', PropositosViewSet)
router.register(r'animales', AnimalesViewSet)
router.register(r'animalesUps', AnimalesUpsViewSet)
router.register(r'razas', RazasViewSet)
router.register(r'productosApicolas', ProductosApicolasViewSet)
router.register(r'detalleBovinos', DetalleBovinosViewSet)
router.register(r'detalleAves', DetalleAvesViewSet)
router.register(r'detallePorcinos', DetallePorcinosViewSet)
router.register(r'detalleEquinos', DetalleEquinosViewSet)
router.register(r'detalleCaprinos', DetalleCaprinosViewSet)
router.register(r'detalleOvinos', DetalleOvinosViewSet)
router.register(r'detalleConejos', DetalleConejosViewSet)
router.register(r'detalleCuries', DetalleCuriesViewSet)
router.register(r'detallePeces', DetallePecesViewSet)
router.register(r'detalleApicolas', DetalleApicolasViewSet)
router.register(r'UPs', UPViewSet),


urlpatterns = router.urls

urlpatterns = [
    path('mis-ups/', mis_ups, name='mis_ups'),
    path('validar-ups/<int:upId>/', validar_ups, name='validar_ups'),
    path('upload-archivo-up/', upload_archivo_up, name='upload_archivo_up'),
] + router.urls

urlpatterns += [
    path(
        'info_personal_caracterizacion/<int:userId>/', info_personal_caracterizacion, name='info_personal_caracterizacion'
    ),
    path(
        'info_predio_caracterizacion/<int:userId>/', info_predio_caracterizacion, name='info_predio_caracterizacion'
    ),
    path(
        'info_up_caracterizacion/<int:userId>/', info_up_caracterizacion, name='info_up_caracterizacion'
    ),
    path(
        'info_produccion_agricola/<int:userId>/', info_produccion_agricola, name='info_produccion_agricola'
    ),
    path(
        'info_produccion_animal/<int:userId>/', info_produccion_animal, name='info_produccion_animal'
    ),
    path(
        'info_produccion_agroindustrial/<int:userId>/', info_produccion_agroindustrial, name='info_produccion_agroindustrial'
    ),
    path(
        'info_adicional_caracterizacion/<int:userId>/', info_adicional_caracterizacion, name='info_adicional_caracterizacion'
    ),
]