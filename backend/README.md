# PerfectSpace - Backend
Express + MongoDB (Mongoose). Runs on http://localhost:5000

    copy .env.example .env      (Mac/Linux: cp .env.example .env)
    # edit .env: set JWT_SECRET and MONGO_URI
    npm install
    npm run seed                # creates admin, demo owner, demo student, 4 properties
    npm run dev

Admin login after seed: ADMIN_EMAIL / ADMIN_PASSWORD from .env
(default admin@perfectspace.in / Admin@12345)

Health check: http://localhost:5000/api/health
Images: saved in ./uploads, or on Cloudinary if CLOUDINARY_URL is set in .env.
Set CLIENT_URL in .env to your frontend URL (default http://localhost:5173).
