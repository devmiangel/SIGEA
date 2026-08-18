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
router.register(r'solicitudInsumo', SolicitudInsumoViewSet)

urlpatterns = [
    path('solicitudInsumo/crear/', crear_solicitud_insumo, name='crear_solicitud_insumo'),
    path('solicitudInsumo/<int:solicitud_id>/asignar/', asignar_solicitud_insumo, name='asignar_solicitud_insumo'),
] + router.urls
