"""Los listados de UPs no deben hacer consultas extra por cada UP (N+1).

UPSerializer lee estado, tipo, predio, productor y validador (con sus personas).
Si la vista no precarga esas relaciones con UP_RELACIONADAS, el número de
consultas crece con cada UP listada.
"""
from django.db import connection
from django.test import override_settings
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APITestCase

from UPs.models import EstadosUP
from Usuarios.models import Administradores, Usuario

from .test_validacion_admin import _crear_up_completa


@override_settings(SECURE_SSL_REDIRECT=False)
class ConsultasListadoUPsTests(APITestCase):
    def setUp(self):
        self.staff = Usuario.objects.create_superuser(
            email='consultas.ups@example.com', password='ClaveSegura123*'
        )
        self.client.force_authenticate(self.staff)
        self.aceptada = EstadosUP.objects.get_or_create(Estado='Aceptada')[0]

    def _crear_ups(self, desde, cantidad):
        """Crea UPs validadas (con ValidadoPor) para recorrer todas las relaciones."""
        for numero in range(desde, desde + cantidad):
            ctx = _crear_up_completa(sufijo=f'q{numero}')
            up = ctx['up']
            up.idEstado = self.aceptada
            up.ValidadoPor = Administradores.objects.get(usuario=ctx['admin'])
            up.save()

    def _contar_consultas(self, url):
        with CaptureQueriesContext(connection) as consultas:
            respuesta = self.client.get(url)
        self.assertEqual(respuesta.status_code, 200, respuesta.content[:300])
        return len(consultas)

    def test_listado_ups_no_crece_con_cada_up(self):
        url = '/api/UPs/UPs/?page=1&page_size=50'
        self._crear_ups(1, 1)
        con_una = self._contar_consultas(url)
        self._crear_ups(2, 4)
        con_cinco = self._contar_consultas(url)
        self.assertEqual(con_una, con_cinco)

    def test_detalle_productor_no_crece_con_cada_up(self):
        ctx = _crear_up_completa(sufijo='q20')
        productor = ctx['up'].Productor
        url = f'/api/usuarios/productores/{productor.id}/detalle/'
        con_una = self._contar_consultas(url)

        from UPs.models import UP
        base = ctx['up']
        for _ in range(3):
            UP.objects.create(
                Productor=productor,
                Predio=base.Predio,
                TipoUP=base.TipoUP,
                Funcionario=base.Funcionario,
                FechaCaracterizacion=base.FechaCaracterizacion,
                FechaActualizacion=base.FechaActualizacion,
                idEstado=self.aceptada,
                ValidadoPor=Administradores.objects.get(usuario=ctx['admin']),
            )
        con_cuatro = self._contar_consultas(url)
        self.assertEqual(con_una, con_cuatro)
