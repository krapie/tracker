import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { HealthEndpoint } from "../types/types";
import { api } from "../utils/api";

export function HealthDetailPage() {
  const { endpointId } = useParams<{ endpointId: string }>();
  const [ep, setEp] = useState<HealthEndpoint | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [threshold, setThreshold] = useState(3);
  const [interval, setIntervalValue] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    if (!endpointId) return;
    api.get(`/api/health/status`) // list and find by id (server returns list)
      .then(res => res.json())
      .then((data: unknown) => {
        const arr = Array.isArray(data) ? data as unknown[] : [];
        const found = arr.find(item => {
          if (item && typeof item === 'object') {
            const obj = item as Record<string, unknown>;
            const idVal = String(obj.id ?? obj._id ?? '');
            return idVal === endpointId;
          }
          return false;
        });
        if (found && typeof found === 'object') {
          const obj = found as Record<string, unknown>;
          const casted: HealthEndpoint = {
            id: String(obj.id ?? obj._id ?? ''),
            name: String(obj.name ?? ''),
            url: String(obj.url ?? ''),
            status: typeof obj.status === 'number' ? (obj.status as number) : -1,
            threshold: typeof obj.threshold === 'number' ? (obj.threshold as number) : 3,
            failCount: typeof obj.failCount === 'number' ? (obj.failCount as number) : 0,
            interval: typeof obj.interval === 'number' ? (obj.interval as number) : 30,
          };
          setEp(casted);
          setName(casted.name || "");
          setUrl(casted.url || "");
          setThreshold(casted.threshold ?? 3);
          setIntervalValue(casted.interval ?? 30);
        } else {
          setEp(null);
        }
      })
      .catch(() => setEp(null));
  }, [endpointId]);

  const save = async () => {
    if (!endpointId) return;
    await api.put(`/api/health/endpoints/${endpointId}`, { name, url, threshold: Number(threshold), interval: Number(interval) });
    setEditing(false);
    // refresh
    const res = await api.get(`/api/health/status`);
    const data = await res.json();
    const arr = Array.isArray(data) ? data as unknown[] : [];
    const found = arr.find(item => {
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const idVal = String(obj.id ?? obj._id ?? '');
        return idVal === endpointId;
      }
      return false;
    });
    setEp((found as HealthEndpoint) || null);
  };

  const handleDelete = async () => {
    if (!endpointId) return;
    if (!confirm('Delete this health endpoint?')) return;
    const res = await api.delete(`/api/health/endpoints/${endpointId}`);
    if (res.ok) navigate('/healths');
  };

  if (!ep) return <div className="text-gh-fg-default dark:text-white">Loading...</div>;

  const reasonVal = (() => {
    const obj = ep as unknown as Record<string, unknown>;
    const r = obj.reason;
    if (typeof r === 'string') return r;
    if (typeof r === 'number') return String(r);
    return '-';
  })();

  return (
    <div className="max-w-4xl mx-auto p-gh-6 font-gh">
      <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark mb-gh-6">
        <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark flex items-center justify-between">
          <h1 className="text-gh-xl font-semibold text-gh-fg-default dark:text-white">{ep.name}</h1>
          <div className="flex gap-gh-2">
            <button className="text-gh-accent-fg dark:text-gh-accent-fg-dark" onClick={() => navigate('/healths')}>← Back</button>
            <button className="text-gh-danger-fg dark:text-gh-danger-fg-dark" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="px-gh-6 py-gh-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gh-4">
            <div className="space-y-gh-3">
              <div>
                <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">URL</div>
                <div className="font-mono text-gh-fg-default dark:text-white">{ep.url}</div>
              </div>

              <div>
                <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Status</div>
                <div className={`inline-flex items-center px-gh-2 py-gh-1 rounded-gh text-gh-sm font-medium ${ep.status === 1 ? 'bg-gh-success-subtle dark:bg-gh-success-subtle-dark text-gh-success-fg dark:text-gh-success-fg-dark' : ep.status === 0 ? 'bg-gh-danger-subtle dark:bg-gh-danger-subtle-dark text-gh-danger-fg dark:text-gh-danger-fg-dark' : 'bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark text-gh-fg-muted dark:text-gh-fg-muted-dark'}`}>
                  {ep.status === 1 ? 'Up' : ep.status === 0 ? 'Down' : 'Unknown'}
                </div>
              </div>

              <div>
                <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Fail Count</div>
                <div className="font-mono text-gh-fg-default dark:text-white">{ep.failCount ?? 0}</div>
              </div>
            </div>

            <div className="space-y-gh-3">
              <div>
                <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Threshold</div>
                <div className="font-mono text-gh-fg-default dark:text-white">{ep.threshold}</div>
              </div>

              <div>
                <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Interval (sec)</div>
                <div className="font-mono text-gh-fg-default dark:text-white">{ep.interval}</div>
              </div>

              <div>
                <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Reason</div>
                <div className="font-mono text-gh-danger-fg dark:text-white">{reasonVal}</div>
              </div>
            </div>
          </div>

          <div className="pt-gh-4">
            {editing ? (
              <div className="space-y-gh-3">
                <div>
                  <label className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Name</label>
                  <input className="w-full border border-gh-border-default dark:border-gh-border-default-dark px-gh-2 py-gh-1 rounded-gh" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">URL</label>
                  <input className="w-full border border-gh-border-default dark:border-gh-border-default-dark px-gh-2 py-gh-1 rounded-gh" value={url} onChange={e => setUrl(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-gh-3">
                  <div>
                    <label className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Threshold</label>
                    <input type="number" className="w-full border border-gh-border-default dark:border-gh-border-default-dark px-gh-2 py-gh-1 rounded-gh" value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Interval (sec)</label>
                    <input type="number" className="w-full border border-gh-border-default dark:border-gh-border-default-dark px-gh-2 py-gh-1 rounded-gh" value={interval} onChange={e => setIntervalValue(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex gap-gh-2">
                  <button className="bg-gh-success-emphasis dark:bg-gh-success-emphasis-dark px-gh-3 py-gh-2 rounded-gh text-gh-fg-on-emphasis" onClick={save}>Save</button>
                  <button className="px-gh-3 py-gh-2 rounded-gh" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <button className="px-gh-3 py-gh-2 rounded-gh text-gh-accent-fg" onClick={() => setEditing(true)}>Edit</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
