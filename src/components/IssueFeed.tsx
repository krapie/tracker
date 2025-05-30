import { useDocument } from "@yorkie-js/react";
import { useState, useRef, useEffect } from "react";
import { EventComment } from "../types/types";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Uses @uiw/react-md-editor for markdown editing and preview.
 * See docs/react-markdown-editor.md and docs/react-md-editor-image.md for usage and customization details.
 */

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

export function IssueFeed() {
  const [author, setAuthor] = useState("");
  const [input, setInput] = useState<string | undefined>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const editorRef = useRef<HTMLDivElement>(null);
  const { root, update, loading, error } = useDocument<{ events: EventComment[] }>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [root?.events?.length]);

  // Load author from localStorage on mount
  useEffect(() => {
    const savedAuthor = localStorage.getItem("tracker_author");
    if (savedAuthor) setAuthor(savedAuthor);
  }, []);

  // Save author to localStorage when it changes
  useEffect(() => {
    if (author) localStorage.setItem("tracker_author", author);
  }, [author]);

  if (loading) return <div className="text-gh-fg-default dark:text-gh-fg-default-dark">Loading...</div>;
  if (error) return <div className="text-gh-danger-fg dark:text-gh-danger-fg-dark">Error: {error.message}</div>;

  const handleSend = () => {
    if (!input?.trim() || !author.trim()) return;
    update(root => {
      root.events.push({
        id: Date.now().toString(),
        text: input,
        createdAt: Date.now(),
        author,
      });
    });
    setInput("");
  };

  const handleEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleEditSave = () => {
    if (!editingId) return;
    update(root => {
      const idx = root.events.findIndex(ev => ev.id === editingId);
      if (idx !== -1) {
        root.events[idx].text = editingText;
      }
    });
    setEditingId(null);
    setEditingText("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText("");
  };

  // Show events in descending order (newest first)
  const eventsDesc = [...root.events].reverse();

  return (
    <div className="font-gh">
      <h2 className="text-gh-lg font-semibold mb-gh-4 text-gh-fg-default dark:text-gh-fg-default-dark">Event Timeline</h2>
      <div className="flex gap-gh-2 mb-gh-3">
        <input
          className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 flex-1 bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark rounded-gh focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark outline-none"
          placeholder="Your name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
      </div>
      <div className="mb-gh-4">
        <MDEditor
          value={input}
          height={editingId ? 300 : 180}
          visibleDragbar={false}
          onChange={val => setInput(val || "")}
          data-color-mode={resolvedTheme}
          onPaste={async (event) => {
            await handleImagePasteOrDrop(event.clipboardData, setInput);
          }}
          onDrop={async (event) => {
            event.preventDefault(); // Prevent default to stop image opening in new tab
            await handleImagePasteOrDrop(event.dataTransfer, setInput);
          }}
        />
        <button
          className="bg-gh-success-emphasis dark:bg-gh-success-emphasis-dark hover:bg-gh-success-emphasis/90 dark:hover:bg-gh-success-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-4 py-gh-2 rounded-gh mt-gh-2 text-gh-sm font-medium border border-gh-success-emphasis dark:border-gh-success-emphasis-dark transition-colors"
          onClick={handleSend}
        >
          Add Event
        </button>
      </div>
      <div
        ref={editorRef}
        className="relative border-l-2 border-gh-border-default dark:border-gh-border-default-dark pl-gh-6 mb-gh-4 min-h-[320px] py-gh-4"
      >
        {eventsDesc.length === 0 && (
          <div className="text-gh-fg-muted dark:text-gh-fg-muted-dark">No events yet.</div>
        )}
        {eventsDesc.map((ev) => (
          <div key={ev.id} className="mb-gh-8 flex items-start group">
            <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark rounded-full ring-4 ring-gh-canvas-default dark:ring-gh-canvas-default-dark">
              <span className="text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark font-bold text-gh-sm">{ev.author[0]?.toUpperCase() || "?"}</span>
            </span>
            <div className="w-full">
              <div className="flex items-center gap-gh-2">
                <span className="font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">{ev.author}</span>
                <span className="text-gh-xs text-gh-fg-muted dark:text-gh-fg-muted-dark">{new Date(ev.createdAt).toLocaleString()}</span>
                {editingId !== ev.id && (
                  <button
                    className="ml-gh-2 text-gh-xs text-gh-accent-fg dark:text-gh-accent-fg-dark underline opacity-0 group-hover:opacity-100 transition-opacity hover:text-gh-accent-emphasis dark:hover:text-gh-accent-emphasis-dark"
                    onClick={() => handleEdit(ev.id, ev.text)}
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="mt-gh-1 text-gh-fg-default dark:text-gh-fg-default-dark prose prose-sm dark:prose-invert max-w-none w-full">
                {editingId === ev.id ? (
                  <div>
                    <MDEditor
                      value={editingText}
                      height={300}
                      visibleDragbar={false}
                      onChange={val => setEditingText(val || "")}
                      data-color-mode={resolvedTheme}
                      onPaste={async (event) => {
                        await handleImagePasteOrDrop(event.clipboardData, val => setEditingText(val || ""));
                      }}
                      onDrop={async (event) => {
                        event.preventDefault(); // Prevent default to stop image opening in new tab
                        await handleImagePasteOrDrop(event.dataTransfer, val => setEditingText(val || ""));
                      }}
                    />
                    <div className="mt-gh-2 flex gap-gh-2">
                      <button
                        className="bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-3 py-gh-2 rounded-gh text-gh-sm font-medium border border-gh-accent-emphasis dark:border-gh-accent-emphasis-dark transition-colors"
                        onClick={handleEditSave}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark hover:bg-gh-canvas-inset dark:hover:bg-gh-canvas-inset-dark text-gh-fg-default dark:text-gh-fg-default-dark px-gh-3 py-gh-2 rounded-gh text-gh-sm font-medium border border-gh-border-default dark:border-gh-border-default-dark transition-colors"
                        onClick={handleEditCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <MDEditor.Markdown
                      source={ev.text}
                      wrapperElement={{ "data-color-mode": resolvedTheme }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
