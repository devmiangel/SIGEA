from datetime import date
from unittest import mock

from django.test import override_settings
from rest_framework.test import APITestCase

from SIGEAsite.testing import filas

from Inventario.models import (
    AsignacionHerramientas,
    Conductores,
    DetalleVehiculos,
    Herramientas,
    LineasVehiculos,
    MarcasVehiculos,
    RegistroAsignacionVehiculos,
    TiposCombustibles,
    TiposHerramientas,
    TiposVehiculos,
    Vehiculos,
)
from Usuarios.models import Administradores, Funcionarios, Usuario


class _BaseEdicionInventario(APITestCase):
    def setUp(self):
        self._override_seguridad = override_settings(SECURE_SSL_REDIRECT=False)
        self._override_seguridad.enable()
        self.addCleanup(self._override_seguridad.disable)

        self.admin_user = Usuario.objects.create_superuser(
            email='edit.admin@example.com', password='ClaveSegura123*'
        )
        self.administrador = Administradores.objects.create(usuario=self.admin_user)
        self.funcionario_user = Usuario.objects.create_user(
            email='edit.func@example.com', password='ClaveSegura123*'
        )
        self.funcionario = Funcionarios.objects.create(usuario=self.funcionario_user)

        self.tipo_herramienta = TiposHerramientas.objects.create(
            TipoHerramienta='Manual'
        )
        self.herramienta = Herramientas.objects.create(
            Herramienta='Pala', TipoHerramienta=self.tipo_herramienta
        )

        self.marca = MarcasVehiculos.objects.create(MarcaVehiculo='Toyota')
        self.linea = LineasVehiculos.objects.create(
            LineaVehiculo='Hilux', MarcaVehiculo=self.marca
        )
        self.linea2 = LineasVehiculos.objects.create(
            LineaVehiculo='Prado', MarcaVehiculo=self.marca
        )
        self.tipo_combustible = TiposCombustibles.objects.create(
            TipoCombustible='Diesel'
        )
        self.tipo_vehiculo = TiposVehiculos.objects.create(TipoVehiculo='Camioneta')

    def _crear_vehiculo(self, placa='ABC-123', linea=None):
        registro = Vehiculos.objects.create(
            LineaVehiculo=linea or self.linea,
            TipoCombustible=self.tipo_combustible,
            TipoVehiculo=self.tipo_vehiculo,
        )
        detalle = DetalleVehiculos.objects.create(
            Vehiculo=registro,
            Placa=placa,
            Modelo='2020',
            FechaTecno=date(2027, 1, 1),
            FechaSoat=date(2027, 1, 1),
            Descripcion='',
            Estado=True,
        )
        return registro, detalle

    def _payload_vehiculo(self, placa='ABC-123', linea=None, **overrides):
        payload = {
            'Placa': placa,
            'Modelo': '2020',
            'FechaTecno': '2027-01-01',
            'FechaSoat': '2027-01-01',
            'Descripcion': '',
            'Estado': True,
            'LineaVehiculo': (linea or self.linea).id,
            'TipoCombustible': self.tipo_combustible.id,
            'TipoVehiculo': self.tipo_vehiculo.id,
        }
        payload.update(overrides)
        return payload

    def _asignar_herramienta(self, entregado=False):
        return AsignacionHerramientas.objects.create(
            Herramienta=self.herramienta,
            Funcionario=self.funcionario,
            Administrador=self.administrador,
            FechaAsignacion=date(2026, 1, 1),
            FechaDevolucion=date(2026, 1, 2) if entregado else None,
            Entregado=entregado,
        )

    def _asignar_vehiculo(self, detalle, entregado=False):
        conductor = Conductores.objects.create(
            Funcionario=self.funcionario, Licencia='LIC-1', Estado=True
        )
        return RegistroAsignacionVehiculos.objects.create(
            DetalleVehiculo=detalle,
            Conductor=conductor,
            Administrador=self.administrador,
            FechaAsignacion=date(2026, 1, 1),
            FechaDevolucion=date(2026, 1, 2) if entregado else None,
            Entregado=entregado,
        )


