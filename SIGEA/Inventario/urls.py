from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'tiposVehiculos', TiposVehiculosViewSet)
router.register(r'tiposCombustibles', TiposCombustiblesViewSet)
router.register(r'marcasVehiculos', MarcasVehiculosViewSet)
router.register(r'lineasVehiculos', LineasVehiculosViewSet)
router.register(r'vehiculos', VehiculosViewSet)
router.register(r'detalleVehiculos', DetalleVehiculosViewSet)
router.register(r'conductores', ConductoresViewSet)
router.register(r'registroAsignacionVehiculos', RegistroAsignacionVehiculosViewSet)
router.register(r'tiposHerramientas', TiposHerramientasViewSet)
router.register(r'herramientas', HerramientasViewSet)
router.register(r'asignacionHerramientas', AsignacionHerramientasViewSet)
router.register(r'insumos', InsumosViewSet)
router.register(r'inventarioFuncionario', InventarioFuncionarioViewSet)
router.register(r'cardexInsumoFuncionario', CardexInsumoFuncionarioViewSet)

urlpatterns = [
    path('solicitudInsumo/', listar_solicitudes_insumo, name='listar_solicitudes_insumo'),
    path('solicitudInsumo/crear/', crear_solicitud_insumo, name='crear_solicitud_insumo'),
    path('solicitudInsumo/<int:solicitud_id>/asignar/', asignar_solicitud_insumo, name='asignar_solicitud_insumo'),
    path('solicitudInsumo/<int:solicitud_id>/rechazar/', rechazar_solicitud_insumo, name='rechazar_solicitud_insumo'),
    path('insumos/<int:insumo_id>/asignar/', asignar_insumo_directo, name='asignar_insumo_directo'),
    path('herramientas/<int:herramienta_id>/asignar/', asignar_herramienta_directo, name='asignar_herramienta_directo'),
    path('detalleVehiculos/<int:detalle_vehiculo_id>/asignar/', asignar_vehiculo_directo, name='asignar_vehiculo_directo'),
] + router.urls
