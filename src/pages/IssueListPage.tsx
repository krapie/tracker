import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Issue } from "../types/types";

const API_URL = import.meta.env.VITE_API_URL 

export function IssuesListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueName, setIssueName] = useState("");
  const navigate = useNavigate();

  // Fetch issues from backend
  const fetchIssues = () => {
    fetch(`${API_URL}/api/issues/`)
      .then(res => res.json())
      .then(data => setIssues(data))
      .catch(() => setIssues([]));
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleCreate = async () => {
    if (!issueName.trim()) return;
    const res = await fetch(`${API_URL}/api/issues/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: issueName }),
    });
    if (res.ok) {
      setIssueName("");
      fetchIssues();
    }
  };

  // Separate open (status === 1) and closed (status === 0) issues
  const openIssues = issues.filter(issue => issue.status === 1);
  const closedIssues = issues.filter(issue => issue.status === 0);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-2 text-blue-700 flex items-center gap-2">
        <span>🚦</span> Tracker
      </h1>
      <p className="mb-6 text-gray-600">Track, collaborate, and resolve infrastructure issues in real time.</p>
      <div className="mb-6 flex gap-2">
        <input
          className="border px-3 py-2 flex-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="New issue name"
          value={issueName}
          onChange={e => setIssueName(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold shadow"
          onClick={handleCreate}
        >
          + Create
        </button>
      </div>
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Open Issues</h2>
        <ul>
          {openIssues.length === 0 && (
            <li className="text-gray-400 italic">No open issues.</li>
          )}
          {openIssues
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(issue => (
              <li
                key={issue.id}
                className="mb-3 last:mb-0 flex items-center justify-between hover:bg-blue-50 rounded px-2 py-2 transition"
              >
                <button
                  className="text-blue-700 underline font-medium text-left flex-1"
                  onClick={() => navigate(`/issue/${issue.id}`)}
                >
                  {issue.name}
                </button>
                <span
                  className="ml-4 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700"
                >
                  Ongoing
                </span>
                <span className="ml-4 text-xs text-gray-400">
                  {issue.createdAt
                    ? new Date(issue.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </li>
            ))}
        </ul>
        <h2 className="text-lg font-semibold mt-8 mb-3 text-gray-800">Closed Issues</h2>
        <ul>
          {closedIssues.length === 0 && (
            <li className="text-gray-400 italic">No closed issues.</li>
          )}
          {closedIssues
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(issue => (
              <li
                key={issue.id}
                className="mb-3 last:mb-0 flex items-center justify-between hover:bg-green-50 rounded px-2 py-2 transition"
              >
                <button
                  className="text-blue-700 underline font-medium text-left flex-1"
                  onClick={() => navigate(`/issue/${issue.id}`)}
                >
                  {issue.name}
                </button>
                <span
                  className="ml-4 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700"
                >
                  Resolved
                </span>
                <span className="ml-4 text-xs text-gray-400">
                  {issue.createdAt
                    ? new Date(issue.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
