import { Link } from 'react-router-dom'
import logo_sigea from '../../assets/img/logo_sigea.png'
import titulo from '../../assets/img/letras_sigea.png'

/*
 * Datos institucionales de la política.
 * Los campos vacíos ('') no se muestran en la página: complételos con los datos oficiales
 * de la Alcaldía antes de publicar (dirección, correo y teléfono de protección de datos,
 * y fecha de aprobación institucional).
 */
const POLITICA = {
    version: '2.0',
    actualizacion: 'Noviembre de 2026',
    entradaVigencia: '',
    entidad: 'Municipio de Tocancipá – Alcaldía Municipal',
    dependencia: 'Unidad de Desarrollo Agropecuario',
    direccion: '',
    correo: '',
    telefono: '',
}

const CONTACTO = [
    { etiqueta: 'Entidad', valor: POLITICA.entidad },
    { etiqueta: 'Dependencia responsable', valor: POLITICA.dependencia },
    { etiqueta: 'Dirección', valor: POLITICA.direccion },
    { etiqueta: 'Correo electrónico', valor: POLITICA.correo },
    { etiqueta: 'Teléfono', valor: POLITICA.telefono },
].filter((c) => c.valor)

/*
 * Cada sección es una lista de bloques:
 *   'p'  párrafo, 'ul' lista con viñetas, 'ol' lista numerada,
 *   'h3' subtítulo, 'dl' lista de pares { termino, texto }.
 */
