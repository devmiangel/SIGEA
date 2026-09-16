from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes

from SIGEAsite.permissions import SigeaModelPermissionMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
import traceback

from ..models import UP
from ..serializers import UPSerializer

class UPViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = UP.objects.all()
    serializer_class = UPSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validar_ups(request, upId=None):
    from ..models import EstadosUP

    up = get_object_or_404(UP, id=upId)
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
@permission_classes([IsAuthenticated])
def upload_archivo_up(request, userId=None):
    from django.conf import settings
    import os
    import uuid

    archivo = request.FILES.get('archivo')
    if not archivo:
        return Response({"error": "No se recibió ningún archivo"}, status=status.HTTP_400_BAD_REQUEST)

    ext = os.path.splitext(archivo.name)[1].lower()
    permitidas = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.pdf'}
    if ext not in permitidas:
        return Response(
            {"error": "Solo se permiten imágenes (JPG, PNG, GIF, WEBP, BMP) o archivos PDF"},
            status=status.HTTP_400_BAD_REQUEST
        )

    carpeta = settings.MEDIA_ROOT / 'archivos_up'
    os.makedirs(carpeta, exist_ok=True)

    nombre_archivo = f"{uuid.uuid4().hex}{ext}"
    ruta_disco = carpeta / nombre_archivo

    with open(ruta_disco, 'wb+') as destino:
        for chunk in archivo.chunks():
            destino.write(chunk)

    ruta_publica = f"/media/archivos_up/{nombre_archivo}"
    return Response({"RutaArchivo": ruta_publica, "NombreArchivo": archivo.name})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
    try:
        up = get_object_or_404(UP, id=upId)

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
    except Exception as e:
        tb = traceback.format_exc()
        print(f"ERROR QR: {e}\n{tb}")
        return Response(
            {"error": str(e), "traceback": tb},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_qr(request, upId=None):
    up = get_object_or_404(UP, id=upId)

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

    if not up.CodigoQR:
        return Response(
            {"error": "Esta UP no tiene código QR generado"},
            status=status.HTTP_404_NOT_FOUND
        )

    response = FileResponse(up.CodigoQR.open('rb'), content_type='image/png')
    response['Content-Disposition'] = f'attachment; filename="qr_{up.RUEA}.png"'
    return response
