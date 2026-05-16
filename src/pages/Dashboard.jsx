import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock, LayoutDashboard, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const [sessions, setSessions] = useState([]);

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
          {[
            { label: "Boards", value: boards.length, icon: LayoutDashboard, color: "bg-violet-500/10 text-violet-700" },
            { label: "Tasks", value: totalTasks, icon: BookOpen, color: "bg-sky-500/10 text-sky-700" },
            { label: "Sessions", value: sessions.length, icon: Clock, color: "bg-emerald-500/10 text-emerald-700" },
            { label: "Completed", value: doneTasks, icon: CheckCircle2, color: "bg-amber-500/10 text-amber-700" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{item.label}</span>
              </div>
              <p className="mt-6 text-4xl font-semibold">{item.value}</p>
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
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{session.score || "Study session"}</p>
                        <p className="text-sm text-muted-foreground">{new Date(session.timestamp || session.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {session.durationMinutes || 0} min
                      </span>
                    </div>
                    {session.cardTitle && (
                      <p className="mt-3 text-sm text-muted-foreground">Card: {session.cardTitle}</p>
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
                  <Link key={board.id} to={`/board/${board.id}`} className="block rounded-3xl border border-border p-4 transition hover:border-primary hover:bg-muted">
                    <p className="font-semibold">{board.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{board.description || "No description"}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold">Quick productivity tip</h2>
              <p className="text-sm text-muted-foreground">Stay consistent and review daily.</p>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Use the Pomodoro timer for focused 25-minute sessions, then log the session to track your progress over time.
          </div>
        </section>
      </div>
    </div>
  );
}