const SECTIONS = [
    {
        title: '1. Responsable del tratamiento',
        blocks: [
            ['p', `El Municipio de Tocancipá, a través de la ${POLITICA.dependencia} de la Alcaldía Municipal, es el responsable del tratamiento de los datos personales recolectados y administrados mediante el Sistema de Información para la Gestión Empresarial Agropecuaria (SIGEA).`],
            ['p', 'SIGEA es una herramienta tecnológica destinada a apoyar la gestión de los servicios agropecuarios del municipio, facilitando la administración de usuarios, productores, unidades productivas, predios, visitas técnicas, inventarios, solicitudes de insumos y demás actividades relacionadas con la gestión agropecuaria municipal.'],
            ['p', 'Para ejercer sus derechos como titular de datos personales, presentar consultas, reclamos o solicitudes relacionadas con el tratamiento de su información, podrá comunicarse a través de los respectivos canales institucionales.'],
            
        ],
    },
    {
        title: '2. Marco normativo',
        blocks: [
            ['p', 'La presente política se fundamenta en los artículos 15 y 20 de la Constitución Política de Colombia y en las disposiciones legales y reglamentarias relacionadas con la protección de datos personales, especialmente:'],
            ['ul', [
                'Ley Estatutaria 1581 de 2012, por la cual se dictan disposiciones generales para la protección de datos personales.',
                'Decreto 1377 de 2013, que reglamenta parcialmente la Ley 1581 de 2012 en lo relacionado con la autorización, las políticas de tratamiento y el ejercicio de los derechos de los titulares, compilado en el Decreto Único Reglamentario 1074 de 2015.',
                'Demás disposiciones que modifiquen, complementen o reglamenten el régimen colombiano de protección de datos personales.',
            ]],
            ['p', 'El tratamiento de la información se realizará conforme a los principios de legalidad, finalidad, libertad, veracidad o calidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad.'],
        ],
    },
    {
        title: '3. Datos personales recolectados',
        blocks: [
            ['p', 'A través de los diferentes módulos y funcionalidades de SIGEA, el Municipio de Tocancipá podrá recolectar y tratar los datos personales necesarios para el cumplimiento de sus funciones y la prestación de los servicios agropecuarios municipales. Entre las categorías de información que pueden ser objeto de tratamiento se encuentran:'],
            ['dl', [
                { termino: 'Datos de identificación', texto: 'nombres y apellidos, tipo y número de documento de identidad y demás información necesaria para identificar al titular.' },
                { termino: 'Datos de contacto', texto: 'dirección de residencia, correo electrónico, número telefónico y otros medios de comunicación suministrados por el titular.' },
                { termino: 'Información territorial', texto: 'ubicación, dirección, identificación y características de los predios y unidades productivas, cuando esta información pueda asociarse con una persona natural identificada o identificable.' },
                { termino: 'Información productiva', texto: 'datos relacionados con actividades agrícolas, pecuarias y agroindustriales, características de las unidades productivas, cultivos, especies animales, producción y demás información necesaria para los procesos de caracterización agropecuaria.' },
                { termino: 'Información administrativa', texto: 'registros de visitas técnicas, solicitudes de insumos, asignaciones de herramientas, vehículos, inventarios, documentos de soporte y actuaciones relacionadas con los servicios de la dependencia.' },
                { termino: 'Registros documentales y gráficos', texto: 'fotografías, documentos adjuntos, firmas manuscritas digitalizadas y demás evidencias generadas o aportadas durante los procesos de atención y seguimiento.' },
                { termino: 'Datos de acceso', texto: 'correo electrónico, identificadores de usuario, registros de autenticación y contraseñas almacenadas mediante mecanismos criptográficos de protección.' },
            ]],
            ['p', 'La recolección de estos datos estará limitada a aquellos que resulten pertinentes, adecuados y necesarios para las finalidades informadas al titular.'],
            ['p', 'Cuando se requiera tratar información de naturaleza sensible, se informará previamente al titular sobre su carácter facultativo, las finalidades específicas y los derechos que le asisten, y se obtendrá la autorización explícita cuando sea exigible legalmente.'],
        ],
    },
    {
        title: '4. Finalidades del tratamiento',
        blocks: [
            ['p', 'Los datos personales recolectados mediante SIGEA serán tratados para las siguientes finalidades:'],
            ['ol', [
                'Crear, administrar, actualizar y gestionar las cuentas de usuario del aplicativo.',
                'Realizar procesos de identificación, autenticación y asignación de permisos de acceso de acuerdo con los perfiles y roles establecidos.',
                'Registrar, consultar, actualizar y validar la información de productores, predios y unidades productivas.',
                'Realizar procesos de caracterización y seguimiento de las actividades agrícolas, pecuarias y agroindustriales del municipio.',
                'Programar, registrar, documentar y hacer seguimiento a las visitas técnicas realizadas por los funcionarios y personal autorizado.',
                'Administrar los inventarios de insumos, herramientas, materiales y vehículos destinados a las actividades de la dependencia.',
                'Gestionar las solicitudes, entregas, asignaciones y registros relacionados con los recursos agropecuarios.',
                'Generar reportes, certificados, documentos PDF y demás soportes administrativos derivados de las actuaciones realizadas en el aplicativo.',
                'Gestionar la agenda de actividades y los procesos de atención relacionados con los servicios agropecuarios.',
                'Administrar los registros relacionados con los programas y actividades de protección animal, cuando corresponda.',
                'Establecer comunicación con los productores y usuarios para informar sobre actividades, visitas, solicitudes, novedades y demás asuntos relacionados con los servicios prestados.',
                'Elaborar estadísticas, informes e indicadores que permitan apoyar la planeación, evaluación y toma de decisiones de la gestión agropecuaria municipal, aplicando medidas de anonimización cuando corresponda.',
                'Atender requerimientos de autoridades administrativas o judiciales competentes y cumplir las obligaciones legales aplicables al Municipio.',
            ]],
            ['p', 'Los datos personales no serán utilizados para finalidades incompatibles con las aquí descritas, salvo que exista una autorización válida del titular o una disposición legal que habilite dicho tratamiento.'],
        ],
    },
    {
        title: '5. Autorización para el tratamiento de datos personales',
        blocks: [
            ['p', 'De conformidad con la Ley 1581 de 2012, el tratamiento de datos personales requiere la autorización previa, expresa e informada del titular, salvo las excepciones establecidas en el artículo 10 de dicha ley, entre ellas la información requerida por una entidad pública o administrativa en ejercicio de sus funciones legales.'],
            ['p', 'La autorización podrá obtenerse mediante mecanismos físicos, electrónicos o digitales que permitan su consulta y verificación posterior. En SIGEA, esta autorización podrá gestionarse mediante una casilla de aceptación incorporada en los formularios de registro o en los procedimientos de recolección de información, según corresponda.'],
            ['p', 'Antes de otorgar su autorización, el titular será informado sobre:'],
            ['ul', [
                'La identidad y los datos de contacto del responsable del tratamiento.',
                'Las finalidades para las cuales serán utilizados sus datos personales.',
                'El carácter facultativo de las respuestas relacionadas con datos sensibles y, cuando corresponda, con información de niños, niñas y adolescentes.',
                'Los derechos que le asisten como titular de la información.',
                'Los mecanismos y canales disponibles para ejercer sus derechos.',
            ]],
            ['p', 'El Municipio conservará la evidencia de las autorizaciones obtenidas, incluyendo la información necesaria para identificar al titular, la fecha de aceptación y la versión de la política aplicable.'],
            ['p', 'La autorización podrá ser revocada en cualquier momento, siempre que no exista un deber legal o contractual que impida suprimir la información o suspender el tratamiento correspondiente. La revocatoria y la supresión de datos se tramitarán conforme a los procedimientos y condiciones establecidos en la legislación vigente.'],
        ],
    },
    {
        title: '6. Derechos de los titulares de los datos personales',
        blocks: [
            ['p', 'De conformidad con el artículo 8 de la Ley 1581 de 2012, los titulares de los datos personales tienen derecho a:'],
            ['ol', [
                'Conocer, actualizar y rectificar sus datos personales.',
                'Solicitar prueba de la autorización otorgada para el tratamiento de sus datos, salvo cuando la ley establezca una excepción.',
                'Ser informados, previa solicitud, sobre el uso que se ha dado a sus datos personales.',
                'Presentar quejas ante la Superintendencia de Industria y Comercio cuando consideren que se han vulnerado sus derechos relacionados con la protección de datos personales, una vez agotado el trámite de consulta o reclamo ante el responsable o encargado, según corresponda.',
                'Revocar la autorización y solicitar la supresión de sus datos personales cuando resulte procedente conforme a la ley.',
                'Acceder gratuitamente a sus datos personales objeto de tratamiento.',
            ]],
            /* ['h3', 'Procedimiento para ejercer los derechos'],
            ['p', 'Los titulares, sus causahabientes o representantes podrán presentar consultas o reclamos a través de los canales institucionales indicados en el apartado primero de esta política. Las solicitudes deberán contener, como mínimo:'],
            ['ul', [
                'Nombre completo e identificación del titular.',
                'Descripción clara de la solicitud o de los hechos que la motivan.',
                'Datos de contacto para recibir la respuesta.',
                'Documentos de soporte, cuando sean necesarios.',
                'Acreditación de la representación, cuando la solicitud sea presentada por un representante o causahabiente.',
            ]],
            ['h3', 'Términos de atención'],
            ['p', 'Las consultas serán atendidas dentro de los diez (10) días hábiles siguientes a su recepción. Cuando no sea posible atenderlas dentro de dicho término, se informará al interesado el motivo de la demora y la fecha en que se dará respuesta, la cual no podrá superar los cinco (5) días hábiles siguientes al vencimiento del primer término.'],
            ['p', 'Los reclamos serán atendidos dentro de los quince (15) días hábiles siguientes a su recepción. Cuando no sea posible atenderlos dentro de dicho término, se informará al interesado el motivo de la demora y la fecha en que se dará respuesta, la cual no podrá superar los ocho (8) días hábiles siguientes al vencimiento del primer término.'],
            ['p', 'Cuando el reclamo esté incompleto, se requerirá al interesado dentro de los cinco (5) días siguientes a su recepción para que subsane las fallas. Si transcurridos dos (2) meses desde la fecha del requerimiento el solicitante no presenta la información requerida, se entenderá que ha desistido del reclamo.'], */
        ],
    },
    {
        title: '7. Seguridad, confidencialidad y conservación de la información',
        blocks: [
            ['p', 'El Municipio de Tocancipá adoptará las medidas técnicas, humanas y administrativas necesarias para proteger los datos personales tratados mediante SIGEA, procurando evitar su pérdida, adulteración, consulta, uso o acceso no autorizado. Entre las medidas de seguridad aplicables al sistema se contemplan:'],
            ['ul', [
                'Mecanismos de autenticación para verificar la identidad de los usuarios.',
                'Control de acceso basado en roles y permisos asignados de acuerdo con las funciones autorizadas.',
                'Protección criptográfica de las contraseñas almacenadas.',
                'Restricción de acceso a los servicios y recursos del aplicativo mediante controles implementados en el backend.',
                'Uso de canales de comunicación cifrados cuando corresponda.',
                'Protección de las bases de datos y archivos asociados al sistema.',
                /* 'Realización de copias de seguridad y mecanismos de recuperación de información.', */
                'Gestión y seguimiento de incidentes relacionados con la seguridad de la información.',
                'Aplicación de obligaciones de confidencialidad al personal autorizado que intervenga en el tratamiento.',
            ]],
            ['p', 'Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades del tratamiento y las obligaciones legales, administrativas y archivísticas aplicables. La conservación y disposición final de los documentos y registros se realizará conforme a las Tablas de Retención Documental y demás instrumentos de gestión documental de la entidad, cuando sean aplicables.'],
            /* ['p', 'Una vez cumplidas las finalidades y los períodos de conservación correspondientes, se procederá a la supresión segura o anonimización de la información, según corresponda y siempre que no exista una obligación legal o administrativa que exija su conservación.'], */
        ],
    },
    {
        title: '8. Compartición de información y encargados del tratamiento',
        blocks: [
            ['p', 'Los datos personales tratados mediante SIGEA podrán ser consultados por los funcionarios y servidores públicos autorizados del Municipio de Tocancipá, de acuerdo con sus competencias, funciones y permisos de acceso.'],
            ['p', 'Cuando resulte necesario para la operación, mantenimiento, alojamiento, soporte o funcionamiento del aplicativo, la entidad podrá permitir el acceso a proveedores tecnológicos, contratistas y demás terceros que actúen como encargados del tratamiento, siempre que exista una relación jurídica que establezca las condiciones y obligaciones correspondientes. Los encargados deberán:'],
            ['ul', [
                'Tratar los datos personales únicamente conforme a las instrucciones del responsable.',
                'Utilizar la información exclusivamente para las finalidades autorizadas.',
                'Implementar medidas de seguridad adecuadas para proteger los datos.',
                'Mantener la confidencialidad de la información a la que tengan acceso.',
                'Abstenerse de utilizar los datos para finalidades propias o comerciales.',
                'Cumplir las obligaciones legales y contractuales aplicables al tratamiento de datos personales.',
            ]],
            ['p', 'La entidad no comercializará los datos personales ni los utilizará para fines publicitarios o comerciales ajenos a sus funciones institucionales.'],
            ['p', 'La comunicación de información a otras entidades o autoridades se realizará cuando exista una autorización válida del titular o una habilitación legal que permita dicho suministro.'],
            /* ['p', 'Cuando la operación de SIGEA implique transmisiones o transferencias nacionales o internacionales de datos personales, estas se efectuarán de conformidad con las disposiciones legales aplicables y las garantías exigidas para cada operación.'], */
        ],
    },
    {
        title: '9. Tratamiento de datos sensibles y de niños, niñas y adolescentes',
        blocks: [
            ['p', 'El tratamiento de datos personales sensibles estará sujeto a las condiciones especiales establecidas en la Ley 1581 de 2012. Cuando excepcionalmente sea necesario recolectar o utilizar información sensible, el responsable informará al titular sobre el carácter facultativo de su suministro, las finalidades específicas y los derechos que le asisten, y obtendrá autorización explícita cuando sea legalmente exigible.'],
            ['p', 'El titular no estará obligado a suministrar datos sensibles, salvo las excepciones previstas en la ley.'],
            ['p', 'En relación con los datos personales de niños, niñas y adolescentes, su tratamiento estará sujeto a las restricciones legales y constitucionales aplicables, garantizando en todo momento el respeto de sus derechos fundamentales y su interés superior.'],
            ['p', 'Cuando excepcionalmente resulte procedente el tratamiento de esta información, deberán observarse las condiciones establecidas por la normativa vigente, incluyendo la autorización del representante legal cuando corresponda, el respeto por el derecho del menor a ser escuchado y la valoración de su madurez y autonomía. SIGEA no utilizará información de menores de edad para finalidades diferentes de aquellas legalmente permitidas.'],
        ],
    },
    {
        title: '10. Vigencia, modificaciones y actualización de la política',
        blocks: [
            ['p', 'La presente Política de Tratamiento de Datos Personales entra en vigencia a partir de su aprobación y publicación por parte del Municipio de Tocancipá, y permanecerá vigente mientras la entidad realice operaciones de tratamiento de datos personales relacionadas con SIGEA.'],
            ['p', 'Las bases de datos y los registros administrados mediante el aplicativo se conservarán durante los períodos necesarios para cumplir las finalidades autorizadas y las obligaciones legales, administrativas y archivísticas correspondientes.'],
            ['p', 'Cualquier modificación sustancial de esta política será informada oportunamente a los titulares mediante los canales institucionales disponibles o los medios de contacto registrados, cuando corresponda. Cuando los cambios impliquen nuevas finalidades para el tratamiento de datos personales, se solicitará una nueva autorización antes de realizar dicho tratamiento, salvo que exista una habilitación legal aplicable.'],
            ['p', 'La versión vigente de esta política estará disponible para consulta permanente a través de los medios institucionales definidos por el Municipio de Tocancipá.'],
        ],
    },
]

