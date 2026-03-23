import React from 'react'
const modes = ['Descriptive', 'Funny', 'Professional', 'Instagram']

export default function Controls({ mode, setMode, onGenerate, loading }) {
  return (
    <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <select value={mode} onChange={e => setMode(e.target.value)} className="p-2 border rounded w-full md:w-auto">
          {modes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Caption'}
        </button>
      </div>
    </div>
  )
}
