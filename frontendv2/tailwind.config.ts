import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f0f0f',
          secondary: '#5d0615',
          card: 'rgba(255,255,255,0.04)',
        },
        accent: {
          cyan: '#e91035',
          blue: '#e91035',
        },
        glass: {
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-cyan': 'linear-gradient(135deg, #e91035 0%, #e91035 100%)',
        'gradient-cyan-subtle': 'linear-gradient(135deg, rgba(233, 16, 53,0.15) 0%, rgba(0,102,255,0.15) 100%)',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-cyan': '0 0 20px rgba(233, 16, 53,0.25), 0 0 60px rgba(233, 16, 53,0.1)',
        'glow-card': '0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}

export default config
