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

# Calificaciones que ofrece el formulario (SeccionFirmas.jsx). Se guardan con
# la etiqueta como nombre del catalogo Calificaciones.
CALIFICACIONES_VISITA = {
    'malo': 'Malo',
    'regular': 'Regular',
    'bueno': 'Bueno',
    'excelente': 'Excelente',
}


def normalizar_texto(valor):
    """'Inseminación Artificial ' -> 'inseminacion artificial'."""
    return unicodedata.normalize('NFD', (valor or '')).encode('ascii', 'ignore').decode('ascii').strip().lower()


def _validar_hora(valor, nombre):
    """'HH:MM' -> datetime.time, o None si viene vacio."""
    from datetime import datetime
    valor = (valor or '').strip()
    if not valor:
        return None
    for formato in ('%H:%M', '%H:%M:%S'):
        try:
            return datetime.strptime(valor, formato).time()
        except ValueError:
            continue
    raise serializers.ValidationError({nombre: 'Hora inválida, use el formato HH:MM.'})


class InsumoConsumoSerializer(serializers.Serializer):
    inventario_funcionario_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)

class FormularioVisitaTecnicaSerializer(serializers.Serializer):
    fecha_recepcion = serializers.CharField(required=False, allow_blank=True)
    nruea = serializers.CharField(required=False, allow_blank=True)
    nombres_apellidos = serializers.CharField(required=False, allow_blank=True)
    sisben = serializers.CharField(required=False, allow_blank=True)
    documento_identidad = serializers.CharField(required=False, allow_blank=True)
    vereda_sector = serializers.CharField(required=False, allow_blank=True, max_length=255)
    telefono = serializers.CharField(required=False, allow_blank=True)
    tipo_visita = serializers.CharField(required=False, allow_blank=True, max_length=255)
    descripcion_solicitud = serializers.CharField(required=False, allow_blank=True)
    diagnostico_presuntivo = serializers.CharField(required=False, allow_blank=True, max_length=255)
    fecha_visita = serializers.CharField()
    funcionario = serializers.CharField(required=False, allow_blank=True)
    cc_funcionario = serializers.CharField(required=False, allow_blank=True)
    acciones = serializers.MultipleChoiceField(choices=ACCIONES_VISITA, required=False)
    hora_inicio = serializers.CharField(required=False, allow_blank=True)
    accion_tomada = serializers.CharField(required=False, allow_blank=True, max_length=255)
    observaciones = serializers.CharField(required=False, allow_blank=True)
    hora_salida = serializers.CharField(required=False, allow_blank=True)
    calificacion = serializers.CharField(required=False, allow_blank=True, max_length=255)
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

        ids = [i['inventario_funcionario_id'] for i in insumos]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError({'insumos': 'Hay insumos repetidos en la lista.'})

        inicio = _validar_hora(attrs.get('hora_inicio'), 'hora_inicio')
        salida = _validar_hora(attrs.get('hora_salida'), 'hora_salida')
        if inicio and salida and salida < inicio:
            raise serializers.ValidationError({
                'hora_salida': 'La hora de salida no puede ser anterior a la hora de inicio.'
            })

        calificacion = attrs.get('calificacion')
        if calificacion and normalizar_texto(calificacion) not in CALIFICACIONES_VISITA:
            raise serializers.ValidationError({
                'calificacion': 'Calificación inválida (malo, regular, bueno o excelente).'
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
    # El valor total lo calcula el servidor (horas x valor hora / pajillas x
    # valor pajilla); si el cliente lo envia se ignora.
    valor_total = serializers.IntegerField(required=False, allow_null=True)
    firma_usuario = serializers.CharField()
    firma_funcionario = serializers.CharField()
    visita_id = serializers.IntegerField(required=False, allow_null=True)

    def _resolver_servicio(self, attrs):
        """Devuelve el ServicioPago (por id o por nombre) o None."""
        from ..models import ServiciosPagos
        if attrs.get('servicio_pago_id'):
            return ServiciosPagos.objects.filter(id=attrs['servicio_pago_id']).first()
        nombre = normalizar_texto(attrs.get('servicio_pago'))
        if not nombre:
            return None
        for servicio in ServiciosPagos.objects.all():
            if normalizar_texto(servicio.ServicioPago) == nombre:
                return servicio
        return None

    def validate(self, attrs):
        # El tipo de servicio se decide por su NOMBRE (sin tildes), igual que
        # en la vista; nunca por ids fijos.
        servicio = self._resolver_servicio(attrs)
        nombre = normalizar_texto(servicio.ServicioPago) if servicio else ''
        es_maquinaria = 'maquinaria' in nombre
        es_inseminacion = 'inseminacion' in nombre

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

        if errores:
            raise serializers.ValidationError(errores)

        attrs['servicio'] = servicio
        attrs['es_maquinaria'] = es_maquinaria
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
