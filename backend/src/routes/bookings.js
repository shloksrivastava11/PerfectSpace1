import { Router } from 'express'
import * as c from '../controllers/bookingController.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { required } from '../middleware/error.js'
const r = Router()
r.use(protect)
r.post('/', restrictTo('student'), required('propertyId'), c.create)
r.get('/my', restrictTo('student'), c.my)
r.get('/owner', restrictTo('owner'), c.owner)
r.put('/:id/status', restrictTo('student', 'owner'), required('status'), c.setStatus)
export default r
