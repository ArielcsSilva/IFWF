import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44";

const COLUMNS = ["To Do", "In Progress", "Done"];

export default function BoardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBoard = async () => {
      const [boardData, boardCards] = await Promise.all([
        base44.entities.Board.findOne(id),
        base44.entities.Card.findMany({ boardId: id }, "customOrder"),
      ]);
      setBoard(boardData);
      setCards(boardCards);
      setLoading(false);
    };
    loadBoard();
  }, [id]);

  const updateBoardCards = async () => {
    const boardCards = await base44.entities.Card.findMany({ boardId: id }, "customOrder");
    setCards(boardCards);
  };

  const addCard = async (event) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      setError("Card title is required.");
      return;
    }
    setError("");
    await base44.entities.Card.create({
      boardId: id,
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: [],
      customOrder: Date.now(),
      column: "To Do",
    });
    setNewTitle("");
    setNewContent("");
    await updateBoardCards();
  };

  const moveCard = async (cardId, column) => {
    await base44.entities.Card.update(cardId, { column, customOrder: Date.now() });
    await updateBoardCards();
  };

  const deleteCard = async (cardId) => {
    if (!confirm("Delete this card?")) return;
    await base44.entities.Card.delete(cardId);
    await updateBoardCards();
  };

  const deleteBoard = async () => {
    if (!confirm("Delete this board and all cards?")) return;
    const relatedCards = cards.filter((card) => card.boardId === id);
    await Promise.all(relatedCards.map((card) => base44.entities.Card.delete(card.id)));
    await base44.entities.Board.delete(id);
    navigate("/boards");
  };

  const cardsByColumn = useMemo(
    () =>
      COLUMNS.reduce((acc, column) => {
        acc[column] = cards
          .filter((card) => card.column === column)
          .sort((a, b) => (a.customOrder || 0) - (b.customOrder || 0));
        return acc;
      }, {}),
    [cards]
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center p-8">
        <div className="rounded-3xl bg-card p-8 shadow-glow">Loading board...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center p-8 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <p className="text-sm text-muted-foreground">Board not found.</p>
          <button
            type="button"
            onClick={() => navigate("/boards")}
            className="mt-4 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
          >
            Back to boards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="glass rounded-[2rem] border border-border p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate("/boards")}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h1 className="text-3xl font-semibold">{board.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{board.description || "Organize your study cards."}</p>
            </div>
            <button
              type="button"
              onClick={deleteBoard}
              className="inline-flex items-center justify-center rounded-full bg-destructive px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete board
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card xl:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Kanban board</h2>
                <p className="text-sm text-muted-foreground">Drag cards between columns to update status.</p>
              </div>
              <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                {cards.length} cards
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {COLUMNS.map((column) => (
                <div
                  key={column}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={async (event) => {
                    event.preventDefault();
                    const cardId = event.dataTransfer.getData("text/plain");
                    if (cardId) {
                      await moveCard(cardId, column);
                    }
                  }}
                  className="rounded-[1.75rem] border border-border bg-slate-100/80 p-4"
                >
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">{column}</h3>
                  <div className="space-y-3 min-h-[320px]">
                    {cardsByColumn[column]?.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
                        className="rounded-3xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold">{card.title}</h4>
                            <p className="mt-2 text-sm text-muted-foreground">{card.content || "No description"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteCard(card.id)}
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold">Add card</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create a new card for this board.</p>
            <form onSubmit={addCard} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Card title
                <input
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Example: Review chapter"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Content
                <textarea
                  value={newContent}
                  onChange={(event) => setNewContent(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Task details or notes"
                />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add card
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
