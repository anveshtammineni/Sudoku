import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.12), 0 24px 80px rgba(15, 23, 42, 0.35)',
        'neon-cyan': '0 0 0 1px rgba(56,189,248,0.18), 0 0 24px rgba(56,189,248,0.25), 0 24px 80px rgba(15, 23, 42, 0.35)',
        'neon-purple': '0 0 0 1px rgba(232,121,249,0.16), 0 0 24px rgba(232,121,249,0.22), 0 24px 80px rgba(15, 23, 42, 0.35)',
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
        holoShimmer: {
          '0%': { opacity: '0.2', transform: 'translateX(-35%) skewX(-12deg)' },
          '40%': { opacity: 0.85 },
          '100%': { opacity: 0.2, transform: 'translateX(35%) skewX(-12deg)' },
        },
        scanline: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        buttonBreath: {
          '0%, 100%': { filter: 'brightness(1)', transform: 'translateY(0)' },
          '50%': { filter: 'brightness(1.08)', transform: 'translateY(-1px)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3.5s ease-in-out infinite',
        holoShimmer: 'holoShimmer 3.6s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        buttonBreath: 'buttonBreath 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;

