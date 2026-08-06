from rest_framework import viewsets

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
