import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Playbook, PlaybookStep } from "../types/types";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const API_URL = import.meta.env.VITE_API_URL;

async function uploadImageToBackend(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/images/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url as string;
}

function insertImageMarkdown(url: string) {
  const textarea = document.querySelector("textarea");
  if (!textarea) return null;
  let sentence = textarea.value;
  const len = sentence.length;
  const pos = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const front = sentence.slice(0, pos);
  const back = sentence.slice(pos, len);
  const insertString = `![](${url})`;
  sentence = front + insertString + back;
  textarea.value = sentence;
  textarea.selectionEnd = end + insertString.length;
  return sentence;
}

async function handleImagePasteOrDrop(
  dataTransfer: DataTransfer,
  setMarkdown: (value: string | undefined) => void
) {
  const files: File[] = [];
  for (let i = 0; i < dataTransfer.items.length; i++) {
    const file = dataTransfer.files.item(i);
    if (file && file.type.startsWith("image/")) {
      files.push(file);
    }
  }
  await Promise.all(
    files.map(async (file) => {
      const url = await uploadImageToBackend(file);
      if (url) {
        const insertedMarkdown = insertImageMarkdown(url);
        if (insertedMarkdown !== null) {
          setMarkdown(insertedMarkdown);
        }
      }
    })
  );
}

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
          <div className="relative border-l-2 border-gray-300 pl-6 mb-6 min-h-[120px] py-4">
            {playbook.steps.length === 0 && (
              <div className="text-gray-400">No steps yet.</div>
            )}
            {playbook.steps.map((step, idx) => (
              <div key={idx} className="mb-8 flex items-start group">
                <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 bg-blue-500 rounded-full ring-4 ring-white">
                  <span className="text-white font-bold">{idx + 1}</span>
                </span>
                <div className="w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Step {idx + 1}</span>
                  </div>
                  <div className="mt-1 text-gray-800 prose prose-sm max-w-none w-full">
                    <MDEditor.Markdown source={step.content} wrapperElement={{"data-color-mode": "light"}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  <div className="flex-1">
                    <MDEditor
                      value={step.content}
                      onChange={v => handleStepChange(idx, v || "")}
                      height={120}
                      onPaste={async (event) => {
                        await handleImagePasteOrDrop(event.clipboardData, v => handleStepChange(idx, v || ""));
                      }}
                      onDrop={async (event) => {
                        event.preventDefault();
                        await handleImagePasteOrDrop(event.dataTransfer, v => handleStepChange(idx, v || ""));
                      }}
                    />
                  </div>
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
