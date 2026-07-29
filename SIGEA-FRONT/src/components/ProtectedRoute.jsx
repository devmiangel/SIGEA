import { Navigate } from 'react-router-dom'
import { useCurrentDataUser } from '../hooks/currentUserHook'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useCurrentDataUser()

    if (loading) return null

    if (!user) return <Navigate to="/" replace />

    if (allowedRoles && !allowedRoles.includes(user.rol)) return <Navigate to="/" replace />

    return children
}
