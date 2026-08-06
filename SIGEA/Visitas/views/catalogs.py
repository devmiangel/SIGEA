from rest_framework import viewsets
from rest_framework.response import Response

from ..models import (
    MotivosSolicitudes,
    Estados,
    Solicitudes,
    TiposVisitas,
    Visitas,
    InsumoVisita,
    Calificaciones,
    InfoVisita,
)

from ..serializers import (
    MotivosSolicitudesSerializer,
    EstadosSerializer,
    SolicitudesSerializer,
    TiposVisitasSerializer,
    VisitasSerializer,
    InsumoVisitaSerializer,
    CalificacionesSerializer,
    InfoVisitaSerializer,
)

class MotivosSolicitudesViewSet(viewsets.ModelViewSet):
    queryset = MotivosSolicitudes.objects.all()
    serializer_class = MotivosSolicitudesSerializer

class EstadosViewSet(viewsets.ModelViewSet):
    queryset = Estados.objects.all()
    serializer_class = EstadosSerializer

class SolicitudesViewSet(viewsets.ModelViewSet):
    queryset = Solicitudes.objects.all()
    serializer_class = SolicitudesSerializer

class TiposVisitasViewSet(viewsets.ModelViewSet):
    queryset = TiposVisitas.objects.all()
    serializer_class = TiposVisitasSerializer

class VisitasViewSet(viewsets.ModelViewSet):
    queryset = Visitas.objects.all()
    serializer_class = VisitasSerializer

    def update(self, request, *args, **kwargs):
        from UPs.models import EstadosUP

        visita = self.get_object()
        estado = request.data.get('estado')

        if estado is not None:
            if bool(estado) and not visita.estado:
                up = visita.Solicitud.UP if visita.Solicitud else None
                if up is not None:
                    estado_en_revision = EstadosUP.objects.filter(Estado='En revision').first()
                    if estado_en_revision:
                        up.idEstado = estado_en_revision
                        up.save(update_fields=['idEstado'])

        serializer = self.get_serializer(visita, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class InsumoVisitaViewSet(viewsets.ModelViewSet):
    queryset = InsumoVisita.objects.all()
    serializer_class = InsumoVisitaSerializer

class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer

class InfoVisitaViewSet(viewsets.ModelViewSet):
    queryset = InfoVisita.objects.all()
    serializer_class = InfoVisitaSerializer
