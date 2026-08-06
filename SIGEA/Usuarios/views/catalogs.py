from rest_framework import viewsets

from ..models import (
    TiposDocumentos,
    Personas,
    Empresas,
    Usuario,
    Funcionarios,
    Administradores,
    Productores,
    TiposContactos,
    TiposNivelesEducativos,
    Sisben,
    Contactos,
)

from ..serializers import (
    TiposDocumentosSerializer,
    PersonasSerializer,
    EmpresasSerializer,
    UsuarioSerializer,
    FuncionariosSerializer,
    AdministradoresSerializer,
    ProductoresSerializer,
    TiposContactosSerializer,
    TiposNivelesEducativosSerializer,
    SisbenSerializer,
    ContactosSerializer,
)

class TiposDocumentosViewSet(viewsets.ModelViewSet):
    queryset = TiposDocumentos.objects.all()
    serializer_class = TiposDocumentosSerializer

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

class TiposContactosViewSet(viewsets.ModelViewSet):
    queryset = TiposContactos.objects.all()
    serializer_class = TiposContactosSerializer

class TiposNivelesEducativosViewSet(viewsets.ModelViewSet):
    queryset = TiposNivelesEducativos.objects.all()
    serializer_class = TiposNivelesEducativosSerializer

class SisbenViewSet(viewsets.ModelViewSet):
    queryset = Sisben.objects.all()
    serializer_class = SisbenSerializer

class ContactosViewSet(viewsets.ModelViewSet):
    queryset = Contactos.objects.all()
    serializer_class = ContactosSerializer
