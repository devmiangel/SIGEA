from pathlib import Path

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from Usuarios.models import Administradores, Funcionarios, Productores, Usuario

from ..models import (
    Solicitudes,
    TiposVisitas,
    Visitas,
    Calificaciones,
    InfoVisita,
)
from ..serializers import FormularioVisitaTecnicaSerializer

class FormularioVisitaTecnicaView(APIView):
    permission_classes = [AllowAny]
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

    def post(self, request):
        serializer = FormularioVisitaTecnicaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        usuario = request.user if request.user.is_authenticated else None
        if usuario is None and data.get('usuario_id'):
            usuario = Usuario.objects.filter(id=data['usuario_id']).first()
        if usuario is None:
            usuario = Usuario.objects.filter(email='productor.visitas@example.com').first()
        if usuario is None:
            return Response({'error': 'Se requiere usuario autenticado o usuario_id'}, status=400)

        self._auto_llenar_usuario(usuario, data)

        fecha_visita = str(data.get('fecha_visita') or '').strip()
        if not fecha_visita:
            return Response({'error': 'fecha_visita es requerido'}, status=400)

        # ---------- Registros en BD ----------
        funcionario = None
        if data.get('funcionario_id'):
            funcionario = Funcionarios.objects.filter(id=data['funcionario_id']).first()
        if funcionario is None and request.user.is_authenticated:
            funcionario = Funcionarios.objects.filter(usuario=request.user).first()
        if funcionario is None:
            funcionario = Funcionarios.objects.first()
        if funcionario is None:
            return Response({'error': 'No se pudo determinar el funcionario'}, status=400)

        administrador = None
        if data.get('administrador_id'):
            administrador = Administradores.objects.filter(id=data['administrador_id']).first()
        if administrador is None and request.user.is_authenticated:
            administrador = Administradores.objects.filter(usuario=request.user).first()
        if administrador is None:
            administrador = Administradores.objects.first()
        if administrador is None:
            return Response({'error': 'No se pudo determinar el administrador'}, status=400)

        tipo_visita = None
        if data.get('tipo_visita_id'):
            tipo_visita = TiposVisitas.objects.filter(id=data['tipo_visita_id']).first()
        if tipo_visita is None and data.get('tipo_visita'):
            tipo_visita, _ = TiposVisitas.objects.get_or_create(TipoVisita=data['tipo_visita'])
        if tipo_visita is None:
            return Response({'error': 'tipo_visita o tipo_visita_id requerido'}, status=400)

        fhv = parse_datetime(fecha_visita)
        if fhv is None:
            return Response({'error': 'fecha_visita debe ser una fecha/hora valida (YYYY-MM-DD o ISO)'}, status=400)
        if timezone.is_naive(fhv):
            fhv = timezone.make_aware(fhv)

        up_id = data.get('up_id')
        visita_id = data.get('visita_id')

        Productores.objects.get_or_create(
            usuario=usuario,
            defaults={'Estado': True}
        )

        # Si el frontend envia visita_id, se reutiliza la solicitud/visita ya
        # creadas al atender la solicitud, en lugar de generar registros nuevos.
        solicitud = None
        visita = None
        if visita_id:
            visita = Visitas.objects.filter(id=visita_id).first()
            if visita is not None:
                solicitud = visita.Solicitud
                if solicitud is not None:
                    if up_id:
                        solicitud.UP_id = up_id
                    solicitud.Observacion = (data.get('descripcion_solicitud') or '')[:255]
                    solicitud.motivoAdmin = data.get('motivo_admin', None)
                    solicitud.save()
                visita.FechaYHoraVisita = fhv
                visita.estado = True
                visita.FirmaProductor = data.get('firma_usuario') or ''
                visita.FirmaFuncionario = data.get('firma_funcionario') or ''
                visita.save()

        if solicitud is None:
            solicitud = Solicitudes.objects.create(
                UP_id=up_id if up_id else None,
                MotivoSolicitud_id=data.get('motivo_id', 2),
                Observacion=data.get('descripcion_solicitud') or '',
                Estado_id=data.get('estado_id', 1),
                Usuario=usuario,
                motivoAdmin=data.get('motivo_admin', None),
            )

        if visita is None:
            visita = Visitas.objects.create(
                Solicitud=solicitud,
                Funcionario=funcionario,
                Administrador=administrador,
                TipoVisita=tipo_visita,
                FechaYHoraVisita=fhv,
            Ubicacion=data.get('vereda_sector') or None,
                estado=True,
                FirmaProductor=data.get('firma_usuario') or '',
                FirmaFuncionario=data.get('firma_funcionario') or '',
            )

        calificacion = None
        if data.get('calificacion_id'):
            calificacion = Calificaciones.objects.filter(id=data['calificacion_id']).first()
        if calificacion is None and data.get('calificacion'):
            calificacion, _ = Calificaciones.objects.get_or_create(Calificacion=data['calificacion'])
        if calificacion is None:
            return Response({'error': 'calificacion o calificacion_id requerido'}, status=400)

        firmado = bool(
            data.get('firmado', False)
            or data.get('firma_usuario')
            or data.get('firma_funcionario')
        )

        info_visita, _ = InfoVisita.objects.get_or_create(
            Visita=visita,
            defaults={
                'Calificacion': calificacion,
                'ObservacionVisita': data.get('observaciones', '') or '',
                'AccionSeguimiento': data.get('accion_tomada', '') or '',
                'Firmado': firmado,
            },
        )
        info_visita.Calificacion = calificacion
        info_visita.ObservacionVisita = data.get('observaciones', '') or ''
        info_visita.AccionSeguimiento = data.get('accion_tomada', '') or ''
        info_visita.Firmado = firmado
        info_visita.save()

        return Response({
            'visita': visita.id,
            'info_visita': info_visita.id,
            'solicitud': solicitud.id,
        }, status=201)
