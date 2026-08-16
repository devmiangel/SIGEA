from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from Visitas.models import Visitas
from .services.pdf_service import generar_documento_visita_bytes


@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def generar_documento_visita(request, visita_id):
    visita = get_object_or_404(Visitas, id=visita_id)
    try:
        pdf_bytes = generar_documento_visita_bytes(visita_id)
    except Exception as e:
        return Response({'error': f'No se pudo generar el documento: {e}'}, status=500)

    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="visita_{visita_id}.pdf"'
    return response