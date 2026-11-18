import { Router } from 'express'
import * as c from '../controllers/adminController.js'
import { protect, restrictTo } from '../middleware/auth.js'
const r = Router()
r.use(protect, restrictTo('admin'))
r.get('/dashboard', c.dashboard)
r.get('/properties', c.properties)
r.put('/properties/:id/approve', c.approve)
r.put('/properties/:id/reject', c.reject)
r.get('/users', c.users)
r.delete('/users/:id', c.removeUser)
r.get('/bookings', c.bookings)
r.get('/reviews', c.reviews)
r.delete('/reviews/:id', c.removeReview)
export default r
