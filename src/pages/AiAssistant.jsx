import { useState } from "react";
import { base44 } from "@/api/base44";
import { ArrowRight, Brain, MessageSquare } from "lucide-react";

const QUICK_PROMPTS = [
  {
    label: "Study plan",
    prompt: "Create a daily study plan for a student who has 3 hours available each day.",
  },
  {
    label: "Summarize content",
    prompt: "Summarize this study material into a short list of key points.",
  },
  {
    label: "Pomodoro advice",
    prompt: "Explain how to use the Pomodoro technique for studying effectively.",
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (promptText) => {
    const prompt = promptText || input.trim();
    if (!prompt) return;
    setError("");
    setMessages((current) => [...current, { role: "user", content: prompt }]);
    setInput("");
    setLoading(true);

    try {
      const response = await base44.ai.ask(prompt);
      setMessages((current) => [...current, { role: "assistant", content: response }]);
    } catch (err) {
      setError(err.message || "AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="glass rounded-[2rem] border border-border p-8 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">AI Assistant</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">Ask for study help</h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">Get practical guidance and study planning tips in the same workspace.</p>
            </div>
            <div className="rounded-full bg-muted px-4 py-3 text-sm text-muted-foreground">Local + AI</div>
          </div>
        </div>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                Ask a question, create a study plan, or request a summary. If VITE_AI_API_KEY is set, the request will go to the external API.
              </div>

              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => sendMessage(item.prompt)}
                  className="w-full rounded-3xl border border-border bg-white px-4 py-4 text-left text-sm transition hover:border-primary hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.prompt}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-primary text-white">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Chat</h2>
                  <p className="text-sm text-muted-foreground">Your study assistant replies here.</p>
                </div>
              </div>
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                {messages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    The assistant will respond after you send a message.
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-3xl p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}
                    >
                      <div className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">{message.role === "user" ? "You" : "Assistant"}</div>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  ))
                )}
              </div>
              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
              <div className="mt-4 flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-3xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
