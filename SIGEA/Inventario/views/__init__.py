from .vehiculos import (
    TiposVehiculosViewSet,
    TiposCombustiblesViewSet,
    MarcasVehiculosViewSet,
    LineasVehiculosViewSet,
    VehiculosViewSet,
    DetalleVehiculosViewSet,
    ConductoresViewSet,
    RegistroAsignacionVehiculosViewSet,
)
from .herramientas import (
    TiposHerramientasViewSet,
    HerramientasViewSet,
    AsignacionHerramientasViewSet,
)
from .insumos import (
    InsumosViewSet,
    InventarioFuncionarioViewSet,
    CardexInsumoFuncionarioViewSet,
    listar_solicitudes_insumo,
    crear_solicitud_insumo,
    asignar_solicitud_insumo,
    rechazar_solicitud_insumo,
)
