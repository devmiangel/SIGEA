from rest_framework import serializers
from Usuarios.models import *
from .models import *
from datetime import date

class TipoUPSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoUP
        fields = '__all__'

class ActividadUPSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadUP
        fields = '__all__'

class UnidadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidades
        fields = '__all__'

class UPSerializer(serializers.ModelSerializer):
    class Meta:
        model = UP
        fields = '__all__'

class ArchivosUPSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchivosUP
        fields = '__all__'

class DetalleUPSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleUP
        fields = '__all__'

class ProductosUPsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductosUPs
        fields = '__all__'

class ProduccionUPAgricolaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProduccionUPAgricola
        fields = '__all__'

class ProduccionUPAgroindustrialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProduccionUPAgroindustrial
        fields = '__all__'

class GrupoAnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoAnimal
        fields = '__all__'

class TiposAvesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposAves
        fields = '__all__'

class PropositosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Propositos
        fields = '__all__'

class AnimalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animales
        fields = '__all__'

class RazasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Razas
        fields = '__all__'

class ProductosApicolasSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductosApicolas
        fields = '__all__'

class DetalleBovinosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleBovinos
        fields = '__all__'

class DetalleAvesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleAves
        fields = '__all__'

class DetallePorcinosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePorcinos
        fields = '__all__'

class DetalleEquinosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleEquinos
        fields = '__all__'

class DetalleCaprinosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleCaprinos
        fields = '__all__'

class DetalleOvinosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleOvinos
        fields = '__all__'

class DetalleConejosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleConejos
        fields = '__all__'

class DetalleCuriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleCuries
        fields = '__all__'

class DetallePecesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePeces
        fields = '__all__'

class DetalleApicolasSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleApicolas
        fields = '__all__'

#Formulario catracterizacion

class InfoPersonalCaracterizacionSerializer(serializers.ModelSerializer):

    PrimerNombreProductor  = serializers.CharField(source ='Productor.usuario.persona.primer_nombre', required=False) 
    SegundoNombreProductor  = serializers.CharField(source ='Productor.usuario.persona.segundo_nombre', required=False) 
    PrimerApellidoProductor  = serializers.CharField(source ='Productor.usuario.persona.primer_apellido', required=False) 
    SegundoApellidoProductor  = serializers.CharField(source ='Productor.usuario.persona.segundo_apellido', required=False) 
    DocumentoProductor = serializers.CharField(source ='Productor.usuario.persona.numero_documento', required=False)
    TipoDocumentoProductor = serializers.CharField(source='Productor.usuario.persona.TipoDocumento.TipoDocumento', read_only=True)
    
    RazonSocialProductor = serializers.CharField(required=False, allow_null=True)
    NitProductor = serializers.CharField(required=False, allow_null=True)
    Celular = serializers.CharField(required=False, allow_null=True)
    Correo = serializers.CharField(required=False, allow_null=True)
    FechaNacimiento = serializers.DateField(source='Productor.usuario.persona.fecha_nacimiento', required=False)
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
                nivel = TiposNivelesEducativos.objects.filter(TipoNivelEducativo=nivel_educativo_str).first()
                if nivel:
                    persona.TipoNivelEducativo.set([nivel])

            # Actualizar Sisben
            if sisben_str:
                nivel_s = Sisben.objects.filter(NivelSisben=sisben_str).first()
                if nivel_s:
                    persona.NivelSisben.set([nivel_s])

            # RUEA y otros campos de UP no se actualizan aquí por regla de negocio general
            # pero si fuera necesario se haría sobre 'instance'

        return instance

