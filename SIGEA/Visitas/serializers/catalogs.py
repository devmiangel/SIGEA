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
    class Meta:
        model = InsumoVisita
        fields = '__all__'

class CalificacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificaciones
        fields = '__all__'

class InfoVisitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfoVisita
        fields = '__all__'

class ServiciosPagosSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiciosPagos
        fields = '__all__'

class AperosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aperos
        fields = '__all__'

class PajillasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pajillas
        fields = '__all__'

class VisitasServiciosPagosSerializer(serializers.ModelSerializer):
	class Meta:
		model = VisitasServiciosPagos
		fields = '__all__'