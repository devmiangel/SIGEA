from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import unicodedata

from Visitas.models import Visitas
from .services.pdf_service_visita import generar_documento_visita_bytes
from .services.pdf_service_caracterizacion import generar_documento_caracterizacion_bytes
from .services.pdf_service_recibo import generar_documento_recibo_bytes


def normalizar_tipo(tipo):
    norm = unicodedata.normalize('NFD', (tipo or '')).encode('ascii', 'ignore').decode('ascii')
    return norm.lower()


def es_caracterizacion(visita):
    return normalizar_tipo(visita.TipoVisita.TipoVisita) == 'caracterizacion'


def es_recibo(visita):
    return normalizar_tipo(visita.TipoVisita.TipoVisita) == 'servicios pagos'


@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def generar_documento_visita(request, visita_id):
    visita = get_object_or_404(Visitas, id=visita_id)
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
    except Exception as e:
        return Response({'error': f'No se pudo generar el documento: {e}'}, status=500)

    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="{nombre_archivo}"'
    return response