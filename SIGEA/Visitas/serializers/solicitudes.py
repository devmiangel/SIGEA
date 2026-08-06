from rest_framework import serializers

from ..models import Solicitudes

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
