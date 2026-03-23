import React, { useRef, useState } from 'react'

export default function ImageUploader({ value, onChange }) {
  const fileRef = useRef()
  const [drag, setDrag] = useState(false)

  const handleFile = async file => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ file, base64: reader.result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        className={`border-2 ${drag ? 'border-dashed border-blue-400' : 'border-dashed border-gray-300'} rounded p-4 flex items-center gap-4`}
      >
        <div className="flex-1">
          <p className="text-sm">Drag & drop an image here, or</p>
          <button
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => fileRef.current.click()}
          >
            Choose file
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
        <div className="w-32 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {value?.base64 ? (
            <img src={value.base64} alt="preview" className="object-cover w-full h-full" />
          ) : (
            <span className="text-xs text-gray-500">No preview</span>
          )}
        </div>
      </div>
    </div>
  )
}
