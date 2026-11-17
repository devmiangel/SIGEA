from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin, get_o_crear

class InfoUPCaracterizacionSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    
    TipoUP_Nombre = serializers.CharField(source='TipoUP.TipoUP', required=False, allow_null=True)
    ActividadUP = serializers.CharField(required=False, allow_null=True)
    RUEA = serializers.CharField(required=False, allow_null=True, max_length=20)
    NumeroEmpleados = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    Asociatividad = serializers.BooleanField(required=False, allow_null=True)
    AreaCultivada = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True, min_value=0)
    AreaPastos = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True, min_value=0)
    NumeroPotreros = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    NumeroInvernaderos = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    NumeroTanques = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    NumeroReservorios = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    FuentesAgua = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        model = UP
        fields = [
             'TipoUP_Nombre', 'ActividadUP', 'NumeroEmpleados', 'Asociatividad',
             'AreaCultivada', 'AreaPastos', 'NumeroPotreros', 'NumeroInvernaderos',
             'NumeroTanques', 'NumeroReservorios', 'FuentesAgua', 'RUEA'
        ]

    def validate_TipoUP_Nombre(self, value):
        from ..models import TipoUP
        if value and not TipoUP.objects.filter(TipoUP=value).exists():
            raise serializers.ValidationError('El tipo de UP indicado no existe.')
        return value

    def validate_RUEA(self, value):
        if not value:
            return value
        value = value.strip()
        otras = UP.objects.filter(RUEA__iexact=value)
        if self.instance is not None:
            otras = otras.exclude(pk=self.instance.pk)
        if otras.exists():
            raise serializers.ValidationError('Este RUEA ya está asignado a otra UP.')
        return value

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['RUEA'] = instance.RUEA
        detalle = instance.detalleup_set.first()
        if detalle:
            ret['ActividadUP'] = detalle.Actividad.Actividad if detalle.Actividad else None
            ret['NumeroEmpleados'] = detalle.NumeroEmpleados
            ret['Asociatividad'] = detalle.Asociatividad
            ret['AreaCultivada'] = str(detalle.AreaCultivada) if detalle.AreaCultivada else None
            ret['AreaPastos'] = str(detalle.AreaPastos) if detalle.AreaPastos else None
            ret['NumeroPotreros'] = detalle.NumeroPotreros
            ret['NumeroInvernaderos'] = detalle.NumeroInvernaderos
            ret['NumeroTanques'] = detalle.NumeroTanques
            ret['NumeroReservorios'] = detalle.NumeroReservorios
            ret['FuentesAgua'] = detalle.FuentesAgua
        else:
            ret['ActividadUP'] = None
            ret['NumeroEmpleados'] = None
            ret['Asociatividad'] = False
            ret['AreaCultivada'] = None
            ret['AreaPastos'] = None
            ret['NumeroPotreros'] = None
            ret['NumeroInvernaderos'] = None
            ret['NumeroTanques'] = None
            ret['NumeroReservorios'] = None
            ret['FuentesAgua'] = False
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import TipoUP, ActividadUP, DetalleUP
        from datetime import date

        tipo_up_str = validated_data.pop('TipoUP', {}).get('TipoUP', None)
        actividad_str = validated_data.pop('ActividadUP', None)
        ruea_str = validated_data.pop('RUEA', None)
        
        with transaction.atomic():
            # Actualizar TipoUP si se envía
            # (validate_TipoUP_Nombre ya garantiza que existe)
            if tipo_up_str:
                instance.TipoUP = TipoUP.objects.filter(TipoUP=tipo_up_str).first()
                instance.save()

            # Actualizar RUEA (si se envía, se asigna)
            if ruea_str:
                instance.RUEA = ruea_str
                instance.save()

            # Obtener o crear detalle
            default_actividad = ActividadUP.objects.first()
            # filter().first() en lugar de get_or_create: tolera detalles duplicados
            detalle = DetalleUP.objects.filter(UP=instance).order_by('id').first()
            if detalle is None:
                detalle = DetalleUP.objects.create(UP=instance, Actividad=default_actividad)
            
            # Actualizar Actividad (se crea si no existe)
            if actividad_str:
                act_obj = get_o_crear(ActividadUP, Actividad=actividad_str)
                detalle.Actividad = act_obj

            # Actualizar resto de campos del detalle
            for attr, value in validated_data.items():
                if hasattr(detalle, attr):
                    if attr in ('Asociatividad', 'FuentesAgua') and value is None:
                        value = False
                    setattr(detalle, attr, value)
            
            detalle.FechaActualizacion = date.today()
            detalle.save()

        return instance
