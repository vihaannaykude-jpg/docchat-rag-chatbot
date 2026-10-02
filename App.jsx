import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "./state/ChatContext.jsx";
import { askQuestion } from "./api/ragClient.js";
import Sidebar from "./components/Sidebar.jsx";
import MessageBubble from "./components/MessageBubble.jsx";
import Composer from "./components/Composer.jsx";

export default function App() {
  const { state, dispatch } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  const chat = state.chats.find((c) => c.id === state.activeId);
  const lastLen = chat.messages.at(-1)?.content.length;

  // Keep the newest tokens in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.id, chat.messages.length, lastLen]);

  const send = useCallback(
    async (question) => {
      const chatId = state.activeId;
      const history = chat.messages
        .filter((m) => !m.streaming)
        .map(({ role, content }) => ({ role, content }));
      const userId = crypto.randomUUID();
      const botId = crypto.randomUUID();
      dispatch({ type: "add_exchange", chatId, userId, botId, question });

      const controller = new AbortController();
      abortRef.current = controller;
      const started = performance.now();
      let error;

      // Batch token updates into one dispatch per animation frame.
      let pending = "";
      let frame = 0;
      const flush = () => {
        frame = 0;
        if (!pending) return;
        dispatch({ type: "append_token", chatId, id: botId, token: pending });
        pending = "";
      };

      try {
        await askQuestion({
          question,
          history,
          signal: controller.signal,
          onSources: (sources) => dispatch({ type: "set_sources", chatId, id: botId, sources }),
          onToken: (token) => {
            pending += token;
            if (!frame) frame = requestAnimationFrame(flush);
          },
        });
      } catch (e) {
        if (e.name !== "AbortError") error = e.message || "Something went wrong.";
      } finally {
        cancelAnimationFrame(frame);
        flush();
        dispatch({
          type: "finish",
          chatId,
          id: botId,
          error,
          ms: performance.now() - started,
        });
      }
    },
    [state.activeId, chat.messages, dispatch]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <main className="main">
        <header className="topbar">
          <button
            className="menu"
            aria-label="Open chat history"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1>DocChat</h1>
          <span className="mode">{import.meta.env.VITE_RAG_API_URL ? "API" : "Local demo"}</span>
        </header>

        <div className="messages" ref={scrollRef} role="log" aria-live="polite">
          {chat.messages.length === 0 ? (
            <div className="empty">
              <h2>Ask your documents anything</h2>
              <p>Answers are retrieved from the knowledge base and cited below each reply.</p>
            </div>
          ) : (
            chat.messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
        </div>

        <Composer
          onSend={send}
          onStop={stop}
          busy={state.busy}
          showSuggestions={chat.messages.length === 0}
        />
      </main>
    </div>
  );
}
