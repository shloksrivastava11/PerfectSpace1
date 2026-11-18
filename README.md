# PerfectSpace

    PerfectSpace/
      backend/    Express + MongoDB API   (http://localhost:5000)
      frontend/   React + Vite website    (http://localhost:5173)

## 1. Backend (pehle ye chalao)
    cd backend
    copy .env.example .env      (Mac/Linux: cp .env.example .env)
    # .env mein JWT_SECRET aur MONGO_URI set karo
    npm install
    npm run seed
    npm run dev

## 2. Frontend (naye terminal mein)
    cd frontend
    npm install
    npm run dev

## Admin login (seed ke baad)
admin@perfectspace.in / Admin@12345
Owner: owner@perfectspace.in / Owner@123
Student: student@perfectspace.in / Student@123

## Online payment
Without keys, "Book online" runs in DEMO mode (no money moves). For real payments add RAZORPAY_KEY_ID and
RAZORPAY_KEY_SECRET (test keys from dashboard.razorpay.com) to backend/.env and restart the backend.

## Visit / booking contact
Owner phone and exact address are shown to a student only after the owner approves that student's visit or booking.
