from rest_framework import serializers

from ..models import UP

class InfoPredioCaracterizacionSerializer(serializers.ModelSerializer):
    
    NombrePredio = serializers.CharField(source='Predio.NombrePredio', required=False)
    AreaPredio = serializers.CharField(source='Predio.AreaPredio', required=False)
    RegistroICA = serializers.ListField(child=serializers.CharField(), required=False)
    
    Seguro = serializers.CharField(required=False, allow_null=True)
    AccesoCredito = serializers.BooleanField(source='Predio.AccesoCredito', required=False)
    UsoSuelo = serializers.BooleanField(source='Predio.UsoSuelo', required=False)
    Latitud = serializers.DecimalField(max_digits=16, decimal_places=14, source='Predio.Latitud', required=False, allow_null=True)
    Longitud = serializers.DecimalField(max_digits=16, decimal_places=14, source='Predio.Longitud', required=False, allow_null=True)
    Direccion = serializers.CharField(source='Predio.Direccion', required=False)

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
            ret['RegistroICA'] = [ica.CodigoICA for ica in predio.TiposRegistroICA.all()]
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from Predios.models import Seguros, TiposTenencias, Sectores, Veredas, TiposRegistrosICA

        predio_data = validated_data.pop('Predio', {})
        registro_ica_list = validated_data.pop('RegistroICA', None)
        seguro_str = validated_data.pop('Seguro', None)
        tipo_tenencia_str = validated_data.pop('TipoTenencia', None)
        sector_str = validated_data.pop('Sector', None)
        vereda_str = validated_data.pop('Vereda', None)

        with transaction.atomic():
            predio = instance.Predio
            
            # Actualizar datos básicos del Predio
            for attr, value in predio_data.items():
                setattr(predio, attr, value)
            
            # Actualizar Seguro (se crea si no existe)
            if seguro_str:
                seguro_obj, _ = Seguros.objects.get_or_create(NombreSeguro=seguro_str)
                predio.Seguro = seguro_obj
            
            # Actualizar Tipo Tenencia (se crea si no existe)
            if tipo_tenencia_str:
                tenencia_obj, _ = TiposTenencias.objects.get_or_create(TipoTenencia=tipo_tenencia_str)
                predio.TipoTenencia = tenencia_obj

            # Actualizar Vereda (se crea si no existe)
            vereda_obj = None
            if vereda_str:
                vereda_obj, _ = Veredas.objects.get_or_create(NombreVereda=vereda_str)

            # Actualizar Sector y Vereda (sector se crea si no existe, ligado a la vereda)
            if sector_str:
                if vereda_obj:
                    sector_obj, _ = Sectores.objects.get_or_create(
                        NombreSector=sector_str,
                        defaults={'Vereda': vereda_obj},
                    )
                else:
                    sector_obj = Sectores.objects.filter(NombreSector=sector_str).first()
                    if sector_obj is None:
                        sector_obj = Sectores.objects.create(NombreSector=sector_str)

                predio.Sector = sector_obj
            # Actualizar Registros ICA
            if registro_ica_list is not None:
                icas = []
                for ica_code in registro_ica_list:
                    ica_obj, _ = TiposRegistrosICA.objects.get_or_create(CodigoICA=ica_code)
                    icas.append(ica_obj)
                predio.TiposRegistroICA.set(icas)

            predio.save()

        return instance
