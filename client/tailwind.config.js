/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral base — calm, off-white canvas, near-black ink
        canvas: '#F7F6F3',
        paper: '#FFFFFF',
        ink: '#171717',
        muted: '#525252',
        faint: '#737373',
        line: '#E7E5E4',
        'line-strong': '#D4D4D4',
        // Single accent — a vivid, accessible green reserved for discounts & primary actions
        accent: {
          50: '#ECF7F0',
          100: '#D7EFDF',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Soft warm highlight for "Best today"
        highlight: '#FBF6E9',
        'highlight-border': '#EFDFB5',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        DEFAULT: '0.75rem', // 12px
        card: '1rem', // 16px
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 23, 23, 0.04), 0 4px 12px rgba(23, 23, 23, 0.05)',
        lift: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.06)',
        glow: '0 0 24px rgba(22, 163, 74, 0.16)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.22s ease-out',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
