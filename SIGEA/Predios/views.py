from rest_framework import viewsets

from .models import (
    Sectores,
    Veredas,
    TiposTenencias,
    Seguros,
    TiposRegistrosICA,
    Predios
)

from .serializers import (
    SectoresSerializer,
    VeredasSerializer,
    TiposTenenciasSerializer,
    SegurosSerializer,
    TiposRegistrosICASerializer,
    PrediosSerializer
)

class SectoresViewSet(viewsets.ModelViewSet):
    queryset = Sectores.objects.all()
    serializer_class = SectoresSerializer

class VeredasViewSet(viewsets.ModelViewSet):
    queryset = Veredas.objects.all()
    serializer_class = VeredasSerializer

class TiposTenenciasViewSet(viewsets.ModelViewSet):
    queryset = TiposTenencias.objects.all()
    serializer_class = TiposTenenciasSerializer

class SegurosViewSet(viewsets.ModelViewSet):
    queryset = Seguros.objects.all()
    serializer_class = SegurosSerializer

class TiposRegistrosICAViewSet(viewsets.ModelViewSet):
    queryset = TiposRegistrosICA.objects.all()
    serializer_class = TiposRegistrosICASerializer

class PrediosViewSet(viewsets.ModelViewSet):
    queryset = Predios.objects.all()
    serializer_class = PrediosSerializer
