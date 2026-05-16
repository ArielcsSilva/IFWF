import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export default function Pomodoro() {
  const [mode, setMode] = useState("focus");
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCards = async () => {
      const savedCards = await base44.entities.Card.findMany();
      setCards(savedCards);
    };
    loadCards();
  }, []);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const interval = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setRunning(false);
          handleSessionComplete();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, mode, selectedCardId, cards]);

  useEffect(() => {
    setSeconds(mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
    setRunning(false);
  }, [mode]);

  const handleSessionComplete = async () => {
    if (mode === "focus") {
      const selectedCard = cards.find((card) => card.id === selectedCardId);
      await base44.entities.StudySession.create({
        cardId: selectedCardId || null,
        cardTitle: selectedCard?.title || null,
        durationMinutes: 25,
        score: selectedCard ? `Focused on ${selectedCard.title}` : "Focus session completed",
        timestamp: new Date().toISOString(),
      });
      setMessage("Focus session completed and recorded.");
      setMode("break");
    } else {
      setMessage("Break complete. Ready to return to focus?");
      setMode("focus");
    }
  };

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  }, [seconds]);

  const totalSeconds = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  return (
    <div className="min-h-[calc(100vh-96px)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Pomodoro</p>
          <h1 className="mt-4 text-4xl font-semibold">Focus timer</h1>
          <p className="mt-2 text-sm text-muted-foreground">Use the timer to log study sessions automatically.</p>

          <div className="mt-10 rounded-3xl border border-border bg-muted/50 p-10 shadow-sm">
            <div className="mx-auto mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-card text-5xl font-mono tracking-tight text-foreground shadow-sm">
              {formattedTime}
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={() => setMode("focus")}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === "focus" ? "bg-primary text-white" : "bg-card text-foreground hover:bg-muted"}`}
              >
                Focus
              </button>
              <button
                type="button"
                onClick={() => setMode("break")}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === "break" ? "bg-primary text-white" : "bg-card text-foreground hover:bg-muted"}`}
              >
                Break
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={() => setRunning((current) => !current)}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {running ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  setSeconds(mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold">Linked card</h2>
            <p className="mt-2 text-sm text-muted-foreground">Choose a card to attach this session to. This is optional.</p>
            <select
              value={selectedCardId}
              onChange={(event) => setSelectedCardId(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">No card selected</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.title}
                </option>
              ))}
            </select>
            <p className="mt-4 text-sm text-muted-foreground">When focus ends, the session will be logged automatically.</p>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold">Tips</h2>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              <p>Use consistent 25-minute focus sessions and short breaks.</p>
              <p>Record each session to build a study habit over time.</p>
              <p>Link a card to keep your study tasks organized.</p>
            </div>
          </section>
        </div>

        {message && (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-foreground shadow-card">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
