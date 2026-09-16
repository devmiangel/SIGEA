from rest_framework import serializers
from datetime import date
from django.core.validators import RegexValidator

from ..models import UP
from .mixins import PermitirVaciosMixin, get_o_crear

#Formulario catracterizacion

class InfoPersonalCaracterizacionSerializer(PermitirVaciosMixin, serializers.ModelSerializer):

    PrimerNombreProductor  = serializers.CharField(source ='Productor.usuario.persona.primer_nombre', required=False) 
    SegundoNombreProductor  = serializers.CharField(source ='Productor.usuario.persona.segundo_nombre', required=False, allow_null=True) 
    PrimerApellidoProductor  = serializers.CharField(source ='Productor.usuario.persona.primer_apellido', required=False) 
    SegundoApellidoProductor  = serializers.CharField(source ='Productor.usuario.persona.segundo_apellido', required=False, allow_null=True) 
    DocumentoProductor = serializers.CharField(source ='Productor.usuario.persona.numero_documento', required=False)
    TipoDocumentoProductor = serializers.CharField(source='Productor.usuario.persona.TipoDocumento.TipoDocumento', read_only=True)
    
    RazonSocialProductor = serializers.CharField(required=False, allow_null=True)
    NitProductor = serializers.CharField(required=False, allow_null=True)
    Celular = serializers.CharField(required=False, allow_null=True, validators=[RegexValidator(r'^\+?\d{7,15}$', 'Ingrese un número de celular válido (7-15 dígitos, opcional +)')])
    Correo = serializers.EmailField(required=False, allow_null=True)
    FechaNacimiento = serializers.DateField(source='Productor.usuario.persona.fecha_nacimiento', required=False, allow_null=True)
    NivelEducativo = serializers.CharField(required=False, allow_null=True)
    Sisben = serializers.CharField(required=False, allow_null=True)
    
    Edad = serializers.SerializerMethodField(read_only=True)
    def get_Edad(self, obj):
        fecha = obj.Productor.usuario.persona.fecha_nacimiento
        if not fecha:
            return None
        hoy = date.today()
        edad = hoy.year - fecha.year - (
            (hoy.month, hoy.day) < (fecha.month, fecha.day)
        )
        return edad

    Rudea = serializers.CharField(source='RUEA', read_only=True)

    class Meta:
        model = UP
        fields = [
            'PrimerNombreProductor', 'SegundoNombreProductor', 'PrimerApellidoProductor',
            'SegundoApellidoProductor', 'DocumentoProductor', 'TipoDocumentoProductor',
            'RazonSocialProductor', 'NitProductor', 'Celular', 'Correo', 'FechaNacimiento',
            'Edad', 'NivelEducativo', 'Rudea', 'Sisben'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        persona = instance.Productor.usuario.persona
        if persona:
            empresa = persona.Empresa.first()
            ret['RazonSocialProductor'] = empresa.NombreEmpresa if empresa else None
            ret['NitProductor'] = empresa.NitEmpresa if empresa else None
            
            celular_obj = persona.contactos.filter(TipoContacto_id=1).first()
            ret['Celular'] = celular_obj.contacto if celular_obj else None
            
            correo_obj = persona.contactos.filter(TipoContacto_id=2).first()
            ret['Correo'] = correo_obj.contacto if correo_obj else None
            
            nivel = persona.TipoNivelEducativo.first()
            ret['NivelEducativo'] = nivel.TipoNivelEducativo if nivel else None
            
            sisben = persona.NivelSisben.first()
            ret['Sisben'] = sisben.NivelSisben if sisben else None
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from Usuarios.models import Personas, Empresas, Contactos, TiposNivelesEducativos, Sisben

        persona_data = validated_data.pop('Productor', {}).get('usuario', {}).get('persona', {})
        razon_social = validated_data.pop('RazonSocialProductor', None)
        nit_productor = validated_data.pop('NitProductor', None)
        celular = validated_data.pop('Celular', None)
        correo = validated_data.pop('Correo', None)
        nivel_educativo_str = validated_data.pop('NivelEducativo', None)
        sisben_str = validated_data.pop('Sisben', None)

        with transaction.atomic():
            persona = instance.Productor.usuario.persona
            
            # Actualizar datos básicos de Persona
            for attr, value in persona_data.items():
                setattr(persona, attr, value)
            persona.save()

            # Actualizar Empresa
            if razon_social or nit_productor:
                empresa = persona.Empresa.first()
                if empresa:
                    if razon_social: empresa.NombreEmpresa = razon_social
                    if nit_productor: empresa.NitEmpresa = nit_productor
                    empresa.save()
                else:
                    nueva_emp = Empresas.objects.create(NombreEmpresa=razon_social, NitEmpresa=nit_productor)
                    persona.Empresa.add(nueva_emp)

            # Actualizar Contactos (Tipo 1: Celular, Tipo 2: Correo)
            if celular:
                contacto_cel = persona.contactos.filter(TipoContacto_id=1).first()
                if contacto_cel:
                    contacto_cel.contacto = celular
                    contacto_cel.save()
                else:
                    nuevo_c = Contactos.objects.create(contacto=celular, TipoContacto_id=1)
                    persona.contactos.add(nuevo_c)
            
            if correo:
                contacto_cor = persona.contactos.filter(TipoContacto_id=2).first()
                if contacto_cor:
                    contacto_cor.contacto = correo
                    contacto_cor.save()
                else:
                    nuevo_c = Contactos.objects.create(contacto=correo, TipoContacto_id=2)
                    persona.contactos.add(nuevo_c)

            # Actualizar Nivel Educativo
            if nivel_educativo_str:
                nivel = get_o_crear(TiposNivelesEducativos, TipoNivelEducativo=nivel_educativo_str)
                persona.TipoNivelEducativo.set([nivel])

            # Actualizar Sisben
            if sisben_str:
                nivel_s = get_o_crear(Sisben, NivelSisben=sisben_str)
                persona.NivelSisben.set([nivel_s])

            # RUEA y otros campos de UP no se actualizan aquí por regla de negocio general
            # pero si fuera necesario se haría sobre 'instance'

        return instance
