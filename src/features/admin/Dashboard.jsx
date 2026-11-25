import { Link } from 'react-router-dom'
import { FileText, ClipboardList, MessageSquare, Users, ArrowRight } from 'lucide-react'
import useApi from '../../hooks/useApi'
import PageHeader from '../../components/PageHeader'
import { container } from '../../utils/ui'

function StatCard({ icon: Icon, label, value, hint, loading }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{loading ? '…' : value}</p>
        {hint && !loading && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    </div>
  )
}

const links = [
  { to: '/admin/articles', icon: FileText, title: 'Kelola Artikel', desc: 'Tulis, ubah, publikasikan artikel dan media.' },
  { to: '/admin/quizzes', icon: ClipboardList, title: 'Kelola Kuis', desc: 'Buat kuis baru beserta pertanyaan dan opsinya.' },
  { to: '/admin/forums', icon: MessageSquare, title: 'Kelola Forum', desc: 'Buat forum diskusi dan moderasi topik.' },
  { to: '/admin/users', icon: Users, title: 'Pengguna', desc: 'Lihat daftar pengguna yang terdaftar.' },
]

export default function Dashboard() {
  const articles = useApi('/articles/admin/all')
  const quizzes = useApi('/quizzes')
  const forums = useApi('/forums')
  const users = useApi('/users')

  const articleList = articles.data ?? []
  const published = articleList.filter((a) => a.published).length
  const totalPosts = (forums.data ?? []).reduce((sum, f) => sum + (f._count?.posts ?? 0), 0)

  return (
    <div className={container}>
      <PageHeader title="Dashboard Admin" subtitle="Ringkasan konten SDG7Learn." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard
          icon={FileText}
          label="Artikel"
          value={articleList.length}
          hint={`${published} terpublikasi`}
          loading={articles.loading}
        />
        <StatCard
          icon={ClipboardList}
          label="Kuis Terpublikasi"
          value={(quizzes.data ?? []).length}
          loading={quizzes.loading}
        />
        <StatCard
          icon={MessageSquare}
          label="Forum"
          value={(forums.data ?? []).length}
          hint={`${totalPosts} topik diskusi`}
          loading={forums.loading}
        />
        <StatCard
          icon={Users}
          label="Pengguna"
          value={(users.data ?? []).length}
          loading={users.loading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white rounded-lg shadow p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-11 h-11 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 flex items-center justify-center shrink-0">
              <Icon size={22} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-emerald-600" />
          </Link>
        ))}
      </div>
    </div>
  )
}
