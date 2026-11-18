import { Router } from 'express'
import * as c from '../controllers/paymentController.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { required } from '../middleware/error.js'
const r = Router()
r.use(protect, restrictTo('student'))
r.post('/order', required('propertyId', 'moveInDate'), c.createOrder)
r.post('/verify', required('propertyId', 'moveInDate', 'orderId', 'paymentId'), c.verify)
export default r
