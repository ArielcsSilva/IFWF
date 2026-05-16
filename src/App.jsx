import { BrowserRouter as Router, Link, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Boards from "@/pages/Boards";
import BoardView from "@/pages/BoardView";
import AIAssistant from "@/pages/AiAssistant";
import Goals from "@/pages/Goals";
import Pomodoro from "@/pages/Pomodoro";
import PageNotFound from "@/lib/PageNotFound";

function Navigation() {
  const { pathname } = useLocation();
  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Boards", href: "/boards" },
    { label: "Pomodoro", href: "/pomodoro" },
    { label: "Goals", href: "/goals" },
    { label: "AI", href: "/ai" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-white/90 backdrop-blur-2xl shadow-glow">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link to="/" className="text-lg font-semibold tracking-tight">
            IFWF Workspace
          </Link>
          <p className="text-sm text-muted-foreground">Study tools that run entirely in your browser.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${pathname === item.href ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-foreground">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/board/:id" element={<BoardView />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
