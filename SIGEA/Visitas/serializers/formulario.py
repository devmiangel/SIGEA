import base64
import binascii

from rest_framework import serializers

ACCIONES_VISITA = [
    ('seg_control', 'Seg. y Control'),
    ('trat_medico', 'Trat. Médico'),
    ('visita', 'Visita'),
    ('insumos', 'Insumos'),
    ('recomendacion', 'Recomendación'),
    ('manejo', 'Manejo'),
    ('cirugia', 'Cirugía'),
]

class InsumoConsumoSerializer(serializers.Serializer):
    inventario_funcionario_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)

class FormularioVisitaTecnicaSerializer(serializers.Serializer):
    fecha_recepcion = serializers.CharField(required=False, allow_blank=True)
    nruea = serializers.CharField(required=False, allow_blank=True)
    nombres_apellidos = serializers.CharField(required=False, allow_blank=True)
    sisben = serializers.CharField(required=False, allow_blank=True)
    documento_identidad = serializers.CharField(required=False, allow_blank=True)
    vereda_sector = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    tipo_visita = serializers.CharField(required=False, allow_blank=True)
    descripcion_solicitud = serializers.CharField(required=False, allow_blank=True)
    diagnostico_presuntivo = serializers.CharField(required=False, allow_blank=True)
    fecha_visita = serializers.CharField()
    funcionario = serializers.CharField(required=False, allow_blank=True)
    cc_funcionario = serializers.CharField(required=False, allow_blank=True)
    acciones = serializers.MultipleChoiceField(choices=ACCIONES_VISITA, required=False)
    hora_inicio = serializers.CharField(required=False, allow_blank=True)
    accion_tomada = serializers.CharField(required=False, allow_blank=True)
    observaciones = serializers.CharField(required=False, allow_blank=True)
    hora_salida = serializers.CharField(required=False, allow_blank=True)
    calificacion = serializers.CharField(required=False, allow_blank=True)
    firmado = serializers.BooleanField(required=False, default=False)
    firma_usuario = serializers.CharField()
    firma_funcionario = serializers.CharField()

    funcionario_id = serializers.IntegerField(required=False, allow_null=True)
    administrador_id = serializers.IntegerField(required=False, allow_null=True)
    usuario_id = serializers.IntegerField(required=False, allow_null=True)
    tipo_visita_id = serializers.IntegerField(required=False, allow_null=True)
    calificacion_id = serializers.IntegerField(required=False, allow_null=True)
    motivo_id = serializers.IntegerField(required=False, allow_null=True)
    estado_id = serializers.IntegerField(required=False, allow_null=True)
    up_id = serializers.IntegerField(required=False, allow_null=True)
    visita_id = serializers.IntegerField(required=False, allow_null=True)
    motivo_admin = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    insumos = InsumoConsumoSerializer(many=True, required=False, default=list)

    def validate(self, attrs):
        acciones = attrs.get('acciones') or []
        insumos = attrs.get('insumos') or []
        if 'insumos' in acciones and not insumos:
            raise serializers.ValidationError({
                'insumos': 'Debe registrar al menos un insumo consumido cuando la acción "Insumos" está marcada.'
            })
        return attrs

    def validar_firma(self, value, nombre):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError(f'{nombre} es requerida.')
        if value.startswith('data:'):
            if ';base64,' not in value:
                raise serializers.ValidationError(f'{nombre} debe ser un data URI base64 válido.')
            value = value.split(';base64,', 1)[1]
        try:
            base64.b64decode(value, validate=True)
        except (binascii.Error, ValueError):
            raise serializers.ValidationError(f'{nombre} contiene un base64 inválido.')
        return value

    def validate_firma_usuario(self, value):
        return self.validar_firma(value, 'La firma del productor')

    def validate_firma_funcionario(self, value):
        return self.validar_firma(value, 'La firma del funcionario')
