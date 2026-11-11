import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SEVERITY_STYLES = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ComplaintCard({ report }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-700 font-medium line-clamp-2 flex-1">
          {report.complaint_text}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
              SEVERITY_STYLES[report.severity] || SEVERITY_STYLES.low
            }`}
          >
            {report.severity}
          </span>
          {report.escalate_to_ra && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              RA
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-1">{formatDate(report.created_at)}</p>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-indigo-600 hover:underline mt-2"
      >
        {expanded ? 'Hide response' : 'View mediation response'}
      </button>

      {expanded && (
        <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-slate-700 leading-relaxed">
          {report.bot_response}
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ session }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API}/complaints`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!res.ok) throw new Error('Failed to load complaints')
        const data = await res.json()
        setReports(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [session])

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">All Complaints</h2>
          <p className="text-slate-500 text-sm">{reports.length} total</p>
        </div>
      </div>

      {loading && (
        <div className="text-slate-500 text-sm text-center py-12">Loading complaints...</div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-sm">No complaints yet. Peace and quiet!</p>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <ComplaintCard key={r.id} report={r} />
        ))}
      </div>
    </main>
  )
}
