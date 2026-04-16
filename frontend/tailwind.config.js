/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 45px rgba(164, 182, 204, 0.12)'
      },
      backgroundImage: {
        'page-glow':
          'radial-gradient(circle at top left, rgba(194, 238, 248, 0.6), transparent 28%), linear-gradient(180deg, #fbfdff 0%, #f7f9fc 100%)',
        'rail-surface': 'linear-gradient(180deg, #eef4ff 0%, #f6f8ff 100%)',
        'pill-blue': 'linear-gradient(90deg, #9be8f7 0%, #bceeff 100%)',
        'search-blue': 'linear-gradient(90deg, #9be8f7 0%, #c7f4ff 100%)',
        'panel-surface': 'linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(245, 248, 252, 0.92) 100%)',
        'panel-soft': 'linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(246, 250, 255, 0.92) 100%)',
        'badge-blue': 'linear-gradient(135deg, #d8f7ff 0%, #b7effb 100%)',
        'section-active':
          'linear-gradient(90deg, rgba(155, 232, 247, 0.95) 0%, rgba(193, 243, 255, 0.95) 100%)'
      }
    }
  },
  plugins: []
};
