import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import { AGRO_COLORS } from '../utils/agroConstants'
import { registerUser } from '../services/authService'
import { getUsuario, actualizarUsuario } from '../services/agroService'
import { formatRegisterData } from '../utils/formatRegisterData'

export function useUserForm(usuarioId) {
    const esEdicion = Boolean(usuarioId)
    const navigate = useNavigate()
    const form = useForm({ mode: 'onChange' })
    const { handleSubmit, reset } = form
    const [loading, setLoading] = useState(esEdicion)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const cargarUsuario = useCallback(async () => {
        if (!esEdicion) return
        setLoading(true)
        setError(null)
        try {
            const user = await getUsuario(usuarioId)
            const p = user?.persona_info ?? {}
            reset({
                primer_nombre: p.primer_nombre ?? '',
                segundo_nombre: p.segundo_nombre ?? '',
                primer_apellido: p.primer_apellido ?? '',
                segundo_apellido: p.segundo_apellido ?? '',
                email: user?.email ?? '',
                TipoDocumento: p.TipoDocumento_info
                    ? { value: p.TipoDocumento_info.id, label: p.TipoDocumento_info.TipoDocumento }
                    : null,
                numero_documento: p.numero_documento ?? '',
                fecha_nacimiento: p.fecha_nacimiento ? dayjs(p.fecha_nacimiento) : null,
                Estado: user?.Estado ? 'true' : 'false',
                rol: user?.rol ?? 'Usuarios',
                es_conductor: Boolean(user?.es_conductor),
                licencia: user?.licencia ?? '',
            })
        } catch {
            setError('No se pudo cargar la información del usuario.')
        } finally {
            setLoading(false)
        }
    }, [esEdicion, usuarioId, reset])

    useEffect(() => { cargarUsuario() }, [cargarUsuario])

    const onSubmit = async (data) => {
        setSaving(true)
        setError(null)
        try {
            const base = {
                ...data,
                TipoDocumento: data.TipoDocumento?.value,
                fecha_nacimiento: Array.isArray(data.fecha_nacimiento)
                    ? data.fecha_nacimiento[0].format('YYYY-MM-DD')
                    : data.fecha_nacimiento?.format('YYYY-MM-DD'),
            }

            if (esEdicion) {
                const { email, password, Estado, rol, es_conductor, licencia } = base
                const payload = {
                    email,
                    Estado: Estado === 'true',
                    rol,
                    es_conductor: Boolean(es_conductor),
                    licencia: licencia || '',
                    persona: {
                        primer_nombre: base.primer_nombre,
                        segundo_nombre: base.segundo_nombre,
                        primer_apellido: base.primer_apellido,
                        segundo_apellido: base.segundo_apellido,
                        numero_documento: base.numero_documento,
                        TipoDocumento: base.TipoDocumento,
                        fecha_nacimiento: base.fecha_nacimiento,
                    },
                }
                if (password) payload.password = password

                await actualizarUsuario(usuarioId, payload)
                Swal.fire({
                    icon: 'success',
                    title: 'Usuario actualizado',
                    text: 'La información del usuario fue actualizada correctamente.',
                    confirmButtonColor: AGRO_COLORS.success,
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                }).then(() => navigate('/administrador/usuarios'))
            } else {
                await registerUser(formatRegisterData(base))
                Swal.fire({
                    icon: 'success',
                    title: 'Usuario creado',
                    text: 'El usuario fue registrado correctamente en el sistema.',
                    confirmButtonColor: AGRO_COLORS.success,
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                }).then(() => navigate('/administrador/usuarios'))
            }
        } catch (e) {
            setError(e?.message || 'No se pudo guardar el usuario.')
            console.error('Error al guardar el usuario:', e)
        } finally {
            setSaving(false)
        }
    }

    const onError = (errors) => {
        console.log('Errores de validación:', errors)
    }

    return {
        ...form,
        esEdicion,
        loading,
        saving,
        error,
        submitRegister: handleSubmit(onSubmit, onError),
    }
}