import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Save, ClipboardList, Mail, Calendar } from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/Avatar'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import { formatDate, getErrorMessage } from '../../utils/format'
import { btnOutline, btnPrimary, inputClass } from '../../utils/ui'

export default function Profile() {
  const { data: me, loading, error } = useApi('/auth/me')

  if (loading && !me) return <Loading />
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ErrorAlert message={error} />
      </div>
    )
  }

  return <ProfileForm me={me} />
}

function ProfileForm({ me }) {
  const { user, token, login } = useAuth()
  const [name, setName] = useState(me.name || '')
  const [avatar, setAvatar] = useState(me.avatar || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [current, setCurrent] = useState(me)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Backend memvalidasi avatar sebagai URL, jadi kirim hanya jika terisi.
    const payload = { name: name.trim() }
    if (avatar.trim()) payload.avatar = avatar.trim()

    setSaving(true)
    try {
      const res = await axiosInstance.patch('/users/me', payload)
      const updated = res.data.data
      setCurrent((prev) => ({ ...prev, ...updated }))
      // Sinkronkan nama di Navbar / localStorage.
      login(token, { ...user, name: updated.name })
      setSuccess('Profil berhasil diperbarui.')
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memperbarui profil.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>

      <div className="bg-white rounded-lg shadow p-6 flex flex-wrap items-center gap-5 mb-6">
        <Avatar name={current.name} src={current.avatar} size={72} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 truncate">{current.name}</h2>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                current.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {current.role === 'ADMIN' ? 'Admin' : 'Pengguna'}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} />
            {current.email}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            Bergabung {formatDate(current.createdAt)}
          </p>
        </div>
        <Link to="/my-attempts" className={`${btnOutline} ml-auto`}>
          <ClipboardList size={18} />
          Riwayat Kuis
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Profil</h2>

        <ErrorAlert message={error} />
        {success && (
          <p className="mb-4 p-3 bg-emerald-100 text-emerald-700 rounded text-sm">{success}</p>
        )}

        <label className="block mb-4">
          <span className="text-sm text-gray-700">Nama</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className={inputClass}
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm text-gray-700">URL Foto Profil</span>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className={inputClass}
            placeholder="https://contoh.com/foto.jpg"
          />
        </label>

        <button type="submit" disabled={saving} className={btnPrimary}>
          <Save size={18} />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}
