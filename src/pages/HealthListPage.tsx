import { useEffect, useState, useRef } from "react";
import { HealthEndpoint } from "../types/types";
import { api } from "../utils/api";

function statusLabel(status: number) {
  if (status === 1) return { text: "up", className: "bg-gh-success-subtle dark:bg-gh-success-subtle-dark text-gh-success-fg dark:text-gh-success-fg-dark" };
  if (status === 0) return { text: "down", className: "bg-gh-danger-subtle dark:bg-gh-danger-subtle-dark text-gh-danger-fg dark:text-gh-danger-fg-dark" };
  return { text: "unknown", className: "bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark text-gh-fg-muted dark:text-gh-fg-muted-dark" };
}

type EditState = {
  [id: string]: {
    name: string;
    url: string;
    threshold: number;
    interval: number;
    editing: boolean;
  };
};

export function HealthListPage() {
  const [endpoints, setEndpoints] = useState<HealthEndpoint[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [threshold, setThreshold] = useState(3);
  const [interval, setIntervalValue] = useState(30);
  const [loading, setLoading] = useState(false);
  const [editState, setEditState] = useState<EditState>({});
  const intervalRef = useRef<number | null>(null);

  const fetchEndpoints = () => {
    setLoading(true);
    api.get('/api/health/status')
      .then(res => res.json())
      .then(data => setEndpoints(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  // Helper to get the minimum interval from endpoints, fallback to 30s
  const getMinInterval = (eps: HealthEndpoint[]) => {
    const intervals = eps.map(e => e.interval ?? 30).filter(i => typeof i === "number" && i > 0);
    return intervals.length > 0 ? Math.max(Math.min(...intervals, 300), 5) : 30;
  };

  // Auto-refresh logic based on minimum interval
  useEffect(() => {
    fetchEndpoints();
  }, []);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Determine polling interval from endpoints (min interval) and start periodic fetch
    const minIntervalSec = getMinInterval(endpoints);
    const minIntervalMs = Math.max(5000, Math.min(minIntervalSec * 1000, 300000)); // clamp between 5s and 5min

    // Immediately fetch once and then schedule periodic fetches
    fetchEndpoints();
    intervalRef.current = setInterval(fetchEndpoints, minIntervalMs) as unknown as number;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // Re-run when endpoints array changes (by id and interval). Using JSON to avoid unstable deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(endpoints.map(e => ({ id: e.id, interval: e.interval })))]);

  const handleRegister = async () => {
    if (!name.trim() || !url.trim()) return;
    await api.post('/api/health/endpoints', { name, url, threshold, interval });
    setName("");
    setUrl("");
    setThreshold(3);
    setIntervalValue(30);
    fetchEndpoints();
  };

  const startEdit = (ep: HealthEndpoint) => {
    setEditState(s => ({
      ...s,
      [ep.id]: {
        name: ep.name,
        url: ep.url,
        threshold: ep.threshold ?? 3,
        interval: ep.interval ?? 30,
        editing: true,
      },
    }));
  };

  const cancelEdit = (id: string) => {
    setEditState(s => ({
      ...s,
      [id]: { ...s[id], editing: false },
    }));
  };

  const handleEditChange = (id: string, field: keyof HealthEndpoint | "interval", value: string | number) => {
    setEditState(s => ({
      ...s,
      [id]: {
        ...s[id],
        [field]: value,
      },
    }));
  };

  const saveEdit = async (id: string) => {
    const { name, url, threshold, interval } = editState[id];
    await api.put(`/api/health/endpoints/${id}`, { name, url, threshold: Number(threshold), interval: Number(interval) });
    setEditState(s => ({
      ...s,
      [id]: { ...s[id], editing: false },
    }));
    fetchEndpoints();
  };

  return (
    <div className="max-w-5xl mx-auto p-gh-6 font-gh">
      {/* Header */}
      <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark mb-gh-6">
        <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
          <h1 className="text-gh-2xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">Health Check Endpoints</h1>
          <p className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark mt-gh-1">
            Monitor service health and get alerts when endpoints go down.
          </p>
        </div>
        
        {/* Register Form */}
        <div className="px-gh-6 py-gh-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gh-3">
            <div className="flex flex-col">
              <label className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark mb-gh-1">Name</label>
              <input
                className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none placeholder-gh-fg-muted dark:placeholder-gh-fg-muted-dark"
                placeholder="Endpoint name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark mb-gh-1">URL</label>
              <input
                className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none placeholder-gh-fg-muted dark:placeholder-gh-fg-muted-dark"
                placeholder="https://example.com/health"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark mb-gh-1">Threshold</label>
              <input
                className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none placeholder-gh-fg-muted dark:placeholder-gh-fg-muted-dark"
                placeholder="Threshold"
                type="number"
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark mb-gh-1">Interval (sec)</label>
              <input
                className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none placeholder-gh-fg-muted dark:placeholder-gh-fg-muted-dark"
                placeholder="Interval (sec)"
                type="number"
                value={interval}
                onChange={e => setIntervalValue(Number(e.target.value))}
              />
            </div>
            <button
              className="bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-4 py-gh-2 rounded-gh font-medium text-gh-sm border border-gh-accent-emphasis dark:border-gh-accent-emphasis-dark transition-colors"
              onClick={handleRegister}
            >
              Register endpoint
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
        <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
          <h2 className="text-gh-lg font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">Registered Endpoints</h2>
        </div>
        <div className="px-gh-6 py-gh-4">
          {loading ? (
            <div className="text-gh-fg-muted dark:text-gh-fg-muted-dark text-center py-gh-8">Loading...</div>
          ) : endpoints.length === 0 ? (
            <div className="text-gh-fg-muted dark:text-gh-fg-muted-dark text-center py-gh-8">
              No endpoints registered yet. Add your first endpoint above.
            </div>
          ) : (
            <div className="space-y-gh-3">
              {endpoints.map(ep => {
                const status = statusLabel(ep.status as number);
                const edit = editState[ep.id];
                return (
                  <div
                    key={ep.id}
                    className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark hover:bg-gh-canvas-inset dark:hover:bg-gh-canvas-inset-dark transition-colors group"
                  >
                    <div className="px-gh-4 py-gh-3">
                      {edit && edit.editing ? (
                        <div className="space-y-gh-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gh-2">
                            <input
                              className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-2 py-gh-1 rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark text-gh-sm focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
                              value={edit.name}
                              onChange={e => handleEditChange(ep.id, "name", e.target.value)}
                            />
                            <input
                              className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-2 py-gh-1 rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark text-gh-sm focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
                              value={edit.url}
                              onChange={e => handleEditChange(ep.id, "url", e.target.value)}
                            />
                            <input
                              className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-2 py-gh-1 rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark text-gh-sm focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
                              type="number"
                              value={edit.threshold}
                              onChange={e => handleEditChange(ep.id, "threshold", Number(e.target.value))}
                            />
                            <input
                              className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-2 py-gh-1 rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark text-gh-sm focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
                              type="number"
                              value={edit.interval}
                              onChange={e => handleEditChange(ep.id, "interval", Number(e.target.value))}
                            />
                          </div>
                          <div className="flex gap-gh-2">
                            <button
                              className="bg-gh-success-emphasis dark:bg-gh-success-emphasis-dark hover:bg-gh-success-emphasis/90 dark:hover:bg-gh-success-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-3 py-gh-1 rounded-gh text-gh-sm font-medium border border-gh-success-emphasis dark:border-gh-success-emphasis-dark transition-colors"
                              onClick={() => saveEdit(ep.id)}
                            >
                              Save
                            </button>
                            <button
                              className="text-gh-fg-muted dark:text-gh-fg-muted-dark hover:text-gh-fg-default dark:hover:text-gh-fg-default-dark text-gh-sm underline transition-colors"
                              onClick={() => cancelEdit(ep.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-gh-4">
                            <div className="flex items-center gap-gh-2">
                              <div className={`w-3 h-3 rounded-full ${status.text === 'up' ? 'bg-gh-success-emphasis dark:bg-gh-success-emphasis-dark' : status.text === 'down' ? 'bg-gh-danger-emphasis dark:bg-gh-danger-emphasis-dark' : 'bg-gh-fg-muted dark:bg-gh-fg-muted-dark'}`}></div>
                              <span className="font-medium text-gh-fg-default dark:text-gh-fg-default-dark">{ep.name}</span>
                            </div>
                            <span className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark font-mono">{ep.url}</span>
                            <div className="flex gap-gh-4 text-gh-xs text-gh-fg-muted dark:text-gh-fg-muted-dark">
                              <span>Threshold: <span className="font-mono">{ep.threshold ?? 3}</span></span>
                              <span>Interval: <span className="font-mono">{ep.interval ?? 30}s</span></span>
                            </div>
                            {ep.status === 0 && ep.reason && (
                              <div className="ml-gh-4 text-gh-sm text-gh-danger-fg dark:text-gh-danger-fg-dark">
                                Reason: <span className="font-mono">{ep.reason}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-gh-3">
                            <span className={`${status.className} px-gh-2 py-gh-1 rounded-gh text-gh-xs font-medium`}>
                              {status.text}
                            </span>
                            <button
                              className="text-gh-accent-fg dark:text-gh-accent-fg-dark hover:text-gh-accent-emphasis dark:hover:text-gh-accent-emphasis-dark text-gh-sm opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => startEdit(ep)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-gh-danger-fg dark:text-gh-danger-fg-dark hover:text-gh-danger-emphasis dark:hover:text-gh-danger-emphasis-dark text-gh-sm opacity-0 group-hover:opacity-100 transition-all ml-gh-2"
                              onClick={async () => {
                                if (!confirm(`Delete endpoint '${ep.name}'?`)) return;
                                await api.delete(`/api/health/endpoints/${ep.id}`);
                                fetchEndpoints();
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
