import { BrowserRouter, Routes, Route, useParams, Link, Outlet } from "react-router-dom";
import { IssuesListPage } from "./pages/IssueListPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { YorkieProvider, DocumentProvider } from "@yorkie-js/react";
import { PlaybookListPage } from "./pages/PlaybookListPage";
import { PlaybookDetailPage } from "./pages/PlaybookDetailPage";
import { HomePage } from "./pages/HomePage";
import { HealthListPage } from "./pages/HealthListPage";
import { HealthDetailPage } from "./pages/HealthDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportListPage } from "./pages/ReportListPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

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
            to="/healths" 
            className="text-gh-fg-default dark:text-gh-fg-default-dark hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark font-medium transition-colors px-gh-3 py-gh-2 rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark"
          >
            Healths
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
            to="/reports" 
            className="text-gh-fg-default dark:text-gh-fg-default-dark hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark font-medium transition-colors px-gh-3 py-gh-2 rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark"
          >
            Reports
          </Link>
          {user && (
            <div className="relative group">
              <span className="text-gh-fg-muted dark:text-gh-fg-muted-dark text-gh-sm cursor-pointer px-gh-3 py-gh-2 rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors">
                Welcome, {user.username}
              </span>
              {/* Dropdown menu that appears on hover */}
              <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-gh-canvas-overlay dark:bg-gh-canvas-overlay-dark border border-gh-border-default dark:border-gh-border-default-dark rounded-gh shadow-lg min-w-[120px]">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-gh-3 py-gh-2 text-gh-sm text-gh-fg-default dark:text-gh-fg-default-dark hover:text-gh-danger-fg dark:hover:text-gh-danger-fg-dark hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors rounded-gh"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route for login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<HomePage />} />
              <Route path="/issues" element={<IssuesListPage />} />
              <Route path="/issues/:issueId" element={<IssueDetailWithProvider />} />
              <Route path="/playbooks" element={<PlaybookListPage />} />
              <Route path="/playbooks/:playbookId" element={<PlaybookDetailPage />} />
              <Route path="/healths" element={<HealthListPage />} />
              <Route path="/healths/:endpointId" element={<HealthDetailPage />} />
              <Route path="/reports" element={<ReportListPage />} />
              <Route path="/reports/:reportId" element={<ReportDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
