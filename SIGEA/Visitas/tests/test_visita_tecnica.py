import base64

from rest_framework.test import APITestCase

from Usuarios.models import (
    Administradores,
    Funcionarios,
    Personas,
    TiposContactos,
    TiposDocumentos,
    Usuario,
)
from Visitas.models import (
    Calificaciones,
    Estados,
    InfoVisita,
    MotivosSolicitudes,
    Solicitudes,
    TiposVisitas,
    Visitas,
)
from Visitas.serializers import FormularioVisitaTecnicaSerializer


def _firma(texto="firma-valida"):
    return base64.b64encode(texto.encode()).decode()


class FormularioSerializerTests(APITestCase):
    def _base(self, **overrides):
        data = {
            "fecha_visita": "2026-09-20T10:00:00",
            "firma_usuario": _firma("productor"),
            "firma_funcionario": _firma("funcionario"),
        }
        data.update(overrides)
        return data

    def test_fecha_visita_requerida(self):
        s = FormularioVisitaTecnicaSerializer(data=self._base(fecha_visita=""))
        self.assertFalse(s.is_valid())
        self.assertIn("fecha_visita", s.errors)

    def test_firmas_requeridas(self):
        s = FormularioVisitaTecnicaSerializer(
            data=self._base(firma_usuario="", firma_funcionario="")
        )
        self.assertFalse(s.is_valid())
        self.assertIn("firma_usuario", s.errors)
        self.assertIn("firma_funcionario", s.errors)

    def test_firma_base64_invalida(self):
        s = FormularioVisitaTecnicaSerializer(
            data=self._base(firma_usuario="***no-base64***")
        )
        self.assertFalse(s.is_valid())
        self.assertIn("firma_usuario", s.errors)

    def test_firma_data_uri_valida(self):
        raw = _firma("otra")
        s = FormularioVisitaTecnicaSerializer(
            data=self._base(firma_usuario=f"data:image/png;base64,{raw}")
        )
        self.assertTrue(s.is_valid(), s.errors)

    def test_accion_insumos_exige_insumos(self):
        s = FormularioVisitaTecnicaSerializer(data=self._base(acciones=["insumos"]))
        self.assertFalse(s.is_valid())
        self.assertIn("insumos", s.errors)

    def test_accion_insumos_con_insumos_ok(self):
        s = FormularioVisitaTecnicaSerializer(
            data=self._base(
                acciones=["insumos"],
                insumos=[{"inventario_funcionario_id": 1, "cantidad": 2}],
            )
        )
        self.assertTrue(s.is_valid(), s.errors)


class FormularioVistaTests(APITestCase):
    url = "/api/visitas/formulario-visita/"

    def setUp(self):
        tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")
        TiposContactos.objects.create(id=1, TipoContacto="Celular")
        TiposContactos.objects.create(id=2, TipoContacto="Correo")

        persona_func = Personas.objects.create(
            primer_nombre="Visita",
            primer_apellido="Func",
            numero_documento="6000000001",
            TipoDocumento=tipo_doc,
            fecha_nacimiento="1988-04-04",
        )
        self.user_func = Usuario.objects.create_user(
            email="visita.func@example.com", password="x1234567", persona=persona_func
        )
        self.funcionario = Funcionarios.objects.create(usuario=self.user_func)

        persona_admin = Personas.objects.create(
            primer_nombre="Visita",
            primer_apellido="Admin",
            numero_documento="6000000002",
            TipoDocumento=tipo_doc,
            fecha_nacimiento="1985-05-05",
        )
        user_admin = Usuario.objects.create_user(
            email="visita.admin@example.com", password="x1234567", persona=persona_admin
        )
        Administradores.objects.create(usuario=user_admin)

        self.motivo = MotivosSolicitudes.objects.create(id=2, MotivoSolicitud="Caracterizacion")
        self.estado = Estados.objects.create(id=1, Estado="En Proceso")
        self.tipo_visita = TiposVisitas.objects.create(TipoVisita="Tecnica")
        self.calificacion = Calificaciones.objects.create(Calificacion="Buena")

    def _payload(self, **overrides):
        data = {
            "fecha_visita": "2026-09-20T10:00:00",
            "firma_usuario": _firma("productor-x"),
            "firma_funcionario": _firma("funcionario-x"),
            "tipo_visita_id": self.tipo_visita.id,
            "calificacion_id": self.calificacion.id,
            "motivo_id": self.motivo.id,
            "estado_id": self.estado.id,
            "descripcion_solicitud": "Revision de cultivo",
            "vereda_sector": "Vereda Central",
        }
        data.update(overrides)
        return data

    def test_post_ok_crea_solicitud_visita_info(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertIn("visita", resp.data)
        self.assertIn("solicitud", resp.data)
        self.assertIn("info_visita", resp.data)
        self.assertTrue(
            Solicitudes.objects.filter(id=resp.data["solicitud"]).exists()
        )
        self.assertTrue(Visitas.objects.filter(id=resp.data["visita"]).exists())
        self.assertTrue(InfoVisita.objects.filter(id=resp.data["info_visita"]).exists())

    def test_post_con_visita_id_reutiliza(self):
        self.client.force_authenticate(user=self.user_func)
        primera = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(primera.status_code, 201)
        n_sol = Solicitudes.objects.count()
        n_vis = Visitas.objects.count()
        segunda = self.client.post(
            self.url,
            self._payload(visita_id=primera.data["visita"]),
            format="json",
        )
        self.assertEqual(segunda.status_code, 201, segunda.content)
        self.assertEqual(segunda.data["visita"], primera.data["visita"])
        self.assertEqual(Solicitudes.objects.count(), n_sol)
        self.assertEqual(Visitas.objects.count(), n_vis)

    def test_post_fecha_invalida_da_400(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.post(
            self.url, self._payload(fecha_visita="no-es-fecha"), format="json"
        )
        self.assertEqual(resp.status_code, 400)

    def test_post_sin_calificacion_da_400(self):
        self.client.force_authenticate(user=self.user_func)
        payload = self._payload()
        payload.pop("calificacion_id")
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_post_sin_auth_da_401(self):
        resp = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(resp.status_code, 401)
