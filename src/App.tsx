import { BrowserRouter, Routes, Route, useParams, Link, Outlet } from "react-router-dom";
import { IssuesListPage } from "./pages/IssueListPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { YorkieProvider, DocumentProvider } from "@yorkie-js/react";
import { PlaybookListPage } from "./pages/PlaybookListPage";
import { PlaybookDetailPage } from "./pages/PlaybookDetailPage";
import { HomePage } from "./pages/HomePage";
import { HealthListPage } from "./pages/HealthListPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import "./index.css";

const YORKIE_API_KEY = import.meta.env.VITE_YORKIE_API_KEY as string;
const YORKIE_RPC_ADDR = import.meta.env.VITE_YORKIE_RPC_ADDR as string;

function IssueDetailWithProvider() {
  const { issueId } = useParams<{ issueId: string }>();
  if (!issueId) return <div>Invalid issue</div>;
  return (
    <YorkieProvider apiKey={YORKIE_API_KEY} rpcAddr={YORKIE_RPC_ADDR}>
      <DocumentProvider docKey={issueId} initialRoot={{ events: [] }}>
        <IssueDetailPage />
      </DocumentProvider>
    </YorkieProvider>
  );
}

// Header bar layout
function AppLayout() {
  return (
    <div className="min-h-screen bg-gh-canvas-default dark:bg-gh-canvas-default-dark transition-colors font-gh">
      <nav className="flex justify-between items-center px-gh-6 py-gh-4 border-b bg-gh-canvas-default dark:bg-gh-canvas-default-dark border-gh-border-default dark:border-gh-border-default-dark transition-colors">
        <Link 
          to="/issues" 
          className="text-gh-xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark flex items-center gap-gh-2 hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark transition-colors"
        >
          <span className="text-gh-2xl">🚦</span> 
          <span>Tracker</span>
        </Link>
        <div className="flex items-center gap-gh-6">
          <Link 
            to="/" 
            className="text-gh-fg-default dark:text-gh-fg-default-dark hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark font-medium transition-colors px-gh-3 py-gh-2 rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark"
          >
            Home
          </Link>
          <Link 
            to="/issues" 
            className="text-gh-fg-default dark:text-gh-fg-default-dark hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark font-medium transition-colors px-gh-3 py-gh-2 rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark"
          >
            Issues
          </Link>
          <Link 
            to="/playbooks" 
            className="text-gh-fg-default dark:text-gh-fg-default-dark hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark font-medium transition-colors px-gh-3 py-gh-2 rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark"
          >
            Playbooks
          </Link>
          <Link 
            to="/healths" 
            className="text-gh-fg-default dark:text-gh-fg-default-dark hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark font-medium transition-colors px-gh-3 py-gh-2 rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark"
          >
            Health
          </Link>
          <ThemeToggle />
        </div>
      </nav>
      <div className="p-gh-6">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/issues" element={<IssuesListPage />} />
            <Route path="/issues/:issueId" element={<IssueDetailWithProvider />} />
            <Route path="/playbooks" element={<PlaybookListPage />} />
            <Route path="/playbooks/:playbookId" element={<PlaybookDetailPage />} />
            <Route path="/healths" element={<HealthListPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
