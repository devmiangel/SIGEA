from django.core.management.base import BaseCommand
from Usuarios.models import Usuario, Personas, TiposDocumentos, Productores, Funcionarios, Contactos
from UPs.models import UP, TipoUP, ActividadUP, Unidades, DetalleUP, ProductosUPs
from Predios.models import Predios, TiposTenencias, Veredas, Sectores, Seguros
from datetime import date

class Command(BaseCommand):
    help = 'Seeder para poblar datos de prueba específicos de UPs y Caracterización'

    def handle(self, *args, **kwargs):
        self.stdout.write('Iniciando seeder de UPs y Caracterización...')

        # 1. Asegurar maestros necesarios para la UP que no están en seed.py
        self.seed_maestros_adicionales()

        # 2. Obtener sector para el predio
        sector_default = Sectores.objects.first()
        if not sector_default:
            vereda, _ = Veredas.objects.get_or_create(NombreVereda='Vereda Central')
            sector_default, _ = Sectores.objects.get_or_create(NombreSector='Sector Norte', Vereda=vereda)

        # 3. Crear datos de prueba
        self.seed_prueba_caracterizacion(sector_default)

        self.stdout.write(self.style.SUCCESS('Seed de UPs completado correctamente'))

    def seed_maestros_adicionales(self):
        # Productos UPs
        kg = Unidades.objects.get(Unidad='Kilogramos')
        litros = Unidades.objects.get(Unidad='Litros')
        
        productos = [
            {'Producto': 'Papa Pastusa', 'Unidad': kg},
            {'Producto': 'Leche Entera', 'Unidad': litros},
            {'Producto': 'Queso Campesino', 'Unidad': kg},
        ]
        for p in productos:
            ProductosUPs.objects.get_or_create(**p)

        # Seguros
        seguros = ['Ninguno', 'Seguro Agrario Bolivar', 'Sura Agrícola', 'Mapfre Rural']
        for s in seguros:
            Seguros.objects.get_or_create(NombreSeguro=s)

    def seed_prueba_caracterizacion(self, sector):
        self.stdout.write('Creando datos de prueba para caracterización...')
        
        # 1. Crear Persona
        tipo_doc = TiposDocumentos.objects.first()
        persona, _ = Personas.objects.get_or_create(
            numero_documento='12345678',
            defaults={
                'primer_nombre': 'Juan',
                'primer_apellido': 'Perez',
                'fecha_nacimiento': date(1985, 5, 20),
                'TipoDocumento': tipo_doc
            }
        )

        # 2. Contactos
        c1, _ = Contactos.objects.get_or_create(contacto='3001112233', TipoContacto_id=1)
        c2, _ = Contactos.objects.get_or_create(contacto='juan.perez@example.com', TipoContacto_id=2)
        persona.contactos.add(c1, c2)

        # 3. Usuario
        user, created = Usuario.objects.get_or_create(
            email='juan.perez@example.com',
            defaults={'persona': persona, 'is_active': True}
        )
        if created:
            user.set_password('admin123')
            user.save()

        # 4. Productor y Funcionario
        productor, _ = Productores.objects.get_or_create(usuario=user)
        funcionario, _ = Funcionarios.objects.get_or_create(usuario=user)

        # 5. Predio
        tenencia = TiposTenencias.objects.first()
        predio, _ = Predios.objects.get_or_create(
            NombrePredio='Finca El Recreo',
            defaults={
                'AreaPredio': 10.5,
                'TipoTenencia': tenencia,
                'Sector': sector,
                'AccesoCredito': True,
                'UsoSuelo': True,
                'Latitud': 4.6097,
                'Longitud': -74.0817,
                'Direccion': 'Km 5 Vía Principal'
            }
        )

        # 6. UP
        tipo_up = TipoUP.objects.get(TipoUP='Agrícola')
        up, created = UP.objects.get_or_create(
            Productor=productor,
            Predio=predio,
            defaults={
                'TipoUP': tipo_up,
                'FechaCaracterizacion': date.today(),
                'FechaActualizacion': date.today(),
                'Funcionario': funcionario
            }
        )

        if created:
            # 7. Detalle UP
            actividad = ActividadUP.objects.first()
            DetalleUP.objects.create(
                UP=up,
                Actividad=actividad,
                NumeroEmpleados=3,
                Asociatividad=True,
                AreaCultivada=5.0,
                AreaPastos=4.0,
                NumeroPotreros=2,
                NumeroInvernaderos=1,
                NumeroTanques=2,
                NumeroReservorios=1,
                FuentesAgua=True
            )
            self.stdout.write(f'  - Datos de prueba creados para el usuario ID: {user.id}')
        else:
            self.stdout.write('  - Datos de prueba ya existían.')
