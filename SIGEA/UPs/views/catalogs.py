from django.db.models import Prefetch
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from UPs.serializers.catalogs import EventosUPSerializer
from SIGEAsite.filters import filtrar_texto
from SIGEAsite.permissions import SigeaModelPermissionMixin, OwnedQuerysetMixin

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

class TipoUPViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TipoUP.objects.all()
    serializer_class = TipoUPSerializer

class ActividadUPViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = ActividadUP.objects.all()
    serializer_class = ActividadUPSerializer

class UnidadesViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Unidades.objects.all()
    serializer_class = UnidadesSerializer

class ArchivosUPViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'UP__Productor__usuario'
    queryset = ArchivosUP.objects.all()
    serializer_class = ArchivosUPSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        up_id = self.request.query_params.get('UP') or self.request.query_params.get('up_id')
        if up_id and str(up_id).isdigit():
            queryset = queryset.filter(UP_id=int(up_id))
        return queryset

    @action(detail=True, methods=['get'])
    def descargar(self, request, pk=None):
        # get_object() aplica permisos de modelo + filtro por dueño: un archivo
        # de otra UP responde 404.
        from ..services.archivos_service import respuesta_descarga
        archivo = self.get_object()
        return respuesta_descarga(archivo.RutaArchivo, archivo.NombreArchivo)

class DetalleUPViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'UP__Productor__usuario'
    queryset = DetalleUP.objects.all()
    serializer_class = DetalleUPSerializer

class ProductosUPsViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = ProductosUPs.objects.all()
    serializer_class = ProductosUPsSerializer

class ProduccionUPAgricolaViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'UP__Productor__usuario'
    queryset = ProduccionUPAgricola.objects.all()
    serializer_class = ProduccionUPAgricolaSerializer

class ProduccionUPAgroindustrialViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'UP__Productor__usuario'
    queryset = ProduccionUPAgroindustrial.objects.all()
    serializer_class = ProduccionUPAgroindustrialSerializer

class GrupoAnimalViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = GrupoAnimal.objects.all()
    serializer_class = GrupoAnimalSerializer

    @action(detail=True, methods=['get'])
    def razas(self, request, pk=None):
        grupo = self.get_object()
        razas = Animales.objects.filter(GrupoAnimal=grupo).exclude(Raza__isnull=True)\
            .values_list('Raza__id', 'Raza__Raza').order_by('Raza__Raza')
        return Response([{'id': rid, 'Raza': nombre} for rid, nombre in razas])

class TiposAvesViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposAves.objects.all()
    serializer_class = TiposAvesSerializer

class PropositosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Propositos.objects.all()
    serializer_class = PropositosSerializer

class AnimalesViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Animales.objects.all()
    serializer_class = AnimalesSerializer

class AnimalesUpsViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'UP__Productor__usuario'
    queryset = AnimalesUps.objects.all()
    serializer_class = AnimalesUpsSerializer

class RazasViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
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

class ProductosApicolasViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = ProductosApicolas.objects.all()
    serializer_class = ProductosApicolasSerializer

class DetalleBovinosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetalleBovinos.objects.all()
    serializer_class = DetalleBovinosSerializer

class DetalleAvesViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetalleAves.objects.all()
    serializer_class = DetalleAvesSerializer

class DetallePorcinosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetallePorcinos.objects.all()
    serializer_class = DetallePorcinosSerializer

class DetalleEquinosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetalleEquinos.objects.all()
    serializer_class = DetalleEquinosSerializer

class DetalleCaprinosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetalleCaprinos.objects.all()
    serializer_class = DetalleCaprinosSerializer

class DetalleOvinosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetalleOvinos.objects.all()
    serializer_class = DetalleOvinosSerializer

class DetalleConejosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetalleConejos.objects.all()
    serializer_class = DetalleConejosSerializer

class DetalleCuriesViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetalleCuries.objects.all()
    serializer_class = DetalleCuriesSerializer

class DetallePecesViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetallePeces.objects.all()
    serializer_class = DetallePecesSerializer

class DetalleApicolasViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'AnimalesUps__UP__Productor__usuario'
    queryset = DetalleApicolas.objects.all()
    serializer_class = DetalleApicolasSerializer

class EventosUPViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'UP__Productor__usuario'
    queryset = EventosUP.objects.all()
    serializer_class = EventosUPSerializer

    def get_queryset(self):
        from ..models import UP

        queryset = filtrar_texto(
            super().get_queryset(),
            self.request.query_params.get('search'),
            ['Titulo', 'Lugar', 'Descripcion'],
        )
        # Cada evento incluye sus UPs con UPSerializer: se precargan con lo que ese
        # serializer lee para no consultar por cada UP.
        ups = UP.objects.select_related(
            'idEstado', 'TipoUP', 'Predio', 'Productor__usuario__persona', 'ValidadoPor__usuario__persona',
        )
        # distinct(): el filtro por dueño cruza la relación muchos-a-muchos con UP.
        return (
            queryset.prefetch_related(Prefetch('UP', queryset=ups))
            .distinct()
            .order_by('-Fecha', '-id')
        )