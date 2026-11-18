import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { wrap, httpError } from './error.js'
const getUser = async (req) => {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return null
  try { return await User.findById(jwt.verify(h.slice(7), process.env.JWT_SECRET).id) } catch { return null }
}
export const protect = wrap(async (req, res, next) => {
  const u = await getUser(req)
  if (!u) throw httpError(401, 'Please log in to continue')
  req.user = u; next()
})
export const optionalAuth = wrap(async (req, res, next) => { req.user = await getUser(req); next() })
export const restrictTo = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(httpError(403, 'You do not have permission to do this'))
