import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44";
import { Plus, Target, Edit3 } from "lucide-react";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("daily");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [message, setMessage] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingGoalTitle, setEditingGoalTitle] = useState("");
  const [editingGoalType, setEditingGoalType] = useState("daily");
  const [editingGoalImageUrl, setEditingGoalImageUrl] = useState("");
  const [editingGoalLinkUrl, setEditingGoalLinkUrl] = useState("");

  useEffect(() => {
    const loadGoals = async () => {
      const savedGoals = await base44.entities.Goal.findMany(null, "-createdAt");
      setGoals(savedGoals);
    };
    loadGoals();
  }, []);

  const totalGoals = goals.length;
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const progress = totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const dailyGoals = useMemo(() => goals.filter((goal) => goal.type === "daily"), [goals]);
  const weeklyGoals = useMemo(() => goals.filter((goal) => goal.type === "weekly"), [goals]);

  const handleAddGoal = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setMessage("Enter a valid goal.");
      return;
    }
    setMessage("");
    await base44.entities.Goal.create({
      title: title.trim(),
      type,
      completed: false,
      imageUrl: imageUrl.trim() || undefined,
      linkUrl: linkUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    setTitle("");
    setImageUrl("");
    setLinkUrl("");
    const savedGoals = await base44.entities.Goal.findMany(null, "-createdAt");
    setGoals(savedGoals);
  };

  const startEditGoal = (goal) => {
    setEditingGoalId(goal.id);
    setEditingGoalTitle(goal.title || "");
    setEditingGoalType(goal.type || "daily");
    setEditingGoalImageUrl(goal.imageUrl || "");
    setEditingGoalLinkUrl(goal.linkUrl || "");
  };

  const saveGoalEdit = async (goalId) => {
    const updatedGoal = await base44.entities.Goal.update(goalId, {
      title: editingGoalTitle.trim() || "Untitled goal",
      type: editingGoalType,
      imageUrl: editingGoalImageUrl.trim() || undefined,
      linkUrl: editingGoalLinkUrl.trim() || undefined,
    });
    setGoals((current) => current.map((item) => (item.id === goalId ? updatedGoal : item)));
    setEditingGoalId(null);
  };

  const cancelGoalEdit = () => {
    setEditingGoalId(null);
  };

  const toggleComplete = async (goal) => {
    await base44.entities.Goal.update(goal.id, { completed: !goal.completed });
    setGoals((current) => current.map((item) => (item.id === goal.id ? { ...item, completed: !item.completed } : item)));
  };

  const deleteGoal = async (goalId) => {
    await base44.entities.Goal.delete(goalId);
    setGoals((current) => current.filter((goal) => goal.id !== goalId));
  };

  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="glass rounded-[2rem] border border-border p-8 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Goals</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">Track your study objectives</h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">Add daily and weekly goals to stay consistent and measure progress.</p>
            </div>
            <div className="rounded-full bg-muted px-4 py-3 text-sm text-muted-foreground">{progress}% complete</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Progress</h2>
                <p className="text-sm text-muted-foreground">{completedGoals} of {totalGoals} goals completed</p>
              </div>
              <div className="rounded-3xl bg-muted px-4 py-3 text-sm text-muted-foreground">{progress}%</div>
            </div>
            {[{ label: "Daily", items: dailyGoals }, { label: "Weekly", items: weeklyGoals }].map((group) => (
              <div key={group.label} className="rounded-3xl border border-border p-4 mb-4">
                <h3 className="text-sm font-semibold">{group.label} goals</h3>
                {group.items.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">No {group.label.toLowerCase()} goals yet.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {group.items.map((goal) => (
                      <div key={goal.id}>
                        {editingGoalId === goal.id ? (
                          <div className="rounded-3xl border border-border bg-background p-4">
                            <form
                              className="space-y-4"
                              onSubmit={(event) => {
                                event.preventDefault();
                                saveGoalEdit(goal.id);
                              }}
                            >
                              <label className="block text-sm font-medium text-foreground">
                                Title
                                <input
                                  value={editingGoalTitle}
                                  onChange={(event) => setEditingGoalTitle(event.target.value)}
                                  className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                                />
                              </label>
                              <label className="block text-sm font-medium text-foreground">
                                Type
                                <select
                                  value={editingGoalType}
                                  onChange={(event) => setEditingGoalType(event.target.value)}
                                  className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                </select>
                              </label>
                              <label className="block text-sm font-medium text-foreground">
                                Image URL
                                <input
                                  value={editingGoalImageUrl}
                                  onChange={(event) => setEditingGoalImageUrl(event.target.value)}
                                  className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                                  placeholder="https://example.com/image.jpg"
                                />
                              </label>
                              <label className="block text-sm font-medium text-foreground">
                                Link URL
                                <input
                                  value={editingGoalLinkUrl}
                                  onChange={(event) => setEditingGoalLinkUrl(event.target.value)}
                                  className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                                  placeholder="https://example.com"
                                />
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                                  Save
                                </button>
                                <button type="button" onClick={cancelGoalEdit} className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{goal.title}</p>
                                <p className="text-xs text-muted-foreground">{goal.type}</p>
                                {goal.linkUrl && (
                                  <a href={goal.linkUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                                    Open resource
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditGoal(goal)}
                                  className="rounded-full p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteGoal(goal.id)}
                                  className="rounded-2xl border border-border px-3 py-2 text-xs text-destructive transition hover:bg-destructive/10"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            {goal.imageUrl ? (
                              <img src={goal.imageUrl} alt={goal.title} className="h-32 w-full rounded-3xl object-cover" />
                            ) : null}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleComplete(goal)}
                                className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${goal.completed ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                              >
                                {goal.completed ? "Completed" : "Mark"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-primary text-white">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">New goal</h2>
                <p className="text-sm text-muted-foreground">Create a new study objective.</p>
              </div>
            </div>
            <form onSubmit={handleAddGoal} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Example: Review notes"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-foreground">
                Image URL
                <input
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="https://example.com/image.jpg"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Link URL
                <input
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="https://example.com"
                />
              </label>
              {message && <p className="text-sm text-destructive">{message}</p>}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add goal
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
