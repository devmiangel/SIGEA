from django.contrib.auth.models import Permission
from rest_framework.test import APITestCase

from SIGEAsite.testing import filas

from Inventario.models import (
    AsignacionHerramientas,
    CardexInsumoFuncionario,
    Conductores,
    DetalleVehiculos,
    Herramientas,
    Insumos,
    InventarioFuncionario,
    LineasVehiculos,
    MarcasVehiculos,
    RegistroAsignacionVehiculos,
    SolicitudInsumo,
    TiposCombustibles,
    TiposHerramientas,
    TiposVehiculos,
    Vehiculos,
)
from UPs.models import Unidades
from Usuarios.models import Administradores, Funcionarios, Personas, TiposDocumentos, Usuario


class _BaseInventario(APITestCase):
    def _usuario(self, email, documento):
        persona = Personas.objects.create(
            primer_nombre="Inv", primer_apellido="Prueba", numero_documento=documento,
            TipoDocumento=self.tipo_doc, fecha_nacimiento="1988-04-04",
        )
        return Usuario.objects.create_user(email=email, password="x1234567", persona=persona)

    def setUp(self):
        self.tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")
        self.user_admin = self._usuario("inv.admin@example.com", "7000000001")
        self.admin = Administradores.objects.create(usuario=self.user_admin)
        self.user_func = self._usuario("inv.func@example.com", "7000000002")
        self.funcionario = Funcionarios.objects.create(usuario=self.user_func)
        self.user_func2 = self._usuario("inv.func2@example.com", "7000000003")
        self.funcionario2 = Funcionarios.objects.create(usuario=self.user_func2)
        permisos = Permission.objects.filter(codename__in=[
            "view_inventariofuncionario", "view_cardexinsumofuncionario",
            "view_asignacionherramientas", "view_registroasignacionvehiculos",
            "add_inventariofuncionario", "change_inventariofuncionario",
            "add_asignacionherramientas", "change_asignacionherramientas",
        ])
        for user in (self.user_admin, self.user_func, self.user_func2):
            user.user_permissions.add(*permisos)

        self.insumo = Insumos.objects.create(
            Nombre="Vacuna", Cantidad=10, Unidades=Unidades.objects.create(Unidad="Dosis")
        )
        self.herramienta = Herramientas.objects.create(
            Herramienta="Pala", TipoHerramienta=TiposHerramientas.objects.create(TipoHerramienta="Manual")
        )
        marca = MarcasVehiculos.objects.create(MarcaVehiculo="Toyota")
        vehiculo = Vehiculos.objects.create(
            LineaVehiculo=LineasVehiculos.objects.create(LineaVehiculo="Hilux", MarcaVehiculo=marca),
            TipoCombustible=TiposCombustibles.objects.create(TipoCombustible="Diesel"),
            TipoVehiculo=TiposVehiculos.objects.create(TipoVehiculo="Camioneta"),
        )
        self.detalle = DetalleVehiculos.objects.create(
            Vehiculo=vehiculo, Placa="ABC123", Modelo="2020",
            FechaTecno="2027-01-01", FechaSoat="2027-01-01",
        )
        Conductores.objects.create(Funcionario=self.funcionario, Licencia="B1")

    def _post(self, url, data=None, user=None):
        self.client.force_authenticate(user=user or self.user_admin)
        return self.client.post(url, data or {}, format="json")


