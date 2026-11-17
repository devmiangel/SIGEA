from datetime import datetime, time
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from SIGEAsite.permissions import IsStaff, usuario_en_grupo
from rest_framework.exceptions import ValidationError

from Inventario.models import InventarioFuncionario

from ..models import (
    Visitas,
    InsumoVisita,
    Calificaciones,
    InfoVisita,
    Aperos,
    Pajillas,
    VisitasServiciosPagos,
)

from UPs.models import UP
from Usuarios.models import Usuario
from ..serializers import FormularioVisitaTecnicaSerializer, FormularioReciboPagoSerializer
from ..serializers.formulario import CALIFICACIONES_VISITA, normalizar_texto

def _hora_datetime(fecha, hora):
    """Combina la fecha de la visita con una hora 'HH:MM' (o devuelve la fecha)."""
    if not hora:
        return fecha
    try:
        horas, minutos = str(hora).strip().split(':')[:2]
        combinado = datetime.combine(fecha.date(), time(int(horas), int(minutos)))
        if timezone.is_naive(combinado):
            return timezone.make_aware(combinado)
        return combinado
    except (ValueError, TypeError):
        return fecha

def _visita_del_usuario(user, visita_id):
    """Visita que el usuario puede diligenciar (bloqueada para la transaccion).

    Administradores: cualquier visita. Funcionarios: solo las asignadas a ellos.
    Cualquier otra visita responde como inexistente (404).
    """
    visitas = Visitas.objects.select_for_update().select_related('Solicitud', 'Funcionario')
    if not usuario_en_grupo(user, 'Administradores'):
        visitas = visitas.filter(Funcionario__usuario=user)
    return visitas.filter(id=visita_id).first()


class FormularioVisitaTecnicaView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]
    serializer_class = FormularioVisitaTecnicaSerializer

    def get(self, request):
        media_dir = Path(settings.BASE_DIR) / "media" / "formularios" / "visitas"
        archivos = []
        if media_dir.exists():
            for f in sorted(media_dir.glob("*.pdf")):
                archivos.append({
                    'archivo': f.name,
                    'ruta': f"/media/formularios/visitas/{f.name}",
                })
        return Response({'formularios': archivos})

    def get_serializer(self, *args, **kwargs):
        serializer = self.serializer_class(*args, **kwargs)
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id and not kwargs.get('data'):
            usuario = Usuario.objects.filter(id=usuario_id).first()
            if usuario:
                inicial = {}
                self._auto_llenar_usuario(usuario, inicial)
                for nombre, valor in inicial.items():
                    if nombre in serializer.fields:
                        serializer.fields[nombre].initial = valor
        return serializer

    def _auto_llenar_usuario(self, usuario, data):
        persona = getattr(usuario, 'persona', None)
        if persona is None:
            return

        if not data.get('nombres_apellidos'):
            nombres = ' '.join(filter(None, [
                persona.primer_nombre,
                persona.segundo_nombre,
                persona.primer_apellido,
                persona.segundo_apellido,
            ]))
            if nombres:
                data['nombres_apellidos'] = nombres

        if not data.get('documento_identidad') and persona.numero_documento:
            data['documento_identidad'] = persona.numero_documento

        if not data.get('telefono'):
            contacto = persona.contactos.filter(TipoContacto_id=1).first() or persona.contactos.first()
            if contacto:
                data['telefono'] = contacto.contacto

        if not data.get('sisben'):
            nivel = persona.NivelSisben.first()
            if nivel:
                data['sisben'] = nivel.NivelSisben

    @transaction.atomic
    def post(self, request):
        serializer = FormularioVisitaTecnicaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # El formulario siempre diligencia una visita ya agendada: la solicitud
        # y su productor salen de la visita, nunca del usuario autenticado.
        visita_id = data.get('visita_id')
        if not visita_id:
            return Response({'error': 'visita_id es requerido'}, status=400)
        visita = _visita_del_usuario(request.user, visita_id)
        if visita is None:
            return Response({'error': 'No se encontró la visita'}, status=404)

        if visita.estado and InfoVisita.objects.filter(Visita=visita).exists():
            return Response({'error': 'La visita ya fue registrada'}, status=409)

        fecha_visita = str(data.get('fecha_visita') or '').strip()
        fhv = parse_datetime(fecha_visita)
        if fhv is None:
            return Response(
                {'error': 'fecha_visita debe ser una fecha/hora valida (ISO, p. ej. 2026-09-20T10:00)'},
                status=400,
            )
        if timezone.is_naive(fhv):
            fhv = timezone.make_aware(fhv)

        calificacion = None
        if data.get('calificacion_id'):
            calificacion = Calificaciones.objects.filter(id=data['calificacion_id']).first()
        if calificacion is None and data.get('calificacion'):
            etiqueta = CALIFICACIONES_VISITA[normalizar_texto(data['calificacion'])]
            calificacion = (
                Calificaciones.objects.filter(Calificacion__iexact=etiqueta).first()
                or Calificaciones.objects.create(Calificacion=etiqueta)
            )
        if calificacion is None:
            return Response({'error': 'calificacion o calificacion_id requerido'}, status=400)

        solicitud = visita.Solicitud
        cambios = []
        up_id = data.get('up_id')
        if up_id and up_id != solicitud.UP_id:
            # La UP debe ser del productor de la solicitud.
            if not UP.objects.filter(id=up_id, Productor__usuario_id=solicitud.Usuario_id).exists():
                return Response({'up_id': 'La UP no pertenece al productor de la solicitud.'}, status=400)
            solicitud.UP_id = up_id
            cambios.append('UP')
        descripcion = (data.get('descripcion_solicitud') or '').strip()
        if descripcion and descripcion != solicitud.Observacion:
            solicitud.Observacion = descripcion  # TextField: sin recortar
            cambios.append('Observacion')
        # motivoAdmin pertenece al administrador: el formulario no lo modifica.
        if cambios:
            solicitud.save(update_fields=cambios)

        visita.FechaYHoraVisita = fhv
        visita.Ubicacion = data.get('vereda_sector') or visita.Ubicacion
        visita.estado = True
        visita.FirmaProductor = data.get('firma_usuario') or ''
        visita.FirmaFuncionario = data.get('firma_funcionario') or ''
        visita.save()

        firmado = bool(
            data.get('firmado', False)
            or data.get('firma_usuario')
            or data.get('firma_funcionario')
        )

        acciones = sorted(data.get('acciones') or [])
        insumos = data.get('insumos') or []
        valores = {
            'Calificacion': calificacion,
            'ObservacionVisita': data.get('observaciones', '') or '',
            'AccionSeguimiento': data.get('accion_tomada', '') or '',
            'Firmado': firmado,
            'DiagnosticoPresuntivo': data.get('diagnostico_presuntivo', '') or '',
            'Acciones': ', '.join(acciones),
            'HoraInicio': _hora_datetime(fhv, data.get('hora_inicio')),
            'HoraSalida': _hora_datetime(fhv, data.get('hora_salida')),
        }
        info_visita = InfoVisita.objects.filter(Visita=visita).order_by('id').first()
        if info_visita is None:
            info_visita = InfoVisita.objects.create(Visita=visita, **valores)
        else:
            for campo, valor in valores.items():
                setattr(info_visita, campo, valor)
            info_visita.save()

        # ---------- Consumo de insumos del inventario del funcionario ----------
        # Solo aplica cuando la accion "Insumos" fue marcada en el formulario.
        # Se descuenta del funcionario ASIGNADO a la visita.
        if 'insumos' in acciones and insumos:
            self._registrar_consumo_insumos(visita, visita.Funcionario, insumos)

        return Response({
            'visita': visita.id,
            'info_visita': info_visita.id,
            'solicitud': solicitud.id,
        }, status=201)

    def _registrar_consumo_insumos(self, visita, funcionario, insumos):
        """Registra los insumos consumidos en la visita y descuenta el
        inventario del funcionario. Es idempotente: si la visita ya tiene
        insumos asociados, no vuelve a descontar."""
        if InsumoVisita.objects.filter(Visita=visita).exists():
            return

        inventario_ids = [item['inventario_funcionario_id'] for item in insumos]
        inventarios = InventarioFuncionario.objects.select_for_update().filter(id__in=inventario_ids)
        inventario_map = {inv.id: inv for inv in inventarios}

        errores = []
        registros = []
        for item in insumos:
            inv = inventario_map.get(item['inventario_funcionario_id'])
            if inv is None or inv.Funcionario_id != funcionario.id:
                errores.append(
                    f"El inventario {item['inventario_funcionario_id']} no pertenece al funcionario asignado."
                )
                continue
            if item['cantidad'] > inv.Cantidad:
                errores.append(
                    f"El insumo \"{inv.Insumo.Nombre}\" no tiene stock suficiente "
                    f"(disponible: {inv.Cantidad})."
                )
                continue
            registros.append((inv, item['cantidad']))

        if errores:
            raise ValidationError({'insumos': errores})

        for inv, cantidad in registros:
            InsumoVisita.objects.create(
                Visita=visita,
                InventarioFuncionario=inv,
                Cantidad=cantidad,
            )
            inv.Cantidad -= cantidad
            inv.save(update_fields=['Cantidad'])


