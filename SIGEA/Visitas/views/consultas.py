"""Consultas reutilizables sobre visitas (filtros y precarga para los listados)."""
import unicodedata

from django.db.models import OuterRef, Q, Subquery
from django.utils.dateparse import parse_date

from ..models import TiposVisitas, Visitas

# Relaciones que lee VisitasSerializer. Con select_related, listar N visitas
# cuesta un número fijo de consultas en lugar de varias por visita.
VISITAS_RELACIONADAS = (
    'Solicitud__MotivoSolicitud',
    'Solicitud__Estado',
    'Solicitud__UP__Predio',
    'Solicitud__UP__idEstado',
    'Solicitud__Usuario__persona',
    'Funcionario__usuario__persona',
    'Administrador__usuario__persona',
    'TipoVisita',
)

# Estados de UP que cuentan como "ya validada" por el administrador.
ESTADOS_UP_VALIDADA = ('Aceptada', 'Rechazada')


def normalizar_texto(texto):
    """Normaliza un texto a minúsculas y sin acentos para comparaciones."""
    return unicodedata.normalize('NFD', texto or '').encode('ascii', 'ignore').decode('ascii').strip().lower()


MOTIVO_VISITA = 1
MOTIVO_CARACTERIZACION = 2


def motivo_solicitud_para_up(up):
    """Regla de solicitudes del productor sobre una UP existente.

    Devuelve ``(motivo_id, error)``:
    - UP Aceptada: se permite, motivo "Visita".
    - UP Rechazada: se permite, motivo "Caracterización" (debe caracterizarse de nuevo).
    - UP En revision o sin estado: no se permite (la validación sigue pendiente).
    """
    estado = normalizar_texto(getattr(up.idEstado, 'Estado', None))
    if estado == 'aceptada':
        return MOTIVO_VISITA, None
    if estado == 'rechazada':
        return MOTIVO_CARACTERIZACION, None
    return None, 'La UP está en revisión; podrás crear solicitudes cuando sea aceptada o rechazada'


ERROR_PRODUCTOR_INACTIVO = 'El productor está inactivo; no se pueden crear solicitudes a su nombre'


def productor_inactivo(usuario):
    """True si no se deben crear solicitudes a nombre de este usuario: el usuario
    está inactivo o su registro de productor lo está."""
    from Usuarios.models import Productores

    if not usuario.Estado:
        return True
    return Productores.objects.filter(usuario=usuario, Estado=False).exists()


def filtrar_rango_fechas(queryset, params):
    """Filtra por ?desde= y ?hasta= (YYYY-MM-DD, incluidos), usando la fecha local de la visita."""
    desde = parse_date(params.get('desde') or '')
    hasta = parse_date(params.get('hasta') or '')
    if desde:
        queryset = queryset.filter(FechaYHoraVisita__date__gte=desde)
    if hasta:
        queryset = queryset.filter(FechaYHoraVisita__date__lte=hasta)
    return queryset


def ids_tipos_caracterizacion():
    """Ids de los tipos de visita de caracterización (sin importar tildes ni mayúsculas)."""
    return [
        tipo.id for tipo in TiposVisitas.objects.all()
        if normalizar_texto(tipo.TipoVisita) == 'caracterizacion'
    ]


def filtrar_validacion_up(queryset, valor):
    """Visitas para el módulo de validación de UPs (?validacion_up=pendientes|validadas).

    Toma las visitas de caracterización ya realizadas y deja solo la más reciente de
    cada UP. "validadas" son las de UPs Aceptadas o Rechazadas; "pendientes", el resto
    (incluye UPs sin estado y visitas sin UP). Cualquier otro valor no filtra.
    """
    if valor not in ('pendientes', 'validadas'):
        return queryset

    tipos = ids_tipos_caracterizacion()
    ultima_de_la_up = (
        Visitas.objects
        .filter(estado=True, TipoVisita_id__in=tipos, Solicitud__UP=OuterRef('Solicitud__UP'))
        .order_by('-FechaYHoraVisita', '-id')
        .values('id')[:1]
    )
    queryset = queryset.filter(estado=True, TipoVisita_id__in=tipos).filter(
        Q(Solicitud__UP__isnull=True) | Q(id=Subquery(ultima_de_la_up))
    )

    validada = Q()
    for estado in ESTADOS_UP_VALIDADA:
        validada |= Q(Solicitud__UP__idEstado__Estado__iexact=estado)
    return queryset.filter(validada) if valor == 'validadas' else queryset.exclude(validada)
