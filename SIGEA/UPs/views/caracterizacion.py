from types import SimpleNamespace

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from Usuarios.models import Usuario, Funcionarios
from Predios.models import Predios, TiposTenencias
from ..models import UP, TipoUP
from ..serializers import (
    InfoPersonalCaracterizacionSerializer,
    InfoPredioCaracterizacionSerializer,
    InfoUPCaracterizacionSerializer,
    InfoProduccionAgricolaSerializer,
    InfoProduccionAnimalSerializer,
    InfoProduccionAgroindustrialSerializer,
    InfoAdicionalCaracterizacionSerializer,
)

# INFO PERSONAL DE CARACTERIZACION

def _get_productor(request, userId=None):
    if not userId:
        return None, Response({"error": "userId es requerido"}, status=status.HTTP_400_BAD_REQUEST)

    usuario = get_object_or_404(Usuario, id=userId)
    productor = getattr(usuario, 'productores', None)
    if not productor:
        return None, Response({"error": "No se encontro el productor"}, status=status.HTTP_404_NOT_FOUND)

    return productor, None


def _get_up_context(productor, solicitud_id=None):
    """Devuelve (solicitud, up) de caracterizacion.

    La UP de caracterizacion se resuelve siempre a partir de la solicitud.
    De esta forma cada visita de caracterizacion registra una UP nueva e
    independiente asociada al productor, en lugar de reutilizar (y sobrescribir)
    la primera UP ya existente del productor.
    """
    from Visitas.models import Solicitudes

    solicitud = None
    if solicitud_id:
        solicitud = Solicitudes.objects.filter(id=solicitud_id).first()
        if solicitud is not None and solicitud.UP is not None:
            return solicitud, solicitud.UP

    return solicitud, None


def _create_draft_up(productor):
    from datetime import date
    from ..models import EstadosUP

    tipo_up = TipoUP.objects.first()
    tenencia = TiposTenencias.objects.first()
    funcionario = Funcionarios.objects.first()
    estado_en_revision = EstadosUP.objects.filter(Estado='En revision').first()

    if not (tipo_up and tenencia and funcionario):
        return None

    predio = Predios.objects.create(
        NombrePredio=f"Predio {productor.usuario.persona.primer_nombre} {productor.usuario.persona.primer_apellido}",
        AreaPredio=0,
        AccesoCredito=False,
        UsoSuelo=False,
        TipoTenencia=tenencia,
    )

    up = UP.objects.create(
        Productor=productor,
        Predio=predio,
        TipoUP=tipo_up,
        Funcionario=funcionario,
        FechaCaracterizacion=date.today(),
        FechaActualizacion=date.today(),
        idEstado=estado_en_revision,
    )

    return up


def _empty_caracterizacion(serializer_class):
    """Devuelve un JSON con todos los campos de la seccion en null."""
    serializer = serializer_class()
    return {field: None for field in serializer.fields}


def _personal_draft(productor):
    """Devuelve la informacion personal del productor aun sin tener una UP creada."""
    up_stub = SimpleNamespace(Productor=productor, RUEA=None)
    return InfoPersonalCaracterizacionSerializer(up_stub).data


def _draft_response(productor, serializer_class):
    """Respuesta de seccion cuando el productor aun no tiene UP.

    La seccion personal se precarga desde los datos del usuario; el resto se
    entrega vacio porque aun no existe predio/UP que llenar.
    """
    if serializer_class is InfoPersonalCaracterizacionSerializer:
        return _personal_draft(productor)
    return _empty_caracterizacion(serializer_class)


def _caracterizacion_handler(request, userId, serializer_class):
    productor, error_response = _get_productor(request, userId)
    if error_response:
        return error_response

    solicitud_id = request.data.get('solicitud_id') or request.query_params.get('solicitud_id')
    solicitud, up = _get_up_context(productor, solicitud_id)

    if request.method == 'POST':
        data = request.data.copy()
        data.pop('userId', None)
        data.pop('solicitud_id', None)

        # Sin datos: se devuelve el estado actual
        if not data:
            if up is None:
                return Response(_draft_response(productor, serializer_class))
            serializer = serializer_class(up)
            return Response(serializer.data)

        # Si la solicitud aun no tiene UP, se crea una nueva y se vincula
        if up is None:
            up = _create_draft_up(productor)
            if up is None:
                return Response(
                    {"error": "No se pudieron obtener los datos base para crear la UP"},
                    status=status.HTTP_409_CONFLICT
                )
            if solicitud is not None:
                solicitud.UP = up
                solicitud.save(update_fields=['UP'])

        serializer = serializer_class(up, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET: si la solicitud no tiene UP, se devuelven los campos vacios para llenar
    if up is None:
        return Response(_draft_response(productor, serializer_class))

    serializer = serializer_class(up)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def info_personal_caracterizacion(request, userId=None):
    return _caracterizacion_handler(request, userId, InfoPersonalCaracterizacionSerializer)


@api_view(['GET', 'POST'])
def info_predio_caracterizacion(request, userId=None):
    return _caracterizacion_handler(request, userId, InfoPredioCaracterizacionSerializer)


@api_view(['GET', 'POST'])
def info_up_caracterizacion(request, userId=None):
    return _caracterizacion_handler(request, userId, InfoUPCaracterizacionSerializer)


@api_view(['GET', 'POST'])
def info_produccion_agricola(request, userId=None):
    return _caracterizacion_handler(request, userId, InfoProduccionAgricolaSerializer)


@api_view(['GET', 'POST'])
def info_produccion_animal(request, userId=None):
    return _caracterizacion_handler(request, userId, InfoProduccionAnimalSerializer)


@api_view(['GET', 'POST'])
def info_produccion_agroindustrial(request, userId=None):
    return _caracterizacion_handler(request, userId, InfoProduccionAgroindustrialSerializer)


@api_view(['GET', 'POST'])
def info_adicional_caracterizacion(request, userId=None):
    return _caracterizacion_handler(request, userId, InfoAdicionalCaracterizacionSerializer)


# FIN INFO PERSONAL DE CARACTERIZACION
