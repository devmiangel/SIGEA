from rest_framework.test import APITestCase

from Usuarios.models import (
    Administradores,
    Funcionarios,
    Personas,
    Productores,
    TiposContactos,
    TiposDocumentos,
    Usuario,
)


class LoginTests(APITestCase):
    url = "/api/usuarios/login/"

    def setUp(self):
        tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")
        TiposContactos.objects.create(id=1, TipoContacto="Celular")
        TiposContactos.objects.create(id=2, TipoContacto="Correo")
        persona = Personas.objects.create(
            primer_nombre="Laura",
            primer_apellido="Gomez",
            numero_documento="3000000001",
            TipoDocumento=tipo_doc,
            fecha_nacimiento="1992-03-04",
        )
        self.password = "claveSegura123"
        self.user = Usuario.objects.create_user(
            email="productor.login@example.com",
            password=self.password,
            persona=persona,
        )
        Productores.objects.create(usuario=self.user)

    def test_login_ok_devuelve_token_y_rol(self):
        resp = self.client.post(
            self.url,
            {"email": "productor.login@example.com", "password": self.password},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertIn("token", resp.data)
        self.assertEqual(resp.data["user"]["rol"], "Productores")
        self.assertEqual(resp.data["user"]["email"], "productor.login@example.com")

    def test_login_rol_administrador(self):
        tipo_doc = TiposDocumentos.objects.first()
        persona = Personas.objects.create(
            primer_nombre="Ana",
            primer_apellido="Admin",
            numero_documento="3000000002",
            TipoDocumento=tipo_doc,
            fecha_nacimiento="1985-01-01",
        )
        admin = Usuario.objects.create_user(
            email="admin.login@example.com", password="admin12345", persona=persona
        )
        Administradores.objects.create(usuario=admin)
        resp = self.client.post(
            self.url,
            {"email": "admin.login@example.com", "password": "admin12345"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.data["user"]["rol"], "Administradores")

    def test_login_rol_funcionario(self):
        tipo_doc = TiposDocumentos.objects.first()
        persona = Personas.objects.create(
            primer_nombre="Luis",
            primer_apellido="Func",
            numero_documento="3000000003",
            TipoDocumento=tipo_doc,
            fecha_nacimiento="1990-01-01",
        )
        func = Usuario.objects.create_user(
            email="func.login@example.com", password="func12345", persona=persona
        )
        Funcionarios.objects.create(usuario=func)
        resp = self.client.post(
            self.url,
            {"email": "func.login@example.com", "password": "func12345"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.data["user"]["rol"], "Funcionarios")

    def test_login_mala_clave_da_401(self):
        resp = self.client.post(
            self.url,
            {"email": "productor.login@example.com", "password": "equivocada"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_login_usuario_inexistente_da_401(self):
        resp = self.client.post(
            self.url,
            {"email": "nadie@example.com", "password": "cualquiera"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_login_payload_incompleto_da_400(self):
        resp = self.client.post(
            self.url, {"email": "productor.login@example.com"}, format="json"
        )
        self.assertEqual(resp.status_code, 400) 
