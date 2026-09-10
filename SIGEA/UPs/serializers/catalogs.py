from rest_framework import serializers

from ..models import (
    EventosUP,
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
    AnimalesUps,
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

class AnimalesUpsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalesUps
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

class EventosUPSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventosUP
        fields = '__all__'
