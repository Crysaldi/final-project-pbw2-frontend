import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

    async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axiosInstance.post('/auth/login', { email, password })
      const { user, token } = res.data.data
      login(token, user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-emerald-600">
          Login SDG7Learn
        </h1>

        {error && (
          <p className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </p>
        )}

        <label className="block mb-4">
          <span className="text-sm text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="admin@sdg7learn.local"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          <LogIn size={18} />
          {loading ? 'Memproses...' : 'Login'}
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="text-emerald-600 hover:underline">
            Daftar
          </Link>
        </p>
      </form>
    </div>
  )
}