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


def _get_up_for_user(productor):
    return UP.objects.filter(Productor=productor).select_related(
        'Productor__usuario__persona',
        'Predio__Sector__Vereda',
        'Predio__Seguro',
        'Predio__TipoTenencia',
        'TipoUP'
    ).prefetch_related(
        'Productor__usuario__persona__contactos',
        'Productor__usuario__persona__TipoNivelEducativo',
        'Productor__usuario__persona__NivelSisben',
        'Productor__usuario__persona__Empresa'
    ).first()


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


def _caracterizacion_handler(request, userId, serializer_class):
    productor, error_response = _get_productor(request, userId)
    if error_response:
        return error_response

    up = _get_up_for_user(productor)

    if request.method == 'POST':
        data = request.data.copy()
        data.pop('userId', None)

        # Sin datos: se devuelve el estado actual
        if not data:
            if up is None:
                return Response(_empty_caracterizacion(serializer_class))
            serializer = serializer_class(up)
            return Response(serializer.data)

        # Si no existe UP, se crea al guardar la primera seccion
        if up is None:
            up = _create_draft_up(productor)
            if up is None:
                return Response(
                    {"error": "No se pudieron obtener los datos base para crear la UP"},
                    status=status.HTTP_409_CONFLICT
                )

        serializer = serializer_class(up, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET: si no tiene UP, se devuelven los campos vacios para llenar
    if up is None:
        return Response(_empty_caracterizacion(serializer_class))

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
