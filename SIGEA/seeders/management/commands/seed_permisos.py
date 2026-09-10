from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission


# ---------------------------------------------------------------------------
# Permisos del rol Funcionarios
# El funcionario ejecuta la caracterizacion, atiende visitas, consulta recursos
# y solicita insumos.
# ---------------------------------------------------------------------------
FUNCIONARIOS_PERMISSIONS = [
    # --- Módulo "Recursos" (InventaryContentEmployee) ---
    # Catalogo + consulta de inventario y asignaciones
    'view_insumos',
    'view_tiposherramientas',
    'view_herramientas',
    'view_marcasvehiculos',
    'view_lineasvehiculos',
    'view_tiposvehiculos',
    'view_tiposcombustibles',
    'view_vehiculos',
    'view_detallevehiculos',
    'view_conductores',
    'view_registroasignacionvehiculos',
    'view_asignacionherramientas',
    'view_inventariofuncionario',
    'view_cardexinsumofuncionario',
    'view_solicitudinsumo',
    # El funcionario puede solicitar insumos (crear_solicitud_insumo)
    'add_solicitudinsumo',
    'change_solicitudinsumo',

    # --- Módulo "Agenda" (AgendaContentEmployee) ---
    # Consulta de visitas programadas y sus solicitudes/informacion
    'view_visitas',
    'view_solicitudes',
    'view_infovisita',
    'view_calificaciones',
    'view_tiposvisitas',
    'view_estados',
    'view_motivossolicitudes',
    'view_serviciospagos',
    'view_aperos',
    'view_pajillas',

    # --- Módulo "Visitas" (VisitaForm / ReciboPagoForm) ---
    # Registro de visitas tecnicas, insumos consumidos, calificaciones y pagos
    'add_solicitudes',
    'change_solicitudes',
    'add_visitas',
    'change_visitas',
    'add_infovisita',
    'change_infovisita',
    'add_insumovisita',
    'change_insumovisita',
    'add_calificaciones',
    'change_calificaciones',
    'add_tiposvisitas',
    'change_tiposvisitas',
    'add_visitasserviciospagos',
    'change_visitasserviciospagos',
    'view_visitasserviciospagos',
    'add_serviciospagos',

    # --- Módulo "Caracterización" (CaracterForm / secciones) ---
    # El funcionario crea/edita predios, UPs y sus detalles sin poder eliminarlos
    'add_predios',
    'change_predios',
    'view_predios',
    'add_veredas',
    'change_veredas',
    'view_veredas',
    'add_sectores',
    'change_sectores',
    'view_sectores',
    'add_tipostenencias',
    'change_tipostenencias',
    'view_tipostenencias',
    'add_seguros',
    'change_seguros',
    'view_seguros',
    'add_tiposregistrosica',
    'change_tiposregistrosica',
    'view_tiposregistrosica',

    'add_up',
    'change_up',
    'view_up',
    'add_estadosup',
    'change_estadosup',
    'view_estadosup',
    'add_tipoup',
    'change_tipoup',
    'view_tipoup',
    'add_actividadup',
    'change_actividadup',
    'view_actividadup',
    'add_unidades',
    'change_unidades',
    'view_unidades',
    'add_archivosup',
    'change_archivosup',
    'view_archivosup',
    'add_detalleup',
    'change_detalleup',
    'view_detalleup',
    'add_productosups',
    'change_productosups',
    'view_productosups',
    'add_produccionupagricola',
    'change_produccionupagricola',
    'view_produccionupagricola',
    'add_produccionupagroindustrial',
    'change_produccionupagroindustrial',
    'view_produccionupagroindustrial',
    'add_grupoanimal',
    'change_grupoanimal',
    'view_grupoanimal',
    'add_tiposaves',
    'change_tiposaves',
    'view_tiposaves',
    'add_propositos',
    'change_propositos',
    'view_propositos',
    'add_razas',
    'change_razas',
    'view_razas',
    'add_animales',
    'change_animales',
    'view_animales',
    'add_animalesups',
    'change_animalesups',
    'view_animalesups',
    'add_productosapicolas',
    'change_productosapicolas',
    'view_productosapicolas',
    'add_detallebovinos',
    'change_detallebovinos',
    'view_detallebovinos',
    'add_detalleaves',
    'change_detalleaves',
    'view_detalleaves',
    'add_detalleporcinos',
    'change_detalleporcinos',
    'view_detalleporcinos',
    'add_detalleequinos',
    'change_detalleequinos',
    'view_detalleequinos',
    'add_detallecaprinos',
    'change_detallecaprinos',
    'view_detallecaprinos',
    'add_detalleovinos',
    'change_detalleovinos',
    'view_detalleovinos',
    'add_detalleconejos',
    'change_detalleconejos',
    'view_detalleconejos',
    'add_detallecuries',
    'change_detallecuries',
    'view_detallecuries',
    'add_detallepeces',
    'change_detallepeces',
    'view_detallepeces',
    'add_detalleapicolas',
    'change_detalleapicolas',
    'view_detalleapicolas',

    # --- Usuarios / catálogos usados en caracterización ---
    # El funcionario consulta la info del productor y los catálogos que llena
    'add_productores',
    'change_productores',
    'view_productores',
    'view_usuario',
    'view_personas',
    'view_contactos',
    'view_tiposdocumentos',
    'view_tiposcontactos',
    'view_tiposniveleseducativos',
    'view_sisben',
    'view_empresas',
]


