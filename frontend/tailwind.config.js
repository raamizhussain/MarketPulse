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
        dark: {
          900: '#070A0F',
          800: '#0B0F17',
          700: '#111827',
          600: '#1F2937',
          500: '#374151',
        },
        palette: {
          umber: '#AD8B73',
          taupe: '#CEAB93',
          sand: '#E3CAA5',
          cream: '#FFFBE9',
          creamDark: '#F5EFE0',
          creamSubtle: '#FBF7EA',
          umberDark: '#5C4433',
          umberDeep: '#3F2E22',
        },
        regime: {
          bull: '#10B981',
          bear: '#EF4444',
          sideways: '#F59E0B',
          neutral: '#6B7280',
        },
        brand: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          indigo: '#6366F1',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"Fira Code"', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
