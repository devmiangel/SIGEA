from django.shortcuts import render
from rest_framework import viewsets

from rest_framework import viewsets
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


class PersonasViewSet(viewsets.ModelViewSet):
    queryset = Personas.objects.all()
    serializer_class = PersonasSerializer

class EmpresasViewSet(viewsets.ModelViewSet):
    queryset = Empresas.objects.all()
    serializer_class = EmpresasSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class FuncionariosViewSet(viewsets.ModelViewSet):
    queryset = Funcionarios.objects.all()
    serializer_class = FuncionariosSerializer

class AdministradoresViewSet(viewsets.ModelViewSet):
    queryset = Administradores.objects.all()
    serializer_class = AdministradoresSerializer

class ProductoresViewSet(viewsets.ModelViewSet):
    queryset = Productores.objects.all()
    serializer_class = ProductoresSerializer
