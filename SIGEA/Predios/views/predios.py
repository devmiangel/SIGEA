from rest_framework import viewsets

from ..models import Predios

from ..serializers import PrediosSerializer

class PrediosViewSet(viewsets.ModelViewSet):
    queryset = Predios.objects.all()
    serializer_class = PrediosSerializer
