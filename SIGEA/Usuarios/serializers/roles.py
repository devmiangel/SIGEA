from rest_framework import serializers

from ..models import Funcionarios, Administradores, Productores
from .personas import PersonaBasicaSerializer

class FuncionariosSerializer(serializers.ModelSerializer):
    persona_info = PersonaBasicaSerializer(source='usuario.persona', read_only=True)
    email = serializers.SerializerMethodField()

    class Meta:
        model = Funcionarios
        fields = ['id', 'usuario', 'Estado', 'email', 'persona_info']

    def get_email(self, obj):
        return obj.usuario.email

class AdministradoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administradores
        fields = '__all__'

class ProductoresSerializer(serializers.ModelSerializer):
    persona_info = PersonaBasicaSerializer(source='usuario.persona', read_only=True)
    email = serializers.SerializerMethodField()
    ups_count = serializers.SerializerMethodField()

    class Meta:
        model = Productores
        fields = ['id', 'usuario', 'Estado', 'email', 'persona_info', 'ups_count']

    def get_email(self, obj):
        return obj.usuario.email

    def get_ups_count(self, obj):
        return obj.up_set.count()
