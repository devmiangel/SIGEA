from rest_framework import serializers

from ..models import Insumos, InventarioFuncionario, CardexInsumoFuncionario, SolicitudInsumo

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

class SolicitudInsumoSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.SerializerMethodField()
    insumo_unidades = serializers.CharField(source='Insumo.Unidades.Unidad', read_only=True, allow_null=True)
    funcionario_nombre = serializers.SerializerMethodField()
    funcionario_email = serializers.SerializerMethodField()

    class Meta:
        model = SolicitudInsumo
        fields = ['id', 'Insumo', 'Funcionario', 'Cantidad', 'FechaSolicitud', 'Estado', 'Observacion', 'insumo_nombre', 'insumo_unidades', 'funcionario_nombre', 'funcionario_email']

    def get_insumo_nombre(self, obj):
        return getattr(obj.Insumo, 'Nombre', None)

    def get_funcionario_nombre(self, obj):
        persona = getattr(obj.Funcionario, 'usuario', None)
        if persona is None:
            return None
        datos = getattr(persona, 'persona', None)
        if datos is None:
            return persona.email
        return f"{datos.primer_nombre or ''} {datos.primer_apellido or ''}".strip() or persona.email

    def get_funcionario_email(self, obj):
        usuario = getattr(obj.Funcionario, 'usuario', None)
        return usuario.email if usuario else None
