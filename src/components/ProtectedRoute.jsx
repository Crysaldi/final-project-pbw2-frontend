import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}