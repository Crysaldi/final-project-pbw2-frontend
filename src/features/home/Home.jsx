import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ClipboardList, MessageSquare, Zap, Calendar } from 'lucide-react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/format'
import { btnOutline } from '../../utils/ui'

const features = [
  {
    to: '/articles',
    icon: BookOpen,
    title: 'Artikel',
    desc: 'Pelajari konsep energi bersih dan terjangkau lewat artikel, infografis, dan video.',
  },
  {
    to: '/quizzes',
    icon: ClipboardList,
    title: 'Kuis',
    desc: 'Uji pemahamanmu dengan kuis pilihan ganda dan pantau skor dari waktu ke waktu.',
  },
  {
    to: '/forums',
    icon: MessageSquare,
    title: 'Forum',
    desc: 'Diskusikan ide dan pertanyaan seputar SDG 7 bersama pengguna lain.',
  },
]

export default function Home() {
  const { user } = useAuth()
  const { data: articleData, loading: loadingArticles } = useApi('/articles', { limit: 3 })
  const { data: quizzes, loading: loadingQuizzes } = useApi('/quizzes')

  const latestArticles = articleData?.items ?? []
  const latestQuizzes = (quizzes ?? []).slice(0, 3)

  return (
    <div>
      <section className="bg-linear-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-sm bg-white/15 rounded-full">
            <Zap size={16} />
            SDG 7 · Energi Bersih dan Terjangkau
          </div>
          <h1 className="text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
            Belajar energi bersih, selangkah demi selangkah.
          </h1>
          <p className="mt-4 text-lg text-emerald-50 max-w-2xl">
            SDG7Learn adalah platform belajar interaktif tentang tujuan pembangunan berkelanjutan
            ke-7. Baca artikel, kerjakan kuis, dan berdiskusi di forum.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-medium rounded hover:bg-emerald-50"
            >
              Mulai Belajar
              <ArrowRight size={18} />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/70 rounded hover:bg-white/10"
              >
                Buat Akun
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        <section className="grid gap-4 md:grid-cols-3">
          {features.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 mb-4 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Icon size={22} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
              <p className="mt-1 text-sm text-gray-600">{desc}</p>
            </Link>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Artikel Terbaru</h2>
            <Link to="/articles" className="text-sm text-emerald-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          {loadingArticles ? (
            <p className="text-gray-500">Memuat...</p>
          ) : latestArticles.length === 0 ? (
            <p className="text-gray-500">Belum ada artikel.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {latestArticles.map((a) => (
                <Link
                  key={a.id}
                  to={`/articles/${a.slug}`}
                  className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-gray-800 line-clamp-2">{a.title}</h3>
                  {a.excerpt && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{a.excerpt}</p>
                  )}
                  <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {formatDate(a.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Kuis untuk Kamu</h2>
            <Link to="/quizzes" className="text-sm text-emerald-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          {loadingQuizzes ? (
            <p className="text-gray-500">Memuat...</p>
          ) : latestQuizzes.length === 0 ? (
            <p className="text-gray-500">Belum ada kuis.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {latestQuizzes.map((q) => (
                <div key={q.id} className="bg-white rounded-lg shadow p-5 flex flex-col">
                  <h3 className="font-bold text-gray-800">{q.title}</h3>
                  {q.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{q.description}</p>
                  )}
                  <p className="mt-3 text-xs text-gray-500">{q._count?.questions ?? 0} pertanyaan</p>
                  <Link to={`/quizzes/${q.id}`} className={`${btnOutline} mt-4 self-start`}>
                    Kerjakan
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
