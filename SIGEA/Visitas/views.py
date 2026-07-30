from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from Usuarios.models import Productores, Usuario

from .models import (
    MotivosSolicitudes,
    Estados,
    Solicitudes,
    TiposVisitas,
    Visitas,
    InsumoVisita,
    Calificaciones,
    InfoVisita
)

from .serializers import (
    MotivosSolicitudesSerializer,
    EstadosSerializer,
    SolicitudesSerializer,
    TiposVisitasSerializer,
    VisitasSerializer,
    InsumoVisitaSerializer,
    CalificacionesSerializer,
    InfoVisitaSerializer
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_solicitud(request):
    data = request.data
    observacion = data.get('observacion')

    if not observacion:
        return Response({'error': 'La observación es requerida'}, status=400)

    solicitud = Solicitudes.objects.create(
        UP=None,
        MotivoSolicitud_id=2,
        Observacion=observacion,
        Estado_id=1,
        Usuario=request.user
    )

    Productores.objects.get_or_create(
        usuario=request.user,
        defaults={'Estado': True}
    )

    serializer = SolicitudesSerializer(solicitud)
    return Response(serializer.data, status=201)

class TiposVisitasViewSet(viewsets.ModelViewSet):
    queryset = TiposVisitas.objects.all()
    serializer_class = TiposVisitasSerializer

class VisitasViewSet(viewsets.ModelViewSet):
    queryset = Visitas.objects.all()
    serializer_class = VisitasSerializer

class InsumoVisitaViewSet(viewsets.ModelViewSet):
    queryset = InsumoVisita.objects.all()
    serializer_class = InsumoVisitaSerializer

class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer

class InfoVisitaViewSet(viewsets.ModelViewSet):
    queryset = InfoVisita.objects.all()
    serializer_class = InfoVisitaSerializer
