/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GitHub color palette
        gh: {
          // Canvas colors
          'canvas-default': '#ffffff',
          'canvas-overlay': '#ffffff',
          'canvas-inset': '#f6f8fa',
          'canvas-subtle': '#f6f8fa',
          // Canvas dark colors
          'canvas-default-dark': '#0d1117',
          'canvas-overlay-dark': '#161b22',
          'canvas-inset-dark': '#010409',
          'canvas-subtle-dark': '#161b22',
          // Foreground colors
          'fg-default': '#1f2328',
          'fg-muted': '#656d76',
          'fg-subtle': '#6e7781',
          'fg-on-emphasis': '#ffffff',
          // Foreground dark colors
          'fg-default-dark': '#e6edf3',
          'fg-muted-dark': '#7d8590',
          'fg-subtle-dark': '#6e7681',
          'fg-on-emphasis-dark': '#ffffff',
          // Border colors
          'border-default': '#d1d9e0',
          'border-muted': '#d8dee4',
          'border-subtle': '#d8dee4',
          // Border dark colors
          'border-default-dark': '#30363d',
          'border-muted-dark': '#21262d',
          'border-subtle-dark': '#21262d',
          // Accent colors
          'accent-fg': '#0969da',
          'accent-emphasis': '#0969da',
          'accent-muted': 'rgba(84, 174, 255, 0.4)',
          'accent-subtle': '#ddf4ff',
          // Accent dark colors
          'accent-fg-dark': '#58a6ff',
          'accent-emphasis-dark': '#1f6feb',
          'accent-muted-dark': 'rgba(56, 139, 253, 0.4)',
          'accent-subtle-dark': '#0d2741',
          // Success colors
          'success-fg': '#1a7f37',
          'success-emphasis': '#1f8c3b',
          'success-muted': 'rgba(74, 194, 107, 0.4)',
          'success-subtle': '#dafbe1',
          // Success dark colors
          'success-fg-dark': '#3fb950',
          'success-emphasis-dark': '#238636',
          'success-muted-dark': 'rgba(46, 160, 67, 0.4)',
          'success-subtle-dark': '#0f2419',
          // Danger colors
          'danger-fg': '#d1242f',
          'danger-emphasis': '#cf222e',
          'danger-muted': 'rgba(255, 129, 130, 0.4)',
          'danger-subtle': '#ffebe9',
          // Danger dark colors
          'danger-fg-dark': '#f85149',
          'danger-emphasis-dark': '#da3633',
          'danger-muted-dark': 'rgba(248, 81, 73, 0.4)',
          'danger-subtle-dark': '#490202',
          // Warning colors
          'warning-fg': '#9a6700',
          'warning-emphasis': '#bf8700',
          'warning-muted': 'rgba(255, 212, 59, 0.4)',
          'warning-subtle': '#fff8c5',
          // Warning dark colors
          'warning-fg-dark': '#e3b341',
          'warning-emphasis-dark': '#9e6a03',
          'warning-muted-dark': 'rgba(187, 128, 9, 0.4)',
          'warning-subtle-dark': '#2e1800',
        }
      },
      fontFamily: {
        'gh': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans"', 'Helvetica', 'Arial', 'sans-serif'],
        'gh-mono': ['"SFMono-Regular"', 'Consolas', '"Liberation Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'gh-xs': ['0.75rem', { lineHeight: '1.25rem' }],
        'gh-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'gh-base': ['1rem', { lineHeight: '1.5rem' }],
        'gh-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'gh-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'gh-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'gh-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        'gh-0': '0',
        'gh-1': '0.25rem',
        'gh-2': '0.5rem',
        'gh-3': '0.75rem',
        'gh-4': '1rem',
        'gh-5': '1.25rem',
        'gh-6': '1.5rem',
        'gh-8': '2rem',
        'gh-10': '2.5rem',
        'gh-12': '3rem',
        'gh-16': '4rem',
        'gh-20': '5rem',
        'gh-24': '6rem',
      },
      borderRadius: {
        'gh-sm': '0.1875rem',
        'gh': '0.375rem',
        'gh-md': '0.375rem',
        'gh-lg': '0.5rem',
      }
    },
  },
  plugins: [],
}
