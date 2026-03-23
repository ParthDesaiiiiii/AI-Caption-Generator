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
  const [tone, setTone] = useState('Neutral')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const handleGenerate = async () => {
    if (!imageData) return
    setLoading(true)
    try {
      const res = await generateCaptions(imageData.base64, style, tone)
      // res: array of strings
      setCaptions(res)
      // save to localStorage history
      const prev = JSON.parse(localStorage.getItem('captions_history') || '[]')
      const entry = { id: Date.now(), image: imageData.base64, style, tone, captions: res }
      const next = [entry, ...prev].slice(0, 5)
      localStorage.setItem('captions_history', JSON.stringify(next))
    } catch (e) {
      console.error(e)
      alert('Failed to generate captions. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">AI Image Caption Generator</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm">Dark</label>
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl shadow p-6">
          <ImageUploader value={imageData} onChange={setImageData} />

          <Controls
            style={style}
            setStyle={setStyle}
            tone={tone}
            setTone={setTone}
            onGenerate={handleGenerate}
            loading={loading}
          />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
            </div>
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
