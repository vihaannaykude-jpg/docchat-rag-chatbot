import { memo } from "react";
import ReactMarkdown from "react-markdown";
import Sources from "./Sources.jsx";

// Memoized so only the message that is actively streaming re-renders per token.
function MessageBubble({ message }) {
  const { role, content, sources, streaming, error, ms } = message;
  return (
    <div className={`message ${role}`}>
      <div className="avatar" aria-hidden="true">
        {role === "user" ? "You" : "AI"}
      </div>
      <div className="bubble">
        {role === "assistant" && streaming && !content ? (
          <span className="typing" aria-label="Assistant is typing">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
        {error && <p className="error">{error}</p>}
        {role === "assistant" && !streaming && <Sources sources={sources} />}
        {role === "assistant" && !streaming && ms != null && (
          <span className="meta">{(ms / 1000).toFixed(2)}s</span>
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
