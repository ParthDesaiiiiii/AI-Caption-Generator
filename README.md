# AI Image Caption Generator (Frontend-only)

This is a React + Vite frontend app that generates captions for uploaded images using a vision-capable LLM (OpenAI / Gemini) if you provide an API key, or a mocked generator otherwise.

Features
- Image upload (drag & drop or file picker)
- Preview image
- Generate multiple caption variations
- Caption styles: Descriptive, Funny, Professional, Instagram
- Tone selector: Neutral, Funny, Sarcastic, Motivational
- Copy caption to clipboard
- Download caption overlaid on image
- Dark/Light mode
- History (last 5) stored in localStorage

No backend, no database — everything runs in the browser. If you want the real AI integration, set VITE_OPENAI_API_KEY in a .env file.

Setup

1. Install dependencies

```bash
npm install
```

2. (Optional) Add OpenAI API key for real captions

Create a `.env` file with:

```
VITE_OPENAI_API_KEY=sk-...yourkey...
```

3. Run dev server

```bash
npm run dev
```

Notes
- If no API key is set, the app uses a mock generator so you can try UI features offline.
- The OpenAI request in `src/utils/api.js` is a sample pattern — you may need to adapt it to the exact image/vision endpoint and model you choose.