const TEXTO = 'text-sm text-gray-700 leading-relaxed'

function Bloque({ bloque }) {
    const [tipo, contenido] = bloque
    switch (tipo) {
        case 'h3':
            return <h3 className="text-sm md:text-base font-semibold text-[#015d3b] mt-2">{contenido}</h3>
        case 'ul':
            return (
                <ul className={`${TEXTO} list-disc pl-5 flex flex-col gap-1`}>
                    {contenido.map((item) => <li key={item}>{item}</li>)}
                </ul>
            )
        case 'ol':
            return (
                <ol className={`${TEXTO} list-decimal pl-5 flex flex-col gap-1`}>
                    {contenido.map((item) => <li key={item}>{item}</li>)}
                </ol>
            )
        case 'dl':
            return (
                <ul className={`${TEXTO} flex flex-col gap-1.5`}>
                    {contenido.map(({ termino, texto }, i) => (
                        <li key={termino}>
                            <strong className="text-gray-800">{String.fromCharCode(97 + i)}. {termino}:</strong> {texto}
                        </li>
                    ))}
                </ul>
            )
        case 'contacto':
            return (
                <dl className="bg-[#f8f6ef] border border-[#e5e0d0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {CONTACTO.map(({ etiqueta, valor }) => (
                        <div key={etiqueta} className="contents">
                            <dt className="font-semibold text-gray-800">{etiqueta}</dt>
                            <dd className="text-gray-700 mb-1 sm:mb-0">{valor}</dd>
                        </div>
                    ))}
                </dl>
            )
        default:
            return <p className={`${TEXTO} text-justify`}>{contenido}</p>
    }
}

