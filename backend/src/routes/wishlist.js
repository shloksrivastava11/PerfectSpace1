import { Router } from 'express'
import * as c from '../controllers/wishlistController.js'
import { protect } from '../middleware/auth.js'
const r = Router()
r.use(protect)
r.get('/', c.get)
r.post('/:propertyId', c.add)
r.delete('/:propertyId', c.remove)
export default r
