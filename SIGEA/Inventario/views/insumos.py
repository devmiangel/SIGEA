from datetime import date

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Insumos, InventarioFuncionario, CardexInsumoFuncionario, SolicitudInsumo

from ..serializers import (
    InsumosSerializer,
    InventarioFuncionarioSerializer,
    CardexInsumoFuncionarioSerializer,
    SolicitudInsumoSerializer,
)

class InsumosViewSet(viewsets.ModelViewSet):
    queryset = Insumos.objects.all()
    serializer_class = InsumosSerializer

class InventarioFuncionarioViewSet(viewsets.ModelViewSet):
    queryset = InventarioFuncionario.objects.all()
    serializer_class = InventarioFuncionarioSerializer

class CardexInsumoFuncionarioViewSet(viewsets.ModelViewSet):
    queryset = CardexInsumoFuncionario.objects.all()
    serializer_class = CardexInsumoFuncionarioSerializer

class SolicitudInsumoViewSet(viewsets.ModelViewSet):
    queryset = SolicitudInsumo.objects.select_related('Insumo__Unidades', 'Funcionario__usuario__persona').all()
    serializer_class = SolicitudInsumoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        funcionario = getattr(self.request.user, 'funcionarios', None)
        if funcionario is not None:
            return self.queryset.filter(Funcionario=funcionario)
        return self.queryset

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_solicitud_insumo(request):
    from Usuarios.models import Funcionarios

    data = request.data
    insumo_id = data.get('insumo_id')
    cantidad = data.get('cantidad')

    funcionario = getattr(request.user, 'funcionarios', None)
    if not funcionario:
        return Response({'error': 'El usuario autenticado no es un funcionario'}, status=403)

    if not insumo_id:
        return Response({'error': 'Debes seleccionar un insumo'}, status=400)

    try:
        insumo = Insumos.objects.get(pk=insumo_id)
    except Insumos.DoesNotExist:
        return Response({'error': 'El insumo seleccionado no existe'}, status=400)

    if not insumo.Estado:
        return Response({'error': 'El insumo seleccionado no está disponible'}, status=400)

    try:
        cantidad_int = int(cantidad)
    except (TypeError, ValueError):
        return Response({'error': 'La cantidad debe ser un número entero'}, status=400)

    if cantidad_int <= 0:
        return Response({'error': 'La cantidad debe ser mayor a cero'}, status=400)

    solicitud = SolicitudInsumo.objects.create(
        Insumo=insumo,
        Funcionario=funcionario,
        Cantidad=cantidad_int,
    )

    serializer = SolicitudInsumoSerializer(solicitud)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_solicitud_insumo(request, solicitud_id):
    from Usuarios.models import Administradores

    administrador = getattr(request.user, 'administradores', None)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        solicitud = SolicitudInsumo.objects.select_related('Insumo', 'Funcionario').get(pk=solicitud_id)
    except SolicitudInsumo.DoesNotExist:
        return Response({'error': 'La solicitud no existe'}, status=404)

    if solicitud.Estado != 'Pendiente':
        return Response({'error': 'Esta solicitud ya fue resuelta'}, status=400)

    data = request.data
    cantidad = data.get('cantidad')
    observacion = data.get('observacion')

    try:
        cantidad_int = int(cantidad)
    except (TypeError, ValueError):
        return Response({'error': 'La cantidad debe ser un número entero'}, status=400)

    if cantidad_int <= 0:
        return Response({'error': 'La cantidad debe ser mayor a cero'}, status=400)

    cardex = CardexInsumoFuncionario.objects.create(
        Funcionario=solicitud.Funcionario,
        Insumo=solicitud.Insumo,
        Administrador=administrador,
        Cantidad=cantidad_int,
        FechaAsignacion=date.today(),
        Observacion=observacion or None,
    )

    inventario, _ = InventarioFuncionario.objects.get_or_create(
        Insumo=solicitud.Insumo,
        Funcionario=solicitud.Funcionario,
        defaults={'Cantidad': 0},
    )
    inventario.Cantidad += cantidad_int
    inventario.save(update_fields=['Cantidad'])

    solicitud.Estado = 'Resuelta'
    solicitud.save(update_fields=['Estado'])

    serializer = CardexInsumoFuncionarioSerializer(cardex)
    return Response(serializer.data, status=201)
