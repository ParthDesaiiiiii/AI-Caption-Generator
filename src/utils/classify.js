import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

let modelPromise = null

export async function loadModel(){
  if (!modelPromise) modelPromise = mobilenet.load()
  return modelPromise
}

// input: an image HTML element or image data URL
export async function classifyImageFromDataUrl(dataUrl, topK = 3){
  const model = await loadModel()
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
