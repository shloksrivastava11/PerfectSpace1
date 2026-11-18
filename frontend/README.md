# PerfectSpace - Frontend
React + Vite + Tailwind. Runs on http://localhost:5173

    npm install
    npm run dev

The backend must be running on http://localhost:5000 (see perfectspace-backend).
`vite.config.js` proxies /api and /uploads to it. If your API is hosted elsewhere,
create a `.env` file here with: VITE_API_URL=https://your-api.com/api
(and update the proxy / image URLs accordingly).
