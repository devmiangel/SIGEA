import logo_sigea from '../../assets/img/logo_sigea.png'
import titulo from '../../assets/img/letras_sigea.png'
import { Input } from '../../components/formElements/Input'
import { NavLink } from '../../components/formElements/NavLink'
import { SubmitButton } from '../../components/formElements/SubmitButton'
import { useRegisterForm } from '../../hooks/useRegisterForm'
import { emailRules } from '../../utils/validationRules'
import { NameFields } from './components/NameFields'
import { DocumentFields } from './components/DocumentFields'
import { PasswordFields } from './components/PasswordFields'
import { FieldError } from './components/FieldError'

export default function Register() {
    const { register, control, watch, formState: { errors }, loading, error, submitRegister } = useRegisterForm()

    return (
        <div className="min-h-screen flex flex-col lg:flex-row justify-center items-center w-full p-5 lg:gap-24 gap-0.5 bg-[#fdfcf8]">
            <div className="flex flex-col lg:max-w-62.5 max-w-30 mt-5 sticky top-40">
                <img src={logo_sigea} alt="" />
                <img src={titulo} alt="" />
            </div>

            <div className="my-6 flex flex-col min-w-[30%] max-h-[90vh]">
                <h2 className="mx-auto text-[#015d3b] text-2xl font-bold">Regístrate</h2>
                <form onSubmit={submitRegister}>
                    <NameFields register={register} errors={errors} />

                    <section className="mb-6 relative">
                        <Input {...register('email', emailRules)} placeholder="Correo" />
                        <FieldError message={errors.email?.message} />
                    </section>

                    <DocumentFields register={register} control={control} errors={errors} />
                    <PasswordFields register={register} errors={errors} watch={watch} />

                    <div>
                        <SubmitButton text="Registrarse" disabled={loading} />
                    </div>

                    {error && (
                        <p className="text-[#a22] text-[10px] text-center mt-2">{error}</p>
                    )}

                    <NavLink href="/">
                        ¿Ya tienes cuenta? <strong>ingresa al aplicativo con tus credenciales</strong>
                    </NavLink>
                </form>
            </div>
        </div>
    )
}