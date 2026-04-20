from django.core.management.base import BaseCommand
from Usuarios.models import TiposDocumentos, TiposContactos, TiposNivelesEducativos, Sisben
from UPs.models import TipoUP, ActividadUP, Unidades, GrupoAnimal, TiposAves, Propositos, ProductosApicolas
from Predios.models import TiposTenencias, Veredas, Sectores
from datetime import date
#ingerto de seeder
class Command(BaseCommand):
    help = 'Seeder inicial para poblar las tablas maestras'

    def handle(self, *args, **kwargs):
        self.stdout.write('Iniciando seeder...')

        # --- Usuarios ---
        self.seed_maestro(TiposDocumentos, 'TipoDocumento', [
            'Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte', 'Tarjeta de Identidad', 'NIT'
        ])

        TiposContactos.objects.get_or_create(id=1, defaults={'TipoContacto': 'Celular'})
        TiposContactos.objects.get_or_create(id=2, defaults={'TipoContacto': 'Correo'})

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