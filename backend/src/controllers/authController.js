import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { wrap, httpError } from '../middleware/error.js'
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
export const register = wrap(async (req, res) => {
  const { name, email, phone, password, role = 'student' } = req.body
  if (!['student', 'owner'].includes(role)) throw httpError(400, 'Role must be student or owner') // admins are never self-registered
  if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Enter a valid email')
  if (!/^[0-9]{10}$/.test(phone)) throw httpError(400, 'Phone must be 10 digits')
  if (!password || password.length < 6) throw httpError(400, 'Password must be at least 6 characters')
  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(409, 'Email is already registered')
  const user = await User.create({ name, email, phone, password, role })
  res.status(201).json({ token: sign(user), user })
})
export const login = wrap(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password')
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Incorrect email or password')
  res.json({ token: sign(user), user })
})
export const updateMe = wrap(async (req, res) => {
  const { name, phone, password, profileImage } = req.body
  const u = await User.findById(req.user._id).select('+password')
  if (phone !== undefined && !/^[0-9]{10}$/.test(phone)) throw httpError(400, 'Phone must be 10 digits')
  if (password && password.length < 6) throw httpError(400, 'Password must be at least 6 characters')
  if (name) u.name = name
  if (phone) u.phone = phone
  if (profileImage !== undefined) u.profileImage = profileImage
  if (password) u.password = password
  await u.save()
  res.json({ user: u })
})
export const me = (req, res) => res.json({ user: req.user })
