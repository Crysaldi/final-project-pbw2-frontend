import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, RotateCcw, Send, Trophy } from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import PageHeader from '../../components/PageHeader'
import { getErrorMessage } from '../../utils/format'
import { btnOutline, btnPrimary } from '../../utils/ui'

export default function QuizDetail() {
  const { id } = useParams()
  // key memastikan state jawaban ter-reset saat pindah kuis
  return <QuizRunner key={id} id={id} />
}

function resultMessage(percentage) {
  if (percentage >= 80) return 'Luar biasa! Pemahamanmu sudah sangat baik.'
  if (percentage >= 60) return 'Bagus! Sedikit lagi untuk hasil yang maksimal.'
  return 'Terus belajar, coba baca artikel terkait lalu ulangi kuis ini.'
}

function QuizRunner({ id }) {
  const { user } = useAuth()
  const { data: quiz, loading, error } = useApi(`/quizzes/${id}`)

  const [answers, setAnswers] = useState({}) // { [questionId]: answerOptionId }
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)

  if (loading) return <Loading />

  if (error || !quiz) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Kuis tidak ditemukan" backTo="/quizzes" backLabel="Semua kuis" />
        <ErrorAlert message={error || 'Kuis tidak tersedia.'} />
      </div>
    )
  }

  const questions = quiz.questions ?? []
  const answeredCount = questions.filter((q) => answers[q.id]).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!allAnswered) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const payload = {
        answers: questions.map((q) => ({ questionId: q.id, answerOptionId: answers[q.id] })),
      }
      const res = await axiosInstance.post(`/quizzes/${id}/attempts`, payload)
      setResult(res.data.data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Gagal mengirim jawaban. Coba lagi.'))
    } finally {
      setSubmitting(false)
    }
  }

  function handleRetry() {
    setAnswers({})
    setResult(null)
    setSubmitError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Trophy size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Kuis Selesai</h1>
          <p className="text-gray-500 mt-1">{quiz.title}</p>

          <p className="mt-6 text-5xl font-bold text-emerald-600">{result.percentage}%</p>
          <p className="mt-2 text-gray-700">
            Skor {result.score} dari {result.totalPoints} poin
          </p>
          <p className="mt-4 text-sm text-gray-600">{resultMessage(result.percentage)}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={handleRetry} className={btnPrimary}>
              <RotateCcw size={18} />
              Coba Lagi
            </button>
            <Link to="/my-attempts" className={btnOutline}>
              Riwayat Kuis
            </Link>
            <Link to="/quizzes" className={btnOutline}>
              Kuis Lainnya
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        title={quiz.title}
        subtitle={quiz.description}
        backTo="/quizzes"
        backLabel="Semua kuis"
      />

      {!user && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded text-sm">
          Kamu perlu{' '}
          <Link to="/login" className="font-medium underline">
            login
          </Link>{' '}
          untuk mengirim jawaban dan menyimpan skor.
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-gray-500">Kuis ini belum memiliki pertanyaan.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-4 bg-gray-50/95 backdrop-blur">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>
                Terjawab {answeredCount} dari {questions.length}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-5">
            {questions.map((q, index) => (
              <fieldset key={q.id} className="bg-white rounded-lg shadow p-6">
                <legend className="sr-only">Pertanyaan {index + 1}</legend>
                <p className="font-medium text-gray-800 mb-4">
                  <span className="text-emerald-600 mr-2">{index + 1}.</span>
                  {q.questionText}
                  {q.points > 1 && (
                    <span className="ml-2 text-xs text-gray-500">({q.points} poin)</span>
                  )}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${
                          selected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={opt.id}
                          checked={selected}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                          className="mt-1 accent-emerald-600"
                        />
                        <span className="text-gray-700">{opt.optionText}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-6">
            <ErrorAlert message={submitError} />
            {user ? (
              <button type="submit" disabled={!allAnswered || submitting} className={btnPrimary}>
                {allAnswered ? <Send size={18} /> : <CheckCircle2 size={18} />}
                {submitting
                  ? 'Mengirim...'
                  : allAnswered
                    ? 'Kirim Jawaban'
                    : 'Jawab semua pertanyaan dulu'}
              </button>
            ) : (
              <Link to="/login" className={btnPrimary}>
                Login untuk Mengirim
              </Link>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
