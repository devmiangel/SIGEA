from rest_framework import serializers

from ..models import UP

class InfoProduccionAgricolaSerializer(serializers.ModelSerializer):
    ProduccionAgricola = serializers.ListField(
        child=serializers.DictField(), required=False
    )
    
    def get_ProduccionAgricola(self, obj):
        return [
            {
                'NombreProducto': p.Producto.Producto,
                'Cantidad': p.Cantidad,
                'UnidadMedida': p.Producto.Unidad.Unidad if p.Producto and p.Producto.Unidad else None
            } for p in obj.produccionupagricola_set.all()
        ]

    class Meta:
        model = UP
        fields = ['ProduccionAgricola']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['ProduccionAgricola'] = self.get_ProduccionAgricola(instance)
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import ProduccionUPAgricola, ProductosUPs, Unidades

        produccion_data = validated_data.pop('ProduccionAgricola', None)
        
        if produccion_data is not None:
            with transaction.atomic():
                # Limpiar anteriores
                instance.produccionupagricola_set.all().delete()
                
                # Crear nuevos
                for item in produccion_data:
                    producto_nombre = item.get('NombreProducto')
                    cantidad = item.get('Cantidad')
                    unidad_nombre = item.get('Unidad')
                    
                    if not producto_nombre:
                        continue
                    
                    # Crear la unidad si no existe
                    unidad_obj = None
                    if unidad_nombre:
                        unidad_obj, _ = Unidades.objects.get_or_create(Unidad=unidad_nombre)
                    
                    # Crear el producto si no existe, ligado a su unidad
                    producto_obj, _ = ProductosUPs.objects.get_or_create(
                        Producto=producto_nombre,
                        defaults={'Unidad': unidad_obj},
                    )
                    if unidad_obj:
                        producto_obj.Unidad = unidad_obj
                        producto_obj.save()
                    
                    ProduccionUPAgricola.objects.create(
                        UP=instance,
                        Producto=producto_obj,
                        Cantidad=cantidad
                    )
        return instance
