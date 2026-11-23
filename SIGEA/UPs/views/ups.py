from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes

from SIGEAsite.permissions import SigeaModelPermissionMixin, OwnedQuerysetMixin, IsStaff, IsInGroup, es_staff
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import FileResponse
import logging

logger = logging.getLogger(__name__)

from ..models import UP
from ..serializers import UPSerializer, UP_RELACIONADAS
from ..services.archivos_service import ArchivoInvalido, guardar_archivo


def puede_ver_up(user, up):
    """Staff (Administradores/Funcionarios) o el productor dueño de la UP."""
    if es_staff(user):
        return True
    productor = getattr(user, 'productores', None)
    return productor is not None and up.Productor_id == productor.id


def _sin_permiso_up():
    return Response({"error": "No tiene permiso sobre esta UP"}, status=status.HTTP_403_FORBIDDEN)

class UPViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'Productor__usuario'
    queryset = UP.objects.select_related(*UP_RELACIONADAS).order_by('id')
    serializer_class = UPSerializer

ESTADO_EN_REVISION = 'En revision'
ESTADO_ACEPTADA = 'Aceptada'
ESTADO_RECHAZADA = 'Rechazada'


def _a_booleano(valor):
    """True/False para valores booleanos claros; None si no se puede interpretar.

    Evita que 'false' o 'no' (cadenas no vacias) se tomen como verdadero.
    """
    if isinstance(valor, bool):
        return valor
    if isinstance(valor, int) and valor in (0, 1):
        return bool(valor)
    if isinstance(valor, str):
        texto = valor.strip().lower()
        if texto in ('true', '1', 'si', 'sí'):
            return True
        if texto in ('false', '0', 'no'):
            return False
    return None


def quitar_qr(up):
    """Elimina el codigo QR de una UP que deja de estar aceptada."""
    if up.CodigoQR:
        up.CodigoQR.delete(save=False)
    up.CodigoQR = None


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsInGroup('Administradores')])
@transaction.atomic
def validar_ups(request, upId=None):
    from ..models import EstadosUP
    from ..serializers.mixins import get_o_crear
    from Visitas.models import Visitas
    from Usuarios.models import Administradores

    get_object_or_404(UP, id=upId)
    up = UP.objects.select_for_update().get(id=upId)

    aprobada = request.data.get('aprobada')
    if aprobada is None:
        return Response({"error": "El campo 'aprobada' es requerido"}, status=status.HTTP_400_BAD_REQUEST)
    aprobada = _a_booleano(aprobada)
    if aprobada is None:
        return Response({"error": "El campo 'aprobada' debe ser verdadero o falso"}, status=status.HTTP_400_BAD_REQUEST)

    motivo = str(request.data.get('motivo') or '').strip()
    if not aprobada and not motivo:
        return Response({"motivo": "Indique el motivo del rechazo"}, status=status.HTTP_400_BAD_REQUEST)

    # Solo se valida una UP pendiente ("En revision") ya caracterizada.
    estado_actual = up.idEstado.Estado if up.idEstado_id else ESTADO_EN_REVISION
    if estado_actual != ESTADO_EN_REVISION:
        return Response(
            {"error": f"La UP ya fue validada ({estado_actual})"},
            status=status.HTTP_409_CONFLICT,
        )
    if not Visitas.objects.filter(Solicitud__UP=up, estado=True).exists():
        return Response(
            {"error": "La UP aún no tiene una visita de caracterización finalizada"},
            status=status.HTTP_409_CONFLICT,
        )

    estado_nombre = ESTADO_ACEPTADA if aprobada else ESTADO_RECHAZADA
    estado = get_o_crear(EstadosUP, Estado=estado_nombre)  # tolera duplicados
    up.idEstado = estado
    up.MotivoRechazo = '' if aprobada else motivo
    up.ValidadoPor = Administradores.objects.filter(usuario=request.user).first()
    up.FechaValidacion = timezone.now()
    if not aprobada:
        quitar_qr(up)
    up.save()

    serializer = UPSerializer(up)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_ups(request):
    productor = getattr(request.user, 'productores', None)
    if not productor:
        return Response([])
    ups = UP.objects.filter(Productor=productor).select_related(*UP_RELACIONADAS).order_by('id')
    serializer = UPSerializer(ups, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStaff])
def upload_archivo_up(request, userId=None):
    archivo = request.FILES.get('archivo')
    if not archivo:
        return Response({"error": "No se recibió ningún archivo"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ruta = guardar_archivo(archivo)
    except ArchivoInvalido as exc:
        return Response({"error": exc.mensaje}, status=exc.status)

    # RutaArchivo es una ruta privada: el archivo se descarga con
    # GET /api/UPs/archivosUP/<id>/descargar/ (valida el dueño de la UP).
    return Response({"RutaArchivo": ruta, "NombreArchivo": archivo.name})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStaff])
def buscar_up_por_ruea(request):
    ruea = request.query_params.get('ruea', '').strip()
    if not ruea:
        return Response(
            {"error": "El parámetro 'ruea' es requerido"},
            status=status.HTTP_400_BAD_REQUEST
        )

    up = get_object_or_404(UP, RUEA__iexact=ruea)
    serializer = UPSerializer(up)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generar_qr(request, upId=None):
    up = get_object_or_404(UP, id=upId)

    if not puede_ver_up(request.user, up):
        return _sin_permiso_up()

    try:
        if up.idEstado and up.idEstado.Estado != 'Aceptada':
            return Response(
                {"error": "Solo se puede generar QR para UPs aceptadas"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from ..services.qr_service import generar_qr_up
        generar_qr_up(upId)

        up.refresh_from_db()
        serializer = UPSerializer(up)
        return Response(serializer.data)
    except Exception:
        # El detalle queda en el log del servidor; no se expone al cliente.
        logger.exception("Error generando QR de la UP %s", upId)
        return Response(
            {"error": "No se pudo generar el código QR"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_qr(request, upId=None):
    up = get_object_or_404(UP, id=upId)
    if not puede_ver_up(request.user, up):
        return _sin_permiso_up()

    if not up.CodigoQR:
        return Response(
            {"error": "Esta UP no tiene código QR generado"},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({"qr_url": up.CodigoQR.url})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def descargar_qr(request, upId=None):
    up = get_object_or_404(UP, id=upId)
    if not puede_ver_up(request.user, up):
        return _sin_permiso_up()

    if not up.CodigoQR:
        return Response(
            {"error": "Esta UP no tiene código QR generado"},
            status=status.HTTP_404_NOT_FOUND
        )

    response = FileResponse(up.CodigoQR.open('rb'), content_type='image/png')
    response['Content-Disposition'] = f'attachment; filename="qr_{up.RUEA}.png"'
    return response
