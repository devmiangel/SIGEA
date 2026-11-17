from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin


class ArchivoItemSerializer(serializers.Serializer):
    RutaArchivo = serializers.CharField(max_length=255)
    NombreArchivo = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    Descripcion = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)


class InfoAdicionalCaracterizacionSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    Archivos = ArchivoItemSerializer(many=True, required=False)

    class Meta:
        model = UP
        fields = ['FechaActualizacion', 'Archivos']
        read_only_fields = ['FechaActualizacion']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['Archivos'] = [
            {
                'RutaArchivo': a.RutaArchivo,
                'NombreArchivo': a.NombreArchivo,
                'Descripcion': a.Descripcion
            } for a in instance.archivosup_set.order_by('id')
        ]
        return ret

    def validate_Archivos(self, value):
        """Solo se aceptan rutas devueltas por la subida de archivos o que ya
        pertenecen a esta UP. Asi nadie puede enlazar (y luego descargar) un
        archivo de otra UP escribiendo su ruta a mano."""
        from ..models import ArchivosUP
        from ..services.archivos_service import es_ruta_subida

        propias = set()
        if self.instance is not None:
            propias = set(self.instance.archivosup_set.values_list('RutaArchivo', flat=True))

        vistas = set()
        for a in value:
            ruta = a['RutaArchivo'].strip()
            a['RutaArchivo'] = ruta
            if ruta in vistas:
                raise serializers.ValidationError('Hay un archivo repetido en la lista.')
            vistas.add(ruta)
            if ruta in propias:
                continue
            if not es_ruta_subida(ruta):
                raise serializers.ValidationError('Ruta de archivo inválida. Suba el archivo nuevamente.')
            if ArchivosUP.objects.filter(RutaArchivo=ruta).exists():
                raise serializers.ValidationError('El archivo ya pertenece a otra unidad productiva.')
        return value

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import ArchivosUP
        from ..services.archivos_service import borrar_archivo
        from datetime import date

        archivos_data = validated_data.pop('Archivos', None)
        rutas_borradas = []

        with transaction.atomic():
            instance.FechaActualizacion = date.today()
            instance.save(update_fields=['FechaActualizacion'])

            if archivos_data is not None:
                # Se sincroniza por ruta: los existentes se actualizan (conservan
                # su id), los nuevos se crean y los quitados se eliminan.
                existentes = {a.RutaArchivo: a for a in instance.archivosup_set.all()}
                enviados = set()
                for a in archivos_data:
                    ruta = a['RutaArchivo']
                    enviados.add(ruta)
                    nombre = a.get('NombreArchivo') or ''
                    descripcion = a.get('Descripcion') or ''
                    actual = existentes.get(ruta)
                    if actual is None:
                        ArchivosUP.objects.create(
                            UP=instance, RutaArchivo=ruta,
                            NombreArchivo=nombre, Descripcion=descripcion,
                        )
                    elif (actual.NombreArchivo, actual.Descripcion) != (nombre, descripcion):
                        actual.NombreArchivo = nombre
                        actual.Descripcion = descripcion
                        actual.save(update_fields=['NombreArchivo', 'Descripcion'])

                for ruta, archivo in existentes.items():
                    if ruta not in enviados:
                        archivo.delete()
                        rutas_borradas.append(ruta)

                # El archivo fisico se borra solo cuando la transaccion confirma.
                for ruta in rutas_borradas:
                    if ArchivosUP.objects.filter(RutaArchivo=ruta).exists():
                        continue  # otro registro aun lo usa
                    transaction.on_commit(lambda r=ruta: borrar_archivo(r))
        return instance
