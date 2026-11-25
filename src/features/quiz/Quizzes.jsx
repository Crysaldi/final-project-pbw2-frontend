import { Link } from 'react-router-dom'
import { ClipboardList, HelpCircle, Users } from 'lucide-react'
import useApi from '../../hooks/useApi'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { btnOutline, btnPrimary, container } from '../../utils/ui'

export default function Quizzes() {
  const { user } = useAuth()
  const { data: quizzes, loading, error } = useApi('/quizzes')

  return (
    <div className={container}>
      <PageHeader
        title="Kuis"
        subtitle="Uji pemahamanmu tentang energi bersih dan terjangkau."
        action={
          user && (
            <Link to="/my-attempts" className={btnOutline}>
              <ClipboardList size={18} />
              Riwayat Kuis
            </Link>
          )
        }
      />

      <ErrorAlert message={error} />

      {loading ? (
        <Loading />
      ) : !quizzes || quizzes.length === 0 ? (
        !error && <EmptyState icon={ClipboardList} title="Belum ada kuis tersedia" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => (
            <div key={q.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
              <h2 className="text-lg font-bold text-gray-800">{q.title}</h2>
              {q.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{q.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <HelpCircle size={14} />
                  {q._count?.questions ?? 0} pertanyaan
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {q._count?.attempts ?? 0} percobaan
                </span>
              </div>
              <Link to={`/quizzes/${q.id}`} className={`${btnPrimary} mt-5 self-start`}>
                Mulai Kuis
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
