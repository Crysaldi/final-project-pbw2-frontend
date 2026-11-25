import { useParams, Link } from 'react-router-dom'
import { Calendar, User, ExternalLink } from 'lucide-react'
import useApi from '../../hooks/useApi'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import PageHeader from '../../components/PageHeader'
import { formatDate, getYoutubeEmbedUrl } from '../../utils/format'

const mediaLabel = { IMAGE: 'Gambar', VIDEO: 'Video', INFOGRAPHIC: 'Infografis' }

function MediaItem({ media }) {
  const embed = media.type === 'VIDEO' ? getYoutubeEmbedUrl(media.url) : null

  return (
    <figure className="bg-white rounded-lg shadow overflow-hidden">
      {media.type === 'VIDEO' ? (
        embed ? (
          <iframe
            src={embed}
            title={media.title}
            className="w-full aspect-video"
            allowFullScreen
          />
        ) : (
          <video src={media.url} controls className="w-full aspect-video bg-black" />
        )
      ) : (
        <img src={media.url} alt={media.title} className="w-full object-contain bg-gray-50" />
      )}
      <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="text-gray-700">
          <span className="text-xs text-gray-500 mr-2">{mediaLabel[media.type] || media.type}</span>
          {media.title}
        </span>
        <a
          href={media.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-emerald-600 hover:underline shrink-0"
        >
          Buka <ExternalLink size={12} />
        </a>
      </figcaption>
    </figure>
  )
}

export default function ArticleDetail() {
  const { slug } = useParams()
  const { data: article, loading, error } = useApi(`/articles/${slug}`)

  if (loading) return <Loading />

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Artikel tidak ditemukan" backTo="/articles" backLabel="Semua artikel" />
        <ErrorAlert message={error || 'Artikel tidak tersedia.'} />
        <Link to="/articles" className="text-emerald-600 hover:underline">
          Kembali ke daftar artikel
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title={article.title} backTo="/articles" backLabel="Semua artikel" />

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
        <span className="flex items-center gap-1">
          <User size={14} />
          {article.author?.name || 'Admin'}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {formatDate(article.createdAt)}
        </span>
      </div>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full max-h-96 object-cover rounded-lg shadow mb-6"
        />
      )}

      {article.excerpt && (
        <p className="text-lg text-gray-600 mb-6 pl-4 border-l-4 border-emerald-500">
          {article.excerpt}
        </p>
      )}

      <div className="bg-white rounded-lg shadow p-6 md:p-8 text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
        {article.content}
      </div>

      {article.media?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Media Pendukung</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {article.media.map((m) => (
              <MediaItem key={m.id} media={m} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
