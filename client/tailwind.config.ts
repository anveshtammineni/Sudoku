import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.12), 0 24px 80px rgba(15, 23, 42, 0.35)',
      },
      backgroundImage: {
        'game-grid': 'radial-gradient(circle at top, rgba(56,189,248,0.14), transparent 32%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,118,110,0.72))',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.75', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