class HerramientasEdicionTests(_BaseEdicionInventario):
    def test_funcionario_no_puede_editar(self):
        self.client.force_authenticate(self.funcionario_user)
        response = self.client.patch(
            f'/api/inventario/herramientas/{self.herramienta.id}/',
            {'Herramienta': 'Otra'},
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_admin_edita_herramienta(self):
        self.client.force_authenticate(self.admin_user)
        response = self.client.patch(
            f'/api/inventario/herramientas/{self.herramienta.id}/',
            {'Herramienta': 'Pala grande', 'Descripcion': 'Nueva', 'Estado': True},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.herramienta.refresh_from_db()
        self.assertEqual(self.herramienta.Herramienta, 'Pala grande')
        self.assertEqual(self.herramienta.Descripcion, 'Nueva')

    def test_no_desactivar_herramienta_asignada(self):
        self._asignar_herramienta()
        self.client.force_authenticate(self.admin_user)
        response = self.client.patch(
            f'/api/inventario/herramientas/{self.herramienta.id}/',
            {'Estado': False},
            format='json',
        )
        self.assertEqual(response.status_code, 409)
        self.herramienta.refresh_from_db()
        self.assertTrue(self.herramienta.Estado)

    def test_soft_delete_herramienta_con_historial(self):
        self._asignar_herramienta(entregado=True)
        self.client.force_authenticate(self.admin_user)
        response = self.client.delete(
            f'/api/inventario/herramientas/{self.herramienta.id}/'
        )
        self.assertEqual(response.status_code, 200)
        self.herramienta.refresh_from_db()
        self.assertFalse(self.herramienta.Estado)


class VehiculosEdicionTests(_BaseEdicionInventario):
    def test_admin_crea_vehiculo_completo(self):
        self.client.force_authenticate(self.admin_user)
        response = self.client.post(
            '/api/inventario/detalleVehiculos/completo/',
            self._payload_vehiculo('XYZ-999'),
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(DetalleVehiculos.objects.count(), 1)
        self.assertEqual(Vehiculos.objects.count(), 1)

    def test_creacion_vehiculo_es_atomica(self):
        self.client.force_authenticate(self.admin_user)
        with mock.patch.object(
            DetalleVehiculos.objects, 'create', side_effect=RuntimeError('fallo')
        ):
            with self.assertRaises(RuntimeError):
                self.client.post(
                    '/api/inventario/detalleVehiculos/completo/',
                    self._payload_vehiculo('XYZ-999'),
                    format='json',
                )
        self.assertEqual(Vehiculos.objects.count(), 0)
        self.assertEqual(DetalleVehiculos.objects.count(), 0)

    def test_placa_duplicada(self):
        self._crear_vehiculo('ABC-123')
        self.client.force_authenticate(self.admin_user)
        response = self.client.post(
            '/api/inventario/detalleVehiculos/completo/',
            self._payload_vehiculo('abc-123'),
            format='json',
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(DetalleVehiculos.objects.count(), 1)

    def test_editar_vehiculo_completo(self):
        _, detalle = self._crear_vehiculo('ABC-123')
        self.client.force_authenticate(self.admin_user)
        response = self.client.patch(
            f'/api/inventario/detalleVehiculos/{detalle.id}/completo/',
            self._payload_vehiculo('ABC-456', linea=self.linea2, Modelo='2021'),
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        detalle.refresh_from_db()
        self.assertEqual(detalle.Placa, 'ABC-456')
        self.assertEqual(detalle.Modelo, '2021')
        self.assertEqual(detalle.Vehiculo.LineaVehiculo_id, self.linea2.id)

    def test_no_mass_assignment_del_padre(self):
        _, detalle = self._crear_vehiculo('ABC-123')
        _, otro = self._crear_vehiculo('ABC-789', linea=self.linea2)
        self.client.force_authenticate(self.admin_user)
        response = self.client.patch(
            f'/api/inventario/detalleVehiculos/{detalle.id}/',
            {'Vehiculo': otro.Vehiculo_id},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        detalle.refresh_from_db()
        self.assertNotEqual(detalle.Vehiculo_id, otro.Vehiculo_id)

    def test_copy_on_write_si_la_spec_es_compartida(self):
        registro, detalle_a = self._crear_vehiculo('ABC-123')
        detalle_b = DetalleVehiculos.objects.create(
            Vehiculo=registro,
            Placa='ABC-999',
            Modelo='2020',
            FechaTecno=date(2027, 1, 1),
            FechaSoat=date(2027, 1, 1),
            Descripcion='',
            Estado=True,
        )
        self.client.force_authenticate(self.admin_user)
        response = self.client.patch(
            f'/api/inventario/detalleVehiculos/{detalle_a.id}/completo/',
            self._payload_vehiculo('ABC-123', linea=self.linea2),
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        detalle_a.refresh_from_db()
        detalle_b.refresh_from_db()
        self.assertNotEqual(detalle_a.Vehiculo_id, detalle_b.Vehiculo_id)
        self.assertEqual(detalle_b.Vehiculo.LineaVehiculo_id, self.linea.id)

    def test_no_desactivar_vehiculo_asignado(self):
        _, detalle = self._crear_vehiculo('ABC-123')
        self._asignar_vehiculo(detalle)
        self.client.force_authenticate(self.admin_user)
        response = self.client.patch(
            f'/api/inventario/detalleVehiculos/{detalle.id}/completo/',
            self._payload_vehiculo('ABC-123', Estado=False),
            format='json',
        )
        self.assertEqual(response.status_code, 409)
        detalle.refresh_from_db()
        self.assertTrue(detalle.Estado)

    def test_soft_delete_vehiculo_con_historial(self):
        _, detalle = self._crear_vehiculo('ABC-123')
        self._asignar_vehiculo(detalle, entregado=True)
        self.client.force_authenticate(self.admin_user)
        response = self.client.delete(
            f'/api/inventario/detalleVehiculos/{detalle.id}/'
        )
        self.assertEqual(response.status_code, 200)
        detalle.refresh_from_db()
        self.assertFalse(detalle.Estado)

    def test_listado_incluye_marca_linea_tipo_y_combustible(self):
        self._crear_vehiculo('ABC-123')
        self.client.force_authenticate(self.admin_user)
        respuesta = self.client.get('/api/inventario/detalleVehiculos/')
        self.assertEqual(respuesta.status_code, 200)
        primero = filas(respuesta)[0]
        self.assertEqual(primero['MarcaVehiculo'], 'Toyota')
        self.assertEqual(primero['LineaVehiculo'], 'Hilux')
        self.assertEqual(primero['TipoVehiculo'], 'Camioneta')
        self.assertEqual(primero['TipoCombustible'], 'Diesel')

    def test_endpoint_spec_no_permite_crear_ni_editar_directo(self):
        self.client.force_authenticate(self.admin_user)
        registro, _ = self._crear_vehiculo('ABC-123')
        payload = {
            'LineaVehiculo': self.linea.id,
            'TipoCombustible': self.tipo_combustible.id,
            'TipoVehiculo': self.tipo_vehiculo.id,
        }
        creado = self.client.post('/api/inventario/vehiculos/', payload, format='json')
        self.assertEqual(creado.status_code, 405)
        editado = self.client.patch(
            f'/api/inventario/vehiculos/{registro.id}/', payload, format='json'
        )
        self.assertEqual(editado.status_code, 405)

    def test_funcionario_no_puede_editar_vehiculo(self):
        _, detalle = self._crear_vehiculo('ABC-123')
        self.client.force_authenticate(self.funcionario_user)
        response = self.client.patch(
            f'/api/inventario/detalleVehiculos/{detalle.id}/completo/',
            self._payload_vehiculo('ABC-123'),
            format='json',
        )
        self.assertEqual(response.status_code, 403)


class CatalogosUnicosTests(_BaseEdicionInventario):
    def test_catalogo_duplicado_devuelve_existente(self):
        self.client.force_authenticate(self.admin_user)
        response = self.client.post(
            '/api/inventario/tiposHerramientas/',
            {'TipoHerramienta': 'manual'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], self.tipo_herramienta.id)
        self.assertEqual(TiposHerramientas.objects.count(), 1)

    def test_catalogo_nuevo_se_crea(self):
        self.client.force_authenticate(self.admin_user)
        response = self.client.post(
            '/api/inventario/tiposHerramientas/',
            {'TipoHerramienta': 'Eléctrica'},
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TiposHerramientas.objects.count(), 2)