export default function DataTreatment() {
    return (
        <div className="min-h-screen w-full bg-[#fdfcf8] flex flex-col items-center px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <img src={logo_sigea} alt="Logo SIGEA" className="h-16 w-auto" />
                <img src={titulo} alt="SIGEA" className="h-10 w-auto" />
            </div>

            <main className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-[#e5e0d0] p-6 md:p-10">
                <p className="text-[11px] uppercase tracking-widest text-[#015d3b] font-semibold text-center">
                    Aviso de privacidad y autorización
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-[#015d3b] text-center mt-1 mb-2">
                    Política de Tratamiento de Datos Personales
                </h1>
                <p className="text-center text-xs text-gray-500">
                    Sistema de Información para la Gestión Empresarial Agropecuaria — SIGEA · Ley 1581 de 2012
                </p>
                <p className="text-center text-xs text-gray-500 mb-6">
                    {POLITICA.entidad} · {POLITICA.dependencia} · Versión {POLITICA.version} · Actualizada: {POLITICA.actualizacion}
                </p>

                <div className="bg-[#f3f7f3] border-l-4 border-[#015d3b] rounded-r-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Al registrarse en SIGEA usted declara haber leído esta política y autoriza al Municipio
                        de Tocancipá, de manera previa, expresa e informada, el tratamiento de sus datos
                        personales para las finalidades aquí descritas. Si no está de acuerdo, absténgase de
                        registrarse o comuníquese por los canales institucionales para resolver sus inquietudes.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    {SECTIONS.map((section) => (
                        <section key={section.title} className="flex flex-col gap-2">
                            <h2 className="text-base md:text-lg font-bold text-[#015d3b]">
                                {section.title}
                            </h2>
                            {section.blocks.map((bloque, i) => (
                                <Bloque key={i} bloque={bloque} />
                            ))}
                        </section>
                    ))}
                </div>

                <dl className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-600 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    {POLITICA.entradaVigencia && (
                        <>
                            <dt className="font-semibold">Fecha de entrada en vigencia:</dt>
                            <dd>{POLITICA.entradaVigencia}</dd>
                        </>
                    )}
                    <dt className="font-semibold">Última actualización:</dt>
                    <dd>{POLITICA.actualizacion}</dd>
                    {/* <dt className="font-semibold">Entidad responsable:</dt>
                    <dd>{POLITICA.entidad}</dd> */}
                </dl>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/registro"
                        className="text-center py-2.5 px-5 bg-[#015d3b] rounded-xl text-white text-sm font-bold hover:bg-[#004d2f] transition-colors"
                    >
                        Volver al registro
                    </Link>
                    <Link
                        to="/"
                        className="text-center py-2.5 px-5 border border-[#015d3b] rounded-xl text-[#015d3b] text-sm font-bold hover:bg-[#eef5ef] transition-colors"
                    >
                        Ir al inicio de sesión
                    </Link>
                </div>
            </main>

            {/* <p className="text-[11px] text-gray-500 mt-4 text-center max-w-3xl">
                Para ejercer sus derechos de habeas data (conocer, actualizar, rectificar, suprimir o revocar
                la autorización), presente su solicitud por los canales institucionales indicando nombre
                completo, documento, descripción de la solicitud y datos de contacto.
            </p> */}
        </div>
    )
}
