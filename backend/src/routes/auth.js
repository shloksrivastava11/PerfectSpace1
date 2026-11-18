import { Router } from 'express'
import { register, login, me, updateMe } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { required } from '../middleware/error.js'
const r = Router()
r.post('/register', required('name', 'email', 'phone', 'password'), register)
r.post('/login', required('email', 'password'), login)
r.get('/me', protect, me)
r.put('/me', protect, updateMe)
export default r
