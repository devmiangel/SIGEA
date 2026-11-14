from rest_framework import viewsets

from SIGEAsite.permissions import SigeaModelPermissionMixin, OwnedQuerysetMixin

from ..models import Predios

from ..serializers import PrediosSerializer

class PrediosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'up__Productor__usuario'
    queryset = Predios.objects.all()
    serializer_class = PrediosSerializer
