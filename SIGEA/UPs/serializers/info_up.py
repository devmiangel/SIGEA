from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin, get_o_crear

class InfoUPCaracterizacionSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    
    TipoUP_Nombre = serializers.CharField(source='TipoUP.TipoUP', required=False, allow_null=True)
    ActividadUP = serializers.CharField(required=False, allow_null=True)
    RUEA = serializers.CharField(required=False, allow_null=True)
    NumeroEmpleados = serializers.IntegerField(required=False, allow_null=True)
    Asociatividad = serializers.BooleanField(required=False, allow_null=True)
    AreaCultivada = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    AreaPastos = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    NumeroPotreros = serializers.IntegerField(required=False, allow_null=True)
    NumeroInvernaderos = serializers.IntegerField(required=False, allow_null=True)
    NumeroTanques = serializers.IntegerField(required=False, allow_null=True)
    NumeroReservorios = serializers.IntegerField(required=False, allow_null=True)
    FuentesAgua = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        model = UP
        fields = [
             'TipoUP_Nombre', 'ActividadUP', 'NumeroEmpleados', 'Asociatividad',
             'AreaCultivada', 'AreaPastos', 'NumeroPotreros', 'NumeroInvernaderos',
             'NumeroTanques', 'NumeroReservorios', 'FuentesAgua', 'RUEA'
        ]

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
            if tipo_up_str:
                tipo_obj = TipoUP.objects.filter(TipoUP=tipo_up_str).first()
                if tipo_obj:
                    instance.TipoUP = tipo_obj
                    instance.save()

            # Actualizar RUEA (si se envía, se asigna)
            if ruea_str:
                instance.RUEA = ruea_str
                instance.save()

            # Obtener o crear detalle
            default_actividad = ActividadUP.objects.first()
            detalle, created = DetalleUP.objects.get_or_create(
                UP=instance,
                defaults={'NumeroEmpleados': None, 'AreaCultivada': None, 'AreaPastos': None,
                         'NumeroPotreros': None, 'NumeroInvernaderos': None, 'NumeroTanques': None,
                         'NumeroReservorios': None, 'Actividad': default_actividad}
            )
            
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
