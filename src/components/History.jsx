import React, { useEffect, useState } from 'react'

export default function History({ onLoad }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('captions_history') || '[]')
    setItems(h)
  }, [])

  const load = item => {
    onLoad({ base64: item.image, file: null })
  }

  if (items.length === 0) return <p className="text-sm text-gray-500">No history yet</p>

  return (
    <div className="space-y-2">
      {items.map(it => (
        <div key={it.id} className="border rounded p-2 flex items-center gap-2">
          <img src={it.image} alt="thumb" className="w-16 h-12 object-cover rounded" />
          <div className="flex-1">
            <div className="text-sm">{it.style}</div>
            {it.description && <div className="text-xs text-gray-500">{it.description}</div>}
            <div className="text-xs text-gray-600">{it.captions?.[0]}</div>
          </div>
          <button onClick={() => load(it)} className="px-2 py-1 bg-blue-600 text-white rounded">Load</button>
        </div>
      ))}
    </div>
  )
}
