import base64

from django.utils import timezone
from rest_framework.test import APITestCase

from SIGEAsite.testing import filas

from Inventario.models import Insumos, InventarioFuncionario
from Predios.models import Predios, TiposTenencias
from UPs.models import UP, TipoUP, Unidades
from Usuarios.models import (
    Administradores,
    Funcionarios,
    Personas,
    Productores,
    TiposContactos,
    TiposDocumentos,
    Usuario,
)
from Visitas.models import (
    Aperos,
    Calificaciones,
    Estados,
    InfoVisita,
    InsumoVisita,
    MotivosSolicitudes,
    Pajillas,
    ServiciosPagos,
    Solicitudes,
    TiposVisitas,
    Visitas,
    VisitasServiciosPagos,
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


class _BaseVisita(APITestCase):
    url = "/api/visitas/formulario-visita/"

    def _persona(self, nombre, documento):
        return Personas.objects.create(
            primer_nombre=nombre, primer_apellido="Prueba", numero_documento=documento,
            TipoDocumento=self.tipo_doc, fecha_nacimiento="1988-04-04",
        )

    def _usuario(self, email, documento):
        return Usuario.objects.create_user(
            email=email, password="x1234567", persona=self._persona("Visita", documento)
        )

    def setUp(self):
        self.tipo_doc = TiposDocumentos.objects.create(TipoDocumento="CC")
        TiposContactos.objects.create(id=1, TipoContacto="Celular")
        TiposContactos.objects.create(id=2, TipoContacto="Correo")

        self.user_func = self._usuario("visita.func@example.com", "6000000001")
        self.funcionario = Funcionarios.objects.create(usuario=self.user_func)

        self.user_func2 = self._usuario("visita.func2@example.com", "6000000004")
        self.funcionario2 = Funcionarios.objects.create(usuario=self.user_func2)

        self.user_admin = self._usuario("visita.admin@example.com", "6000000002")
        Administradores.objects.create(usuario=self.user_admin)

        self.user_prod = self._usuario("visita.prod@example.com", "6000000003")
        self.productor = Productores.objects.create(usuario=self.user_prod)

        self.motivo = MotivosSolicitudes.objects.create(id=2, MotivoSolicitud="Caracterizacion")
        MotivosSolicitudes.objects.create(id=1, MotivoSolicitud="Visita")
        self.estado = Estados.objects.create(id=1, Estado="En Proceso")
        self.tipo_visita = TiposVisitas.objects.create(TipoVisita="Tecnica")
        self.calificacion = Calificaciones.objects.create(Calificacion="Buena")

        self.solicitud = Solicitudes.objects.create(
            MotivoSolicitud=self.motivo, Observacion="Texto original del productor",
            Direccion="Km 5", Estado=self.estado, Usuario=self.user_prod,
            motivoAdmin="Motivo del administrador",
        )
        self.visita = Visitas.objects.create(
            Solicitud=self.solicitud, Funcionario=self.funcionario, TipoVisita=self.tipo_visita,
            FechaYHoraVisita="2026-09-20T10:00:00Z",
        )

    def _payload(self, **overrides):
        data = {
            "visita_id": self.visita.id,
            "fecha_visita": "2026-09-20T10:00:00",
            "firma_usuario": _firma("productor-x"),
            "firma_funcionario": _firma("funcionario-x"),
            "calificacion_id": self.calificacion.id,
            "descripcion_solicitud": "Texto original del productor",
            "vereda_sector": "Vereda Central",
        }
        data.update(overrides)
        return data

    def _post(self, user=None, **overrides):
        self.client.force_authenticate(user=user or self.user_func)
        return self.client.post(self.url, self._payload(**overrides), format="json")

    def _crear_up(self, productor):
        tenencia = TiposTenencias.objects.first() or TiposTenencias.objects.create(TipoTenencia="Propia")
        tipo = TipoUP.objects.first() or TipoUP.objects.create(TipoUP="Agricola")
        predio = Predios.objects.create(NombrePredio="P", TipoTenencia=tenencia)
        return UP.objects.create(
            Productor=productor, Predio=predio, TipoUP=tipo, Funcionario=self.funcionario,
            FechaCaracterizacion="2026-01-01", FechaActualizacion="2026-01-01",
        )

class FormularioVistaTests(_BaseVisita):
    def test_post_ok_actualiza_visita_y_crea_info(self):
        resp = self._post()
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(resp.data["visita"], self.visita.id)
        self.assertEqual(resp.data["solicitud"], self.solicitud.id)
        self.visita.refresh_from_db()
        self.assertTrue(self.visita.estado)
        self.assertEqual(self.visita.Ubicacion, "Vereda Central")
        info = InfoVisita.objects.get(Visita=self.visita)
        self.assertEqual(info.Calificacion_id, self.calificacion.id)
        self.assertTrue(info.Firmado)

    def test_funcionario_no_queda_como_productor(self):
        self.assertEqual(self._post().status_code, 201)
        self.assertFalse(Productores.objects.filter(usuario=self.user_func).exists())
        self.assertFalse(self.user_func.groups.filter(name="Productores").exists())

    def test_sin_visita_id_da_400_y_no_crea_solicitud(self):
        n = Solicitudes.objects.count()
        resp = self._post(visita_id=None)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(Solicitudes.objects.count(), n)

    def test_visita_inexistente_da_404_y_no_crea_solicitud(self):
        n = Solicitudes.objects.count()
        resp = self._post(visita_id=999999)
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(Solicitudes.objects.count(), n)
        self.assertEqual(Visitas.objects.count(), 1)

    def test_visita_de_otro_funcionario_da_404(self):
        resp = self._post(user=self.user_func2)
        self.assertEqual(resp.status_code, 404)
        self.assertFalse(InfoVisita.objects.exists())

    def test_admin_puede_diligenciar_cualquier_visita(self):
        resp = self._post(user=self.user_admin)
        self.assertEqual(resp.status_code, 201, resp.content)

    def test_motivo_admin_se_conserva_y_observacion_no_se_recorta(self):
        texto = "x" * 400
        resp = self._post(descripcion_solicitud=texto, motivo_admin="otro")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.solicitud.refresh_from_db()
        self.assertEqual(self.solicitud.motivoAdmin, "Motivo del administrador")
        self.assertEqual(self.solicitud.Observacion, texto)

    def test_accion_tomada_larga_da_400(self):
        resp = self._post(accion_tomada="x" * 256)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("accion_tomada", resp.data)

    def test_hora_salida_antes_de_inicio_da_400(self):
        resp = self._post(hora_inicio="10:00", hora_salida="09:00")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("hora_salida", resp.data)

    def test_horas_validas_se_guardan(self):
        resp = self._post(hora_inicio="08:15", hora_salida="09:30")
        self.assertEqual(resp.status_code, 201, resp.content)
        info = InfoVisita.objects.get(Visita=self.visita)
        self.assertEqual(timezone.localtime(info.HoraInicio).strftime("%H:%M"), "08:15")
        self.assertEqual(timezone.localtime(info.HoraSalida).strftime("%H:%M"), "09:30")

    def test_calificacion_por_texto_usa_catalogo_fijo(self):
        resp = self._post(calificacion_id=None, calificacion="bueno")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(InfoVisita.objects.get(Visita=self.visita).Calificacion.Calificacion, "Bueno")
        resp = self._post(calificacion_id=None, calificacion="cualquier cosa")
        self.assertEqual(resp.status_code, 400)

    def test_visita_ya_registrada_da_409_y_no_descuenta_dos_veces(self):
        insumo = Insumos.objects.create(
            Nombre="Vacuna", Cantidad=100, Unidades=Unidades.objects.create(Unidad="Dosis")
        )
        inv = InventarioFuncionario.objects.create(Insumo=insumo, Funcionario=self.funcionario, Cantidad=10)
        datos = {"acciones": ["insumos"], "insumos": [{"inventario_funcionario_id": inv.id, "cantidad": 3}]}
        self.assertEqual(self._post(**datos).status_code, 201)
        inv.refresh_from_db()
        self.assertEqual(inv.Cantidad, 7)

        resp = self._post(**datos)
        self.assertEqual(resp.status_code, 409)
        inv.refresh_from_db()
        self.assertEqual(inv.Cantidad, 7)
        self.assertEqual(InsumoVisita.objects.filter(Visita=self.visita).count(), 1)

    def test_insumos_se_descuentan_del_funcionario_asignado(self):
        insumo = Insumos.objects.create(
            Nombre="Cal", Cantidad=100, Unidades=Unidades.objects.create(Unidad="Kg")
        )
        inv_admin_intento = InventarioFuncionario.objects.create(
            Insumo=insumo, Funcionario=self.funcionario2, Cantidad=10
        )
        # El admin diligencia la visita del funcionario 1 con inventario del funcionario 2
        resp = self._post(
            user=self.user_admin, acciones=["insumos"],
            insumos=[{"inventario_funcionario_id": inv_admin_intento.id, "cantidad": 1}],
        )
        self.assertEqual(resp.status_code, 400)

    def test_up_ajena_da_400(self):
        otro = Productores.objects.create(usuario=self._usuario("otro.prod@example.com", "6000000005"))
        up_ajena = self._crear_up(otro)
        resp = self._post(up_id=up_ajena.id)
        self.assertEqual(resp.status_code, 400)
        self.solicitud.refresh_from_db()
        self.assertIsNone(self.solicitud.UP_id)

    def test_up_propia_se_vincula(self):
        up = self._crear_up(self.productor)
        resp = self._post(up_id=up.id)
        self.assertEqual(resp.status_code, 201, resp.content)
        self.solicitud.refresh_from_db()
        self.assertEqual(self.solicitud.UP_id, up.id)

    def test_post_fecha_invalida_da_400(self):
        self.assertEqual(self._post(fecha_visita="no-es-fecha").status_code, 400)

    def test_post_sin_calificacion_da_400(self):
        payload = self._payload()
        payload.pop("calificacion_id")
        self.client.force_authenticate(user=self.user_func)
        self.assertEqual(self.client.post(self.url, payload, format="json").status_code, 400)

    def test_post_sin_auth_da_401(self):
        resp = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(resp.status_code, 401)


class FormularioReciboTests(_BaseVisita):
    url_recibo = "/api/visitas/formulario-recibo/"

    def setUp(self):
        super().setUp()
        self.maquinaria = ServiciosPagos.objects.create(ServicioPago="Maquinaria Agrícola")
        self.inseminacion = ServiciosPagos.objects.create(ServicioPago="Inseminación Artificial")
        self.pajilla = Pajillas.objects.create(Pajilla="Holstein", ValorPajilla=35000)
        self.apero = Aperos.objects.create(Apero="Arado", ValorHora=50000)

    def _recibo(self, user=None, **overrides):
        data = {
            "visita_id": self.visita.id,
            "servicio_pago_id": self.inseminacion.id,
            "pajilla_id": self.pajilla.id,
            "numero_pajillas": 3,
            "toro": False,
            "firma_usuario": _firma("p"),
            "firma_funcionario": _firma("f"),
        }
        data.update(overrides)
        self.client.force_authenticate(user=user or self.user_func)
        return self.client.post(self.url_recibo, data, format="json")

    def test_inseminacion_valor_lo_calcula_el_servidor(self):
        # Antes fallaba siempre: 'inseminacion' no coincidia con 'Inseminación'.
        resp = self._recibo(valor_total=1)
        self.assertEqual(resp.status_code, 201, resp.content)
        registro = VisitasServiciosPagos.objects.get(id=resp.data["registro"])
        self.assertEqual(registro.ValorTotal, 3 * 35000)

    def test_inseminacion_por_nombre_sin_tilde(self):
        resp = self._recibo(servicio_pago_id=None, servicio_pago="inseminacion artificial")
        self.assertEqual(resp.status_code, 201, resp.content)

    def test_maquinaria_valor_lo_calcula_el_servidor(self):
        resp = self._recibo(servicio_pago_id=self.maquinaria.id, apero_id=self.apero.id,
                            numero_horas=2, pajilla_id=None, numero_pajillas=None, toro=None)
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(VisitasServiciosPagos.objects.get().ValorTotal, 100000)

    def test_recibo_duplicado_da_409(self):
        self.assertEqual(self._recibo().status_code, 201)
        self.assertEqual(self._recibo().status_code, 409)
        self.assertEqual(VisitasServiciosPagos.objects.count(), 1)

    def test_recibo_visita_de_otro_funcionario_da_404(self):
        self.assertEqual(self._recibo(user=self.user_func2).status_code, 404)


class CrearSolicitudUPTests(_BaseVisita):
    url_crear = "/api/visitas/solicitudes/crear/"

    def _crear(self, up):
        self.client.force_authenticate(user=self.user_func)
        return self.client.post(self.url_crear, {
            "observacion": "Seguimiento", "direccion": "Km 5",
            "up_id": up.id, "usuario_id": self.user_prod.id,
        }, format="json")

    def test_up_ajena_da_400(self):
        otro = Productores.objects.create(usuario=self._usuario("otro2.prod@example.com", "6000000006"))
        resp = self._crear(self._crear_up(otro))
        self.assertEqual(resp.status_code, 400)

    def test_up_propia_da_201(self):
        resp = self._crear(self._crear_up(self.productor))
        self.assertEqual(resp.status_code, 201, resp.content)


class SolicitudProductorSegunEstadoUPTests(_BaseVisita):
    """El productor solo solicita sobre UPs validadas: Aceptada -> Visita,
    Rechazada -> Caracterización; En revisión o sin estado -> 400."""

    def _up_con_estado(self, estado):
        from UPs.models import EstadosUP
        up = self._crear_up(self.productor)
        if estado:
            up.idEstado, _ = EstadosUP.objects.get_or_create(Estado=estado)
            up.save(update_fields=['idEstado'])
        return up

    def _crear(self, up, motivo_id=None, url="/api/visitas/solicitudes/crear/"):
        self.client.force_authenticate(user=self.user_prod)
        payload = {"observacion": "Seguimiento", "direccion": "Km 5", "up_id": up.id if up else None}
        if motivo_id:
            payload["motivo_id"] = motivo_id
        return self.client.post(url, payload, format="json")

    def test_up_en_revision_da_400(self):
        resp = self._crear(self._up_con_estado('En revision'))
        self.assertEqual(resp.status_code, 400)

    def test_up_sin_estado_da_400(self):
        self.assertEqual(self._crear(self._up_con_estado(None)).status_code, 400)

    def test_up_aceptada_es_visita(self):
        # Aunque el cliente envíe otro motivo, el servidor decide.
        resp = self._crear(self._up_con_estado('Aceptada'), motivo_id=2)
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(resp.data["MotivoSolicitud"], 1)

    def test_up_rechazada_es_caracterizacion(self):
        resp = self._crear(self._up_con_estado('Rechazada'), motivo_id=1)
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(resp.data["MotivoSolicitud"], 2)

    def test_sin_up_es_caracterizacion(self):
        resp = self._crear(None, motivo_id=1)
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(resp.data["MotivoSolicitud"], 2)

    def test_router_tambien_bloquea_up_en_revision(self):
        from django.contrib.auth.models import Permission

        self.user_prod.user_permissions.add(Permission.objects.get(codename='add_solicitudes'))
        self.client.force_authenticate(user=self.user_prod)
        resp = self.client.post("/api/visitas/solicitudes/", {
            "UP": self._up_con_estado('En revision').id, "MotivoSolicitud": 1,
            "Observacion": "x", "Direccion": "y", "Estado": self.estado.id, "Usuario": self.user_prod.id,
        }, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_staff_no_se_restringe(self):
        self.client.force_authenticate(user=self.user_func)
        resp = self.client.post("/api/visitas/solicitudes/crear/", {
            "observacion": "x", "direccion": "y", "usuario_id": self.user_prod.id,
            "up_id": self._up_con_estado('En revision').id,
        }, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)


class VisitasListadoEstadosTests(_BaseVisita):
    def test_listado_incluye_realizadas_y_pendientes(self):
        from django.contrib.auth.models import Permission

        self.visita.estado = True
        self.visita.save(update_fields=['estado'])
        Visitas.objects.create(
            Solicitud=self.solicitud,
            Funcionario=self.funcionario,
            TipoVisita=self.tipo_visita,
            FechaYHoraVisita='2026-09-21T10:00:00Z',
            estado=False,
        )
        self.user_admin.user_permissions.add(
            Permission.objects.get(codename='view_visitas')
        )
        self.client.force_authenticate(self.user_admin)
        respuesta = self.client.get('/api/visitas/visitas/')
        self.assertEqual(respuesta.status_code, 200)
        datos = respuesta.data['results'] if isinstance(respuesta.data, dict) else respuesta.data
        estados = {visita['estado'] for visita in datos}
        self.assertEqual(estados, {True, False})


class VisitasFiltroFechaLocalTests(_BaseVisita):
    def test_filtro_dia_incluye_visita_nocturna(self):
        from datetime import datetime
        from django.contrib.auth.models import Permission

        self.visita.FechaYHoraVisita = timezone.make_aware(
            datetime(2026, 9, 20, 23, 30),
            timezone.get_current_timezone(),
        )
        self.visita.save(update_fields=['FechaYHoraVisita'])
        self.user_admin.user_permissions.add(
            Permission.objects.get(codename='view_visitas')
        )
        self.client.force_authenticate(self.user_admin)
        respuesta = self.client.get(
            '/api/visitas/visitas/?desde=2026-09-20&hasta=2026-09-20'
        )
        self.assertEqual(respuesta.status_code, 200)
        datos = respuesta.data['results'] if isinstance(respuesta.data, dict) else respuesta.data
        self.assertIn(self.visita.id, [visita['id'] for visita in datos])


class SolicitudesPendientesTests(_BaseVisita):
    def test_filtro_pendientes_excluye_asignadas_y_rechazadas(self):
        from django.contrib.auth.models import Permission

        Estados.objects.create(id=2, Estado='Aprobado')
        Estados.objects.create(id=3, Estado='Rechazado')
        reagendado = Estados.objects.create(id=4, Estado='Reagendado')
        aprobado = Estados.objects.get(id=2)
        rechazado = Estados.objects.get(id=3)
        for estado, texto in ((reagendado, 'Reagendada'), (aprobado, 'Asignada'), (rechazado, 'Rechazada')):
            Solicitudes.objects.create(
                MotivoSolicitud=self.motivo,
                Observacion=texto,
                Direccion='Km 1',
                Estado=estado,
                Usuario=self.user_prod,
            )
        self.user_admin.user_permissions.add(
            Permission.objects.get(codename='view_solicitudes')
        )
        self.client.force_authenticate(self.user_admin)
        respuesta = self.client.get('/api/visitas/solicitudes/?estado=pendientes')
        self.assertEqual(respuesta.status_code, 200)
        datos = respuesta.data['results'] if isinstance(respuesta.data, dict) else respuesta.data
        ids = {solicitud['id'] for solicitud in datos}
        estados = {solicitud['Estado'] for solicitud in datos}
        self.assertIn(self.solicitud.id, ids)
        self.assertTrue({1, 4}.issubset(estados))
        self.assertNotIn(2, estados)
        self.assertNotIn(3, estados)
        self.assertEqual(len(datos), 2)


class VisitasOrdenTests(_BaseVisita):
    """El listado de visitas sale de la más reciente a la más antigua, con o sin paginación."""

    def setUp(self):
        from django.contrib.auth.models import Permission

        super().setUp()
        # Se crean fuera de orden cronológico para que el orden no dependa del id.
        crear = lambda fecha: Visitas.objects.create(
            Solicitud=self.solicitud, Funcionario=self.funcionario,
            TipoVisita=self.tipo_visita, FechaYHoraVisita=fecha,
        )
        self.reciente = crear('2026-09-25T08:00:00Z')
        self.antigua = crear('2026-09-15T08:00:00Z')
        # Misma fecha y hora que `reciente`: desempata el id más alto primero.
        self.reciente_empate = crear('2026-09-25T08:00:00Z')
        # self.visita (de _BaseVisita) es del 2026-09-20.
        self.esperado = [
            self.reciente_empate.id, self.reciente.id, self.visita.id, self.antigua.id,
        ]

        self.user_admin.user_permissions.add(Permission.objects.get(codename='view_visitas'))
        self.client.force_authenticate(self.user_admin)

    def test_listado_completo_mas_reciente_primero(self):
        respuesta = self.client.get('/api/visitas/visitas/')
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual([v['id'] for v in filas(respuesta)], self.esperado)

    def test_paginas_conservan_el_orden(self):
        pagina1 = self.client.get('/api/visitas/visitas/?page=1&page_size=2')
        pagina2 = self.client.get('/api/visitas/visitas/?page=2&page_size=2')
        self.assertEqual(pagina1.status_code, 200)
        self.assertEqual(pagina2.status_code, 200)
        ids = [v['id'] for v in pagina1.data['results'] + pagina2.data['results']]
        self.assertEqual(ids, self.esperado)
