from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin

class InfoAdicionalCaracterizacionSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    Archivos = serializers.ListField(child=serializers.DictField(), required=False)

    class Meta:
        model = UP
        fields = ['FechaActualizacion', 'Archivos']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['Archivos'] = [
            {
                'RutaArchivo': a.RutaArchivo,
                'NombreArchivo': a.NombreArchivo,
                'Descripcion': a.Descripcion
            } for a in instance.archivosup_set.all()
        ]
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import ArchivosUP
        from datetime import date

        archivos_data = validated_data.pop('Archivos', None)

        with transaction.atomic():
            instance.FechaActualizacion = date.today()
            instance.save()

            if archivos_data is not None:
                instance.archivosup_set.all().delete()
                for a in archivos_data:
                    ArchivosUP.objects.create(
                        UP=instance,
                        RutaArchivo=a.get('RutaArchivo', ''),
                        NombreArchivo=a.get('NombreArchivo', ''),
                        Descripcion=a.get('Descripcion', '')
                    )
        return instance