# ---------------------------------------------------------------------------
# Permisos del rol Productores
# Consulta sus UPs/predios y solicitudes; crea solicitudes de visita.
# ---------------------------------------------------------------------------
PRODUCTORES_PERMISSIONS = [
    # Consulta de sus UPs y predios (mis-ups / UPDetailView)
    'view_up',
    'view_predios',
    'view_detalleup',
    'view_productosups',
    'view_produccionupagricola',
    'view_produccionupagroindustrial',
    'view_animalesups',
    'view_detallebovinos',
    'view_detalleaves',
    'view_detalleporcinos',
    'view_detalleequinos',
    'view_detallecaprinos',
    'view_detalleovinos',
    'view_detalleconejos',
    'view_detallecuries',
    'view_detallepeces',
    'view_detalleapicolas',
    'view_archivosup',
    'view_tipoup',
    'view_estadosup',

    # Catálogos y predios que se muestran en el detalle de la UP
    'view_actividadup',
    'view_unidades',
    'view_grupoanimal',
    'view_tiposaves',
    'view_propositos',
    'view_razas',
    'view_animales',
    'view_productosapicolas',
    'view_tipostenencias',
    'view_seguros',
    'view_veredas',
    'view_sectores',
    'view_tiposregistrosica',
    'view_tiposdocumentos',
    'view_tiposcontactos',
    'view_tiposniveleseducativos',
    'view_sisben',

    # Solicitudes de visita (crear_solicitud)
    'view_solicitudes',
    'add_solicitudes',
    'view_motivossolicitudes',
    'view_estados',
    'view_tiposvisitas',
    'view_serviciospagos',
    'view_aperos',
    'view_pajillas',

    # Información del productor y su usuario
    'view_productores',
    'view_usuario',
    'view_personas',
    'view_contactos',

    # Inventario consultado dentro del flujo de solicitud de visita
    'view_insumos',
    'view_herramientas',
    'view_detallevehiculos',
]


# ---------------------------------------------------------------------------
# Permisos del rol Usuarios (registro por defecto)
# Solo consulta su información y crea la primera solicitud para ser productor.
# ---------------------------------------------------------------------------
USUARIOS_PERMISSIONS = [
    'view_usuario',
    'view_personas',
    'view_productores',
    'view_solicitudes',
    'add_solicitudes',
    'view_motivossolicitudes',
    'view_estados',
    'view_tiposvisitas',
    'view_serviciospagos',
    'view_aperos',
    'view_pajillas',
    'view_up',
    'view_predios',
    'view_insumos',
    'view_herramientas',
    'view_detallevehiculos',
]


class Command(BaseCommand):
    help = 'Seeder de permisos por rol para las views/serializers del backend'

    def handle(self, *args, **kwargs):
        self.stdout.write('Iniciando seeder de permisos...')

        # Administradores -> todos los permisos
        self._set_permissions('Administradores', None)

        # Configuracion de permisos por rol
        grupos = {
            'Funcionarios': FUNCIONARIOS_PERMISSIONS,
            'Productores': PRODUCTORES_PERMISSIONS,
            'Usuarios': USUARIOS_PERMISSIONS,
        }

        for nombre_grupo, permisos in grupos.items():
            self._set_permissions(nombre_grupo, permisos)

        self.stdout.write(self.style.SUCCESS('Seeder de permisos ejecutado correctamente'))

    def _set_permissions(self, nombre_grupo, permisos):
        grupo, _ = Group.objects.get_or_create(name=nombre_grupo)

        if permisos is None:
            grupo.permissions.set(Permission.objects.all())
            self.stdout.write(f'  - {nombre_grupo}: todos los permisos asignados.')
            return

        permisos_obj = Permission.objects.filter(codename__in=permisos)
        concedidos = {p.codename for p in permisos_obj}
        faltantes = set(permisos) - concedidos

        grupo.permissions.set(permisos_obj)

        if faltantes:
            self.stdout.write(
                self.style.WARNING(
                    f'  - {nombre_grupo}: {len(concedidos)} permisos. '
                    f'Advertencia, {len(faltantes)} no existen: {sorted(faltantes)}'
                )
            )
        else:
            self.stdout.write(f'  - {nombre_grupo}: {len(concedidos)} permisos asignados.')
