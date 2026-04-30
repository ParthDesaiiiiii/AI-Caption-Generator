import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function NavBar({ dark, setDark }){
  const loc = useLocation()
  return (
    <nav className="w-full bg-[var(--card)] border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-[var(--accent)]">AI Caption</Link>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/generate" className={`text-sm ${loc.pathname==='/generate' ? 'underline' : 'small-muted'}`}>Generate</Link>
            <Link to="/usecases" className={`text-sm ${loc.pathname==='/usecases' ? 'underline' : 'small-muted'}`}>Use cases</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/generate" className="btn-primary text-sm hidden md:inline-block">Try it</Link>
          <label className="text-sm small-muted">Dark</label>
          <input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)} />
        </div>
      </div>
    </nav>
  )
}
