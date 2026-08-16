from rest_framework import viewsets
from rest_framework.response import Response
from django.contrib.auth.models import Group

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

    def _actualizar_usuario(self, instance, data):
        # 1. Actualizar datos de la persona
        persona_data = data.get('persona')
        if persona_data and instance.persona:
            persona_serializer = PersonasSerializer(
                instance.persona, data=persona_data, partial=True
            )
            if not persona_serializer.is_valid():
                return Response(persona_serializer.errors, status=400)
            persona_serializer.save()

        # 2. Actualizar email, estado y opcionalmente la contraseña
        user_data = {
            'email': data.get('email', instance.email),
            'Estado': data.get('Estado', instance.Estado),
        }
        password = data.get('password')
        if password:
            user_data['password'] = password

        usuario_serializer = UsuarioSerializer(
            instance, data=user_data, partial=True
        )
        if not usuario_serializer.is_valid():
            return Response(usuario_serializer.errors, status=400)
        usuario = usuario_serializer.save()

        # 3. Reasignar rol si cambió
        rol = data.get('rol')
        if rol:
            rol_actual = UsuarioSerializer().get_rol(instance)
            if rol != rol_actual:
                for model in (Administradores, Funcionarios, Productores):
                    model.objects.filter(usuario=instance).delete()
                instance.groups.clear()
                if rol == 'Administradores':
                    Administradores.objects.create(usuario=instance)
                elif rol == 'Funcionarios':
                    Funcionarios.objects.create(usuario=instance)
                elif rol == 'Productores':
                    Productores.objects.create(usuario=instance)
                else:
                    grupo, _ = Group.objects.get_or_create(name='Usuarios')
                    instance.groups.add(grupo)

        return Response(UsuarioSerializer(usuario).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        return self._actualizar_usuario(instance, request.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        return self._actualizar_usuario(instance, request.data)

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
