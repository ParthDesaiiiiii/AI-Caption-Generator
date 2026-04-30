import React from 'react'
import Footer from '../components/Footer'

export default function Home(){
  return (
    <div>
      <div className="card p-8">
        <h2 className="hero-title">Create share-worthy captions in seconds</h2>
        <p className="hero-sub">Upload a photo, provide a short context and pick a tone — we’ll generate polished captions ready for social.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 card">
            <h3 className="font-medium">Generate</h3>
            <p className="small-muted text-sm">Upload an image, add context, choose a style and generate multiple caption options.</p>
          </div>
          <div className="p-6 card">
            <h3 className="font-medium">Use Cases</h3>
            <p className="small-muted text-sm">Tailored suggestions for Instagram, LinkedIn, and casual posts.</p>
          </div>
          <div className="p-6 card">
            <h3 className="font-medium">History</h3>
            <p className="small-muted text-sm">Browse recent captions saved locally in your browser.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
