// Tiny client-side retriever: TF-IDF over sentence-window chunks.
// It exists so the app works with no backend; a real deployment would call a
// vector store through the API client instead.
import { DOCS } from "../data/docs.js";

const STOP = new Set(
  "a an and are as at be but by for from has have how i in is it its of on or so that the their this to was what when where which who why will with you your do does can about into than then them they there these those not no".split(
    " "
  )
);

const tokenize = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w))
    .map((w) => (w.length > 5 && w.endsWith("ing") ? w.slice(0, -3) : w));

function buildIndex() {
  const chunks = [];
  for (const doc of DOCS) {
    const sentences = doc.text.match(/[^.!?]+[.!?]+/g) ?? [doc.text];
    for (let i = 0; i < sentences.length; i += 2) {
      const text = sentences.slice(i, i + 2).join(" ").trim();
      chunks.push({ title: doc.title, text, terms: tokenize(text) });
    }
  }
  const df = new Map();
  for (const c of chunks) for (const t of new Set(c.terms)) df.set(t, (df.get(t) ?? 0) + 1);
  const n = chunks.length;
  const idf = (t) => Math.log(1 + n / (df.get(t) ?? n));
  return { chunks, idf };
}

const index = buildIndex();

export function retrieve(query, k = 3) {
  const q = tokenize(query);
  if (!q.length) return [];
  const scored = index.chunks.map((c) => {
    const tf = new Map();
    for (const t of c.terms) tf.set(t, (tf.get(t) ?? 0) + 1);
    let score = 0;
    for (const t of q) score += (tf.get(t) ?? 0) * index.idf(t);
    return { title: c.title, snippet: c.text, score: score / Math.sqrt(c.terms.length || 1) };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
