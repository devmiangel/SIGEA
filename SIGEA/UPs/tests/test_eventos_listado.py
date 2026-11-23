"""Listado de eventos: búsqueda, orden (más reciente primero) y paginación opcional."""
from django.test import override_settings
from rest_framework.test import APITestCase

from UPs.models import EventosUP
from Usuarios.models import Usuario

URL = '/api/UPs/eventosUP/'


@override_settings(SECURE_SSL_REDIRECT=False)
class EventosListadoTests(APITestCase):
    def setUp(self):
        self.admin = Usuario.objects.create_superuser(email='eventos.admin@example.com', password='ClaveSegura123*')
        self.client.force_authenticate(self.admin)
        self.feria = EventosUP.objects.create(Titulo='Feria ganadera', Descripcion='Exposición', Fecha='2026-05-10', Lugar='Plaza')
        self.taller = EventosUP.objects.create(Titulo='Taller de suelos', Descripcion='Capacitación', Fecha='2026-07-01', Lugar='Vereda Alta')
        self.jornada = EventosUP.objects.create(Titulo='Jornada', Descripcion='Vacunación bovina', Fecha='2026-06-15', Lugar='Coliseo')

    def test_sin_page_lista_completa_mas_reciente_primero(self):
        resp = self.client.get(URL)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual([e['id'] for e in resp.data], [self.taller.id, self.jornada.id, self.feria.id])

    def test_busqueda_en_titulo_lugar_y_descripcion(self):
        for termino, esperado in (('feria', self.feria), ('vereda', self.taller), ('bovina', self.jornada)):
            resp = self.client.get(URL, {'search': termino})
            self.assertEqual([e['id'] for e in resp.data], [esperado.id], termino)

    def test_paginado(self):
        resp = self.client.get(URL, {'page': 1, 'page_size': 2})
        self.assertEqual(resp.data['count'], 3)
        self.assertEqual([e['id'] for e in resp.data['results']], [self.taller.id, self.jornada.id])
