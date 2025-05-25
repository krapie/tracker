import { useDocument } from "@yorkie-js/react";
import { useState, useRef, useEffect } from "react";
import { EventComment } from "../types/types"; // If you renamed the file, update the import path accordingly

export function IssueFeed() {
  const [author, setAuthor] = useState("");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { root, update, loading, error } = useDocument<{ events: EventComment[] }>();

  useEffect(() => {
    // Keep focus on the event input after adding an event
    inputRef.current?.focus();
  }, [root?.events?.length]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleSend = () => {
    if (!input.trim() || !author.trim()) return;
    update(root => {
      root.events.push({
        id: Date.now().toString(),
        text: input,
        createdAt: Date.now(),
        author,
      });
    });
    setInput("");
    // Focus will be restored by useEffect
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
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          className="border px-2 py-1 flex-1"
          placeholder="Describe event"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button className="bg-green-600 text-white px-4 py-1 rounded" onClick={handleSend}>
          Add Event
        </button>
      </div>
      <div className="relative border-l-2 border-gray-300 pl-6 mb-4 min-h-[320px] bg-gray-50 py-4">
        {eventsDesc.length === 0 && (
          <div className="text-gray-400">No events yet.</div>
        )}
        {eventsDesc.map((ev, idx) => (
          <div key={ev.id} className="mb-8 flex items-start group">
            <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 bg-blue-500 rounded-full ring-4 ring-white">
              <span className="text-white font-bold">{ev.author[0]?.toUpperCase() || "?"}</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{ev.author}</span>
                <span className="text-xs text-gray-500">{new Date(ev.createdAt).toLocaleString()}</span>
              </div>
              <div className="mt-1 text-gray-800">{ev.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
