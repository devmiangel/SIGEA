import { Link } from 'react-router-dom'
import logo_sigea from '../../assets/img/logo_sigea.png'
import titulo from '../../assets/img/letras_sigea.png'

const SECTIONS = [
    {
        title: '1. Responsable del tratamiento',
        body: 'El Sistema de Información para la Gestión Empresarial Agropecuaria (SIGEA) es el responsable del tratamiento de los datos personales recolectados a través de este aplicativo. Para consultas, reclamos o solicitudes relacionadas con sus datos puede escribir al correo de soporte de la entidad o dirigirse a las oficinas de atención al productor. Al registrarse, usted acepta que SIGEA almacene y gestione su información conforme a esta política.',
    },
    {
        title: '2. Marco legal',
        body: 'Esta política se rige por la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015), la Ley 1266 de 2008 en lo pertinente y demás normas que regulan la protección de datos personales en Colombia.',
    },
    {
        title: '3. Datos que recolectamos',
        body: 'A través de los formularios de registro, caracterización de unidades productivas (UPs), predios, visitas técnicas, solicitudes de insumos, agenda y protección animal, SIGEA puede recolectar: nombres y apellidos, tipo y número de documento de identidad, correo electrónico, teléfono, dirección y ubicación del predio, información productiva, agrícola, pecuaria y agroindustrial, firmas manuscritas digitales e imágenes de soporte de las visitas, y credenciales de acceso (contraseña cifrada).',
    },
    {
        title: '4. Finalidades del tratamiento',
        body: 'Sus datos serán tratados para: (a) crear y administrar su cuenta de usuario y autenticar su acceso por roles; (b) registrar y validar predios y unidades productivas; (c) programar, ejecutar y hacer seguimiento a visitas técnicas de caracterización; (d) gestionar inventario, solicitudes y asignación de insumos, herramientas y vehículos; (e) generar reportes, certificados y documentos PDF de las actuaciones; (f) contactarlo para notificaciones del servicio; y (g) cumplir obligaciones legales y requerimientos de autoridades competentes.',
    },
    {
        title: '5. Autorización',
        body: 'Al marcar la casilla de aceptación en el registro o al usar el aplicativo, usted otorga su autorización previa, expresa e informada para el tratamiento de sus datos conforme a las finalidades aquí descritas. El registro de menores de edad deberá ser realizado por su representante legal. Usted puede revocar esta autorización en cualquier momento, salvo que exista un deber legal o contractual que lo impida.',
    },
    {
        title: '6. Derechos del titular',
        body: 'Como titular usted tiene derecho a: conocer, actualizar y rectificar sus datos; solicitar prueba de la autorización; ser informado sobre el uso dado a sus datos; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización y solicitar la supresión de sus datos; y acceder gratuitamente a sus datos. Para ejercerlos, presente su solicitud con nombre completo, documento, descripción de los hechos y datos de contacto.',
    },
    {
        title: '7. Seguridad, confidencialidad y conservación',
        body: 'SIGEA aplica medidas técnicas y administrativas razonables: autenticación por token, control de acceso por roles (Administradores, Funcionarios, Productores/Usuarios), cifrado de contraseñas y restricción de rutas en frontend y backend. Sus datos se conservarán durante la vigencia de la relación y por el tiempo necesario para cumplir finalidades legales, históricas o estadísticas, adoptando luego su supresión segura o anonimización.',
    },
    {
        title: '8. Compartir información y encargados',
        body: 'Sus datos solo serán compartidos con funcionarios autorizados de la entidad para la prestación del servicio agropecuario y, cuando sea necesario, con contratistas o encargados que operen bajo instrucciones de SIGEA y con acuerdos de confidencialidad. No se cederán a terceros con fines comerciales. Solo se entregarán a autoridades cuando la ley lo exija.',
    },
    {
        title: '9. Datos sensibles y de menores',
        body: 'SIGEA no solicita datos sensibles (origen racial, orientación política, salud, biometría, etc.) salvo los estrictamente necesarios para la caracterización productiva y siempre con su autorización explícita. La información de niños, niñas y adolescentes será tratada respetando su interés superior y con autorización de sus representantes.',
    },
    {
        title: '10. Vigencia y cambios',
        body: 'Esta política rige a partir de su publicación en el aplicativo y estará vigente mientras SIGEA trate datos personales. Cualquier cambio sustancial será informado a través del aplicativo o al correo registrado antes de su entrada en vigencia. Última actualización: septiembre de 2026.',
    },
]

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
                <p className="text-center text-xs text-gray-500 mb-6">
                    Sistema de Información para la Gestión Empresarial Agropecuaria — SIGEA · Ley 1581 de 2012
                </p>

                <div className="bg-[#f3f7f3] border-l-4 border-[#015d3b] rounded-r-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Al registrarse en SIGEA usted declara haber leído esta política y autoriza de manera
                        previa, expresa e informada el tratamiento de sus datos personales para las
                        finalidades aquí descritas. Si no está de acuerdo, por favor absténgase de registrarse
                        o contáctenos para resolver sus inquietudes.
                    </p>
                </div>

                <div className="flex flex-col gap-5">
                    {SECTIONS.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-base md:text-lg font-bold text-[#015d3b] mb-1">
                                {section.title}
                            </h2>
                            <p className="text-sm text-gray-700 leading-relaxed text-justify">
                                {section.body}
                            </p>
                        </section>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
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

            <p className="text-[11px] text-gray-500 mt-4 text-center max-w-3xl">
                Para ejercer sus derechos de habeas data (conocer, actualizar, rectificar, suprimir o revocar
                la autorización), escriba indicando nombre completo, documento y descripción de la solicitud.
            </p>
        </div>
    )
}
