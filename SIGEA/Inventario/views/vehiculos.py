from datetime import date

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import (
    TiposVehiculos,
    TiposCombustibles,
    MarcasVehiculos,
    LineasVehiculos,
    Vehiculos,
    DetalleVehiculos,
    Conductores,
    RegistroAsignacionVehiculos,
)

from ..serializers import (
    TiposVehiculosSerializer,
    TiposCombustiblesSerializer,
    MarcasVehiculosSerializer,
    LineasVehiculosSerializer,
    VehiculosSerializer,
    DetalleVehiculosSerializer,
    ConductoresSerializer,
    RegistroAsignacionVehiculosSerializer,
)

class TiposVehiculosViewSet(viewsets.ModelViewSet):
    queryset = TiposVehiculos.objects.all()
    serializer_class = TiposVehiculosSerializer

class TiposCombustiblesViewSet(viewsets.ModelViewSet):
    queryset = TiposCombustibles.objects.all()
    serializer_class = TiposCombustiblesSerializer

class MarcasVehiculosViewSet(viewsets.ModelViewSet):
    queryset = MarcasVehiculos.objects.all()
    serializer_class = MarcasVehiculosSerializer

class LineasVehiculosViewSet(viewsets.ModelViewSet):
    queryset = LineasVehiculos.objects.all()
    serializer_class = LineasVehiculosSerializer

class VehiculosViewSet(viewsets.ModelViewSet):
    queryset = Vehiculos.objects.all()
    serializer_class = VehiculosSerializer

class DetalleVehiculosViewSet(viewsets.ModelViewSet):
    queryset = DetalleVehiculos.objects.all()
    serializer_class = DetalleVehiculosSerializer

class ConductoresViewSet(viewsets.ModelViewSet):
    queryset = Conductores.objects.all()
    serializer_class = ConductoresSerializer

class RegistroAsignacionVehiculosViewSet(viewsets.ModelViewSet):
    queryset = RegistroAsignacionVehiculos.objects.all()
    serializer_class = RegistroAsignacionVehiculosSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_vehiculo_directo(request, detalle_vehiculo_id):
    from Usuarios.models import Funcionarios

    administrador = getattr(request.user, 'administradores', None)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        detalle = DetalleVehiculos.objects.get(pk=detalle_vehiculo_id)
    except DetalleVehiculos.DoesNotExist:
        return Response({'error': 'El vehículo no existe'}, status=404)

    if not detalle.Estado:
        return Response({'error': 'El vehículo no está disponible'}, status=400)

    if RegistroAsignacionVehiculos.objects.filter(DetalleVehiculo=detalle, Entregado=False).exists():
        return Response({'error': 'El vehículo ya se encuentra asignado'}, status=400)

    data = request.data
    funcionario_id = data.get('funcionario_id')
    if not funcionario_id:
        return Response({'error': 'Debes seleccionar un funcionario'}, status=400)

    try:
        funcionario = Funcionarios.objects.get(pk=funcionario_id)
    except Funcionarios.DoesNotExist:
        return Response({'error': 'El funcionario seleccionado no existe'}, status=400)

    conductor = Conductores.objects.filter(Funcionario=funcionario, Estado=True).first()
    if conductor is None:
        return Response({'error': 'El funcionario seleccionado no tiene una licencia de conductor registrada'}, status=400)

    asignacion = RegistroAsignacionVehiculos.objects.create(
        DetalleVehiculo=detalle,
        Conductor=conductor,
        Administrador=administrador,
        FechaAsignacion=date.today(),
    )

    serializer = RegistroAsignacionVehiculosSerializer(asignacion)
    return Response(serializer.data, status=201)
