from rest_framework import serializers
from .models import MotivosSolicitudes,Estados,Solicitudes,TiposVisitas,Visitas,InsumoVisita,Calificaciones,InfoVisita

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

class MotivosSolicitudesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivosSolicitudes
        fields = '__all__'

class EstadosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estados
        fields = '__all__'

class SolicitudesSerializer(serializers.ModelSerializer):
    solicitante = serializers.SerializerMethodField()

    class Meta:
        model = Solicitudes
        fields = ['id', 'UP', 'FechaSolicitud', 'MotivoSolicitud', 'Observacion', 'Estado', 'Usuario', 'solicitante']

    def get_solicitante(self, obj):
        persona = getattr(obj.Usuario, 'persona', None)
        return {
            'email': obj.Usuario.email,
            'primer_nombre': persona.primer_nombre if persona else None,
            'primer_apellido': persona.primer_apellido if persona else None,
        }

class TiposVisitasSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposVisitas
        fields = '__all__'

class VisitasSerializer(serializers.ModelSerializer):
    solicitud_info = serializers.SerializerMethodField()
    funcionario_info = serializers.SerializerMethodField()
    administrador_info = serializers.SerializerMethodField()
    tipo_visita_label = serializers.SerializerMethodField()

    class Meta:
        model = Visitas
        fields = ['id', 'Solicitud', 'Funcionario', 'Administrador', 'TipoVisita', 'FechaYHoraVisita', 'Ubicacion', 'RutaDocumento', 'estado',
                  'solicitud_info', 'funcionario_info', 'administrador_info', 'tipo_visita_label']

    def get_solicitud_info(self, obj):
        persona = getattr(obj.Solicitud.Usuario, 'persona', None)
        return {
            'id': obj.Solicitud.id,
            'motivo': obj.Solicitud.MotivoSolicitud.MotivoSolicitud,
            'observacion': obj.Solicitud.Observacion,
            'solicitante': {
                'email': obj.Solicitud.Usuario.email,
                'primer_nombre': persona.primer_nombre if persona else None,
                'primer_apellido': persona.primer_apellido if persona else None,
            },
        }

    def get_funcionario_info(self, obj):
        persona = getattr(obj.Funcionario.usuario, 'persona', None)
        return {
            'nombre': f"{persona.primer_nombre} {persona.primer_apellido}".strip() if persona else None,
            'email': obj.Funcionario.usuario.email,
        }

    def get_administrador_info(self, obj):
        persona = getattr(obj.Administrador.usuario, 'persona', None)
        return {
            'nombre': f"{persona.primer_nombre} {persona.primer_apellido}".strip() if persona else None,
            'email': obj.Administrador.usuario.email,
        }

    def get_tipo_visita_label(self, obj):
        return obj.TipoVisita.TipoVisita

class InsumoVisitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsumoVisita
        fields = '__all__'

class CalificacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificaciones
        fields = '__all__'

class InfoVisitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfoVisita
        fields = '__all__'

