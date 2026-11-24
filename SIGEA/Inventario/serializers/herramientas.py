from rest_framework import serializers

from ..models import TiposHerramientas, Herramientas, AsignacionHerramientas
from ..validators import normalizar_texto, validar_descripcion


class TiposHerramientasSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposHerramientas
        fields = '__all__'


class HerramientasSerializer(serializers.ModelSerializer):
    TipoHerramientaNombre = serializers.CharField(
        source='TipoHerramienta.TipoHerramienta', read_only=True
    )

    class Meta:
        model = Herramientas
        fields = [
            'id', 'Herramienta', 'TipoHerramienta', 'TipoHerramientaNombre',
            'Descripcion', 'Estado',
        ]
        read_only_fields = ['id']

    def validate_Herramienta(self, value):
        value = normalizar_texto(value)
        if not value:
            raise serializers.ValidationError('El nombre de la herramienta es obligatorio.')
        if len(value) > 255:
            raise serializers.ValidationError(
                'El nombre de la herramienta no puede superar 255 caracteres.'
            )
        return value

    def validate_Descripcion(self, value):
        return validar_descripcion(value)


class AsignacionHerramientasSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignacionHerramientas
        fields = '__all__'
