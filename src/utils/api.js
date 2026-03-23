import axios from 'axios'
import { classifyImageFromDataUrl } from './classify'

// generateCaptions(base64Image, style) -> Promise<string[]>
// When no API key is provided, classify the image and produce multiple
// style-specific captions based on labels.

const mockGenerator = async (base64, style) => {
  try {
    const preds = await classifyImageFromDataUrl(base64, 5)
    const labels = preds.map(p => p.className.split(',')[0])
    const main = labels[0] || 'object'
    const extras = labels.slice(1).join(', ')

    const variations = []
    if (/funny/i.test(style)){
      variations.push(`😄 Funny → "${shortFunny(main)}"`)
      variations.push(`😂 "When your ${main} decides to steal the show."`)
      variations.push(`🤣 "POV: ${main} trying its best."`)
      variations.push(`😆 "That moment when ${main} makes everything better."`)
      variations.push(`😜 "Not sure who taught the ${main} that, but I stan."`)
    } else if (/instagram/i.test(style)){
      variations.push(`📸 Instagram → "${instagramStyle(main, extras)}"`)
      variations.push(`✨ "${main} days and good vibes."`)
      variations.push(`🌿 "Chasing moments with this ${main}."`)
      variations.push(`💫 "Blessed to witness this ${main}."`)
      variations.push(`❤️ "No filter needed for this ${main}."`)
    } else if (/professional/i.test(style)){
      variations.push(`💼 Professional → "${professionalStyle(main, extras)}"`)
      variations.push(`📊 "High-quality image of ${aOrAn(main)} ${main}${extras ? `, highlighting ${extras}` : ''}."`)
      variations.push(`📝 "A refined depiction of ${main} in natural context."`)
      variations.push(`🔬 "Clear visual representation focusing on ${main}."`)
      variations.push(`� "Image suitable for professional portfolios — ${main}."`)
    } else {
      variations.push(`🧠 ${style} → "A ${main} ${extras ? `with ${extras} ` : ''}captured in the photo."`)
      variations.push(`🔎 Descriptive → "A clear photo of ${aOrAn(main)} ${main}${extras ? ` featuring ${extras}` : ''}."`)
      variations.push(`🧭 "The image prominently shows ${main}${extras ? ` alongside ${extras}` : ''}."`)
      variations.push(`🎯 "Focused shot highlighting ${main} and its context."`)
      variations.push(`🖼️ "Photograph of ${main}${extras ? `, ${extras}` : ''}."`)
    }

    const uniq = [...new Set(variations)]
    return uniq.slice(0, 5)
  } catch (e) {
    return [
      `A ${style.toLowerCase()} caption for the uploaded image`,
      `When you finally touch grass`,
      `Living my best life 🌿✨`
    ]
  }
}

export async function generateCaptions(base64Image, style = 'Descriptive') {
  const key = import.meta.env.VITE_OPENAI_API_KEY
  if (!key) {
    return mockGenerator(base64Image, style)
  }

  try {
    const prompt = `You are given an image (base64). Generate 4 short, distinct captions tailored to the image. Style: ${style}. Return a JSON array of strings.`
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt },
        { role: 'user', content: `Image (base64): ${base64Image}` }
      ],
      temperature: 0.8,
      max_tokens: 256
    }
    const res = await axios.post('https://api.openai.com/v1/chat/completions', body, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    })

    const text = res.data?.choices?.[0]?.message?.content
    if (!text) return mockGenerator(base64Image, style)

    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) return parsed
    } catch (e) {
      return text.split(/\n+/).filter(Boolean).slice(0, 5)
    }
  } catch (e) {
    console.error('API error, falling back to mock', e)
    return mockGenerator(base64Image, style)
  }
}

function aOrAn(word){
  return /^[aeiouAEIOU]/.test(word) ? 'an' : 'a'
}

function instagramStyle(main, extras){
  const emojis = ['🌿','✨','💫','🔥','❤️']
  return `Living my best life ${emojis[Math.floor(Math.random()*emojis.length)]} ${main}${extras ? ` • ${extras}` : ''}`
}

function shortFunny(main){
  return `When your ${main} steals the spotlight.`
}

function professionalStyle(main, extras){
  return `Professional capture of ${aOrAn(main)} ${main}${extras ? `, highlighting ${extras}` : ''}.` 
}


