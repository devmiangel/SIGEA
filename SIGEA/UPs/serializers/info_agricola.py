from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin, get_o_crear


def cantidad_repr(valor):
    """Decimal -> texto sin ceros sobrantes ('2.500' -> '2.5', '3.000' -> '3')."""
    if valor is None:
        return None
    return format(valor.normalize(), 'f')


class ProduccionItemSerializer(serializers.Serializer):
    """Una fila de produccion (agricola o agroindustrial) del formulario."""
    NombreProducto = serializers.CharField(max_length=255, allow_null=True, required=False)
    Unidad = serializers.CharField(max_length=255, allow_null=True, required=False)
    UnidadMedida = serializers.CharField(max_length=255, allow_null=True, required=False)
    Cantidad = serializers.DecimalField(
        max_digits=12, decimal_places=3, min_value=0, allow_null=True, required=False,
    )


def get_o_crear_producto(nombre, unidad_nombre):
    """Busca el producto del catalogo o lo crea con su unidad.

    La unidad de un producto existente NO se modifica desde la caracterizacion
    de una UP: es un catalogo compartido y cambiarla alteraria la produccion
    ya registrada en las demas UPs. Solo se completa si el producto no tenia.
    """
    from ..models import ProductosUPs, Unidades

    unidad_obj = get_o_crear(Unidades, Unidad=unidad_nombre) if unidad_nombre else None
    producto = ProductosUPs.objects.filter(Producto=nombre).first()
    if producto is None:
        return ProductosUPs.objects.create(Producto=nombre, Unidad=unidad_obj)
    if producto.Unidad_id is None and unidad_obj is not None:
        producto.Unidad = unidad_obj
        producto.save(update_fields=['Unidad'])
    return producto


class InfoProduccionAgricolaSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    ProduccionAgricola = ProduccionItemSerializer(many=True, required=False)

    def get_ProduccionAgricola(self, obj):
        return [
            {
                'NombreProducto': p.Producto.Producto,
                'Cantidad': cantidad_repr(p.Cantidad),
                'UnidadMedida': p.Producto.Unidad.Unidad if p.Producto and p.Producto.Unidad else None
            } for p in obj.produccionupagricola_set.select_related('Producto__Unidad').order_by('id')
        ]

    class Meta:
        model = UP
        fields = ['ProduccionAgricola']

    def to_representation(self, instance):
        return {'ProduccionAgricola': self.get_ProduccionAgricola(instance)}

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import ProduccionUPAgricola

        produccion_data = validated_data.pop('ProduccionAgricola', None)

        if produccion_data is not None:
            with transaction.atomic():
                # Limpiar anteriores
                instance.produccionupagricola_set.all().delete()

                # Crear nuevos
                for item in produccion_data:
                    producto_nombre = item.get('NombreProducto')
                    if not producto_nombre:
                        continue
                    unidad_nombre = item.get('Unidad') or item.get('UnidadMedida')
                    ProduccionUPAgricola.objects.create(
                        UP=instance,
                        Producto=get_o_crear_producto(producto_nombre, unidad_nombre),
                        Cantidad=item.get('Cantidad'),
                    )
        return instance
