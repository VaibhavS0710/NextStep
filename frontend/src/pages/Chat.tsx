import { type FormEvent, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { api } from "../lib/api";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  typing?: boolean;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi, I'm NextStep Assistant 👋\nAsk me about internships or your application status.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMsg, typingBotBubble()]);
    setLoading(true);

    try {
      const res = await api.post("/chat/student", {
        message: input,
        sessionId: sessionId || undefined,
      });

      const { reply, suggestions, sessionId: newSessionId } = res.data;
      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);
      }

      const botText =
        reply +
        (suggestions && suggestions.length
          ? "\n\nSuggestions:\n" +
            suggestions.map((s: string) => `• ${s}`).join("\n")
          : "");

      setMessages((prev) => [
        ...prev.filter((m) => !m.typing),
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: botText,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev.filter((m) => !m.typing),
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text:
            err?.response?.data?.message ||
            "Sorry, something went wrong while talking to the assistant.",
        },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const typingBotBubble = (): ChatMessage => ({
    id: `typing-${Date.now()}`,
    sender: "bot",
    text: "",
    typing: true,
  });

  return (
    <ProtectedRoute>
      <Layout>
        <h1 style={{ marginBottom: "0.6rem" }}>NextStep Assistant</h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--ns-text-soft)",
            marginTop: 0,
            marginBottom: "0.7rem",
          }}
        >
          Ask me to find internships (e.g.,{" "}
          <strong>"remote react internships"</strong>) or check{" "}
          <strong>"my application status"</strong>.
        </p>

        <div className="chat-shell">
          <div className="chat-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble-row ${m.sender === "user" ? "user" : "bot"}`}
              >
                <div className={`chat-bubble ${m.sender}`}>
                  {m.typing ? (
                    <span className="typing-indicator">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ChatPage;
