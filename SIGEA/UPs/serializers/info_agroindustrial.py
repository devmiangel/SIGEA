from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin
from .info_agricola import ProduccionItemSerializer, get_o_crear_producto, cantidad_repr


class ProduccionAgroindustrialItemSerializer(ProduccionItemSerializer):
    INVIMA = serializers.BooleanField(required=False, allow_null=True, default=False)


class InfoProduccionAgroindustrialSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    ProduccionAgroindustrial = ProduccionAgroindustrialItemSerializer(many=True, required=False)

    def get_ProduccionAgroindustrial(self, obj):
        return [
            {
                'NombreProducto': p.Producto.Producto,
                'Cantidad': cantidad_repr(p.Cantidad),
                'UnidadMedida': p.Producto.Unidad.Unidad if p.Producto and p.Producto.Unidad else None,
                'INVIMA': p.INVIMA
            } for p in obj.produccionupagroindustrial_set.select_related('Producto__Unidad').order_by('id')
        ]

    class Meta:
        model = UP
        fields = ['ProduccionAgroindustrial']

    def to_representation(self, instance):
        return {'ProduccionAgroindustrial': self.get_ProduccionAgroindustrial(instance)}

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import ProduccionUPAgroindustrial

        agro_data = validated_data.pop('ProduccionAgroindustrial', None)

        if agro_data is not None:
            with transaction.atomic():
                instance.produccionupagroindustrial_set.all().delete()
                for item in agro_data:
                    producto_nombre = item.get('NombreProducto')
                    if not producto_nombre:
                        continue
                    unidad_nombre = item.get('Unidad') or item.get('UnidadMedida')
                    ProduccionUPAgroindustrial.objects.create(
                        UP=instance,
                        Producto=get_o_crear_producto(producto_nombre, unidad_nombre),
                        Cantidad=item.get('Cantidad'),
                        INVIMA=bool(item.get('INVIMA')),
                    )
        return instance
