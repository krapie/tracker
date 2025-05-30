import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Issue, EventComment, Playbook } from "../types/types";
import { IssueFeed } from "../components/IssueFeed";
import { useDocument } from "@yorkie-js/react";
import MDEditor from "@uiw/react-md-editor";

const API_URL = import.meta.env.VITE_API_URL;

export function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const { root, update } = useDocument<{ events: EventComment[]; status?: "ongoing" | "resolved" }>();
  const [issueInfo, setIssueInfo] = useState<Issue | null>(null);

  // Playbook state
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<{ [stepIdx: number]: boolean }>({});

  // Sidebar width state for draggable divider
  const [sidebarWidth, setSidebarWidth] = useState(320); // default 20rem (w-80)
  const [isDragging, setIsDragging] = useState(false);

  // Fetch issue info from backend when issueId changes
  useEffect(() => {
    if (!issueId) return;
    fetch(`${API_URL}/api/issues/${issueId}`)
      .then(res => res.json())
      .then(data => setIssueInfo(data))
      .catch(() => setIssueInfo(null));
  }, [issueId]);

  // Fetch playbooks from backend
  useEffect(() => {
    fetch(`${API_URL}/api/playbooks/`)
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

    fetch(`${API_URL}/api/issues/${issueId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus === "ongoing" ? 1 : 0 }),
    });
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
    <div className="flex flex-col gap-4 m-6">
      {/* Issue Info at the top - compact */}
      <div className="bg-white border rounded px-6 py-2 flex flex-wrap items-center gap-x-8 gap-y-2">
        <h3 className="text-base font-semibold mr-4 mb-0">Issue Info</h3>
        <div className="mb-0 mr-4">
          <span className="font-medium">Name:</span>{" "}
          {issueInfo?.name ? (
            <span>{issueInfo.name}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
        <div className="mb-0 mr-4">
          <span className="font-medium">Created:</span>{" "}
          {issueInfo?.createdAt ? (
            <span>{new Date(issueInfo.createdAt).toLocaleString()}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
        <div className="mb-0 mr-4">
          <span className="font-medium">Status:</span>{" "}
          <span className={status === "resolved" ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="flex gap-2 mt-0">
          <button
            className={`px-3 py-1 rounded text-xs font-semibold border ${
              status === "ongoing"
                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                : "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50"
            }`}
            disabled={status === "ongoing"}
            onClick={() => handleStatusChange("ongoing")}
          >
            Mark Ongoing
          </button>
          <button
            className={`px-3 py-1 rounded text-xs font-semibold border ${
              status === "resolved"
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-white text-green-700 border-green-300 hover:bg-green-50"
            }`}
            disabled={status === "resolved"}
            onClick={() => handleStatusChange("resolved")}
          >
            Mark Resolved
          </button>
        </div>
      </div>
      <div className="flex gap-8 flex-1 min-h-0">
        {/* Main timeline + draggable divider + right sidebar */}
        <div className="flex flex-1 min-w-0">
          {/* Issue Feed with border */}
          <main className="flex-1 min-w-0 bg-white border rounded px-0 py-0 mr-0 flex">
            <div className="flex-1 px-6 py-6">
              <IssueFeed />
            </div>
          </main>
          {/* Draggable divider */}
          <div
            className="cursor-col-resize w-2 bg-transparent hover:bg-gray-200 transition-colors duration-100"
            style={{ zIndex: 10 }}
            onMouseDown={() => setIsDragging(true)}
            title="Drag to resize sidebar"
          >
            <div className="mx-auto h-full w-1 bg-gray-300 rounded" style={{ opacity: isDragging ? 1 : 0.5 }} />
          </div>
          {/* Right sidebar: Playbook with border */}
          <aside
            className="bg-white border rounded px-6 py-8 flex flex-col gap-6 max-md:w-40 max-md:px-2 max-md:py-4 ml-0"
            style={{ width: sidebarWidth, minWidth: 200, maxWidth: 500, transition: isDragging ? 'none' : 'width 0.15s' }}
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 max-md:text-base">Playbooks</h3>
              <div className="mb-4">
                <select
                  className="border px-2 py-1 w-full max-md:text-xs"
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
                <ol className="relative ml-3">
                  {selectedPlaybook.steps.map((step, idx) => {
                    const isChecked = !!checkedSteps[idx];
                    return (
                      <li
                        key={idx}
                        className={`ml-4 flex items-start group relative ${idx !== selectedPlaybook.steps.length - 1 ? 'mb-6' : ''}`}
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
                            ${isChecked ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-gray-300 text-gray-600'}
                            group-hover:border-blue-400`}>
                            {idx + 1}
                            {/* Custom checkmark overlay */}
                            {isChecked && (
                              <svg className="absolute w-4 h-4 text-green-500" style={{top: 6, left: 6}} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        </label>
                        {/* Step content, collapsible when checked */}
                        <div className={`flex-1 ml-2 transition-all duration-200 ${isChecked ? 'max-h-8 overflow-hidden opacity-60' : 'max-h-[500px] opacity-100'} ${isChecked ? 'line-through text-gray-400' : ''} max-md:text-xs`}
                          style={{ minHeight: isChecked ? 0 : undefined }}
                        >
                          <div className="prose prose-sm max-w-none">
                            <MDEditor.Markdown source={step.content} wrapperElement={{"data-color-mode": "light"}} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="text-gray-400 max-md:text-xs">No playbook selected.</div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
