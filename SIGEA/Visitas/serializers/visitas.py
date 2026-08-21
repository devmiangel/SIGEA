from rest_framework import serializers

from ..models import Visitas

class VisitasSerializer(serializers.ModelSerializer):
    solicitud_info = serializers.SerializerMethodField()
    funcionario_info = serializers.SerializerMethodField()
    administrador_info = serializers.SerializerMethodField()
    tipo_visita_label = serializers.SerializerMethodField()

    class Meta:
        model = Visitas
        fields = ['id', 'Solicitud', 'Funcionario', 'Administrador', 'TipoVisita', 'FechaYHoraVisita', 'Ubicacion', 'estado', 'Autorizacion', 'FirmaProductor', 'FirmaFuncionario',
                  'solicitud_info', 'funcionario_info', 'administrador_info', 'tipo_visita_label']

    def get_solicitud_info(self, obj):
        persona = getattr(obj.Solicitud.Usuario, 'persona', None)
        up = obj.Solicitud.UP
        return {
            'id': obj.Solicitud.id,
            'motivo': obj.Solicitud.MotivoSolicitud.MotivoSolicitud,
            'observacion': obj.Solicitud.Observacion,
            'direccion': obj.Solicitud.Direccion,
            'fecha_solicitud': obj.Solicitud.FechaSolicitud,
            'estado': getattr(obj.Solicitud.Estado, 'Estado', None),
            'estado_id': obj.Solicitud.Estado_id,
            'up': getattr(getattr(up, 'Predio', None), 'NombrePredio', None),
            'up_id': getattr(up, 'id', None),
            'predio': getattr(getattr(up, 'Predio', None), 'NombrePredio', None),
            'up_estado': getattr(getattr(up, 'idEstado', None), 'Estado', None),
            'solicitante': {
                'usuario_id': obj.Solicitud.Usuario.id,
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
            'documento': persona.numero_documento if persona else None,
        }

    def get_administrador_info(self, obj):
        persona = getattr(obj.Administrador.usuario, 'persona', None)
        return {
            'nombre': f"{persona.primer_nombre} {persona.primer_apellido}".strip() if persona else None,
            'email': obj.Administrador.usuario.email,
        }

    def get_tipo_visita_label(self, obj):
        return obj.TipoVisita.TipoVisita
