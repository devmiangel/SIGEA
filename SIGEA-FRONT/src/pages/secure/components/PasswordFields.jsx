import { Input } from '../../../components/formElements/Input'
import { FieldError } from './FieldError'
import { PasswordRequirements } from './PasswordRequirements'
import { passwordRules, passwordConfirmRules } from '../../../utils/validationRules'

const CAMPOS_PERSONALES = [
    'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'numero_documento',
]

export function PasswordFields({ register, errors, watch }) {
    const password = watch('password') || ''
    const email = watch('email') || ''
    const datosPersonales = [
        ...CAMPOS_PERSONALES.map((campo) => watch(campo)),
        email.split('@')[0],
    ]

    // Mensajes del servidor (pueden ser varios). Los errores de longitud / solo números del
    // formulario ya se ven en la guía en vivo, así que aquí solo se muestra "campo obligatorio".
    const errorPassword = errors.password
    let mensajesPassword = []
    if (errorPassword?.type === 'server') {
        mensajesPassword = errorPassword.mensajes?.length ? errorPassword.mensajes : [errorPassword.message]
    } else if (errorPassword?.type === 'required' || (errorPassword && !password)) {
        mensajesPassword = [errorPassword.message]
    }

    return (
        <>
            <section className="mb-6 relative">
                <Input {...register('password', passwordRules)} type="password" placeholder="Contraseña" />
                <PasswordRequirements password={password} datosPersonales={datosPersonales} />
                {mensajesPassword.length > 0 && (
                    <ul className="mt-1 ml-1 text-[10px] leading-4 text-[#a22] font-medium" role="alert">
                        {mensajesPassword.map((mensaje) => <li key={mensaje}>{mensaje}</li>)}
                    </ul>
                )}
            </section>
            <section className="mb-6 relative">
                <Input {...register('passwconf', passwordConfirmRules(watch))} type="password" placeholder="Confirmar contraseña" />
                <FieldError message={errors.passwconf?.message} />
            </section>
        </>
    )
}
