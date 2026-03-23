import axios from 'axios'

// generateCaptions(base64Image, style, tone) -> Promise<string[]>
// This function tries to call OpenAI Vision / image->caption endpoint if OPENAI_API_KEY
// is provided via environment (VITE_OPENAI_API_KEY). If not provided, it returns
// a mocked set of captions for local testing.

const mockGenerator = async (base64, style, tone) => {
  // return 4 variations
  const seed = style + '|' + tone
  const variants = [
    `${style} → "A ${style.toLowerCase()} caption for the uploaded image"`,
    `😄 Funny → "When you finally touch grass"`,
    `📸 Instagram → "Living my best life 🌿✨"`,
    `🧠 Description → "An image showing something interesting"`,
  ]
  return variants.slice(0, 4)
}

export async function generateCaptions(base64Image, style = 'Descriptive', tone = 'Neutral') {
  const key = import.meta.env.VITE_OPENAI_API_KEY
  if (!key) {
    // no API key: fallback to mock
    return mockGenerator(base64Image, style, tone)
  }

  // Example using OpenAI images or vision endpoint. The exact endpoint and
  // request format depends on the provider; this is a generic pattern and
  // may need adjustment based on the chosen API.
  try {
    const prompt = `Generate 4 short captions in the style: ${style}. Tone: ${tone}. Return as a JSON array of strings.`
    // Use OpenAI's responses endpoint (chat/completions) with an image reference.
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
    if (!text) return mockGenerator(base64Image, style, tone)

    // try to parse JSON array out of the response
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) return parsed
    } catch (e) {
      // fallback: split by lines
      return text.split(/\n+/).filter(Boolean).slice(0, 5)
    }
  } catch (e) {
    console.error('API error, falling back to mock', e)
    return mockGenerator(base64Image, style, tone)
  }
}
