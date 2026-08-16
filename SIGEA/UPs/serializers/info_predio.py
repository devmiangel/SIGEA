from rest_framework import serializers

from ..models import UP
from .mixins import PermitirVaciosMixin, get_o_crear

class InfoPredioCaracterizacionSerializer(PermitirVaciosMixin, serializers.ModelSerializer):
    
    NombrePredio = serializers.CharField(source='Predio.NombrePredio', required=False, allow_null=True)
    AreaPredio = serializers.DecimalField(max_digits=10, decimal_places=3, source='Predio.AreaPredio', required=False, allow_null=True)
    RegistroICA = serializers.CharField(required=False, allow_null=True)
    
    Seguro = serializers.CharField(required=False, allow_null=True)
    AccesoCredito = serializers.BooleanField(source='Predio.AccesoCredito', required=False, allow_null=True)
    UsoSuelo = serializers.BooleanField(source='Predio.UsoSuelo', required=False, allow_null=True)
    Latitud = serializers.DecimalField(max_digits=16, decimal_places=14, source='Predio.Latitud', required=False, allow_null=True)
    Longitud = serializers.DecimalField(max_digits=16, decimal_places=14, source='Predio.Longitud', required=False, allow_null=True)
    Direccion = serializers.CharField(source='Predio.Direccion', required=False, allow_null=True)

    TipoTenencia = serializers.CharField(required=False, allow_null=True)
    Vereda = serializers.CharField(required=False, allow_null=True)
    Sector = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = UP
        fields = [
            'NombrePredio', 'AreaPredio', 'RegistroICA', 'Seguro', 'AccesoCredito',
            'UsoSuelo', 'Latitud', 'Longitud', 'Direccion', 'TipoTenencia', 'Vereda', 'Sector'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        predio = instance.Predio
        if predio:
            ret['Seguro'] = predio.Seguro.NombreSeguro if predio.Seguro else None
            ret['TipoTenencia'] = predio.TipoTenencia.TipoTenencia if predio.TipoTenencia else None
            
            sector = predio.Sector
            ret['Sector'] = sector.NombreSector if sector else None
            ret['Vereda'] = sector.Vereda.NombreVereda if sector and sector.Vereda else None
            primer_ica = predio.TiposRegistroICA.first()
            ret['RegistroICA'] = primer_ica.CodigoICA if primer_ica else None
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from Predios.models import Seguros, TiposTenencias, Sectores, Veredas, TiposRegistrosICA

        predio_data = validated_data.pop('Predio', {})
        registro_ica_str = validated_data.pop('RegistroICA', None)
        seguro_str = validated_data.pop('Seguro', None)
        tipo_tenencia_str = validated_data.pop('TipoTenencia', None)
        sector_str = validated_data.pop('Sector', None)
        vereda_str = validated_data.pop('Vereda', None)

        with transaction.atomic():
            predio = instance.Predio
            
            # Actualizar datos básicos del Predio
            for attr, value in predio_data.items():
                if attr in ('AccesoCredito', 'UsoSuelo') and value is None:
                    value = False
                setattr(predio, attr, value)
            
            # Actualizar Seguro (se crea si no existe)
            if seguro_str:
                seguro_obj = get_o_crear(Seguros, NombreSeguro=seguro_str)
                predio.Seguro = seguro_obj
            
            # Actualizar Tipo Tenencia (se crea si no existe)
            if tipo_tenencia_str:
                tenencia_obj = get_o_crear(TiposTenencias, TipoTenencia=tipo_tenencia_str)
                predio.TipoTenencia = tenencia_obj

            # Actualizar Vereda (se crea si no existe)
            vereda_obj = None
            if vereda_str:
                vereda_obj = get_o_crear(Veredas, NombreVereda=vereda_str)

            # Actualizar Sector y Vereda (sector se crea si no existe, ligado a la vereda)
            if sector_str:
                if vereda_obj:
                    sector_obj = Sectores.objects.filter(NombreSector=sector_str).first()
                    if sector_obj is None:
                        sector_obj = Sectores.objects.create(NombreSector=sector_str, Vereda=vereda_obj)
                else:
                    sector_obj = Sectores.objects.filter(NombreSector=sector_str).first()
                    if sector_obj is None:
                        sector_obj = Sectores.objects.create(NombreSector=sector_str)

                predio.Sector = sector_obj
            # Actualizar Registro ICA (varchar): se crea el codigo si no existe
            # y se asigna como unico registro del predio
            if registro_ica_str:
                ica_obj = get_o_crear(TiposRegistrosICA, CodigoICA=registro_ica_str)
                predio.TiposRegistroICA.set([ica_obj])

            predio.save()

        return instance
