import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import useApi from '../../hooks/useApi'
import Avatar from '../../components/Avatar'
import Loading from '../../components/Loading'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { formatDate } from '../../utils/format'
import { container, inputClass } from '../../utils/ui'

export default function ManageUsers() {
  const { data: users, loading, error } = useApi('/users')
  const [query, setQuery] = useState('')

  const keyword = query.trim().toLowerCase()
  const list = (users ?? []).filter(
    (u) => !keyword || u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
  )

  return (
    <div className={container}>
      <PageHeader
        title="Pengguna"
        subtitle={users ? `${users.length} pengguna terdaftar.` : 'Daftar pengguna terdaftar.'}
        backTo="/admin"
        backLabel="Dashboard"
      />

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau email..."
          className={`${inputClass} mt-0 pl-9`}
        />
      </div>

      <ErrorAlert message={error} />

      {loading && !users ? (
        <Loading />
      ) : list.length === 0 ? (
        !error && (
          <EmptyState
            icon={Users}
            title={keyword ? 'Pengguna tidak ditemukan' : 'Belum ada pengguna'}
          />
        )
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Peran</th>
                <th className="px-4 py-3 font-medium">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size={32} />
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role === 'ADMIN' ? 'Admin' : 'Pengguna'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
