from rest_framework import serializers
from .models import Usuario,TiposDocumentos,TiposContactos,TiposNivelesEducativos,Sisben,Empresas,Contactos,Personas,Funcionarios,Administradores,Productores
from datetime import date

class TiposDocumentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposDocumentos
        fields = '__all__'

class TiposContactosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposContactos
        fields = '__all__'

class TiposNivelesEducativosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposNivelesEducativos
        fields = '__all__'

class SisbenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sisben
        fields = '__all__'

class EmpresasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresas
        fields = '__all__'

class ContactosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contactos
        fields = '__all__'

class PersonasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personas
        fields = '__all__'
    def validate(self, data):
        primer_nombre = data.get('primer_nombre')
        primer_apellido = data.get('primer_apellido')
        
        if primer_nombre and primer_apellido and primer_nombre == primer_apellido:
            raise serializers.ValidationError("El primer nombre no puede ser igual al primer apellido")
        
        fecha_nacimiento = data.get('fecha_nacimiento')
        if fecha_nacimiento and fecha_nacimiento >= date.today():
            raise serializers.ValidationError("La fecha de nacimiento no puede ser mayor o igual a la fecha actual")
        
        return data

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'password', 'persona', 'rol']
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}}
        }

    rol = serializers.SerializerMethodField()

    def get_rol(self, obj):

        if Administradores.objects.filter(usuario=obj).exists():
            return "Administrador"

        if Funcionarios.objects.filter(usuario=obj).exists():
            return "Funcionario"

        if Productores.objects.filter(usuario=obj).exists():
            return "Productor"

        return None

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user

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
    
    def validate(self, data):
        if self.instance:
            usuario = self.instance
            roles_count = sum([
                Administradores.objects.filter(usuario=usuario).exists(),
                Funcionarios.objects.filter(usuario=usuario).exists(),
                Productores.objects.filter(usuario=usuario).exists()
            ])
            
            if roles_count > 1:
                raise serializers.ValidationError(
                    "Este usuario ya tiene un rol asignado"
                )

        return data

class FuncionariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcionarios
        fields = '__all__'

class AdministradoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administradores
        fields = '__all__'

class ProductoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Productores
        fields = '__all__'

