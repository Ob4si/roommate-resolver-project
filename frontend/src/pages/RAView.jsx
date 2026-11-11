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

export default function RAView({ session }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEscalated = async () => {
      try {
        const res = await fetch(`${API}/complaints/escalated`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!res.ok) throw new Error('Failed to load escalated complaints')
        const data = await res.json()
        setReports(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEscalated()
  }, [session])

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">RA Escalation Queue</h2>
        <p className="text-slate-500 text-sm">Complaints flagged for Resident Advisor review</p>
      </div>

      {reports.length > 0 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 text-sm text-orange-800">
          <span className="text-lg">⚠️</span>
          <span>
            <strong>{reports.length}</strong> complaint{reports.length !== 1 ? 's' : ''} require RA
            attention.
          </span>
        </div>
      )}

      {loading && (
        <div className="text-slate-500 text-sm text-center py-12">Loading escalated complaints...</div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm">No escalated complaints. All clear!</p>
        </div>
      )}

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white border-2 border-orange-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                  SEVERITY_STYLES[r.severity] || SEVERITY_STYLES.low
                }`}
              >
                {r.severity}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Escalated to RA
              </span>
              {r.policy_violation && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Policy Violation
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-800 mb-1">Complaint</p>
            <p className="text-sm text-slate-600 mb-4">{r.complaint_text}</p>

            <p className="text-sm font-semibold text-slate-800 mb-1">Mediation Response</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">{r.bot_response}</p>

            <p className="text-xs text-slate-400">{formatDate(r.created_at)}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
