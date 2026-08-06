from .catalogs import (
    MotivosSolicitudesViewSet,
    EstadosViewSet,
    SolicitudesViewSet,
    TiposVisitasViewSet,
    VisitasViewSet,
    InsumoVisitaViewSet,
    CalificacionesViewSet,
    InfoVisitaViewSet,
)
from .solicitudes import (
    crear_solicitud,
    atender_solicitud,
    rechazar_solicitud,
    mis_visitas,
)
from .formulario import FormularioVisitaTecnicaView