class FormularioReciboPagoView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]
    serializer_class = FormularioReciboPagoSerializer

    @transaction.atomic
    def post(self, request):
        serializer = FormularioReciboPagoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        visita_id = data.get('visita_id')
        if not visita_id:
            return Response({'error': 'visita_id es requerido'}, status=400)

        visita = _visita_del_usuario(request.user, visita_id)
        if visita is None:
            return Response({'error': 'No se encontró la visita'}, status=404)

        servicio = data['servicio']
        es_maquinaria = data['es_maquinaria']

        # Un recibo por visita y servicio: evita cobros duplicados por doble envio.
        if VisitasServiciosPagos.objects.filter(Visita=visita, ServicioPago=servicio).exists():
            return Response({'error': 'Ya existe un recibo de este servicio para la visita'}, status=409)

        apero = None
        pajilla = None
        numero_horas = None
        numero_pajillas = None
        toro = None

        # El valor total siempre lo calcula el servidor con la tarifa del catalogo.
        if es_maquinaria:
            apero = Aperos.objects.filter(id=data.get('apero_id')).first()
            if apero is None:
                return Response({'error': 'Apero o implemento no válido'}, status=400)
            numero_horas = data.get('numero_horas')
            valor_total = numero_horas * apero.ValorHora
        else:
            pajilla = Pajillas.objects.filter(id=data.get('pajilla_id')).first()
            if pajilla is None:
                return Response({'error': 'Pajilla no válida'}, status=400)
            numero_pajillas = data.get('numero_pajillas')
            toro = data.get('toro')
            valor_total = numero_pajillas * pajilla.ValorPajilla

        registro = VisitasServiciosPagos.objects.create(
            Visita=visita,
            ServicioPago=servicio,
            Apero=apero,
            NumeroHoras=numero_horas,
            NumeroPajillas=numero_pajillas,
            Pajilla=pajilla,
            Toro=toro,
            ValorTotal=valor_total,
        )

        visita.FirmaProductor = data.get('firma_usuario') or ''
        visita.FirmaFuncionario = data.get('firma_funcionario') or ''
        visita.estado = True
        visita.save()

        return Response({
            'registro': registro.id,
            'visita': visita.id,
        }, status=201)
