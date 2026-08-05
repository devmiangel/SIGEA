import re
from pathlib import Path

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from documentos.services.pdf_service import generar_visita_tecnica
from Usuarios.models import Administradores, Funcionarios, Productores, Usuario

from .models import (
    MotivosSolicitudes,
    Estados,
    Solicitudes,
    TiposVisitas,
    Visitas,
    InsumoVisita,
    Calificaciones,
    InfoVisita
)

from .serializers import (
    MotivosSolicitudesSerializer,
    EstadosSerializer,
    SolicitudesSerializer,
    TiposVisitasSerializer,
    VisitasSerializer,
    InsumoVisitaSerializer,
    CalificacionesSerializer,
    InfoVisitaSerializer,
    FormularioVisitaTecnicaSerializer
)

class MotivosSolicitudesViewSet(viewsets.ModelViewSet):
    queryset = MotivosSolicitudes.objects.all()
    serializer_class = MotivosSolicitudesSerializer

class EstadosViewSet(viewsets.ModelViewSet):
    queryset = Estados.objects.all()
    serializer_class = EstadosSerializer

class SolicitudesViewSet(viewsets.ModelViewSet):
    queryset = Solicitudes.objects.all()
    serializer_class = SolicitudesSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_solicitud(request):
    from UPs.models import UP

    data = request.data
    observacion = data.get('observacion')
    up_id = data.get('up_id')
    motivo_id = data.get('motivo_id')

    if not observacion:
        return Response({'error': 'La observación es requerida'}, status=400)

    up = None
    if up_id:
        up = get_object_or_404(UP, id=up_id)

    solicitud = Solicitudes.objects.create(
        UP=up,
        MotivoSolicitud_id=motivo_id or 2,
        Observacion=observacion,
        Estado_id=1,
        Usuario=request.user
    )

    Productores.objects.get_or_create(
        usuario=request.user,
        defaults={'Estado': True}
    )

    serializer = SolicitudesSerializer(solicitud)
    return Response(serializer.data, status=201)

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

        cedula = str(data.get('documento_identidad') or '').strip()
        fecha_visita = str(data.get('fecha_visita') or '').strip()
        if not cedula:
            return Response({'error': 'documento_identidad es requerido (o el usuario no tiene persona asociada)'}, status=400)
        if not fecha_visita:
            return Response({'error': 'fecha_visita es requerido'}, status=400)

        fecha_nombre = re.sub(r'[^0-9-]', '', fecha_visita.split('T')[0])
        if not fecha_nombre:
            return Response({'error': 'fecha_visita no tiene un formato valido'}, status=400)

        nombre = f"{cedula}_{fecha_nombre}.pdf"
        media_dir = Path(settings.BASE_DIR) / "media" / "formularios" / "visitas"
        ruta = media_dir / nombre

        try:
            generar_visita_tecnica(str(ruta), data)
        except Exception as e:
            return Response({'error': f'No se pudo generar el PDF: {e}'}, status=500)

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
        solicitud = Solicitudes.objects.create(
            UP_id=up_id if up_id else None,
            MotivoSolicitud_id=data.get('motivo_id', 2),
            Observacion=(data.get('descripcion_solicitud') or '')[:255],
            Estado_id=data.get('estado_id', 1),
            Usuario=usuario,
            motivoAdmin=data.get('motivo_admin', None),
        )

        Productores.objects.get_or_create(
            usuario=usuario,
            defaults={'Estado': True}
        )

        visita = Visitas.objects.create(
            Solicitud=solicitud,
            Funcionario=funcionario,
            Administrador=administrador,
            TipoVisita=tipo_visita,
            FechaYHoraVisita=fhv,
            RutaDocumento=f"formularios/visitas/{nombre}",
            estado=True,
        )

        calificacion = None
        if data.get('calificacion_id'):
            calificacion = Calificaciones.objects.filter(id=data['calificacion_id']).first()
        if calificacion is None and data.get('calificacion'):
            calificacion, _ = Calificaciones.objects.get_or_create(Calificacion=data['calificacion'])
        if calificacion is None:
            return Response({'error': 'calificacion o calificacion_id requerido'}, status=400)

        info_visita = InfoVisita.objects.create(
            Visita=visita,
            Calificacion=calificacion,
            ObservacionVisita=data.get('observaciones', '') or '',
            AccionSeguimiento=data.get('accion_tomada', '') or '',
            Firmado=bool(data.get('firmado', False)),
        )

        return Response({
            'ruta': f'/media/formularios/visitas/{nombre}',
            'archivo': nombre,
            'visita': visita.id,
            'info_visita': info_visita.id,
            'solicitud': solicitud.id,
        }, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def atender_solicitud(request, solicitud_id):
    solicitud = get_object_or_404(Solicitudes, id=solicitud_id)

    if solicitud.Estado_id != 1:
        return Response({'error': 'La solicitud no está en estado En Proceso'}, status=400)

    data = request.data
    fecha_visita = data.get('fecha_visita')
    ubicacion = data.get('ubicacion')
    funcionario_id = data.get('funcionario_id')
    tipo_visita_id = data.get('tipo_visita_id')

    errores = {}
    if not fecha_visita:
        errores['fecha_visita'] = 'La fecha y hora de la visita es requerida'
    if not ubicacion or not str(ubicacion).strip():
        errores['ubicacion'] = 'La ubicación es requerida'
    if not funcionario_id:
        errores['funcionario_id'] = 'El funcionario es requerido'
    if not tipo_visita_id:
        errores['tipo_visita_id'] = 'El tipo de visita es requerido'

    if errores:
        return Response({'error': 'Complete todos los campos', 'campos': errores}, status=400)

    administrador = get_object_or_404(Administradores, usuario=request.user)
    funcionario = get_object_or_404(Funcionarios, id=funcionario_id)
    tipo_visita = get_object_or_404(TiposVisitas, id=tipo_visita_id)

    visita = Visitas.objects.create(
        Solicitud=solicitud,
        Funcionario=funcionario,
        Administrador=administrador,
        TipoVisita=tipo_visita,
        FechaYHoraVisita=fecha_visita,
        Ubicacion=str(ubicacion).strip(),
        RutaDocumento='Pendiente de generación del documento'
    )

    solicitud.Estado_id = 2
    solicitud.save(update_fields=['Estado'])

    serializer = VisitasSerializer(visita)
    return Response(serializer.data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rechazar_solicitud(request, solicitud_id):
    solicitud = get_object_or_404(Solicitudes, id=solicitud_id)

    if solicitud.Estado_id != 1:
        return Response({'error': 'La solicitud no está en estado En Proceso'}, status=400)

    solicitud.Estado_id = 3
    solicitud.save(update_fields=['Estado'])

    serializer = SolicitudesSerializer(solicitud)
    return Response(serializer.data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_visitas(request):
    funcionario = getattr(request.user, 'funcionarios', None)
    if not funcionario:
        return Response({'error': 'El usuario autenticado no es un funcionario'}, status=403)
    visitas = (
        Visitas.objects
        .select_related(
            'Solicitud__MotivoSolicitud',
            'Solicitud__Usuario__persona',
            'Funcionario__usuario__persona',
            'Administrador__usuario__persona',
            'TipoVisita'
        )
        .filter(Funcionario=funcionario)
        .order_by('FechaYHoraVisita')
    )
    serializer = VisitasSerializer(visitas, many=True)
    return Response(serializer.data)


class TiposVisitasViewSet(viewsets.ModelViewSet):
    queryset = TiposVisitas.objects.all()
    serializer_class = TiposVisitasSerializer

class VisitasViewSet(viewsets.ModelViewSet):
    queryset = Visitas.objects.all()
    serializer_class = VisitasSerializer

    def update(self, request, *args, **kwargs):
        from UPs.models import EstadosUP

        visita = self.get_object()
        estado = request.data.get('estado')

        if estado is not None:
            if bool(estado) and not visita.estado:
                up = visita.Solicitud.UP if visita.Solicitud else None
                if up is not None:
                    estado_en_revision = EstadosUP.objects.filter(Estado='En revision').first()
                    if estado_en_revision:
                        up.idEstado = estado_en_revision
                        up.save(update_fields=['idEstado'])

        serializer = self.get_serializer(visita, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class InsumoVisitaViewSet(viewsets.ModelViewSet):
    queryset = InsumoVisita.objects.all()
    serializer_class = InsumoVisitaSerializer

class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer

class InfoVisitaViewSet(viewsets.ModelViewSet):
    queryset = InfoVisita.objects.all()
    serializer_class = InfoVisitaSerializer
