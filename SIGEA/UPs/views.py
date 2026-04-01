from rest_framework import viewsets
from .models import UP
from .serializers import CaracterizacionUPsSerializer

class UPsViewSet(viewsets.ModelViewSet):
    queryset = UP.objects.all()
    serializer_class = CaracterizacionUPsSerializer