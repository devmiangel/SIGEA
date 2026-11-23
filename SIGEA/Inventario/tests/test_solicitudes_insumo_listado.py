"""Listado de solicitudes de insumo: cada funcionario ve solo las suyas; el admin ve
todas, con filtro por estado, búsqueda y paginación opcional."""
from django.test import override_settings
from rest_framework.test import APITestCase

from Inventario.models import Insumos, SolicitudInsumo
from UPs.models import Unidades
from Usuarios.models import Administradores, Funcionarios, Personas, TiposDocumentos, Usuario

URL = '/api/inventario/solicitudInsumo/'


@override_settings(SECURE_SSL_REDIRECT=False)
class SolicitudesInsumoListadoTests(APITestCase):
    def setUp(self):
        tipo_doc = TiposDocumentos.objects.create(TipoDocumento='CC')

        def usuario(nombre, documento):
            persona = Personas.objects.create(
                primer_nombre=nombre, primer_apellido='Prueba', numero_documento=documento,
                TipoDocumento=tipo_doc, fecha_nacimiento='1990-01-01',
            )
            return Usuario.objects.create_user(email=f'{nombre.lower()}@example.com', password='x1234567', persona=persona)

        self.admin = usuario('Admin', '5001')
        Administradores.objects.create(usuario=self.admin)
        self.user_ana = usuario('Ana', '5002')
        self.ana = Funcionarios.objects.create(usuario=self.user_ana)
        self.user_luis = usuario('Luis', '5003')
        self.luis = Funcionarios.objects.create(usuario=self.user_luis)

        unidad = Unidades.objects.create(Unidad='kg')
        semilla = Insumos.objects.create(Nombre='Semilla de maíz', Cantidad=100, Unidades=unidad)
        abono = Insumos.objects.create(Nombre='Abono orgánico', Cantidad=50, Unidades=unidad)

        self.s1 = SolicitudInsumo.objects.create(Insumo=semilla, Funcionario=self.ana, Cantidad=5, Estado='Pendiente')
        self.s2 = SolicitudInsumo.objects.create(Insumo=abono, Funcionario=self.ana, Cantidad=2, Estado='Resuelta')
        self.s3 = SolicitudInsumo.objects.create(Insumo=abono, Funcionario=self.luis, Cantidad=1, Estado='Pendiente')

    def _ids(self, user, **params):
        self.client.force_authenticate(user)
        resp = self.client.get(URL, params)
        self.assertEqual(resp.status_code, 200)
        datos = resp.data['results'] if isinstance(resp.data, dict) else resp.data
        return {s['id'] for s in datos}

    def test_funcionario_ve_solo_las_suyas(self):
        self.assertEqual(self._ids(self.user_ana), {self.s1.id, self.s2.id})

    def test_admin_ve_todas(self):
        self.assertEqual(self._ids(self.admin), {self.s1.id, self.s2.id, self.s3.id})

    def test_filtro_por_estado(self):
        self.assertEqual(self._ids(self.admin, estado='Pendiente'), {self.s1.id, self.s3.id})

    def test_busqueda_por_insumo_y_funcionario(self):
        self.assertEqual(self._ids(self.admin, search='abono'), {self.s2.id, self.s3.id})
        self.assertEqual(self._ids(self.admin, search='luis'), {self.s3.id})

    def test_paginado_y_sin_page_lista_completa(self):
        self.client.force_authenticate(self.admin)
        completo = self.client.get(URL)
        self.assertIsInstance(completo.data, list)
        paginado = self.client.get(URL, {'page': 1, 'page_size': 2})
        self.assertEqual(paginado.data['count'], 3)
        self.assertEqual(len(paginado.data['results']), 2)
