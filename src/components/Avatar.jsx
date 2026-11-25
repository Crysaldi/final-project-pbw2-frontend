import { useState } from 'react'

export default function Avatar({ name = '', src, size = 40 }) {
  const [failed, setFailed] = useState(false)
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?'
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) }

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className="rounded-full object-cover bg-gray-100 shrink-0"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div
      style={style}
      className="rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center shrink-0"
    >
      {initials}
    </div>
  )
}
