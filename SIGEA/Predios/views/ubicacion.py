from rest_framework import viewsets
from rest_framework.response import Response

from ..models import Sectores, Veredas, TiposTenencias, Seguros, TiposRegistrosICA

from ..serializers import (
    SectoresSerializer,
    VeredasSerializer,
    TiposTenenciasSerializer,
    SegurosSerializer,
    TiposRegistrosICASerializer,
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

    def create(self, request, *args, **kwargs):
        nombre = (request.data.get('NombreSeguro') or '').strip()
        if nombre:
            obj = Seguros.objects.filter(NombreSeguro=nombre).first()
            if obj is not None:
                return Response(self.get_serializer(obj).data, status=200)
        return super().create(request, *args, **kwargs)

class TiposRegistrosICAViewSet(viewsets.ModelViewSet):
    queryset = TiposRegistrosICA.objects.all()
    serializer_class = TiposRegistrosICASerializer

    def create(self, request, *args, **kwargs):
        codigo = (request.data.get('CodigoICA') or '').strip()
        if codigo:
            obj = TiposRegistrosICA.objects.filter(CodigoICA=codigo).first()
            if obj is not None:
                return Response(self.get_serializer(obj).data, status=200)
        return super().create(request, *args, **kwargs)
