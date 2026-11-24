from rest_framework import serializers

from ..models import (
    MotivosSolicitudes,
    Estados,
    TiposVisitas,
    InsumoVisita,
    Calificaciones,
    InfoVisita,
    ServiciosPagos,
    Aperos,
    Pajillas,
    VisitasServiciosPagos
)

class MotivosSolicitudesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivosSolicitudes
        fields = '__all__'

class EstadosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estados
        fields = '__all__'

class TiposVisitasSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposVisitas
        fields = '__all__'

class InsumoVisitaSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.CharField(source='InventarioFuncionario.Insumo.Nombre', read_only=True)
    insumo_unidades = serializers.CharField(source='InventarioFuncionario.Insumo.Unidades.Unidad', read_only=True, allow_null=True)
    stock_disponible = serializers.SerializerMethodField()

    class Meta:
        model = InsumoVisita
        fields = '__all__'

    def get_stock_disponible(self, obj):
        return obj.InventarioFuncionario.Cantidad

class CalificacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificaciones
        fields = '__all__'

class InfoVisitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfoVisita
        fields = '__all__'

class ServiciosPagosSerializer(serializers.ModelSerializer):
    ServicioPago = serializers.CharField(max_length=255)

    class Meta:
        model = ServiciosPagos
        fields = '__all__'

    def validate_ServicioPago(self, value):
        nombre = value.strip()
        existentes = ServiciosPagos.objects.filter(ServicioPago__iexact=nombre)
        if self.instance is not None:
            existentes = existentes.exclude(pk=self.instance.pk)
        if existentes.exists():
            raise serializers.ValidationError('Ya existe un servicio con ese nombre.')
        return nombre

class AperosSerializer(serializers.ModelSerializer):
    Apero = serializers.CharField(max_length=255)
    ValorHora = serializers.IntegerField(min_value=0)

    class Meta:
        model = Aperos
        fields = '__all__'

    def validate_Apero(self, value):
        nombre = value.strip()
        existentes = Aperos.objects.filter(Apero__iexact=nombre)
        if self.instance is not None:
            existentes = existentes.exclude(pk=self.instance.pk)
        if existentes.exists():
            raise serializers.ValidationError('Ya existe un apero con ese nombre.')
        return nombre

class PajillasSerializer(serializers.ModelSerializer):
    Pajilla = serializers.CharField(max_length=255)
    ValorPajilla = serializers.IntegerField(min_value=0)

    class Meta:
        model = Pajillas
        fields = '__all__'

    def validate_Pajilla(self, value):
        nombre = value.strip()
        existentes = Pajillas.objects.filter(Pajilla__iexact=nombre)
        if self.instance is not None:
            existentes = existentes.exclude(pk=self.instance.pk)
        if existentes.exists():
            raise serializers.ValidationError('Ya existe una pajilla con ese nombre.')
        return nombre

class VisitasServiciosPagosSerializer(serializers.ModelSerializer):
	class Meta:
		model = VisitasServiciosPagos
		fields = '__all__'