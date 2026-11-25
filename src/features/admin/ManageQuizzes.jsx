import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Save,
  ClipboardList,
  CheckCircle2,
  X,
} from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'
import useApi from '../../hooks/useApi'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { formatDate, getErrorMessage } from '../../utils/format'
import { btnDanger, btnOutline, btnPrimary, btnSmall, container, inputClass } from '../../utils/ui'

export default function ManageQuizzes() {
  const { data: quizzes, loading, error, reload } = useApi('/quizzes')
  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit' | 'detail', quiz? }
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function handleDelete(quiz) {
    if (!window.confirm(`Hapus kuis "${quiz.title}" beserta semua percobaannya?`)) return
    setActionError('')
    setBusyId(quiz.id)
    try {
      await axiosInstance.delete(`/quizzes/${quiz.id}`)
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menghapus kuis.'))
    } finally {
      setBusyId(null)
    }
  }

  function handleSaved() {
    setModal(null)
    reload()
  }

  const list = quizzes ?? []

  return (
    <div className={container}>
      <PageHeader
        title="Kelola Kuis"
        subtitle="Buat kuis pilihan ganda untuk pengguna."
        backTo="/admin"
        backLabel="Dashboard"
        action={
          <button type="button" onClick={() => setModal({ mode: 'create' })} className={btnPrimary}>
            <Plus size={18} />
            Buat Kuis
          </button>
        }
      />

      <ErrorAlert message={error || actionError} />

      {loading && !quizzes ? (
        <Loading />
      ) : list.length === 0 ? (
        !error && <EmptyState icon={ClipboardList} title="Belum ada kuis terpublikasi" />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Pertanyaan</th>
                <th className="px-4 py-3 font-medium">Percobaan</th>
                <th className="px-4 py-3 font-medium">Dibuat</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((q) => (
                <tr key={q.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{q.title}</p>
                    {q.description && (
                      <p className="text-xs text-gray-500 line-clamp-1">{q.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{q._count?.questions ?? 0}</td>
                  <td className="px-4 py-3 text-gray-700">{q._count?.attempts ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(q.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link to={`/quizzes/${q.id}`} className={btnSmall} target="_blank">
                        <Eye size={14} />
                        Lihat
                      </Link>
                      <button
                        type="button"
                        className={btnSmall}
                        onClick={() => setModal({ mode: 'detail', quiz: q })}
                      >
                        Kunci Jawaban
                      </button>
                      <button
                        type="button"
                        className={btnSmall}
                        onClick={() => setModal({ mode: 'edit', quiz: q })}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${btnDanger} text-sm`}
                        disabled={busyId === q.id}
                        onClick={() => handleDelete(q)}
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
        <Modal title="Buat Kuis Baru" onClose={() => setModal(null)} wide>
          <QuizCreateForm onSaved={handleSaved} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.mode === 'edit' && (
        <Modal title="Edit Kuis" onClose={() => setModal(null)}>
          <QuizEditForm quiz={modal.quiz} onSaved={handleSaved} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.mode === 'detail' && (
        <Modal title={`Kunci Jawaban: ${modal.quiz.title}`} onClose={() => setModal(null)} wide>
          <QuizAnswerKey quizId={modal.quiz.id} />
        </Modal>
      )}
    </div>
  )
}

/* ---------- Edit metadata (judul, deskripsi, status) ---------- */

function QuizEditForm({ quiz, onSaved, onCancel }) {
  const [title, setTitle] = useState(quiz.title)
  const [description, setDescription] = useState(quiz.description ?? '')
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await axiosInstance.patch(`/quizzes/${quiz.id}`, {
        title: title.trim(),
        description: description.trim(),
        published,
      })
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyimpan kuis.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert message={error} />

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
        <span className="text-sm text-gray-700">Deskripsi</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="accent-emerald-600"
        />
        Terpublikasi
      </label>
      <p className="mt-1 mb-6 text-xs text-gray-500">
        Kuis yang di-unpublish akan hilang dari daftar ini dan dari halaman publik.
      </p>

      <p className="mb-6 text-xs text-gray-500">
        Pertanyaan dan opsi jawaban tidak dapat diubah setelah kuis dibuat.
      </p>

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

/* ---------- Kunci jawaban ---------- */

function QuizAnswerKey({ quizId }) {
  const { data: quiz, loading, error } = useApi(`/quizzes/admin/${quizId}`)

  if (loading) return <Loading />
  if (error) return <ErrorAlert message={error} className="" />

  return (
    <div className="space-y-5">
      {quiz.questions.map((q, i) => (
        <div key={q.id}>
          <p className="font-medium text-gray-800">
            {i + 1}. {q.questionText}
            <span className="ml-2 text-xs text-gray-500">({q.points} poin)</span>
          </p>
          <ul className="mt-2 space-y-1">
            {q.options.map((o) => (
              <li
                key={o.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                  o.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700'
                }`}
              >
                {o.isCorrect ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-4 shrink-0" />
                )}
                {o.optionText}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/* ---------- Buat kuis baru (dengan pertanyaan) ---------- */

const newOption = (isCorrect = false) => ({ optionText: '', isCorrect })
const newQuestion = () => ({
  questionText: '',
  points: 1,
  options: [newOption(true), newOption(false)],
})

function QuizCreateForm({ onSaved, onCancel }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [published, setPublished] = useState(true)
  const [questions, setQuestions] = useState(() => [newQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(qi, patch) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)))
  }

  function updateOption(qi, oi, patch) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) }
          : q
      )
    )
  }

  function setCorrect(qi, oi) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })) }
          : q
      )
    )
  }

  function addOption(qi) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi && q.options.length < 6 ? { ...q, options: [...q.options, newOption()] } : q
      )
    )
  }

  function removeOption(qi, oi) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi || q.options.length <= 2) return q
        const options = q.options.filter((_, j) => j !== oi)
        if (!options.some((o) => o.isCorrect)) options[0] = { ...options[0], isCorrect: true }
        return { ...q, options }
      })
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, newQuestion()])
  }

  function removeQuestion(qi) {
    setQuestions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== qi)))
  }

  function validate() {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText.trim()) return `Pertanyaan ${i + 1} belum diisi.`
      if (q.options.some((o) => !o.optionText.trim())) {
        return `Semua opsi pada pertanyaan ${i + 1} harus diisi.`
      }
      if (q.options.filter((o) => o.isCorrect).length !== 1) {
        return `Pertanyaan ${i + 1} harus memiliki tepat satu jawaban benar.`
      }
    }
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const message = validate()
    if (message) {
      setError(message)
      return
    }
    setError('')
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        published,
        questions: questions.map((q, qi) => ({
          questionText: q.questionText.trim(),
          order: qi + 1,
          points: Math.max(1, Number(q.points) || 1),
          options: q.options.map((o, oi) => ({
            optionText: o.optionText.trim(),
            isCorrect: o.isCorrect,
            order: oi + 1,
          })),
        })),
      }
      if (description.trim()) payload.description = description.trim()
      await axiosInstance.post('/quizzes', payload)
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal membuat kuis.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert message={error} />

      <label className="block mb-4">
        <span className="text-sm text-gray-700">Judul Kuis</span>
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
        <span className="text-sm text-gray-700">Deskripsi</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={1000}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="accent-emerald-600"
        />
        Langsung publikasikan
      </label>
      <p className="mt-1 mb-6 text-xs text-gray-500">
        Kuis yang tidak dipublikasikan tidak akan tampil di daftar kuis.
      </p>

      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800">Pertanyaan {qi + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Hapus pertanyaan ${qi + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <textarea
              value={q.questionText}
              onChange={(e) => updateQuestion(qi, { questionText: e.target.value })}
              rows={2}
              className={`${inputClass} mt-0 bg-white`}
              placeholder="Tulis pertanyaan..."
            />

            <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
              Poin
              <input
                type="number"
                min={1}
                value={q.points}
                onChange={(e) => updateQuestion(qi, { points: e.target.value })}
                className="w-20 px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>

            <p className="mt-4 mb-2 text-xs text-gray-500">
              Pilih tombol di kiri untuk menandai jawaban yang benar.
            </p>
            <div className="space-y-2">
              {q.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={o.isCorrect}
                    onChange={() => setCorrect(qi, oi)}
                    className="accent-emerald-600"
                    aria-label={`Jawaban benar: opsi ${oi + 1}`}
                  />
                  <input
                    type="text"
                    value={o.optionText}
                    onChange={(e) => updateOption(qi, oi, { optionText: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={`Opsi ${oi + 1}`}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qi, oi)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={`Hapus opsi ${oi + 1}`}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {q.options.length < 6 && (
              <button
                type="button"
                onClick={() => addOption(qi)}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                + Tambah opsi
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={addQuestion} className={`${btnOutline} mt-5`}>
        <Plus size={16} />
        Tambah Pertanyaan
      </button>

      <div className="flex justify-end gap-2 mt-8 pt-5 border-t border-gray-200">
        <button type="button" onClick={onCancel} className={btnSmall}>
          Batal
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          <Save size={18} />
          {saving ? 'Menyimpan...' : 'Simpan Kuis'}
        </button>
      </div>
    </form>
  )
}
