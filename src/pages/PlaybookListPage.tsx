import { useEffect, useState } from "react";
import { Playbook } from "../types/types";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export function PlaybookListPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [playbookName, setPlaybookName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/playbooks/`)
      .then(res => res.json())
      .then(data => setPlaybooks(Array.isArray(data) ? data : []));
  }, []);

  // Create a new playbook and navigate to its detail page
  const handleCreate = async () => {
    const name = playbookName.trim();
    if (!name) return;
    const res = await fetch(`${API_URL}/api/playbooks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, steps: [{ content: "" }] }),
    });
    if (res.ok) {
      const created = await res.json();
      setPlaybookName("");
      navigate(`/playbooks/${created.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Playbooks</h1>
      <div className="mb-6 flex gap-2">
        <input
          className="border px-3 py-2 flex-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="New playbook name"
          value={playbookName}
          onChange={e => setPlaybookName(e.target.value)}
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
      <ul>
        {playbooks.map(pb => (
          <li key={pb.id} className="mb-2 flex items-center justify-between">
            <span>{pb.name}</span>
            <button
              className="text-blue-700 underline"
              onClick={() => navigate(`/playbooks/${pb.id}`)}
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
