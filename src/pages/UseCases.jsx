import React from 'react'

export default function UseCases(){
  return (
    <div className="card p-8">
      <h2 className="text-2xl font-semibold mb-2">Use Cases</h2>
      <p className="small-muted">Choose a target platform to get caption style suggestions and tips.</p>

      <div className="mt-6 space-y-4">
        <div className="p-4 card">
          <h3 className="font-medium">Instagram</h3>
          <p className="small-muted">Short, emoji-rich captions with lifestyle vibes.</p>
        </div>
        <div className="p-4 card">
          <h3 className="font-medium">LinkedIn</h3>
          <p className="small-muted">Professional, concise, value-oriented captions.</p>
        </div>
        <div className="p-4 card">
          <h3 className="font-medium">Casual</h3>
          <p className="small-muted">Friendly, laid-back captions for personal posts.</p>
        </div>
      </div>
    </div>
  )
}
