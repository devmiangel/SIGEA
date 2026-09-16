from rest_framework import serializers

from ..models import Predios

class PrediosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Predios
        fields = '__all__'
