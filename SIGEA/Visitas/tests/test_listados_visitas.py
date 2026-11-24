"""Listados de visitas: validación de UPs paginada en el servidor, número fijo de
consultas y la agenda del funcionario (mis-visitas) con filtros y paginación."""
from django.contrib.auth.models import Permission
from django.db import connection
from django.test.utils import CaptureQueriesContext

from UPs.models import EstadosUP
from Visitas.models import Solicitudes, TiposVisitas, Visitas
from Visitas.tests.test_visita_tecnica import _BaseVisita

URL_VISITAS = '/api/visitas/visitas/'
URL_MIS_VISITAS = '/api/visitas/mis-visitas/'


def _datos(resp):
    return resp.data['results'] if isinstance(resp.data, dict) else resp.data


class _BaseListados(_BaseVisita):
    def setUp(self):
        super().setUp()
        self.user_admin.user_permissions.add(Permission.objects.get(codename='view_visitas'))
        # El tipo se escribe con tilde y mayúscula a propósito: se compara normalizado.
        self.tipo_caract = TiposVisitas.objects.create(TipoVisita='Caracterización')
        self.aceptada, _ = EstadosUP.objects.get_or_create(Estado='Aceptada')
        self.rechazada, _ = EstadosUP.objects.get_or_create(Estado='Rechazada')
        self.en_revision, _ = EstadosUP.objects.get_or_create(Estado='En revision')

    def _visita(self, up=None, fecha='2026-09-10T10:00:00Z', tipo=None, realizada=True, funcionario=None):
        solicitud = Solicitudes.objects.create(
            UP=up, MotivoSolicitud=self.motivo, Observacion='x', Direccion='y',
            Estado=self.estado, Usuario=self.user_prod,
        )
        return Visitas.objects.create(
            Solicitud=solicitud, Funcionario=funcionario or self.funcionario,
            TipoVisita=tipo or self.tipo_caract, FechaYHoraVisita=fecha, estado=realizada,
        )

    def _up(self, estado=None):
        up = self._crear_up(self.productor)
        up.idEstado = estado
        up.save(update_fields=['idEstado'])
        return up


class ValidacionUPListadoTests(_BaseListados):
    def setUp(self):
        super().setUp()
        # UP pendiente con dos caracterizaciones: solo debe salir la más reciente.
        self.up_pendiente = self._up(self.en_revision)
        self.vieja = self._visita(self.up_pendiente, '2026-09-01T10:00:00Z')
        self.reciente = self._visita(self.up_pendiente, '2026-09-05T10:00:00Z')
        # UP sin estado: también pendiente.
        self.up_sin_estado = self._up(None)
        self.sin_estado = self._visita(self.up_sin_estado, '2026-09-02T10:00:00Z')
        # Visita sin UP: pendiente.
        self.sin_up = self._visita(None, '2026-09-03T10:00:00Z')
        # UPs validadas (aceptada y rechazada).
        self.v_aceptada = self._visita(self._up(self.aceptada), '2026-09-06T10:00:00Z')
        self.v_rechazada = self._visita(self._up(self.rechazada), '2026-09-07T10:00:00Z')
        # No cuentan: caracterización no realizada y visita de otro tipo.
        self._visita(self._up(self.en_revision), realizada=False)
        self._visita(self._up(self.en_revision), tipo=self.tipo_visita)
        self.client.force_authenticate(self.user_admin)

    def _ids(self, **params):
        resp = self.client.get(URL_VISITAS, params)
        self.assertEqual(resp.status_code, 200)
        return [v['id'] for v in _datos(resp)]

    def test_pendientes_una_por_up_mas_reciente(self):
        ids = self._ids(validacion_up='pendientes')
        self.assertEqual(set(ids), {self.reciente.id, self.sin_estado.id, self.sin_up.id})
        self.assertNotIn(self.vieja.id, ids)

    def test_validadas(self):
        self.assertEqual(
            set(self._ids(validacion_up='validadas')), {self.v_aceptada.id, self.v_rechazada.id}
        )

    def test_paginacion_y_conteo(self):
        resp = self.client.get(URL_VISITAS, {'validacion_up': 'pendientes', 'page': 1, 'page_size': 2})
        self.assertEqual(resp.data['count'], 3)
        self.assertEqual(len(resp.data['results']), 2)
        # Más reciente primero.
        self.assertEqual(resp.data['results'][0]['id'], self.reciente.id)

    def test_busqueda_dentro_de_validacion(self):
        self.up_pendiente.RUEA = 'RUEA-BUSCADO'
        self.up_pendiente.save(update_fields=['RUEA'])
        self.assertEqual(self._ids(validacion_up='pendientes', search='buscado'), [self.reciente.id])

    def test_valor_desconocido_no_filtra(self):
        self.assertEqual(len(self._ids(validacion_up='otra')), Visitas.objects.count())


