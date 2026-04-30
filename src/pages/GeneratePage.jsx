import React from 'react'
import ImageUploader from '../components/ImageUploader'
import Controls from '../components/Controls'
import CaptionCard from '../components/CaptionCard'
import History from '../components/History'
import Footer from '../components/Footer'
import { classifyFocusedImage } from '../utils/classify'
import { generateCaptions, extractTopicFromText } from '../utils/api'

export default function GeneratePage({state, setState}){
  const { imageData, setImageData, labels, setLabels, description, setDescription, style, setStyle, captions, setCaptions, topic, setTopic } = state

  React.useEffect(() => {
    // if labels present and topic not set, auto-fill topic from labels
    if ((!topic || topic.trim() === '') && labels && labels.length > 0) {
      const t = labels[0].className ? labels[0].className.split(',')[0] : labels[0]
      setTopic && setTopic(t)
    }
  }, [labels])

  async function handleGenerate(){
    if(!imageData) return
    setCaptions([])
    const prelabels = await classifyFocusedImage(imageData)
    setLabels(prelabels)
    // prefer user-edited topic if available
    const results = await generateCaptions(imageData, style, prelabels, description, topic)
    setCaptions(results)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="card p-6">
            <ImageUploader imageData={imageData} setImageData={setImageData} />
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Short context (optional)</label>
              <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g. me and my friend at the beach" className="w-full input" />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Detected topic (editable)</label>
              <input value={topic || ''} onChange={e=>setTopic && setTopic(e.target.value)} placeholder="e.g. beach, sunset, puppy" className="w-full input" />
              <p className="text-xs text-gray-500 mt-1">Edit the topic if it looks wrong — the generator will use this as a hint.</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Controls style={style} setStyle={setStyle} onGenerate={handleGenerate} />
            </div>
          </div>

          <div className="mt-4">
            {captions && captions.length > 0 && (
              <div className="space-y-4">
                {captions.map((c,i)=> (
                  <CaptionCard key={i} caption={c} imageData={imageData} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card p-4">
            <History loadEntry={(entry)=>{
              setImageData(entry.image)
              setDescription(entry.description)
              setStyle(entry.style)
              setCaptions(entry.captions)
            }} />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  )
}

