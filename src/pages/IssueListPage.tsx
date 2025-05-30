import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Issue } from "../types/types";
import { api } from "../utils/api"; 

export function IssuesListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueName, setIssueName] = useState("");
  const navigate = useNavigate();

  // Fetch issues from backend
  const fetchIssues = () => {
    api.get('/api/issues/')
      .then(res => res.json())
      .then(data => setIssues(data))
      .catch(() => setIssues([]));
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleCreate = async () => {
    if (!issueName.trim()) return;
    const res = await api.post('/api/issues/', { name: issueName });
    if (res.ok) {
      setIssueName("");
      fetchIssues();
    }
  };

  // Separate open (status === 1) and closed (status === 0) issues
  const openIssues = issues.filter(issue => issue.status === 1);
  const closedIssues = issues.filter(issue => issue.status === 0);

  return (
    <div className="max-w-4xl mx-auto font-gh">
      {/* Header */}
      <div className="mb-gh-8">
        <h1 className="text-gh-2xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark mb-gh-2">Issues</h1>
        <p className="text-gh-fg-muted dark:text-gh-fg-muted-dark">Track and manage infrastructure issues</p>
      </div>

      {/* Create Issue Form */}
      <div className="mb-gh-6 p-gh-4 border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark">
        <div className="flex gap-gh-3">
          <input
            className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 flex-1 rounded-gh shadow-sm focus:outline-none focus:ring-2 focus:ring-gh-accent-emphasis dark:focus:ring-gh-accent-emphasis-dark focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark transition-colors placeholder:text-gh-fg-muted dark:placeholder:text-gh-fg-muted-dark"
            placeholder="What's the issue?"
            value={issueName}
            onChange={e => setIssueName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <button
            className="bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-4 py-gh-2 rounded-gh font-medium shadow-sm transition-all"
            onClick={handleCreate}
          >
            Create issue
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-gh-6">
        {/* Open Issues */}
        <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
          <div className="px-gh-4 py-gh-3 border-b border-gh-border-default dark:border-gh-border-default-dark">
            <h2 className="text-gh-lg font-semibold text-gh-fg-default dark:text-gh-fg-default-dark flex items-center gap-gh-2">
              <span className="text-gh-warning-fg dark:text-gh-warning-fg-dark">●</span>
              {openIssues.length} Open
            </h2>
          </div>
          <div className="divide-y divide-gh-border-default dark:divide-gh-border-default-dark">
            {openIssues.length === 0 && (
              <div className="px-gh-4 py-gh-8 text-center text-gh-fg-muted dark:text-gh-fg-muted-dark">
                No open issues found.
              </div>
            )}
            {openIssues
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(issue => (
                <div
                  key={issue.id}
                  className="px-gh-4 py-gh-3 hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors cursor-pointer"
                  onClick={() => navigate(`/issues/${issue.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-gh-fg-default dark:text-gh-fg-default-dark font-medium hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark">
                        {issue.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-gh-3">
                      <span className="inline-flex items-center px-gh-2 py-gh-1 rounded-gh text-gh-xs font-medium bg-gh-warning-subtle dark:bg-gh-warning-subtle-dark text-gh-warning-fg dark:text-gh-warning-fg-dark">
                        Open
                      </span>
                      <span className="text-gh-xs text-gh-fg-muted dark:text-gh-fg-muted-dark">
                        {issue.createdAt
                          ? new Date(issue.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Closed Issues */}
        <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
          <div className="px-gh-4 py-gh-3 border-b border-gh-border-default dark:border-gh-border-default-dark">
            <h2 className="text-gh-lg font-semibold text-gh-fg-default dark:text-gh-fg-default-dark flex items-center gap-gh-2">
              <span className="text-gh-success-fg dark:text-gh-success-fg-dark">●</span>
              {closedIssues.length} Closed
            </h2>
          </div>
          <div className="divide-y divide-gh-border-default dark:divide-gh-border-default-dark">
            {closedIssues.length === 0 && (
              <div className="px-gh-4 py-gh-8 text-center text-gh-fg-muted dark:text-gh-fg-muted-dark">
                No closed issues found.
              </div>
            )}
            {closedIssues
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(issue => (
                <div
                  key={issue.id}
                  className="px-gh-4 py-gh-3 hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors cursor-pointer"
                  onClick={() => navigate(`/issues/${issue.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-gh-fg-default dark:text-gh-fg-default-dark font-medium hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark">
                        {issue.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-gh-3">
                      <span className="inline-flex items-center px-gh-2 py-gh-1 rounded-gh text-gh-xs font-medium bg-gh-success-subtle dark:bg-gh-success-subtle-dark text-gh-success-fg dark:text-gh-success-fg-dark">
                        Closed
                      </span>
                      <span className="text-gh-xs text-gh-fg-muted dark:text-gh-fg-muted-dark">
                        {issue.createdAt
                          ? new Date(issue.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
