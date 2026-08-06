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

    funcionario_id = serializers.IntegerField(required=False, allow_null=True)
    administrador_id = serializers.IntegerField(required=False, allow_null=True)
    usuario_id = serializers.IntegerField(required=False, allow_null=True)
    tipo_visita_id = serializers.IntegerField(required=False, allow_null=True)
    calificacion_id = serializers.IntegerField(required=False, allow_null=True)
    motivo_id = serializers.IntegerField(required=False, allow_null=True)
    estado_id = serializers.IntegerField(required=False, allow_null=True)
    up_id = serializers.IntegerField(required=False, allow_null=True)
    motivo_admin = serializers.CharField(required=False, allow_blank=True, allow_null=True)
