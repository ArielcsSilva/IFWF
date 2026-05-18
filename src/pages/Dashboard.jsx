import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock, LayoutDashboard, Sparkles, Edit3 } from "lucide-react";
import { base44 } from "@/api/base44";

export default function Dashboard() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState("");
  const [editingBoardDescription, setEditingBoardDescription] = useState("");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingSessionScore, setEditingSessionScore] = useState("");
  const [editingSessionDuration, setEditingSessionDuration] = useState("");
  const [editingSessionCardTitle, setEditingSessionCardTitle] = useState("");
  const [metricOverrides, setMetricOverrides] = useState([]);
  const [editingMetricId, setEditingMetricId] = useState(null);
  const [editingMetricLabel, setEditingMetricLabel] = useState("");
  const [editingMetricValue, setEditingMetricValue] = useState("");
  const [editingBoardImageUrl, setEditingBoardImageUrl] = useState("");
  const [editingBoardLinkUrl, setEditingBoardLinkUrl] = useState("");
  const [tipText, setTipText] = useState("");
  const [tipDraft, setTipDraft] = useState("");
  const [isEditingTip, setIsEditingTip] = useState(false);

  const defaultTipText =
    "Use the Pomodoro timer for focused 25-minute sessions, then log the session to track your progress over time.";
  const metricStorageKey = "dashboardMetricOverrides";

  const metricDefinitions = [
    { id: "boards", label: "Boards", icon: LayoutDashboard, color: "bg-violet-500/10 text-violet-700" },
    { id: "tasks", label: "Tasks", icon: BookOpen, color: "bg-sky-500/10 text-sky-700" },
    { id: "sessions", label: "Sessions", icon: Clock, color: "bg-emerald-500/10 text-emerald-700" },
    { id: "completed", label: "Completed", icon: CheckCircle2, color: "bg-amber-500/10 text-amber-700" },
  ];

  useEffect(() => {
    const savedTip = window.localStorage.getItem("dashboardTipText");
    const savedMetricOverrides = window.localStorage.getItem(metricStorageKey);
    setTipText(savedTip || defaultTipText);
    setMetricOverrides(savedMetricOverrides ? JSON.parse(savedMetricOverrides) : []);
  }, []);

  const saveMetricOverrides = (items) => {
    setMetricOverrides(items);
    window.localStorage.setItem(metricStorageKey, JSON.stringify(items));
  };

  const startEditingTip = () => {
    setTipDraft(tipText);
    setIsEditingTip(true);
  };

  const saveTipEdit = () => {
    const nextTip = tipDraft.trim() || defaultTipText;
    setTipText(nextTip);
    window.localStorage.setItem("dashboardTipText", nextTip);
    setIsEditingTip(false);
  };

  const cancelTipEdit = () => {
    setTipDraft(tipText);
    setIsEditingTip(false);
  };

  const startEditingMetric = (metric) => {
    setEditingMetricId(metric.id);
    setEditingMetricLabel(metric.label);
    setEditingMetricValue(metric.value);
  };

  const cancelMetricEdit = () => {
    setEditingMetricId(null);
  };

  const startEditingBoard = (board) => {
    setEditingBoardId(board.id);
    setEditingBoardTitle(board.title || "");
    setEditingBoardDescription(board.description || "");
    setEditingBoardImageUrl(board.imageUrl || "");
    setEditingBoardLinkUrl(board.linkUrl || "");
  };

  const saveBoardEdits = async (boardId) => {
    const updatedBoard = await base44.entities.Board.update(boardId, {
      title: editingBoardTitle.trim() || "Untitled board",
      description: editingBoardDescription.trim(),
      imageUrl: editingBoardImageUrl.trim() || undefined,
      linkUrl: editingBoardLinkUrl.trim() || undefined,
    });
    setBoards((current) => current.map((item) => (item.id === boardId ? updatedBoard : item)));
    setEditingBoardId(null);
  };

  const saveMetricEdits = (metricId) => {
    const definition = metricDefinitions.find((metric) => metric.id === metricId);
    const defaultValue = metricId === "boards" ? String(boards.length) : metricId === "tasks" ? String(totalTasks) : metricId === "sessions" ? String(sessions.length) : metricId === "completed" ? String(doneTasks) : "0";
    const nextLabel = editingMetricLabel.trim() || definition?.label || "Metric";
    const nextValue = editingMetricValue.trim() || defaultValue;
    const updatedOverrides = [...metricOverrides.filter((item) => item.id !== metricId), { id: metricId, label: nextLabel, value: nextValue }];
    saveMetricOverrides(updatedOverrides);
    setEditingMetricId(null);
  };

  const cancelBoardEdit = () => {
    setEditingBoardId(null);
  };

  const startEditingSession = (session) => {
    setEditingSessionId(session.id);
    setEditingSessionScore(session.score || "");
    setEditingSessionDuration(String(session.durationMinutes || ""));
    setEditingSessionCardTitle(session.cardTitle || "");
  };

  const saveSessionEdits = async (sessionId) => {
    const updatedSession = await base44.entities.StudySession.update(sessionId, {
      score: editingSessionScore.trim() || "Study session",
      durationMinutes: Number(editingSessionDuration) || 0,
      cardTitle: editingSessionCardTitle.trim() || null,
    });
    setSessions((current) => current.map((item) => (item.id === sessionId ? updatedSession : item)));
    setEditingSessionId(null);
  };

  const cancelSessionEdit = () => {
    setEditingSessionId(null);
  };

  useEffect(() => {
    const loadData = async () => {
      const [savedBoards, savedCards, savedSessions] = await Promise.all([
        base44.entities.Board.findMany(),
        base44.entities.Card.findMany(),
        base44.entities.StudySession.findMany(),
      ]);
      setBoards(savedBoards);
      setCards(savedCards);
      setSessions(savedSessions.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)).slice(0, 10));
    };
    loadData();
  }, []);

  const totalTasks = cards.length;
  const doneTasks = cards.filter((card) => card.column === "Done").length;
  const totalHours = sessions.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0) / 60;
  const recentBoards = boards.slice(0, 3);

  const metrics = metricDefinitions.map((item) => {
    const override = metricOverrides.find((overrideItem) => overrideItem.id === item.id);
    const valueOverride = override?.value !== undefined ? override?.value : item.id === "boards" ? String(boards.length) : item.id === "tasks" ? String(totalTasks) : item.id === "sessions" ? String(sessions.length) : item.id === "completed" ? String(doneTasks) : String(0);
    return {
      ...item,
      label: override?.label || item.label,
      value: valueOverride,
    };
  });

  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="glass rounded-[2rem] border border-border p-8 shadow-card">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your study workflow, organized.</h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">Monitor boards, session history, goals, and focus time in one clean workspace.</p>
            </div>
            <Link
              to="/boards"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Open Boards
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <div key={item.id} className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => startEditingMetric(item)}
                    className="rounded-full p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {editingMetricId === item.id ? (
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveMetricEdits(item.id);
                  }}
                >
                  <label className="block text-sm font-medium text-foreground">
                    Label
                    <input
                      value={editingMetricLabel}
                      onChange={(event) => setEditingMetricLabel(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    Value
                    <input
                      value={editingMetricValue}
                      onChange={(event) => setEditingMetricValue(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                      Save
                    </button>
                    <button type="button" onClick={cancelMetricEdit} className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="mt-6 text-4xl font-semibold">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card xl:col-span-2">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Recent study sessions</h2>
                <p className="text-sm text-muted-foreground">Review the latest sessions you completed.</p>
              </div>
              <Link to="/pomodoro" className="text-sm font-medium text-primary hover:underline">
                Start new session
              </Link>
            </div>
            {sessions.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No study sessions yet. Open Pomodoro to begin.
              </p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="rounded-3xl border border-border p-4">
                    {editingSessionId === session.id ? (
                      <form
                        className="space-y-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          saveSessionEdits(session.id);
                        }}
                      >
                        <label className="block text-sm font-medium text-foreground">
                          Título
                          <input
                            value={editingSessionScore}
                            onChange={(event) => setEditingSessionScore(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                          />
                        </label>
                        <label className="block text-sm font-medium text-foreground">
                          Duração (min)
                          <input
                            type="number"
                            min="0"
                            value={editingSessionDuration}
                            onChange={(event) => setEditingSessionDuration(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                          />
                        </label>
                        <label className="block text-sm font-medium text-foreground">
                          Card
                          <input
                            value={editingSessionCardTitle}
                            onChange={(event) => setEditingSessionCardTitle(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                            Salvar
                          </button>
                          <button type="button" onClick={cancelSessionEdit} className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted">
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{session.score || "Study session"}</p>
                            <p className="text-sm text-muted-foreground">{new Date(session.timestamp || session.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {session.durationMinutes || 0} min
                            </span>
                            <button
                              type="button"
                              onClick={() => startEditingSession(session)}
                              className="rounded-full p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {session.cardTitle && (
                          <p className="mt-3 text-sm text-muted-foreground">Card: {session.cardTitle}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Recent boards</h2>
                <p className="text-sm text-muted-foreground">Jump to your latest projects.</p>
              </div>
            </div>
            {recentBoards.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No boards created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentBoards.map((board) => (
                  <div key={board.id} className="rounded-3xl border border-border p-4">
                    {editingBoardId === board.id ? (
                      <form
                        className="space-y-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          saveBoardEdits(board.id);
                        }}
                      >
                        <label className="block text-sm font-medium text-foreground">
                          Título
                          <input
                            value={editingBoardTitle}
                            onChange={(event) => setEditingBoardTitle(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                          />
                        </label>
                        <label className="block text-sm font-medium text-foreground">
                          Descrição
                          <textarea
                            value={editingBoardDescription}
                            onChange={(event) => setEditingBoardDescription(event.target.value)}
                            rows={3}
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                          />
                        </label>
                        <label className="block text-sm font-medium text-foreground">
                          Imagem URL
                          <input
                            value={editingBoardImageUrl}
                            onChange={(event) => setEditingBoardImageUrl(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                            placeholder="https://example.com/image.jpg"
                          />
                        </label>
                        <label className="block text-sm font-medium text-foreground">
                          Link
                          <input
                            value={editingBoardLinkUrl}
                            onChange={(event) => setEditingBoardLinkUrl(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                            placeholder="https://example.com"
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                            Salvar
                          </button>
                          <button type="button" onClick={cancelBoardEdit} className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted">
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        {board.imageUrl && (
                          <img src={board.imageUrl} alt={board.title} className="h-28 w-full rounded-3xl object-cover" />
                        )}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold">{board.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{board.description || "No description"}</p>
                            {board.linkUrl && (
                              <a href={board.linkUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                                Open board link
                              </a>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/board/${board.id}`)}
                              className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
                            >
                              Abrir
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditingBoard(board)}
                              className="rounded-full p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Quick productivity tip</h2>
                  <p className="text-sm text-muted-foreground">Stay consistent and review daily.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditingTip ? null : (
                <button
                  type="button"
                  onClick={startEditingTip}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
                >
                  <Edit3 className="h-4 w-4" /> Edit tip
                </button>
              )}
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            {isEditingTip ? (
              <div className="space-y-4">
                <textarea
                  value={tipDraft}
                  onChange={(event) => setTipDraft(event.target.value)}
                  rows={4}
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary text-foreground"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveTipEdit}
                    className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelTipEdit}
                    className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              tipText
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
