import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 text-center">
      <div className="max-w-xl rounded-3xl border border-border bg-card p-10 shadow-glow">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">404</p>
        <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/boards"
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            View Boards
          </Link>
        </div>
      </div>
    </div>
  );
}
