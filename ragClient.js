import { retrieve } from "./localRetriever.js";

const API_URL = import.meta.env.VITE_RAG_API_URL;
const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

/**
 * Ask the knowledge base a question.
 * Calls onSources(sources) once, then onToken(text) repeatedly as the answer streams.
 */
export async function askQuestion({ question, history, onSources, onToken, signal }) {
  if (API_URL) return askRemote({ question, history, onSources, onToken, signal });
  return askLocal({ question, onSources, onToken, signal });
}

async function askLocal({ question, onSources, onToken, signal }) {
  await sleep(250, signal); // simulate retrieval latency
  const sources = retrieve(question, 3);
  onSources(sources);

  const answer = sources.length
    ? `Based on the knowledge base:\n\n${sources
        .map((s, i) => `${i + 1}. **${s.title}** — ${s.snippet}`)
        .join("\n\n")}\n\n_Sources are listed below the answer._`
    : "I couldn't find anything relevant in the knowledge base. Try rephrasing, or ask about Vite, React state, RAG, chunking, streaming, performance, or accessibility.";

  for (const word of answer.split(/(\s+)/)) {
    await sleep(12, signal);
    onToken(word);
  }
}

async function askRemote({ question, history, onSources, onToken, signal }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  // The stream is plain answer text; a final line like {"sources":[...]} is
  // parsed out and not shown. We hold back the tail of the buffer until we know
  // it isn't the start of that trailing JSON line.
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const cut = buffer.lastIndexOf("\n{");
    const safe = cut === -1 ? Math.max(0, buffer.length - 1) : cut;
    if (safe > 0) {
      onToken(buffer.slice(0, safe));
      buffer = buffer.slice(safe);
    }
  }

  const tail = buffer.trim();
  if (tail.startsWith("{")) {
    try {
      onSources(JSON.parse(tail).sources ?? []);
    } catch {
      onToken(buffer);
    }
  } else if (buffer) {
    onToken(buffer);
  }
}
