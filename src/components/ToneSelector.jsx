import React from 'react'

const tones = [
  { key: 'Neutral', label: 'Neutral' },
  { key: 'Funny', label: 'Funny 😄' },
  { key: 'Sarcastic', label: 'Sarcastic 😏' },
  { key: 'Motivational', label: 'Motivational 💪' },
]

export default function ToneSelector({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="p-2 border rounded">
      {tones.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
    </select>
  )
}
