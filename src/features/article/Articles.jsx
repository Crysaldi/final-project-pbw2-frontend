import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Calendar, FileText } from 'lucide-react'
import useApi from '../../hooks/useApi'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/Pagination'
import PageHeader from '../../components/PageHeader'
import { formatDate } from '../../utils/format'
import { btnPrimary, container, inputClass } from '../../utils/ui'

const LIMIT = 9

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const search = searchParams.get('search') || ''
  const [keyword, setKeyword] = useState(search)

  const { data, loading, error } = useApi('/articles', {
    page,
    limit: LIMIT,
    search: search || undefined,
  })

  function handleSearch(e) {
    e.preventDefault()
    const next = {}
    if (keyword.trim()) next.search = keyword.trim()
    setSearchParams(next)
  }

  function goToPage(p) {
    const next = {}
    if (search) next.search = search
    if (p > 1) next.page = String(p)
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const items = data?.items ?? []
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div className={container}>
      <PageHeader title="Artikel" subtitle="Bacaan seputar energi bersih dan terjangkau." />

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-lg">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari judul artikel..."
            className={`${inputClass} mt-0 pl-9`}
          />
        </div>
        <button type="submit" className={btnPrimary}>
          Cari
        </button>
      </form>

      <ErrorAlert message={error} />

      {loading && !data ? (
        <Loading />
      ) : items.length === 0 && !error ? (
        <EmptyState
          icon={FileText}
          title={search ? 'Artikel tidak ditemukan' : 'Belum ada artikel'}
          description={search ? `Tidak ada hasil untuk "${search}".` : undefined}
        />
      ) : (
        <>
          <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {items.map((a) => (
              <Link
                key={a.id}
                to={`/articles/${a.slug}`}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {a.coverImage ? (
                  <img
                    src={a.coverImage}
                    alt={a.title}
                    className="h-40 w-full object-cover bg-gray-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-40 bg-emerald-50 flex items-center justify-center text-emerald-300">
                    <FileText size={40} />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="font-bold text-gray-800 line-clamp-2">{a.title}</h2>
                  {a.excerpt && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{a.excerpt}</p>
                  )}
                  <p className="mt-auto pt-4 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {formatDate(a.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  )
}
