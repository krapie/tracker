import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Issue } from "../types/types";

const LOCAL_KEY = "tracker_issues";

export function IssuesListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueName, setIssueName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    setIssues(raw ? JSON.parse(raw) : []);
  }, []);

  const handleCreate = () => {
    if (!issueName.trim()) return;
    const newIssue: Issue = {
      id: Date.now().toString(),
      name: issueName,
      createdAt: Date.now(),
      status: "ongoing",
    };
    const updated = [...issues, newIssue];
    setIssues(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    setIssueName("");
  };

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
          {issues.length === 0 && (
            <li className="text-gray-400 italic">No issues yet. Create one above!</li>
          )}
          {issues
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
                <span className="ml-4 text-xs text-gray-400">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
