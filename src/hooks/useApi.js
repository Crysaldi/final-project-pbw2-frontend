import { useCallback, useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import { getErrorMessage } from '../utils/format'

// GET sederhana: { data, loading, error, reload, setData }
// - `data` dari field `data` pada response backend ({ success, data })
// - data lama tetap tersimpan saat reload, jadi tabel tidak berkedip
export default function useApi(url, params) {
  const paramKey = JSON.stringify(params ?? {})
  const [tick, setTick] = useState(0)
  const requestKey = `${url}|${paramKey}|${tick}`
  const [result, setResult] = useState({ key: null, data: null, error: '' })

  useEffect(() => {
    let cancelled = false
    axiosInstance
      .get(url, { params: JSON.parse(paramKey) })
      .then((res) => {
        if (!cancelled) setResult({ key: requestKey, data: res.data.data, error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            data: null,
            error: getErrorMessage(err, 'Gagal memuat data.'),
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [url, paramKey, requestKey])

  const loading = result.key !== requestKey
  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback(
    (updater) =>
      setResult((prev) => ({
        ...prev,
        data: typeof updater === 'function' ? updater(prev.data) : updater,
      })),
    []
  )

  return { data: result.data, loading, error: loading ? '' : result.error, reload, setData }
}
