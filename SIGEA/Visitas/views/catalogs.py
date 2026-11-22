import unicodedata

from django.utils.dateparse import parse_date
from rest_framework import viewsets
from SIGEAsite.permissions import SigeaModelPermissionMixin, OwnedQuerysetMixin, es_staff, usuario_en_grupo
from SIGEAsite.filters import filtrar_texto
from rest_framework.response import Response

from ..models import (
    MotivosSolicitudes,
    Estados,
    Solicitudes,
    TiposVisitas,
    Visitas,
    InsumoVisita,
    Calificaciones,
    InfoVisita,
    ServiciosPagos,
    Aperos,
    Pajillas,
    VisitasServiciosPagos
)

from ..serializers import (
    MotivosSolicitudesSerializer,
    EstadosSerializer,
    SolicitudesSerializer,
    TiposVisitasSerializer,
    VisitasSerializer,
    InsumoVisitaSerializer,
    CalificacionesSerializer,
    InfoVisitaSerializer,
    ServiciosPagosSerializer,
    AperosSerializer,
    PajillasSerializer,
    VisitasServiciosPagosSerializer

)

class MotivosSolicitudesViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = MotivosSolicitudes.objects.all()
    serializer_class = MotivosSolicitudesSerializer

class EstadosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Estados.objects.all()
    serializer_class = EstadosSerializer

class SolicitudesViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'Usuario'
    queryset = Solicitudes.objects.all()
    serializer_class = SolicitudesSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        # El modulo de Solicitudes solo muestra las que aun no tienen visita
        # asignada: En Proceso (1) y Reagendado (4).
        estado = params.get('estado')
        if estado == 'pendientes':
            queryset = queryset.filter(Estado_id__in=(1, 4))
        elif estado == 'asignadas':
            queryset = queryset.filter(Estado_id=2)
        elif estado == 'rechazadas':
            queryset = queryset.filter(Estado_id=3)

        queryset = filtrar_texto(
            queryset,
            params.get('search'),
            [
                'Observacion',
                'Direccion',
                'Usuario__email',
                'Usuario__persona__primer_nombre',
                'Usuario__persona__primer_apellido',
                'Usuario__persona__numero_documento',
                'UP__RUEA',
                'UP__Predio__NombrePredio',
            ],
        )

        return queryset.select_related(
            'Usuario__persona',
            'UP__TipoUP',
            'MotivoSolicitud',
            'Estado',
        ).order_by('-FechaSolicitud', '-id')

    def perform_create(self, serializer):
        # Un productor/usuario solo puede crear solicitudes a su propio nombre,
        # aunque envíe otro "Usuario" en el cuerpo. El staff conserva el comportamiento.
        if es_staff(self.request.user):
            serializer.save()
        else:
            serializer.save(Usuario=self.request.user)

class TiposVisitasViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = TiposVisitas.objects.all()
    serializer_class = TiposVisitasSerializer

def _normalizar_texto(texto):
    """Normaliza un texto a minusculas y sin acentos para comparaciones."""
    return unicodedata.normalize('NFD', texto or '').encode('ascii', 'ignore').decode('ascii').strip().lower()


def _es_visita_caracterizacion(visita):
    """Una visita es de caracterizacion cuando su TipoVisita lo indica."""
    tipo = getattr(getattr(visita, 'TipoVisita', None), 'TipoVisita', None)
    return _normalizar_texto(tipo) == 'caracterizacion'


class VisitasViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'Solicitud__Usuario'
    queryset = Visitas.objects.all()
    serializer_class = VisitasSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        # Funcionarios (sin rol Administradores) solo ven/editan sus visitas
        # asignadas; Administradores y superusuario conservan el queryset completo.
        if es_staff(user) and not usuario_en_grupo(user, 'Administradores'):
            queryset = queryset.filter(Funcionario__usuario=user)

        params = self.request.query_params
        up_id = params.get('up_id')
        productor_id = params.get('productor_id')
        solicitud_id = params.get('solicitud_id')
        if up_id and str(up_id).isdigit():
            queryset = queryset.filter(Solicitud__UP_id=int(up_id))
        if productor_id and str(productor_id).isdigit():
            queryset = queryset.filter(Solicitud__UP__Productor_id=int(productor_id))
        if solicitud_id and str(solicitud_id).isdigit():
            queryset = queryset.filter(Solicitud_id=int(solicitud_id))

        desde = parse_date(params.get('desde') or '')
        hasta = parse_date(params.get('hasta') or '')
        if desde:
            queryset = queryset.filter(FechaYHoraVisita__date__gte=desde)
        if hasta:
            queryset = queryset.filter(FechaYHoraVisita__date__lte=hasta)

        queryset = filtrar_texto(
            queryset,
            params.get('search'),
            [
                'Solicitud__UP__RUEA',
                'Solicitud__UP__Predio__NombrePredio',
                'Funcionario__usuario__persona__primer_nombre',
                'Funcionario__usuario__persona__primer_apellido',
                'Funcionario__usuario__persona__numero_documento',
                'Solicitud__Usuario__persona__primer_nombre',
                'Solicitud__Usuario__persona__primer_apellido',
                'TipoVisita__TipoVisita',
            ],
        )
        estado = params.get('estado')
        if estado == 'realizadas':
            queryset = queryset.filter(estado=True)
        elif estado == 'no_realizadas':
            queryset = queryset.filter(estado=False)

        return queryset.select_related(
            'Solicitud__UP__Predio',
            'Solicitud__Usuario__persona',
            'Funcionario__usuario__persona',
            'TipoVisita',
        ).distinct()

    def update(self, request, *args, **kwargs):
        from UPs.models import EstadosUP

        visita = self.get_object()
        estado = request.data.get('estado')

        if estado is not None:
            if isinstance(estado, bool):
                estado_valido = bool(estado)
            elif isinstance(estado, str):
                estado_valido = estado.strip().lower() in ('true', '1', 'si')
            else:
                estado_valido = bool(estado)

            if estado_valido and not visita.estado:
                # La UP solo vuelve a validacion cuando la visita es de caracterizacion.
                # Las visitas de seguimiento/tecnica no deben reabrir su validacion.
                if _es_visita_caracterizacion(visita):
                    up = visita.Solicitud.UP if visita.Solicitud else None
                    if up is not None:
                        estado_en_revision = EstadosUP.objects.filter(Estado='En revision').first()
                        if estado_en_revision:
                            up.idEstado = estado_en_revision
                            up.save(update_fields=['idEstado'])

        serializer = self.get_serializer(visita, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class InsumoVisitaViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'Visita__Solicitud__Usuario'
    queryset = InsumoVisita.objects.all()
    serializer_class = InsumoVisitaSerializer

class CalificacionesViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer

class InfoVisitaViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'Visita__Solicitud__Usuario'
    queryset = InfoVisita.objects.all()
    serializer_class = InfoVisitaSerializer

class ServiciosPagosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = ServiciosPagos.objects.all()
    serializer_class = ServiciosPagosSerializer

class AperosViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Aperos.objects.all()
    serializer_class = AperosSerializer

class PajillasViewSet(SigeaModelPermissionMixin, viewsets.ModelViewSet):
    queryset = Pajillas.objects.all()
    serializer_class = PajillasSerializer

class VisitasServiciosPagosViewSet(SigeaModelPermissionMixin, OwnedQuerysetMixin, viewsets.ModelViewSet):
    owner_lookup = 'Visita__Solicitud__Usuario'
    queryset = VisitasServiciosPagos.objects.all()
    serializer_class = VisitasServiciosPagosSerializer
