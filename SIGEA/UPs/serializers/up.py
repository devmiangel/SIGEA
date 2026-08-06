from rest_framework import serializers

from ..models import UP

class UPSerializer(serializers.ModelSerializer):
    estado_label = serializers.CharField(source='idEstado.Estado', read_only=True, default=None)
    tipo_up_label = serializers.CharField(source='TipoUP.TipoUP', read_only=True)
    nombre_predio = serializers.CharField(source='Predio.NombrePredio', read_only=True)
    productor_nombre = serializers.SerializerMethodField()

    class Meta:
        model = UP
        fields = '__all__'

    def get_productor_nombre(self, obj):
        persona = obj.Productor.usuario.persona
        if not persona:
            return None
        return ' '.join(filter(None, [
            persona.primer_nombre,
            persona.segundo_nombre,
            persona.primer_apellido,
            persona.segundo_apellido,
        ])) or None
