from rest_framework import viewsets

from .models import (
    TiposVehiculos,
    TiposCombustibles,
    MarcasVehiculos,LineasVehiculos,
    Vehiculos,
    DetalleVehiculos,
    Conductores,
    RegistroAsignacionVehiculos,
    TiposHerramientas,
    Herramientas,
    AsignacionHerramientas,
    Insumos,
    InventarioFuncionario,
    CardexInsumoFuncionario
)

from .serializers import (
    TiposVehiculosSerializer,
    TiposCombustiblesSerializer,
    MarcasVehiculosSerializer,
    LineasVehiculosSerializer,
    VehiculosSerializer,
    DetalleVehiculosSerializer,
    ConductoresSerializer,
    RegistroAsignacionVehiculosSerializer,
    TiposHerramientasSerializer,
    HerramientasSerializer,
    AsignacionHerramientasSerializer,
    InsumosSerializer,
    InventarioFuncionarioSerializer,
    CardexInsumoFuncionarioSerializer
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

class TiposHerramientasViewSet(viewsets.ModelViewSet):
    queryset = TiposHerramientas.objects.all()
    serializer_class = TiposHerramientasSerializer

class HerramientasViewSet(viewsets.ModelViewSet):
    queryset = Herramientas.objects.all()
    serializer_class = HerramientasSerializer

class AsignacionHerramientasViewSet(viewsets.ModelViewSet):
    queryset = AsignacionHerramientas.objects.all()
    serializer_class = AsignacionHerramientasSerializer

class InsumosViewSet(viewsets.ModelViewSet):
    queryset = Insumos.objects.all()
    serializer_class = InsumosSerializer

class InventarioFuncionarioViewSet(viewsets.ModelViewSet):
    queryset = InventarioFuncionario.objects.all()
    serializer_class = InventarioFuncionarioSerializer

class CardexInsumoFuncionarioViewSet(viewsets.ModelViewSet):
    queryset = CardexInsumoFuncionario.objects.all()
    serializer_class = CardexInsumoFuncionarioSerializer    