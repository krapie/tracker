import { useEffect, useState, useRef } from "react";
import { HealthEndpoint } from "../types/types";

const API_URL = import.meta.env.VITE_API_URL;

function statusLabel(status: number) {
  if (status === 1) return { text: "up", className: "bg-green-100 text-green-700" };
  if (status === 0) return { text: "down", className: "bg-red-100 text-red-700" };
  return { text: "unknown", className: "bg-gray-100 text-gray-500" };
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
    fetch(`${API_URL}/api/health/status`)
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
    if (intervalRef.current) clearInterval(intervalRef.current);
    const minInterval = getMinInterval(endpoints) * 1000;
    intervalRef.current = setInterval(fetchEndpoints, minInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints.map(e => e.interval).join(",")]);

  const handleRegister = async () => {
    if (!name.trim() || !url.trim()) return;
    await fetch(`${API_URL}/api/health/endpoints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, threshold, interval }),
    });
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
    await fetch(`${API_URL}/api/health/endpoints/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, threshold: Number(threshold), interval: Number(interval) }),
    });
    setEditState(s => ({
      ...s,
      [id]: { ...s[id], editing: false },
    }));
    fetchEndpoints();
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Health Check Endpoints</h1>
      <div className="mb-6 flex gap-2">
        <input
          className="border px-3 py-2 flex-1 rounded"
          placeholder="Endpoint name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="border px-3 py-2 flex-1 rounded"
          placeholder="Endpoint URL (e.g. https://example.com/health)"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <input
          className="border px-3 py-2 w-24 rounded"
          placeholder="Threshold"
          value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
        />
        <input
          className="border px-3 py-2 w-24 rounded"
          placeholder="Interval (sec)"
          value={interval}
          onChange={e => setIntervalValue(Number(e.target.value))}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          onClick={handleRegister}
        >
          + Register
        </button>
      </div>
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Registered Endpoints</h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <ul>
            {endpoints.length === 0 && (
              <li className="text-gray-400 italic">No endpoints registered.</li>
            )}
            {endpoints.map(ep => {
              const status = statusLabel(ep.status as number);
              const edit = editState[ep.id];
              return (
                <li
                  key={ep.id}
                  className="mb-2 flex items-center justify-between border-b last:border-b-0 py-2"
                >
                  {edit && edit.editing ? (
                    <span className="flex-1 flex gap-2 items-center">
                      <input
                        className="border px-2 py-1 rounded w-32"
                        value={edit.name}
                        onChange={e => handleEditChange(ep.id, "name", e.target.value)}
                      />
                      <input
                        className="border px-2 py-1 rounded w-56"
                        value={edit.url}
                        onChange={e => handleEditChange(ep.id, "url", e.target.value)}
                      />
                      <input
                        className="border px-2 py-1 rounded w-20"
                        value={edit.threshold}
                        onChange={e => handleEditChange(ep.id, "threshold", Number(e.target.value))}
                      />
                      <input
                        className="border px-2 py-1 rounded w-24"
                        value={edit.interval}
                        onChange={e => handleEditChange(ep.id, "interval", Number(e.target.value))}
                      />
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded ml-2"
                        onClick={() => saveEdit(ep.id)}
                      >
                        Save
                      </button>
                      <button
                        className="ml-2 text-gray-500 underline"
                        onClick={() => cancelEdit(ep.id)}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span className="flex-1 flex gap-2 items-center">
                      <span className="font-semibold">{ep.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{ep.url}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        Threshold: <span className="font-mono">{ep.threshold ?? 3}</span>
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        Interval: <span className="font-mono">{ep.interval ?? 30}s</span>
                      </span>
                    </span>
                  )}
                  <span
                    className={`${status.className} px-2 py-0.5 rounded text-xs font-semibold`}
                  >
                    {status.text}
                  </span>
                  {!edit?.editing && (
                    <button
                      className="ml-4 text-blue-600 underline text-xs"
                      onClick={() => startEdit(ep)}
                    >
                      Edit
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
