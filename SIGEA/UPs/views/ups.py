from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes

from SIGEAsite.permissions import SigeaModelPermissionMixin, OwnedQuerysetMixin, IsStaff, es_staff
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
import logging

logger = logging.getLogger(__name__)

from ..models import UP
from ..serializers import UPSerializer
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
    queryset = UP.objects.all()
    serializer_class = UPSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validar_ups(request, upId=None):
    from ..models import EstadosUP

    up = get_object_or_404(UP, id=upId)

    if not hasattr(request.user, 'administradores') and not request.user.is_staff and not request.user.is_superuser:
        return Response({"error": "Solo un administrador puede validar UPs"}, status=status.HTTP_403_FORBIDDEN)

    aprobada = request.data.get('aprobada')

    if aprobada is None:
        return Response({"error": "El campo 'aprobada' es requerido"}, status=status.HTTP_400_BAD_REQUEST)

    estado_nombre = 'Aceptada' if aprobada else 'Rechazada'
    estado, _ = EstadosUP.objects.get_or_create(Estado=estado_nombre)
    up.idEstado = estado
    up.save()

    serializer = UPSerializer(up)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_ups(request):
    productor = getattr(request.user, 'productores', None)
    if not productor:
        return Response([])
    ups = UP.objects.filter(Productor=productor)
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
