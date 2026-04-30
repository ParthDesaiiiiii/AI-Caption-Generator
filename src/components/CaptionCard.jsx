import React from 'react'

function downloadDataUrlImage(dataUrl, filename = 'caption.png'){
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export default function CaptionCard({ caption, image }) {
  const copy = async () => {
    await navigator.clipboard.writeText(caption)
    alert('Copied to clipboard')
  }

  const download = async () => {
    // draw image + caption to canvas
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = image
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const w = Math.min(800, img.width)
      const h = (img.height / img.width) * w
      canvas.width = w
      canvas.height = h + 80
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0,0,canvas.width,canvas.height)
      ctx.drawImage(img, 0, 0, w, h)
      ctx.fillStyle = '#000'
      ctx.font = '18px sans-serif'
      ctx.fillText(caption, 16, h + 32)
      downloadDataUrlImage(canvas.toDataURL('image/png'))
    }
    img.onerror = () => alert('Could not load image for download')
  }

  return (
    <div className="caption-card">
      <div className="caption-text">{caption}</div>
      <div className="caption-meta">
        <button onClick={copy} className="btn-primary text-sm">Copy</button>
        {image && <button onClick={download} className="btn-ghost text-sm">Download</button>}
      </div>
    </div>
  )
}
