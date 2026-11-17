from datetime import date

from rest_framework.test import APITestCase

from django.contrib.auth.models import Permission

from Predios.models import Predios, TiposTenencias
from UPs.models import UP, EstadosUP, TipoUP
from Visitas.models import Estados, MotivosSolicitudes, Solicitudes, TiposVisitas, Visitas
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
        # La migracion 0003 ya siembra "En revision"
        self.en_revision = EstadosUP.objects.get(Estado="En revision")
        self.up.idEstado = self.en_revision
        self.up.save()
        # Visita de caracterizacion ya finalizada sobre la UP
        self.solicitud = Solicitudes.objects.create(
            UP=self.up,
            MotivoSolicitud=MotivosSolicitudes.objects.create(MotivoSolicitud="Caracterizacion"),
            Observacion="obs", Direccion="dir",
            Estado=Estados.objects.create(Estado="Aprobada"), Usuario=self.productor,
        )
        self.visita = Visitas.objects.create(
            Solicitud=self.solicitud, Funcionario=self.up.Funcionario,
            TipoVisita=TiposVisitas.objects.create(TipoVisita="Caracterización"),
            FechaYHoraVisita="2026-09-20T10:00:00Z", estado=True,
        )

    def _url(self, up_id=None):
        return f"/api/UPs/validar-ups/{up_id if up_id is not None else self.up.id}/"

    def _validar(self, data, user=None):
        self.client.force_authenticate(user=user or self.admin)
        return self.client.post(self._url(), data, format="json")

    def test_aprobada_true_deja_aceptada_y_ruea(self):
        resp = self._validar({"aprobada": True})
        self.assertEqual(resp.status_code, 200, resp.content)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "Aceptada")
        self.assertEqual(self.up.RUEA, f"RUDEA-{self.up.pk:07d}")

    def test_aceptar_guarda_quien_y_cuando(self):
        self._validar({"aprobada": True})
        self.up.refresh_from_db()
        self.assertEqual(self.up.ValidadoPor.usuario_id, self.admin.id)
        self.assertIsNotNone(self.up.FechaValidacion)
        self.assertEqual(self.up.MotivoRechazo, "")

    def test_rechazar_exige_motivo(self):
        resp = self._validar({"aprobada": False})
        self.assertEqual(resp.status_code, 400)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "En revision")

    def test_rechazar_con_motivo_lo_guarda(self):
        resp = self._validar({"aprobada": False, "motivo": "Faltan datos del predio"})
        self.assertEqual(resp.status_code, 200, resp.content)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "Rechazada")
        self.assertEqual(self.up.MotivoRechazo, "Faltan datos del predio")
        self.assertEqual(self.up.ValidadoPor.usuario_id, self.admin.id)
        self.assertEqual(resp.data["MotivoRechazo"], "Faltan datos del predio")

    def test_aprobada_texto_false_no_acepta(self):
        # Antes "false" (cadena no vacia) se tomaba como verdadero y ACEPTABA la UP.
        resp = self._validar({"aprobada": "false", "motivo": "No cumple"})
        self.assertEqual(resp.status_code, 200, resp.content)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "Rechazada")

    def test_aprobada_no_booleano_da_400(self):
        resp = self._validar({"aprobada": "quizas"})
        self.assertEqual(resp.status_code, 400)

    def test_up_ya_validada_da_409(self):
        self.assertEqual(self._validar({"aprobada": True}).status_code, 200)
        resp = self._validar({"aprobada": False, "motivo": "cambio de opinion"})
        self.assertEqual(resp.status_code, 409)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "Aceptada")

    def test_up_sin_visita_finalizada_da_409(self):
        self.visita.estado = False
        self.visita.save()
        resp = self._validar({"aprobada": True})
        self.assertEqual(resp.status_code, 409)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "En revision")

    def test_estado_no_se_cambia_por_el_endpoint_generico(self):
        aceptada = EstadosUP.objects.create(Estado="Aceptada")
        self.client.force_authenticate(user=self.admin)
        self.client.patch(f"/api/UPs/ups/{self.up.id}/", {"idEstado": aceptada.id}, format="json")
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "En revision")

    def test_sin_campo_aprobada_da_400(self):
        self.assertEqual(self._validar({}).status_code, 400)

    def test_up_inexistente_da_404(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post("/api/UPs/validar-ups/999999/", {"aprobada": True}, format="json")
        self.assertEqual(resp.status_code, 404)

    def test_sin_auth_da_401(self):
        resp = self.client.post(self._url(), {"aprobada": True}, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_funcionario_no_admin_da_403(self):
        self.assertEqual(self._validar({"aprobada": True}, user=self.funcionario).status_code, 403)

    def test_productor_no_admin_da_403(self):
        self.assertEqual(self._validar({"aprobada": True}, user=self.productor).status_code, 403)


class EdicionTrasValidacionTests(ValidacionAdminTests):
    """Editar la caracterizacion de una UP ya validada."""

    def setUp(self):
        super().setUp()
        TiposContactos.objects.get_or_create(id=1, defaults={"TipoContacto": "Celular"})
        self.funcionario.user_permissions.add(
            Permission.objects.get(codename="add_up"),
            Permission.objects.get(codename="add_predios"),
        )

    def _editar(self):
        self.client.force_authenticate(user=self.funcionario)
        return self.client.post(
            f"/api/UPs/info_up_caracterizacion/{self.productor.id}/",
            {"NumeroEmpleados": 4, "up_id": self.up.id}, format="json",
        )

    def test_editar_up_aceptada_la_devuelve_a_revision(self):
        self._validar({"aprobada": True})
        resp = self._editar()
        self.assertEqual(resp.status_code, 200, resp.content)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "En revision")
        self.assertFalse(self.up.CodigoQR)
        # y se puede validar de nuevo
        self.assertEqual(self._validar({"aprobada": True}).status_code, 200)

    def test_editar_up_rechazada_da_409(self):
        self._validar({"aprobada": False, "motivo": "No cumple"})
        self.assertEqual(self._editar().status_code, 409)
        self.up.refresh_from_db()
        self.assertEqual(self.up.idEstado.Estado, "Rechazada")
