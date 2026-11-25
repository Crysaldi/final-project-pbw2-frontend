import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MessageSquare, Send, Trash2, MessagesSquare } from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/Avatar'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { formatDateTime, getErrorMessage } from '../../utils/format'
import { btnDanger, btnPrimary, btnSmall, container, inputClass } from '../../utils/ui'

export default function ForumDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { data: forum, loading, error, setData } = useApi(`/forums/${slug}`)

  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  if (loading && !forum) return <Loading />

  if (error || !forum) {
    return (
      <div className={container}>
        <PageHeader title="Forum tidak ditemukan" backTo="/forums" backLabel="Semua forum" />
        <ErrorAlert message={error || 'Forum tidak tersedia.'} />
      </div>
    )
  }

  const isAdmin = user?.role === 'ADMIN'
  const posts = forum.posts ?? []

  async function handleCreatePost(e) {
    e.preventDefault()
    if (!content.trim()) return
    setPostError('')
    setPosting(true)
    try {
      const res = await axiosInstance.post(`/forums/${forum.id}/posts`, { content: content.trim() })
      const created = { ...res.data.data, _count: { replies: 0 } }
      setData((prev) => ({ ...prev, posts: [created, ...(prev.posts ?? [])] }))
      setContent('')
    } catch (err) {
      setPostError(getErrorMessage(err, 'Gagal mengirim topik.'))
    } finally {
      setPosting(false)
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm('Hapus topik ini beserta seluruh balasannya?')) return
    try {
      await axiosInstance.delete(`/forums/posts/${postId}`)
      setData((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== postId) }))
    } catch (err) {
      window.alert(getErrorMessage(err, 'Gagal menghapus topik.'))
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        title={forum.title}
        subtitle={forum.description}
        backTo="/forums"
        backLabel="Semua forum"
      />

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {user ? (
          <form onSubmit={handleCreatePost}>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Mulai topik baru</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                maxLength={5000}
                className={inputClass}
                placeholder="Tulis pertanyaan atau gagasanmu..."
              />
            </label>
            <ErrorAlert message={postError} className="mt-3" />
            <button
              type="submit"
              disabled={posting || !content.trim()}
              className={`${btnPrimary} mt-3`}
            >
              <Send size={16} />
              {posting ? 'Mengirim...' : 'Kirim Topik'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600">
            <Link to="/login" className="text-emerald-600 hover:underline font-medium">
              Login
            </Link>{' '}
            untuk membuat topik atau membalas diskusi.
          </p>
        )}
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Belum ada diskusi"
          description="Jadilah yang pertama memulai topik."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              user={user}
              isAdmin={isAdmin}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PostItem({ post, user, isAdmin, onDelete }) {
  const [open, setOpen] = useState(false)
  const [replies, setReplies] = useState(null) // null = belum dimuat
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [repliesError, setRepliesError] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyError, setReplyError] = useState('')

  const replyCount = replies ? replies.length : (post._count?.replies ?? 0)

  async function toggleReplies() {
    const next = !open
    setOpen(next)
    if (next && replies === null) {
      setLoadingReplies(true)
      setRepliesError('')
      try {
        const res = await axiosInstance.get(`/forums/posts/${post.id}`)
        setReplies(res.data.data.replies ?? [])
      } catch (err) {
        setRepliesError(getErrorMessage(err, 'Gagal memuat balasan.'))
      } finally {
        setLoadingReplies(false)
      }
    }
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return
    setReplyError('')
    setSending(true)
    try {
      const res = await axiosInstance.post(`/forums/posts/${post.id}/replies`, {
        content: replyText.trim(),
      })
      setReplies((prev) => [...(prev ?? []), res.data.data])
      setReplyText('')
    } catch (err) {
      setReplyError(getErrorMessage(err, 'Gagal mengirim balasan.'))
    } finally {
      setSending(false)
    }
  }

  async function handleDeleteReply(replyId) {
    if (!window.confirm('Hapus balasan ini?')) return
    try {
      await axiosInstance.delete(`/forums/replies/${replyId}`)
      setReplies((prev) => prev.filter((r) => r.id !== replyId))
    } catch (err) {
      window.alert(getErrorMessage(err, 'Gagal menghapus balasan.'))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-start gap-3">
        <Avatar name={post.author?.name} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-medium text-gray-800">{post.author?.name || 'Pengguna'}</span>
            <span className="text-xs text-gray-500">{formatDateTime(post.createdAt)}</span>
          </div>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap wrap-break-word">{post.content}</p>

          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={toggleReplies} className={btnSmall}>
              <MessageSquare size={14} />
              {replyCount} balasan
            </button>
            {isAdmin && (
              <button type="button" onClick={onDelete} className={`${btnDanger} text-sm`}>
                <Trash2 size={14} />
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-4 ml-0 sm:ml-12 pl-4 border-l-2 border-emerald-100 space-y-3">
          {loadingReplies && <p className="text-sm text-gray-500">Memuat balasan...</p>}
          <ErrorAlert message={repliesError} className="" />

          {replies?.map((r) => (
            <div key={r.id} className="flex items-start gap-3">
              <Avatar name={r.author?.name} size={28} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="font-medium text-gray-800">{r.author?.name || 'Pengguna'}</span>
                  <span className="text-xs text-gray-500">{formatDateTime(r.createdAt)}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReply(r.id)}
                      className="ml-auto text-gray-400 hover:text-red-600"
                      aria-label="Hapus balasan"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
                  {r.content}
                </p>
              </div>
            </div>
          ))}

          {replies && replies.length === 0 && (
            <p className="text-sm text-gray-500">Belum ada balasan.</p>
          )}

          {user ? (
            <form onSubmit={handleReply} className="pt-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                maxLength={5000}
                className={`${inputClass} mt-0 text-sm`}
                placeholder="Tulis balasan..."
              />
              <ErrorAlert message={replyError} className="mt-2" />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className={`${btnPrimary} mt-2 text-sm`}
              >
                <Send size={14} />
                {sending ? 'Mengirim...' : 'Balas'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-600">
              <Link to="/login" className="text-emerald-600 hover:underline">
                Login
              </Link>{' '}
              untuk membalas.
            </p>
          )}
        </div>
      )}
    </div>
  )
}