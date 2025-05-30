import { useEffect, useState } from "react";
import { Playbook } from "../types/types";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export function PlaybookListPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [playbookName, setPlaybookName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/playbooks/')
      .then(res => res.json())
      .then(data => setPlaybooks(Array.isArray(data) ? data : []));
  }, []);

  // Create a new playbook and navigate to its detail page
  const handleCreate = async () => {
    const name = playbookName.trim();
    if (!name) return;
    const res = await api.post('/api/playbooks/', { name, steps: [{ content: "" }] });
    if (res.ok) {
      const created = await res.json();
      setPlaybookName("");
      navigate(`/playbooks/${created.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-gh-6 font-gh">
      {/* Header */}
      <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark mb-gh-6">
        <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
          <h1 className="text-gh-2xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">Playbooks</h1>
          <p className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark mt-gh-1">
            Create and manage runbooks for incident response and operational procedures.
          </p>
        </div>
        
        {/* Create Form */}
        <div className="px-gh-6 py-gh-4">
          <div className="flex gap-gh-3">
            <input
              className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 flex-1 rounded-gh focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark focus:outline-none bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark placeholder-gh-fg-muted dark:placeholder-gh-fg-muted-dark"
              placeholder="New playbook name"
              value={playbookName}
              onChange={e => setPlaybookName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <button
              className="bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-4 py-gh-2 rounded-gh font-medium text-gh-sm border border-gh-accent-emphasis dark:border-gh-accent-emphasis-dark transition-colors"
              onClick={handleCreate}
            >
              Create playbook
            </button>
          </div>
        </div>
      </div>

      {/* Playbooks List */}
      <div className="space-y-gh-3">
        {playbooks.length === 0 ? (
          <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark px-gh-6 py-gh-8 text-center">
            <div className="text-gh-fg-muted dark:text-gh-fg-muted-dark text-gh-sm">
              No playbooks yet. Create your first playbook to get started.
            </div>
          </div>
        ) : (
          playbooks.map(pb => (
            <div key={pb.id} className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors group">
              <div className="flex items-center justify-between px-gh-6 py-gh-4">
                <div className="flex items-center gap-gh-3">
                  <div className="w-8 h-8 rounded-gh bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark border border-gh-border-default dark:border-gh-border-default-dark flex items-center justify-center">
                    <svg className="w-4 h-4 text-gh-fg-muted dark:text-gh-fg-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gh-base font-medium text-gh-fg-default dark:text-gh-fg-default-dark group-hover:text-gh-accent-fg dark:group-hover:text-gh-accent-fg-dark transition-colors">
                      {pb.name}
                    </h3>
                    <p className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">
                      {pb.steps?.length || 0} step{pb.steps?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  className="text-gh-accent-fg dark:text-gh-accent-fg-dark hover:text-gh-accent-emphasis dark:hover:text-gh-accent-emphasis-dark text-gh-sm font-medium transition-colors"
                  onClick={() => navigate(`/playbooks/${pb.id}`)}
                >
                  View →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
