from django.test import override_settings
from rest_framework.test import APITestCase

from Inventario.models import Herramientas, TiposHerramientas
from Usuarios.models import Usuario


@override_settings(SECURE_SSL_REDIRECT=False)
class PaginacionTests(APITestCase):
    def setUp(self):
        self.admin = Usuario.objects.create_superuser(
            email='page.admin@example.com',
            password='ClaveSegura123*',
        )
        self.client.force_authenticate(self.admin)
        tipo = TiposHerramientas.objects.create(TipoHerramienta='Manual')
        for indice in range(3):
            Herramientas.objects.create(
                Herramienta=f'Herramienta {indice}',
                TipoHerramienta=tipo,
            )

    def test_sin_page_devuelve_pagina_de_200(self):
        respuesta = self.client.get('/api/inventario/herramientas/')
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data['count'], 3)
        self.assertEqual(len(respuesta.data['results']), 3)
        self.assertIsNone(respuesta.data['next'])

    def test_sin_page_nunca_devuelve_mas_de_200(self):
        tipo = TiposHerramientas.objects.first()
        Herramientas.objects.bulk_create(
            Herramientas(Herramienta=f'Masiva {indice}', TipoHerramienta=tipo) for indice in range(200)
        )
        primera = self.client.get('/api/inventario/herramientas/')
        self.assertEqual(primera.data['count'], 203)
        self.assertEqual(len(primera.data['results']), 200)
        # El enlace siguiente conserva el tamaño de página: no se salta filas.
        self.assertIn('page_size=200', primera.data['next'])
        segunda = self.client.get(primera.data['next'])
        self.assertEqual(len(segunda.data['results']), 3)
        ids = [h['id'] for h in primera.data['results'] + segunda.data['results']]
        self.assertEqual(len(set(ids)), 203)

    def test_con_page_devuelve_paginado(self):
        respuesta = self.client.get('/api/inventario/herramientas/?page=1&page_size=2')
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data['count'], 3)
        self.assertEqual(len(respuesta.data['results']), 2)
        self.assertIsNotNone(respuesta.data['next'])

    def test_segunda_pagina(self):
        respuesta = self.client.get('/api/inventario/herramientas/?page=2&page_size=2')
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(len(respuesta.data['results']), 1)
        self.assertIsNone(respuesta.data['next'])


@override_settings(SECURE_SSL_REDIRECT=False)
class FiltrosListasTests(APITestCase):
    def setUp(self):
        self.admin = Usuario.objects.create_superuser(
            email='filters.admin@example.com',
            password='ClaveSegura123*',
        )
        self.client.force_authenticate(self.admin)

    def test_filtros_de_listas_no_fallan(self):
        urls = [
            '/api/usuarios/productores/?page=1&page_size=10&search=ana&estado=activo&ups=con&tipo_documento=1&vereda=1&sector=1',
            '/api/usuarios/usuarios/?page=1&page_size=10&search=ana&rol=Usuarios',
            '/api/inventario/herramientas/?page=1&page_size=10&search=pala&tipo=1&estado=activo&disponibilidad=asignada',
            '/api/inventario/insumos/?page=1&page_size=10&search=vacuna&unidad=1&estado=activo&stock=bajo',
            (
                '/api/inventario/detalleVehiculos/?page=1&page_size=10&search=abc'
                '&marca=Toyota&linea=Hilux&tipo=Camioneta&combustible=Diesel'
                '&estado=activo&disponibilidad=asignado&soat=vencido'
            ),
            '/api/visitas/visitas/?page=1&page_size=10&search=predio&estado=realizadas&desde=2020-01-01&hasta=2030-01-01&solicitud_id=1',
        ]
        for url in urls:
            respuesta = self.client.get(url)
            self.assertEqual(respuesta.status_code, 200, f'{url}: {respuesta.content[:300]}')
