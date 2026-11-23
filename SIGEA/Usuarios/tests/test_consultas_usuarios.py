"""El listado de usuarios hace un número fijo de consultas, sin importar cuántos usuarios haya.

Antes, UsuarioSerializer hacía ~6 consultas por usuario (rol en 3 tablas, grupo y dos
consultas de conductor): ~300 consultas para una página de 50.
"""
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APITestCase

from Inventario.models import Conductores
from Usuarios.models import Administradores, Funcionarios, Personas, Productores, TiposDocumentos, Usuario

URL = "/api/usuarios/usuarios/"


class ConsultasListadoUsuariosTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_permisos", verbosity=0)
        cls.tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")
        cls.grupo_usuarios = Group.objects.get(name="Usuarios")
        cls.contador = 0
        cls.admin = cls._crear("Administradores")

    @classmethod
    def _crear(cls, rol, licencia=None):
        cls.contador += 1
        n = cls.contador
        persona = Personas.objects.create(
            primer_nombre=f"N{n}", primer_apellido="Prueba", numero_documento=f"99{n:06d}",
            TipoDocumento=cls.tipo_doc, fecha_nacimiento="1990-01-01",
        )
        user = Usuario.objects.create_user(
            email=f"consultas{n}@example.com", password="x1234567", persona=persona
        )
        if rol == "Administradores":
            Administradores.objects.create(usuario=user)
        elif rol == "Funcionarios":
            funcionario = Funcionarios.objects.create(usuario=user)
            if licencia:
                Conductores.objects.create(Funcionario=funcionario, Licencia=licencia, Estado=True)
        elif rol == "Productores":
            Productores.objects.create(usuario=user)
        else:
            user.groups.add(cls.grupo_usuarios)
        return user

    def _crear_mezcla(self, cantidad):
        roles = ["Funcionarios", "Productores", "Usuarios", "Administradores"]
        for i in range(cantidad):
            rol = roles[i % len(roles)]
            self._crear(rol, licencia=f"LIC-{i}" if rol == "Funcionarios" and i % 2 == 0 else None)

    def _consultas_al_listar(self):
        self.client.force_authenticate(self.admin)
        with CaptureQueriesContext(connection) as ctx:
            resp = self.client.get(URL, {"page": 1, "page_size": 50})
        self.assertEqual(resp.status_code, 200)
        return len(ctx.captured_queries), resp.data["count"]

    def test_consultas_no_crecen_con_la_cantidad_de_usuarios(self):
        # La primera petición también carga y cachea los permisos del admin;
        # se hace antes de medir para comparar solo el costo del listado.
        self._consultas_al_listar()
        self._crear_mezcla(3)
        consultas_pocos, total_pocos = self._consultas_al_listar()
        self._crear_mezcla(12)
        consultas_muchos, total_muchos = self._consultas_al_listar()
        self.assertEqual(total_muchos - total_pocos, 12)
        self.assertEqual(consultas_muchos, consultas_pocos)

    def test_rol_y_conductor_correctos(self):
        conductor = self._crear("Funcionarios", licencia="B2-123")
        funcionario = self._crear("Funcionarios")
        productor = self._crear("Productores")
        usuario = self._crear("Usuarios")
        self.client.force_authenticate(self.admin)
        datos = {u["id"]: u for u in self.client.get(URL).data}

        self.assertEqual(datos[self.admin.id]["rol"], "Administradores")
        self.assertEqual(datos[conductor.id]["rol"], "Funcionarios")
        self.assertTrue(datos[conductor.id]["es_conductor"])
        self.assertEqual(datos[conductor.id]["licencia"], "B2-123")
        self.assertFalse(datos[funcionario.id]["es_conductor"])
        self.assertIsNone(datos[funcionario.id]["licencia"])
        self.assertEqual(datos[productor.id]["rol"], "Productores")
        self.assertEqual(datos[usuario.id]["rol"], "Usuarios")

    def test_conductor_inactivo_no_cuenta(self):
        user = self._crear("Funcionarios", licencia="C1-9")
        Conductores.objects.filter(Funcionario=user.funcionarios).update(Estado=False)
        self.client.force_authenticate(self.admin)
        datos = {u["id"]: u for u in self.client.get(URL).data}
        self.assertFalse(datos[user.id]["es_conductor"])

    def test_cambio_de_rol_se_refleja_en_la_respuesta(self):
        user = self._crear("Funcionarios", licencia="A1-1")
        self.client.force_authenticate(self.admin)
        resp = self.client.patch(f"{URL}{user.id}/", {"rol": "Productores"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.data)
        self.assertEqual(resp.data["rol"], "Productores")
        self.assertFalse(resp.data["es_conductor"])

    def test_activar_conductor_se_refleja_en_la_respuesta(self):
        user = self._crear("Funcionarios")
        self.client.force_authenticate(self.admin)
        resp = self.client.patch(
            f"{URL}{user.id}/", {"rol": "Funcionarios", "es_conductor": True, "licencia": "B1-77"}, format="json"
        )
        self.assertEqual(resp.status_code, 200, resp.data)
        self.assertTrue(resp.data["es_conductor"])
        self.assertEqual(resp.data["licencia"], "B1-77")
