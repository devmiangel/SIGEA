from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import Group
from django.db.models import Prefetch, Q

from SIGEAsite.permissions import SigeaModelPermissionMixin, SigeaModelPermissions, OwnedQuerysetMixin, IsStaff
from SIGEAsite.filters import filtrar_texto
from rest_framework.permissions import IsAuthenticated

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
from ..serializers.usuarios import rol_de_usuario


def _usuarios_con_rol(queryset):
    """Precarga lo que UsuarioSerializer lee de cada usuario (persona, rol y conductor)
    para que listar N usuarios cueste un número fijo de consultas y no ~6 por usuario."""
    from Inventario.models import Conductores
    return queryset.select_related(
        'persona__TipoDocumento', 'administradores', 'funcionarios', 'productores',
    ).prefetch_related(
        'groups',
        Prefetch(
            'funcionarios__conductores_set',
            queryset=Conductores.objects.filter(Estado=True),
            to_attr='conductores_activos',
        ),
    )


class TiposDocumentosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposDocumentos.objects.all()
    serializer_class = TiposDocumentosSerializer

    def get_permissions(self):
        # El formulario de registro es público (AllowAny) y necesita
        # listar los tipos de documento sin token. El resto sigue
        # exigiendo autenticación + permiso de modelo.
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated(), SigeaModelPermissions()]

class PersonasViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'usuario'
    queryset = Personas.objects.all()
    serializer_class = PersonasSerializer

class EmpresasViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'personas__usuario'
    queryset = Empresas.objects.all()
    serializer_class = EmpresasSerializer

class UsuarioViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'pk'
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    ##permission_classes = [IsAuthenticated]  ###activar cuando se tenga el login funcionando

    def get_queryset(self):
        queryset = _usuarios_con_rol(super().get_queryset())
        params = self.request.query_params
        queryset = filtrar_texto(
            queryset,
            params.get('search'),
            [
                'email',
                'persona__primer_nombre',
                'persona__segundo_nombre',
                'persona__primer_apellido',
                'persona__segundo_apellido',
                'persona__numero_documento',
            ],
        )
        rol = params.get('rol')
        if rol == 'Administradores':
            queryset = queryset.filter(administradores__isnull=False)
        elif rol == 'Funcionarios':
            queryset = queryset.filter(funcionarios__isnull=False)
        elif rol == 'Productores':
            queryset = queryset.filter(productores__isnull=False)
        elif rol == 'Usuarios':
            queryset = queryset.exclude(
                Q(administradores__isnull=False)
                | Q(funcionarios__isnull=False)
                | Q(productores__isnull=False)
            ).filter(groups__name='Usuarios')
        return queryset.distinct()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsStaff])
    def buscar(self, request):
        q = (request.query_params.get('q') or '').strip()

        usuarios = _usuarios_con_rol(Usuario.objects.all()).exclude(
            Q(administradores__isnull=False) | Q(funcionarios__isnull=False)
        )

        if q:
            usuarios = usuarios.filter(
                Q(email__icontains=q) |
                Q(persona__primer_nombre__icontains=q) |
                Q(persona__segundo_nombre__icontains=q) |
                Q(persona__primer_apellido__icontains=q) |
                Q(persona__segundo_apellido__icontains=q) |
                Q(persona__numero_documento__icontains=q)
            ).distinct()

        # Sin `q` devuelve todos los usuarios no staff: se pagina como cualquier listado.
        pagina = self.paginate_queryset(usuarios.order_by('id'))
        return self.get_paginated_response(UsuarioSerializer(pagina, many=True).data)

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

        # Mantener is_active sincronizado con Estado
        usuario.is_active = usuario.Estado
        usuario.save(update_fields=['is_active'])

        # 3. Reasignar rol si cambió
        rol = data.get('rol')
        if rol:
            rol_actual = rol_de_usuario(instance)
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

        # 4. Gestionar el rol de conductor (complemento de Funcionarios)
        if rol == 'Funcionarios':
            from Inventario.models import Conductores
            funcionario = getattr(instance, 'funcionarios', None)
            if funcionario is None:
                funcionario = Funcionarios.objects.create(usuario=instance)

            es_conductor = data.get('es_conductor')
            licencia = data.get('licencia')

            if es_conductor:
                licencia = str(licencia or '').strip()
                if not licencia:
                    return Response({'error': 'La licencia es requerida para el rol de conductor'}, status=400)
                conductor, _ = Conductores.objects.get_or_create(
                    Funcionario=funcionario,
                    defaults={'Licencia': licencia, 'Estado': True},
                )
                conductor.Licencia = licencia
                conductor.Estado = True
                conductor.save()
            else:
                Conductores.objects.filter(Funcionario=funcionario).update(Estado=False)

        # Se relee el usuario: el objeto en memoria conserva el rol y el conductor
        # que tenía antes de los cambios de los pasos 3 y 4.
        actualizado = _usuarios_con_rol(Usuario.objects.all()).get(pk=usuario.pk)
        return Response(UsuarioSerializer(actualizado).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        return self._actualizar_usuario(instance, request.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        return self._actualizar_usuario(instance, request.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.Estado = False
        instance.is_active = False
        instance.save(update_fields=['Estado', 'is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def detalle(self, request, pk=None):
        from UPs.models import UP
        from UPs.serializers import UPSerializer, UP_RELACIONADAS
        from Inventario.models import InventarioFuncionario, CardexInsumoFuncionario, AsignacionHerramientas, RegistroAsignacionVehiculos

        instance = self.get_object()
        rol = rol_de_usuario(instance)
        data = {
            'usuario': UsuarioSerializer(instance).data,
            'rol': rol,
        }

        if rol == 'Productores':
            productor = getattr(instance, 'productores', None)
            ups = (
                UP.objects.filter(Productor=productor).select_related(*UP_RELACIONADAS)
                if productor else UP.objects.none()
            )
            data['ups'] = UPSerializer(ups, many=True).data
        elif rol == 'Funcionarios':
            funcionario = getattr(instance, 'funcionarios', None)
            insumos = []
            herramientas = []
            vehiculos = []
            if funcionario:
                inventario = InventarioFuncionario.objects.filter(Funcionario=funcionario)
                cardex = {
                    item.Insumo_id: item
                    for item in CardexInsumoFuncionario.objects.filter(Funcionario=funcionario).order_by('Insumo_id', '-id')
                }
                for item in inventario:
                    cardex_item = cardex.get(item.Insumo_id)
                    insumos.append({
                        'id': item.id,
                        'Insumo': item.Insumo_id,
                        'insumo_nombre': item.Insumo.Nombre if item.Insumo_id else None,
                        'unidad': item.Insumo.Unidades.Unidad if item.Insumo_id else None,
                        'cantidad': item.Cantidad,
                        'fecha_asignacion': cardex_item.FechaAsignacion if cardex_item else None,
                    })
                herramientas = [
                    {
                        'id': item.id,
                        'Herramienta': item.Herramienta_id,
                        'herramienta_nombre': item.Herramienta.Herramienta if item.Herramienta_id else None,
                        'FechaAsignacion': item.FechaAsignacion,
                        'FechaDevolucion': item.FechaDevolucion,
                        'Entregado': item.Entregado,
                    }
                    for item in AsignacionHerramientas.objects.filter(Funcionario=funcionario)
                ]
                vehiculos = [
                    {
                        'id': item.id,
                        'placa': item.DetalleVehiculo.Placa if item.DetalleVehiculo_id else None,
                        'modelo': item.DetalleVehiculo.Modelo if item.DetalleVehiculo_id else None,
                        'FechaAsignacion': item.FechaAsignacion,
                        'FechaDevolucion': item.FechaDevolucion,
                        'Entregado': item.Entregado,
                    }
                    for item in RegistroAsignacionVehiculos.objects.filter(Conductor__Funcionario=funcionario)
                ]
            data['asignaciones'] = {
                'insumos': insumos,
                'herramientas': herramientas,
                'vehiculos': vehiculos,
            }

        return Response(data)

class FuncionariosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    # Solo staff: los demás roles reciben un queryset vacío.
    queryset = Funcionarios.objects.all()
    serializer_class = FuncionariosSerializer

class AdministradoresViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    # Solo staff: los demás roles reciben un queryset vacío.
    queryset = Administradores.objects.all()
    serializer_class = AdministradoresSerializer

class ProductoresViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'usuario'
    queryset = Productores.objects.select_related('usuario__persona').prefetch_related('up_set')
    serializer_class = ProductoresSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params
        queryset = filtrar_texto(
            queryset,
            params.get('search'),
            [
                'usuario__email',
                'usuario__persona__primer_nombre',
                'usuario__persona__segundo_nombre',
                'usuario__persona__primer_apellido',
                'usuario__persona__segundo_apellido',
                'usuario__persona__numero_documento',
            ],
        )
        estado = params.get('estado')
        if estado == 'activo':
            queryset = queryset.filter(Estado=True)
        elif estado == 'inactivo':
            queryset = queryset.filter(Estado=False)
        ups = params.get('ups')
        if ups == 'con':
            queryset = queryset.filter(up__isnull=False)
        elif ups == 'sin':
            queryset = queryset.filter(up__isnull=True)
        tipo_documento = params.get('tipo_documento')
        if tipo_documento and str(tipo_documento).isdigit():
            queryset = queryset.filter(
                usuario__persona__TipoDocumento_id=int(tipo_documento)
            )
        vereda = params.get('vereda')
        if vereda and str(vereda).isdigit():
            queryset = queryset.filter(up__Predio__Sector__Vereda_id=int(vereda))
        sector = params.get('sector')
        if sector and str(sector).isdigit():
            queryset = queryset.filter(up__Predio__Sector_id=int(sector))
        return queryset.distinct()

    @action(detail=True, methods=['get'])
    def detalle(self, request, pk=None):
        """Productor + persona + contactos + UPs asociadas (solo staff)."""
        from UPs.models import UP
        from UPs.serializers import UPSerializer, UP_RELACIONADAS
        from ..serializers import PersonaBasicaSerializer

        productor = self.get_object()
        persona = getattr(productor.usuario, 'persona', None)
        data = self.get_serializer(productor).data
        data['persona'] = PersonaBasicaSerializer(persona).data if persona else None
        data['contactos'] = (
            ContactosSerializer(persona.contactos.all(), many=True).data
            if persona else []
        )
        data['ups'] = UPSerializer(
            UP.objects.filter(Productor=productor).select_related(*UP_RELACIONADAS),
            many=True,
        ).data
        return Response(data)

class TiposContactosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposContactos.objects.all()
    serializer_class = TiposContactosSerializer

class TiposNivelesEducativosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposNivelesEducativos.objects.all()
    serializer_class = TiposNivelesEducativosSerializer

class SisbenViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Sisben.objects.all()
    serializer_class = SisbenSerializer

class ContactosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'personas__usuario'
    queryset = Contactos.objects.all()
    serializer_class = ContactosSerializer
