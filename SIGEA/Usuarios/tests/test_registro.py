from datetime import date, timedelta

from django.contrib.auth.models import Group
from rest_framework.test import APITestCase

from Usuarios.models import (
    Personas,
    Productores,
    TiposContactos,
    TiposDocumentos,
    Usuario,
)


class RegistroTests(APITestCase):
    url = "/api/register/"

    def setUp(self):
        self.tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")
        TiposContactos.objects.create(id=1, TipoContacto="Celular")
        TiposContactos.objects.create(id=2, TipoContacto="Correo")

    def _payload(self, **overrides):
        data = {
            "primer_nombre": "Carlos",
            "primer_apellido": "Rodriguez",
            "numero_documento": "1000000001",
            "TipoDocumento": self.tipo_doc.id,
            "fecha_nacimiento": "1990-05-10",
            "email": "nuevo@example.com",
            "password": "claveSegura123",
            "rol": "Productores",
        }
        data.update(overrides)
        return data

    def test_registro_ok_crea_persona_usuario_y_rol(self):
        resp = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.data["rol"], "Productores")
        persona = Personas.objects.get(numero_documento="1000000001")
        usuario = Usuario.objects.get(email="nuevo@example.com")
        self.assertTrue(usuario.check_password("claveSegura123"))
        self.assertEqual(usuario.persona_id, persona.id)
        self.assertTrue(Productores.objects.filter(usuario=usuario).exists())
        self.assertTrue(usuario.groups.filter(name="Productores").exists())

    def test_registro_ok_rol_por_defecto_usuarios(self):
        payload = self._payload()
        payload.pop("rol")
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        usuario = Usuario.objects.get(email="nuevo@example.com")
        self.assertTrue(usuario.groups.filter(name="Usuarios").exists())

    def test_registro_email_duplicado_da_400(self):
        self.assertEqual(
            self.client.post(self.url, self._payload(), format="json").status_code, 200
        )
        segundo = self._payload(numero_documento="2000000002")
        resp = self.client.post(self.url, segundo, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("email", resp.data)

    def test_registro_documento_duplicado_da_400(self):
        self.assertEqual(
            self.client.post(self.url, self._payload(), format="json").status_code, 200
        )
        segundo = self._payload(email="otro@example.com")
        resp = self.client.post(self.url, segundo, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("numero_documento", resp.data)

    def test_registro_nombre_igual_apellido_da_400(self):
        payload = self._payload(primer_nombre="Pedro", primer_apellido="Pedro")
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_registro_fecha_futura_da_400(self):
        futura = (date.today() + timedelta(days=1)).isoformat()
        payload = self._payload(fecha_nacimiento=futura)
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_registro_fecha_hoy_da_400(self):
        payload = self._payload(fecha_nacimiento=date.today().isoformat())
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, 400)
