import { memo, useState } from "react";

const SUGGESTIONS = [
  "What is retrieval-augmented generation?",
  "How does streaming reduce perceived latency?",
  "How should I chunk documents?",
];

function Composer({ onSend, onStop, busy, showSuggestions }) {
  const [text, setText] = useState("");

  const submit = (value = text) => {
    const q = value.trim();
    if (!q || busy) return;
    onSend(q);
    setText("");
  };

  return (
    <div className="composer">
      {showSuggestions && (
        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => submit(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          value={text}
          rows={1}
          placeholder="Ask about your documents…"
          aria-label="Message"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        {busy ? (
          <button type="button" className="stop" onClick={onStop}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!text.trim()}>
            Send
          </button>
        )}
      </form>
    </div>
  );
}

export default memo(Composer);
