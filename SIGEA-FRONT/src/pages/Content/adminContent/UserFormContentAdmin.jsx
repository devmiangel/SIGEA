import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import Select from 'react-select'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import EditIcon from '@mui/icons-material/Edit'
import { Header } from "../../../components/Tettles-Buttons/Title"
import { useUserForm } from '../../../hooks/useUserForm'
import {
    nameFieldRules,
    emailRules,
    documentNumberRules,
    passwordRules,
    passwordConfirmRules,
} from '../../../utils/validationRules'
import { AGRO_COLORS } from '../../../utils/agroConstants'
import { API_BASE_URL } from '../../../services/api'
import OtherCalendar from '../../../components/calendar/OtherCalendar'

const INPUT_CLASE = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"

const ROLES = ['Administradores', 'Funcionarios', 'Productores', 'Usuarios']

const SELECT_STYLES = {
    control: (base) => ({
        ...base,
        borderColor: '#015d3b',
        borderRadius: '0.5rem',
        minHeight: '38px',
        boxShadow: 'none',
        fontSize: '14px',
        '&:hover': { borderColor: '#015d3b' },
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '14px' }),
    indicatorSeparator: () => ({ display: 'none' }),
}

function CampoRegistro({ label, required = false, error, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    )
}

const passwordEditRules = {
    validate: (val) => !val || val.length >= 6 || 'Mínimo 6 caracteres',
}

function passwordConfirmEditRules(watch) {
    return {
        validate: (val) => {
            if (!watch('password')) return true
            return watch('password') === val || 'Las contraseñas no coinciden'
        },
    }
}

