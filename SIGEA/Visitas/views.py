from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from Usuarios.models import Productores, Usuario, Administradores, Funcionarios

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
    from UPs.models import UP

    data = request.data
    observacion = data.get('observacion')
    up_id = data.get('up_id')
    motivo_id = data.get('motivo_id')

    if not observacion:
        return Response({'error': 'La observación es requerida'}, status=400)

    up = None
    if up_id:
        up = get_object_or_404(UP, id=up_id)

    solicitud = Solicitudes.objects.create(
        UP=up,
        MotivoSolicitud_id=motivo_id or 2,
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def atender_solicitud(request, solicitud_id):
    solicitud = get_object_or_404(Solicitudes, id=solicitud_id)

    if solicitud.Estado_id != 1:
        return Response({'error': 'La solicitud no está en estado En Proceso'}, status=400)

    data = request.data
    fecha_visita = data.get('fecha_visita')
    ubicacion = data.get('ubicacion')
    funcionario_id = data.get('funcionario_id')
    tipo_visita_id = data.get('tipo_visita_id')

    errores = {}
    if not fecha_visita:
        errores['fecha_visita'] = 'La fecha y hora de la visita es requerida'
    if not ubicacion or not str(ubicacion).strip():
        errores['ubicacion'] = 'La ubicación es requerida'
    if not funcionario_id:
        errores['funcionario_id'] = 'El funcionario es requerido'
    if not tipo_visita_id:
        errores['tipo_visita_id'] = 'El tipo de visita es requerido'

    if errores:
        return Response({'error': 'Complete todos los campos', 'campos': errores}, status=400)

    administrador = get_object_or_404(Administradores, usuario=request.user)
    funcionario = get_object_or_404(Funcionarios, id=funcionario_id)
    tipo_visita = get_object_or_404(TiposVisitas, id=tipo_visita_id)

    visita = Visitas.objects.create(
        Solicitud=solicitud,
        Funcionario=funcionario,
        Administrador=administrador,
        TipoVisita=tipo_visita,
        FechaVisita=fecha_visita,
        Ubicacion=str(ubicacion).strip(),
        RutaDocumento='Pendiente de generación del documento'
    )

    solicitud.Estado_id = 2
    solicitud.save(update_fields=['Estado'])

    serializer = VisitasSerializer(visita)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rechazar_solicitud(request, solicitud_id):
    solicitud = get_object_or_404(Solicitudes, id=solicitud_id)

    if solicitud.Estado_id != 1:
        return Response({'error': 'La solicitud no está en estado En Proceso'}, status=400)

    solicitud.Estado_id = 3
    solicitud.save(update_fields=['Estado'])

    serializer = SolicitudesSerializer(solicitud)
    return Response(serializer.data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_visitas(request):
    funcionario = getattr(request.user, 'funcionarios', None)
    if not funcionario:
        return Response({'error': 'El usuario autenticado no es un funcionario'}, status=403)
    visitas = (
        Visitas.objects
        .select_related(
            'Solicitud__MotivoSolicitud',
            'Solicitud__Usuario__persona',
            'Funcionario__usuario__persona',
            'Administrador__usuario__persona',
            'TipoVisita'
        )
        .filter(Funcionario=funcionario)
        .order_by('FechaVisita')
    )
    serializer = VisitasSerializer(visitas, many=True)
    return Response(serializer.data)

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
