from rest_framework import serializers

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

class TiposVehiculosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposVehiculos
        fields = '__all__'

class TiposCombustiblesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposCombustibles
        fields = '__all__'

class MarcasVehiculosSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarcasVehiculos
        fields = '__all__'

class LineasVehiculosSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineasVehiculos
        fields = '__all__'

class VehiculosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculos
        fields = '__all__'

class DetalleVehiculosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVehiculos
        fields = '__all__'

class ConductoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conductores
        fields = '__all__'

class RegistroAsignacionVehiculosSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAsignacionVehiculos
        fields = '__all__'
