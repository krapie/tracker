import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function LoginPage() {
  const { login, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);

    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gh-canvas-default dark:bg-gh-canvas-default-dark flex items-center justify-center p-gh-6 font-gh">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-gh-8">
          <div className="flex items-center justify-center gap-gh-2 mb-gh-4">
            <span className="text-gh-3xl">🚦</span>
            <h1 className="text-gh-2xl font-semibold text-gh-fg-default dark:text-gh-fg-default-dark">
              Tracker
            </h1>
          </div>
          <p className="text-gh-fg-muted dark:text-gh-fg-muted-dark">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="border border-gh-border-default dark:border-gh-border-default-dark rounded-gh-lg bg-gh-canvas-default dark:bg-gh-canvas-default-dark p-gh-6">
          <form onSubmit={handleSubmit} className="space-y-gh-4">
            <div>
              <label htmlFor="username" className="block text-gh-sm font-medium text-gh-fg-default dark:text-gh-fg-default-dark mb-gh-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 rounded-gh focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark focus:outline-none bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark placeholder-gh-fg-muted dark:placeholder-gh-fg-muted-dark"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gh-sm font-medium text-gh-fg-default dark:text-gh-fg-default-dark mb-gh-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gh-border-default dark:border-gh-border-default-dark px-gh-3 py-gh-2 rounded-gh focus:border-gh-accent-emphasis dark:focus:border-gh-accent-emphasis-dark focus:outline-none bg-gh-canvas-default dark:bg-gh-canvas-default-dark text-gh-fg-default dark:text-gh-fg-default-dark placeholder-gh-fg-muted dark:placeholder-gh-fg-muted-dark"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-gh-danger-subtle dark:bg-gh-danger-subtle-dark border border-gh-danger-muted dark:border-gh-danger-muted-dark rounded-gh px-gh-3 py-gh-2">
                <p className="text-gh-sm text-gh-danger-fg dark:text-gh-danger-fg-dark">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gh-accent-emphasis dark:bg-gh-accent-emphasis-dark hover:bg-gh-accent-emphasis/90 dark:hover:bg-gh-accent-emphasis-dark/90 disabled:opacity-50 disabled:cursor-not-allowed text-gh-fg-on-emphasis dark:text-gh-fg-on-emphasis-dark px-gh-4 py-gh-2 rounded-gh font-medium text-gh-sm border border-gh-accent-emphasis dark:border-gh-accent-emphasis-dark transition-colors"
            >
              {isLoading ? 'Please wait...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Admin credentials info */}
        <div className="mt-gh-4 p-gh-4 bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark border border-gh-border-default dark:border-gh-border-default-dark rounded-gh">
          <p className="text-gh-xs text-gh-fg-muted dark:text-gh-fg-muted-dark text-center">
            Use admin credentials to access the system
          </p>
        </div>
      </div>
    </div>
  );
}
