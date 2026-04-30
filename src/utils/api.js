import axios from 'axios'
import { classifyImageFromDataUrl } from './classify'

// generateCaptions(base64Image, style) -> Promise<string[]>
// When no API key is provided, classify the image and produce multiple
// style-specific captions based on labels.

const mockGenerator = async (base64, style, prelabels = null, userDesc = '', topicOverride = '') => {
  try {
    const preds = prelabels || (await classifyImageFromDataUrl(base64, 5))
    // filter low-confidence labels
    const MIN_CONF = 0.35
    const good = preds.filter(p => (p.probability ?? 0) >= MIN_CONF)
    const labels = good.length > 0 ? good.map(p => p.className.split(',')[0]) : preds.map(p => p.className.split(',')[0])
    const main = labels[0] || 'object'
    const extras = labels.slice(1).join(', ')

    // If top prediction is a person/people, prefer people-focused captions instead
    const personKeywords = ['person','man','woman','boy','girl','people','human']
    const isPerson = labels.some(l => personKeywords.some(k => l.toLowerCase().includes(k)))

    // If user provided a description, prefer generating captions around it.
    const variations = []
    const useDesc = (typeof userDesc === 'string' && userDesc.trim().length > 0)
    const desc = (userDesc || '').trim()

    if (useDesc || topicOverride) {
  // Determine topic: prefer explicit topicOverride, then the user's description, otherwise use focused prelabels
  const topic = topicOverride && topicOverride.trim().length > 0 ? topicOverride : (useDesc ? extractTopicFromText(desc) : ((prelabels && prelabels.length > 0) ? (prelabels[0].className.split(',')[0]) : extractTopicFromText(desc)))
      const topicSyn = synonymFor(topic)
      // Build three creative captions that DO NOT repeat the user's description verbatim
      const caps = []
      if (/funny/i.test(style)){
        caps.push(`${capPrefix('funny')} ${funnyTemplate(topicSyn, desc, 0)}`)
        caps.push(`${capPrefix('funny')} ${funnyTemplate(topicSyn, desc, 1)}`)
        caps.push(`${capPrefix('funny')} ${funnyTemplate(topicSyn, desc, 2)}`)
      } else if (/instagram/i.test(style)){
        caps.push(`${capPrefix('insta')} ${instaTemplate(topicSyn, desc, 0)}`)
        caps.push(`${capPrefix('insta')} ${instaTemplate(topicSyn, desc, 1)}`)
        caps.push(`${capPrefix('insta')} ${instaTemplate(topicSyn, desc, 2)}`)
      } else if (/professional/i.test(style)){
        caps.push(`${capPrefix('prof')} ${profTemplate(topicSyn, desc, 0)}`)
        caps.push(`${capPrefix('prof')} ${profTemplate(topicSyn, desc, 1)}`)
        caps.push(`${capPrefix('prof')} ${profTemplate(topicSyn, desc, 2)}`)
      } else {
        caps.push(`${capPrefix('desc')} ${descTemplate(topicSyn, desc, 0)}`)
        caps.push(`${capPrefix('desc')} ${descTemplate(topicSyn, desc, 1)}`)
        caps.push(`${capPrefix('desc')} ${descTemplate(topicSyn, desc, 2)}`)
      }

      // ensure uniqueness and return exactly 3
      const uniq = [...new Set(caps)]
      return uniq.slice(0, 3)
    }
  if (isPerson) {
      // people-focused captions
      if (/funny/i.test(style)){
        variations.push(`😄 Funny → "You and your friend making memories."`)
        variations.push(`😂 "That look when you and your buddy plan the perfect day."`)
        variations.push(`🤣 "Friends like these make life fun."`)
        variations.push(`😆 "Laughs, smiles, and good vibes with friends."`)
        variations.push(`😜 "Caption this friendship moment."`)
      } else if (/instagram/i.test(style)){
        variations.push(`📸 Instagram → "Squad vibes and golden memories ✨"`)
        variations.push(`🌿 "Catching feels with this one ✨"`)
        variations.push(`💫 "Unforgettable moments with my people."`)
        variations.push(`❤️ "Friends, laughter, and live moments."`)
      } else if (/professional/i.test(style)){
        variations.push(`💼 Professional → "Portrait capturing natural interaction between friends."`)
        variations.push(`📊 "High-quality candid of people in relaxed setting."`)
      } else {
        variations.push(`🧠 ${style} → "A photo showing people enjoying time together."`)
        variations.push(`🔎 Descriptive → "Two people captured in a candid moment."`)
      }
    } else {
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
        variations.push(`📈 "Image suitable for professional portfolios — ${main}."`)
      } else {
        variations.push(`🧠 ${style} → "A ${main} ${extras ? `with ${extras} ` : ''}captured in the photo."`)
        variations.push(`🔎 Descriptive → "A clear photo of ${aOrAn(main)} ${main}${extras ? ` featuring ${extras}` : ''}."`)
        variations.push(`🧭 "The image prominently shows ${main}${extras ? ` alongside ${extras}` : ''}."`)
        variations.push(`🎯 "Focused shot highlighting ${main} and its context."`)
        variations.push(`🖼️ "Photograph of ${main}${extras ? `, ${extras}` : ''}."`)
      }
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

export async function generateCaptions(base64Image, style = 'Descriptive', prelabels = null, userDescription = '', topicOverride = '') {
  const key = import.meta.env.VITE_OPENAI_API_KEY
  if (!key) {
    return mockGenerator(base64Image, style, prelabels, userDescription, topicOverride)
  }

  try {
    const prompt = `You are given an image (base64) and an optional user description. Generate 4 short, distinct captions tailored to the image and the user's description (if provided). Style: ${style}. User description: ${userDescription || 'none'}. Return a JSON array of strings.`
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

export { extractTopicFromText }

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

// Helpers to generate caption variations from user's description (simple templates)
function makeFunny(desc, variant = 0){
  const b = shortify(desc, 7)
  switch(variant){
    case 1: return `That moment when ${b} — can't stop laughing.`
    case 2: return `POV: ${b}. Everyone's reaction = priceless.`
    case 3: return `Caption this: ${b}… I'll wait.`
    case 4: return `${b} — and the internet owes us this one.`
    default: return `When ${b} steals the spotlight.`
  }
}

function makeInsta(desc, variant = 0){
  const emojis = ['🌿','✨','💫','🔥','❤️','🌅','🌊']
  const pick = emojis[Math.floor(Math.random()*emojis.length)]
  const b = shortify(desc, 10)
  switch(variant){
    case 1: return `${b} ${pick}`
    case 2: return `${b} • good vibes only ${pick}`
    case 3: return `${b} — memories for keeps ${pick}`
    case 4: return `${b} ✨ #moment`
    default: return `${b} ${pick} #life`
  }
}

function makeProfessional(desc, variant = 0){
  const b = shortify(desc, 12)
  switch(variant){
    case 1: return `Professional depiction of ${b}.`
    case 2: return `${b} — captured with clarity and intent.`
    case 3: return `An elegant photograph showcasing ${b}.`
    default: return `${b} — a refined capture.`
  }
}

function makeDescriptive(desc, variant = 0){
  const b = shortify(desc, 20)
  switch(variant){
    case 1: return `${b} in clear detail.`
    case 2: return `A photo showing ${b}.`
    case 3: return `${b} captured naturally.`
    case 4: return `${b} — an observed moment.`
    default: return `${b}`
  }
}

// return first n words of desc, sanitized
function shortify(text, n = 8){
  if (!text) return ''
  const cleaned = text.replace(/\s+/g, ' ').trim()
  const words = cleaned.split(' ')
  if (words.length <= n) return cleaned
  return words.slice(0, n).join(' ') + '...'
}

// New helpers for creative captions
function extractTopicFromText(text){
  if (!text) return 'this moment'
  const cleaned = text.replace(/[.,!?]/g, '').toLowerCase()
  const words = cleaned.split(/\s+/).filter(Boolean)
  // basic stopwords/pronouns to ignore
  const stop = new Set(['me','i','my','we','us','you','your','and','the','a','an','this','that','these','those','best','so','very','with','at','in','on'])
  // prefer the last non-stopword token (usually the subject noun)
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i]
    if (!stop.has(w)) return w
  }
  return words.length > 0 ? words[words.length-1] : 'moment'
}

function synonymFor(word){
  if (!word) return word
  const map = {
    friend: 'partner-in-crime',
    friends: 'crew',
    beach: 'shore',
    sunset: 'golden hour',
    dog: 'pup',
    cat: 'kitty',
    food: 'treats',
    party: 'bash'
  }
  const w = word.toLowerCase()
  return map[w] || word
}

function capPrefix(kind){
  switch(kind){
    case 'funny': return '😄'
    case 'insta': return '📸'
    case 'prof': return '💼'
    default: return ''
  }
}

function funnyTemplate(topic, desc, variant=0){
  const t = topic
  switch(variant){
    case 1: return `Who knew ${t}s had such dramatic talent?`;
    case 2: return `${t}s doing the most — and we’re here for it.`;
    default: return `${t} energy: maximum chaos, zero regrets.`;
  }
}

function instaTemplate(topic, desc, variant=0){
  const t = topic
  switch(variant){
    case 1: return `${t} + golden light = memory locked.`;
    case 2: return `Collecting small moments with ${t}.`;
    default: return `${t} vibes and good times.`;
  }
}

function profTemplate(topic, desc, variant=0){
  const t = topic
  switch(variant){
    case 1: return `A refined capture highlighting ${t}.`;
    case 2: return `A tasteful composition featuring ${t}.`;
    default: return `Clean, professional portrait of ${t}.`;
  }
}

function descTemplate(topic, desc, variant=0){
  const t = topic
  switch(variant){
    case 1: return `A candid shot centered on ${t}.`;
    case 2: return `An intimate moment with ${t}, captured simply.`;
    default: return `A clear image showcasing ${t}.`;
  }
}


