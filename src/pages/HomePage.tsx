import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto font-gh">
      {/* Hero Section */}
      <div className="text-center py-gh-16">
        <h1 className="text-gh-3xl font-semibold mb-gh-4 text-gh-fg-default dark:text-gh-fg-default-dark flex items-center justify-center gap-gh-3">
          <span className="text-4xl">🚦</span>
          Tracker
        </h1>
        <p className="text-gh-lg text-gh-fg-muted dark:text-gh-fg-muted-dark max-w-2xl mx-auto mb-gh-8">
          A real-time collaborative platform for managing, tracking, and resolving infrastructure issues with team collaboration at its core.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-gh-4 justify-center items-center">
          <Link
            to="/issues"
            className="bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-6 py-gh-3 rounded-gh font-medium shadow-sm transition-all inline-flex items-center gap-gh-2"
          >
            <span>📋</span>
            View Issues
          </Link>
          <Link
            to="/playbooks"
            className="border border-gh-border-default dark:border-gh-border-default-dark bg-gh-canvas-default dark:bg-gh-canvas-default-dark hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark text-gh-fg-default dark:text-gh-fg-default-dark px-gh-6 py-gh-3 rounded-gh font-medium transition-all inline-flex items-center gap-gh-2"
          >
            <span>📚</span>
            Browse Playbooks
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-gh-6 mb-gh-16">
        <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg p-gh-6 bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
          <div className="text-2xl mb-gh-4">🔄</div>
          <h3 className="text-gh-lg font-semibold mb-gh-2 text-gh-fg-default dark:text-gh-fg-default-dark">Real-time Collaboration</h3>
          <p className="text-gh-fg-muted dark:text-gh-fg-muted-dark text-gh-sm">
            Work together in real-time with live updates and synchronized editing across your team.
          </p>
        </div>
        
        <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg p-gh-6 bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
          <div className="text-2xl mb-gh-4">📊</div>
          <h3 className="text-gh-lg font-semibold mb-gh-2 text-gh-fg-default dark:text-gh-fg-default-dark">Issue Tracking</h3>
          <p className="text-gh-fg-muted dark:text-gh-fg-muted-dark text-gh-sm">
            Track and manage infrastructure issues with detailed logging and status updates.
          </p>
        </div>
        
        <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg p-gh-6 bg-gh-canvas-default dark:bg-gh-canvas-default-dark">
          <div className="text-2xl mb-gh-4">📋</div>
          <h3 className="text-gh-lg font-semibold mb-gh-2 text-gh-fg-default dark:text-gh-fg-default-dark">Playbook Management</h3>
          <p className="text-gh-fg-muted dark:text-gh-fg-muted-dark text-gh-sm">
            Create and manage standardized playbooks for consistent incident response procedures.
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="border-t border-gh-border-default dark:border-gh-border-default-dark pt-gh-8">
        <h2 className="text-gh-xl font-semibold mb-gh-6 text-gh-fg-default dark:text-gh-fg-default-dark text-center">Quick Navigation</h2>
        <div className="grid sm:grid-cols-3 gap-gh-4">
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
        </div>
      </div>
    </div>
  );
}
