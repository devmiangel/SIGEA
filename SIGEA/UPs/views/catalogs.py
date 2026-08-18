from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import (
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

from ..serializers import (
    TipoUPSerializer,
    ActividadUPSerializer,
    UnidadesSerializer,
    ArchivosUPSerializer,
    DetalleUPSerializer,
    ProductosUPsSerializer,
    ProduccionUPAgricolaSerializer,
    ProduccionUPAgroindustrialSerializer,
    GrupoAnimalSerializer,
    TiposAvesSerializer,
    PropositosSerializer,
    AnimalesSerializer,
    AnimalesUpsSerializer,
    RazasSerializer,
    ProductosApicolasSerializer,
    DetalleBovinosSerializer,
    DetalleAvesSerializer,
    DetallePorcinosSerializer,
    DetalleEquinosSerializer,
    DetalleCaprinosSerializer,
    DetalleOvinosSerializer,
    DetalleConejosSerializer,
    DetalleCuriesSerializer,
    DetallePecesSerializer,
    DetalleApicolasSerializer,
)

class TipoUPViewSet(viewsets.ModelViewSet):
    queryset = TipoUP.objects.all()
    serializer_class = TipoUPSerializer

class ActividadUPViewSet(viewsets.ModelViewSet):
    queryset = ActividadUP.objects.all()
    serializer_class = ActividadUPSerializer

class UnidadesViewSet(viewsets.ModelViewSet):
    queryset = Unidades.objects.all()
    serializer_class = UnidadesSerializer

class ArchivosUPViewSet(viewsets.ModelViewSet):
    queryset = ArchivosUP.objects.all()
    serializer_class = ArchivosUPSerializer

class DetalleUPViewSet(viewsets.ModelViewSet):
    queryset = DetalleUP.objects.all()
    serializer_class = DetalleUPSerializer

class ProductosUPsViewSet(viewsets.ModelViewSet):
    queryset = ProductosUPs.objects.all()
    serializer_class = ProductosUPsSerializer

class ProduccionUPAgricolaViewSet(viewsets.ModelViewSet):
    queryset = ProduccionUPAgricola.objects.all()
    serializer_class = ProduccionUPAgricolaSerializer

class ProduccionUPAgroindustrialViewSet(viewsets.ModelViewSet):
    queryset = ProduccionUPAgroindustrial.objects.all()
    serializer_class = ProduccionUPAgroindustrialSerializer

class GrupoAnimalViewSet(viewsets.ModelViewSet):
    queryset = GrupoAnimal.objects.all()
    serializer_class = GrupoAnimalSerializer

    @action(detail=True, methods=['get'])
    def razas(self, request, pk=None):
        grupo = self.get_object()
        razas = Animales.objects.filter(GrupoAnimal=grupo).exclude(Raza__isnull=True)\
            .values_list('Raza__id', 'Raza__Raza').order_by('Raza__Raza')
        return Response([{'id': rid, 'Raza': nombre} for rid, nombre in razas])

class TiposAvesViewSet(viewsets.ModelViewSet):
    queryset = TiposAves.objects.all()
    serializer_class = TiposAvesSerializer

class PropositosViewSet(viewsets.ModelViewSet):
    queryset = Propositos.objects.all()
    serializer_class = PropositosSerializer

class AnimalesViewSet(viewsets.ModelViewSet):
    queryset = Animales.objects.all()
    serializer_class = AnimalesSerializer

class AnimalesUpsViewSet(viewsets.ModelViewSet):
    queryset = AnimalesUps.objects.all()
    serializer_class = AnimalesUpsSerializer

class RazasViewSet(viewsets.ModelViewSet):
    queryset = Razas.objects.all()
    serializer_class = RazasSerializer

    def create(self, request, *args, **kwargs):
        nombre = (request.data.get('Raza') or '').strip()
        if not nombre:
            return Response({'Raza': ['Este campo es requerido.']}, status=status.HTTP_400_BAD_REQUEST)
        raza = Razas.objects.filter(Raza__iexact=nombre).first()
        if raza is None:
            raza = Razas.objects.create(Raza=nombre)
        grupo_id = request.data.get('grupoId')
        if grupo_id:
            grupo = GrupoAnimal.objects.filter(pk=grupo_id).first()
            if grupo is not None:
                Animales.objects.get_or_create(GrupoAnimal=grupo, Raza=raza)
        return Response(RazasSerializer(raza).data, status=status.HTTP_201_CREATED)

class ProductosApicolasViewSet(viewsets.ModelViewSet):
    queryset = ProductosApicolas.objects.all()
    serializer_class = ProductosApicolasSerializer

class DetalleBovinosViewSet(viewsets.ModelViewSet):
    queryset = DetalleBovinos.objects.all()
    serializer_class = DetalleBovinosSerializer

class DetalleAvesViewSet(viewsets.ModelViewSet):
    queryset = DetalleAves.objects.all()
    serializer_class = DetalleAvesSerializer

class DetallePorcinosViewSet(viewsets.ModelViewSet):
    queryset = DetallePorcinos.objects.all()
    serializer_class = DetallePorcinosSerializer

class DetalleEquinosViewSet(viewsets.ModelViewSet):
    queryset = DetalleEquinos.objects.all()
    serializer_class = DetalleEquinosSerializer

class DetalleCaprinosViewSet(viewsets.ModelViewSet):
    queryset = DetalleCaprinos.objects.all()
    serializer_class = DetalleCaprinosSerializer

class DetalleOvinosViewSet(viewsets.ModelViewSet):
    queryset = DetalleOvinos.objects.all()
    serializer_class = DetalleOvinosSerializer

class DetalleConejosViewSet(viewsets.ModelViewSet):
    queryset = DetalleConejos.objects.all()
    serializer_class = DetalleConejosSerializer

class DetalleCuriesViewSet(viewsets.ModelViewSet):
    queryset = DetalleCuries.objects.all()
    serializer_class = DetalleCuriesSerializer

class DetallePecesViewSet(viewsets.ModelViewSet):
    queryset = DetallePeces.objects.all()
    serializer_class = DetallePecesSerializer

class DetalleApicolasViewSet(viewsets.ModelViewSet):
    queryset = DetalleApicolas.objects.all()
    serializer_class = DetalleApicolasSerializer
