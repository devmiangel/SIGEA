"""Pruebas de la app Predios: acceso por rol a los predios y comportamiento de los catálogos.

Los permisos se cargan con el seeder real (`seed_permisos`), así que las pruebas
verifican lo que cada rol puede hacer en producción.
"""
from datetime import date

from django.contrib.auth.models import Group
from django.core.management import call_command
from rest_framework.test import APITestCase

from Predios.models import Predios, Sectores, Seguros, TiposRegistrosICA, TiposTenencias, Veredas
from UPs.models import UP, TipoUP
from Usuarios.models import Administradores, Funcionarios, Personas, Productores, TiposDocumentos, Usuario


class PrediosBase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_permisos", verbosity=0)
        cls.tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")

        cls.admin = cls._usuario("pred.admin", "1001", Administradores)
        cls.funcionario = cls._usuario("pred.func", "1002", Funcionarios)
        cls.productor_b = cls._usuario("pred.prodb", "1003", Productores)
        cls.productor_c = cls._usuario("pred.prodc", "1004", Productores)
        cls.usuario = cls._usuario("pred.usuario", "1005", None)
        cls.usuario.groups.add(Group.objects.get(name="Usuarios"))

        cls.tenencia = TiposTenencias.objects.create(TipoTenencia="Propia")
        tipo_up = TipoUP.objects.create(TipoUP="Agricola")
        cls.predio_b = cls._predio_con_up(cls.productor_b, tipo_up, "B")
        cls.predio_c = cls._predio_con_up(cls.productor_c, tipo_up, "C")

    @classmethod
    def _usuario(cls, nombre, documento, modelo_rol):
        persona = Personas.objects.create(
            primer_nombre=nombre, primer_apellido="Prueba", numero_documento=documento,
            TipoDocumento=cls.tipo_doc, fecha_nacimiento="1990-01-01",
        )
        user = Usuario.objects.create_user(
            email=f"{nombre}@example.com", password="x1234567", persona=persona
        )
        if modelo_rol is not None:
            modelo_rol.objects.create(usuario=user)  # agrega el usuario al grupo del rol
        return user

    @classmethod
    def _predio_con_up(cls, user, tipo_up, sufijo):
        predio = Predios.objects.create(NombrePredio=f"Predio {sufijo}", TipoTenencia=cls.tenencia)
        UP.objects.create(
            Productor=user.productores, Predio=predio, TipoUP=tipo_up,
            Funcionario=cls.funcionario.funcionarios,
            FechaCaracterizacion=date.today(), FechaActualizacion=date.today(),
        )
        return predio

    def como(self, user):
        self.client.force_authenticate(user=user)

    @staticmethod
    def ids(resp):
        datos = resp.data["results"] if isinstance(resp.data, dict) else resp.data
        return {item["id"] for item in datos}


class AccesoPrediosTests(PrediosBase):
    """Un productor solo ve sus predios; el staff ve todos (OwnedQuerysetMixin)."""

    URL = "/api/predios/predios/"

    def test_productor_lista_solo_sus_predios(self):
        self.como(self.productor_b)
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(self.ids(resp), {self.predio_b.id})

    def test_productor_no_ve_predio_ajeno(self):
        self.como(self.productor_b)
        resp = self.client.get(f"{self.URL}{self.predio_c.id}/")
        self.assertEqual(resp.status_code, 404)

    def test_productor_no_crea_ni_modifica_predios(self):
        self.como(self.productor_b)
        crear = self.client.post(self.URL, {"NombrePredio": "Nuevo", "TipoTenencia": self.tenencia.id}, format="json")
        modificar = self.client.patch(f"{self.URL}{self.predio_b.id}/", {"NombrePredio": "Cambio"}, format="json")
        self.assertEqual(crear.status_code, 403)
        self.assertEqual(modificar.status_code, 403)
        self.predio_b.refresh_from_db()
        self.assertEqual(self.predio_b.NombrePredio, "Predio B")

    def test_staff_ve_todos_los_predios(self):
        for user in (self.admin, self.funcionario):
            self.como(user)
            resp = self.client.get(self.URL)
            self.assertEqual(resp.status_code, 200)
            self.assertTrue({self.predio_b.id, self.predio_c.id} <= self.ids(resp))

    def test_funcionario_edita_pero_no_elimina(self):
        self.como(self.funcionario)
        modificar = self.client.patch(f"{self.URL}{self.predio_c.id}/", {"NombrePredio": "Predio C editado"}, format="json")
        eliminar = self.client.delete(f"{self.URL}{self.predio_c.id}/")
        self.assertEqual(modificar.status_code, 200)
        self.assertEqual(eliminar.status_code, 403)
        self.assertTrue(Predios.objects.filter(id=self.predio_c.id).exists())

    def test_rol_usuarios_no_accede_a_predios(self):
        self.como(self.usuario)
        self.assertEqual(self.client.get(self.URL).status_code, 403)

    def test_sin_sesion_da_401(self):
        self.assertEqual(self.client.get(self.URL).status_code, 401)


class CatalogosPrediosTests(PrediosBase):
    """Catálogos de ubicación, tenencia, seguros y registros ICA."""

    def test_productor_consulta_pero_no_crea_catalogos(self):
        self.como(self.productor_b)
        self.assertEqual(self.client.get("/api/predios/seguros/").status_code, 200)
        resp = self.client.post("/api/predios/seguros/", {"NombreSeguro": "Agro"}, format="json")
        self.assertEqual(resp.status_code, 403)
        self.assertFalse(Seguros.objects.filter(NombreSeguro="Agro").exists())

    def test_seguro_existente_se_reutiliza(self):
        self.como(self.funcionario)
        primero = self.client.post("/api/predios/seguros/", {"NombreSeguro": "Seguro Agrario"}, format="json")
        repetido = self.client.post("/api/predios/seguros/", {"NombreSeguro": "  Seguro Agrario  "}, format="json")
        self.assertEqual(primero.status_code, 201)
        self.assertEqual(repetido.status_code, 200)
        self.assertEqual(repetido.data["id"], primero.data["id"])
        self.assertEqual(Seguros.objects.filter(NombreSeguro="Seguro Agrario").count(), 1)

    def test_registro_ica_existente_se_reutiliza(self):
        self.como(self.funcionario)
        primero = self.client.post("/api/predios/tiposRegistrosICA/", {"CodigoICA": "ICA-123"}, format="json")
        repetido = self.client.post("/api/predios/tiposRegistrosICA/", {"CodigoICA": "ICA-123"}, format="json")
        self.assertEqual(primero.status_code, 201)
        self.assertEqual(repetido.status_code, 200)
        self.assertEqual(repetido.data["id"], primero.data["id"])
        self.assertEqual(TiposRegistrosICA.objects.filter(CodigoICA="ICA-123").count(), 1)

    def test_funcionario_crea_sector_en_vereda(self):
        self.como(self.funcionario)
        vereda = self.client.post("/api/predios/veredas/", {"NombreVereda": "La Esperanza"}, format="json")
        self.assertEqual(vereda.status_code, 201)
        sector = self.client.post(
            "/api/predios/sectores/", {"NombreSector": "Alto", "Vereda": vereda.data["id"]}, format="json"
        )
        self.assertEqual(sector.status_code, 201)
        self.assertEqual(Sectores.objects.get(id=sector.data["id"]).Vereda_id, vereda.data["id"])
        self.assertTrue(Veredas.objects.filter(NombreVereda="La Esperanza").exists())
