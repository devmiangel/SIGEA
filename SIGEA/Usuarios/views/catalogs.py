from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import Group

from SIGEAsite.permissions import SigeaModelPermissionMixin

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

class TiposDocumentosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposDocumentos.objects.all()
    serializer_class = TiposDocumentosSerializer

class PersonasViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
   queryset = Personas.objects.all()
   serializer_class = PersonasSerializer

class EmpresasViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Empresas.objects.all()
    serializer_class = EmpresasSerializer

class UsuarioViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
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

        # Mantener is_active sincronizado con Estado
        usuario.is_active = usuario.Estado
        usuario.save(update_fields=['is_active'])

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

        return Response(UsuarioSerializer(usuario).data)

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
        from UPs.serializers import UPSerializer
        from Inventario.models import InventarioFuncionario, CardexInsumoFuncionario, AsignacionHerramientas, RegistroAsignacionVehiculos

        instance = self.get_object()
        rol = UsuarioSerializer().get_rol(instance)
        data = {
            'usuario': UsuarioSerializer(instance).data,
            'rol': rol,
        }

        if rol == 'Productores':
            productor = getattr(instance, 'productores', None)
            ups = UP.objects.filter(Productor=productor) if productor else UP.objects.none()
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

class FuncionariosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Funcionarios.objects.all()
    serializer_class = FuncionariosSerializer

class AdministradoresViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Administradores.objects.all()
    serializer_class = AdministradoresSerializer

class ProductoresViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Productores.objects.all()
    serializer_class = ProductoresSerializer

class TiposContactosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposContactos.objects.all()
    serializer_class = TiposContactosSerializer

class TiposNivelesEducativosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposNivelesEducativos.objects.all()
    serializer_class = TiposNivelesEducativosSerializer

class SisbenViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Sisben.objects.all()
    serializer_class = SisbenSerializer

class ContactosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Contactos.objects.all()
    serializer_class = ContactosSerializer
