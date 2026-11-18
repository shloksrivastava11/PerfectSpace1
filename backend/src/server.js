import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import auth from './routes/auth.js'
import properties from './routes/properties.js'
import bookings from './routes/bookings.js'
import wishlist from './routes/wishlist.js'
import reviews from './routes/reviews.js'
import admin from './routes/admin.js'
import upload, { UPLOAD_DIR } from './routes/upload.js'
import contact from './routes/contact.js'
import payments from './routes/payments.js'
import { notFound, errorHandler } from './middleware/error.js'

const app = express()
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 }))
app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', auth)
app.use('/api/properties', properties)
app.use('/api/bookings', bookings)
app.use('/api/wishlist', wishlist)
app.use('/api/reviews', reviews)
app.use('/api/admin', admin)
app.use('/api/upload', upload)
app.use('/api/contact', contact)
app.use('/api/payments', payments)
app.use('/uploads', express.static(UPLOAD_DIR))
app.use(notFound)
app.use(errorHandler)

if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is missing in .env'); process.exit(1) }
mongoose.connect(process.env.MONGO_URI).then(() => {
  const port = process.env.PORT || 5000
  app.listen(port, () => console.log(`PerfectSpace API running on :${port}`))
}).catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1) })
