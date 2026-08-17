import unicodedata

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
    ServiciosPagos,
    Aperos,
    Pajillas,
    VisitasServiciosPagos
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
    ServiciosPagosSerializer,
    AperosSerializer,
    PajillasSerializer,
    VisitasServiciosPagosSerializer

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

def _normalizar_texto(texto):
    """Normaliza un texto a minusculas y sin acentos para comparaciones."""
    return unicodedata.normalize('NFD', texto or '').encode('ascii', 'ignore').decode('ascii').strip().lower()


def _es_visita_caracterizacion(visita):
    """Una visita es de caracterizacion cuando su TipoVisita lo indica."""
    tipo = getattr(getattr(visita, 'TipoVisita', None), 'TipoVisita', None)
    return _normalizar_texto(tipo) == 'caracterizacion'


class VisitasViewSet(viewsets.ModelViewSet):
    queryset = Visitas.objects.all()
    serializer_class = VisitasSerializer

    def update(self, request, *args, **kwargs):
        from UPs.models import EstadosUP

        visita = self.get_object()
        estado = request.data.get('estado')

        if estado is not None:
            if isinstance(estado, bool):
                estado_valido = bool(estado)
            elif isinstance(estado, str):
                estado_valido = estado.strip().lower() in ('true', '1', 'si')
            else:
                estado_valido = bool(estado)

            if estado_valido and not visita.estado:
                # La UP solo vuelve a validacion cuando la visita es de caracterizacion.
                # Las visitas de seguimiento/tecnica no deben reabrir su validacion.
                if _es_visita_caracterizacion(visita):
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

class ServiciosPagosViewSet(viewsets.ModelViewSet):
    queryset = ServiciosPagos.objects.all()
    serializer_class = ServiciosPagosSerializer

class AperosViewSet(viewsets.ModelViewSet):
    queryset = Aperos.objects.all()
    serializer_class = AperosSerializer

class PajillasViewSet(viewsets.ModelViewSet):
    queryset = Pajillas.objects.all()
    serializer_class = PajillasSerializer

class VisitasServiciosPagosViewSet(viewsets.ModelViewSet):
    queryset = VisitasServiciosPagos.objects.all()
    serializer_class = VisitasServiciosPagosSerializer