export default function UserFormContentAdmin() {
    const navigate = useNavigate()
    const { usuarioId } = useParams()
    const {
        register,
        control,
        watch,
        formState: { errors },
        esEdicion,
        loading,
        saving,
        error,
        submitRegister,
    } = useUserForm(usuarioId)

    const [tiposDocumento, setTiposDocumento] = useState([])

    useEffect(() => {
        let activo = true
        fetch(`${API_BASE_URL}/usuarios/tiposDocumentos/`)
            .then((res) => res.json())
            .then((data) => {
                if (activo) {
                    setTiposDocumento(data.map((item) => ({ value: item.id, label: item.TipoDocumento })))
                }
            })
            .catch(() => {})
        return () => { activo = false }
    }, [])

    return (
        <div className="w-full max-w-full flex flex-col items-center">
            <Header
                componentLogo={
                    esEdicion
                        ? <EditIcon sx={{ fontSize: 40, color: "ActiveCaption" }} />
                        : <GroupAddIcon sx={{ fontSize: 40, color: "ActiveCaption" }} />
                }
                headerText={esEdicion ? 'Edición de usuario' : 'Registro de usuario'}
                message={esEdicion
                    ? 'Modifica la información y el rol del usuario seleccionado'
                    : 'Crea un nuevo usuario en el sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                        {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {esEdicion
                            ? 'Los campos precargados corresponden a la información del usuario. Los campos marcados con * son obligatorios.'
                            : 'Diligencia toda la información del usuario. Los campos marcados con * son obligatorios.'}
                    </p>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando información del usuario...</p>
                ) : (
                    <form onSubmit={submitRegister} className="max-w-4xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <CampoRegistro label="Primer nombre" required error={errors.primer_nombre?.message}>
                                <input
                                    {...register('primer_nombre', nameFieldRules({ required: true }))}
                                    className={INPUT_CLASE}
                                    placeholder="Ej. Juan"
                                />
                            </CampoRegistro>

                            <CampoRegistro label="Segundo nombre" error={errors.segundo_nombre?.message}>
                                <input
                                    {...register('segundo_nombre', nameFieldRules())}
                                    className={INPUT_CLASE}
                                    placeholder="Ej. Alberto"
                                />
                            </CampoRegistro>

                            <CampoRegistro label="Primer apellido" required error={errors.primer_apellido?.message}>
                                <input
                                    {...register('primer_apellido', nameFieldRules({ required: true, minLength: 3 }))}
                                    className={INPUT_CLASE}
                                    placeholder="Ej. García"
                                />
                            </CampoRegistro>

                            <CampoRegistro label="Segundo apellido" error={errors.segundo_apellido?.message}>
                                <input
                                    {...register('segundo_apellido', nameFieldRules())}
                                    className={INPUT_CLASE}
                                    placeholder="Ej. Pérez"
                                />
                            </CampoRegistro>

                            <CampoRegistro label="Correo electrónico" required error={errors.email?.message}>
                                <input
                                    {...register('email', emailRules)}
                                    type="email"
                                    className={INPUT_CLASE}
                                    placeholder="Ej. juan@correo.com"
                                />
                            </CampoRegistro>

                            <CampoRegistro label="Tipo de documento" required error={errors.TipoDocumento?.message}>
                                <Controller
                                    name="TipoDocumento"
                                    control={control}
                                    rules={{ required: 'Campo obligatorio' }}
                                    render={({ field }) => (
                                        <Select
                                            options={tiposDocumento}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Seleccione..."
                                            isClearable
                                            styles={SELECT_STYLES}
                                        />
                                    )}
                                />
                            </CampoRegistro>

                            <CampoRegistro label="Número de documento" required error={errors.numero_documento?.message}>
                                <input
                                    {...register('numero_documento', documentNumberRules)}
                                    type="number"
                                    className={INPUT_CLASE}
                                    placeholder="Ej. 123456789"
                                />
                            </CampoRegistro>

                            <CampoRegistro label="Fecha de nacimiento" required error={errors.fecha_nacimiento?.message}>
                                <Controller
                                    name="fecha_nacimiento"
                                    control={control}
                                    defaultValue={null}
                                    rules={{ required: 'Campo obligatorio' }}
                                    render={({ field }) => (
                                        <OtherCalendar
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Seleccione..."
                                        />
                                    )}
                                />
                            </CampoRegistro>

                            {esEdicion && (
                                <>
                                    <CampoRegistro label="Estado" required error={errors.Estado?.message}>
                                        <select {...register('Estado')} className={INPUT_CLASE}>
                                            <option value="true">Activo</option>
                                            <option value="false">Inactivo</option>
                                        </select>
                                    </CampoRegistro>

                                    <CampoRegistro label="Rol" required error={errors.rol?.message}>
                                        <select {...register('rol')} className={INPUT_CLASE}>
                                            {ROLES.map((rol) => (
                                                <option key={rol} value={rol}>{rol}</option>
                                            ))}
                                        </select>
                                    </CampoRegistro>
                                </>
                            )}

                            <CampoRegistro
                                label="Contraseña"
                                required={!esEdicion}
                                error={errors.password?.message}
                            >
                                <input
                                    {...register('password', esEdicion ? passwordEditRules : passwordRules)}
                                    type="password"
                                    className={INPUT_CLASE}
                                    placeholder={esEdicion ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
                                />
                            </CampoRegistro>

                            <CampoRegistro
                                label="Confirmar contraseña"
                                required={!esEdicion}
                                error={errors.passwconf?.message}
                            >
                                <input
                                    {...register('passwconf', esEdicion ? passwordConfirmEditRules(watch) : passwordConfirmRules(watch))}
                                    type="password"
                                    className={INPUT_CLASE}
                                    placeholder="Repite la contraseña"
                                />
                            </CampoRegistro>
                        </div>

                        {error && (
                            <p className="mt-4 px-3 py-2 rounded-md bg-red-50 text-red-600 text-sm">{error}</p>
                        )}

                        <div className="pt-4 border-t border-gray-100 mt-6 flex flex-wrap justify-between items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/administrador/usuarios')}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Guardando...' : esEdicion ? 'Actualizar usuario' : 'Registrar usuario'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}