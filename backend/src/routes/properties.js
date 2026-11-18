import { Router } from 'express'
import * as c from '../controllers/propertyController.js'
import { protect, optionalAuth, restrictTo } from '../middleware/auth.js'
import { required } from '../middleware/error.js'
const r = Router()
r.get('/', c.list)
r.get('/mine', protect, restrictTo('owner'), c.mine) // must stay above '/:id'
r.get('/:id', optionalAuth, c.getOne)
r.post('/', protect, restrictTo('owner'), required('title', 'description', 'propertyType', 'city', 'rent', 'roomType'), c.create)
r.put('/:id', protect, restrictTo('owner', 'admin'), c.update)
r.delete('/:id', protect, restrictTo('owner', 'admin'), c.remove)
export default r
