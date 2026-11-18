export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { primary: '#2563EB', ink: '#0F172A', surface: '#F8FAFC', body: '#334155', success: '#16A34A' },
    fontFamily: { sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'] },
    boxShadow: { card: '0 4px 20px rgba(15,23,42,.07)', lift: '0 12px 32px rgba(15,23,42,.12)' }
  } },
  plugins: []
}
