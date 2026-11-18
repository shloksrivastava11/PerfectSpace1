import { Router } from 'express'
import * as c from '../controllers/reviewController.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { required } from '../middleware/error.js'
const r = Router()
r.post('/', protect, restrictTo('student'), required('propertyId', 'rating', 'comment'), c.create)
r.get('/my', protect, restrictTo('student'), c.mine)
r.get('/owner', protect, restrictTo('owner'), c.ownerReviews)
r.get('/:propertyId', c.forProperty)
export default r
