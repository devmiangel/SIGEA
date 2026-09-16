import base64
import binascii
import unicodedata

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


SERVICIO_MAQUINARIA = 'Maquinaria Agrícola'
SERVICIO_INSEMINACION = 'Inseminación Artificial'


class FormularioReciboPagoSerializer(serializers.Serializer):
    servicio_pago = serializers.CharField(required=False, allow_blank=True)
    servicio_pago_id = serializers.IntegerField(required=False, allow_null=True)
    apero_id = serializers.IntegerField(required=False, allow_null=True)
    numero_horas = serializers.IntegerField(required=False, allow_null=True, min_value=1)
    pajilla_id = serializers.IntegerField(required=False, allow_null=True)
    numero_pajillas = serializers.IntegerField(required=False, allow_null=True, min_value=1)
    toro = serializers.BooleanField(required=False, allow_null=True)
    valor_total = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    firma_usuario = serializers.CharField()
    firma_funcionario = serializers.CharField()
    visita_id = serializers.IntegerField(required=False, allow_null=True)

    def _normalizar_servicio(self, valor):
        return unicodedata.normalize('NFD', (valor or '')).encode('ascii', 'ignore').decode('ascii').strip().lower()

    def _es_maquinaria(self, attrs):
        if attrs.get('servicio_pago_id'):
            return attrs['servicio_pago_id'] == 1
        nombre = self._normalizar_servicio(attrs.get('servicio_pago'))
        return nombre in ('maquinaria agricola', 'maquinaria')

    def _es_inseminacion(self, attrs):
        if attrs.get('servicio_pago_id'):
            return attrs['servicio_pago_id'] == 2
        nombre = self._normalizar_servicio(attrs.get('servicio_pago'))
        return nombre in ('inseminacion artificial', 'inseminacion')

    def validate(self, attrs):
        es_maquinaria = self._es_maquinaria(attrs)
        es_inseminacion = self._es_inseminacion(attrs)

        if not es_maquinaria and not es_inseminacion:
            raise serializers.ValidationError({
                'servicio_pago': 'Debe seleccionar un servicio a pagar (Maquinaria Agrícola o Inseminación Artificial).'
            })

        errores = {}
        if es_maquinaria:
            if not attrs.get('apero_id'):
                errores['apero_id'] = 'Debe seleccionar un apero o implemento.'
            if not attrs.get('numero_horas'):
                errores['numero_horas'] = 'Debe indicar el número de horas.'
        else:
            if not attrs.get('pajilla_id'):
                errores['pajilla_id'] = 'Debe seleccionar una pajilla.'
            if not attrs.get('numero_pajillas'):
                errores['numero_pajillas'] = 'Debe indicar el número de pajillas.'
            if attrs.get('toro') is None:
                errores['toro'] = 'Debe indicar si incluye toro.'
            if attrs.get('valor_total') is None:
                errores['valor_total'] = 'Debe indicar el valor total.'

        if errores:
            raise serializers.ValidationError(errores)

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
