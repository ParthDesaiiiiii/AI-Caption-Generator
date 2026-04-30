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
    <div className="uploader card p-4">
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        className={`uploader-inner ${drag ? 'border-blue-400' : ''}`}
      >
        <div className="uploader-preview">
          {value?.base64 ? (
            <img src={value.base64} alt="preview" className="object-cover w-full h-full" />
          ) : (
            <svg width="48" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L12 22" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Drag & drop or choose an image</div>
          <div className="small-muted text-sm mt-1">PNG or JPG up to 10MB. The model will analyze the main subject.</div>
          <div className="uploader-actions mt-3">
            <button className="btn-primary" onClick={() => fileRef.current.click()}>Upload</button>
            <button className="btn-ghost" onClick={() => { onChange(null); fileRef.current.value = '' }}>Clear</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
      </div>
    </div>
  )
}
