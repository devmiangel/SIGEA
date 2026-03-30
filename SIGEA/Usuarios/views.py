from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    TiposDocumentos, TiposContactos, TiposNivelesEducativos,
    Sisben, Empresas, Contactos, Personas,
    Usuario, Funcionarios, Administradores, Productores
)

from .serializers import (
    TiposDocumentosSerializer, TiposContactosSerializer,
    TiposNivelesEducativosSerializer, SisbenSerializer,
    EmpresasSerializer, ContactosSerializer, PersonasSerializer,
    UsuarioSerializer, FuncionariosSerializer,
    AdministradoresSerializer, ProductoresSerializer
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    # No se retorna información de rol en el endpoint de login
    return Response({
        "id": user.id,
        "email": user.email,
    })

class PersonasViewSet(viewsets.ModelViewSet):
   queryset = Personas.objects.all()
   serializer_class = PersonasSerializer

class EmpresasViewSet(viewsets.ModelViewSet):
    queryset = Empresas.objects.all()
    serializer_class = EmpresasSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    ##permission_classes = [IsAuthenticated]  ###activar cuando se tenga el login funcionando

class FuncionariosViewSet(viewsets.ModelViewSet):
    queryset = Funcionarios.objects.all()
    serializer_class = FuncionariosSerializer

class AdministradoresViewSet(viewsets.ModelViewSet):
    queryset = Administradores.objects.all()
    serializer_class = AdministradoresSerializer

class ProductoresViewSet(viewsets.ModelViewSet):
    queryset = Productores.objects.all()
    serializer_class = ProductoresSerializer
