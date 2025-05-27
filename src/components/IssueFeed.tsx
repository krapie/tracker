import { useDocument } from "@yorkie-js/react";
import { useState, useRef, useEffect } from "react";
import { EventComment } from "../types/types";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

/**
 * Uses @uiw/react-md-editor for markdown editing and preview.
 * See docs/react-markdown-editor.md for usage and customization details.
 */
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
          height={180}
          visibleDragbar={false}
          onChange={val => setInput(val || "")}
          data-color-mode="light"
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
                      height={120}
                      visibleDragbar={false}
                      onChange={val => setEditingText(val || "")}
                      data-color-mode="light"
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
