from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from Usuarios.models import Usuario
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
    DetalleApicolas
)

from .serializers import (
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
    UPSerializer,
    InfoPersonalCaracterizacionSerializer,
    InfoPredioCaracterizacionSerializer,
    InfoUPCaracterizacionSerializer,
    InfoProduccionAgricolaSerializer,
    InfoProduccionAnimalSerializer,
    InfoProduccionAgroindustrialSerializer,
    InfoAdicionalCaracterizacionSerializer
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

class TiposAvesViewSet(viewsets.ModelViewSet):
    queryset = TiposAves.objects.all()
    serializer_class = TiposAvesSerializer

class PropositosViewSet(viewsets.ModelViewSet):
    queryset = Propositos.objects.all()
    serializer_class = PropositosSerializer

class AnimalesViewSet(viewsets.ModelViewSet):
    queryset = Animales.objects.all()
    serializer_class = AnimalesSerializer

class RazasViewSet(viewsets.ModelViewSet):
    queryset = Razas.objects.all()
    serializer_class = RazasSerializer

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

class UPViewSet(viewsets.ModelViewSet):
    queryset = UP.objects.all()
    serializer_class = UPSerializer

# INFO PERSONAL DE CARACTERIZACION


def _get_up_for_user(request, userId=None):
    if userId is None:
        userId = request.data.get("userId")

    if not userId:
        return None, Response({"error": "userId es requerido"}, status=status.HTTP_400_BAD_REQUEST)

    usuario = get_object_or_404(Usuario, id=userId)
    productor = getattr(usuario, 'productores', None)
    if not productor:
        return None, Response({"error": "No se encontro el productor"}, status=status.HTTP_404_NOT_FOUND)

    up = UP.objects.filter(Productor=productor).first()
    if not up:
        return None, Response({"error": "No se encontro la UP"}, status=status.HTTP_404_NOT_FOUND)

    return up, None


@api_view(['POST'])
def info_personal_caracterizacion(request, userId=None):
    up, error_response = _get_up_for_user(request, userId)
    if error_response:
        return error_response
    serializer = InfoPersonalCaracterizacionSerializer(up)
    return Response(serializer.data)


@api_view(['POST'])
def info_predio_caracterizacion(request, userId=None):
    up, error_response = _get_up_for_user(request, userId)
    if error_response:
        return error_response
    serializer = InfoPredioCaracterizacionSerializer(up)
    return Response(serializer.data)


@api_view(['POST'])
def info_up_caracterizacion(request, userId=None):
    up, error_response = _get_up_for_user(request, userId)
    if error_response:
        return error_response
    serializer = InfoUPCaracterizacionSerializer(up)
    return Response(serializer.data)


@api_view(['POST'])
def info_produccion_agricola(request, userId=None):
    up, error_response = _get_up_for_user(request, userId)
    if error_response:
        return error_response
    serializer = InfoProduccionAgricolaSerializer(up)
    return Response(serializer.data)


@api_view(['POST'])
def info_produccion_animal(request, userId=None):
    up, error_response = _get_up_for_user(request, userId)
    if error_response:
        return error_response
    serializer = InfoProduccionAnimalSerializer(up)
    return Response(serializer.data)


@api_view(['POST'])
def info_produccion_agroindustrial(request, userId=None):
    up, error_response = _get_up_for_user(request, userId)
    if error_response:
        return error_response
    serializer = InfoProduccionAgroindustrialSerializer(up)
    return Response(serializer.data)


@api_view(['POST'])
def info_adicional_caracterizacion(request, userId=None):
    up, error_response = _get_up_for_user(request, userId)
    if error_response:
        return error_response
    serializer = InfoAdicionalCaracterizacionSerializer(up)
    return Response(serializer.data)


# FIN INFO PERSONAL DE CARACTERIZACION

