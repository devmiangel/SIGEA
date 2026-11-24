"""Pruebas de seguridad: cada rol solo accede a lo suyo.

Reproducen los hallazgos de la revisión de seguridad (IDOR, fuerza bruta, contraseñas
débiles, subidas de archivos, documentos privados) y verifican que quedaron corregidos.
"""
import io
import shutil
import tempfile
from datetime import date

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APITestCase

from SIGEAsite.testing import filas

from Predios.models import Predios, TiposTenencias
from UPs.models import UP, ArchivosUP, TipoUP
from Usuarios.models import (
    Administradores,
    Funcionarios,
    Personas,
    Productores,
    TiposContactos,
    TiposDocumentos,
    Usuario,
)
from Visitas.models import Estados, MotivosSolicitudes, Solicitudes, TiposVisitas, Visitas

PASSWORD = "ClaveSegura#2026"


def _png_bytes():
    buffer = io.BytesIO()
    Image.new("RGB", (4, 4), "green").save(buffer, format="PNG")
    return buffer.getvalue()


class SeguridadBase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_permisos", verbosity=0)
        cls.tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")
        TiposContactos.objects.create(id=1, TipoContacto="Celular")
        TiposContactos.objects.create(id=2, TipoContacto="Correo")

        cls.funcionario = cls._usuario("func", "Funcionarios")
        cls.admin = cls._usuario("admin", "Administradores")
        cls.productor_b = cls._usuario("prodb", "Productores")
        cls.productor_c = cls._usuario("prodc", "Productores")

        tipo_up = TipoUP.objects.create(TipoUP="Agricola")
        tenencia = TiposTenencias.objects.create(TipoTenencia="Propia")
        cls.up_b = cls._up(cls.productor_b, tipo_up, tenencia, "B")
        cls.up_c = cls._up(cls.productor_c, tipo_up, tenencia, "C")

        motivo = MotivosSolicitudes.objects.create(id=1, MotivoSolicitud="Visita")
        MotivosSolicitudes.objects.create(id=2, MotivoSolicitud="Caracterización")
        cls.estado = Estados.objects.create(id=1, Estado="En Proceso")
        cls.solicitud_b = Solicitudes.objects.create(
            UP=cls.up_b, MotivoSolicitud=motivo, Observacion="Privada de B",
            Direccion="Finca B", Estado=cls.estado, Usuario=cls.productor_b,
        )
        cls.visita_b = Visitas.objects.create(
            Solicitud=cls.solicitud_b,
            Funcionario=cls.funcionario.funcionarios,
            TipoVisita=TiposVisitas.objects.create(TipoVisita="Agrícola"),
            FechaYHoraVisita=timezone.now(),
        )

    @classmethod
    def _usuario(cls, nombre, rol):
        persona = Personas.objects.create(
            primer_nombre=nombre.capitalize(), primer_apellido="Prueba",
            numero_documento=f"7{abs(hash(nombre)) % 10**8:08d}",
            TipoDocumento=cls.tipo_doc, fecha_nacimiento="1990-01-01",
        )
        user = Usuario.objects.create_user(
            email=f"{nombre}@example.com", password=PASSWORD, persona=persona
        )
        modelo = {"Funcionarios": Funcionarios, "Administradores": Administradores,
                  "Productores": Productores}[rol]
        modelo.objects.create(usuario=user)
        return user

    @classmethod
    def _up(cls, user, tipo_up, tenencia, sufijo):
        predio = Predios.objects.create(NombrePredio=f"Predio {sufijo}", TipoTenencia=tenencia)
        return UP.objects.create(
            Productor=user.productores, Predio=predio, TipoUP=tipo_up,
            Funcionario=cls.funcionario.funcionarios,
            FechaCaracterizacion=date.today(), FechaActualizacion=date.today(),
        )

    def registrar_atacante(self):
        """Cuenta creada desde el formulario público (rol 'Usuarios')."""
        resp = self.client.post("/api/register/", {
            "primer_nombre": "Ana", "primer_apellido": "Atacante",
            "numero_documento": "11111111", "TipoDocumento": self.tipo_doc.id,
            "fecha_nacimiento": "1990-01-01", "email": "atacante@example.com",
            "password": PASSWORD,
        }, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        return Usuario.objects.get(email="atacante@example.com")

    def como(self, user):
        self.client.force_authenticate(user=user)


class AislamientoDeDatosTests(SeguridadBase):
    """Hallazgo #1: un usuario registrado no puede leer datos de otras personas."""

    LISTADOS_PERSONALES = [
        "/api/usuarios/personas/",
        "/api/usuarios/usuarios/",
        "/api/usuarios/contactos/",
        "/api/usuarios/productores/",
        "/api/usuarios/funcionarios/",
        "/api/UPs/UPs/",
        "/api/UPs/archivosUP/",
        "/api/predios/predios/",
        "/api/visitas/solicitudes/",
        "/api/visitas/visitas/",
    ]

    def _ids(self, resp):
        # filas() falla si la respuesta no es un listado: así "no ve nada ajeno"
        # no puede pasar por un formato inesperado.
        return [item["id"] for item in filas(resp)]

    def test_usuario_registrado_no_lista_datos_ajenos(self):
        atacante = self.registrar_atacante()
        self.como(atacante)
        for url in self.LISTADOS_PERSONALES:
            resp = self.client.get(url)
            self.assertIn(resp.status_code, (200, 403), url)
            if resp.status_code == 200:
                ids = self._ids(resp)
                if url == "/api/usuarios/usuarios/":
                    self.assertEqual(ids, [atacante.id], url)
                elif url == "/api/usuarios/personas/":
                    self.assertEqual(ids, [atacante.persona_id], url)
                else:
                    self.assertEqual(ids, [], url)

    def test_usuario_registrado_no_ve_detalle_ajeno(self):
        self.como(self.registrar_atacante())
        for url in [
            f"/api/usuarios/personas/{self.productor_b.persona_id}/",
            f"/api/usuarios/usuarios/{self.productor_b.id}/",
            f"/api/UPs/UPs/{self.up_b.id}/",
            f"/api/visitas/solicitudes/{self.solicitud_b.id}/",
        ]:
            self.assertIn(self.client.get(url).status_code, (403, 404), url)

    def test_buscar_usuarios_solo_staff(self):
        self.como(self.registrar_atacante())
        self.assertEqual(self.client.get("/api/usuarios/usuarios/buscar/?q=7").status_code, 403)
        self.como(self.funcionario)
        self.assertEqual(self.client.get("/api/usuarios/usuarios/buscar/?q=").status_code, 200)

    def test_productor_solo_ve_lo_suyo(self):
        self.como(self.productor_c)
        self.assertEqual(self._ids(self.client.get("/api/visitas/solicitudes/")), [])
        self.assertIn(self.client.get(f"/api/UPs/UPs/{self.up_b.id}/").status_code, (403, 404))

        self.como(self.productor_b)
        self.assertEqual(self._ids(self.client.get("/api/visitas/solicitudes/")), [self.solicitud_b.id])
        mis = self.client.get("/api/UPs/mis-ups/")
        self.assertEqual([u["id"] for u in mis.data], [self.up_b.id])

    def test_staff_sigue_viendo_todo(self):
        self.como(self.funcionario)
        ups = self._ids(self.client.get("/api/UPs/UPs/"))
        self.assertEqual(sorted(ups), sorted([self.up_b.id, self.up_c.id]))
        self.como(self.admin)
        self.assertGreaterEqual(len(self._ids(self.client.get("/api/usuarios/personas/"))), 4)

    def test_caracterizacion_ajena_prohibida(self):
        url_b = f"/api/UPs/info_personal_caracterizacion/{self.productor_b.id}/"
        self.como(self.productor_c)
        self.assertEqual(self.client.get(url_b).status_code, 403)
        self.como(self.registrar_atacante())
        self.assertEqual(self.client.get(url_b).status_code, 403)
        self.como(self.productor_b)
        self.assertEqual(self.client.get(url_b).status_code, 200)
        self.como(self.funcionario)
        self.assertEqual(self.client.get(url_b).status_code, 200)

    def test_endpoints_de_staff_prohibidos_para_productor(self):
        self.como(self.productor_c)
        self.assertEqual(self.client.post("/api/visitas/formulario-visita/", {}, format="json").status_code, 403)
        self.assertEqual(self.client.post("/api/visitas/formulario-recibo/", {}, format="json").status_code, 403)
        self.assertEqual(
            self.client.get(f"/api/visitas/infoVisita/{self.visita_b.id}/observaciones/").status_code, 403
        )
        self.assertEqual(self.client.get("/api/UPs/buscar-por-ruea/?ruea=X").status_code, 403)
        self.assertEqual(self.client.get(f"/api/UPs/{self.up_b.id}/qr/").status_code, 403)

    def test_pdf_de_visita_solo_dueno_o_staff(self):
        url = f"/api/documentos/visita/{self.visita_b.id}/generar/"
        self.como(self.productor_c)
        self.assertEqual(self.client.get(url).status_code, 403)


class CreacionSolicitudTests(SeguridadBase):
    """Hallazgo #2: no se pueden crear solicitudes a nombre de otro."""

    def test_router_fuerza_usuario_autenticado(self):
        self.como(self.productor_c)
        resp = self.client.post("/api/visitas/solicitudes/", {
            "MotivoSolicitud": 1, "Observacion": "x", "Direccion": "y",
            "Estado": self.estado.id, "Usuario": self.productor_b.id,
        }, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(Solicitudes.objects.get(id=resp.data["id"]).Usuario_id, self.productor_c.id)

    def test_crear_solicitud_a_nombre_de_otro_prohibido(self):
        self.como(self.productor_c)
        resp = self.client.post("/api/visitas/solicitudes/crear/", {
            "observacion": "x", "direccion": "y", "usuario_id": self.productor_b.id,
        }, format="json")
        self.assertEqual(resp.status_code, 403)


class LoginYPasswordTests(SeguridadBase):
    """Hallazgos #3, #4 y #9."""

    url_login = "/api/usuarios/login/"

    def test_fuerza_bruta_bloqueada(self):
        codigos = [
            self.client.post(self.url_login, {"email": "prodb@example.com", "password": "mala"},
                             format="json").status_code
            for _ in range(6)
        ]
        self.assertEqual(codigos[:5], [401] * 5)
        self.assertEqual(codigos[5], 429)

    def test_password_debil_rechazada(self):
        for debil in ("123", "12345678", "password"):
            resp = self.client.post("/api/register/", {
                "primer_nombre": "Debil", "primer_apellido": "Clave",
                "numero_documento": f"2{len(debil)}222222", "TipoDocumento": self.tipo_doc.id,
                "fecha_nacimiento": "1990-01-01", "email": f"debil{len(debil)}@example.com",
                "password": debil,
            }, format="json")
            self.assertEqual(resp.status_code, 400, debil)
            self.assertIn("password", resp.data)

    def _registrar_con_password(self, password, documento="3333333333"):
        return self.client.post("/api/register/", {
            "primer_nombre": "Carlos", "primer_apellido": "Rodríguez",
            "numero_documento": documento, "TipoDocumento": self.tipo_doc.id,
            "fecha_nacimiento": "1990-01-01", "email": "carlos.r@example.com",
            "password": password,
        }, format="json")

    def _mensajes_password(self, password):
        resp = self._registrar_con_password(password)
        self.assertEqual(resp.status_code, 400, resp.content)
        return " ".join(str(m) for m in resp.data["password"])

    def test_mensajes_explican_que_falta(self):
        casos = {
            "Ab1": "muy corta",
            "84736291": "solo números",
            "password1": "muy común",
            "Carlos#2026": "información personal",          # nombre
            "Rodriguez!77": "información personal",         # apellido, sin tilde
            "Clave3333333333": "información personal",      # documento
        }
        for password, esperado in casos.items():
            self.assertIn(esperado, self._mensajes_password(password), password)

    def test_varios_mensajes_a_la_vez(self):
        # Corta y solo números: ambos motivos se informan juntos.
        mensajes = self._mensajes_password("123")
        self.assertIn("muy corta", mensajes)
        self.assertIn("solo números", mensajes)

    def test_registro_invalido_por_password_no_deja_persona(self):
        self._registrar_con_password("Carlos#2026")
        self.assertFalse(Personas.objects.filter(numero_documento="3333333333").exists())

    def test_password_fuerte_se_acepta(self):
        resp = self._registrar_con_password("TrigoVerde#77")
        self.assertEqual(resp.status_code, 200, resp.content)

    def test_usuario_inactivo_no_inicia_sesion(self):
        self.productor_c.is_active = False
        self.productor_c.save(update_fields=["is_active"])
        resp = self.client.post(self.url_login, {"email": "prodc@example.com", "password": PASSWORD},
                                format="json")
        self.assertEqual(resp.status_code, 401)

    def test_login_correcto_sigue_funcionando(self):
        resp = self.client.post(self.url_login, {"email": "PRODB@example.com", "password": PASSWORD},
                                format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertIn("token", resp.data)


class ArchivosTests(SeguridadBase):
    """Hallazgos #5 y #6: subidas validadas y documentos privados."""

    url_upload = "/api/UPs/upload-archivo-up/"

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.override = override_settings(PRIVATE_MEDIA_ROOT=self.tmp, MAX_UPLOAD_MB=1)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.tmp, ignore_errors=True)

    def _subir(self, nombre, contenido):
        return self.client.post(
            self.url_upload, {"archivo": SimpleUploadedFile(nombre, contenido)}, format="multipart"
        )

    def test_subida_solo_staff(self):
        self.como(self.productor_b)
        self.assertEqual(self._subir("a.png", _png_bytes()).status_code, 403)

    def test_png_valido_se_guarda_en_privado(self):
        self.como(self.funcionario)
        resp = self._subir("foto.png", _png_bytes())
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertTrue(resp.data["RutaArchivo"].startswith("archivos_up/"))
        self.assertNotIn("/media/", resp.data["RutaArchivo"])

    def test_archivo_falso_rechazado(self):
        self.como(self.funcionario)
        self.assertEqual(self._subir("virus.png", b"MZ\x90\x00 no soy una imagen").status_code, 400)
        self.assertEqual(self._subir("doc.pdf", b"<html>no soy pdf</html>").status_code, 400)
        self.assertEqual(self._subir("script.html", b"<script></script>").status_code, 400)

    def test_archivo_grande_rechazado(self):
        self.como(self.funcionario)
        grande = b"%PDF-" + b"0" * (1024 * 1024 + 10)
        self.assertEqual(self._subir("grande.pdf", grande).status_code, 413)

    def test_descarga_solo_dueno_o_staff(self):
        self.como(self.funcionario)
        ruta = self._subir("foto.png", _png_bytes()).data["RutaArchivo"]
        archivo = ArchivosUP.objects.create(UP=self.up_b, RutaArchivo=ruta,
                                            NombreArchivo="foto.png", Descripcion="Adjunto")
        url = f"/api/UPs/archivosUP/{archivo.id}/descargar/"

        self.assertEqual(self.client.get(url).status_code, 200)
        self.como(self.productor_c)
        self.assertIn(self.client.get(url).status_code, (403, 404))
        self.como(self.registrar_atacante())
        self.assertIn(self.client.get(url).status_code, (403, 404))
