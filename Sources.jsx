import { memo } from "react";

function Sources({ sources }) {
  if (!sources?.length) return null;
  return (
    <details className="sources">
      <summary>
        {sources.length} source{sources.length > 1 ? "s" : ""}
      </summary>
      <ul>
        {sources.map((s, i) => (
          <li key={i}>
            <span className="source-title">{s.title}</span>
            {typeof s.score === "number" && (
              <span className="source-score">{s.score.toFixed(2)}</span>
            )}
            <p>{s.snippet}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default memo(Sources);
