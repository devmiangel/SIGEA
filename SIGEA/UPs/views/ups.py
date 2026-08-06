from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from ..models import UP
from ..serializers import UPSerializer

class UPViewSet(viewsets.ModelViewSet):
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
