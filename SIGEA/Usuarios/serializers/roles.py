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

    def to_representation(self, instance):
        # El estado mostrado combina el del productor y el de su usuario: la
        # inactividad fijada desde el formulario de usuarios también cuenta.
        data = super().to_representation(instance)
        data['Estado'] = bool(instance.Estado and instance.usuario.Estado)
        return data

    def get_ups_count(self, obj):
        return obj.up_set.count()
