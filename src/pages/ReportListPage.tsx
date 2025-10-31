import { useEffect, useState } from "react";
import { Report } from "../types/types";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export function ReportListPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTitle, setReportTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/reports/')
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []));
  }, []);

  // Create a new report and navigate to its detail page
  const handleCreate = async () => {
    const title = reportTitle.trim();
    if (!title) return;
    const res = await api.post('/api/reports/', { title, content: "" });
    if (res.ok) {
      const created = await res.json();
      setReportTitle("");
      navigate(`/reports/${created.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-gh-6 font-gh">
      {/* Header */}
      <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark mb-gh-6">
        <div className="px-gh-6 py-gh-4 border-b border-gh-border-default dark:border-gh-border-default-dark">
          <h1 className="text-gh-2xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">Reports</h1>
          <p className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark mt-gh-1">
            Create and manage reports for incident documentation and analysis.
          </p>
        </div>
        
        {/* Create Form */}
        <div className="px-gh-6 py-gh-4">
          <div className="flex gap-gh-3">
            <input
              className="border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 flex-1 rounded-gh focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark focus:outline-none bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark placeholder-gh-fg-muted dark:placeholder-gh-fg-muted-dark"
              placeholder="New report title"
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <button
              className="bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-4 py-gh-2 rounded-gh font-medium text-gh-sm border border-gh-accent-emphasis dark:border-gh-accent-emphasis-dark transition-colors"
              onClick={handleCreate}
            >
              Create report
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-gh-3">
        {reports.length === 0 ? (
          <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark px-gh-6 py-gh-8 text-center">
            <div className="text-gh-fg-muted dark:text-gh-fg-muted-dark text-gh-sm">
              No reports yet. Create your first report to get started.
            </div>
          </div>
        ) : (
          reports.map(report => (
            <div
              key={report.id}
              className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors group cursor-pointer"
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <div className="flex items-center justify-between px-gh-6 py-gh-4">
                <div className="flex items-center gap-gh-3">
                  <div className="w-8 h-8 rounded-gh bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark border border-gh-border-default dark:border-gh-border-default-dark flex items-center justify-center">
                    <svg className="w-4 h-4 text-gh-fg-muted dark:text-gh-fg-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gh-base font-medium text-gh-fg-default dark:text-gh-fg-default-dark group-hover:text-gh-accent-fg dark:group-hover:text-gh-accent-fg-dark transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">
                      Updated {new Date(report.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">&nbsp;</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
