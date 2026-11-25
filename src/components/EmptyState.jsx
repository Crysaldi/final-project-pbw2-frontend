import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-10 text-center">
      <Icon size={40} className="mx-auto text-gray-300 mb-3" />
      <p className="font-medium text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
