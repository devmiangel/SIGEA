from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from Usuarios.models import Administradores, Funcionarios, Productores, Usuario

from ..models import Solicitudes, Visitas, TiposVisitas
from ..serializers import SolicitudesSerializer, VisitasSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_solicitud(request):
    from UPs.models import UP

    data = request.data
    observacion = data.get('observacion')
    direccion = data.get('direccion')
    up_id = data.get('up_id')
    motivo_id = data.get('motivo_id')

    if not observacion:
        return Response({'error': 'La observación es requerida'}, status=400)

    if not direccion or not str(direccion).strip():
        return Response({'error': 'La dirección es requerida'}, status=400)

    # Permite que un funcionario/administrador cree la solicitud a nombre del
    # productor (usuario_id), igual que lo hace el productor en su módulo.
    usuario = request.user
    if usuario_id := data.get('usuario_id'):
        usuario = get_object_or_404(Usuario, id=usuario_id)

    up = None
    if up_id:
        up = get_object_or_404(UP, id=up_id)

    solicitud = Solicitudes.objects.create(
        UP=up,
        MotivoSolicitud_id=motivo_id or 2,
        Observacion=observacion,
        Direccion=str(direccion).strip(),
        Estado_id=1,
        Usuario=usuario
    )

    Productores.objects.get_or_create(
        usuario=usuario,
        defaults={'Estado': True}
    )

    serializer = SolicitudesSerializer(solicitud)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reagendar_solicitud(request, solicitud_id):
    solicitud = get_object_or_404(Solicitudes, id=solicitud_id)

    if solicitud.Estado_id not in (1, 2):
        return Response({'error': 'La solicitud no está en un estado que permita reagendar'}, status=400)

    motivo = request.data.get('motivo_reagendamiento')
    if not motivo or not str(motivo).strip():
        return Response({'error': 'El motivo del reagendamiento es requerido'}, status=400)

    motivo = str(motivo).strip()
    novedad_actual = (solicitud.novedad or '').strip()
    nueva_novedad = f"{novedad_actual} - {motivo}" if novedad_actual else motivo

    if len(nueva_novedad) > 255:
        return Response({'error': 'La novedad no puede superar los 255 caracteres'}, status=400)

    solicitud.novedad = nueva_novedad
    solicitud.Estado_id = 4
    solicitud.save(update_fields=['Estado', 'novedad'])

    serializer = SolicitudesSerializer(solicitud)
    return Response(serializer.data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def atender_solicitud(request, solicitud_id):
    solicitud = get_object_or_404(Solicitudes, id=solicitud_id)

    if solicitud.Estado_id not in (1, 4):
        return Response({'error': 'La solicitud no está en estado En Proceso ni Reagendado'}, status=400)

    data = request.data
    fecha_visita = data.get('fecha_visita')
    ubicacion = data.get('ubicacion')
    funcionario_id = data.get('funcionario_id')
    tipo_visita_id = data.get('tipo_visita_id')
    novedad = data.get('novedad')

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

    es_reagendamiento = solicitud.Estado_id == 4
    visita = (
        Visitas.objects.filter(Solicitud=solicitud).order_by('-id').first()
        if es_reagendamiento else None
    )

    if visita is not None:
        visita.Funcionario = funcionario
        visita.Administrador = administrador
        visita.TipoVisita = tipo_visita
        visita.FechaYHoraVisita = fecha_visita
        visita.Ubicacion = str(ubicacion).strip()
        visita.estado = False
        visita.save()
    else:
        visita = Visitas.objects.create(
            Solicitud=solicitud,
            Funcionario=funcionario,
            Administrador=administrador,
            TipoVisita=tipo_visita,
            FechaYHoraVisita=fecha_visita,
            Ubicacion=str(ubicacion).strip(),
        )

    solicitud.Estado_id = 2
    solicitud.novedad = novedad if novedad and str(novedad).strip() else None
    solicitud.save(update_fields=['Estado', 'novedad'])

    serializer = VisitasSerializer(visita)
    return Response(serializer.data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rechazar_solicitud(request, solicitud_id):
    solicitud = get_object_or_404(Solicitudes, id=solicitud_id)

    if solicitud.Estado_id not in (1, 4):
        return Response({'error': 'La solicitud no está en estado En Proceso ni Reagendado'}, status=400)

    novedad = request.data.get('novedad')

    solicitud.Estado_id = 3
    solicitud.novedad = novedad if novedad and str(novedad).strip() else None
    solicitud.save(update_fields=['Estado', 'novedad'])

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
        .exclude(Solicitud__Estado_id=4)
        .order_by('FechaYHoraVisita')
    )
    serializer = VisitasSerializer(visitas, many=True)
    return Response(serializer.data)