class ConsultasListadoVisitasTests(_BaseListados):
    def _consultas(self):
        self.client.force_authenticate(self.user_admin)
        with CaptureQueriesContext(connection) as ctx:
            resp = self.client.get(URL_VISITAS, {'page': 1, 'page_size': 50})
        self.assertEqual(resp.status_code, 200)
        return len(ctx.captured_queries)

    def _crear(self, cantidad):
        for i in range(cantidad):
            up = self._up(self.aceptada if i % 2 else None)
            visita = self._visita(up, f'2026-08-{i + 1:02d}T09:00:00Z')
            if i % 3 == 0:
                visita.Administrador = self.user_admin.administradores
                visita.save(update_fields=['Administrador'])

    def test_consultas_no_crecen_con_la_cantidad_de_visitas(self):
        self._consultas()  # calienta la caché de permisos del usuario
        self._crear(2)
        pocas = self._consultas()
        self._crear(8)
        muchas = self._consultas()
        self.assertEqual(muchas, pocas)


class MisVisitasTests(_BaseListados):
    def setUp(self):
        super().setUp()
        self.p1 = self._visita(fecha='2026-10-05T10:00:00Z', realizada=False)
        self.p2 = self._visita(fecha='2026-10-01T10:00:00Z', realizada=False)
        self.r1 = self._visita(fecha='2026-09-01T10:00:00Z', realizada=True)
        self.r2 = self._visita(fecha='2026-09-15T10:00:00Z', realizada=True)
        self.ajena = self._visita(fecha='2026-10-02T10:00:00Z', realizada=False, funcionario=self.funcionario2)
        self.client.force_authenticate(self.user_func)

    def _ids(self, **params):
        resp = self.client.get(URL_MIS_VISITAS, params)
        self.assertEqual(resp.status_code, 200)
        return [v['id'] for v in _datos(resp)]

    def test_sin_parametros_lista_completa_y_solo_propias(self):
        resp = self.client.get(URL_MIS_VISITAS)
        self.assertIsNone(resp.data['next'])
        ids = [v['id'] for v in _datos(resp)]
        self.assertNotIn(self.ajena.id, ids)
        self.assertTrue({self.p1.id, self.p2.id, self.r1.id, self.r2.id} <= set(ids))

    def test_pendientes_la_mas_proxima_primero(self):
        # self.visita (de _BaseVisita, 2026-09-20, no realizada) también es del funcionario.
        self.assertEqual(self._ids(estado='pendientes'), [self.visita.id, self.p2.id, self.p1.id])

    def test_realizadas_la_mas_reciente_primero(self):
        self.assertEqual(self._ids(estado='realizadas'), [self.r2.id, self.r1.id])

    def test_rango_de_fechas(self):
        ids = self._ids(desde='2026-10-01', hasta='2026-10-31')
        self.assertEqual(set(ids), {self.p1.id, self.p2.id})

    def test_paginado(self):
        resp = self.client.get(URL_MIS_VISITAS, {'estado': 'pendientes', 'page': 2, 'page_size': 1})
        self.assertEqual(resp.data['count'], 3)
        self.assertEqual(resp.data['results'][0]['id'], self.p2.id)
        self.assertIsNotNone(resp.data['next'])

    def test_busqueda_historial(self):
        # Busca por documento del productor y por tipo de visita, solo entre las propias.
        self.assertEqual(
            self._ids(estado='realizadas', search=self.user_prod.persona.numero_documento),
            [self.r2.id, self.r1.id],
        )
        self.assertEqual(self._ids(estado='realizadas', search='Caracterización'), [self.r2.id, self.r1.id])
        self.assertEqual(self._ids(estado='realizadas', search='no-existe-xyz'), [])

    def test_no_funcionario_da_403(self):
        self.client.force_authenticate(self.user_prod)
        self.assertEqual(self.client.get(URL_MIS_VISITAS).status_code, 403)
