from datetime import date

from django.db import transaction
from rest_framework import viewsets
from SIGEAsite.permissions import SigeaModelPermissionMixin
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

from .utils import ErrorAsignacion, SoloPropiosFuncionarioMixin, administrador_de, funcionario_activo
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

class TiposVehiculosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposVehiculos.objects.all()
    serializer_class = TiposVehiculosSerializer

class TiposCombustiblesViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposCombustibles.objects.all()
    serializer_class = TiposCombustiblesSerializer

class MarcasVehiculosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = MarcasVehiculos.objects.all()
    serializer_class = MarcasVehiculosSerializer

class LineasVehiculosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = LineasVehiculos.objects.all()
    serializer_class = LineasVehiculosSerializer

class VehiculosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Vehiculos.objects.all()
    serializer_class = VehiculosSerializer

class DetalleVehiculosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = DetalleVehiculos.objects.all()
    serializer_class = DetalleVehiculosSerializer

class ConductoresViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Conductores.objects.all()
    serializer_class = ConductoresSerializer

# Solo lectura: las asignaciones se crean con asignar_vehiculo_directo y se
# cierran con devolver_vehiculo.
class RegistroAsignacionVehiculosViewSet(SigeaModelPermissionMixin, SoloPropiosFuncionarioMixin, viewsets.ReadOnlyModelViewSet):
    funcionario_lookup = 'Conductor__Funcionario__usuario'
    queryset = RegistroAsignacionVehiculos.objects.all()
    serializer_class = RegistroAsignacionVehiculosSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_vehiculo_directo(request, detalle_vehiculo_id):
    administrador = administrador_de(request.user)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        with transaction.atomic():
            # Se bloquea el vehiculo: dos asignaciones simultaneas no pueden
            # dejarlo entregado a dos conductores.
            detalle = DetalleVehiculos.objects.select_for_update().filter(pk=detalle_vehiculo_id).first()
            if detalle is None:
                raise ErrorAsignacion('El vehículo no existe', 404)
            if not detalle.Estado:
                raise ErrorAsignacion('El vehículo no está disponible')
            if RegistroAsignacionVehiculos.objects.filter(DetalleVehiculo=detalle, Entregado=False).exists():
                raise ErrorAsignacion('El vehículo ya se encuentra asignado')

            funcionario = funcionario_activo(request.data.get('funcionario_id'))
            conductor = Conductores.objects.filter(Funcionario=funcionario, Estado=True).first()
            if conductor is None:
                raise ErrorAsignacion('El funcionario seleccionado no tiene una licencia de conductor registrada')

            asignacion = RegistroAsignacionVehiculos.objects.create(
                DetalleVehiculo=detalle,
                Conductor=conductor,
                Administrador=administrador,
                FechaAsignacion=date.today(),
            )
    except ErrorAsignacion as exc:
        return exc.respuesta()

    serializer = RegistroAsignacionVehiculosSerializer(asignacion)
    return Response(serializer.data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def devolver_vehiculo(request, asignacion_id):
    """El administrador registra la devolucion: el vehiculo queda disponible."""
    if not administrador_de(request.user):
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    with transaction.atomic():
        asignacion = RegistroAsignacionVehiculos.objects.select_for_update().filter(pk=asignacion_id).first()
        if asignacion is None:
            return Response({'error': 'La asignación no existe'}, status=404)
        if asignacion.Entregado:
            return Response({'error': 'El vehículo ya fue devuelto'}, status=409)
        asignacion.Entregado = True
        asignacion.FechaDevolucion = date.today()
        asignacion.save(update_fields=['Entregado', 'FechaDevolucion'])

    return Response(RegistroAsignacionVehiculosSerializer(asignacion).data)
