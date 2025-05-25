import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { IssuesListPage } from "./pages/IssueListPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { YorkieProvider, DocumentProvider } from "@yorkie-js/react";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IssuesListPage />} />
        <Route path="/issue/:issueId" element={<IssueDetailWithProvider />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
