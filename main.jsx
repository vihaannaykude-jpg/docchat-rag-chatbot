import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ChatProvider } from "./state/ChatContext.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
