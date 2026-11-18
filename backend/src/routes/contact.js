import { Router } from 'express'
import mongoose from 'mongoose'
import { wrap, required } from '../middleware/error.js'
const Message = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({
  name: String, email: String, message: { type: String, maxlength: 2000 } }, { timestamps: true }))
const r = Router()
r.post('/', required('name', 'email', 'message'), wrap(async (req, res) => {
  const { name, email, message } = req.body
  await Message.create({ name, email, message })
  res.status(201).json({ message: 'Thanks, we will get back to you soon.' })
}))
export default r
