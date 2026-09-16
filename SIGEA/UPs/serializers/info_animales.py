from rest_framework import serializers
from django.db import models

from ..models import UP
from ..models import (
    DetalleBovinos, DetalleAves, DetallePorcinos, DetalleEquinos,
    DetalleCaprinos, DetalleOvinos, DetalleConejos, DetalleCuries,
    DetallePeces, DetalleApicolas,
)
from .mixins import PermitirVaciosMixin, get_o_crear

# Grupos que manejan raza (multiseleccion). Aves queda "tal cual" sin raza.
DETALLE_MAP = {
    'Bovinos': ('detallebovinos_set', {'Proposito': 'Proposito', 'Machos': 'NumeroMachos',
                                       'Hembras': 'NumeroHembras', 'RUV': 'RUV'}),
    'Aves': ('detalleaves_set', {'TipoAve': 'TipoAve', 'Cantidad': 'Cantidad'}),
    'Porcinos': ('detalleporcinos_set', {'Proposito': 'Proposito', 'Chapeta': 'Chapeta'}),
    'Equinos': ('detalleequinos_set', {'Proposito': 'Proposito'}),
    'Caprinos': ('detallecaprinos_set', {'Proposito': 'Proposito'}),
    'Ovinos': ('detalleovinos_set', {'Proposito': 'Proposito'}),
    'Conejos': ('detalleconejos_set', {'Proposito': 'Proposito'}),
    'Curies': ('detallecuries_set', {'Proposito': 'Proposito'}),
    'Peces': ('detallepeces_set', {'Estanques': 'NumeroEstanques'}),
    'Abejas': ('detalleapicolas_set', {'ProductosApicolas': 'ProductosApicolas'}),
}

DETALLE_MODELS = {
    'Bovinos': DetalleBovinos, 'Aves': DetalleAves, 'Porcinos': DetallePorcinos,
    'Equinos': DetalleEquinos, 'Caprinos': DetalleCaprinos, 'Ovinos': DetalleOvinos,
    'Conejos': DetalleConejos, 'Curies': DetalleCuries, 'Peces': DetallePeces,
    'Abejas': DetalleApicolas,
}


class InfoProduccionAnimalSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    Animales = serializers.ListField(child=serializers.DictField(), required=False)

    def _detalle_info(self, au, grupo):
        accessor, mapping = DETALLE_MAP.get(grupo, (None, {}))
        if not accessor:
            return {}
        d = getattr(au, accessor).first()
        if d is None:
            return {}
        info = {}
        for campo, attr in mapping.items():
            val = getattr(d, attr)
            info[campo] = str(val) if isinstance(val, models.Model) else val
        return info

    def get_Animales(self, obj):
        result = []
        aves_total = 0
        aves_detalles = {'Raza': ''}

        for au in obj.animalesups_set.select_related('Animal__Raza', 'Animal__GrupoAnimal').all():
            grupo = au.Animal.GrupoAnimal.GrupoAnimal
            raza = au.Animal.Raza
            raza_nombre = str(raza) if raza else ''

            if grupo == 'Aves':
                if raza_nombre and not aves_detalles.get('Raza'):
                    aves_detalles['Raza'] = raza_nombre
                for row in au.detalleaves_set.select_related('TipoAve').all():
                    nombre = str(row.TipoAve) if row.TipoAve else ''
                    cant = row.Cantidad or 0
                    aves_total += cant
                    bajo = nombre.lower()
                    if 'gallina' in bajo:
                        aves_detalles['TipoGallina'] = nombre
                        aves_detalles['Gallinas'] = (aves_detalles.get('Gallinas') or 0) + cant
                    elif 'pollo' in bajo:
                        aves_detalles['Pollos'] = (aves_detalles.get('Pollos') or 0) + cant
                    elif 'pato' in bajo:
                        aves_detalles['Patos'] = (aves_detalles.get('Patos') or 0) + cant
                    elif 'codorniz' in bajo:
                        aves_detalles['Codornices'] = (aves_detalles.get('Codornices') or 0) + cant
                    else:
                        aves_detalles['TipoOtros'] = nombre
                        aves_detalles['Otros'] = (aves_detalles.get('Otros') or 0) + cant
                continue

            agrupado = result
            item = next((x for x in result if x['GrupoAnimal'] == grupo and 'Razas' in x), None)
            if item is None:
                item = {'GrupoAnimal': grupo, 'Razas': []}
                result.append(item)
            item['Razas'].append({
                'Raza': raza_nombre,
                'Cantidad': au.Cantidad,
                'Detalles': self._detalle_info(au, grupo),
            })

        if aves_total or aves_detalles.get('Raza') or any(k in aves_detalles for k in
                                                         ('Gallinas', 'Pollos', 'Patos', 'Codornices', 'Otros')):
            result.append({'GrupoAnimal': 'Aves', 'CantidadTotal': aves_total, 'Detalles': aves_detalles})
        return result

    class Meta:
        model = UP
        fields = ['Animales']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['Animales'] = self.get_Animales(instance)
        return ret

    def _get_o_crear_animal(self, grupo_obj, raza_nombre):
        from ..models import Animales, Razas
        raza_obj = None
        if raza_nombre:
            raza_obj = Razas.objects.filter(Raza__iexact=raza_nombre).first()
            if raza_obj is None:
                raza_obj = Razas.objects.create(Raza=raza_nombre)
        return get_o_crear(Animales, GrupoAnimal=grupo_obj, Raza=raza_obj)

    def _crear_detalle(self, grupo, au, detalles):
        from ..models import (
            Propositos, TiposAves, ProductosApicolas,
            DetalleBovinos, DetalleAves, DetallePorcinos, DetalleEquinos,
            DetalleCaprinos, DetalleOvinos, DetalleConejos, DetalleCuries,
            DetallePeces, DetalleApicolas,
        )

        prop = grupo in ['Bovinos', 'Porcinos', 'Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies']
        proposito = None
        if prop and detalles.get('Proposito'):
            proposito = get_o_crear(Propositos, Proposito=detalles.get('Proposito'))

        if grupo == 'Bovinos':
            DetalleBovinos.objects.create(
                AnimalesUps=au, Proposito=proposito,
                NumeroMachos=detalles.get('Machos') or 0,
                NumeroHembras=detalles.get('Hembras') or 0,
                RUV=detalles.get('RUV') or '',
            )
        elif grupo == 'Aves':
            cantidades = [
                ((detalles.get('TipoGallina') or 'Gallina ponedora'), detalles.get('Gallinas')),
                ('Pollo de engorde', detalles.get('Pollos')),
                ('Pato', detalles.get('Patos')),
                ('Codorniz', detalles.get('Codornices')),
                ((detalles.get('TipoOtros') or 'Otros'), detalles.get('Otros')),
            ]
            for nombre_tipo, cantidad in cantidades:
                cantidad_num = int(cantidad or 0)
                if cantidad_num <= 0:
                    continue
                tipo_ave = get_o_crear(TiposAves, TipoAve=nombre_tipo)
                DetalleAves.objects.create(AnimalesUps=au, TipoAve=tipo_ave, Cantidad=cantidad_num)
        elif grupo == 'Porcinos':
            chapeta = detalles.get('Chapeta', False)
            if chapeta in (None, ''):
                chapeta = False
            DetallePorcinos.objects.create(AnimalesUps=au, Proposito=proposito, Chapeta=bool(chapeta))
        elif grupo in ['Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies']:
            DETALLE_MODELS[grupo].objects.create(AnimalesUps=au, Proposito=proposito)
        elif grupo == 'Peces':
            DetallePeces.objects.create(AnimalesUps=au, NumeroEstanques=detalles.get('Estanques') or 0)
        elif grupo == 'Abejas':
            prod_api = get_o_crear(ProductosApicolas, ProductoApicolas=detalles.get('ProductosApicolas')) \
                if detalles.get('ProductosApicolas') else None
            DetalleApicolas.objects.create(AnimalesUps=au, ProductosApicolas=prod_api)

    def update(self, instance, validated_data):
        from django.db import transaction
        from ..models import AnimalesUps, GrupoAnimal

        animales_data = validated_data.pop('Animales', None)

        if animales_data is not None:
            with transaction.atomic():
                instance.animalesups_set.all().delete()

                for item in animales_data:
                    grupo_nombre = item.get('GrupoAnimal')
                    if not grupo_nombre:
                        continue
                    grupo_obj = get_o_crear(GrupoAnimal, GrupoAnimal=grupo_nombre)

                    razas = item.get('Razas') or []
                    if razas:
                        for r in razas:
                            raza_nombre = r.get('Raza')
                            cantidad = r.get('Cantidad') or 0
                            animal = self._get_o_crear_animal(grupo_obj, raza_nombre)
                            au = AnimalesUps.objects.create(UP=instance, Animal=animal, Cantidad=cantidad)
                            self._crear_detalle(grupo_nombre, au, r.get('Detalles') or {})
                    else:
                        # Aves (tal cual): una sola entrada con CantidadTotal y Detalles
                        cantidad = item.get('CantidadTotal') or 0
                        detalles = item.get('Detalles') or {}
                        raza_nombre = detalles.get('Raza')
                        animal = self._get_o_crear_animal(grupo_obj, raza_nombre)
                        au = AnimalesUps.objects.create(UP=instance, Animal=animal, Cantidad=cantidad)
                        self._crear_detalle(grupo_nombre, au, detalles)
        return instance