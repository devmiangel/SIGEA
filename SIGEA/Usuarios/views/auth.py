from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import Group
from knox.models import AuthToken
from django.contrib.auth import authenticate
from django.db import transaction

from ..models import Productores, Administradores, Funcionarios
from ..throttles import LoginEmailThrottle, LoginIPThrottle, RegisterThrottle
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

## formulario de registro

ROLES_VALIDOS = ("Administradores", "Funcionarios", "Productores", "Usuarios")


class _RegistroInvalido(Exception):
    """Aborta la transacción del registro devolviendo los errores del serializer."""

    def __init__(self, errors):
        self.errors = errors


def _es_administrador(user):
    return bool(
        user
        and user.is_authenticated
        and (user.is_superuser or user.groups.filter(name="Administradores").exists())
    )


def _resolver_rol(request):
    """El registro público SIEMPRE crea el rol 'Usuarios'. Solo un administrador
    autenticado puede crear usuarios con otro rol (formulario de usuarios del admin)."""
    rol = request.data.get("rol") or "Usuarios"
    if rol not in ROLES_VALIDOS or not _es_administrador(request.user):
        return "Usuarios"
    return rol


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def register(request):
    try:
        with transaction.atomic():
            usuario, rol = _crear_usuario_registro(request)
    except _RegistroInvalido as exc:
        return Response(exc.errors, status=400)

    return Response({
        "message": "Usuario registrado correctamente",
        "rol": rol
    })


def _crear_usuario_registro(request):
    data = request.data

    # 1. Crear persona
    persona_serializer = PersonasSerializer(data=data)
    if not persona_serializer.is_valid():
        raise _RegistroInvalido(persona_serializer.errors)

    persona = persona_serializer.save()

    # 2. Crear contacto
    email = data.get("email")
    contacto_data = {
        "contacto": email,
        "TipoContacto": 2
    }

    contacto_serializer = ContactosSerializer(data=contacto_data)
    if not contacto_serializer.is_valid():
        raise _RegistroInvalido(contacto_serializer.errors)

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
        raise _RegistroInvalido(user_serializer.errors)

    usuario = user_serializer.save()

    # 4. Asignar rol (el rol enviado por el cliente solo se respeta si quien
    #    registra es un administrador autenticado)
    rol = _resolver_rol(request)

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

    return usuario, rol

class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    # Anti fuerza bruta: límite por IP y por email intentado.
    throttle_scope = 'login'
    throttle_classes = [LoginIPThrottle, LoginEmailThrottle]
    
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
