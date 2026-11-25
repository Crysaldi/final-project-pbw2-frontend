export default function ErrorAlert({ message, className = 'mb-4' }) {
  if (!message) return null
  return (
    <p className={`${className} p-3 bg-red-100 text-red-700 rounded text-sm`}>{message}</p>
  )
}
