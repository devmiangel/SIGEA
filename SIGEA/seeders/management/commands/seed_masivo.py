import random
import uuid
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from Inventario.models import (
    AsignacionHerramientas,
    CardexInsumoFuncionario,
    Conductores,
    DetalleVehiculos,
    Herramientas,
    Insumos,
    InventarioFuncionario,
    LineasVehiculos,
    MarcasVehiculos,
    RegistroAsignacionVehiculos,
    SolicitudInsumo,
    TiposCombustibles,
    TiposHerramientas,
    TiposVehiculos,
    Vehiculos,
)
from Predios.models import (
    Predios,
    Sectores,
    Seguros,
    TiposRegistrosICA,
    TiposTenencias,
    Veredas,
)
from UPs.models import (
    ActividadUP,
    Animales,
    AnimalesUps,
    DetalleUP,
    EstadosUP,
    EventosUP,
    GrupoAnimal,
    ProduccionUPAgricola,
    ProduccionUPAgroindustrial,
    ProductosApicolas,
    ProductosUPs,
    Propositos,
    Razas,
    TipoUP,
    Unidades,
    UP,
)
from Usuarios.models import (
    Administradores,
    Contactos,
    Funcionarios,
    Personas,
    Productores,
    Sisben,
    TiposContactos,
    TiposDocumentos,
    TiposNivelesEducativos,
    Usuario,
)
from Visitas.models import (
    Aperos,
    Calificaciones,
    Estados,
    InfoVisita,
    MotivosSolicitudes,
    Pajillas,
    ServiciosPagos,
    Solicitudes,
    TiposVisitas,
    Visitas,
)

DOMAIN = '@sigea.test'
SEED_MARK = '[seed]'
VEREDA_SEED = 'Vereda Banco de Pruebas'

NOMBRES = [
    'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Sofía', 'Diego', 'Laura',
    'Andrés', 'Camila', 'Jorge', 'Valentina', 'Felipe', 'Daniela', 'Santiago',
    'Paula', 'Miguel', 'Carolina', 'Julián', 'Natalia', 'Ricardo', 'Adriana',
    'Óscar', 'Mónica', 'Héctor', 'Gloria', 'Edwin', 'Claudia', 'Wilson', 'Marcela',
    'Jairo', 'Liliana', 'Fernando', 'Patricia', 'Alberto', 'Sandra', 'Mauricio',
    'Diana', 'Nelson', 'Rosa', 'Freddy', 'Yolanda', 'Gustavo', 'Beatriz',
]
APELLIDOS = [
    'García', 'Rodríguez', 'Martínez', 'López', 'Gómez', 'Pérez', 'Sánchez',
    'Ramírez', 'Torres', 'Flores', 'Vargas', 'Castro', 'Rojas', 'Moreno',
    'Jiménez', 'Herrera', 'Medina', 'Aguilar', 'Suárez', 'Ortiz', 'Gutiérrez',
    'Chávez', 'Ramos', 'Mendoza', 'Cruz', 'Morales', 'Ortiz', 'Silva', 'Reyes',
    'Cárdenas', 'Navarro', 'Campos', 'Vega', 'Salazar', 'Guerrero', 'Peña',
]
VEREDAS = [
    'El Carmen', 'La Loma', 'San José', 'El Porvenir', 'La Esperanza',
    'Los Pinos', 'El Retiro', 'La Pradera', 'Santa Bárbara', 'El Mirador',
]
PRODUCTOS_AGRICOLAS = [
    ('Papa Pastusa', 'Kilogramos'), ('Papa Criolla', 'Kilogramos'), ('Maíz', 'Kilogramos'),
    ('Frijol', 'Kilogramos'), ('Arveja', 'Kilogramos'), ('Zanahoria', 'Kilogramos'),
    ('Cebolla', 'Kilogramos'), ('Lechuga', 'Unidades'), ('Tomate', 'Kilogramos'),
    ('Café', 'Kilogramos'), ('Mora', 'Kilogramos'), ('Fresa', 'Kilogramos'),
    ('Aguacate', 'Kilogramos'), ('Plátano', 'Kilogramos'), ('Yuca', 'Kilogramos'),
]
PRODUCTOS_AGROINDUSTRIALES = [
    ('Queso Campesino', 'Kilogramos'), ('Yogur Natural', 'Litros'), ('Miel', 'Litros'),
    ('Pulpa de Fruta', 'Kilogramos'), ('Arepas', 'Unidades'), ('Panela', 'Kilogramos'),
    ('Salsa de Tomate', 'Unidades'), ('Conservas', 'Unidades'),
]
INSUMOS = [
    'Vacuna aftosa', 'Vacuna brucelosis', 'Fertilizante NPK', 'Urea', 'Semilla de papa',
    'Alimento concentrado', 'Antibiótico bovino', 'Desparasitante', 'Herbicida',
    'Fungicida', 'Sal mineral', 'Melaza', 'Jeringas', 'Guantes de nitrilo',
    'Bomba de aspersión', 'Malla sombra', 'Cinta de riego', 'Abono orgánico',
]
HERRAMIENTAS = [
    'Pala', 'Azadón', 'Rastrillo', 'Machete', 'Martillo', 'Taladro', 'Motosierra',
    'Guadañadora', 'Carretilla', 'Bomba de fumigar', 'Podadora', 'Hoz', 'Barra',
    'Pico', 'Palín', 'Hacha', 'Llave de tubo', 'Destornillador',
]
MARCAS = {
    'Toyota': ['Hilux', 'Land Cruiser', 'Fortuner'],
    'Ford': ['Ranger', 'F-150'],
    'Chevrolet': ['D-Max', 'Colorado', 'Silverado'],
    'Nissan': ['Frontier', 'Navara'],
    'Mitsubishi': ['L200', 'Montero'],
    'Jeep': ['Wrangler'],
    'Mahindra': ['Pik-Up'],
    'Kia': ['Sportage'],
    'Renault': ['Duster'],
    'Hyundai': ['Tucson'],
}
TIPOS_VEHICULOS = ['Camioneta', 'Camión', 'Motocicleta', 'Automóvil', 'Tractocamión']
TIPOS_COMBUSTIBLES = ['Diésel', 'Gasolina', 'Gas', 'Eléctrico']
LICENCIAS = ['C1', 'C2', 'C3', 'B1', 'A2']


