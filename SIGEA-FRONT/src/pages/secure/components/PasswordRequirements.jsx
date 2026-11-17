// Guía en vivo de cómo construir la contraseña. Refleja las reglas del backend
// (Usuarios/password_rules.py); el servidor hace la validación final.

const LONGITUD_MINIMA = 8
const LONGITUD_MINIMA_DATO = 3

const normalizar = (texto) =>
    String(texto ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()

function contieneDatosPersonales(password, datos) {
    const clave = normalizar(password)
    if (!clave) return false
    return datos
        .flatMap((valor) => normalizar(valor).split(/[\s._\-+]+/))
        .filter((parte) => parte.length >= LONGITUD_MINIMA_DATO)
        .some((parte) => clave.includes(parte))
}

function Requisito({ cumple, children }) {
    return (
        <li className={`flex items-start gap-1 ${cumple ? 'text-[#015d3b]' : 'text-[#a22]'}`}>
            <span aria-hidden="true">{cumple ? '✓' : '✗'}</span>
            <span>{children}</span>
        </li>
    )
}

export function PasswordRequirements({ password, datosPersonales }) {
    if (!password) return null

    const largo = password.length >= LONGITUD_MINIMA
    const noSoloNumeros = !/^\d+$/.test(password)
    const sinDatosPersonales = !contieneDatosPersonales(password, datosPersonales)

    return (
        <ul className="mt-1 ml-1 text-[10px] leading-4 space-y-0.5" aria-live="polite">
            <Requisito cumple={largo}>Al menos {LONGITUD_MINIMA} caracteres</Requisito>
            <Requisito cumple={noSoloNumeros}>No puede tener solo números: combina letras y números</Requisito>
            <Requisito cumple={sinDatosPersonales}>
                No debe contener tu nombre, apellido, documento ni correo
            </Requisito>
            <li className="flex items-start gap-1 text-gray-500">
                <span aria-hidden="true">•</span>
                <span>Evita contraseñas comunes como “12345678”, “password” o “qwerty123”</span>
            </li>
        </ul>
    )
}