class AsignacionInsumosTests(_BaseInventario):
    def _asignar(self, cantidad, funcionario=None, user=None):
        return self._post(
            f"/api/inventario/insumos/{self.insumo.id}/asignar/",
            {"funcionario_id": (funcionario or self.funcionario).id, "cantidad": cantidad}, user=user,
        )

    def test_asignar_mueve_stock_inventario_y_cardex(self):
        resp = self._asignar(4)
        self.assertEqual(resp.status_code, 201, resp.content)
        self.insumo.refresh_from_db()
        self.assertEqual(self.insumo.Cantidad, 6)
        inv = InventarioFuncionario.objects.get(Funcionario=self.funcionario, Insumo=self.insumo)
        self.assertEqual(inv.Cantidad, 4)
        cardex = CardexInsumoFuncionario.objects.get()
        self.assertEqual((cardex.Cantidad, cardex.Administrador_id), (4, self.admin.id))

        self.assertEqual(self._asignar(2).status_code, 201)
        inv.refresh_from_db()
        self.assertEqual(inv.Cantidad, 6)
        self.assertEqual(InventarioFuncionario.objects.count(), 1)

    def test_stock_insuficiente_da_400_y_no_cambia_nada(self):
        self.assertEqual(self._asignar(11).status_code, 400)
        self.insumo.refresh_from_db()
        self.assertEqual(self.insumo.Cantidad, 10)
        self.assertFalse(InventarioFuncionario.objects.exists())
        self.assertFalse(CardexInsumoFuncionario.objects.exists())

    def test_cantidad_decimal_o_invalida_da_400(self):
        for valor in (2.9, "2.9", True, "abc", 0, -1, None):
            self.assertEqual(self._asignar(valor).status_code, 400, valor)
        self.insumo.refresh_from_db()
        self.assertEqual(self.insumo.Cantidad, 10)

    def test_funcionario_inactivo_da_400(self):
        self.funcionario.Estado = False
        self.funcionario.save()
        self.assertEqual(self._asignar(1).status_code, 400)

    def test_insumo_inactivo_da_400(self):
        self.insumo.Estado = False
        self.insumo.save()
        self.assertEqual(self._asignar(1).status_code, 400)

    def test_solo_administrador_asigna(self):
        self.assertEqual(self._asignar(1, user=self.user_func).status_code, 403)

    def test_solicitud_se_resuelve_una_sola_vez(self):
        solicitud = SolicitudInsumo.objects.create(Insumo=self.insumo, Funcionario=self.funcionario, Cantidad=5)
        url = f"/api/inventario/solicitudInsumo/{solicitud.id}/asignar/"
        self.assertEqual(self._post(url, {"cantidad": 6}).status_code, 400)
        self.assertEqual(self._post(url, {"cantidad": 5}).status_code, 201)
        self.assertEqual(self._post(url, {"cantidad": 5}).status_code, 400)
        self.insumo.refresh_from_db()
        self.assertEqual(self.insumo.Cantidad, 5)
        solicitud.refresh_from_db()
        self.assertEqual(solicitud.Estado, "Resuelta")

    def test_solicitud_de_insumo_inactivo_da_400(self):
        solicitud = SolicitudInsumo.objects.create(Insumo=self.insumo, Funcionario=self.funcionario, Cantidad=5)
        self.insumo.Estado = False
        self.insumo.save()
        resp = self._post(f"/api/inventario/solicitudInsumo/{solicitud.id}/asignar/", {"cantidad": 5})
        self.assertEqual(resp.status_code, 400)
        solicitud.refresh_from_db()
        self.assertEqual(solicitud.Estado, "Pendiente")

    def test_inventario_es_solo_lectura(self):
        self._asignar(4)
        inv = InventarioFuncionario.objects.get()
        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.patch(f"/api/inventario/inventarioFuncionario/{inv.id}/", {"Cantidad": 999}, format="json")
        self.assertEqual(resp.status_code, 405)
        resp = self.client.post("/api/inventario/inventarioFuncionario/", {
            "Insumo": self.insumo.id, "Funcionario": self.funcionario2.id, "Cantidad": 50}, format="json")
        self.assertEqual(resp.status_code, 405)

    def test_funcionario_solo_ve_su_inventario(self):
        self._asignar(4)
        self._asignar(3, funcionario=self.funcionario2)
        self.client.force_authenticate(user=self.user_func)
        inventario = filas(self.client.get("/api/inventario/inventarioFuncionario/"))
        self.assertEqual([f["Funcionario"] for f in inventario], [self.funcionario.id])
        self.client.force_authenticate(user=self.user_admin)
        self.assertEqual(len(filas(self.client.get("/api/inventario/inventarioFuncionario/"))), 2)


class AsignacionHerramientasVehiculosTests(_BaseInventario):
    def _asignar_h(self, funcionario=None):
        return self._post(f"/api/inventario/herramientas/{self.herramienta.id}/asignar/",
                          {"funcionario_id": (funcionario or self.funcionario).id})

    def _asignar_v(self, funcionario=None):
        return self._post(f"/api/inventario/detalleVehiculos/{self.detalle.id}/asignar/",
                          {"funcionario_id": (funcionario or self.funcionario).id})

    def test_herramienta_asignar_devolver_y_reasignar(self):
        resp = self._asignar_h()
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(self._asignar_h(self.funcionario2).status_code, 400)

        url = f"/api/inventario/asignacionHerramientas/{resp.data['id']}/devolver/"
        self.assertEqual(self._post(url, user=self.user_func).status_code, 403)
        dev = self._post(url)
        self.assertEqual(dev.status_code, 200, dev.content)
        asignacion = AsignacionHerramientas.objects.get(id=resp.data["id"])
        self.assertTrue(asignacion.Entregado)
        self.assertIsNotNone(asignacion.FechaDevolucion)
        self.assertEqual(self._post(url).status_code, 409)

        self.assertEqual(self._asignar_h(self.funcionario2).status_code, 201)

    def test_vehiculo_asignar_devolver_y_reasignar(self):
        resp = self._asignar_v()
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(self._asignar_v().status_code, 400)

        url = f"/api/inventario/registroAsignacionVehiculos/{resp.data['id']}/devolver/"
        self.assertEqual(self._post(url).status_code, 200)
        self.assertTrue(RegistroAsignacionVehiculos.objects.get(id=resp.data["id"]).Entregado)
        self.assertEqual(self._post(url).status_code, 409)
        self.assertEqual(self._asignar_v().status_code, 201)

    def test_vehiculo_exige_licencia(self):
        self.assertEqual(self._asignar_v(self.funcionario2).status_code, 400)

    def test_funcionario_inactivo_no_recibe_herramienta(self):
        self.funcionario.Estado = False
        self.funcionario.save()
        self.assertEqual(self._asignar_h().status_code, 400)

    def test_asignaciones_no_se_crean_por_el_endpoint_generico(self):
        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.post("/api/inventario/asignacionHerramientas/", {
            "Herramienta": self.herramienta.id, "Funcionario": self.funcionario.id,
            "Administrador": self.admin.id, "FechaAsignacion": "2026-01-01"}, format="json")
        self.assertEqual(resp.status_code, 405)

    def test_funcionario_solo_ve_sus_asignaciones(self):
        self._asignar_h()
        self._asignar_v()
        self.client.force_authenticate(user=self.user_func2)
        self.assertEqual(filas(self.client.get("/api/inventario/asignacionHerramientas/")), [])
        self.assertEqual(filas(self.client.get("/api/inventario/registroAsignacionVehiculos/")), [])
        self.client.force_authenticate(user=self.user_func)
        self.assertEqual(len(filas(self.client.get("/api/inventario/asignacionHerramientas/"))), 1)
        self.assertEqual(len(filas(self.client.get("/api/inventario/registroAsignacionVehiculos/"))), 1)
