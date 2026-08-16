import logo_sigea from '../../assets/img/logo_sigea.png'
import titulo from '../../assets/img/letras_sigea.png'
import { Input } from '../../components/formElements/Input'
import { NavLink } from '../../components/formElements/NavLink'
import { SubmitButton } from '../../components/formElements/SubmitButton'
import { useLoginForm } from '../../hooks/useLoginForm'
import { emailRules, passwordRules } from '../../utils/validationRules'
import { FieldError } from './components/FieldError'

export default function Login() {
    const { register, formState: { errors }, loading, errorMsg, submitLogin } = useLoginForm()

    return (
        <div className="flex flex-col md:flex-row justify-center items-center min-h-screen w-full p-0 md:gap-24 gap-3 bg-[#fdfcf8]">
            <div className="flex flex-col md:max-w-62.5 max-w-30">
                <img src={logo_sigea} alt="" />
                <img src={titulo} alt="" />
            </div>

            <div className="my-1 flex flex-col min-w-[30%]">
                <h2 className="mx-auto text-[#015d3b] text-2xl font-bold">Iniciar Sesión</h2>
                <form onSubmit={submitLogin}>
                    <section className="mb-6 relative">
                        <Input {...register('email', emailRules)} placeholder="Correo" />
                        <FieldError message={errors.email?.message} />
                        <NavLink href="https://google.com">Olvidaste tu correo</NavLink>
                    </section>

                    <section className="mb-6 relative">
                        <Input {...register('password', passwordRules)} type="password" placeholder="contraseña" autoComplete="password" />
                        <FieldError message={errors.password?.message} />
                        <NavLink href="https://google.com">Olvidaste tu contraseña</NavLink>
                    </section>

                    <SubmitButton text="Iniciar sesion" disabled={loading} />

                    <NavLink href="/registro">
                        no tienes cuenta? <strong>Registrate</strong>
                    </NavLink>

                    {errorMsg && (
                        <div className="flex justify-center items-center w-full mt-4">
                            <div className="text-red-600 text-sm text-center">{errorMsg}</div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}