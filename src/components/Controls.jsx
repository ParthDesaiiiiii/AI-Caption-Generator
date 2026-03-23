import React from 'react'
import ToneSelector from './ToneSelector'

const styles = ['Descriptive', 'Funny', 'Professional', 'Instagram']

export default function Controls({ style, setStyle, tone, setTone, onGenerate, loading }) {
  return (
    <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1 flex gap-2">
        <select value={style} onChange={e => setStyle(e.target.value)} className="p-2 border rounded">
          {styles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <ToneSelector value={tone} onChange={setTone} />
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
