import crypto from 'crypto'
import Booking from '../models/Booking.js'
import { findBookable } from './bookingController.js'
import { wrap, httpError } from '../middleware/error.js'

const keyId = () => process.env.RAZORPAY_KEY_ID, secret = () => process.env.RAZORPAY_KEY_SECRET
const demo = () => !keyId() || !secret() // no keys configured -> demo mode, no real money
const auth = () => ({ Authorization: 'Basic ' + Buffer.from(`${keyId()}:${secret()}`).toString('base64') })
const checkDate = (v) => { const d = new Date(v); if (isNaN(d) || d < new Date(new Date().toDateString())) throw httpError(400, 'Choose a valid move-in date'); return d }
const rupees = (p) => p.bookingAmount || p.rent

export const createOrder = wrap(async (req, res) => {
  const { propertyId, moveInDate } = req.body
  checkDate(moveInDate)
  const p = await findBookable(req.user, propertyId, 'online')
  const amount = Math.round(rupees(p) * 100) // paise, always computed on the server
  if (demo()) return res.json({ demo: true, orderId: 'demo_order_' + Date.now(), amount, currency: 'INR' })
  const r = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...auth() },
    body: JSON.stringify({ amount, currency: 'INR', receipt: ('ps_' + Date.now()).slice(0, 40), notes: { propertyId: String(p._id), student: String(req.user._id) } }),
  })
  const o = await r.json()
  if (!r.ok) throw httpError(502, o.error?.description || 'Payment gateway error')
  res.json({ demo: false, orderId: o.id, amount: o.amount, currency: o.currency, keyId: keyId() })
})

export const verify = wrap(async (req, res) => {
  const { propertyId, moveInDate, orderId, paymentId, signature, message } = req.body
  const moveIn = checkDate(moveInDate)
  const p = await findBookable(req.user, propertyId, 'online')
  let amount = rupees(p)
  if (!paymentId) throw httpError(400, 'Missing payment id')
  if (demo()) {
    if (!String(paymentId).startsWith('demo_')) throw httpError(400, 'Invalid demo payment')
  } else {
    const expected = crypto.createHmac('sha256', secret()).update(`${orderId}|${paymentId}`).digest('hex')
    if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) throw httpError(400, 'Payment verification failed')
    const o = await (await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, { headers: auth() })).json()
    // the paid order must belong to this student, this property and the right amount
    if (o.notes?.propertyId !== String(p._id) || o.notes?.student !== String(req.user._id) || o.amount !== Math.round(amount * 100)) throw httpError(400, 'Payment does not match this booking')
    amount = o.amount / 100
  }
  if (await Booking.findOne({ paymentId })) throw httpError(409, 'This payment was already used')
  const booking = await Booking.create({ student: req.user._id, owner: p.owner, property: p._id, type: 'online', moveInDate: moveIn, amount, paymentStatus: 'paid', paymentId, message })
  res.status(201).json({ booking })
})
