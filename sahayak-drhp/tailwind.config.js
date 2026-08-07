/** @type {import('tailwindcss').Config} */

// ============================================================
//  Sahayak DRHP — design tokens
//  Pastel blue on off-white. Slate typography. No neon, no purple.
//
//  Legacy token names (navy / gold / paper) are intentionally kept
//  and remapped onto the new palette so that every existing utility
//  class keeps resolving while the app is restyled screen by screen.
//  New code should prefer: canvas / surface / panel / accent / ink.
// ============================================================

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Body + UI. Manrope has genuine tabular figures, which matters
        // on a screen that is mostly financial tables.
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        // Display. Used large, tight, and sparingly.
        display: ['"Plus Jakarta Sans"', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // The prospectus surface only — a legal instrument should read like one.
        serif: ['"Source Serif 4"', '"Iowan Old Style"', 'Charter', 'Georgia', 'serif'],
      },

      colors: {
        canvas: '#F7FAFC',
        surface: { DEFAULT: '#FFFFFF', 2: '#FBFDFF' },
        panel: { DEFAULT: '#F3F7FB', 2: '#E9F0F8' },

        // Brand accent. 400 is the brief's #5B8DEF; 600/700 carry text
        // and solid fills so contrast stays above 4.5:1 on white.
        accent: {
          50: '#F1F6FE',
          100: '#DFEAFD',
          200: '#C4DAFB',
          300: '#7DB7F8',
          400: '#5B8DEF',
          500: '#4A7ADF',
          600: '#3A63C4',
          700: '#2E4E9C',
          800: '#26407C',
          900: '#1F3563',
        },

        // Slate typography ramp, pulled slightly blue to sit on the canvas.
        // Every step down to `muted` clears 4.5:1 on canvas, white and
        // panel, so secondary copy is never the reason a screen fails AA.
        // `faint` is below that bar by design — decoration and disabled
        // glyphs only, never running text.
        // Measured, not guessed — `muted` clears 4.5:1 on all three light
        // surfaces (white 5.34, canvas 5.10, panel 4.96).
        ink: { DEFAULT: '#16233A', 2: '#3A4C69', 3: '#495B7A' },
        muted: '#596C89',
        faint: '#6E82A0',
        line: { DEFAULT: '#E2EAF4', strong: '#CFDCEC' },

        // Status. Muted, print-safe, all text weights clear AA on their bg.
        ok: { DEFAULT: '#0F7052', bg: '#E7F5EF', line: '#BFE2D3' },
        warn: { DEFAULT: '#8A5A12', bg: '#FDF4E4', line: '#F0DEBB' },
        bad: { DEFAULT: '#A93A31', bg: '#FDEDEB', line: '#F5D0CC' },
        info: { DEFAULT: '#2F55B0', bg: '#E9F1FE', line: '#CBDDFB' },

        // --- legacy aliases, remapped onto the new system ---
        navy: { 950: '#0E1828', 900: '#16233A', 800: '#2E4E9C', 700: '#3A63C4', 600: '#5B8DEF' },
        gold: { DEFAULT: '#5B8DEF', soft: '#C4DAFB', deep: '#3A63C4' },
        paper: '#F3F7FB',
      },

      boxShadow: {
        // Blue-tinted, layered, low opacity. Stripe/Linear register.
        xs2: '0 1px 2px rgba(22,35,58,.05)',
        sm2: '0 1px 2px rgba(22,35,58,.05), 0 1px 3px rgba(22,35,58,.04)',
        md2: '0 4px 12px rgba(22,35,58,.06), 0 1px 3px rgba(22,35,58,.04)',
        lg2: '0 18px 44px rgba(22,35,58,.10), 0 4px 12px rgba(22,35,58,.05)',
        xl2: '0 32px 72px rgba(22,35,58,.14), 0 8px 20px rgba(22,35,58,.06)',
        accent: '0 6px 18px rgba(91,141,239,.28)',
        ring: '0 0 0 1px rgba(207,220,236,.9)',
      },

      borderRadius: { xl2: '14px', '2xl2': '20px', '3xl2': '26px' },

      // 4px baseline; these fill the gaps Tailwind leaves at the sizes
      // this UI actually uses.
      spacing: { 4.5: '1.125rem', 13: '3.25rem', 15: '3.75rem', 18: '4.5rem', 22: '5.5rem' },

      transitionTimingFunction: {
        // One easing family across the whole app.
        out: 'cubic-bezier(.16,1,.3,1)',
        'in-out': 'cubic-bezier(.65,0,.35,1)',
      },

      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        blink: { '0%,60%,100%': { opacity: '.3', transform: 'translateY(0)' }, '30%': { opacity: '1', transform: 'translateY(-3px)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'scan-sweep': { '0%': { transform: 'translateY(-12%)' }, '100%': { transform: 'translateY(112%)' } },
        'pulse-ring': {
          '0%': { transform: 'scale(.85)', opacity: '.55' },
          '70%,100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
      animation: {
        floaty: 'floaty 6s cubic-bezier(.4,0,.6,1) infinite',
        blink: 'blink 1.3s infinite',
        shimmer: 'shimmer 1.9s cubic-bezier(.4,0,.6,1) infinite',
        'scan-sweep': 'scan-sweep 2.6s cubic-bezier(.4,0,.6,1) infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(.4,0,.6,1) infinite',
      },
    },
  },
  plugins: [],
}
