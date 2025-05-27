import { BrowserRouter, Routes, Route, useParams, Link, Outlet } from "react-router-dom";
import { IssuesListPage } from "./pages/IssueListPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { YorkieProvider, DocumentProvider } from "@yorkie-js/react";
import { PlaybookListPage } from "./pages/PlaybookListPage";
import { PlaybookDetailPage } from "./pages/PlaybookDetailPage";
import { HomePage } from "./pages/HomePage";
import { HealthListPage } from "./pages/HealthListPage";
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
    <div>
      <nav className="flex justify-between items-center px-8 py-4 mb-8 border-b bg-white">
        <div className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <span>🚦</span> Tracker
        </div>
        <div className="flex gap-6">
          <Link to="/" className="text-blue-700 font-semibold hover:underline">
            Home
          </Link>
          <Link to="/issues" className="text-blue-700 font-semibold hover:underline">
            Issues
          </Link>
          <Link to="/playbooks" className="text-blue-700 font-semibold hover:underline">
            Playbooks
          </Link>
          <Link to="/health" className="text-blue-700 font-semibold hover:underline">
            Health
          </Link>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/issues" element={<IssuesListPage />} />
          <Route path="/issues/:issueId" element={<IssueDetailWithProvider />} />
          <Route path="/playbooks" element={<PlaybookListPage />} />
          <Route path="/playbooks/:playbookId" element={<PlaybookDetailPage />} />
          <Route path="/health" element={<HealthListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
