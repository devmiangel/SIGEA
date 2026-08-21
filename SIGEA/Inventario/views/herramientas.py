from datetime import date

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import TiposHerramientas, Herramientas, AsignacionHerramientas

from ..serializers import (
    TiposHerramientasSerializer,
    HerramientasSerializer,
    AsignacionHerramientasSerializer,
)

class TiposHerramientasViewSet(viewsets.ModelViewSet):
    queryset = TiposHerramientas.objects.all()
    serializer_class = TiposHerramientasSerializer

class HerramientasViewSet(viewsets.ModelViewSet):
    queryset = Herramientas.objects.all()
    serializer_class = HerramientasSerializer

class AsignacionHerramientasViewSet(viewsets.ModelViewSet):
    queryset = AsignacionHerramientas.objects.all()
    serializer_class = AsignacionHerramientasSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_herramienta_directo(request, herramienta_id):
    from Usuarios.models import Funcionarios

    administrador = getattr(request.user, 'administradores', None)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        herramienta = Herramientas.objects.get(pk=herramienta_id)
    except Herramientas.DoesNotExist:
        return Response({'error': 'La herramienta no existe'}, status=404)

    if not herramienta.Estado:
        return Response({'error': 'La herramienta no está disponible'}, status=400)

    if AsignacionHerramientas.objects.filter(Herramienta=herramienta, Entregado=False).exists():
        return Response({'error': 'La herramienta ya se encuentra asignada'}, status=400)

    data = request.data
    funcionario_id = data.get('funcionario_id')
    if not funcionario_id:
        return Response({'error': 'Debes seleccionar un funcionario'}, status=400)

    try:
        funcionario = Funcionarios.objects.get(pk=funcionario_id)
    except Funcionarios.DoesNotExist:
        return Response({'error': 'El funcionario seleccionado no existe'}, status=400)

    asignacion = AsignacionHerramientas.objects.create(
        Herramienta=herramienta,
        Funcionario=funcionario,
        Administrador=administrador,
        FechaAsignacion=date.today(),
    )

    serializer = AsignacionHerramientasSerializer(asignacion)
    return Response(serializer.data, status=201)
