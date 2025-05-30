import { useDocument } from "@yorkie-js/react";
import { useState, useRef, useEffect } from "react";
import { EventComment } from "../types/types";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
    <div>
      <h2 className="text-xl font-bold mb-4">Event Timeline</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 flex-1"
          placeholder="Your name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <MDEditor
          value={input}
          height={editingId ? 300 : 180}
          visibleDragbar={false}
          onChange={val => setInput(val || "")}
          data-color-mode="light"
          onPaste={async (event) => {
            await handleImagePasteOrDrop(event.clipboardData, setInput);
          }}
          onDrop={async (event) => {
            event.preventDefault(); // Prevent default to stop image opening in new tab
            await handleImagePasteOrDrop(event.dataTransfer, setInput);
          }}
        />
        <button
          className="bg-green-600 text-white px-4 py-1 rounded mt-2"
          onClick={handleSend}
        >
          Add Event
        </button>
      </div>
      <div
        ref={editorRef}
        className="relative border-l-2 border-gray-300 pl-6 mb-4 min-h-[320px] py-4"
      >
        {eventsDesc.length === 0 && (
          <div className="text-gray-400">No events yet.</div>
        )}
        {eventsDesc.map((ev) => (
          <div key={ev.id} className="mb-8 flex items-start group">
            <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 bg-blue-500 rounded-full ring-4 ring-white">
              <span className="text-white font-bold">{ev.author[0]?.toUpperCase() || "?"}</span>
            </span>
            <div className="w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{ev.author}</span>
                <span className="text-xs text-gray-500">{new Date(ev.createdAt).toLocaleString()}</span>
                {editingId !== ev.id && (
                  <button
                    className="ml-2 text-xs text-blue-600 underline opacity-0 group-hover:opacity-100"
                    onClick={() => handleEdit(ev.id, ev.text)}
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="mt-1 text-gray-800 prose prose-sm max-w-none w-full">
                {editingId === ev.id ? (
                  <div>
                    <MDEditor
                      value={editingText}
                      height={300}
                      visibleDragbar={false}
                      onChange={val => setEditingText(val || "")}
                      data-color-mode="light"
                      onPaste={async (event) => {
                        await handleImagePasteOrDrop(event.clipboardData, val => setEditingText(val || ""));
                      }}
                      onDrop={async (event) => {
                        event.preventDefault(); // Prevent default to stop image opening in new tab
                        await handleImagePasteOrDrop(event.dataTransfer, val => setEditingText(val || ""));
                      }}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={handleEditSave}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
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
                      wrapperElement={{ "data-color-mode": "light" }}
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
