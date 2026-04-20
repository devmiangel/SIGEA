from rest_framework import serializers
from Usuarios.models import Usuario, TiposDocumentos, TiposContactos, TiposNivelesEducativos, Sisben, Empresas, Contactos, Personas, Funcionarios, Productores
from .models import (
    UP,
    TipoUP,
    ActividadUP,
    Unidades,
    ArchivosUP,
    DetalleUP,
    ProductosUPs,
    ProduccionUPAgricola,
    ProduccionUPAgroindustrial,
    GrupoAnimal,
    TiposAves,
    Propositos,
    Animales,
    Razas,
    ProductosApicolas,
    DetalleBovinos,
    DetalleAves,
    DetallePorcinos,
    DetalleEquinos,
    DetalleCaprinos,
    DetalleOvinos,
    DetalleConejos,
    DetalleCuries,
    DetallePeces,
    DetalleApicolas,
)
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

    PrimerNombreProductor  = serializers.CharField(source ='Productor.usuario.persona.primer_nombre', read_only=True) 
    SegundoNombreProductor  = serializers.CharField(source ='Productor.usuario.persona.segundo_nombre', read_only=True, required=False) 
    PrimerApellidoProductor  = serializers.CharField(source ='Productor.usuario.persona.primer_apellido', read_only=True) 
    SegundoApellidoProductor  = serializers.CharField(source ='Productor.usuario.persona.segundo_apellido', read_only=True, required=False) 
    DocumentoProductor = serializers.CharField(source ='Productor.usuario.persona.numero_documento', read_only=True)
    TipoDocumentoProductor = serializers.CharField(source='Productor.usuario.persona.TipoDocumento.TipoDocumento', read_only=True)
    
    RazonSocialProductor = serializers.SerializerMethodField()
    def get_RazonSocialProductor(self, obj):
        empresa = obj.Productor.usuario.persona.Empresa.first()
        return empresa.NombreEmpresa if empresa else None
    
    NitProductor = serializers.SerializerMethodField()
    def get_NitProductor(self, obj):
        empresa = obj.Productor.usuario.persona.Empresa.first()
        return empresa.NitEmpresa if empresa else None
    
    Celular = serializers.SerializerMethodField()
    def get_Celular(self, obj):
        contacto = obj.Productor.usuario.persona.contactos.filter(TipoContacto_id=1).first()
        return contacto.contacto if contacto else None
    
    Correo = serializers.SerializerMethodField()
    def get_Correo(self, obj):
        contacto = obj.Productor.usuario.persona.contactos.filter(TipoContacto_id=2).first()
        if contacto:
            return contacto.contacto
        return obj.Productor.usuario.email if obj.Productor and obj.Productor.usuario else None
    
    FechaNacimiento = serializers.DateField(source='Productor.usuario.persona.fecha_nacimiento', read_only=True)
    
    Edad = serializers.SerializerMethodField()
    def get_Edad(self, obj):
        fecha = obj.Productor.usuario.persona.fecha_nacimiento
        if not fecha:
            return None
        hoy = date.today()
        edad = hoy.year - fecha.year - (
            (hoy.month, hoy.day) < (fecha.month, fecha.day)
        )
        return edad

    NivelEducativo = serializers.SerializerMethodField()
    def get_NivelEducativo(self, obj):
        nivel = obj.Productor.usuario.persona.TipoNivelEducativo.first()
        return nivel.TipoNivelEducativo if nivel else None

    Rudea = serializers.CharField(source='RUEA', read_only=True)

    Sisben = serializers.SerializerMethodField()
    def get_Sisben(self, obj):
        sisben = obj.Productor.usuario.persona.NivelSisben.first()
        return sisben.NivelSisben if sisben else None
    class Meta:
        model = UP
        fields = [
            'PrimerNombreProductor', 'SegundoNombreProductor', 'PrimerApellidoProductor',
            'SegundoApellidoProductor', 'DocumentoProductor', 'TipoDocumentoProductor',
            'RazonSocialProductor', 'NitProductor', 'Celular', 'Correo', 'FechaNacimiento',
            'Edad', 'NivelEducativo', 'Rudea', 'Sisben'
        ]

