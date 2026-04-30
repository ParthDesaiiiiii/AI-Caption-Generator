import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import GeneratePage from './pages/GeneratePage'
import UseCases from './pages/UseCases'
import './index.css'

export default function App() {
  const [imageData, setImageData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [captions, setCaptions] = useState([])
  const [style, setStyle] = useState('Descriptive')
  const [labels, setLabels] = useState([])
  const [description, setDescription] = useState('')
  const [topic, setTopic] = useState('')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Build a single state object passed to GeneratePage to keep prop surface minimal
  const state = {
    imageData,
    setImageData,
    labels,
    setLabels,
    description,
    setDescription,
    style,
    setStyle,
    captions,
    setCaptions,
    topic,
    setTopic,
    loading,
    setLoading
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
    <div className="min-h-screen">
      <NavBar dark={dark} setDark={setDark} />
      <main className="max-w-5xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<GeneratePage state={state} setState={null} />} />
          <Route path="/usecases" element={<UseCases />} />
        </Routes>
      </main>
    </div>
  )
}
