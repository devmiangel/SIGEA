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
from ..validators import (
    normalizar_texto,
    validar_placa,
    validar_modelo,
    validar_descripcion,
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
        fields = ['id', 'LineaVehiculo', 'TipoCombustible', 'TipoVehiculo']
        read_only_fields = ['id']


class DetalleVehiculosSerializer(serializers.ModelSerializer):
    LineaVehiculo = serializers.CharField(
        source='Vehiculo.LineaVehiculo.LineaVehiculo', read_only=True
    )
    MarcaVehiculo = serializers.CharField(
        source='Vehiculo.LineaVehiculo.MarcaVehiculo.MarcaVehiculo', read_only=True
    )
    TipoVehiculo = serializers.CharField(
        source='Vehiculo.TipoVehiculo.TipoVehiculo', read_only=True
    )
    TipoCombustible = serializers.CharField(
        source='Vehiculo.TipoCombustible.TipoCombustible', read_only=True
    )

    class Meta:
        model = DetalleVehiculos
        fields = [
            'id',
            'Vehiculo',
            'Placa',
            'Modelo',
            'FechaTecno',
            'FechaSoat',
            'Descripcion',
            'Estado',
            'LineaVehiculo',
            'MarcaVehiculo',
            'TipoVehiculo',
            'TipoCombustible',
        ]
        read_only_fields = ['id']

    def validate_Placa(self, value):
        return validar_placa(value)

    def validate_Modelo(self, value):
        return validar_modelo(value)

    def validate_Descripcion(self, value):
        return validar_descripcion(value)

    def validate(self, attrs):
        if self.instance and 'Vehiculo' in attrs:
            if attrs['Vehiculo'].pk != self.instance.Vehiculo_id:
                raise serializers.ValidationError(
                    {'Vehiculo': 'No se puede cambiar el vehículo asociado al detalle.'}
                )
        return attrs


class VehiculoCompletoSerializer(serializers.Serializer):
    """Alta y edición atómica de Vehiculos (spec) + DetalleVehiculos."""

    Placa = serializers.CharField(max_length=20)
    Modelo = serializers.CharField(max_length=255)
    FechaTecno = serializers.DateField()
    FechaSoat = serializers.DateField()
    Descripcion = serializers.CharField(
        required=False, allow_blank=True, max_length=2000
    )
    Estado = serializers.BooleanField(required=False)
    LineaVehiculo = serializers.PrimaryKeyRelatedField(
        queryset=LineasVehiculos.objects.all()
    )
    TipoCombustible = serializers.PrimaryKeyRelatedField(
        queryset=TiposCombustibles.objects.all()
    )
    TipoVehiculo = serializers.PrimaryKeyRelatedField(
        queryset=TiposVehiculos.objects.all()
    )

    def validate_Placa(self, value):
        return validar_placa(value)

    def validate_Modelo(self, value):
        return validar_modelo(value)

    def validate_Descripcion(self, value):
        return validar_descripcion(value)


class ConductoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conductores
        fields = '__all__'


class RegistroAsignacionVehiculosSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAsignacionVehiculos
        fields = '__all__'
