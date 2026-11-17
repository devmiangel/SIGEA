from datetime import date

from django.db import transaction
from rest_framework import viewsets
from SIGEAsite.permissions import SigeaModelPermissionMixin
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Insumos, InventarioFuncionario, CardexInsumoFuncionario, SolicitudInsumo

from .utils import (
    ErrorAsignacion, SoloPropiosFuncionarioMixin, administrador_de, cantidad_entera, funcionario_activo,
)
from ..serializers import (
    InsumosSerializer,
    InventarioFuncionarioSerializer,
    CardexInsumoFuncionarioSerializer,
    SolicitudInsumoSerializer,
)

class InsumosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Insumos.objects.all()
    serializer_class = InsumosSerializer

# Inventario y cardex son de solo lectura: solo cambian por los endpoints de
# asignacion (que mantienen cuadrados stock, inventario y cardex).
class InventarioFuncionarioViewSet(SigeaModelPermissionMixin, SoloPropiosFuncionarioMixin, viewsets.ReadOnlyModelViewSet):
    queryset = InventarioFuncionario.objects.all()
    serializer_class = InventarioFuncionarioSerializer

class CardexInsumoFuncionarioViewSet(SigeaModelPermissionMixin, SoloPropiosFuncionarioMixin, viewsets.ReadOnlyModelViewSet):
    queryset = CardexInsumoFuncionario.objects.all()
    serializer_class = CardexInsumoFuncionarioSerializer


def _entregar_insumo(insumo, funcionario, administrador, cantidad):
    """Mueve `cantidad` del stock central al inventario del funcionario.

    Debe llamarse dentro de una transaccion y con `insumo` bloqueado
    (select_for_update), para que dos asignaciones simultaneas no dejen el
    stock en negativo.
    """
    if not insumo.Estado:
        raise ErrorAsignacion('El insumo no está disponible')
    if cantidad > insumo.Cantidad:
        raise ErrorAsignacion(f'Stock insuficiente. Disponible: {insumo.Cantidad}')

    cardex = CardexInsumoFuncionario.objects.create(
        Funcionario=funcionario,
        Insumo=insumo,
        Administrador=administrador,
        Cantidad=cantidad,
        FechaAsignacion=date.today(),
    )

    inventario = (
        InventarioFuncionario.objects.select_for_update()
        .filter(Insumo=insumo, Funcionario=funcionario).order_by('id').first()
    )
    if inventario is None:
        inventario = InventarioFuncionario.objects.create(Insumo=insumo, Funcionario=funcionario, Cantidad=0)
    inventario.Cantidad += cantidad
    inventario.save(update_fields=['Cantidad'])

    insumo.Cantidad -= cantidad
    insumo.save(update_fields=['Cantidad'])
    return cardex

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
        cantidad_int = cantidad_entera(cantidad)
    except ErrorAsignacion as exc:
        return exc.respuesta()

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
    administrador = administrador_de(request.user)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        with transaction.atomic():
            # La solicitud y el insumo se bloquean: dos envios simultaneos no
            # pueden resolver la misma solicitud ni descontar dos veces.
            solicitud = (
                SolicitudInsumo.objects.select_for_update()
                .filter(pk=solicitud_id).first()
            )
            if solicitud is None:
                raise ErrorAsignacion('La solicitud no existe', 404)
            if solicitud.Estado != 'Pendiente':
                raise ErrorAsignacion('Esta solicitud ya fue resuelta')

            cantidad_int = cantidad_entera(request.data.get('cantidad'))
            if cantidad_int > solicitud.Cantidad:
                raise ErrorAsignacion(
                    f'La cantidad a asignar no puede superar la solicitada ({solicitud.Cantidad})'
                )

            funcionario = funcionario_activo(solicitud.Funcionario_id)
            insumo = Insumos.objects.select_for_update().get(pk=solicitud.Insumo_id)
            cardex = _entregar_insumo(insumo, funcionario, administrador, cantidad_int)

            solicitud.Observacion = request.data.get('observacion') or None
            solicitud.Estado = 'Resuelta'
            solicitud.save(update_fields=['Estado', 'Observacion'])
    except ErrorAsignacion as exc:
        return exc.respuesta()

    serializer = CardexInsumoFuncionarioSerializer(cardex)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_insumo_directo(request, insumo_id):
    administrador = administrador_de(request.user)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        with transaction.atomic():
            insumo = Insumos.objects.select_for_update().filter(pk=insumo_id).first()
            if insumo is None:
                raise ErrorAsignacion('El insumo no existe', 404)
            funcionario = funcionario_activo(request.data.get('funcionario_id'))
            cantidad_int = cantidad_entera(request.data.get('cantidad'))
            cardex = _entregar_insumo(insumo, funcionario, administrador, cantidad_int)
    except ErrorAsignacion as exc:
        return exc.respuesta()

    serializer = CardexInsumoFuncionarioSerializer(cardex)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rechazar_solicitud_insumo(request, solicitud_id):
    administrador = administrador_de(request.user)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    with transaction.atomic():
        solicitud = SolicitudInsumo.objects.select_for_update().filter(pk=solicitud_id).first()
        if solicitud is None:
            return Response({'error': 'La solicitud no existe'}, status=404)
        if solicitud.Estado != 'Pendiente':
            return Response({'error': 'Esta solicitud ya fue atendida'}, status=400)

        solicitud.Observacion = request.data.get('observacion') or None
        solicitud.Estado = 'Rechazada'
        solicitud.save(update_fields=['Estado', 'Observacion'])

    serializer = SolicitudInsumoSerializer(solicitud)
    return Response(serializer.data, status=200)
