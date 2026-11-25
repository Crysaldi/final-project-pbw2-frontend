import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, Save, FileText, Image as ImageIcon } from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'
import useApi from '../../hooks/useApi'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { formatDate, getErrorMessage } from '../../utils/format'
import { btnDanger, btnPrimary, btnSmall, container, inputClass } from '../../utils/ui'

export default function ManageArticles() {
  const { data: articles, loading, error, reload } = useApi('/articles/admin/all')
  const [modal, setModal] = useState(null) // { mode: 'create' } | { mode: 'edit', row, detail, ready }
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function openEdit(row) {
    setModal({ mode: 'edit', row, detail: null, ready: false })
    try {
      // Endpoint detail backend hanya mengembalikan artikel yang sudah dipublikasikan.
      const res = await axiosInstance.get(`/articles/${row.slug}`)
      setModal({ mode: 'edit', row, detail: res.data.data, ready: true })
    } catch {
      setModal({ mode: 'edit', row, detail: null, ready: true })
    }
  }

  async function togglePublish(row) {
    setActionError('')
    setBusyId(row.id)
    try {
      await axiosInstance.patch(`/articles/${row.id}`, { published: !row.published })
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal mengubah status artikel.'))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Hapus artikel "${row.title}"?`)) return
    setActionError('')
    setBusyId(row.id)
    try {
      await axiosInstance.delete(`/articles/${row.id}`)
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menghapus artikel.'))
    } finally {
      setBusyId(null)
    }
  }

  function handleSaved() {
    setModal(null)
    reload()
  }

  const list = articles ?? []

  return (
    <div className={container}>
      <PageHeader
        title="Kelola Artikel"
        subtitle="Tulis dan atur artikel yang tampil di halaman publik."
        backTo="/admin"
        backLabel="Dashboard"
        action={
          <button type="button" onClick={() => setModal({ mode: 'create' })} className={btnPrimary}>
            <Plus size={18} />
            Tambah Artikel
          </button>
        }
      />

      <ErrorAlert message={error || actionError} />

      {loading && !articles ? (
        <Loading />
      ) : list.length === 0 ? (
        !error && <EmptyState icon={FileText} title="Belum ada artikel" />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Dibuat</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{a.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        a.published
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {a.published ? 'Terpublikasi' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(a.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {a.published && (
                        <Link to={`/articles/${a.slug}`} className={btnSmall} target="_blank">
                          <Eye size={14} />
                          Lihat
                        </Link>
                      )}
                      <button
                        type="button"
                        className={btnSmall}
                        disabled={busyId === a.id}
                        onClick={() => togglePublish(a)}
                      >
                        {a.published ? 'Jadikan Draft' : 'Publikasikan'}
                      </button>
                      <button type="button" className={btnSmall} onClick={() => openEdit(a)}>
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${btnDanger} text-sm`}
                        disabled={busyId === a.id}
                        onClick={() => handleDelete(a)}
                      >
                        <Trash2 size={14} />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.mode === 'create' && (
        <Modal title="Tambah Artikel" onClose={() => setModal(null)} wide>
          <ArticleForm onSaved={handleSaved} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.mode === 'edit' && (
        <Modal title="Edit Artikel" onClose={() => setModal(null)} wide>
          {!modal.ready ? (
            <Loading />
          ) : (
            <>
              <ArticleForm
                article={modal.row}
                detail={modal.detail}
                onSaved={handleSaved}
                onCancel={() => setModal(null)}
              />
              <MediaPanel articleId={modal.row.id} />
            </>
          )}
        </Modal>
      )}
    </div>
  )
}

function ArticleForm({ article, detail, onSaved, onCancel }) {
  const isEdit = Boolean(article)
  const [title, setTitle] = useState(detail?.title ?? article?.title ?? '')
  const [excerpt, setExcerpt] = useState(detail?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(detail?.coverImage ?? '')
  const [content, setContent] = useState(detail?.content ?? '')
  const [published, setPublished] = useState(article?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const detailMissing = isEdit && !detail

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = { title: title.trim(), published }
    if (content.trim()) payload.content = content.trim()
    if (coverImage.trim()) payload.coverImage = coverImage.trim()
    // excerpt boleh dikosongkan jika datanya berhasil dimuat
    if (excerpt.trim() || (isEdit && detail)) payload.excerpt = excerpt.trim()

    if (!isEdit && !payload.content) {
      setError('Isi artikel wajib diisi.')
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await axiosInstance.patch(`/articles/${article.id}`, payload)
      } else {
        await axiosInstance.post('/articles', payload)
      }
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyimpan artikel.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert message={error} />
      {detailMissing && (
        <p className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded text-sm">
          Konten artikel draft tidak bisa dimuat dari server. Kolom yang dibiarkan kosong tidak akan
          diubah; isi kolom konten hanya jika ingin menggantinya.
        </p>
      )}

      <label className="block mb-4">
        <span className="text-sm text-gray-700">Judul</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className={inputClass}
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-gray-700">Ringkasan (maks. 500 karakter)</span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          maxLength={500}
          className={inputClass}
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-gray-700">URL Gambar Sampul</span>
        <input
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className={inputClass}
          placeholder="https://contoh.com/sampul.jpg"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-gray-700">Isi Artikel</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          required={!isEdit}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 mb-6 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="accent-emerald-600"
        />
        Publikasikan artikel
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

function MediaPanel({ articleId }) {
  const { data: media, loading, error, reload } = useApi(`/media/article/${articleId}`)
  const [type, setType] = useState('IMAGE')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    setActionError('')
    setSaving(true)
    try {
      await axiosInstance.post('/media', { type, title: title.trim(), url: url.trim(), articleId })
      setTitle('')
      setUrl('')
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menambahkan media.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus media ini?')) return
    setActionError('')
    try {
      await axiosInstance.delete(`/media/${id}`)
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menghapus media.'))
    }
  }

  const list = media ?? []

  return (
    <section className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
        <ImageIcon size={18} />
        Media Artikel
      </h3>

      <ErrorAlert message={error || actionError} />

      {loading && !media ? (
        <p className="text-sm text-gray-500">Memuat...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">Belum ada media.</p>
      ) : (
        <ul className="divide-y divide-gray-100 mb-4">
          {list.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <span className="text-xs px-1.5 py-0.5 mr-2 bg-gray-100 text-gray-600 rounded">
                  {m.type}
                </span>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-800 hover:text-emerald-600"
                >
                  {m.title}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="text-gray-400 hover:text-red-600"
                aria-label="Hapus media"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-[9rem_1fr_1fr_auto] items-end">
        <label className="block">
          <span className="text-xs text-gray-600">Tipe</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="IMAGE">Gambar</option>
            <option value="VIDEO">Video</option>
            <option value="INFOGRAPHIC">Infografis</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">Judul</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">URL</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className={inputClass}
            placeholder="https://..."
          />
        </label>
        <button type="submit" disabled={saving} className={btnPrimary}>
          <Plus size={16} />
          Tambah
        </button>
      </form>
    </section>
  )
}
