import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="appearance-none bg-gh-canvas-default dark:bg-gh-canvas-default-dark border border-gh-border-default dark:border-gh-border-default-dark rounded-gh px-gh-3 py-gh-2 text-gh-sm font-medium text-gh-fg-default dark:text-gh-fg-default-dark hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark focus:outline-none focus:ring-2 focus:ring-gh-accent-emphasis dark:focus:ring-gh-accent-emphasis-dark focus:border-transparent cursor-pointer transition-colors font-gh"
      >
        {themes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-gh-2 text-gh-fg-muted dark:text-gh-fg-muted-dark">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}
