from rest_framework import serializers
from datetime import date

from ..models import Personas
from .catalogs import (
    ContactosSerializer,
    TiposNivelesEducativosSerializer,
    SisbenSerializer,
    EmpresasSerializer,
)

class PersonasSerializer(serializers.ModelSerializer):
    contactos = ContactosSerializer(many=True, read_only=True)
    TipoNivelEducativo = TiposNivelesEducativosSerializer(many=True, read_only=True)
    NivelSisben = SisbenSerializer(many=True, read_only=True)
    Empresa = EmpresasSerializer(many=True, read_only=True)

    class Meta:
        model = Personas
        fields = '__all__'
    def validate(self, data): #primero ejecuta las validadciones y luego guarda em la db
        primer_nombre = data.get('primer_nombre')
        primer_apellido = data.get('primer_apellido')
        
        if primer_nombre and primer_apellido and primer_nombre == primer_apellido:
            raise serializers.ValidationError("El primer nombre no puede ser igual al primer apellido")
        
        fecha_nacimiento = data.get('fecha_nacimiento')
        if fecha_nacimiento and fecha_nacimiento >= date.today():
            raise serializers.ValidationError("La fecha de nacimiento no puede ser mayor o igual a la fecha actual")
        
        return data

class PersonaBasicaSerializer(serializers.ModelSerializer):
    TipoDocumento_info = serializers.SerializerMethodField()

    class Meta:
        model = Personas
        fields = [
            'primer_nombre',
            'segundo_nombre',
            'primer_apellido',
            'segundo_apellido',
            'numero_documento',
            'TipoDocumento',
            'TipoDocumento_info',
            'fecha_nacimiento',
        ]

    def get_TipoDocumento_info(self, obj):
        return {
            'id': obj.TipoDocumento.id,
            'TipoDocumento': obj.TipoDocumento.TipoDocumento,
        }
