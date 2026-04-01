from rest_framework import serializers
from Usuarios.models import Usuario,TiposDocumentos,TiposContactos,TiposNivelesEducativos,Sisben,Empresas,Contactos,Personas,Funcionarios,Productores
from .models import UP,TipoUP,ActividadUP,Unidades,UP,ArchivosUP,DetalleUP,ProductosUPs,ProduccionUPAgricola,ProduccionUPAgroindustrial,GrupoAnimal,TiposAves,Propositos,Animales,Razas,ProductosApicolas,DetalleBovinos,DetalleAves,DetallePorcinos,DetalleEquinos,DetalleCaprinos,DetalleOvinos,DetalleConejos,DetalleCuries,DetallePeces,DetalleApicolas
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

class productosUPsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductosUPs
        fields = '__all__'


class CaracterizacionUPsSerializer(serializers.ModelSerializer):
    nombreProductor = serializers.CharField(
        source='Productore.Usuario.Persona.primer_nombre',
        read_only=True)
    
    class Meta:
        model = UP
        fields = '__all__'
