import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Issue, EventComment, Playbook } from "../types/types";
import { IssueFeed } from "../components/IssueFeed";
import { useDocument } from "@yorkie-js/react";

const API_URL = import.meta.env.VITE_API_URL;

export function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const { root, update } = useDocument<{ events: EventComment[]; status?: "ongoing" | "resolved" }>();
  const [issueInfo, setIssueInfo] = useState<Issue | null>(null);

  // Playbook state
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<{ [stepIdx: number]: boolean }>({});

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

  return (
    <div className="flex gap-8 m-6">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r px-6 py-8 flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Issue Info</h3>
          <div className="mb-2">
            <span className="font-medium">Name:</span>{" "}
            {issueInfo?.name ? (
              <span>{issueInfo.name}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
          <div className="mb-2">
            <span className="font-medium">Created:</span>{" "}
            {issueInfo?.createdAt ? (
              <span>{new Date(issueInfo.createdAt).toLocaleString()}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
          <div className="mb-2">
            <span className="font-medium">Status:</span>{" "}
            <span className={status === "resolved" ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
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
      </aside>
      {/* Main timeline */}
      <main className="flex-1">
        <IssueFeed />
      </main>
      {/* Right sidebar: Playbook */}
      <aside
        className="
          w-72 bg-white border-l px-6 py-8 flex flex-col gap-6
          max-md:w-32 max-md:px-2 max-md:py-4
        "
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
            <ul className="space-y-2">
              {selectedPlaybook.steps.map((step, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!checkedSteps[idx]}
                    onChange={() => handleCheckStep(idx)}
                  />
                  <span className={`flex-1 ${checkedSteps[idx] ? "line-through text-gray-400" : ""} max-md:text-xs`}>
                    {step.content}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 max-md:text-xs">No playbook selected.</div>
          )}
        </div>
      </aside>
    </div>
  );
}
