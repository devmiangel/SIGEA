from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import Group
from knox.models import AuthToken
from django.contrib.auth import authenticate

from ..models import Productores, Administradores, Funcionarios
from ..serializers import (
    PersonasSerializer,
    ContactosSerializer,
    UsuarioSerializer,
    LoginSerializer,
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    serializer = UsuarioSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def es_productor(request):
    user = request.user
    es_productor = Productores.objects.filter(usuario=user, Estado=True).exists()
    return Response({'es_productor': es_productor})

## formulario de refistro

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data

    # 1. Crear persona
    persona_serializer = PersonasSerializer(data=data)
    if not persona_serializer.is_valid():
        return Response(persona_serializer.errors, status=400)

    persona = persona_serializer.save()

    # 2. Crear contacto
    email = data.get("email")
    contacto_data = {
        "contacto": email,
        "TipoContacto": 2
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

    usuario = user_serializer.save()

    # 4. Asignar rol
    rol = data.get("rol", "Usuarios")  # Default a Usuarios
    
    if rol == "Administradores":
        Administradores.objects.create(usuario=usuario)
    elif rol == "Funcionarios":
        Funcionarios.objects.create(usuario=usuario)
    elif rol == "Productores":
        Productores.objects.create(usuario=usuario)
    else:
        # Por defecto, asignar al grupo Usuarios
        grupo, _ = Group.objects.get_or_create(name='Usuarios')
        usuario.groups.add(grupo)

    return Response({
        "message": "Usuario registrado correctamente",
        "rol": rol
    })

class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(request, email=email, password=password)
            
            if user:
                _, token = AuthToken.objects.create(user)
                return Response(
                    {
                        'user': LoginSerializer(user).data,
                        'token': token
                    }
                )
            else:
                return Response({'error': 'invalid credentials'}, status=401)
        else:
            return Response(serializer.errors, status=400)
