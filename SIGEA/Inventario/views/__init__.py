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
    SolicitudInsumoViewSet,
    crear_solicitud_insumo,
    asignar_solicitud_insumo,
)
