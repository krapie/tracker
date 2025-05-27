import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Playbook, PlaybookStep } from "../types/types";

const API_URL = import.meta.env.VITE_API_URL;

export function PlaybookDetailPage() {
  const { playbookId } = useParams<{ playbookId: string }>();
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<PlaybookStep[]>([{ content: "" }]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!playbookId) return;
    fetch(`${API_URL}/api/playbooks/${playbookId}`)
      .then(res => res.json())
      .then((data: Playbook) => {
        setPlaybook(data);
        setName(data.name);
        setSteps(data.steps.length ? data.steps : [{ content: "" }]);
      });
  }, [playbookId]);

  const handleStepChange = (idx: number, value: string) => {
    setSteps(steps =>
      steps.map((step, i) => (i === idx ? { content: value } : step))
    );
  };

  const addStep = () => setSteps([...steps, { content: "" }]);
  const removeStep = (idx: number) =>
    setSteps(steps => steps.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredSteps = steps.filter(s => s.content.trim());
    await fetch(`${API_URL}/api/playbooks/${playbookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, steps: filteredSteps }),
    });
    setEditMode(false);
    setPlaybook({ id: playbookId!, name, steps: filteredSteps });
  };

  if (!playbook) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      {!editMode ? (
        <>
          <h1 className="text-2xl font-bold mb-4">{playbook.name}</h1>
          <ol className="mb-6 list-decimal pl-6">
            {playbook.steps.map((step, idx) => (
              <li key={idx} className="mb-2">{step.content}</li>
            ))}
          </ol>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setEditMode(true)}
          >
            Edit Playbook
          </button>
          <button
            className="ml-4 text-gray-600 underline"
            onClick={() => navigate("/playbooks")}
          >
            Back to List
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Edit Playbook</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="border px-3 py-2 w-full rounded"
              placeholder="Playbook name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <div>
              <label className="font-semibold">Steps:</label>
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    className="border px-2 py-1 flex-1 rounded"
                    placeholder={`Step ${idx + 1}`}
                    value={step.content}
                    onChange={e => handleStepChange(idx, e.target.value)}
                    required
                  />
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(idx)}>
                      ❌
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addStep} className="text-blue-600 mt-2">
                + Add Step
              </button>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              className="ml-4 text-gray-600 underline"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </form>
        </>
      )}
    </div>
  );
}
