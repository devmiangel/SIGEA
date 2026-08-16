import { Controller } from 'react-hook-form'
import { Input } from '../../../components/formElements/Input'
import Selection from '../../../components/selecComponent/Selectstyling'
import OtherCalendar from '../../../components/calendar/OtherCalendar'
import { FieldError } from './FieldError'
import { API_BASE_URL } from '../../../services/api'
import { documentNumberRules } from '../../../utils/validationRules'

export function DocumentFields({ register, control, errors }) {
    return (
        <>
            <section className="mb-6">
                <Controller
                    name="TipoDocumento"
                    control={control}
                    rules={{ required: 'Campo obligatorio' }}
                    render={({ field }) => (
                        <Selection
                            value={field.value}
                            url={`${API_BASE_URL}/usuarios/tiposDocumentos/`}
                            placeholder="Tipos de Documento"
                            labelKey="TipoDocumento"
                            onChange={field.onChange}
                        />
                    )}
                />
            </section>

            <section className="mb-6 relative">
                <Input
                    {...register('numero_documento', documentNumberRules)}
                    type="number"
                    placeholder="Documento"
                />
                <FieldError message={errors.numero_documento?.message} />
            </section>

            <section className="mb-6">
                <Controller
                    name="fecha_nacimiento"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => (
                        <OtherCalendar
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Fecha Nacimiento"
                        />
                    )}
                />
            </section>
        </>
    )
}