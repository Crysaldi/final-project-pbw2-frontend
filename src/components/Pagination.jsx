import { ChevronLeft, ChevronRight } from 'lucide-react'
import { btnSmall } from '../utils/ui'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        type="button"
        className={btnSmall}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={16} />
        Sebelumnya
      </button>
      <span className="text-sm text-gray-600">
        Halaman {page} dari {totalPages}
      </span>
      <button
        type="button"
        className={btnSmall}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Berikutnya
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
