import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-extrabold mb-4 text-blue-700 flex items-center justify-center gap-2">
        Tracker
      </h1>
      <p className="mb-6 text-lg text-gray-700">
        Tracker is a real-time collaborative platform for managing, tracking, and resolving infrastructure issues. 
      </p>
      <div className="flex justify-center gap-6 mt-8">
        <Link
          to="/issues"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold shadow"
        >
          Go to Issues
        </Link>
        <Link
          to="/playbooks"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold shadow"
        >
          Go to Playbooks
        </Link>
        <Link
          to="/healths"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded font-semibold shadow"
        >
          Go to Healths
        </Link>
      </div>
    </div>
  );
}
