// Sample knowledge base. Replace with your own documents, or point the app at a
// real backend via VITE_RAG_API_URL (see README).
export const DOCS = [
  {
    id: "vite",
    title: "Vite Overview",
    text: "Vite is a build tool that serves source files over native ES modules during development, so the dev server starts almost instantly. Hot Module Replacement keeps edits fast regardless of app size. For production, Vite bundles the app with Rollup, producing optimized static assets. Environment variables prefixed with VITE_ are exposed to client code through import.meta.env.",
  },
  {
    id: "react-state",
    title: "React State Management",
    text: "React components hold local state with useState, while useReducer suits state with several related transitions. Context lets many components read shared state without prop drilling, but every consumer re-renders when the context value changes. Wrapping components with React.memo and stabilising callbacks with useCallback limits unnecessary re-renders. For large apps, libraries such as Redux Toolkit or Zustand add structure.",
  },
  {
    id: "rag",
    title: "What is Retrieval-Augmented Generation",
    text: "Retrieval-Augmented Generation, or RAG, combines a retriever with a language model. Documents are split into chunks and indexed, often as vector embeddings. At question time the retriever finds the chunks most relevant to the query and passes them to the model as context, so answers are grounded in the knowledge base and can cite sources. RAG reduces hallucination and lets you update knowledge without retraining the model.",
  },
  {
    id: "chunking",
    title: "Chunking Strategies",
    text: "Chunk size affects retrieval quality. Small chunks of around 200 to 400 tokens are precise but may lose context; large chunks keep context but dilute relevance. Overlapping chunks by 10 to 20 percent avoids cutting a fact in half. Splitting on headings or paragraphs usually works better than fixed character counts.",
  },
  {
    id: "streaming",
    title: "Streaming Responses in the Browser",
    text: "Streaming lets the interface show an answer token by token instead of waiting for the full response. In the browser, fetch exposes response.body as a ReadableStream that can be read with a reader and decoded with TextDecoder. Showing the first tokens quickly cuts perceived latency even when total generation time is unchanged, because the user starts reading immediately.",
  },
  {
    id: "performance",
    title: "Front-end Performance Tips",
    text: "To keep a chat interface responsive, memoize message components so only the streaming message re-renders, batch token updates with requestAnimationFrame, and virtualize very long histories. Lazy load heavy dependencies such as Markdown renderers. Debounce expensive input handlers and avoid storing large objects in context that changes on every keystroke.",
  },
  {
    id: "accessibility",
    title: "Accessible Chat Interfaces",
    text: "Chat interfaces should announce new messages to screen readers using an aria-live region, keep focus on the input after sending, support Enter to send and Shift+Enter for a new line, and maintain sufficient colour contrast. A responsive layout that collapses the sidebar on small screens keeps the conversation usable on phones.",
  },
];
