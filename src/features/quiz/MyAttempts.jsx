import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import useApi from '../../hooks/useApi'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { formatDateTime } from '../../utils/format'
import { btnPrimary, container } from '../../utils/ui'

function percent(a) {
  return a.totalPoints > 0 ? Math.round((a.score / a.totalPoints) * 100) : 0
}

function badgeClass(p) {
  if (p >= 80) return 'bg-emerald-100 text-emerald-700'
  if (p >= 60) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

export default function MyAttempts() {
  const { data: attempts, loading, error } = useApi('/quizzes/me/attempts')

  const list = attempts ?? []
  const best = list.length ? Math.max(...list.map(percent)) : 0
  const average = list.length
    ? Math.round(list.reduce((sum, a) => sum + percent(a), 0) / list.length)
    : 0

  return (
    <div className={container}>
      <PageHeader
        title="Riwayat Kuis"
        subtitle="Semua percobaan kuis yang pernah kamu kerjakan."
        backTo="/profile"
        backLabel="Profil"
      />

      <ErrorAlert message={error} />

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        !error && (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada riwayat kuis"
            description="Kerjakan kuis pertamamu untuk melihat skor di sini."
          >
            <Link to="/quizzes" className={btnPrimary}>
              Lihat Kuis
            </Link>
          </EmptyState>
        )
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Total Percobaan</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{list.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Rata-rata Skor</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{average}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Skor Terbaik</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{best}%</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Kuis</th>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Skor</th>
                  <th className="px-4 py-3 font-medium">Persentase</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((a) => {
                  const p = percent(a)
                  return (
                    <tr key={a.id}>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {a.quiz?.title || 'Kuis dihapus'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateTime(a.completedAt || a.startedAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {a.score} / {a.totalPoints}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeClass(p)}`}
                        >
                          {p}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.quiz && (
                          <Link
                            to={`/quizzes/${a.quiz.id}`}
                            className="text-emerald-600 hover:underline"
                          >
                            Ulangi
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
