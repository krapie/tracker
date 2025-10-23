import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Report } from "../types/types";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../utils/api";

async function uploadImageToBackend(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.uploadFile('/api/images/upload', formData);
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

export function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!reportId) return;
    api.get(`/api/reports/${reportId}`)
      .then(res => res.json())
      .then((data: Report) => {
        setReport(data);
        setTitle(data.title);
        setContent(data.content);
      });
  }, [reportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;
    
    await api.put(`/api/reports/${reportId}`, { title, content });
    setEditMode(false);
    setReport(prev => prev ? { ...prev, title, content } : null);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    const res = await api.delete(`/api/reports/${reportId}`);
    if (res.ok) {
      navigate('/reports');
    }
  };

  if (!report) return <div className="text-gh-fg-default dark:text-gh-fg-default-dark">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-gh-6 font-gh">
      {!editMode ? (
        <>
          {/* Header */}
          <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark mb-gh-6">
            <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-gh-xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">{report.title}</h1>
                  <p className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark mt-1">
                    Last updated {new Date(report.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-gh-2">
                  <button
                    className="bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-3 py-gh-2 rounded-gh text-gh-sm font-medium border border-gh-accent-emphasis dark:border-gh-accent-emphasis-dark transition-colors"
                    onClick={() => setEditMode(true)}
                  >
                    Edit report
                  </button>
                  <button
                    className="text-gh-danger-fg dark:text-gh-danger-fg-dark hover:text-gh-danger-emphasis dark:hover:text-gh-danger-emphasis-dark text-gh-sm font-medium transition-colors"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    className="text-gh-accent-fg dark:text-gh-accent-fg-dark hover:text-gh-accent-emphasis dark:hover:text-gh-accent-emphasis-dark text-gh-sm font-medium transition-colors"
                    onClick={() => navigate("/reports")}
                  >
                    ← Back to list
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Display */}
          <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
            <div className="px-gh-6 py-gh-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MDEditor.Markdown source={report.content} wrapperElement={{"data-color-mode": resolvedTheme}} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode Header */}
          <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark mb-gh-6">
            <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
              <h1 className="text-gh-xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">Edit Report</h1>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-gh-6">
            <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
              <div className="px-gh-6 py-gh-4">
                <label className="block text-gh-sm font-medium text-gh-fg-default dark:text-gh-fg-default-dark mb-gh-2">
                  Report title
                </label>
                <input
                  className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 w-full rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
                  placeholder="Report title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
              <div className="px-gh-6 py-gh-4">
                <label className="block text-gh-sm font-medium text-gh-fg-default dark:text-gh-fg-default-dark mb-gh-2">
                  Report content
                </label>
                <MDEditor
                  value={content}
                  onChange={v => setContent(v || "")}
                  height={500}
                  data-color-mode={resolvedTheme}
                  onPaste={async (event) => {
                    await handleImagePasteOrDrop(event.clipboardData, v => setContent(v || ""));
                  }}
                  onDrop={async (event) => {
                    event.preventDefault();
                    await handleImagePasteOrDrop(event.dataTransfer, v => setContent(v || ""));
                  }}
                />
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