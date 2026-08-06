from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin, get_o_crear

class InfoProduccionAnimalSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    Animales = serializers.ListField(child=serializers.DictField(), required=False)

    def get_Animales(self, obj):
        result = []
        for a in obj.animales_set.all():
            grupo = a.GrupoAnimal.GrupoAnimal
            data = {
                'GrupoAnimal': grupo,
                'CantidadTotal': a.Cantidad,
                'Detalles': None
            }
            raza = a.razas_set.first()

            # Buscar el detalle específico según la especie
            if grupo == 'Bovinos':
                d = raza.detallebovinos_set.first() if raza else None
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'Proposito': str(d.Proposito),
                        'Machos': d.NumeroMachos, 'Hembras': d.NumeroHembras, 'RUV': d.RUV
                    }
            elif grupo == 'Aves':
                d = raza.detalleaves_set.first() if raza else None
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'TipoAve': str(d.TipoAve), 'Cantidad': d.Cantidad
                    }
            elif grupo == 'Porcinos':
                d = raza.detalleporcinos_set.first() if raza else None
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'Proposito': str(d.Proposito), 'Chapeta': d.Chapeta
                    }
            elif grupo in ['Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies']:
                accessor = f'detalle{grupo.lower()}_set'
                d = getattr(raza, accessor, None) if raza else None
                if d:
                    d = d.first()
                    if d:
                        data['Detalles'] = { 'Raza': str(d.Raza), 'Proposito': str(d.Proposito) }
            elif grupo == 'Peces':
                d = raza.detallepeces_set.first() if raza else None
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'Estanques': d.NumeroEstanques
                    }
            elif grupo == 'Abejas':
                d = raza.detalleapicolas_set.first() if raza else None
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'ProductosApicolas': str(d.ProductosApicolas)
                    }

            result.append(data)
        return result

    class Meta:
        model = UP
        fields = ['Animales']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['Animales'] = self.get_Animales(instance)
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import (
            Animales, GrupoAnimal, Razas, Propositos, TiposAves, ProductosApicolas,
            DetalleBovinos, DetalleAves, DetallePorcinos, DetalleEquinos, 
            DetalleCaprinos, DetalleOvinos, DetalleConejos, DetalleCuries, 
            DetallePeces, DetalleApicolas
        )

        animales_data = validated_data.pop('Animales', None)
        
        if animales_data is not None:
            with transaction.atomic():
                instance.animales_set.all().delete()
                
                for item in animales_data:
                    grupo_nombre = item.get('GrupoAnimal')
                    cantidad_total = item.get('CantidadTotal', 0)
                    detalles = item.get('Detalles')
                    
                    if not grupo_nombre:
                        continue
                    
                    grupo_obj = get_o_crear(GrupoAnimal, GrupoAnimal=grupo_nombre)
                    
                    animal = Animales.objects.create(UP=instance, GrupoAnimal=grupo_obj, Cantidad=cantidad_total)
                    
                    if detalles:
                        raza_nombre = detalles.get('Raza')
                        raza_obj = None
                        if raza_nombre:
                            raza_obj = Razas.objects.filter(Raza=raza_nombre).first()
                            if not raza_obj:
                                raza_obj = Razas.objects.create(Raza=raza_nombre, Animal=animal)
                        
                        if grupo_nombre == 'Bovinos':
                            prop = get_o_crear(Propositos, Proposito=detalles.get('Proposito')) if detalles.get('Proposito') else None
                            DetalleBovinos.objects.create(
                                Raza=raza_obj, Proposito=prop,
                                NumeroMachos=detalles.get('Machos', 0),
                                NumeroHembras=detalles.get('Hembras', 0), RUV=detalles.get('RUV', '')
                            )
                        elif grupo_nombre == 'Aves':
                            tipo_ave = get_o_crear(TiposAves, TipoAve=detalles.get('TipoAve')) if detalles.get('TipoAve') else None
                            DetalleAves.objects.create(Raza=raza_obj, TipoAve=tipo_ave, Cantidad=detalles.get('Cantidad', 0))
                        elif grupo_nombre == 'Porcinos':
                            prop = get_o_crear(Propositos, Proposito=detalles.get('Proposito')) if detalles.get('Proposito') else None
                            DetallePorcinos.objects.create(Raza=raza_obj, Proposito=prop, Chapeta=detalles.get('Chapeta', False))
                        elif grupo_nombre in ['Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies']:
                            prop = get_o_crear(Propositos, Proposito=detalles.get('Proposito')) if detalles.get('Proposito') else None
                            model_map = {
                                'Equinos': DetalleEquinos, 'Caprinos': DetalleCaprinos, 
                                'Ovinos': DetalleOvinos, 'Conejos': DetalleConejos, 'Curies': DetalleCuries
                            }
                            model_map[grupo_nombre].objects.create(Raza=raza_obj, Proposito=prop)
                        elif grupo_nombre == 'Peces':
                            DetallePeces.objects.create(Raza=raza_obj, NumeroEstanques=detalles.get('Estanques', 0))
                        elif grupo_nombre == 'Abejas':
                            prod_api = get_o_crear(ProductosApicolas, ProductoApicolas=detalles.get('ProductosApicolas')) if detalles.get('ProductosApicolas') else None
                            DetalleApicolas.objects.create(Raza=raza_obj, ProductosApicolas=prod_api)
        return instance
