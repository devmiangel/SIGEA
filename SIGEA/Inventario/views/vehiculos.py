from datetime import date

from django.db import transaction
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from SIGEAsite.permissions import SigeaModelPermissionMixin
from ..validators import normalizar_placa

from ..models import (
    TiposVehiculos,
    TiposCombustibles,
    MarcasVehiculos,
    LineasVehiculos,
    Vehiculos,
    DetalleVehiculos,
    Conductores,
    RegistroAsignacionVehiculos,
)

from .utils import (
    CatalogoUnicoMixin,
    Conflicto,
    ErrorAsignacion,
    SoloPropiosFuncionarioMixin,
    administrador_de,
    bloquear_clave,
    funcionario_activo,
)
from ..serializers import (
    TiposVehiculosSerializer,
    TiposCombustiblesSerializer,
    MarcasVehiculosSerializer,
    LineasVehiculosSerializer,
    VehiculosSerializer,
    DetalleVehiculosSerializer,
    VehiculoCompletoSerializer,
    ConductoresSerializer,
    RegistroAsignacionVehiculosSerializer,
)

class TiposVehiculosViewSet(CatalogoUnicoMixin, SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposVehiculos.objects.all()
    serializer_class = TiposVehiculosSerializer
    campos_unicos = ('TipoVehiculo',)
    prefijo_clave = 'tipo_vehiculo'

class TiposCombustiblesViewSet(CatalogoUnicoMixin, SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposCombustibles.objects.all()
    serializer_class = TiposCombustiblesSerializer
    campos_unicos = ('TipoCombustible',)
    prefijo_clave = 'tipo_combustible'

class MarcasVehiculosViewSet(CatalogoUnicoMixin, SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = MarcasVehiculos.objects.all()
    serializer_class = MarcasVehiculosSerializer
    campos_unicos = ('MarcaVehiculo',)
    prefijo_clave = 'marca_vehiculo'

class LineasVehiculosViewSet(CatalogoUnicoMixin, SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = LineasVehiculos.objects.all()
    serializer_class = LineasVehiculosSerializer
    campos_unicos = ('LineaVehiculo', 'MarcaVehiculo')
    prefijo_clave = 'linea_vehiculo'

class VehiculosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Vehiculos.objects.all()
    serializer_class = VehiculosSerializer

    def create(self, request, *args, **kwargs):
        return Response({
            'detail': 'Cree el vehículo con /inventario/detalleVehiculos/completo/.',
        }, status=405)

    def update(self, request, *args, **kwargs):
        return Response({
            'detail': 'Edite el vehículo con /inventario/detalleVehiculos/{id}/completo/.',
        }, status=405)

    partial_update = update

    def destroy(self, request, *args, **kwargs):
        with transaction.atomic():
            vehiculo = Vehiculos.objects.select_for_update().filter(
                pk=kwargs['pk']
            ).first()
            if vehiculo is None:
                return Response({'detail': 'No encontrado.'}, status=404)
            if DetalleVehiculos.objects.filter(Vehiculo=vehiculo).exists():
                raise Conflicto(
                    'No se puede eliminar un registro de vehículo con detalles asociados.'
                )
            vehiculo.delete()
        return Response(status=204)

class DetalleVehiculosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = DetalleVehiculos.objects.select_related(
        'Vehiculo__LineaVehiculo__MarcaVehiculo',
        'Vehiculo__TipoVehiculo',
        'Vehiculo__TipoCombustible',
    )
    serializer_class = DetalleVehiculosSerializer

    @staticmethod
    def _exigir_permisos(request, codigos):
        faltantes = [
            codigo for codigo in codigos
            if not request.user.has_perm(f'Inventario.{codigo}')
        ]
        if faltantes:
            raise PermissionDenied('No tiene permisos para esta operación.')

    def perform_create(self, serializer):
        with transaction.atomic():
            vehiculo = serializer.validated_data.get('Vehiculo')
            if vehiculo is not None:
                vehiculo = Vehiculos.objects.select_for_update().get(pk=vehiculo.pk)
                if DetalleVehiculos.objects.filter(Vehiculo=vehiculo).exists():
                    raise Conflicto(
                        'El registro de vehículo ya tiene un detalle asociado.'
                    )
            placa = serializer.validated_data.get('Placa')
            if placa:
                bloquear_clave(f'placa:{normalizar_placa(placa).lower()}')
                if DetalleVehiculos.objects.filter(Placa__iexact=placa).exists():
                    raise Conflicto('Ya existe un vehículo con esa placa.')
            serializer.save()

    def perform_update(self, serializer):
        with transaction.atomic():
            detalle = DetalleVehiculos.objects.select_for_update().get(
                pk=serializer.instance.pk
            )
            placa = serializer.validated_data.get('Placa')
            if placa:
                bloquear_clave(f'placa:{normalizar_placa(placa).lower()}')
                if DetalleVehiculos.objects.filter(
                    Placa__iexact=placa
                ).exclude(pk=detalle.pk).exists():
                    raise Conflicto('Ya existe otro vehículo con esa placa.')
            nuevo_estado = serializer.validated_data.get('Estado', detalle.Estado)
            if nuevo_estado is False and RegistroAsignacionVehiculos.objects.filter(
                DetalleVehiculo=detalle, Entregado=False
            ).exists():
                raise Conflicto(
                    'No se puede desactivar un vehículo con una asignación activa.'
                )
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        with transaction.atomic():
            detalle = DetalleVehiculos.objects.select_for_update().filter(
                pk=kwargs['pk']
            ).first()
            if detalle is None:
                return Response({'detail': 'No encontrado.'}, status=404)

            asignaciones = RegistroAsignacionVehiculos.objects.filter(
                DetalleVehiculo=detalle
            )
            if asignaciones.filter(Entregado=False).exists():
                raise Conflicto(
                    'No se puede eliminar un vehículo con una asignación activa.'
                )
            if asignaciones.exists():
                detalle.Estado = False
                detalle.save(update_fields=['Estado'])
                return Response({
                    'detail': 'El vehículo tiene historial; se desactivó en lugar de eliminarse.',
                })

            vehiculo_id = detalle.Vehiculo_id
            detalle.delete()
            if not DetalleVehiculos.objects.filter(Vehiculo_id=vehiculo_id).exists():
                Vehiculos.objects.filter(pk=vehiculo_id).delete()
        return Response(status=204)

    @action(detail=False, methods=['post'], url_path='completo')
    def crear_completo(self, request):
        """Alta atómica: crea la spec (Vehiculos) y el detalle en una transacción."""
        self._exigir_permisos(request, ['add_detallevehiculos', 'add_vehiculos'])
        serializer = VehiculoCompletoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        placa = data['Placa']

        with transaction.atomic():
            bloquear_clave(f'placa:{placa.lower()}')
            if DetalleVehiculos.objects.filter(Placa__iexact=placa).exists():
                raise Conflicto('Ya existe un vehículo con esa placa.')

            registro = Vehiculos.objects.create(
                LineaVehiculo=data['LineaVehiculo'],
                TipoCombustible=data['TipoCombustible'],
                TipoVehiculo=data['TipoVehiculo'],
            )
            detalle = DetalleVehiculos.objects.create(
                Vehiculo=registro,
                Placa=placa,
                Modelo=data['Modelo'],
                FechaTecno=data['FechaTecno'],
                FechaSoat=data['FechaSoat'],
                Descripcion=data.get('Descripcion', ''),
                Estado=data.get('Estado', True),
            )

        return Response(DetalleVehiculosSerializer(detalle).data, status=201)

    @action(detail=True, methods=['patch'], url_path='completo')
    def editar_completo(self, request, pk=None):
        """Edición atómica de detalle + spec, con copy-on-write si la spec se comparte."""
        self._exigir_permisos(request, ['change_detallevehiculos', 'change_vehiculos'])
        serializer = VehiculoCompletoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        placa = data['Placa']

        with transaction.atomic():
            detalle = DetalleVehiculos.objects.select_for_update().filter(
                pk=pk
            ).first()
            if detalle is None:
                return Response({'detail': 'No encontrado.'}, status=404)

            bloquear_clave(f'placa:{placa.lower()}')
            if DetalleVehiculos.objects.filter(
                Placa__iexact=placa
            ).exclude(pk=detalle.pk).exists():
                raise Conflicto('Ya existe otro vehículo con esa placa.')

            nuevo_estado = data.get('Estado', detalle.Estado)
            if nuevo_estado is False and RegistroAsignacionVehiculos.objects.filter(
                DetalleVehiculo=detalle, Entregado=False
            ).exists():
                raise Conflicto(
                    'No se puede desactivar un vehículo con una asignación activa.'
                )

            registro = Vehiculos.objects.select_for_update().get(
                pk=detalle.Vehiculo_id
            )
            compartido = DetalleVehiculos.objects.filter(
                Vehiculo=registro
            ).exclude(pk=detalle.pk).exists()

            if compartido:
                registro = Vehiculos.objects.create(
                    LineaVehiculo=data['LineaVehiculo'],
                    TipoCombustible=data['TipoCombustible'],
                    TipoVehiculo=data['TipoVehiculo'],
                )
                detalle.Vehiculo = registro
            else:
                registro.LineaVehiculo = data['LineaVehiculo']
                registro.TipoCombustible = data['TipoCombustible']
                registro.TipoVehiculo = data['TipoVehiculo']
                registro.save(
                    update_fields=[
                        'LineaVehiculo',
                        'TipoCombustible',
                        'TipoVehiculo',
                    ]
                )

            detalle.Placa = placa
            detalle.Modelo = data['Modelo']
            detalle.FechaTecno = data['FechaTecno']
            detalle.FechaSoat = data['FechaSoat']
            detalle.Descripcion = data.get('Descripcion', '')
            detalle.Estado = nuevo_estado
            detalle.save()

        return Response(DetalleVehiculosSerializer(detalle).data)

class ConductoresViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Conductores.objects.all()
    serializer_class = ConductoresSerializer

# Solo lectura: las asignaciones se crean con asignar_vehiculo_directo y se
# cierran con devolver_vehiculo.
class RegistroAsignacionVehiculosViewSet(SigeaModelPermissionMixin, SoloPropiosFuncionarioMixin, viewsets.ReadOnlyModelViewSet):
    funcionario_lookup = 'Conductor__Funcionario__usuario'
    queryset = RegistroAsignacionVehiculos.objects.all()
    serializer_class = RegistroAsignacionVehiculosSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_vehiculo_directo(request, detalle_vehiculo_id):
    administrador = administrador_de(request.user)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        with transaction.atomic():
            # Se bloquea el vehiculo: dos asignaciones simultaneas no pueden
            # dejarlo entregado a dos conductores.
            detalle = DetalleVehiculos.objects.select_for_update().filter(pk=detalle_vehiculo_id).first()
            if detalle is None:
                raise ErrorAsignacion('El vehículo no existe', 404)
            if not detalle.Estado:
                raise ErrorAsignacion('El vehículo no está disponible')
            if RegistroAsignacionVehiculos.objects.filter(DetalleVehiculo=detalle, Entregado=False).exists():
                raise ErrorAsignacion('El vehículo ya se encuentra asignado')

            funcionario = funcionario_activo(request.data.get('funcionario_id'))
            conductor = Conductores.objects.filter(Funcionario=funcionario, Estado=True).first()
            if conductor is None:
                raise ErrorAsignacion('El funcionario seleccionado no tiene una licencia de conductor registrada')

            asignacion = RegistroAsignacionVehiculos.objects.create(
                DetalleVehiculo=detalle,
                Conductor=conductor,
                Administrador=administrador,
                FechaAsignacion=date.today(),
            )
    except ErrorAsignacion as exc:
        return exc.respuesta()

    serializer = RegistroAsignacionVehiculosSerializer(asignacion)
    return Response(serializer.data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def devolver_vehiculo(request, asignacion_id):
    """El administrador registra la devolucion: el vehiculo queda disponible."""
    if not administrador_de(request.user):
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    with transaction.atomic():
        asignacion = RegistroAsignacionVehiculos.objects.select_for_update().filter(pk=asignacion_id).first()
        if asignacion is None:
            return Response({'error': 'La asignación no existe'}, status=404)
        if asignacion.Entregado:
            return Response({'error': 'El vehículo ya fue devuelto'}, status=409)
        asignacion.Entregado = True
        asignacion.FechaDevolucion = date.today()
        asignacion.save(update_fields=['Entregado', 'FechaDevolucion'])

    return Response(RegistroAsignacionVehiculosSerializer(asignacion).data)
