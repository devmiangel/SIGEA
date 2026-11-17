"""Almacenamiento privado y validado de los archivos adjuntos de las UPs.

Los archivos se guardan en PRIVATE_MEDIA_ROOT (fuera de MEDIA_ROOT), por lo que el
servidor web nunca los publica directamente: solo se descargan a través de la API,
que valida el dueño de la UP (ver ArchivosUPViewSet.descargar).
"""
import logging
import os
import re
import uuid
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse

logger = logging.getLogger(__name__)

SUBCARPETA = 'archivos_up'
PREFIJO_LEGADO = '/media/archivos_up/'

EXTENSIONES_IMAGEN = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
EXTENSIONES_PERMITIDAS = EXTENSIONES_IMAGEN | {'.pdf'}

CONTENT_TYPES = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.bmp': 'image/bmp', '.pdf': 'application/pdf',
}


class ArchivoInvalido(Exception):
    def __init__(self, mensaje, status=400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status = status


def _max_bytes():
    return int(getattr(settings, 'MAX_UPLOAD_MB', 5)) * 1024 * 1024


def validar_archivo(archivo):
    """Valida tamaño, extensión y contenido real (no basta con la extensión).
    Devuelve la extensión normalizada."""
    if archivo.size > _max_bytes():
        raise ArchivoInvalido(
            f"El archivo supera el tamaño máximo de {settings.MAX_UPLOAD_MB} MB", status=413
        )

    ext = os.path.splitext(archivo.name)[1].lower()
    if ext not in EXTENSIONES_PERMITIDAS:
        raise ArchivoInvalido("Solo se permiten imágenes (JPG, PNG, GIF, WEBP, BMP) o archivos PDF")

    if ext == '.pdf':
        archivo.seek(0)
        if not archivo.read(5).startswith(b'%PDF-'):
            raise ArchivoInvalido("El archivo no es un PDF válido")
    else:
        from PIL import Image, UnidentifiedImageError
        archivo.seek(0)
        try:
            with Image.open(archivo) as img:
                img.verify()
        except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
            raise ArchivoInvalido("El archivo no es una imagen válida")

    archivo.seek(0)
    return ext


def guardar_archivo(archivo):
    """Guarda el archivo validado con un nombre aleatorio y devuelve la ruta relativa
    que se almacena en ArchivosUP.RutaArchivo (p. ej. 'archivos_up/<uuid>.pdf')."""
    ext = validar_archivo(archivo)
    carpeta = Path(settings.PRIVATE_MEDIA_ROOT) / SUBCARPETA
    carpeta.mkdir(parents=True, exist_ok=True)

    nombre = f"{uuid.uuid4().hex}{ext}"
    with open(carpeta / nombre, 'wb') as destino:
        for chunk in archivo.chunks():
            destino.write(chunk)
    return f"{SUBCARPETA}/{nombre}"


def _resolver(ruta_archivo):
    """Convierte RutaArchivo en (ruta en disco, ruta interna para Nginx).
    Soporta registros antiguos guardados como '/media/archivos_up/<archivo>'."""
    ruta_archivo = (ruta_archivo or '').strip()
    if ruta_archivo.startswith(PREFIJO_LEGADO):
        nombre = os.path.basename(ruta_archivo)
        return Path(settings.MEDIA_ROOT) / SUBCARPETA / nombre, f"/protected-legacy/{SUBCARPETA}/{nombre}"

    nombre = os.path.basename(ruta_archivo)  # evita rutas tipo ../../
    return Path(settings.PRIVATE_MEDIA_ROOT) / SUBCARPETA / nombre, f"/protected/{SUBCARPETA}/{nombre}"


def respuesta_descarga(ruta_archivo, nombre_descarga=None):
    ruta_disco, ruta_interna = _resolver(ruta_archivo)
    if not ruta_disco.name or not ruta_disco.is_file():
        raise Http404("Archivo no encontrado")

    ext = ruta_disco.suffix.lower()
    content_type = CONTENT_TYPES.get(ext, 'application/octet-stream')
    nombre = os.path.basename(nombre_descarga or ruta_disco.name).replace('"', '')

    if getattr(settings, 'USE_X_ACCEL_REDIRECT', False):
        # En producción Nginx entrega el archivo desde una location "internal".
        response = HttpResponse(content_type=content_type)
        response['X-Accel-Redirect'] = ruta_interna
    else:
        response = FileResponse(open(ruta_disco, 'rb'), content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{nombre}"'
    response['X-Content-Type-Options'] = 'nosniff'
    return response


_PATRON_RUTA = re.compile(rf'^{SUBCARPETA}/[0-9a-f]{{32}}\.[a-z]+$')


def es_ruta_subida(ruta_archivo):
    """True si la ruta tiene la forma que devuelve guardar_archivo
    ('archivos_up/<uuid hex>.<ext>') y una extension permitida."""
    ruta_archivo = (ruta_archivo or '').strip()
    if not _PATRON_RUTA.match(ruta_archivo):
        return False
    return os.path.splitext(ruta_archivo)[1] in EXTENSIONES_PERMITIDAS


def borrar_archivo(ruta_archivo):
    """Elimina del disco un archivo privado que ya no referencia ningun registro.
    Los registros legados de /media/ no se tocan."""
    if not es_ruta_subida(ruta_archivo):
        return
    ruta_disco, _ = _resolver(ruta_archivo)
    try:
        ruta_disco.unlink(missing_ok=True)
    except OSError:
        logger.exception('No se pudo eliminar el archivo %s', ruta_disco)
