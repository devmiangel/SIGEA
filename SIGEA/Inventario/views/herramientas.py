from datetime import date

from django.db import transaction
from rest_framework import viewsets
from SIGEAsite.permissions import SigeaModelPermissionMixin
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import TiposHerramientas, Herramientas, AsignacionHerramientas

from .utils import (
    CatalogoUnicoMixin,
    Conflicto,
    ErrorAsignacion,
    SoloPropiosFuncionarioMixin,
    administrador_de,
    funcionario_activo,
)
from ..serializers import (
    TiposHerramientasSerializer,
    HerramientasSerializer,
    AsignacionHerramientasSerializer,
)

class TiposHerramientasViewSet(CatalogoUnicoMixin, SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposHerramientas.objects.all()
    serializer_class = TiposHerramientasSerializer
    campos_unicos = ('TipoHerramienta',)
    prefijo_clave = 'tipo_herramienta'

class HerramientasViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Herramientas.objects.all()
    serializer_class = HerramientasSerializer

    def perform_update(self, serializer):
        with transaction.atomic():
            herramienta = Herramientas.objects.select_for_update().get(
                pk=serializer.instance.pk
            )
            nuevo_estado = serializer.validated_data.get('Estado', herramienta.Estado)
            if nuevo_estado is False and AsignacionHerramientas.objects.filter(
                Herramienta=herramienta, Entregado=False
            ).exists():
                raise Conflicto(
                    'No se puede desactivar una herramienta con una asignación activa.'
                )
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        with transaction.atomic():
            herramienta = Herramientas.objects.select_for_update().filter(
                pk=kwargs['pk']
            ).first()
            if herramienta is None:
                return Response({'detail': 'No encontrado.'}, status=404)

            asignaciones = AsignacionHerramientas.objects.filter(
                Herramienta=herramienta
            )
            if asignaciones.filter(Entregado=False).exists():
                raise Conflicto(
                    'No se puede eliminar una herramienta con una asignación activa.'
                )
            if asignaciones.exists():
                herramienta.Estado = False
                herramienta.save(update_fields=['Estado'])
                return Response({
                    'detail': 'La herramienta tiene historial; se desactivó en lugar de eliminarse.',
                })
            herramienta.delete()
        return Response(status=204)

# Solo lectura: las asignaciones se crean con asignar_herramienta_directo y se
# cierran con devolver_herramienta.
class AsignacionHerramientasViewSet(SigeaModelPermissionMixin, SoloPropiosFuncionarioMixin, viewsets.ReadOnlyModelViewSet):
    queryset = AsignacionHerramientas.objects.all()
    serializer_class = AsignacionHerramientasSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_herramienta_directo(request, herramienta_id):
    administrador = administrador_de(request.user)
    if not administrador:
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    try:
        with transaction.atomic():
            # Se bloquea la herramienta: dos asignaciones simultaneas no pueden
            # dejarla entregada a dos funcionarios.
            herramienta = Herramientas.objects.select_for_update().filter(pk=herramienta_id).first()
            if herramienta is None:
                raise ErrorAsignacion('La herramienta no existe', 404)
            if not herramienta.Estado:
                raise ErrorAsignacion('La herramienta no está disponible')
            if AsignacionHerramientas.objects.filter(Herramienta=herramienta, Entregado=False).exists():
                raise ErrorAsignacion('La herramienta ya se encuentra asignada')

            funcionario = funcionario_activo(request.data.get('funcionario_id'))
            asignacion = AsignacionHerramientas.objects.create(
                Herramienta=herramienta,
                Funcionario=funcionario,
                Administrador=administrador,
                FechaAsignacion=date.today(),
            )
    except ErrorAsignacion as exc:
        return exc.respuesta()

    serializer = AsignacionHerramientasSerializer(asignacion)
    return Response(serializer.data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def devolver_herramienta(request, asignacion_id):
    """El administrador registra la devolucion: la herramienta queda disponible."""
    if not administrador_de(request.user):
        return Response({'error': 'El usuario autenticado no es un administrador'}, status=403)

    with transaction.atomic():
        asignacion = AsignacionHerramientas.objects.select_for_update().filter(pk=asignacion_id).first()
        if asignacion is None:
            return Response({'error': 'La asignación no existe'}, status=404)
        if asignacion.Entregado:
            return Response({'error': 'La herramienta ya fue devuelta'}, status=409)
        asignacion.Entregado = True
        asignacion.FechaDevolucion = date.today()
        asignacion.save(update_fields=['Entregado', 'FechaDevolucion'])

    return Response(AsignacionHerramientasSerializer(asignacion).data)
