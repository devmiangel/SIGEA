from rest_framework import serializers

from ..models import Usuario
from .personas import PersonaBasicaSerializer


def rol_de_usuario(usuario):
    """Rol de un usuario. La prioridad es Administradores > Funcionarios > Productores > Usuarios.

    Sin consultas extra cuando el queryset trae select_related de las tablas de rol
    y prefetch_related('groups') (ver UsuarioViewSet): `groups.all()` usa el prefetch.
    """
    if hasattr(usuario, 'administradores'):
        return 'Administradores'
    if hasattr(usuario, 'funcionarios'):
        return 'Funcionarios'
    if hasattr(usuario, 'productores'):
        return 'Productores'
    if any(grupo.name == 'Usuarios' for grupo in usuario.groups.all()):
        return 'Usuarios'
    return None


class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    persona_info = PersonaBasicaSerializer(source='persona', read_only=True)
    es_conductor = serializers.SerializerMethodField()
    licencia = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'password', 'persona', 'persona_info', 'Estado', 'rol', 'es_conductor', 'licencia']
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}}
        }

    def get_rol(self, obj):
        return rol_de_usuario(obj)

    def _conductor(self, obj):
        """Registro de conductor activo del funcionario (o None).

        Usa `conductores_activos` si el queryset lo precargó (UsuarioViewSet); si no,
        lo consulta. El resultado se guarda en el serializer (vive solo durante esta
        respuesta) para que es_conductor y licencia no repitan la consulta.
        """
        cache = self.__dict__.setdefault('_conductores_por_usuario', {})
        if obj.pk in cache:
            return cache[obj.pk]
        funcionario = getattr(obj, 'funcionarios', None)
        if funcionario is None:
            conductor = None
        elif hasattr(funcionario, 'conductores_activos'):
            conductor = funcionario.conductores_activos[0] if funcionario.conductores_activos else None
        else:
            from Inventario.models import Conductores
            conductor = Conductores.objects.filter(Funcionario=funcionario, Estado=True).first()
        cache[obj.pk] = conductor
        return conductor

    def get_es_conductor(self, obj):
        return self._conductor(obj) is not None

    def get_licencia(self, obj):
        conductor = self._conductor(obj)
        return conductor.Licencia if conductor else None

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

    def validate_password(self, value):
        # Reglas de construcción (registro y cambio de clave): longitud mínima, no solo
        # números, no común y sin información personal. Cada error se devuelve con un
        # mensaje que le explica al usuario qué le falta (ver Usuarios/password_rules.py).
        from ..models import Personas
        from ..password_rules import errores_password

        datos = getattr(self, 'initial_data', None) or {}
        email = datos.get('email') or getattr(self.instance, 'email', '')

        persona = getattr(self.instance, 'persona', None)
        persona_id = datos.get('persona')
        if persona is None and persona_id and not isinstance(persona_id, dict):
            persona = Personas.objects.filter(pk=persona_id).first()

        usuario = self.instance or Usuario(email=email)
        mensajes = errores_password(value, user=usuario, persona=persona, email=email)
        if mensajes:
            raise serializers.ValidationError(mensajes)
        return value

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
        return {
            'id': instance.id,
            'email': instance.email,
            'rol': rol_de_usuario(instance),
        }
