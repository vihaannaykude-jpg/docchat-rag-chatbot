import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const STORAGE_KEY = "docchat.v1";

const newChat = () => ({
  id: crypto.randomUUID(),
  title: "New chat",
  messages: [],
  createdAt: Date.now(),
});

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.chats?.length) {
      // Never restore a half-streamed message as "streaming".
      const chats = saved.chats.map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({ ...m, streaming: false })),
      }));
      return { chats, activeId: saved.activeId ?? chats[0].id, busy: false };
    }
  } catch {
    /* ignore corrupt storage */
  }
  const chat = newChat();
  return { chats: [chat], activeId: chat.id, busy: false };
}

function updateChat(state, id, fn) {
  return { ...state, chats: state.chats.map((c) => (c.id === id ? fn(c) : c)) };
}

function reducer(state, action) {
  switch (action.type) {
    case "new_chat": {
      const chat = newChat();
      return { ...state, chats: [chat, ...state.chats], activeId: chat.id };
    }
    case "select_chat":
      return { ...state, activeId: action.id };
    case "delete_chat": {
      const chats = state.chats.filter((c) => c.id !== action.id);
      if (!chats.length) {
        const chat = newChat();
        return { ...state, chats: [chat], activeId: chat.id };
      }
      const activeId = state.activeId === action.id ? chats[0].id : state.activeId;
      return { ...state, chats, activeId };
    }
    case "add_exchange":
      return {
        ...updateChat(state, action.chatId, (c) => ({
          ...c,
          title: c.messages.length ? c.title : action.question.slice(0, 40),
          messages: [
            ...c.messages,
            { id: action.userId, role: "user", content: action.question },
            { id: action.botId, role: "assistant", content: "", sources: [], streaming: true },
          ],
        })),
        busy: true,
      };
    case "set_sources":
      return updateChat(state, action.chatId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === action.id ? { ...m, sources: action.sources } : m
        ),
      }));
    case "append_token":
      return updateChat(state, action.chatId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === action.id ? { ...m, content: m.content + action.token } : m
        ),
      }));
    case "finish":
      return {
        ...updateChat(state, action.chatId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === action.id
              ? { ...m, streaming: false, error: action.error, ms: action.ms }
              : m
          ),
        })),
        busy: false,
      };
    default:
      return state;
  }
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ chats: state.chats, activeId: state.activeId })
      );
    } catch {
      /* storage full or unavailable */
    }
  }, [state.chats, state.activeId]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
