from rest_framework import serializers

from ..models import UP

class UPSerializer(serializers.ModelSerializer):
    estado_label = serializers.CharField(source='idEstado.Estado', read_only=True, default=None)
    tipo_up_label = serializers.CharField(source='TipoUP.TipoUP', read_only=True)
    nombre_predio = serializers.CharField(source='Predio.NombrePredio', read_only=True)
    direccion = serializers.CharField(source='Predio.Direccion', read_only=True, default='')
    productor_nombre = serializers.SerializerMethodField()
    tiene_qr = serializers.SerializerMethodField()
    validado_por_nombre = serializers.SerializerMethodField()

    class Meta:
        model = UP
        fields = '__all__'
        # El estado y el rastro de validacion solo cambian por validar_ups;
        # el RUEA y el QR los genera el sistema.
        read_only_fields = [
            'idEstado', 'MotivoRechazo', 'ValidadoPor', 'FechaValidacion', 'CodigoQR',
        ]

    def get_validado_por_nombre(self, obj):
        admin = obj.ValidadoPor
        if admin is None:
            return None
        persona = getattr(admin.usuario, 'persona', None)
        if persona is None:
            return admin.usuario.email
        return ' '.join(filter(None, [persona.primer_nombre, persona.primer_apellido])) or admin.usuario.email

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

    def get_tiene_qr(self, obj):
        return bool(obj.CodigoQR)
