import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import type { Issue, Playbook, HealthEndpoint, Report } from "../types/types";

type HomeSummary = {
  healths: HealthEndpoint[];
  issues: Issue[];
  playbooks: Playbook[];
  reports: Report[];
};

export function HomePage() {
  const [data, setData] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [hRes, iRes, pRes, rRes] = await Promise.all([
          api.get("/api/health/status"),
          api.get("/api/issues/"),
          api.get("/api/playbooks/"),
          api.get("/api/reports/"),
        ]);

        // parse JSON responses, but be defensive in case of non-OK
        const hJson = hRes.ok ? await hRes.json() : [];
        const iJson = iRes.ok ? await iRes.json() : [];
        const pJson = pRes.ok ? await pRes.json() : [];
        const rJson = rRes.ok ? await rRes.json() : [];

        if (!mounted) return;

        setData({
          healths: Array.isArray(hJson) ? hJson : hJson.endpoints || [],
          issues: Array.isArray(iJson) ? iJson : iJson.issues || [],
          playbooks: Array.isArray(pJson) ? pJson : pJson.playbooks || [],
          reports: Array.isArray(rJson) ? rJson : rJson.reports || [],
        });
      } catch (err: unknown) {
        console.error("Failed to fetch home summary", err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || 'Failed to fetch data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto font-gh">
      <div className="text-center py-gh-10">
        <h1 className="text-gh-3xl font-semibold mb-gh-2 text-gh-fg-default dark:text-gh-fg-default-dark flex items-center justify-center gap-gh-3">
          <span className="text-4xl">🚦</span>
          Tracker
        </h1>
        <p className="text-gh-lg text-gh-fg-muted dark:text-gh-fg-muted-dark max-w-2xl mx-auto mb-gh-4">
          A real-time collaborative infrastructure event tracking system
        </p>
      </div>

      <div className="mb-gh-6">
        {loading && <div className="text-center text-gh-fg-muted">Loading summary...</div>}
        {error && <div className="text-center text-gh-danger-fg">Error: {error}</div>}
      </div>

      {data && (() => {
        const totalHealth = data.healths.length;
        const upHealth = data.healths.filter(h => h.status === 1).length;
        const downHealth = data.healths.filter(h => h.status === 0).length;

        const totalIssues = data.issues.length;
        const openIssues = data.issues.filter(i => i.status === 1).length;
        const closedIssues = data.issues.filter(i => i.status === 0).length;

        return (
          <div className="grid md:grid-cols-2 gap-gh-4 mb-gh-8">
              <div className="p-gh-6 border border-gh-border-default dark:border-gh-border-default-dark rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
                <div className="text-gh-lg font-semibold mb-gh-3 text-gh-fg-default dark:text-white">Health Overview</div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Success</div>
                    <div className="text-3xl font-bold text-gh-success-fg dark:text-gh-success-fg-dark">{upHealth}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Fail</div>
                    <div className="text-3xl font-bold text-gh-danger-fg dark:text-gh-danger-fg-dark">{downHealth}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Total</div>
                    <div className="text-3xl font-bold text-gh-fg-default dark:text-white">{totalHealth}</div>
                  </div>
                </div>
              </div>

            <div className="p-gh-6 border border-gh-border-default dark:border-gh-border-default-dark rounded-gh bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
              <div className="text-gh-lg font-semibold mb-gh-3 text-gh-fg-default dark:text-white">Issues Overview</div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Open</div>
                  <div className="text-3xl font-bold text-gh-warning-fg dark:text-gh-warning-fg-dark">{openIssues}</div>
                </div>
                <div className="text-center">
                  <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Closed</div>
                  <div className="text-3xl font-bold text-gh-success-fg dark:text-gh-success-fg-dark">{closedIssues}</div>
                </div>
                <div className="text-center">
                  <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Total</div>
                  <div className="text-3xl font-bold text-gh-fg-default dark:text-white">{totalIssues}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Keep some of the original quick navigation */}
      <div className="border-t border-gh-border-default dark:border-gh-border-default-dark pt-gh-8">
        <h2 className="text-gh-xl font-semibold mb-gh-6 text-gh-fg-default dark:text-gh-fg-default-dark text-center">Quick Navigation</h2>
  <div className="grid sm:grid-cols-4 gap-gh-4">
          <Link
            to="/issues"
            className="flex items-center gap-gh-3 p-gh-4 border border-gh-border-default dark:border-gh-border-default-dark rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors"
          >
            <span className="text-xl">🐛</span>
            <div>
              <div className="font-medium text-gh-fg-default dark:text-gh-fg-default-dark">Issues</div>
              <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Manage and track issues</div>
            </div>
          </Link>

          <Link
            to="/playbooks"
            className="flex items-center gap-gh-3 p-gh-4 border border-gh-border-default dark:border-gh-border-default-dark rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors"
          >
            <span className="text-xl">📖</span>
            <div>
              <div className="font-medium text-gh-fg-default dark:text-gh-fg-default-dark">Playbooks</div>
              <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Standard procedures</div>
            </div>
          </Link>

          <Link
            to="/healths"
            className="flex items-center gap-gh-3 p-gh-4 border border-gh-border-default dark:border-gh-border-default-dark rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors"
          >
            <span className="text-xl">💊</span>
            <div>
              <div className="font-medium text-gh-fg-default dark:text-gh-fg-default-dark">Health</div>
              <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">System health monitoring</div>
            </div>
          </Link>

          <Link
            to="/reports"
            className="flex items-center gap-gh-3 p-gh-4 border border-gh-border-default dark:border-gh-border-default-dark rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark transition-colors"
          >
            <span className="text-xl">📝</span>
            <div>
              <div className="font-medium text-gh-fg-default dark:text-gh-fg-default-dark">Reports</div>
              <div className="text-gh-sm text-gh-fg-muted dark:text-gh-fg-muted-dark">Incident documentation</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
