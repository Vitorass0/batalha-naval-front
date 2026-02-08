import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Naval Design System Colors
        naval: {
          bg: '#0B1C2D',
          surface: '#102A43',
          border: '#1E293B',
          action: '#38BDF8',
          'action-hover': '#0EA5E9',
          error: '#EF4444',
          'error-hover': '#DC2626',
          text: {
            primary: '#FFFFFF',
            secondary: '#94A3B8',
            muted: '#64748B',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '6px',
      },
    },
  },
  plugins: [],
};

export default config;
