import { Input } from '../../../components/formElements/Input'
import { FieldError } from './FieldError'
import { passwordRules, passwordConfirmRules } from '../../../utils/validationRules'

export function PasswordFields({ register, errors, watch }) {
    return (
        <>
            <section className="mb-6 relative">
                <Input {...register('password', passwordRules)} type="password" placeholder="Contraseña" />
                <FieldError message={errors.password?.message} />
            </section>
            <section className="mb-6 relative">
                <Input {...register('passwconf', passwordConfirmRules(watch))} type="password" placeholder="Confirmar contraseña" />
                <FieldError message={errors.passwconf?.message} />
            </section>
        </>
    )
}