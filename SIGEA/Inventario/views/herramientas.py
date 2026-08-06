from rest_framework import viewsets

from ..models import TiposHerramientas, Herramientas, AsignacionHerramientas

from ..serializers import (
    TiposHerramientasSerializer,
    HerramientasSerializer,
    AsignacionHerramientasSerializer,
)

class TiposHerramientasViewSet(viewsets.ModelViewSet):
    queryset = TiposHerramientas.objects.all()
    serializer_class = TiposHerramientasSerializer

class HerramientasViewSet(viewsets.ModelViewSet):
    queryset = Herramientas.objects.all()
    serializer_class = HerramientasSerializer

class AsignacionHerramientasViewSet(viewsets.ModelViewSet):
    queryset = AsignacionHerramientas.objects.all()
    serializer_class = AsignacionHerramientasSerializer
