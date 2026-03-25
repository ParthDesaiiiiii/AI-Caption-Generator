import React, { useEffect, useState } from 'react'
import ImageUploader from './components/ImageUploader'
import Controls from './components/Controls'
import CaptionCard from './components/CaptionCard'
import History from './components/History'
import { generateCaptions } from './utils/api'

export default function App() {
  const [imageData, setImageData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [captions, setCaptions] = useState([])
  const [style, setStyle] = useState('Descriptive')
  const [labels, setLabels] = useState([])
  const [description, setDescription] = useState('')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const handleGenerate = async () => {
    if (!imageData) return
    setLoading(true)
    try {
      const res = await generateCaptions(imageData.base64, style, labels, description)
      // res: array of strings
      setCaptions(res)
      // save to localStorage history
      const prev = JSON.parse(localStorage.getItem('captions_history') || '[]')
      const entry = { id: Date.now(), image: imageData.base64, style, description, captions: res }
      const next = [entry, ...prev].slice(0, 5)
      localStorage.setItem('captions_history', JSON.stringify(next))
    } catch (e) {
      console.error(e)
      alert('Failed to generate captions. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  const onImageChange = async (data) => {
    setImageData(data)
    setCaptions([])
    setLabels([])
    // run classifier to populate labels for display and for caption generator
    try {
      const mod = await import('./utils/classify')
      // use focused classification (detect largest person/object and classify its crop)
      const preds = await mod.classifyFocusedImage(data.base64, 5)
      // store raw preds so generateCaptions can consume them directly
      setLabels(preds)
    } catch (e) {
      console.error('Labeling failed', e)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-6">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">AI Image Caption Generator</h1>
            <p className="text-sm small-muted">Upload a photo, give a short context, and get creative captions.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm small-muted">Dark</label>
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
          </div>
        </header>

        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ImageUploader value={imageData} onChange={onImageChange} />
            </div>

            <div className="md:col-span-1">
              {/* Right column: detections, description and controls */}
              {labels.length > 0 && (
                <div className="mb-4 text-sm text-gray-600">
                  <div className="font-medium">Detected labels (focused):</div>
                  <div className="flex gap-2 flex-wrap mt-1">{labels.map((l,i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">{l.className} ({Math.round((l.probability||0)*100)}%)</span>
                  ))}</div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Describe this photo (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 'Me and my friend at the beach, sunset behind us'"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="text-xs text-gray-500 mt-1">The caption generator will prioritize this description when creating captions.</div>
              </div>

              <Controls
                mode={style}
                setMode={setStyle}
                onGenerate={handleGenerate}
                loading={loading}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            {captions.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-2">Generated Captions</h2>
                <div className="space-y-3">
                  {captions.map((c, i) => (
                    <CaptionCard key={i} caption={c} image={imageData?.base64} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-medium mb-2">History</h2>
              <History onLoad={setImageData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