def _plan(total):
    return {
        'registros_solicitados': total,
        'administradores': max(2, total // 5000),
        'funcionarios': max(3, total // 400),
        'productores': max(10, total // 20),
        'usuarios': max(5, total // 100),
        'predios': max(10, total // 20),
        'ups': max(10, total // 20),
        'conductores': max(1, max(3, total // 400) // 3),
        'solicitudes': max(10, total // 13),
        'visitas': max(10, total // 13),
        'info_visitas': max(5, total // 20),
        'insumos': max(10, total // 100),
        'herramientas': max(10, total // 100),
        'vehiculos': max(5, total // 100),
        'inventario_funcionario': max(10, total // 40),
        'cardex': max(10, total // 40),
        'solicitudes_insumo': max(5, total // 40),
        'asignaciones_herramientas': max(5, total // 130),
        'asignaciones_vehiculos': max(5, total // 130),
        'produccion_agricola': max(10, total // 10),
        'produccion_agroindustrial': max(5, total // 40),
        'animales_ups': max(10, total // 20),
        'eventos': max(5, total // 400),
    }


def _m2m_names(m2m, left_model, right_model):
    through = m2m.through
    left = next(
        field.name for field in through._meta.fields
        if field.is_relation and field.remote_field.model is left_model
    )
    right = next(
        field.name for field in through._meta.fields
        if field.is_relation and field.remote_field.model is right_model
    )
    return through, left, right


def _bulk(model, objects, batch=1000):
    model.objects.bulk_create(objects, batch_size=batch)
    return objects


class Command(BaseCommand):
    help = 'Genera datos masivos realistas para pruebas de SIGEA (~20.000 registros).'

    def add_arguments(self, parser):
        parser.add_argument('--registros', type=int, default=20000)
        parser.add_argument('--password', type=str, default='Sigea2026*')
        parser.add_argument('--semilla', type=int, default=2026)
        parser.add_argument('--dry-run', action='store_true')
        parser.add_argument('--limpiar', action='store_true')

    def handle(self, *args, **options):
        total = options['registros']
        if total < 100:
            raise CommandError('--registros debe ser al menos 100.')

        self.rnd = random.Random(options['semilla'])
        self.password_hash = make_password(options['password'])
        self.password = options['password']
        self.run_id = uuid.uuid4().hex[:4]
        self.plan = _plan(total)

        self.stdout.write(self.style.MIGRATE_HEADING('Plan de datos masivos'))
        for clave, valor in self.plan.items():
            self.stdout.write(f'  {clave}: {valor}')

        if options['dry_run']:
            self.stdout.write(self.style.SUCCESS('Dry-run: no se escribió nada en la base de datos.'))
            return

        if Usuario.objects.filter(email__endswith=DOMAIN).exists() and not options['limpiar']:
            raise CommandError(
                'Ya existen datos de prueba (@sigea.test). Usa --limpiar para regenerarlos.'
            )

        if options['limpiar']:
            self.stdout.write(self.style.WARNING('Limpiando datos de prueba anteriores...'))
            self._limpiar()

        with transaction.atomic():
            catalogos = self._crear_catalogos()
            usuarios = self._crear_usuarios(catalogos)
            self._crear_datos(catalogos, usuarios)

        self.stdout.write(self.style.SUCCESS('Datos masivos generados correctamente.'))
        self.stdout.write(f'  Contraseña para todos los usuarios: {self.password}')
        self.stdout.write(f'  Admin de prueba: admin.seed{DOMAIN}')
        for etiqueta, prefijo in [
            ('Funcionario', 'funcionario.'),
            ('Productor', 'productor.'),
            ('Usuario', 'usuario.'),
        ]:
            usuario = Usuario.objects.filter(email__startswith=prefijo).first()
            if usuario:
                self.stdout.write(f'  {etiqueta} de prueba: {usuario.email}')

    def _limpiar(self):
        usuarios = Usuario.objects.filter(email__endswith=DOMAIN)
        persona_ids = [pid for pid in usuarios.values_list('persona_id', flat=True) if pid]

        Solicitudes.objects.filter(Usuario__email__endswith=DOMAIN).delete()

        detalles = DetalleVehiculos.objects.filter(Descripcion__contains=SEED_MARK)
        vehiculo_ids = list(detalles.values_list('Vehiculo_id', flat=True))
        detalles.delete()
        Vehiculos.objects.filter(id__in=vehiculo_ids, detallevehiculos__isnull=True).delete()

        Herramientas.objects.filter(Descripcion__contains=SEED_MARK).delete()
        Insumos.objects.filter(Descripcion__contains=SEED_MARK).delete()
        EventosUP.objects.filter(Descripcion__contains=SEED_MARK).delete()

        Productores.objects.filter(usuario__email__endswith=DOMAIN).delete()
        Funcionarios.objects.filter(usuario__email__endswith=DOMAIN).delete()
        Administradores.objects.filter(usuario__email__endswith=DOMAIN).delete()

        Predios.objects.filter(Sector__Vereda__NombreVereda=VEREDA_SEED).delete()
        usuarios.delete()
        Personas.objects.filter(id__in=persona_ids).delete()
        Contactos.objects.filter(contacto__endswith=DOMAIN).delete()

    def _crear_catalogos(self):
        catalogs = {}
        catalogs['tipo_doc'] = TiposDocumentos.objects.get_or_create(
            TipoDocumento='Cédula de Ciudadanía'
        )[0]
        catalogs['celular'] = TiposContactos.objects.get_or_create(
            TipoContacto='Celular'
        )[0]
        catalogs['correo'] = TiposContactos.objects.get_or_create(
            TipoContacto='Correo'
        )[0]

        niveles = ['Ninguno', 'Primaria', 'Secundaria', 'Técnico', 'Tecnológico', 'Universitario', 'Postgrado']
        catalogs['niveles'] = [
            TiposNivelesEducativos.objects.get_or_create(TipoNivelEducativo=n)[0]
            for n in niveles
        ]
        sisben = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'C1', 'C2', 'D1']
        catalogs['sisben'] = [Sisben.objects.get_or_create(NivelSisben=s)[0] for s in sisben]

        tenencias = ['Propia', 'Arrendada', 'Aparcería', 'Comodato', 'Ocupación de hecho', 'Posesión sin título']
        catalogs['tenencias'] = [
            TiposTenencias.objects.get_or_create(TipoTenencia=t)[0] for t in tenencias
        ]
        seguros = ['Ninguno', 'Seguro Agrario Bolívar', 'Sura Agrícola', 'Mapfre Rural']
        catalogs['seguros'] = [Seguros.objects.get_or_create(NombreSeguro=s)[0] for s in seguros]
        ica = ['ICA-001', 'ICA-002', 'ICA-003', 'ICA-004', 'ICA-005']
        catalogs['ica'] = [TiposRegistrosICA.objects.get_or_create(CodigoICA=c)[0] for c in ica]

        vereda, _ = Veredas.objects.get_or_create(NombreVereda=VEREDA_SEED)
        catalogs['sectores'] = [
            Sectores.objects.get_or_create(NombreSector=f'Sector {i + 1}', Vereda=vereda)[0]
            for i in range(10)
        ]

        tipos_up = ['Agrícola', 'Pecuaria', 'Agroindustrial', 'Agropecuaria']
        catalogs['tipos_up'] = [TipoUP.objects.get_or_create(TipoUP=t)[0] for t in tipos_up]
        actividades = [
            'Cultivo de hortalizas', 'Cría de ganado bovino', 'Producción de lácteos',
            'Piscicultura', 'Apicultura', 'Cultivo de frutales', 'Cultivo de café',
        ]
        catalogs['actividades'] = [
            ActividadUP.objects.get_or_create(Actividad=a)[0] for a in actividades
        ]
        unidades = ['Hectáreas', 'Metros Cuadrados', 'Cabezas', 'Kilogramos', 'Litros', 'Unidades']
        catalogs['unidades'] = {
            u: Unidades.objects.get_or_create(Unidad=u)[0] for u in unidades
        }
        for nombre, unidad in PRODUCTOS_AGRICOLAS + PRODUCTOS_AGROINDUSTRIALES:
            ProductosUPs.objects.get_or_create(
                Producto=nombre,
                defaults={'Unidad': catalogs['unidades'].get(unidad)},
            )
        catalogs['productos'] = list(ProductosUPs.objects.all())

        grupos = ['Bovinos', 'Porcinos', 'Equinos', 'Caprinos', 'Ovinos', 'Aves', 'Peces', 'Abejas']
        catalogs['grupos'] = [GrupoAnimal.objects.get_or_create(GrupoAnimal=g)[0] for g in grupos]
        razas = {
            'Bovinos': ['Holstein', 'Angus', 'Brahman', 'Normando'],
            'Porcinos': ['Duroc', 'Landrace', 'Pietrain'],
            'Equinos': ['Criollo', 'Paso Fino'],
            'Caprinos': ['Nubiana', 'Saanen'],
            'Ovinos': ['Katahdin', 'Dorper'],
            'Aves': ['Gallina ponedora', 'Pollo de engorde'],
            'Peces': ['Tilapia', 'Trucha'],
            'Abejas': ['Apis mellifera'],
        }
        for grupo, nombres in razas.items():
            grupo_obj = next(g for g in catalogs['grupos'] if g.GrupoAnimal == grupo)
            for nombre in nombres:
                raza_obj, _ = Razas.objects.get_or_create(Raza=nombre)
                Animales.objects.get_or_create(GrupoAnimal=grupo_obj, Raza=raza_obj)
        catalogs['animales'] = list(Animales.objects.select_related('GrupoAnimal', 'Raza'))

        propositos = ['Carne', 'Leche', 'Doble Propósito', 'Cría', 'Levante', 'Ceba', 'Trabajo', 'Recreación']
        catalogs['propositos'] = [Propositos.objects.get_or_create(Proposito=p)[0] for p in propositos]
        apicolas = ['Miel', 'Polen', 'Cera', 'Propóleo', 'Jalea Real', 'Veneno de abeja']
        catalogs['apicolas'] = [
            ProductosApicolas.objects.get_or_create(ProductoApicolas=p)[0] for p in apicolas
        ]

        tipos_herr = ['Manual', 'Eléctrica', 'Motorizada', 'Arado', 'Rastra', 'Rotavador']
        catalogs['tipos_herramientas'] = [
            TiposHerramientas.objects.get_or_create(TipoHerramienta=t)[0] for t in tipos_herr
        ]

        catalogs['marcas'] = []
        catalogs['lineas'] = []
        for marca, lineas in MARCAS.items():
            marca_obj, _ = MarcasVehiculos.objects.get_or_create(MarcaVehiculo=marca)
            catalogs['marcas'].append(marca_obj)
            for linea in lineas:
                linea_obj, _ = LineasVehiculos.objects.get_or_create(
                    LineaVehiculo=linea, MarcaVehiculo=marca_obj
                )
                catalogs['lineas'].append(linea_obj)

        catalogs['tipos_vehiculos'] = [
            TiposVehiculos.objects.get_or_create(TipoVehiculo=t)[0] for t in TIPOS_VEHICULOS
        ]
        catalogs['combustibles'] = [
            TiposCombustibles.objects.get_or_create(TipoCombustible=t)[0] for t in TIPOS_COMBUSTIBLES
        ]

        motivos = ['Visita', 'Caracterización']
        catalogs['motivos'] = [
            MotivosSolicitudes.objects.get_or_create(MotivoSolicitud=m)[0] for m in motivos
        ]
        estados = ['En Proceso', 'Aprobado', 'Rechazado', 'Reagendado']
        catalogs['estados'] = [Estados.objects.get_or_create(Estado=e)[0] for e in estados]
        tipos_visita = ['Caracterización', 'Pecuaria', 'Agrícola', 'Agropecuaria', 'Servicios Pagos']
        catalogs['tipos_visita'] = [
            TiposVisitas.objects.get_or_create(TipoVisita=t)[0] for t in tipos_visita
        ]
        calificaciones = ['Excelente', 'Buena', 'Regular', 'Mala']
        catalogs['calificaciones'] = [
            Calificaciones.objects.get_or_create(Calificacion=c)[0] for c in calificaciones
        ]

        for servicio in ['Maquinaria Agrícola', 'Inseminación Artificial']:
            ServiciosPagos.objects.get_or_create(ServicioPago=servicio)
        for apero, valor in [('Arado de discos', 80000), ('Rastra agrícola', 70000)]:
            Aperos.objects.get_or_create(Apero=apero, defaults={'ValorHora': valor})
        for pajilla, valor in [
            ('Pajilla de semen bovino Holstein', 35000),
            ('Pajilla de semen bovino Angus', 40000),
        ]:
            Pajillas.objects.get_or_create(Pajilla=pajilla, defaults={'ValorPajilla': valor})

        estados_up = ['En revision', 'Aceptada', 'Rechazada']
        catalogs['estados_up'] = [
            EstadosUP.objects.get_or_create(Estado=e)[0] for e in estados_up
        ]

        return catalogs

    def _crear_usuarios(self, catalogs):
        grupos = {
            'Administradores': Group.objects.get_or_create(name='Administradores')[0],
            'Funcionarios': Group.objects.get_or_create(name='Funcionarios')[0],
            'Productores': Group.objects.get_or_create(name='Productores')[0],
            'Usuarios': Group.objects.get_or_create(name='Usuarios')[0],
        }
        self._doc_seq = 700000000

        def crear(rol, cantidad, prefijo, role_model=None):
            if cantidad <= 0:
                return []
            personas = []
            for _ in range(cantidad):
                self._doc_seq += 1
                personas.append(Personas(
                    primer_nombre=self.rnd.choice(NOMBRES),
                    segundo_nombre=self.rnd.choice(NOMBRES) if self.rnd.random() < 0.35 else None,
                    primer_apellido=self.rnd.choice(APELLIDOS),
                    segundo_apellido=self.rnd.choice(APELLIDOS) if self.rnd.random() < 0.45 else None,
                    numero_documento=str(self._doc_seq),
                    TipoDocumento=catalogs['tipo_doc'],
                    fecha_nacimiento=date(
                        self.rnd.randint(1960, 2005),
                        self.rnd.randint(1, 12),
                        self.rnd.randint(1, 28),
                    ),
                ))
            _bulk(Personas, personas, batch=500)

            contactos = []
            for persona in personas:
                contactos.append(Contactos(
                    contacto=f'3{self.rnd.randint(100000000, 999999999)}',
                    TipoContacto=catalogs['celular'],
                ))
                contactos.append(Contactos(
                    contacto=f'{prefijo}.{persona.numero_documento}{DOMAIN}',
                    TipoContacto=catalogs['correo'],
                ))
            _bulk(Contactos, contactos, batch=1000)

            through_contactos, left_p, right_c = _m2m_names(
                Personas.contactos, Personas, Contactos
            )
            through_contactos.objects.bulk_create([
                through_contactos(**{f'{left_p}_id': personas[i].pk, f'{right_c}_id': contactos[i * 2].pk})
                for i in range(len(personas))
            ] + [
                through_contactos(**{f'{left_p}_id': personas[i].pk, f'{right_c}_id': contactos[i * 2 + 1].pk})
                for i in range(len(personas))
            ], batch_size=1000)

            through_nivel, left_pn, right_n = _m2m_names(
                Personas.TipoNivelEducativo, Personas, TiposNivelesEducativos
            )
            through_nivel.objects.bulk_create([
                through_nivel(**{
                    f'{left_pn}_id': persona.pk,
                    f'{right_n}_id': self.rnd.choice(catalogs['niveles']).pk,
                })
                for persona in personas
            ], batch_size=1000)

            through_sisben, left_ps, right_s = _m2m_names(
                Personas.NivelSisben, Personas, Sisben
            )
            through_sisben.objects.bulk_create([
                through_sisben(**{
                    f'{left_ps}_id': persona.pk,
                    f'{right_s}_id': self.rnd.choice(catalogs['sisben']).pk,
                })
                for persona in personas
            ], batch_size=1000)

            usuarios = []
            for index, persona in enumerate(personas):
                email = f'{prefijo}.{persona.numero_documento}{DOMAIN}'
                if prefijo == 'admin' and index == 0:
                    email = f'admin.seed{DOMAIN}'
                usuarios.append(Usuario(
                    email=email,
                    password=self.password_hash,
                    persona=persona,
                    is_active=True,
                    Estado=True,
                    date_joined=timezone.now() - timedelta(days=self.rnd.randint(0, 900)),
                ))
            _bulk(Usuario, usuarios, batch=500)

            through_group, left_u, right_g = _m2m_names(Usuario.groups, Usuario, Group)
            through_group.objects.bulk_create([
                through_group(**{f'{left_u}_id': user.pk, f'{right_g}_id': grupos[rol].pk})
                for user in usuarios
            ], batch_size=1000)

            if role_model is not None:
                _bulk(role_model, [
                    role_model(usuario=user, Estado=True) for user in usuarios
                ], batch=500)

            return usuarios

        crear('Administradores', self.plan['administradores'], 'admin', Administradores)
        crear('Funcionarios', self.plan['funcionarios'], 'funcionario', Funcionarios)
        productores_users = crear('Productores', self.plan['productores'], 'productor', Productores)
        usuarios_users = crear('Usuarios', self.plan['usuarios'], 'usuario')

        return {
            'productores': productores_users,
            'usuarios': usuarios_users,
        }

    def _crear_datos(self, catalogs, usuarios):
        productores_users = usuarios['productores']
        usuarios_users = usuarios['usuarios']

        administradores = list(
            Administradores.objects.filter(usuario__email__endswith=DOMAIN)
        )
        funcionarios = list(
            Funcionarios.objects.filter(usuario__email__endswith=DOMAIN)
        )
        productores = list(
            Productores.objects.filter(usuario__email__endswith=DOMAIN)
        )

        conductores_count = min(self.plan['conductores'], len(funcionarios))
        funcionarios_conductores = self.rnd.sample(funcionarios, conductores_count)
        conductores = _bulk(Conductores, [
            Conductores(
                Funcionario=funcionario,
                Licencia=self.rnd.choice(LICENCIAS),
                Estado=True,
            )
            for funcionario in funcionarios_conductores
        ], batch=200)

        predios = []
        for i in range(self.plan['predios']):
            predios.append(Predios(
                NombrePredio=f'Finca {self.rnd.choice(VEREDAS)} {i + 1}',
                AreaPredio=Decimal(str(round(self.rnd.uniform(0.5, 120), 3))),
                AccesoCredito=self.rnd.random() < 0.55,
                UsoSuelo=self.rnd.random() < 0.75,
                Latitud=Decimal(str(round(self.rnd.uniform(3.8, 5.8), 8))),
                Longitud=Decimal(str(round(self.rnd.uniform(-75.8, -73.4), 8))),
                Direccion=f'Vereda {self.rnd.choice(VEREDAS)} km {self.rnd.randint(1, 30)}',
                TipoTenencia=self.rnd.choice(catalogs['tenencias']),
                Seguro=self.rnd.choice(catalogs['seguros']),
                Sector=self.rnd.choice(catalogs['sectores']),
                Estado=True,
            ))
        _bulk(Predios, predios, batch=500)

        estados_up = catalogs['estados_up']
        aceptada = next(e for e in estados_up if e.Estado == 'Aceptada')
        en_revision = next(e for e in estados_up if e.Estado == 'En revision')
        rechazada = next(e for e in estados_up if e.Estado == 'Rechazada')

        ups = []
        for i in range(self.plan['ups']):
            productor = productores[i % len(productores)]
            estado = self.rnd.choices(
                [aceptada, en_revision, rechazada], weights=[65, 25, 10], k=1
            )[0]
            fecha_caracterizacion = date.today() - timedelta(days=self.rnd.randint(5, 900))
            ups.append(UP(
                Productor=productor,
                Predio=predios[i % len(predios)],
                TipoUP=self.rnd.choice(catalogs['tipos_up']),
                RUEA=f'TMP{self.run_id}{i:06d}',
                FechaCaracterizacion=fecha_caracterizacion,
                FechaActualizacion=fecha_caracterizacion + timedelta(days=self.rnd.randint(0, 200)),
                Funcionario=self.rnd.choice(funcionarios),
                idEstado=estado,
                ValidadoPor=self.rnd.choice(administradores) if estado != en_revision else None,
                FechaValidacion=timezone.now() - timedelta(days=self.rnd.randint(1, 300)) if estado != en_revision else None,
                MotivoRechazo='Documentación incompleta' if estado == rechazada else '',
            ))
        _bulk(UP, ups, batch=500)
        for up in ups:
            up.RUEA = f'RUDEA-{up.pk:07d}'
        UP.objects.bulk_update(ups, ['RUEA'], batch_size=500)

        productor_up = {up.Productor_id: up for up in ups}

        _bulk(DetalleUP, [
            DetalleUP(
                UP=up,
                Actividad=self.rnd.choice(catalogs['actividades']),
                NumeroEmpleados=self.rnd.randint(1, 12),
                Asociatividad=self.rnd.random() < 0.4,
                AreaCultivada=Decimal(str(round(self.rnd.uniform(0.2, 50), 2))),
                AreaPastos=Decimal(str(round(self.rnd.uniform(0, 40), 2))),
                NumeroPotreros=self.rnd.randint(0, 18),
                NumeroInvernaderos=self.rnd.randint(0, 5),
                NumeroTanques=self.rnd.randint(0, 4),
                NumeroReservorios=self.rnd.randint(0, 3),
                FuentesAgua=self.rnd.random() < 0.7,
                FechaActualizacion=up.FechaActualizacion,
            )
            for up in ups
        ], batch=500)

        productos = catalogs['productos']
        _bulk(ProduccionUPAgricola, [
            ProduccionUPAgricola(
                UP=self.rnd.choice(ups),
                Producto=self.rnd.choice(productos),
                Cantidad=Decimal(str(round(self.rnd.uniform(1, 5000), 3))),
            )
            for _ in range(self.plan['produccion_agricola'])
        ], batch=1000)

        _bulk(ProduccionUPAgroindustrial, [
            ProduccionUPAgroindustrial(
                UP=self.rnd.choice(ups),
                Producto=self.rnd.choice(productos),
                Cantidad=Decimal(str(round(self.rnd.uniform(1, 2000), 3))),
                INVIMA=self.rnd.random() < 0.45,
            )
            for _ in range(self.plan['produccion_agroindustrial'])
        ], batch=500)

        animales_disponibles = catalogs['animales']
        pares_animales = set()
        animales_ups = []
        while len(animales_ups) < self.plan['animales_ups']:
            up = self.rnd.choice(ups)
            animal = self.rnd.choice(animales_disponibles)
            key = (up.pk, animal.pk)
            if key in pares_animales:
                continue
            pares_animales.add(key)
            animales_ups.append(AnimalesUps(
                UP=up,
                Animal=animal,
                Cantidad=self.rnd.randint(1, 250),
            ))
        _bulk(AnimalesUps, animales_ups, batch=500)

        insumos = _bulk(Insumos, [
            Insumos(
                Nombre=self.rnd.choice(INSUMOS),
                Cantidad=self.rnd.randint(5, 800),
                Unidades=self.rnd.choice(list(catalogs['unidades'].values())),
                Descripcion=f'Insumo de prueba para caracterización {SEED_MARK}',
                Estado=True,
            )
            for _ in range(self.plan['insumos'])
        ], batch=500)

        herramientas = _bulk(Herramientas, [
            Herramientas(
                Herramienta=self.rnd.choice(HERRAMIENTAS),
                TipoHerramienta=self.rnd.choice(catalogs['tipos_herramientas']),
                Descripcion=f'Herramienta de inventario de prueba {SEED_MARK}',
                Estado=self.rnd.random() < 0.9,
            )
            for _ in range(self.plan['herramientas'])
        ], batch=500)

        especificaciones = _bulk(Vehiculos, [
            Vehiculos(
                LineaVehiculo=self.rnd.choice(catalogs['lineas']),
                TipoCombustible=self.rnd.choice(catalogs['combustibles']),
                TipoVehiculo=self.rnd.choice(catalogs['tipos_vehiculos']),
            )
            for _ in range(self.plan['vehiculos'])
        ], batch=500)

        detalles_vehiculos = _bulk(DetalleVehiculos, [
            DetalleVehiculos(
                Vehiculo=especificacion,
                Placa=f'ABC{100 + i:03d}',
                Modelo=str(self.rnd.randint(2005, 2026)),
                FechaTecno=date.today() + timedelta(days=self.rnd.randint(-120, 500)),
                FechaSoat=date.today() + timedelta(days=self.rnd.randint(-120, 500)),
                Descripcion=f'Vehículo de prueba para rutas de campo {SEED_MARK}',
                Estado=self.rnd.random() < 0.9,
            )
            for i, especificacion in enumerate(especificaciones)
        ], batch=500)

        pares_inventario = set()
        inventario_funcionario = []
        while len(inventario_funcionario) < self.plan['inventario_funcionario']:
            funcionario = self.rnd.choice(funcionarios)
            insumo = self.rnd.choice(insumos)
            key = (funcionario.pk, insumo.pk)
            if key in pares_inventario:
                continue
            pares_inventario.add(key)
            inventario_funcionario.append(InventarioFuncionario(
                Funcionario=funcionario,
                Insumo=insumo,
                Cantidad=self.rnd.randint(1, 40),
            ))
        _bulk(InventarioFuncionario, inventario_funcionario, batch=500)

        _bulk(CardexInsumoFuncionario, [
            CardexInsumoFuncionario(
                Funcionario=self.rnd.choice(funcionarios),
                Insumo=self.rnd.choice(insumos),
                Administrador=self.rnd.choice(administradores),
                Cantidad=self.rnd.randint(1, 30),
                FechaAsignacion=date.today() - timedelta(days=self.rnd.randint(1, 300)),
            )
            for _ in range(self.plan['cardex'])
        ], batch=500)

        _bulk(SolicitudInsumo, [
            SolicitudInsumo(
                Insumo=self.rnd.choice(insumos),
                Funcionario=self.rnd.choice(funcionarios),
                Cantidad=self.rnd.randint(1, 25),
                Estado=self.rnd.choice(['Pendiente', 'Aprobada', 'Rechazada']),
                Observacion=f'Solicitud de insumo para visita de campo {SEED_MARK}',
            )
            for _ in range(self.plan['solicitudes_insumo'])
        ], batch=500)

        herramientas_disponibles = [h for h in herramientas if h.Estado]
        herramientas_asignadas = self.rnd.sample(
            herramientas_disponibles,
            min(self.plan['asignaciones_herramientas'], len(herramientas_disponibles)),
        )
        asignaciones_herramientas = []
        for herramienta in herramientas_asignadas:
            activa = self.rnd.random() < 0.6
            asignaciones_herramientas.append(AsignacionHerramientas(
                Herramienta=herramienta,
                Funcionario=self.rnd.choice(funcionarios),
                Administrador=self.rnd.choice(administradores),
                FechaAsignacion=date.today() - timedelta(days=self.rnd.randint(1, 180)),
                FechaDevolucion=None if activa else date.today() - timedelta(days=self.rnd.randint(1, 30)),
                Entregado=not activa,
            ))
        _bulk(AsignacionHerramientas, asignaciones_herramientas, batch=300)

        detalles_disponibles = [d for d in detalles_vehiculos if d.Estado]
        detalles_asignados = self.rnd.sample(
            detalles_disponibles,
            min(self.plan['asignaciones_vehiculos'], len(detalles_disponibles)),
        )
        asignaciones_vehiculos = []
        for detalle in detalles_asignados:
            activa = self.rnd.random() < 0.6
            asignaciones_vehiculos.append(RegistroAsignacionVehiculos(
                DetalleVehiculo=detalle,
                Conductor=self.rnd.choice(conductores),
                Administrador=self.rnd.choice(administradores),
                FechaAsignacion=date.today() - timedelta(days=self.rnd.randint(1, 180)),
                FechaDevolucion=None if activa else date.today() - timedelta(days=self.rnd.randint(1, 30)),
                Entregado=not activa,
            ))
        _bulk(RegistroAsignacionVehiculos, asignaciones_vehiculos, batch=300)

        motivo_caracterizacion = next(
            m for m in catalogs['motivos'] if m.MotivoSolicitud == 'Caracterización'
        )
        tipo_caracterizacion = next(
            t for t in catalogs['tipos_visita'] if t.TipoVisita == 'Caracterización'
        )
        usuarios_por_pk = {usuario.pk: usuario for usuario in productores_users}
        solicitantes = productores_users + usuarios_users

        solicitudes = []
        for up in ups:
            usuario = usuarios_por_pk.get(up.Productor.usuario_id)
            if usuario is None:
                continue
            solicitudes.append(Solicitudes(
                UP=up,
                MotivoSolicitud=motivo_caracterizacion,
                Observacion=f'Caracterización inicial de la unidad productiva {SEED_MARK}',
                Direccion=f'Vereda {self.rnd.choice(VEREDAS)} km {self.rnd.randint(1, 30)}',
                Estado=self.rnd.choice(catalogs['estados']),
                Usuario=usuario,
            ))

        restantes = max(0, self.plan['solicitudes'] - len(solicitudes))
        for _ in range(restantes):
            usuario = self.rnd.choice(solicitantes)
            productor = next((p for p in productores if p.usuario_id == usuario.pk), None)
            up = productor_up.get(productor.pk) if productor else None
            solicitudes.append(Solicitudes(
                UP=up,
                MotivoSolicitud=self.rnd.choice(catalogs['motivos']),
                Observacion=f'Solicitud de visita para acompañamiento técnico {SEED_MARK}',
                Direccion=f'Vereda {self.rnd.choice(VEREDAS)} km {self.rnd.randint(1, 30)}',
                Estado=self.rnd.choice(catalogs['estados']),
                Usuario=usuario,
            ))
        _bulk(Solicitudes, solicitudes, batch=500)

        visitas = []
        for solicitud in solicitudes:
            es_caracterizacion = solicitud.MotivoSolicitud_id == motivo_caracterizacion.pk
            fecha = timezone.now() + timedelta(
                days=self.rnd.randint(-180, 90),
                hours=self.rnd.randint(7, 17),
                minutes=self.rnd.choice([0, 15, 30, 45]),
            )
            visitas.append(Visitas(
                Solicitud=solicitud,
                Funcionario=self.rnd.choice(funcionarios),
                Administrador=self.rnd.choice(administradores),
                TipoVisita=tipo_caracterizacion if es_caracterizacion else self.rnd.choice(catalogs['tipos_visita']),
                FechaYHoraVisita=fecha,
                Ubicacion=f'Finca {self.rnd.choice(VEREDAS)}',
                estado=True if es_caracterizacion else self.rnd.random() < 0.65,
                Autorizacion=self.rnd.random() < 0.8,
            ))
        _bulk(Visitas, visitas, batch=500)

        info_visitas = []
        for visita in visitas[:self.plan['info_visitas']]:
            info_visitas.append(InfoVisita(
                Visita=visita,
                Calificacion=self.rnd.choice(catalogs['calificaciones']),
                ObservacionVisita=f'Visita de seguimiento y recomendaciones técnicas {SEED_MARK}',
                AccionSeguimiento=self.rnd.choice([
                    'Revisión de cultivo', 'Control sanitario', 'Asesoría de manejo',
                    'Verificación de inventario', 'Plan de fertilización',
                ]),
                Firmado=True,
                DiagnosticoPresuntivo=self.rnd.choice([
                    'Buen estado fitosanitario', 'Presencia de plagas', 'Suelo con baja fertilidad',
                    'Animales en buen estado', 'Requiere asistencia técnica',
                ]),
                Acciones='Recomendaciones entregadas al productor',
                HoraInicio=visita.FechaYHoraVisita,
                HoraSalida=visita.FechaYHoraVisita + timedelta(hours=1, minutes=30),
            ))
        _bulk(InfoVisita, info_visitas, batch=500)

        eventos = _bulk(EventosUP, [
            EventosUP(
                Titulo=self.rnd.choice([
                    'Jornada de vacunación', 'Taller de buenas prácticas', 'Feria campesina',
                    'Capacitación en riego', 'Día de campo', 'Socialización de proyectos',
                ]),
                Descripcion=f'Evento de prueba para productores {SEED_MARK}',
                Fecha=date.today() + timedelta(days=self.rnd.randint(-60, 120)),
                Lugar=f'Vereda {self.rnd.choice(VEREDAS)}',
            )
            for _ in range(self.plan['eventos'])
        ], batch=200)
        through_evento, left_e, right_u = _m2m_names(EventosUP.UP, EventosUP, UP)
        through_evento.objects.bulk_create([
            through_evento(**{
                f'{left_e}_id': evento.pk,
                f'{right_u}_id': self.rnd.choice(ups).pk,
            })
            for evento in eventos
        ], batch_size=500)
