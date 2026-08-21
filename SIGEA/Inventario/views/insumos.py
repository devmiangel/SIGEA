from datetime import date

from django.db import transaction
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_solicitudes_insumo(request):
    funcionario = getattr(request.user, 'funcionarios', None)
    administrador = getattr(request.user, 'administradores', None)

    if funcionario is None and administrador is None:
        return Response({'error': 'El usuario autenticado no tiene permisos para consultar solicitudes de insumo'}, status=403)

    queryset = SolicitudInsumo.objects.select_related('Insumo__Unidades', 'Funcionario__usuario__persona')

    if funcionario is not None:
        queryset = queryset.filter(Funcionario=funcionario)

    solicitudes = queryset.order_by('-FechaSolicitud', '-id')
    serializer = SolicitudInsumoSerializer(solicitudes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_solicitud_insumo(request):
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

    if cantidad_int > insumo.Cantidad:
        return Response({'error': f'La cantidad solicitada supera el stock disponible ({insumo.Cantidad})'}, status=400)

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

    if cantidad_int > solicitud.Cantidad:
        return Response({'error': f'La cantidad a asignar no puede superar la solicitada ({solicitud.Cantidad})'}, status=400)

    if cantidad_int > solicitud.Insumo.Cantidad:
        return Response({'error': f'Stock insuficiente. Disponible: {solicitud.Insumo.Cantidad}'}, status=400)

    with transaction.atomic():
        cardex = CardexInsumoFuncionario.objects.create(
            Funcionario=solicitud.Funcionario,
            Insumo=solicitud.Insumo,
            Administrador=administrador,
            Cantidad=cantidad_int,
            FechaAsignacion=date.today(),
        )

        inventario, _ = InventarioFuncionario.objects.get_or_create(
            Insumo=solicitud.Insumo,
            Funcionario=solicitud.Funcionario,
            defaults={'Cantidad': 0},
        )
        inventario.Cantidad += cantidad_int
        inventario.save(update_fields=['Cantidad'])

        solicitud.Insumo.Cantidad -= cantidad_int
        solicitud.Insumo.save(update_fields=['Cantidad'])

        solicitud.Observacion = observacion or None
        solicitud.Estado = 'Resuelta'
        solicitud.save(update_fields=['Estado', 'Observacion'])

    serializer = CardexInsumoFuncionarioSerializer(cardex)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_insumo_directo(request, insumo_id):
    from Usuarios.models import Funcionarios

    administrador = getattr(request.user, 'administradores', None)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        insumo = Insumos.objects.select_related('Unidades').get(pk=insumo_id)
    except Insumos.DoesNotExist:
        return Response({'error': 'El insumo no existe'}, status=404)

    if not insumo.Estado:
        return Response({'error': 'El insumo no está disponible'}, status=400)

    data = request.data
    funcionario_id = data.get('funcionario_id')
    cantidad = data.get('cantidad')

    if not funcionario_id:
        return Response({'error': 'Debes seleccionar un funcionario'}, status=400)

    try:
        funcionario = Funcionarios.objects.get(pk=funcionario_id)
    except Funcionarios.DoesNotExist:
        return Response({'error': 'El funcionario seleccionado no existe'}, status=400)

    try:
        cantidad_int = int(cantidad)
    except (TypeError, ValueError):
        return Response({'error': 'La cantidad debe ser un número entero'}, status=400)

    if cantidad_int <= 0:
        return Response({'error': 'La cantidad debe ser mayor a cero'}, status=400)

    if cantidad_int > insumo.Cantidad:
        return Response({'error': f'Stock insuficiente. Disponible: {insumo.Cantidad}'}, status=400)

    with transaction.atomic():
        cardex = CardexInsumoFuncionario.objects.create(
            Funcionario=funcionario,
            Insumo=insumo,
            Administrador=administrador,
            Cantidad=cantidad_int,
            FechaAsignacion=date.today(),
        )

        inventario, _ = InventarioFuncionario.objects.get_or_create(
            Insumo=insumo,
            Funcionario=funcionario,
            defaults={'Cantidad': 0},
        )
        inventario.Cantidad += cantidad_int
        inventario.save(update_fields=['Cantidad'])

        insumo.Cantidad -= cantidad_int
        insumo.save(update_fields=['Cantidad'])

    serializer = CardexInsumoFuncionarioSerializer(cardex)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rechazar_solicitud_insumo(request, solicitud_id):
    administrador = getattr(request.user, 'administradores', None)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        solicitud = SolicitudInsumo.objects.select_related('Insumo', 'Funcionario').get(pk=solicitud_id)
    except SolicitudInsumo.DoesNotExist:
        return Response({'error': 'La solicitud no existe'}, status=404)

    if solicitud.Estado != 'Pendiente':
        return Response({'error': 'Esta solicitud ya fue atendida'}, status=400)

    data = request.data
    observacion = data.get('observacion')

    solicitud.Observacion = observacion or None
    solicitud.Estado = 'Rechazada'
    solicitud.save(update_fields=['Estado', 'Observacion'])

    serializer = SolicitudInsumoSerializer(solicitud)
    return Response(serializer.data, status=200)
