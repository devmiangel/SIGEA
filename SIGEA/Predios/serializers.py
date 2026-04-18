from rest_framework import serializers
from .models import Sectores, Veredas, TiposTenencias, Seguros, TiposRegistrosICA, Predios

class SectoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sectores
        fields = '__all__'

class VeredasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veredas
        fields = '__all__'

class TiposTenenciasSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposTenencias
        fields = '__all__'

class SegurosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seguros
        fields = '__all__'

class TiposRegistrosICASerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposRegistrosICA
        fields = '__all__'

class PrediosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Predios
        fields = '__all__'
