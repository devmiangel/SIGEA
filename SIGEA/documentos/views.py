from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import logging
import unicodedata

from SIGEAsite.permissions import usuario_en_grupo

from Visitas.models import Visitas
from .services.pdf_service_visita import generar_documento_visita_bytes
from .services.pdf_service_caracterizacion import generar_documento_caracterizacion_bytes
from .services.pdf_service_recibo import generar_documento_recibo_bytes

logger = logging.getLogger(__name__)


def normalizar_tipo(tipo):
    norm = unicodedata.normalize('NFD', (tipo or '')).encode('ascii', 'ignore').decode('ascii')
    return norm.lower()


def es_caracterizacion(visita):
    return normalizar_tipo(visita.TipoVisita.TipoVisita) == 'caracterizacion'


def puede_descargar_visita(user, visita):
    """Administradores: cualquier visita. Funcionarios: solo las visitas asignadas a
    ellos. Productores/usuarios: solo las visitas de sus propias solicitudes."""
    if user.is_superuser or usuario_en_grupo(user, 'Administradores'):
        return True
    funcionario = getattr(user, 'funcionarios', None)
    if funcionario is not None and visita.Funcionario_id == funcionario.id:
        return True
    return visita.Solicitud_id is not None and visita.Solicitud.Usuario_id == user.id


def es_recibo(visita):
    return normalizar_tipo(visita.TipoVisita.TipoVisita) == 'servicios pagos'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generar_documento_visita(request, visita_id):
    visita = get_object_or_404(Visitas, id=visita_id)
    if not puede_descargar_visita(request.user, visita):
        return Response({'error': 'No tienes permisos para descargar el documento'}, status=403)
    try:
        if es_recibo(visita):
            pdf_bytes = generar_documento_recibo_bytes(visita_id)
            nombre_archivo = f"recibo_{visita_id}.pdf"
        elif es_caracterizacion(visita):
            pdf_bytes = generar_documento_caracterizacion_bytes(visita_id)
            nombre_archivo = f"caracterizacion_{visita_id}.pdf"
        else:
            pdf_bytes = generar_documento_visita_bytes(visita_id)
            nombre_archivo = f"visita_{visita_id}.pdf"
    except Exception:
        # El detalle queda en el log del servidor; no se expone al cliente.
        logger.exception("Error generando el documento de la visita %s", visita_id)
        return Response({'error': 'No se pudo generar el documento'}, status=500)

    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="{nombre_archivo}"'
    return response
