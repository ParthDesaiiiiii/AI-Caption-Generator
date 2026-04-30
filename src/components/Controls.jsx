import React from 'react'
const modes = ['Descriptive', 'Funny', 'Professional', 'Instagram']

export default function Controls({ mode, setMode, onGenerate, loading }) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <select value={mode} onChange={e => setMode(e.target.value)} className="p-2 border rounded w-48">
          {modes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button onClick={onGenerate} disabled={loading} className="btn-primary">
          {loading ? 'Generating...' : 'Generate Captions'}
        </button>
      </div>
    </div>
  )
}
