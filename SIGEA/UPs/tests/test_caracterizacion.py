from django.contrib.auth.models import Permission
from rest_framework.test import APITestCase

from decimal import Decimal

from Predios.models import Predios, Sectores, TiposTenencias, Veredas
from UPs.models import (
    UP, AnimalesUps, ArchivosUP, ProduccionUPAgricola, ProductosUPs, TipoUP, Unidades,
)
from Usuarios.models import Empresas
from Visitas.models import Estados, MotivosSolicitudes, Solicitudes
from Usuarios.models import (
    Funcionarios,
    Personas,
    Productores,
    TiposContactos,
    TiposDocumentos,
    Usuario,
)


class _BaseCaracterizacion(APITestCase):
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
        self.funcionario = Funcionarios.objects.create(usuario=self.user_func)
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


class CaracterizacionTests(_BaseCaracterizacion):

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


class CaracterizacionGuardadoTests(_BaseCaracterizacion):
    """Verifica que cada seccion queda guardada correctamente en la BD."""

    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.user_func)
        self.up_id = None

    def _post(self, seccion, data):
        if self.up_id and "up_id" not in data:
            data = {**data, "up_id": self.up_id}
        return self.client.post(self._url(seccion), data, format="json")

    def _crear_up(self):
        resp = self._post("info_personal_caracterizacion", {"Celular": "3001234567"})
        self.assertEqual(resp.status_code, 200, resp.content)
        up = UP.objects.get(Productor=self.productor)
        self.up_id = up.id
        return up

    def _otra_up(self, up):
        return UP.objects.create(
            Productor=self.productor, Predio=up.Predio, TipoUP=up.TipoUP,
            Funcionario=self.funcionario, FechaCaracterizacion=up.FechaCaracterizacion,
            FechaActualizacion=up.FechaActualizacion,
        )

    def _nuevo_funcionario(self, email, documento):
        persona = Personas.objects.create(
            primer_nombre="Otro", primer_apellido="Func", numero_documento=documento,
            TipoDocumento=self.tipo_doc, fecha_nacimiento="1985-01-01",
        )
        user = Usuario.objects.create_user(email=email, password="x1234567", persona=persona)
        func = Funcionarios.objects.create(usuario=user)
        user.user_permissions.add(
            Permission.objects.get(codename="add_up"),
            Permission.objects.get(codename="add_predios"),
        )
        return user, func

    # --- UP / funcionario / atomicidad ---

    def test_up_queda_asignada_al_funcionario_que_caracteriza(self):
        otro_user, otro_func = self._nuevo_funcionario("otro.func@example.com", "5000000009")
        self.client.force_authenticate(user=otro_user)
        self._post("info_personal_caracterizacion", {"Celular": "3001234567"})
        up = UP.objects.get(Productor=self.productor)
        self.assertEqual(up.Funcionario_id, otro_func.id)

    def test_seccion_invalida_no_deja_up_ni_predio(self):
        predios_antes = Predios.objects.count()
        resp = self._post("info_personal_caracterizacion", {"Celular": "abc"})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(UP.objects.filter(Productor=self.productor).exists())
        self.assertEqual(Predios.objects.count(), predios_antes)

    def test_error_en_save_no_deja_up_ni_predio(self):
        # Sector nuevo sin vereda: el error ocurre dentro de update()
        predios_antes = Predios.objects.count()
        resp = self._post("info_predio_caracterizacion", {"Sector": "Nuevo"})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(UP.objects.filter(Productor=self.productor).exists())
        self.assertEqual(Predios.objects.count(), predios_antes)

    def test_solicitud_ajena_da_404_y_no_crea_up(self):
        resp = self._post("info_personal_caracterizacion",
                          {"Celular": "3001234567", "solicitud_id": 999999})
        self.assertEqual(resp.status_code, 404)
        self.assertFalse(UP.objects.exists())

    def test_flujo_completo_con_solicitud_crea_una_sola_up(self):
        solicitud = Solicitudes.objects.create(
            MotivoSolicitud=MotivosSolicitudes.objects.create(MotivoSolicitud="Caracterizacion"),
            Observacion="obs", Direccion="dir",
            Estado=Estados.objects.create(Estado="Aprobada"), Usuario=self.user_prod,
        )
        sid = solicitud.id
        pasos = [
            ("info_personal_caracterizacion",
             {"Celular": "3001234567", "NivelEducativo": "Primaria", "Sisben": "A1"}),
            ("info_predio_caracterizacion",
             {"NombrePredio": "La Esperanza", "AreaPredio": "3,5", "TipoTenencia": "Propia",
              "Direccion": "Km 3", "Vereda": "El Rosal", "Sector": "Alto",
              "Latitud": "4.123456789", "Longitud": "-74.1"}),
            ("info_up_caracterizacion",
             {"TipoUP_Nombre": "Agricola", "ActividadUP": "Cafe",
              "NumeroEmpleados": "3", "AreaCultivada": "1.5"}),
            ("info_produccion_agricola", {"ProduccionAgricola": [
                {"NombreProducto": "Cafe", "Cantidad": "2.5", "Unidad": "Ton"}]}),
            ("info_produccion_animal", {"Animales": [
                {"GrupoAnimal": "Bovinos", "Razas": [
                    {"Raza": "Holstein", "Cantidad": 5,
                     "Detalles": {"Machos": "2", "Hembras": "3"}}]}]}),
            ("info_produccion_agroindustrial", {"ProduccionAgroindustrial": [
                {"NombreProducto": "Queso", "Cantidad": "10", "Unidad": "Kg", "INVIMA": True}]}),
            ("info_adicional_caracterizacion", {"Archivos": []}),
        ]
        for seccion, data in pasos:
            resp = self._post(seccion, {**data, "solicitud_id": sid})
            self.assertEqual(resp.status_code, 200, (seccion, resp.content))

        self.assertEqual(UP.objects.filter(Productor=self.productor).count(), 1)
        up = UP.objects.get(Productor=self.productor)
        solicitud.refresh_from_db()
        self.assertEqual(solicitud.UP_id, up.id)
        self.assertEqual(up.Funcionario_id, self.funcionario.id)

        predio = up.Predio
        self.assertEqual(predio.NombrePredio, "La Esperanza")
        self.assertEqual(predio.AreaPredio, Decimal("3.5"))
        self.assertEqual(predio.Sector.NombreSector, "Alto")
        self.assertEqual(predio.Sector.Vereda.NombreVereda, "El Rosal")

        detalle = up.detalleup_set.get()
        self.assertEqual(detalle.Actividad.Actividad, "Cafe")
        self.assertEqual(detalle.NumeroEmpleados, 3)

        prod = up.produccionupagricola_set.get()
        self.assertEqual(prod.Cantidad, Decimal("2.5"))
        self.assertEqual(prod.Producto.Unidad.Unidad, "Ton")

        au = AnimalesUps.objects.get(UP=up)
        self.assertEqual(au.Cantidad, 5)
        self.assertEqual(au.detallebovinos_set.get().NumeroHembras, 3)

        self.assertTrue(up.produccionupagroindustrial_set.get().INVIMA)

        # GET devuelve lo guardado
        resp = self.client.get(self._url("info_produccion_agricola"), {"solicitud_id": sid})
        self.assertEqual(resp.data["ProduccionAgricola"][0]["Cantidad"], "2.5")
        resp = self.client.get(self._url("info_personal_caracterizacion"), {"solicitud_id": sid})
        self.assertEqual(resp.data["NivelEducativo"], "Primaria")

    # --- Personal: empresa ---

    def test_empresa_solo_con_nit_da_400(self):
        resp = self._post("info_personal_caracterizacion", {"NitProductor": "900123"})
        self.assertEqual(resp.status_code, 400)
        self.assertIn("RazonSocialProductor", resp.data)

    def test_empresa_nit_duplicado_da_400(self):
        Empresas.objects.create(NombreEmpresa="Otra", NitEmpresa="900123")
        resp = self._post("info_personal_caracterizacion",
                          {"RazonSocialProductor": "Mia", "NitProductor": "900123"})
        self.assertEqual(resp.status_code, 400)
        self.assertIn("NitProductor", resp.data)

    # --- UP: RUEA / tipo ---

    def test_ruea_repetido_da_400(self):
        up = self._crear_up()
        otra = self._otra_up(up)
        resp = self._post("info_up_caracterizacion", {"RUEA": otra.RUEA, "up_id": up.id})
        self.assertEqual(resp.status_code, 400)
        self.assertIn("RUEA", resp.data)

    def test_ruea_muy_largo_da_400(self):
        self._crear_up()
        resp = self._post("info_up_caracterizacion", {"RUEA": "X" * 21})
        self.assertEqual(resp.status_code, 400)

    def test_tipo_up_inexistente_da_400(self):
        self._crear_up()
        resp = self._post("info_up_caracterizacion", {"TipoUP_Nombre": "NoExiste"})
        self.assertEqual(resp.status_code, 400)

    # --- Predio: vereda/sector ---

    def test_sector_existente_en_otra_vereda_se_guarda_en_la_elegida(self):
        vereda_a = Veredas.objects.create(NombreVereda="A")
        Sectores.objects.create(NombreSector="Centro", Vereda=vereda_a)
        up = self._crear_up()
        resp = self._post("info_predio_caracterizacion", {"Vereda": "B", "Sector": "Centro"})
        self.assertEqual(resp.status_code, 200, resp.content)
        up.Predio.refresh_from_db()
        self.assertEqual(up.Predio.Sector.Vereda.NombreVereda, "B")
        self.assertEqual(resp.data["Vereda"], "B")

    # --- Produccion ---

    def test_unidad_de_producto_existente_no_se_modifica(self):
        kg = Unidades.objects.create(Unidad="Kg")
        ProductosUPs.objects.create(Producto="Papa", Unidad=kg)
        self._crear_up()
        resp = self._post("info_produccion_agricola", {"ProduccionAgricola": [
            {"NombreProducto": "Papa", "Cantidad": "4", "Unidad": "Bulto"}]})
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(ProductosUPs.objects.get(Producto="Papa").Unidad_id, kg.id)

    def test_cantidad_agricola_invalida_da_400(self):
        self._crear_up()
        resp = self._post("info_produccion_agricola", {"ProduccionAgricola": [
            {"NombreProducto": "Papa", "Cantidad": "mucho"}]})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(ProduccionUPAgricola.objects.exists())

    def test_aves_decimal_da_400(self):
        self._crear_up()
        resp = self._post("info_produccion_animal", {"Animales": [
            {"GrupoAnimal": "Aves", "CantidadTotal": 2, "Detalles": {"Gallinas": "2.5"}}]})
        self.assertEqual(resp.status_code, 400)

    def test_raza_duplicada_da_400(self):
        self._crear_up()
        resp = self._post("info_produccion_animal", {"Animales": [
            {"GrupoAnimal": "Bovinos", "Razas": [{"Raza": "Holstein", "Cantidad": 1}]},
            {"GrupoAnimal": "Bovinos", "Razas": [{"Raza": "holstein", "Cantidad": 2}]},
        ]})
        self.assertEqual(resp.status_code, 400)

    # --- Archivos ---

    def test_ruta_archivo_arbitraria_da_400(self):
        self._crear_up()
        resp = self._post("info_adicional_caracterizacion", {"Archivos": [
            {"RutaArchivo": "../../settings.py", "Descripcion": "x"}]})
        self.assertEqual(resp.status_code, 400)

    def test_archivo_de_otra_up_da_400(self):
        up = self._crear_up()
        otra = self._otra_up(up)
        ruta = "archivos_up/" + "a" * 32 + ".pdf"
        ArchivosUP.objects.create(UP=otra, RutaArchivo=ruta, Descripcion="ajeno")
        resp = self._post("info_adicional_caracterizacion",
                          {"up_id": up.id, "Archivos": [{"RutaArchivo": ruta, "Descripcion": "x"}]})
        self.assertEqual(resp.status_code, 400)

    def test_archivos_se_conservan_y_actualizan(self):
        up = self._crear_up()
        ruta = "archivos_up/" + "b" * 32 + ".png"
        datos = {"RutaArchivo": ruta, "NombreArchivo": "f.png", "Descripcion": "uno"}
        resp = self._post("info_adicional_caracterizacion", {"Archivos": [datos]})
        self.assertEqual(resp.status_code, 200, resp.content)
        archivo_id = ArchivosUP.objects.get(UP=up).id
        resp = self._post("info_adicional_caracterizacion",
                          {"Archivos": [{**datos, "Descripcion": "dos"}]})
        self.assertEqual(resp.status_code, 200, resp.content)
        archivo = ArchivosUP.objects.get(UP=up)
        self.assertEqual(archivo.id, archivo_id)
        self.assertEqual(archivo.Descripcion, "dos")
