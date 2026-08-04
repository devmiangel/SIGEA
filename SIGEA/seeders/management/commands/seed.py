from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from Usuarios.models import TiposDocumentos, TiposContactos, TiposNivelesEducativos, Sisben
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

        self.seed_maestro(TiposVisitas, 'TipoVisita', [
            'Caracterización', 'Pecuaria', 'Agrícola', 'Agropecuaria'
        ])

        self.seed_maestro(TiposNivelesEducativos, 'TipoNivelEducativo', [
            'Ninguno', 'Primaria', 'Secundaria', 'Técnico', 'Tecnológico', 'Universitario', 'Postgrado'
        ])

        self.seed_maestro(Sisben, 'NivelSisben', [
            'A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'C1', 'C2', 'D1'
        ])

        # --- UPs ---
        self.seed_maestro(TipoUP, 'TipoUP', [
            'Agrícola', 'Pecuaria', 'Agroindustrial', 'Forestal', 'Turismo Rural'
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

    def seed_grupos(self):
        # Configuración de grupos y permisos revisar los permisos de cada modelo para asignar correctamente
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
