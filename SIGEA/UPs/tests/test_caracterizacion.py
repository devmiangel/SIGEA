from django.contrib.auth.models import Permission
from rest_framework.test import APITestCase

from Predios.models import Predios, TiposTenencias
from UPs.models import UP, TipoUP
from Usuarios.models import (
    Funcionarios,
    Personas,
    Productores,
    TiposContactos,
    TiposDocumentos,
    Usuario,
)


class CaracterizacionTests(APITestCase):
    def setUp(self):
        self.tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")
        TiposContactos.objects.create(id=1, TipoContacto="Celular")
        TiposContactos.objects.create(id=2, TipoContacto="Correo")
        TipoUP.objects.create(TipoUP="Agricola")
        TiposTenencias.objects.create(TipoTenencia="Propia")

        persona_prod = Personas.objects.create(
            primer_nombre="Maria",
            primer_apellido="Perez",
            numero_documento="5000000001",
            TipoDocumento=self.tipo_doc,
            fecha_nacimiento="1990-06-15",
        )
        self.user_prod = Usuario.objects.create_user(
            email="caract.prod@example.com", password="x1234567", persona=persona_prod
        )
        self.productor = Productores.objects.create(usuario=self.user_prod)

        persona_func = Personas.objects.create(
            primer_nombre="Felipe",
            primer_apellido="Func",
            numero_documento="5000000002",
            TipoDocumento=self.tipo_doc,
            fecha_nacimiento="1988-02-02",
        )
        self.user_func = Usuario.objects.create_user(
            email="caract.func@example.com", password="x1234567", persona=persona_func
        )
        Funcionarios.objects.create(usuario=self.user_func)
        self.user_func.user_permissions.add(
            Permission.objects.get(codename="add_up"),
            Permission.objects.get(codename="add_predios"),
        )

        persona_sin = Personas.objects.create(
            primer_nombre="Sin",
            primer_apellido="Permiso",
            numero_documento="5000000003",
            TipoDocumento=self.tipo_doc,
            fecha_nacimiento="1991-01-01",
        )
        self.user_sin_permiso = Usuario.objects.create_user(
            email="sin.permiso@example.com", password="x1234567", persona=persona_sin
        )

    def _url(self, seccion):
        return f"/api/UPs/{seccion}/{self.user_prod.id}/"

    def test_get_sin_up_personal_precargado(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.get(self._url("info_personal_caracterizacion"))
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.data["PrimerNombreProductor"], "Maria")
        self.assertEqual(resp.data["PrimerApellidoProductor"], "Perez")
        self.assertIsNone(resp.data["Rudea"])

    def test_get_sin_up_resto_vacio(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.get(self._url("info_up_caracterizacion"))
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertIsNone(resp.data["ActividadUP"])
        self.assertIsNone(resp.data["NumeroEmpleados"])

    def test_post_con_permiso_crea_draft_y_guarda(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.post(
            self._url("info_personal_caracterizacion"),
            {"Celular": "+573001234567", "Correo": "maria@example.com"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        up = UP.objects.filter(Productor=self.productor).first()
        self.assertIsNotNone(up)
        self.assertIsNotNone(up.Predio)
        self.assertTrue(Predios.objects.filter(id=up.Predio_id).exists())
        # GET posterior ya devuelve lo guardado
        resp2 = self.client.get(self._url("info_personal_caracterizacion"))
        self.assertEqual(resp2.data["Celular"], "+573001234567")
        self.assertEqual(resp2.data["Correo"], "maria@example.com")

    def test_post_sin_permiso_da_403(self):
        self.client.force_authenticate(user=self.user_sin_permiso)
        resp = self.client.post(
            self._url("info_personal_caracterizacion"),
            {"Celular": "+573001234567"},
            format="json",
        )
        self.assertEqual(resp.status_code, 403)

    def test_post_sin_auth_da_401(self):
        resp = self.client.post(
            self._url("info_personal_caracterizacion"),
            {"Celular": "+573001234567"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_post_celular_invalido_da_400(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.post(
            self._url("info_personal_caracterizacion"),
            {"Celular": "abc"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_post_email_invalido_da_400(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.post(
            self._url("info_personal_caracterizacion"),
            {"Correo": "no-es-email"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_post_vacio_se_normaliza_a_none(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.post(
            self._url("info_up_caracterizacion"), {"NumeroEmpleados": ""}, format="json"
        )
        self.assertEqual(resp.status_code, 200, resp.content)
