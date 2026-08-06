from rest_framework import serializers

from ..models import TiposHerramientas, Herramientas, AsignacionHerramientas

class TiposHerramientasSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposHerramientas
        fields = '__all__'

class HerramientasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Herramientas
        fields = '__all__'

class AsignacionHerramientasSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignacionHerramientas
        fields = '__all__'
