import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Save, Eye, MessagesSquare } from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'
import useApi from '../../hooks/useApi'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { formatDate, getErrorMessage } from '../../utils/format'
import { btnPrimary, btnSmall, container, inputClass } from '../../utils/ui'

export default function ManageForums() {
  const { data: forums, loading, error, reload } = useApi('/forums')
  const [showCreate, setShowCreate] = useState(false)

  function handleSaved() {
    setShowCreate(false)
    reload()
  }

  const list = forums ?? []

  return (
    <div className={container}>
      <PageHeader
        title="Kelola Forum"
        subtitle="Buat forum diskusi. Moderasi topik dan balasan dilakukan langsung di halaman forum."
        backTo="/admin"
        backLabel="Dashboard"
        action={
          <button type="button" onClick={() => setShowCreate(true)} className={btnPrimary}>
            <Plus size={18} />
            Buat Forum
          </button>
        }
      />

      <ErrorAlert message={error} />

      {loading && !forums ? (
        <Loading />
      ) : list.length === 0 ? (
        !error && <EmptyState icon={MessagesSquare} title="Belum ada forum" />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Forum</th>
                <th className="px-4 py-3 font-medium">Topik</th>
                <th className="px-4 py-3 font-medium">Dibuat</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{f.title}</p>
                    {f.description && (
                      <p className="text-xs text-gray-500 line-clamp-1">{f.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{f._count?.posts ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(f.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link to={`/forums/${f.slug}`} className={btnSmall}>
                        <Eye size={14} />
                        Buka &amp; Moderasi
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Buat Forum Baru" onClose={() => setShowCreate(false)}>
          <ForumForm onSaved={handleSaved} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
    </div>
  )
}

function ForumForm({ onSaved, onCancel }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = { title: title.trim() }
      if (description.trim()) payload.description = description.trim()
      await axiosInstance.post('/forums', payload)
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal membuat forum.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert message={error} />

      <label className="block mb-4">
        <span className="text-sm text-gray-700">Judul Forum</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className={inputClass}
        />
      </label>

      <label className="block mb-6">
        <span className="text-sm text-gray-700">Deskripsi</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
          className={inputClass}
        />
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={btnSmall}>
          Batal
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          <Save size={18} />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
