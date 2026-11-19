import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-600">
          <Home size={22} />
          <span>SDG7Learn</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/articles" className="text-gray-700 hover:text-emerald-600">
            Artikel
          </Link>
          <Link to="/quizzes" className="text-gray-700 hover:text-emerald-600">
            Kuis
          </Link>
          <Link to="/forums" className="text-gray-700 hover:text-emerald-600">
            Forum
          </Link>

          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-gray-700 hover:text-emerald-600 font-medium">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-700 hover:text-emerald-600"
              >
                <User size={18} />
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-emerald-600 border border-emerald-600 rounded hover:bg-emerald-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}