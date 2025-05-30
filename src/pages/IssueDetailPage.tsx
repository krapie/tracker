import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Issue, EventComment, Playbook } from "../types/types";
import { IssueFeed } from "../components/IssueFeed";
import { useDocument } from "@yorkie-js/react";
import MDEditor from "@uiw/react-md-editor";
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../utils/api";

export function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const { root, update } = useDocument<{ events: EventComment[]; status?: "ongoing" | "resolved" }>();
  const [issueInfo, setIssueInfo] = useState<Issue | null>(null);
  const { resolvedTheme } = useTheme();

  // Playbook state
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<{ [stepIdx: number]: boolean }>({});

  // Sidebar width state for draggable divider
  const [sidebarWidth, setSidebarWidth] = useState(320); // default 20rem (w-80)
  const [isDragging, setIsDragging] = useState(false);

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Fetch issue info from backend when issueId changes
  useEffect(() => {
    if (!issueId) return;
    api.get(`/api/issues/${issueId}`)
      .then(res => res.json())
      .then(data => setIssueInfo(data))
      .catch(() => setIssueInfo(null));
  }, [issueId]);

  // Fetch playbooks from backend
  useEffect(() => {
    api.get('/api/playbooks/')
      .then(res => res.json())
      .then(data => setPlaybooks(Array.isArray(data) ? data : []))
      .catch(() => setPlaybooks([]));
  }, []);

  // Calculate status based on Yorkie doc (prefer Yorkie, fallback to local issueInfo)
  const status: "ongoing" | "resolved" = useMemo(() => {
    if (root.status) return root.status;
    if (root.events && root.events.some(ev => ev.text.toLowerCase().includes("resolved"))) {
      return "resolved";
    }
    if (typeof issueInfo?.status === "number") {
      return issueInfo.status === 1 ? "ongoing" : "resolved";
    }
    return "ongoing";
  }, [root.status, root.events, issueInfo?.status]);

  // Status change handler (updates Yorkie doc and backend)
  const handleStatusChange = (newStatus: "ongoing" | "resolved") => {
    update(root => {
      root.status = newStatus;
    });

    api.put(`/api/issues/${issueId}`, { status: newStatus === "ongoing" ? 1 : 0 });
  };

  // Title editing handlers
  const startEditingTitle = () => {
    setEditedTitle(issueInfo?.name || `Issue #${issueId}`);
    setIsEditingTitle(true);
  };

  const saveTitle = async () => {
    if (!editedTitle.trim() || !issueId) return;
    
    try {
      const response = await api.put(`/api/issues/${issueId}`, { name: editedTitle.trim() });

      if (response.ok) {
        // Update local state
        setIssueInfo(prev => prev ? { ...prev, name: editedTitle.trim() } : null);
        setIsEditingTitle(false);
      }
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTitle();
    } else if (e.key === "Escape") {
      cancelEditingTitle();
    }
  };

  // Load checked steps from localStorage when playbook changes
  useEffect(() => {
    if (!selectedPlaybookId || !issueId) {
      setCheckedSteps({});
      return;
    }
    const saved = localStorage.getItem(`tracker_playbook_${issueId}_${selectedPlaybookId}`);
    setCheckedSteps(saved ? JSON.parse(saved) : {});
  }, [selectedPlaybookId, issueId]);

  // Save checked steps to localStorage
  const handleCheckStep = (idx: number) => {
    const updated = { ...checkedSteps, [idx]: !checkedSteps[idx] };
    setCheckedSteps(updated);
    if (selectedPlaybookId && issueId) {
      localStorage.setItem(
        `tracker_playbook_${issueId}_${selectedPlaybookId}`,
        JSON.stringify(updated)
      );
    }
  };

  // Get selected playbook object
  const selectedPlaybook = playbooks.find(pb => pb.id === selectedPlaybookId);

  // Mouse event handlers for drag
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      // Minimum 200px, maximum 500px
      const min = 200, max = 500;
      const newWidth = Math.min(max, Math.max(min, window.innerWidth - e.clientX - 48)); // 48px = m-6*2
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-gh-4 font-gh">
      {/* Issue Header */}
      <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
        <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-gh-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-gh-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={saveTitle}
                    className="text-gh-xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark bg-gh-canvas-default dark:bg-gh-canvas-default-dark border border-gh-border-default dark:border-gh-border-default-dark rounded-gh px-gh-2 py-gh-1 focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
                    autoFocus
                  />
                  <button
                    onClick={saveTitle}
                    className="text-gh-success-fg dark:text-gh-success-fg-dark hover:text-gh-success-emphasis dark:hover:text-gh-success-emphasis-dark text-gh-sm"
                    title="Save title"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEditingTitle}
                    className="text-gh-fg-muted dark:text-gh-fg-muted-dark hover:text-gh-fg-default dark:hover:text-gh-fg-default-dark text-gh-sm"
                    title="Cancel editing"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <h1 
                  className="text-gh-xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark cursor-pointer hover:text-gh-accent-fg dark:hover:text-gh-accent-fg-dark transition-colors group"
                  onClick={startEditingTitle}
                  title="Click to edit title"
                >
                  {issueInfo?.name || `Issue #${issueId}`}
                  <span className="ml-gh-2 text-gh-fg-muted dark:text-gh-fg-muted-dark opacity-0 group-hover:opacity-100 transition-opacity text-gh-sm">✏️</span>
                </h1>
              )}
              <span className={`inline-flex items-center px-gh-2 py-gh-1 rounded-gh text-gh-xs font-medium ${
                status === "resolved" 
                  ? "bg-gh-success-subtle dark:bg-gh-success-subtle-dark text-gh-success-fg dark:text-gh-success-fg-dark"
                  : "bg-gh-warning-subtle dark:bg-gh-warning-subtle-dark text-gh-warning-fg dark:text-gh-warning-fg-dark"
              }`}>
                {status === "resolved" ? "✓" : "●"} {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <div className="flex gap-gh-2">
              <button
                className={`px-gh-3 py-gh-2 rounded-gh text-gh-sm font-medium border transition-colors ${
                  status === "ongoing"
                    ? "bg-gh-warning-subtle dark:bg-gh-warning-subtle-dark text-gh-warning-fg dark:text-gh-warning-fg-dark border-gh-warning-muted dark:border-gh-warning-muted-dark cursor-not-allowed"
                    : "bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark border-gh-border-default dark:border-gh-border-default-dark hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark"
                }`}
                disabled={status === "ongoing"}
                onClick={() => handleStatusChange("ongoing")}
              >
                Reopen
              </button>
              <button
                className={`px-gh-3 py-gh-2 rounded-gh text-gh-sm font-medium border transition-colors ${
                  status === "resolved"
                    ? "bg-gh-success-subtle dark:bg-gh-success-subtle-dark text-gh-success-fg dark:text-gh-success-fg-dark border-gh-success-muted dark:border-gh-success-muted-dark cursor-not-allowed"
                    : "bg-gh-success-emphasis dark:bg-gh-success-emphasis-dark text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark border-gh-success-emphasis dark:border-gh-success-emphasis-dark hover:bg-gh-success-emphasis/90 dark:hover:bg-gh-success-emphasis-dark/90"
                }`}
                disabled={status === "resolved"}
                onClick={() => handleStatusChange("resolved")}
              >
                Close issue
              </button>
            </div>
          </div>
        </div>
        <div className="px-gh-6 py-gh-3">
          <div className="flex flex-wrap gap-gh-6 text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {issueInfo?.createdAt ? (
                <span>{new Date(issueInfo.createdAt).toLocaleString()}</span>
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-gh-4 flex-1 min-h-0">
        {/* Main timeline + draggable divider + right sidebar */}
        <div className="flex flex-1 min-w-0">
          {/* Issue Feed */}
          <main className="flex-1 min-w-0 bg-gh-canvas-default dark:bg-gh-canvas-default-dark border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg mr-0 flex">
            <div className="flex-1 px-gh-6 py-gh-6">
              <IssueFeed />
            </div>
          </main>
          
          {/* Draggable divider */}
          <div
            className="cursor-col-resize w-2 bg-transparent hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors duration-100"
            style={{ zIndex: 10 }}
            onMouseDown={() => setIsDragging(true)}
            title="Drag to resize sidebar"
          >
            <div className="mx-auto h-full w-1 bg-gh-border-default dark:bg-gh-border-default-dark rounded transition-colors" style={{ opacity: isDragging ? 1 : 0.5 }} />
          </div>
          
          {/* Right sidebar: Playbook */}
          <aside
            className="bg-gh-canvas-default dark:bg-gh-canvas-default-dark border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg px-gh-6 py-gh-6 flex flex-col gap-gh-4 max-md:w-40 max-md:px-2 max-md:py-4 ml-0"
            style={{ width: sidebarWidth, minWidth: 200, maxWidth: 500, transition: isDragging ? 'none' : 'width 0.15s' }}
          >
            <div>
              <h3 className="text-gh-lg font-semibold mb-gh-3 max-md:text-base text-gh-fg-default dark:text-gh-fg-default-dark">Playbooks</h3>
              <div className="mb-gh-4">
                <select
                  className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 w-full max-md:text-xs bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark rounded-gh focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
                  value={selectedPlaybookId || ""}
                  onChange={e => setSelectedPlaybookId(e.target.value || null)}
                >
                  <option value="">Select playbook…</option>
                  {playbooks.map(pb => (
                    <option key={pb.id} value={pb.id}>
                      {pb.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedPlaybook ? (
                <ol className="relative ml-gh-3">
                  {selectedPlaybook.steps.map((step, idx) => {
                    const isChecked = !!checkedSteps[idx];
                    return (
                      <li
                        key={idx}
                        className={`ml-gh-4 flex items-start group relative ${idx !== selectedPlaybook.steps.length - 1 ? 'mb-gh-6' : ''}`}
                      >
                        {/* Merged timeline circle and checkbox */}
                        <label className="absolute -left-7 flex items-center justify-center w-7 h-7 z-10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckStep(idx)}
                            className="sr-only"
                          />
                          <span className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-bold transition-colors
                            ${isChecked ? 'bg-gh-success-subtle dark:bg-gh-success-subtle-dark border-gh-success-emphasis dark:border-gh-success-emphasis-dark text-gh-success-fg dark:text-gh-success-fg-dark' : 'bg-gh-canvas-default dark:bg-gh-canvas-default-dark border-gh-border-default dark:border-gh-border-default-dark text-gh-fg-muted dark:text-gh-fg-muted-dark'}
                            group-hover:border-gh-accent-emphasis dark:group-hover:border-gh-accent-emphasis-dark`}>
                            {idx + 1}
                            {/* Custom checkmark overlay */}
                            {isChecked && (
                              <svg className="absolute w-4 h-4 text-gh-success-emphasis dark:text-gh-success-emphasis-dark" style={{top: 6, left: 6}} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        </label>
                        {/* Step content, collapsible when checked */}
                        <div className={`flex-1 ml-2 transition-all duration-200 ${isChecked ? 'max-h-8 overflow-hidden opacity-60' : 'max-h-[500px] opacity-100'} ${isChecked ? 'line-through text-gh-fg-muted dark:text-gh-fg-muted-dark' : ''} max-md:text-xs`}
                          style={{ minHeight: isChecked ? 0 : undefined }}
                        >
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <MDEditor.Markdown source={step.content} wrapperElement={{"data-color-mode": resolvedTheme}} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="text-gh-fg-muted dark:text-gh-fg-muted-dark max-md:text-xs">No playbook selected.</div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
