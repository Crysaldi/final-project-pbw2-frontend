import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home from './features/home/Home'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Profile from './features/auth/Profile'

import Articles from './features/article/Articles'
import ArticleDetail from './features/article/ArticleDetail'

import Quizzes from './features/quiz/Quizzes'
import QuizDetail from './features/quiz/QuizDetail'
import MyAttempts from './features/quiz/MyAttempts'

import Forums from './features/forum/Forums'
import ForumDetail from './features/forum/ForumDetail'

import Dashboard from './features/admin/Dashboard'
import ManageArticles from './features/admin/ManageArticles'
import ManageQuizzes from './features/admin/ManageQuizzes'
import ManageForums from './features/admin/ManageForums'
import ManageUsers from './features/admin/ManageUsers'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Publik */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quizzes/:id" element={<QuizDetail />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/forums/:slug" element={<ForumDetail />} />

          {/* Butuh login */}
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/my-attempts"
            element={<ProtectedRoute><MyAttempts /></ProtectedRoute>}
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={<AdminRoute><Dashboard /></AdminRoute>}
          />
          <Route
            path="/admin/articles"
            element={<AdminRoute><ManageArticles /></AdminRoute>}
          />
          <Route
            path="/admin/quizzes"
            element={<AdminRoute><ManageQuizzes /></AdminRoute>}
          />
          <Route
            path="/admin/forums"
            element={<AdminRoute><ManageForums /></AdminRoute>}
          />
          <Route
            path="/admin/users"
            element={<AdminRoute><ManageUsers /></AdminRoute>}
          />
        </Routes>
      </main>
    </div>
  )
}