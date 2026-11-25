import { Link } from 'react-router-dom'
import { MessageSquare, MessagesSquare } from 'lucide-react'
import useApi from '../../hooks/useApi'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { container } from '../../utils/ui'

export default function Forums() {
  const { data: forums, loading, error } = useApi('/forums')

  return (
    <div className={container}>
      <PageHeader title="Forum" subtitle="Tempat berdiskusi dan bertanya seputar SDG 7." />

      <ErrorAlert message={error} />

      {loading ? (
        <Loading />
      ) : !forums || forums.length === 0 ? (
        !error && <EmptyState icon={MessagesSquare} title="Belum ada forum" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {forums.map((f) => (
            <Link
              key={f.id}
              to={`/forums/${f.slug}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex gap-4"
            >
              <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-800">{f.title}</h2>
                {f.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{f.description}</p>
                )}
                <p className="mt-3 text-xs text-gray-500">{f._count?.posts ?? 0} topik diskusi</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
