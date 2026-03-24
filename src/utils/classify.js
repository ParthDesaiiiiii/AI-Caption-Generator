import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

let mobilenetPromise = null
let cocoPromise = null

async function loadMobilenet(){
  if (!mobilenetPromise) mobilenetPromise = mobilenet.load()
  return mobilenetPromise
}

async function loadCoco(){
  if (!cocoPromise) cocoPromise = cocoSsd.load()
  return cocoPromise
}

// Simple classify the whole image (fallback)
export async function classifyImageFromDataUrl(dataUrl, topK = 3){
  const model = await loadMobilenet()
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = dataUrl
    img.onload = async () => {
      try {
        const predictions = await model.classify(img, topK)
        resolve(predictions)
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = reject
  })
}

// Detect objects, prefer person; crop to largest person (or largest detected object) and classify that crop
export async function classifyFocusedImage(dataUrl, topK = 5){
  const coco = await loadCoco()
  const mobilenetModel = await loadMobilenet()

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = dataUrl
    img.onload = async () => {
      try {
        // run detection
        const detections = await coco.detect(img)

        if (!detections || detections.length === 0) {
          // no detections: classify full image
          const preds = await mobilenetModel.classify(img, topK)
          resolve(preds)
          return
        }

        // prefer person detections
        const personDetections = detections.filter(d => /person/i.test(d.class))
        const candidates = personDetections.length > 0 ? personDetections : detections

        // choose the largest bbox by area
        const largest = candidates.reduce((best, cur) => {
          const area = cur.bbox[2] * cur.bbox[3]
          return (!best || area > (best.bbox[2]*best.bbox[3])) ? cur : best
        }, null)

        if (!largest) {
          const preds = await mobilenetModel.classify(img, topK)
          resolve(preds)
          return
        }

        // crop to bbox
        const [x, y, w, h] = largest.bbox.map(v => Math.max(0, Math.round(v)))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

        // classify the cropped area
        const preds = await mobilenetModel.classify(canvas, topK)
        resolve(preds)
      } catch (e) {
        // fallback
        try {
          const preds = await mobilenetModel.classify(img, topK)
          resolve(preds)
        } catch (e2) {
          reject(e2)
        }
      }
    }
    img.onerror = reject
  })
}
