/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
      },
      colors: {
        navy: {
          950: '#071423', 900: '#152a4f', 800: '#24538c', 700: '#3a6cb0', 600: '#5d87c6',
        },
        gold: {
          DEFAULT: '#8c9ecb', soft: '#d1d8e9', deep: '#6a7da7',
        },
        ink: { DEFAULT: '#172c4a', 2: '#415a7d' },
        muted: '#6f86a7',
        line: '#c9d5ea',
        paper: '#eff4fb',
        ok: { DEFAULT: '#3a6c9a', bg: '#e6eff9' },
        warn: { DEFAULT: '#6c7da3', bg: '#eef3fa' },
        bad: { DEFAULT: '#b46b8f', bg: '#f7eaf2' },
        info: { DEFAULT: '#5d80c3', bg: '#e9eefc' },
      },
      boxShadow: {
        sm2: '0 1px 2px rgba(13,27,46,.06),0 1px 3px rgba(13,27,46,.05)',
        md2: '0 8px 24px rgba(13,27,46,.08),0 2px 6px rgba(13,27,46,.05)',
        lg2: '0 24px 60px rgba(13,27,46,.16)',
        gold: '0 6px 18px rgba(184,146,63,.35),inset 0 1px 0 rgba(255,255,255,.35)',
      },
      borderRadius: { xl2: '18px', '2xl2': '22px' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        blink: { '0%,60%,100%': { opacity: '.3', transform: 'translateY(0)' }, '30%': { opacity: '1', transform: 'translateY(-3px)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        blink: 'blink 1.3s infinite',
      },
    },
  },
  plugins: [],
}
