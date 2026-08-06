from rest_framework import serializers

from ..models import Insumos, InventarioFuncionario, CardexInsumoFuncionario

class InsumosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insumos
        fields = '__all__'

class InventarioFuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventarioFuncionario
        fields = '__all__'

class CardexInsumoFuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardexInsumoFuncionario
        fields = '__all__'
