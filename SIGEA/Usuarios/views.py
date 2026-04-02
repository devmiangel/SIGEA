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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    # No se retorna información de rol en el endpoint de login
    return Response({
        "id": user.id,
        "email": user.email,
    })

## formulario de refistro

@api_view(['POST'])
def register(request):
    data = request.data

    # 1. Crear persona
    persona_serializer = PersonasSerializer(data=data)
    if not persona_serializer.is_valid(): #hace las validaciones del serializeer
        return Response(persona_serializer.errors, status=400)

    persona = persona_serializer.save() #guarda la persona

    # creaemai
    email = data.get("email")

    contacto_data = {
        "contacto": email,
        "TipoContacto": 2  #debe ser el mismo que tenga en la db como email tipo de contacauh
    }

    contacto_serializer = ContactosSerializer(data=contacto_data)
    if not contacto_serializer.is_valid():
        return Response(contacto_serializer.errors, status=400)

    contacto = contacto_serializer.save()

    persona.contactos.add(contacto)

    # 3. Crear usuario
    user_data = {
        "email": email,
        "password": data.get("password"),
        "persona": persona.id
    }

    user_serializer = UsuarioSerializer(data=user_data)
    if not user_serializer.is_valid():
        return Response(user_serializer.errors, status=400)

    user_serializer.save()

    return Response({
        "message": "Usuario registrado correctamente"
    })