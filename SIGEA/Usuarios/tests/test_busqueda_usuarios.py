"""Búsqueda de usuarios por nombre completo (varias palabras) y filtro por rol."""
from django.core.management import call_command
from rest_framework.test import APITestCase

from Usuarios.models import Administradores, Personas, Productores, TiposDocumentos, Usuario

URL = "/api/usuarios/usuarios/"
PASSWORD = "ClaveSegura#2026"


class BusquedaUsuariosTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_permisos", verbosity=0)
        tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")

        def crear(email, nombre, segundo, apellido, doc, rol=None):
            persona = Personas.objects.create(
                primer_nombre=nombre, segundo_nombre=segundo, primer_apellido=apellido,
                numero_documento=doc, TipoDocumento=tipo_doc, fecha_nacimiento="1990-01-01",
            )
            user = Usuario.objects.create_user(email=email, password=PASSWORD, persona=persona)
            if rol:
                rol.objects.create(usuario=user)
            return user

        cls.admin = crear("admin@t.com", "Ana", "", "Admin", "100", Administradores)
        cls.juan = crear("juan@t.com", "Juan", "Carlos", "Perez", "200", Productores)
        cls.maria = crear("maria@t.com", "Maria", "", "Perez", "300", Productores)

    def _buscar(self, **params):
        self.client.force_authenticate(self.admin)
        resp = self.client.get(URL, params)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        lista = data["results"] if isinstance(data, dict) else data
        return {u["email"] for u in lista}

    def test_nombre_y_apellido(self):
        self.assertEqual(self._buscar(search="Juan Perez"), {"juan@t.com"})

    def test_dos_nombres(self):
        self.assertEqual(self._buscar(search="juan carlos"), {"juan@t.com"})

    def test_apellido_solo_devuelve_varios(self):
        self.assertEqual(self._buscar(search="perez"), {"juan@t.com", "maria@t.com"})

    def test_documento_y_correo(self):
        self.assertEqual(self._buscar(search="300"), {"maria@t.com"})
        self.assertEqual(self._buscar(search="juan@t"), {"juan@t.com"})

    def test_sin_coincidencias(self):
        self.assertEqual(self._buscar(search="Juan Gomez"), set())

    def test_texto_mas_rol(self):
        self.assertEqual(self._buscar(search="perez", rol="Administradores"), set())
        self.assertEqual(self._buscar(search="ana", rol="Administradores"), {"admin@t.com"})