class InfoPredioCaracterizacionSerializer(serializers.ModelSerializer):
    
    NombrePredio = serializers.CharField(source='Predio.NombrePredio', required=False)
    AreaPredio = serializers.CharField(source='Predio.AreaPredio', required=False)
    RegistroICA = serializers.ListField(child=serializers.CharField(), required=False)
    
    Seguro = serializers.CharField(required=False, allow_null=True)
    AccesoCredito = serializers.BooleanField(source='Predio.AccesoCredito', required=False)
    UsoSuelo = serializers.BooleanField(source='Predio.UsoSuelo', required=False)
    Latitud = serializers.CharField(source='Predio.Latitud', required=False)
    Longitud = serializers.CharField(source='Predio.Longitud', required=False)
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
            
            # Actualizar Seguro
            if seguro_str:
                seguro_obj = Seguros.objects.filter(NombreSeguro=seguro_str).first()
                if seguro_obj:
                    predio.Seguro = seguro_obj
            
            # Actualizar Tipo Tenencia
            if tipo_tenencia_str:
                tenencia_obj = TiposTenencias.objects.filter(TipoTenencia=tipo_tenencia_str).first()
                if tenencia_obj:
                    predio.TipoTenencia = tenencia_obj

            # Actualizar Sector y Vereda
            if sector_str:
                # Si se envía vereda, intentamos asegurar que el sector pertenece a esa vereda
                sector_obj = Sectores.objects.filter(NombreSector=sector_str)
                if vereda_str:
                    sector_obj = sector_obj.filter(Vereda__NombreVereda=vereda_str)
                
                sector_obj = sector_obj.first()
                if sector_obj:
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
class InfoUPCaracterizacionSerializer(serializers.ModelSerializer):
    
    TipoUP_Nombre = serializers.CharField(source='TipoUP.TipoUP', required=False)
    ActividadUP = serializers.CharField(required=False, allow_null=True)
    NumeroEmpleados = serializers.IntegerField(required=False)
    Asociatividad = serializers.BooleanField(required=False)
    AreaCultivada = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    AreaPastos = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    NumeroPotreros = serializers.IntegerField(required=False)
    NumeroInvernaderos = serializers.IntegerField(required=False)
    NumeroTanques = serializers.IntegerField(required=False)
    NumeroReservorios = serializers.IntegerField(required=False)
    FuentesAgua = serializers.BooleanField(required=False)

    class Meta:
        model = UP
        fields = [
             'TipoUP_Nombre', 'ActividadUP', 'NumeroEmpleados', 'Asociatividad',
             'AreaCultivada', 'AreaPastos', 'NumeroPotreros', 'NumeroInvernaderos',
             'NumeroTanques', 'NumeroReservorios', 'FuentesAgua'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        detalle = instance.detalleup_set.first()
        if detalle:
            ret['ActividadUP'] = detalle.Actividad.Actividad if detalle.Actividad else None
            ret['NumeroEmpleados'] = detalle.NumeroEmpleados
            ret['Asociatividad'] = detalle.Asociatividad
            ret['AreaCultivada'] = str(detalle.AreaCultivada) if detalle.AreaCultivada else None
            ret['AreaPastos'] = str(detalle.AreaPastos) if detalle.AreaPastos else None
            ret['NumeroPotreros'] = detalle.NumeroPotreros
            ret['NumeroInvernaderos'] = detalle.NumeroInvernaderos
            ret['NumeroTanques'] = detalle.NumeroTanques
            ret['NumeroReservorios'] = detalle.NumeroReservorios
            ret['FuentesAgua'] = detalle.FuentesAgua
        else:
            ret['ActividadUP'] = None
            ret['NumeroEmpleados'] = None
            ret['Asociatividad'] = False
            ret['AreaCultivada'] = None
            ret['AreaPastos'] = None
            ret['NumeroPotreros'] = None
            ret['NumeroInvernaderos'] = None
            ret['NumeroTanques'] = None
            ret['NumeroReservorios'] = None
            ret['FuentesAgua'] = False
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from .models import TipoUP, ActividadUP, DetalleUP
        from datetime import date

        tipo_up_str = validated_data.pop('TipoUP', {}).get('TipoUP', None)
        actividad_str = validated_data.pop('ActividadUP', None)
        
        with transaction.atomic():
            # Actualizar TipoUP si se envía
            if tipo_up_str:
                tipo_obj = TipoUP.objects.filter(TipoUP=tipo_up_str).first()
                if tipo_obj:
                    instance.TipoUP = tipo_obj
                    instance.save()

            # Obtener o crear detalle
            detalle, _ = DetalleUP.objects.get_or_create(UP=instance, defaults={'NumeroEmpleados': 0, 'AreaCultivada': 0, 'AreaPastos': 0, 'NumeroPotreros': 0, 'NumeroInvernaderos': 0, 'NumeroTanques': 0, 'NumeroReservorios': 0, 'Actividad_id': 1})
            
            # Actualizar Actividad
            if actividad_str:
                act_obj = ActividadUP.objects.filter(Actividad=actividad_str).first()
                if act_obj:
                    detalle.Actividad = act_obj

            # Actualizar resto de campos del detalle
            for attr, value in validated_data.items():
                if hasattr(detalle, attr):
                    setattr(detalle, attr, value)
            
            detalle.FechaActualizacion = date.today()
            detalle.save()

        return instance

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
        from .models import ProduccionUPAgricola, ProductosUPs

        produccion_data = validated_data.pop('ProduccionAgricola', None)
        
        if produccion_data is not None:
            with transaction.atomic():
                # Limpiar anteriores
                instance.produccionupagricola_set.all().delete()
                
                # Crear nuevos
                for item in produccion_data:
                    producto_nombre = item.get('NombreProducto')
                    cantidad = item.get('Cantidad')
                    
                    producto_obj = ProductosUPs.objects.filter(Producto=producto_nombre).first()
                    if producto_obj:
                        ProduccionUPAgricola.objects.create(
                            UP=instance,
                            Producto=producto_obj,
                            Cantidad=cantidad
                        )
        return instance
class InfoProduccionAnimalSerializer(serializers.ModelSerializer):
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
            
            # Buscar el detalle específico según la especie
            if grupo == 'Bovinos':
                d = a.detallebovinos_set.first()
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'Proposito': str(d.Proposito),
                        'Machos': d.NumeroMachos, 'Hembras': d.NumeroHembras, 'RUV': d.RUV
                    }
            elif grupo == 'Aves':
                d = a.detalleaves_set.first()
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'TipoAve': str(d.TipoAve), 'Cantidad': d.Cantidad
                    }
            elif grupo == 'Porcinos':
                d = a.detalleporcinos_set.first()
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'Proposito': str(d.Proposito), 'Chapeta': d.Chapeta
                    }
            elif grupo in ['Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies']:
                accessor = f'detalle{grupo.lower()}_set'
                d = getattr(a, accessor, None)
                if d:
                    d = d.first()
                    if d:
                        data['Detalles'] = { 'Raza': str(d.Raza), 'Proposito': str(d.Proposito) }
            elif grupo == 'Peces':
                d = a.detallepeces_set.first()
                if d:
                    data['Detalles'] = {
                        'Raza': str(d.Raza), 'Estanques': d.NumeroEstanques
                    }
            elif grupo == 'Abejas':
                d = a.detalleapicolas_set.first()
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
        from .models import (
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
                    
                    grupo_obj = GrupoAnimal.objects.filter(GrupoAnimal=grupo_nombre).first()
                    if not grupo_obj: continue
                    
                    animal = Animales.objects.create(UP=instance, GrupoAnimal=grupo_obj, Cantidad=cantidad_total)
                    
                    if detalles:
                        raza_nombre = detalles.get('Raza')
                        raza_obj, _ = Razas.objects.get_or_create(Raza=raza_nombre, Animal=animal) if raza_nombre else (None, False)
                        
                        if grupo_nombre == 'Bovinos':
                            prop = Propositos.objects.filter(Proposito=detalles.get('Proposito')).first()
                            DetalleBovinos.objects.create(
                                Animal=animal, Raza=raza_obj, Proposito=prop,
                                NumeroMachos=detalles.get('Machos', 0),
                                Hembras=detalles.get('Hembras', 0), RUV=detalles.get('RUV', '')
                            )
                        elif grupo_nombre == 'Aves':
                            tipo_ave = TiposAves.objects.filter(TipoAve=detalles.get('TipoAve')).first()
                            DetalleAves.objects.create(Animal=animal, Raza=raza_obj, TipoAve=tipo_ave, Cantidad=detalles.get('Cantidad', 0))
                        elif grupo_nombre == 'Porcinos':
                            prop = Propositos.objects.filter(Proposito=detalles.get('Proposito')).first()
                            DetallePorcinos.objects.create(Animal=animal, Raza=raza_obj, Proposito=prop, Chapeta=detalles.get('Chapeta', False))
                        elif grupo_nombre in ['Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies']:
                            prop = Propositos.objects.filter(Proposito=detalles.get('Proposito')).first()
                            model_map = {
                                'Equinos': DetalleEquinos, 'Caprinos': DetalleCaprinos, 
                                'Ovinos': DetalleOvinos, 'Conejos': DetalleConejos, 'Curies': DetalleCuries
                            }
                            model_map[grupo_nombre].objects.create(Animal=animal, Raza=raza_obj, Proposito=prop)
                        elif grupo_nombre == 'Peces':
                            DetallePeces.objects.create(Animal=animal, Raza=raza_obj, NumeroEstanques=detalles.get('Estanques', 0))
                        elif grupo_nombre == 'Abejas':
                            prod_api = ProductosApicolas.objects.filter(ProductoApicolas=detalles.get('ProductosApicolas')).first()
                            DetalleApicolas.objects.create(Animal=animal, Raza=raza_obj, ProductosApicolas=prod_api)
        return instance

class InfoProduccionAgroindustrialSerializer(serializers.ModelSerializer):
    ProduccionAgroindustrial = serializers.ListField(child=serializers.DictField(), required=False)
    
    def get_ProduccionAgroindustrial(self, obj):
        return [
            {
                'NombreProducto': p.Producto.Producto,
                'Cantidad': p.Cantidad,
                'UnidadMedida': p.Producto.Unidad.Unidad if p.Producto and p.Producto.Unidad else None,
                'INVIMA': p.INVIMA
            } for p in obj.produccionupagroindustrial_set.all()
        ]

    class Meta:
        model = UP
        fields = ['ProduccionAgroindustrial']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['ProduccionAgroindustrial'] = self.get_ProduccionAgroindustrial(instance)
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from .models import ProduccionUPAgroindustrial, ProductosUPs

        agro_data = validated_data.pop('ProduccionAgroindustrial', None)
        
        if agro_data is not None:
            with transaction.atomic():
                instance.produccionupagroindustrial_set.all().delete()
                for item in agro_data:
                    producto_nombre = item.get('NombreProducto')
                    producto_obj = ProductosUPs.objects.filter(Producto=producto_nombre).first()
                    if producto_obj:
                        ProduccionUPAgroindustrial.objects.create(
                            UP=instance,
                            Producto=producto_obj,
                            Cantidad=item.get('Cantidad', 0),
                            INVIMA=item.get('INVIMA', False)
                        )
        return instance

class InfoAdicionalCaracterizacionSerializer(serializers.ModelSerializer):
    Archivos = serializers.ListField(child=serializers.DictField(), required=False)
    ProduccionAgroindustrial = serializers.ListField(child=serializers.DictField(), required=False)
    
    def get_Archivos(self, obj):
        return [
            {
                'RutaArchivo': a.RutaArchivo,
                'Descripcion': a.Descripcion
            } for a in obj.archivosup_set.all()
        ]

    def get_ProduccionAgroindustrial(self, obj):
        return [
            {
                'NombreProducto': p.Producto.Producto,
                'Cantidad': p.Cantidad,
                'UnidadMedida': p.Producto.Unidad.Unidad if p.Producto and p.Producto.Unidad else None,
                'INVIMA': p.INVIMA
            } for p in obj.produccionupagroindustrial_set.all()
        ]

    class Meta:
        model = UP
        fields = ['FechaActualizacion', 'Archivos', 'ProduccionAgroindustrial']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['Archivos'] = self.get_Archivos(instance)
        ret['ProduccionAgroindustrial'] = self.get_ProduccionAgroindustrial(instance)
        return ret

    def update(self, instance, validated_data):
        from django.db import transaction
        from .models import ArchivosUP, ProduccionUPAgroindustrial, ProductosUPs
        from datetime import date

        archivos_data = validated_data.pop('Archivos', None)
        agro_data = validated_data.pop('ProduccionAgroindustrial', None)
        
        with transaction.atomic():
            instance.FechaActualizacion = date.today()
            instance.save()

            if archivos_data is not None:
                instance.archivosup_set.all().delete()
                for a in archivos_data:
                    ArchivosUP.objects.create(
                        UP=instance,
                        RutaArchivo=a.get('RutaArchivo'),
                        Descripcion=a.get('Descripcion', '')
                    )

            if agro_data is not None:
                instance.produccionupagroindustrial_set.all().delete()
                for item in agro_data:
                    producto_nombre = item.get('NombreProducto')
                    producto_obj = ProductosUPs.objects.filter(Producto=producto_nombre).first()
                    if producto_obj:
                        ProduccionUPAgroindustrial.objects.create(
                            UP=instance,
                            Producto=producto_obj,
                            Cantidad=item.get('Cantidad', 0),
                            INVIMA=item.get('INVIMA', False)
                        )
        return instance
