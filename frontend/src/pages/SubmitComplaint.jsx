import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SEVERITY_STYLES = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
}

export default function SubmitComplaint({ session }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const token = session.access_token
      const res = await fetch(`${API}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ complaint_text: text }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Something went wrong')
      }

      const data = await res.json()
      setResult(data)
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Submit a Complaint</h2>
      <p className="text-slate-500 text-sm mb-6">
        Describe the issue. Claude will mediate and log it to the system.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="My roommate plays loud music after midnight and refuses to..."
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {loading ? 'Mediating...' : 'Submit Complaint'}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-800">Mediation Response</h3>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${
                SEVERITY_STYLES[result.data.severity] || SEVERITY_STYLES.low
              }`}
            >
              {result.data.severity}
            </span>
            {result.data.escalate_to_ra && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-orange-100 text-orange-800 border-orange-200">
                Flagged for RA
              </span>
            )}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
            {result.data.bot_response}
          </div>

          {result.suggested_next_steps?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Suggested Next Steps</h4>
              <ul className="space-y-1.5">
                {result.suggested_next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
