import { Input } from '../../../components/formElements/Input'
import { FieldError } from './FieldError'
import { nameFieldRules } from '../../../utils/validationRules'

export function NameFields({ register, errors }) {
    return (
        <div className="box-border grid grid-cols-[49%_49%] gap-x-1.25">
            <div className="relative mb-4">
                <Input
                    {...register('primer_nombre', nameFieldRules({ required: true }))}
                    type="text"
                    placeholder="Primer Nombre"
                    additionalClass="fst-name"
                />
                <FieldError message={errors.primer_nombre?.message} />
            </div>
            <div className="relative mb-4">
                <Input
                    {...register('segundo_nombre', nameFieldRules({ minLength: 3 }))}
                    type="text"
                    placeholder="Segundo Nombre"
                />
                <FieldError message={errors.segundo_nombre?.message} />
            </div>
            <div className="relative mb-4">
                <Input
                    {...register('primer_apellido', nameFieldRules({ required: true, minLength: 3 }))}
                    type="text"
                    placeholder="Primer Apellido"
                />
                <FieldError message={errors.primer_apellido?.message} />
            </div>
            <div className="relative mb-4">
                <Input
                    {...register('segundo_apellido', nameFieldRules({ minLength: 3 }))}
                    type="text"
                    placeholder="Segundo Apellido"
                />
                <FieldError message={errors.segundo_apellido?.message} />
            </div>
        </div>
    )
}