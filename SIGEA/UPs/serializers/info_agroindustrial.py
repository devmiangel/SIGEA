from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin, get_o_crear

class InfoProduccionAgroindustrialSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    ProduccionAgroindustrial = serializers.ListField(child=serializers.DictField(), required=False)
    
    def get_ProduccionAgroindustrial(self, obj):
        return [
            {
                'NombreProducto': p.Producto.Producto,
                'Cantidad': p.Cantidad,
                'UnidadMedida': p.Producto.Unidad.Unidad if p.Producto and p.Producto.Unidad else None,
                'INVIMA': p.INVIMA
            } for p in obj.produccionupagroindustrial_set.all()
        ]

    class Meta:
        model = UP
        fields = ['ProduccionAgroindustrial']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['ProduccionAgroindustrial'] = self.get_ProduccionAgroindustrial(instance)
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import ProduccionUPAgroindustrial, ProductosUPs, Unidades

        agro_data = validated_data.pop('ProduccionAgroindustrial', None)
        
        if agro_data is not None:
            with transaction.atomic():
                instance.produccionupagroindustrial_set.all().delete()
                for item in agro_data:
                    producto_nombre = item.get('NombreProducto')
                    cantidad = item.get('Cantidad')
                    unidad_nombre = item.get('Unidad')
                    
                    if not producto_nombre:
                        continue
                    
                    unidad_obj = None
                    if unidad_nombre:
                        unidad_obj = get_o_crear(Unidades, Unidad=unidad_nombre)
                    
                    producto_obj = ProductosUPs.objects.filter(Producto=producto_nombre).first()
                    if producto_obj is None:
                        producto_obj = ProductosUPs.objects.create(
                            Producto=producto_nombre, Unidad=unidad_obj
                        )
                    if unidad_obj:
                        producto_obj.Unidad = unidad_obj
                        producto_obj.save()
                    
                    ProduccionUPAgroindustrial.objects.create(
                        UP=instance,
                        Producto=producto_obj,
                        Cantidad=cantidad,
                        INVIMA=item.get('INVIMA', False)
                    )
        return instance
