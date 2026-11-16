import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { registerUser } from '../services/authService'
import { formatRegisterData } from '../utils/formatRegisterData'
import { AGRO_COLORS } from '../utils/agroConstants'

export function useRegisterForm(options = {}) {
    const { successPath = '/', successTitle, successText } = options
    const form = useForm({ mode: 'onChange' })
    const { handleSubmit, reset, setError: setFieldError } = form

    // Lleva cada error del backend al campo correspondiente del formulario.
    const aplicarErroresDeCampo = (fieldErrors) => {
        if (!fieldErrors) return false
        let aplicados = false
        Object.entries(fieldErrors).forEach(([campo, mensajes]) => {
            const lista = Array.isArray(mensajes) ? mensajes : [mensajes]
            const texto = lista.filter((m) => typeof m === 'string').join(' ')
            if (texto) {
                setFieldError(campo, { type: 'server', message: texto, mensajes: lista })
                aplicados = true
            }
        })
        return aplicados
    }
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const onSubmit = async (data) => {
        setLoading(true)
        setError(null)
        try {
            const payload = formatRegisterData(data)
            const result = await registerUser(payload)
            console.log('Usuario registrado:', result)
            reset()
            Swal.fire({
                icon: 'success',
                title: successTitle || '¡Registro exitoso!',
                text: successText || 'Tu usuario fue registrado correctamente.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            }).then(() => navigate(successPath, { replace: true }))
        } catch (e) {
            const hayErroresDeCampo = aplicarErroresDeCampo(e.fieldErrors)
            setError(hayErroresDeCampo ? 'Revisa los campos marcados en rojo.' : e.message)
            console.error('Error en la petición:', e)
        } finally {
            setLoading(false)
        }
    }

    const onError = (errors) => {
        console.log('Errores de validación:', errors)
    }

    return {
        ...form,
        loading,
        error,
        submitRegister: handleSubmit(onSubmit, onError)
    }
}