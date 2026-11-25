export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getErrorMessage(err, fallback = 'Terjadi kesalahan. Coba lagi.') {
  return err?.response?.data?.message || fallback
}

// Ubah link YouTube biasa menjadi link embed. Return null jika bukan YouTube.
export function getYoutubeEmbedUrl(url) {
  try {
    const u = new URL(url)
    let id = null
    if (u.hostname === 'youtu.be') {
      id = u.pathname.slice(1)
    } else if (u.hostname.endsWith('youtube.com')) {
      id = u.searchParams.get('v')
      if (!id && u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2]
    }
    return id ? `https://www.youtube.com/embed/${id}` : null
  } catch {
    return null
  }
}
