from rest_framework import viewsets

from ..models import Insumos, InventarioFuncionario, CardexInsumoFuncionario

from ..serializers import (
    InsumosSerializer,
    InventarioFuncionarioSerializer,
    CardexInsumoFuncionarioSerializer,
)

class InsumosViewSet(viewsets.ModelViewSet):
    queryset = Insumos.objects.all()
    serializer_class = InsumosSerializer

class InventarioFuncionarioViewSet(viewsets.ModelViewSet):
    queryset = InventarioFuncionario.objects.all()
    serializer_class = InventarioFuncionarioSerializer

class CardexInsumoFuncionarioViewSet(viewsets.ModelViewSet):
    queryset = CardexInsumoFuncionario.objects.all()
    serializer_class = CardexInsumoFuncionarioSerializer
