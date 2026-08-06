from rest_framework import serializers

from ..models import (
    TiposDocumentos,
    TiposContactos,
    TiposNivelesEducativos,
    Sisben,
    Empresas,
    Contactos,
)

class TiposDocumentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposDocumentos
        fields = '__all__'

class TiposContactosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposContactos
        fields = '__all__'

class TiposNivelesEducativosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposNivelesEducativos
        fields = '__all__'

class SisbenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sisben
        fields = '__all__'

class EmpresasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresas
        fields = '__all__'

class ContactosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contactos
        fields = '__all__'
