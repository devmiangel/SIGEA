from rest_framework import serializers

from ..models import Usuario
from .personas import PersonaBasicaSerializer

class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    persona_info = PersonaBasicaSerializer(source='persona', read_only=True)
    
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'password', 'persona', 'persona_info', 'Estado', 'rol']
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}}
        }

    def get_rol(self, obj):
        if hasattr(obj, 'administradores'):
            return 'Administradores'
        elif hasattr(obj, 'funcionarios'):
            return 'Funcionarios'
        elif hasattr(obj, 'productores'):
            return 'Productores'
        elif obj.groups.filter(name='Usuarios').exists():
            return 'Usuarios'
        return None

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def validate_persona(self, value):
        if not value:
            raise serializers.ValidationError(
                "El usuario debe estar asociado a una persona"
            )
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    #retorna el frupo al hacer login para mostrar el rol del usuario
    def to_representation(self, instance):
        usuario = instance
        rol = None
        
        if hasattr(usuario, 'administradores'):
            rol = 'Administradores'
        elif hasattr(usuario, 'funcionarios'):
            rol = 'Funcionarios'
        elif hasattr(usuario, 'productores'):
            rol = 'Productores'
        elif usuario.groups.filter(name='Usuarios').exists():
            rol = 'Usuarios'
        
        return {
            'id': usuario.id,
            'email': usuario.email,
            'rol': rol
        }
