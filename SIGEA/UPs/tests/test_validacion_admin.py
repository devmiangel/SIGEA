from datetime import date

from rest_framework.test import APITestCase

from Predios.models import Predios, TiposTenencias
from UPs.models import UP, TipoUP
from Usuarios.models import (
    Administradores,
    Funcionarios,
    Personas,
    Productores,
    TiposContactos,
    TiposDocumentos,
    Usuario,
)


def _crear_up_completa(sufijo="1"):
    tipo_doc = TiposDocumentos.objects.create(TipoDocumento=f"CC-{sufijo}")
    TiposContactos.objects.get_or_create(id=1, defaults={"TipoContacto": "Celular"})
    TiposContactos.objects.get_or_create(id=2, defaults={"TipoContacto": "Correo"})

    persona_prod = Personas.objects.create(
        primer_nombre="Prod",
        primer_apellido=f"Apellido{sufijo}",
        numero_documento=f"40000000{sufijo}",
        TipoDocumento=tipo_doc,
        fecha_nacimiento="1990-01-01",
    )
    user_prod = Usuario.objects.create_user(
        email=f"prod{sufijo}@example.com", password="x1234567", persona=persona_prod
    )
    productor = Productores.objects.create(usuario=user_prod)

    persona_func = Personas.objects.create(
        primer_nombre="Func",
        primer_apellido=f"F{sufijo}",
        numero_documento=f"41000000{sufijo}",
        TipoDocumento=tipo_doc,
        fecha_nacimiento="1988-01-01",
    )
    user_func = Usuario.objects.create_user(
        email=f"func{sufijo}@example.com", password="x1234567", persona=persona_func
    )
    funcionario = Funcionarios.objects.create(usuario=user_func)

    persona_admin = Personas.objects.create(
        primer_nombre="Admin",
        primer_apellido=f"A{sufijo}",
        numero_documento=f"42000000{sufijo}",
        TipoDocumento=tipo_doc,
        fecha_nacimiento="1985-01-01",
    )
    user_admin = Usuario.objects.create_user(
        email=f"admin{sufijo}@example.com", password="x1234567", persona=persona_admin
    )
    Administradores.objects.create(usuario=user_admin)

    tipo_up = TipoUP.objects.create(TipoUP=f"Agricola-{sufijo}")
    tenencia = TiposTenencias.objects.create(TipoTenencia=f"Propia-{sufijo}")
    predio = Predios.objects.create(NombrePredio=f"Predio {sufijo}", TipoTenencia=tenencia)
    up = UP.objects.create(
        Productor=productor,
        Predio=predio,
        TipoUP=tipo_up,
        Funcionario=funcionario,
        FechaCaracterizacion=date.today(),
        FechaActualizacion=date.today(),
    )
    return {"up": up, "admin": user_admin, "funcionario": user_func, "productor": user_prod}


class ValidacionAdminTests(APITestCase):
    def setUp(self):
        ctx = _crear_up_completa(sufijo="1")
        self.up = ctx["up"]
        self.admin = ctx["admin"]
        self.funcionario = ctx["funcionario"]
        self.productor = ctx["productor"]

    def _url(self, up_id=None):
        return f"/api/UPs/validar-ups/{up_id if up_id is not None else self.up.id}/"

    def test_aprobada_true_deja_aceptada_y_ruea(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post(self._url(), {"aprobada": True}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "Aceptada")
        self.assertEqual(self.up.RUEA, f"RUDEA-{self.up.pk:07d}")

    def test_aprobada_false_deja_rechazada(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post(self._url(), {"aprobada": False}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "Rechazada")

    def test_sin_campo_aprobada_da_400(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post(self._url(), {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_up_inexistente_da_404(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post("/api/UPs/validar-ups/999999/", {"aprobada": True}, format="json")
        self.assertEqual(resp.status_code, 404)

    def test_sin_auth_da_401(self):
        resp = self.client.post(self._url(), {"aprobada": True}, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_funcionario_no_admin_da_403(self):
        self.client.force_authenticate(user=self.funcionario)
        resp = self.client.post(self._url(), {"aprobada": True}, format="json")
        self.assertEqual(resp.status_code, 403)

    def test_productor_no_admin_da_403(self):
        self.client.force_authenticate(user=self.productor)
        resp = self.client.post(self._url(), {"aprobada": True}, format="json")
        self.assertEqual(resp.status_code, 403)
