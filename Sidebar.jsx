import { memo } from "react";
import { useChat } from "../state/ChatContext.jsx";

function Sidebar({ open, onClose }) {
  const { state, dispatch } = useChat();
  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <button
          className="new-chat"
          onClick={() => {
            dispatch({ type: "new_chat" });
            onClose();
          }}
        >
          + New chat
        </button>
        <nav aria-label="Chat history">
          {state.chats.map((c) => (
            <div key={c.id} className={`chat-item ${c.id === state.activeId ? "active" : ""}`}>
              <button
                className="chat-title"
                onClick={() => {
                  dispatch({ type: "select_chat", id: c.id });
                  onClose();
                }}
              >
                {c.title}
              </button>
              <button
                className="chat-delete"
                aria-label={`Delete chat ${c.title}`}
                onClick={() => dispatch({ type: "delete_chat", id: c.id })}
              >
                ×
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default memo(Sidebar);