class InfoPredioCaracterizacionSerializer(serializers.ModelSerializer):
    
    NombrePredio = serializers.CharField(source='Predio.NombrePredio', read_only=True)
    AreaPredio = serializers.CharField(source='Predio.AreaPredio', read_only=True)
    RegistroICA = serializers.StringRelatedField(source='Predio.TiposRegistroICA', many=True, read_only=True)
    
    Seguro = serializers.SerializerMethodField()
    def get_Seguro(self, obj):
        return obj.Predio.Seguro.NombreSeguro if obj.Predio and obj.Predio.Seguro else None

    AccesoCredito = serializers.CharField(source='Predio.AccesoCredito', read_only=True)
    UsoSuelo = serializers.CharField(source='Predio.UsoSuelo', read_only=True)
    Latitud = serializers.CharField(source='Predio.Latitud', read_only=True)
    Longitud = serializers.CharField(source='Predio.Longitud', read_only=True)
    Direccion = serializers.CharField(source='Predio.Direccion', read_only=True)

    TipoTenencia = serializers.SerializerMethodField()
    def get_TipoTenencia(self, obj):
        return obj.Predio.TipoTenencia.TipoTenencia if obj.Predio and obj.Predio.TipoTenencia else None

    Vereda = serializers.SerializerMethodField()
    def get_Vereda(self, obj):
        if obj.Predio and obj.Predio.Sector and obj.Predio.Sector.Vereda:
            return obj.Predio.Sector.Vereda.NombreVereda
        return None
    
    Sector = serializers.SerializerMethodField()
    def get_Sector(self, obj):
        if obj.Predio and obj.Predio.Sector:
            return obj.Predio.Sector.NombreSector
        return None

    class Meta:
        model = UP
        fields = [
            'NombrePredio', 'AreaPredio', 'RegistroICA', 'Seguro', 'AccesoCredito',
            'UsoSuelo', 'Latitud', 'Longitud', 'Direccion', 'TipoTenencia', 'Vereda', 'Sector'
        ]
class InfoUPCaracterizacionSerializer(serializers.ModelSerializer):
    
    TipoUP_Nombre = serializers.CharField(source='TipoUP.TipoUP', read_only=True)
    
    ActividadUP = serializers.SerializerMethodField()
    def get_ActividadUP(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.Actividad.Actividad if detalle and detalle.Actividad else None

    NumeroEmpleados = serializers.SerializerMethodField()
    def get_NumeroEmpleados(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.NumeroEmpleados if detalle else None

    Asociatividad = serializers.SerializerMethodField()
    def get_Asociatividad(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.Asociatividad if detalle else None

    AreaCultivada = serializers.SerializerMethodField()
    def get_AreaCultivada(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.AreaCultivada if detalle else None

    AreaPastos = serializers.SerializerMethodField()
    def get_AreaPastos(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.AreaPastos if detalle else None

    NumeroPotreros = serializers.SerializerMethodField()
    def get_NumeroPotreros(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.NumeroPotreros if detalle else None

    NumeroInvernaderos = serializers.SerializerMethodField()
    def get_NumeroInvernaderos(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.NumeroInvernaderos if detalle else None

    NumeroTanques = serializers.SerializerMethodField()
    def get_NumeroTanques(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.NumeroTanques if detalle else None

    NumeroReservorios = serializers.SerializerMethodField()
    def get_NumeroReservorios(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.NumeroReservorios if detalle else None

    FuentesAgua = serializers.SerializerMethodField()
    def get_FuentesAgua(self, obj):
        detalle = obj.detalleup_set.first()
        return detalle.FuentesAgua if detalle else None

    class Meta:
        model = UP
        fields = [
             'TipoUP_Nombre', 'ActividadUP', 'NumeroEmpleados', 'Asociatividad',
             'AreaCultivada', 'AreaPastos', 'NumeroPotreros', 'NumeroInvernaderos',
             'NumeroTanques', 'NumeroReservorios', 'FuentesAgua'
        ]

class InfoProduccionAgricolaSerializer(serializers.ModelSerializer):
    ProduccionAgricola = serializers.SerializerMethodField()
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
        fields = [
            'ProduccionAgricola'
        ]
class InfoProduccionAnimalSerializer(serializers.ModelSerializer):
    Animales = serializers.SerializerMethodField()
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
                # Se construye el nombre del set dinámicamente detalleequinos_set
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
        fields = [
            'Animales'
        ]

class InfoProduccionAgroindustrialSerializer(serializers.ModelSerializer):
    ProduccionAgroindustrial = serializers.SerializerMethodField()
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
        fields = [
            'ProduccionAgroindustrial'
        ]

class InfoAdicionalCaracterizacionSerializer(serializers.ModelSerializer):
    Archivos = serializers.SerializerMethodField()
    def get_Archivos(self, obj):
        return [
            {
                'RutaArchivo': a.RutaArchivo,
                'Descripcion': a.Descripcion
            } for a in obj.archivosup_set.all()
        ]

    ProduccionAgroindustrial = serializers.SerializerMethodField()
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
        fields = [
            'FechaActualizacion', 'Archivos', 'ProduccionAgroindustrial'
        ]
