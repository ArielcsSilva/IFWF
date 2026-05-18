import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { base44 } from "@/api/base44";

export default function Boards() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState("");
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState("");
  const [editingBoardDescription, setEditingBoardDescription] = useState("");
  const [editingBoardImageUrl, setEditingBoardImageUrl] = useState("");
  const [editingBoardLinkUrl, setEditingBoardLinkUrl] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [savedBoards, savedCards] = await Promise.all([
      base44.entities.Board.findMany(null, "-createdAt"),
      base44.entities.Card.findMany(),
    ]);
    setBoards(savedBoards);
    setCards(savedCards);
  };

  const handleCreateBoard = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Board title is required.");
      return;
    }
    setError("");
    await base44.entities.Board.create({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      linkUrl: linkUrl.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setImageUrl("");
    setLinkUrl("");
    await loadData();
  };

  const handleDeleteBoard = async (boardId) => {
    if (!confirm("Delete this board and all its cards?")) return;
    const relatedCards = cards.filter((card) => card.boardId === boardId);
    await Promise.all(relatedCards.map((card) => base44.entities.Card.delete(card.id)));
    await base44.entities.Board.delete(boardId);
    await loadData();
  };

  const startEditBoard = (board) => {
    setEditingBoardId(board.id);
    setEditingBoardTitle(board.title || "");
    setEditingBoardDescription(board.description || "");
    setEditingBoardImageUrl(board.imageUrl || "");
    setEditingBoardLinkUrl(board.linkUrl || "");
  };

  const saveBoardEdit = async (boardId) => {
    const updatedBoard = await base44.entities.Board.update(boardId, {
      title: editingBoardTitle.trim() || "Untitled board",
      description: editingBoardDescription.trim(),
      imageUrl: editingBoardImageUrl.trim() || undefined,
      linkUrl: editingBoardLinkUrl.trim() || undefined,
    });
    setBoards((current) => current.map((item) => (item.id === boardId ? updatedBoard : item)));
    setEditingBoardId(null);
  };

  const cancelBoardEdit = () => {
    setEditingBoardId(null);
  };

  const filteredBoards = boards.filter((board) => board.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="glass rounded-[2rem] border border-border p-8 shadow-card">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Boards</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">Organize your study work.</h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">Create boards, manage cards, and move tasks through a simple kanban flow.</p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("board-form").scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> New board
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Boards</h2>
              <span className="rounded-2xl bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {boards.length} created
              </span>
            </div>
            <div className="mb-6 rounded-3xl border border-border bg-background px-4 py-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search boards..."
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-4">
              {filteredBoards.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No boards found.
                </div>
              ) : (
                filteredBoards.map((board) => {
                  const total = cards.filter((card) => card.boardId === board.id).length;
                  const completed = cards.filter((card) => card.boardId === board.id && card.column === "Done").length;
                  const progress = total ? Math.round((completed / total) * 100) : 0;
                  if (editingBoardId === board.id) {
                    return (
                      <div key={board.id} className="rounded-3xl border border-border bg-background p-6">
                        <form
                          className="space-y-4"
                          onSubmit={(event) => {
                            event.preventDefault();
                            saveBoardEdit(board.id);
                          }}
                        >
                          <label className="block text-sm font-medium text-foreground">
                            Title
                            <input
                              value={editingBoardTitle}
                              onChange={(event) => setEditingBoardTitle(event.target.value)}
                              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                            />
                          </label>
                          <label className="block text-sm font-medium text-foreground">
                            Description
                            <textarea
                              value={editingBoardDescription}
                              onChange={(event) => setEditingBoardDescription(event.target.value)}
                              rows={3}
                              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                            />
                          </label>
                          <label className="block text-sm font-medium text-foreground">
                            Image URL
                            <input
                              value={editingBoardImageUrl}
                              onChange={(event) => setEditingBoardImageUrl(event.target.value)}
                              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                              placeholder="https://example.com/image.jpg"
                            />
                          </label>
                          <label className="block text-sm font-medium text-foreground">
                            Link URL
                            <input
                              value={editingBoardLinkUrl}
                              onChange={(event) => setEditingBoardLinkUrl(event.target.value)}
                              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                              placeholder="https://example.com"
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                              Save
                            </button>
                            <button type="button" onClick={cancelBoardEdit} className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => navigate(`/board/${board.id}`)}
                      className="w-full text-left rounded-3xl border border-border p-6 transition hover:border-primary hover:bg-muted"
                    >
                      {board.imageUrl && (
                        <img src={board.imageUrl} alt={board.title} className="mb-4 h-36 w-full rounded-3xl object-cover" />
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{board.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{board.description || "No description"}</p>
                          {board.linkUrl && (
                            <a href={board.linkUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                              Open related link
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              startEditBoard(board);
                            }}
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteBoard(board.id);
                            }}
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>{total} card{total !== 1 ? "s" : ""}</span>
                        <span>{progress}% complete</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card" id="board-form">
            <h2 className="text-lg font-semibold">Create new board</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add a new board to organize your cards.</p>
            <form onSubmit={handleCreateBoard} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Example: Math review"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Add a short summary"
                />
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Create board
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
