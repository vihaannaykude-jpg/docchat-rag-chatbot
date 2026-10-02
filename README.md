# DocChat — RAG Chatbot (React + Vite)

A responsive chat front-end for question answering over a document knowledge base.

## Features
- **Streaming answers** rendered token by token (token updates batched per animation frame)
- **Chat history** with multiple conversations, persisted in `localStorage`
- **State management** via `useReducer` + Context (`src/state/ChatContext.jsx`)
- **Source citations** under every answer, with relevance scores
- **Markdown rendering** for answers (`react-markdown`)
- **Responsive layout**: sidebar collapses to a drawer on phones; light/dark theme
- **Stop button** to cancel a streaming response
- **Memoized components** so only the streaming message re-renders

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Two modes
1. **Local demo (default):** answers come from the sample documents in
   `src/data/docs.js`, retrieved with a small client-side TF-IDF retriever.
   Replace those documents with your own to try it on real content.
2. **Real backend:** copy `.env.example` to `.env` and set `VITE_RAG_API_URL`.
   The app will `POST { question, history }` to that URL and stream the response body.
   Plain text is shown as the answer; an optional final line such as
   `{"sources":[{"title":"…","snippet":"…","score":0.82}]}` populates the citations.

## Layout
```
src/
  api/ragClient.js         streaming client (local or remote)
  api/localRetriever.js    TF-IDF retriever for the demo mode
  data/docs.js             sample knowledge base
  state/ChatContext.jsx    reducer, context, localStorage persistence
  components/              Sidebar, MessageBubble, Sources, Composer
  App.jsx, main.jsx, styles.css
```

## Measuring latency (for your resume)
Each assistant message shows its total response time. To back up a latency claim,
compare time-to-first-token with streaming on versus a non-streaming baseline using
the browser Performance panel, and record the numbers before quoting a percentage.
