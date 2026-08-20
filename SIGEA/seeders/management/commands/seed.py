from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from Usuarios.models import TiposDocumentos, TiposContactos, TiposNivelesEducativos, Sisben
from Usuarios.models import Usuario, Personas, Contactos, Administradores, Funcionarios, Productores
from Visitas.models import MotivosSolicitudes, Estados, TiposVisitas
from UPs.models import TipoUP, ActividadUP, Unidades, GrupoAnimal, TiposAves, Propositos, ProductosApicolas
from Predios.models import TiposTenencias, Veredas, Sectores
from datetime import date
#ingerto de seeder
class Command(BaseCommand):
    help = 'Seeder inicial para poblar las tablas maestras'

    def handle(self, *args, **kwargs):
        self.stdout.write('Iniciando seeder...')

        # --- Grupos y Permisos ---
        self.seed_grupos()

        # --- Usuarios ---
        self.seed_maestro(TiposDocumentos, 'TipoDocumento', [
            'Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte', 'Tarjeta de Identidad', 'NIT'
        ])

        TiposContactos.objects.get_or_create(id=1, defaults={'TipoContacto': 'Celular'})
        TiposContactos.objects.get_or_create(id=2, defaults={'TipoContacto': 'Correo'})

        # --- Visitas ---
        MotivosSolicitudes.objects.get_or_create(id=1, defaults={'MotivoSolicitud': 'Visita'})
        MotivosSolicitudes.objects.get_or_create(id=2, defaults={'MotivoSolicitud': 'Caracterización'})

        Estados.objects.get_or_create(id=1, defaults={'Estado': 'En Proceso'})
        Estados.objects.get_or_create(id=2, defaults={'Estado': 'Aprobado'})
        Estados.objects.get_or_create(id=3, defaults={'Estado': 'Rechazado'})
        Estados.objects.get_or_create(id=4, defaults={'Estado': 'Reagendado'})

        self.seed_maestro(TiposVisitas, 'TipoVisita', [
            'Caracterización', 'Pecuaria', 'Agrícola', 'Agropecuaria', 'Servicios Pagos'
        ])

        self.seed_maestro(TiposNivelesEducativos, 'TipoNivelEducativo', [
            'Ninguno', 'Primaria', 'Secundaria', 'Técnico', 'Tecnológico', 'Universitario', 'Postgrado'
        ])

        self.seed_maestro(Sisben, 'NivelSisben', [
            'A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'C1', 'C2', 'D1'
        ])

        # --- Usuarios por rol ---
        self.seed_usuarios()

        # --- UPs ---
        self.seed_maestro(TipoUP, 'TipoUP', [
            'Agrícola', 'Pecuaria', 'Agroindustrial', 'Agropecuaria'
        ])

        self.seed_maestro(ActividadUP, 'Actividad', [
            'Cultivo de hortalizas', 'Cría de ganado bovino', 'Producción de lácteos', 
            'Piscicultura', 'Apicultura', 'Cultivo de frutales'
        ])

        self.seed_maestro(Unidades, 'Unidad', [
            'Hectáreas', 'Metros Cuadrados', 'Cabezas', 'Kilogramos', 'Litros', 'Unidades'
        ])

        self.seed_maestro(GrupoAnimal, 'GrupoAnimal', [
            'Bovinos', 'Porcinos', 'Equinos', 'Caprinos', 'Ovinos', 'Aves', 'Peces', 'Abejas'
        ])

        self.seed_maestro(TiposAves, 'TipoAve', [
            'Pollo de engorde', 'Gallina ponedora', 'Codorniz', 'Pavo', 'Pato'
        ])

        self.seed_maestro(Propositos, 'Proposito', [
            'Carne', 'Leche', 'Doble Propósito', 'Cría', 'Levante', 'Ceba', 'Trabajo', 'Recreación'
        ])

        self.seed_maestro(ProductosApicolas, 'ProductoApicolas', [
            'Miel', 'Polen', 'Cera', 'Propóleo', 'Jalea Real', 'Veneno de abeja'
        ])

        # --- Predios ---
        self.seed_maestro(TiposTenencias, 'TipoTenencia', [
            'Propia', 'Arrendada', 'Aparcería', 'Comodato', 'Ocupación de hecho', 'Posesión sin título'
        ])

        # Veredas y Sectores
        vereda_default, _ = Veredas.objects.get_or_create(NombreVereda='Vereda Central')
        Sectores.objects.get_or_create(NombreSector='Sector Norte', Vereda=vereda_default)
        Sectores.objects.get_or_create(NombreSector='Sector Sur', Vereda=vereda_default)

        self.stdout.write(self.style.SUCCESS('Seed ejecutado correctamente'))

    def seed_usuarios(self):
        usuarios = [
            {
                'rol': 'Administradores',
                'clase': Administradores,
                'email': 'admin@example.com',
                'persona': {
                    'primer_nombre': 'Ana',
                    'segundo_nombre': 'María',
                    'primer_apellido': 'Gómez',
                    'segundo_apellido': 'López',
                    'numero_documento': '1000000001',
                    'fecha_nacimiento': date(1985, 3, 12),
                },
            },
            {
                'rol': 'Administradores',
                'clase': Administradores,
                'email': 'admin@admin.com',
                'password': 'administrador',
                'persona': {
                    'primer_nombre': 'admin',
                    'segundo_nombre': '',
                    'primer_apellido': 'uno',
                    'segundo_apellido': '',
                    'numero_documento': '1000000004',
                    'fecha_nacimiento': date(1990, 1, 1),
                },
            },
            {
                'rol': 'Funcionarios',
                'clase': Funcionarios,
                'email': 'funcionario@example.com',
                'persona': {
                    'primer_nombre': 'Luis',
                    'segundo_nombre': 'Alberto',
                    'primer_apellido': 'Martínez',
                    'segundo_apellido': 'Ríos',
                    'numero_documento': '1000000002',
                    'fecha_nacimiento': date(1990, 7, 25),
                },
            },
            {
                'rol': 'Productores',
                'clase': Productores,
                'email': 'productor@example.com',
                'persona': {
                    'primer_nombre': 'Carlos',
                    'segundo_nombre': 'Andrés',
                    'primer_apellido': 'Rodríguez',
                    'segundo_apellido': 'Gómez',
                    'numero_documento': '1000000003',
                    'fecha_nacimiento': date(1988, 11, 3),
                },
            },
        ]

        tipo_documento, _ = TiposDocumentos.objects.get_or_create(
            TipoDocumento='Cédula de Ciudadanía'
        )

        for u in usuarios:
            persona, persona_created = Personas.objects.get_or_create(
                numero_documento=u['persona']['numero_documento'],
                defaults={
                    'primer_nombre': u['persona']['primer_nombre'],
                    'segundo_nombre': u['persona']['segundo_nombre'],
                    'primer_apellido': u['persona']['primer_apellido'],
                    'segundo_apellido': u['persona']['segundo_apellido'],
                    'fecha_nacimiento': u['persona']['fecha_nacimiento'],
                    'TipoDocumento': tipo_documento,
                },
            )

            if persona_created:
                celular, _ = Contactos.objects.get_or_create(
                    contacto='3110000000', TipoContacto_id=1
                )
                correo, _ = Contactos.objects.get_or_create(
                    contacto=u['email'], TipoContacto_id=2
                )
                persona.contactos.add(celular, correo)

            usuario, created = Usuario.objects.get_or_create(
                email=u['email'],
                defaults={'persona': persona, 'is_active': True},
            )
            if created:
                usuario.set_password(u.get('password', 'admin123'))
                usuario.save()

            rol, _ = u['clase'].objects.get_or_create(usuario=usuario)

            self.stdout.write(
                self.style.SUCCESS(
                    f"  - {u['rol']}: {u['email']} (password: {u.get('password', 'admin123')}, id persona: {persona.id})"
                )
            )

    def seed_grupos(self):
        grupos_config = {
            'Administradores': None,  # None significa todos los permisos
            'Funcionarios': [
                'add_predios', 'change_predios', 'view_predios',
                'add_inventario', 'change_inventario', 'view_inventario',
                'add_visitas', 'change_visitas', 'view_visitas',
                'add_ups', 'change_ups', 'view_ups',
                'view_usuario',
            ],
            'Productores': [
                'view_predios',
                'view_inventario',
                'view_ups',
            ],
            'Usuarios': [
                'view_predios',
                'view_ups',
            ]
        }

        for nombre_grupo, permisos in grupos_config.items():
            grupo, _ = Group.objects.get_or_create(name=nombre_grupo)
            
            if permisos is None:
                grupo.permissions.set(Permission.objects.all())
            else:
                grupo.permissions.set(Permission.objects.filter(codename__in=permisos))

    def seed_maestro(self, modelo, campo, lista):
        count = 0
        for item in lista:
            _, created = modelo.objects.get_or_create(**{campo: item})
            if created:
                count += 1
        if count > 0:
            self.stdout.write(f'  - {modelo.__name__}: {count} registros creados.')
        else:
            self.stdout.write(f'  - {modelo.__name__}: Ya estaba poblado.')
