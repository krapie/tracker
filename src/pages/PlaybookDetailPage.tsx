import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Playbook, PlaybookStep } from "../types/types";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useTheme } from "../contexts/ThemeContext";

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
  const { resolvedTheme } = useTheme();

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

  if (!playbook) return <div className="text-gh-fg-default dark:text-gh-fg-default-dark">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-gh-6 font-gh">
      {!editMode ? (
        <>
          {/* Header */}
          <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark mb-gh-6">
            <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
              <div className="flex items-center justify-between">
                <h1 className="text-gh-xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">{playbook.name}</h1>
                <div className="flex gap-gh-2">
                  <button
                    className="bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-3 py-gh-2 rounded-gh text-gh-sm font-medium border border-gh-accent-emphasis dark:border-gh-accent-emphasis-dark transition-colors"
                    onClick={() => setEditMode(true)}
                  >
                    Edit playbook
                  </button>
                  <button
                    className="text-gh-accent-fg dark:text-gh-accent-fg-dark hover:text-gh-accent-emphasis dark:hover:text-gh-accent-emphasis-dark text-gh-sm font-medium transition-colors"
                    onClick={() => navigate("/playbooks")}
                  >
                    ← Back to list
                  </button>
                </div>
              </div>
            </div>
            <div className="px-gh-6 py-gh-3">
              <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">
                {playbook.steps.length} step{playbook.steps.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Steps Display */}
          <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
            <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
              <h2 className="text-gh-lg font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">Steps</h2>
            </div>
            <div className="px-gh-6 py-gh-6">
              <div className="relative border-l-2 border-gh-border-default dark:border-gh-border-default-dark pl-gh-6 min-h-[120px]">
                {playbook.steps.length === 0 && (
                  <div className="text-gh-fg-muted dark:text-gh-fg-muted-dark">No steps yet.</div>
                )}
                {playbook.steps.map((step, idx) => (
                  <div key={idx} className="mb-gh-8 flex items-start group">
                    <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark rounded-full ring-4 ring-gh-canvas-default dark:ring-gh-canvas-default-dark">
                      <span className="text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark font-bold text-gh-sm">{idx + 1}</span>
                    </span>
                    <div className="w-full">
                      <div className="flex items-center gap-gh-2">
                        <span className="font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">Step {idx + 1}</span>
                      </div>
                      <div className="mt-gh-1 text-gh-fg-default dark:text-gh-fg-default-dark prose prose-sm dark:prose-invert max-w-none w-full">
                        <MDEditor.Markdown source={step.content} wrapperElement={{"data-color-mode": resolvedTheme}} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode Header */}
          <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark mb-gh-6">
            <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
              <h1 className="text-gh-xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">Edit Playbook</h1>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-gh-6">
            <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
              <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
                <label className="block text-gh-sm font-medium text-gh-fg-default dark:text-gh-fg-default-dark mb-gh-2">
                  Playbook name
                </label>
                <input
                  className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 w-full rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
                  placeholder="Playbook name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
              <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
                <label className="block text-gh-sm font-medium text-gh-fg-default dark:text-gh-fg-default-dark">Steps</label>
              </div>
              <div className="px-gh-6 py-gh-4 space-y-gh-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark p-gh-4">
                    <div className="flex items-center justify-between mb-gh-2">
                      <h4 className="text-gh-sm font-medium text-gh-fg-default dark:text-gh-fg-default-dark">Step {idx + 1}</h4>
                      {steps.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeStep(idx)}
                          className="text-gh-danger-fg dark:text-gh-danger-fg-dark hover:text-gh-danger-emphasis dark:hover:text-gh-danger-emphasis-dark text-gh-sm transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <MDEditor
                      value={step.content}
                      onChange={v => handleStepChange(idx, v || "")}
                      height={120}
                      data-color-mode={resolvedTheme}
                      onPaste={async (event) => {
                        await handleImagePasteOrDrop(event.clipboardData, v => handleStepChange(idx, v || ""));
                      }}
                      onDrop={async (event) => {
                        event.preventDefault();
                        await handleImagePasteOrDrop(event.dataTransfer, v => handleStepChange(idx, v || ""));
                      }}
                    />
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addStep} 
                  className="text-gh-accent-fg dark:text-gh-accent-fg-dark hover:text-gh-accent-emphasis dark:hover:text-gh-accent-emphasis-dark text-gh-sm font-medium transition-colors"
                >
                  + Add Step
                </button>
              </div>
            </div>

            <div className="flex gap-gh-3">
              <button
                type="submit"
                className="bg-gh-success-emphasis dark:bg-gh-success-emphasis-dark hover:bg-gh-success-emphasis/90 dark:hover:bg-gh-success-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-4 py-gh-2 rounded-gh text-gh-sm font-medium border border-gh-success-emphasis dark:border-gh-success-emphasis-dark transition-colors"
              >
                Save changes
              </button>
              <button
                type="button"
                className="bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark hover:bg-gh-canvas-inset dark:hover:bg-gh-canvas-inset-dark text-gh-fg-default dark:text-gh-fg-default-dark px-gh-4 py-gh-2 rounded-gh text-gh-sm font-medium border border-gh-border-default dark:border-gh-border-default-dark transition-colors"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
