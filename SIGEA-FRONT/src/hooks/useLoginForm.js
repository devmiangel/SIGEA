import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loginService } from '../services/authService'
import { getRouteByRole } from '../utils/roleRedirect'
import { useCurrentDataUser } from './currentUserHook'

export function useLoginForm() {
    const navigate = useNavigate()
    const { login } = useCurrentDataUser()
    const form = useForm({ mode: 'onChange' })
    const { handleSubmit, reset } = form
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const onSubmit = async (data) => {
        setLoading(true)
        setErrorMsg('')
        try {
            const result = await loginService(data)
            login(result.user, result.token)
            reset()
            navigate(getRouteByRole(result.user.rol))
        } catch (error) {
            setErrorMsg(error.message || 'Error al iniciar sesión')
            console.error('Error en la petición:', error)
        } finally {
            setLoading(false)
        }
    }

    return {
        ...form,
        loading,
        errorMsg,
        submitLogin: handleSubmit(onSubmit)
    }
}