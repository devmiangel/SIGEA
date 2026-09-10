from rest_framework import viewsets

from SIGEAsite.permissions import SigeaModelPermissionMixin

from ..models import Predios

from ..serializers import PrediosSerializer

class PrediosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Predios.objects.all()
    serializer_class = PrediosSerializer
