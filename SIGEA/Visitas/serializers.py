from rest_framework import serializers
from .models import MotivosSolicitudes,Estados,Solicitudes,TiposVisitas,Visitas,InsumoVisita,Calificaciones,InfoVisita

class MotivosSolicitudesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivosSolicitudes
        fields = '__all__'

class EstadosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estados
        fields = '__all__'

class SolicitudesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitudes
        fields = '__all__'

class TiposVisitasSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposVisitas
        fields = '__all__'

class VisitasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitas
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
