import Property from '../models/Property.js'
import Wishlist from '../models/Wishlist.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import { wrap, httpError } from '../middleware/error.js'

const body2doc = (b) => {
  const d = {}
  for (const k of ['title', 'description', 'propertyType', 'genderPreference', 'rent', 'securityDeposit', 'roomType', 'facilities', 'foodAvailable', 'foodDetails', 'rules', 'images', 'availableRooms', 'bookingAmount'])
    if (b[k] !== undefined) d[k] = b[k]
  for (const k of ['address', 'city', 'state', 'area']) if (b[k] !== undefined) d[`location.${k}`] = b[k]
  return d
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const list = wrap(async (req, res) => {
  const q = req.query, f = { approvalStatus: 'approved' }
  if (q.q) { const r = new RegExp(esc(q.q), 'i'); f.$or = [{ title: r }, { 'location.city': r }, { 'location.area': r }, { 'location.address': r }] }
  if (q.city) f['location.city'] = new RegExp(`^${esc(q.city)}$`, 'i')
  if (q.type) f.propertyType = { $in: q.type.split(',') }
  if (q.room) f.roomType = { $in: q.room.split(',') }
  if (q.facilities) f.facilities = { $all: q.facilities.split(',') }
  if (q.min || q.max) f.rent = { ...(q.min && { $gte: +q.min }), ...(q.max && { $lte: +q.max }) }
  const sort = { low: { rent: 1 }, high: { rent: -1 }, rating: { rating: -1, reviews: -1 } }[q.sort] || { rating: -1, reviews: -1 }
  const page = Math.max(+q.page || 1, 1), limit = Math.min(+q.limit || 12, 100)
  const [properties, total] = await Promise.all([
    Property.find(f).sort(sort).skip((page - 1) * limit).limit(limit).populate('owner', 'name phone'),
    Property.countDocuments(f),
  ])
  res.json({ properties, total, page, pages: Math.ceil(total / limit) })
})
export const mine = wrap(async (req, res) => {
  res.json({ properties: (await Property.find({ owner: req.user._id }).sort('-createdAt').populate('owner', 'name phone')).map((p) => p.toJSON({ full: true })) })
})
export const getOne = wrap(async (req, res) => {
  const p = await Property.findById(req.params.id).populate('owner', 'name phone')
  const privileged = req.user && (req.user.role === 'admin' || String(p?.owner?._id) === String(req.user._id))
  if (!p || (p.approvalStatus !== 'approved' && !privileged)) throw httpError(404, 'Property not found')
  // exact address + owner phone are revealed to the owner, admins, and students whose visit/booking was approved
  const full = !!(req.user && (privileged || await Booking.exists({ student: req.user._id, property: p._id, status: 'approved' })))
  res.json({ property: p.toJSON({ full }) })
})
export const create = wrap(async (req, res) => {
  const flat = Object.fromEntries(Object.entries(body2doc(req.body)).filter(([k]) => !k.includes('.')))
  const p = await Property.create({ ...flat, location: {
    address: req.body.address, city: req.body.city, state: req.body.state, area: req.body.area },
    owner: req.user._id, approvalStatus: 'pending' }) // always starts pending until an admin approves
  res.status(201).json({ property: p.toJSON({ full: true }) })
})
const ownedOrAdmin = async (req) => {
  const p = await Property.findById(req.params.id)
  if (!p) throw httpError(404, 'Property not found')
  if (req.user.role !== 'admin' && String(p.owner) !== String(req.user._id)) throw httpError(403, 'This is not your property')
  return p
}
export const update = wrap(async (req, res) => {
  const p = await ownedOrAdmin(req)
  const keys = Object.keys(req.body)
  p.set(body2doc(req.body))
  // availability tweaks stay live; any other edit by an owner goes back for review
  if (req.user.role === 'owner' && !(keys.length === 1 && keys[0] === 'availableRooms')) p.approvalStatus = 'pending'
  await p.save()
  res.json({ property: p.toJSON({ full: true }) })
})
export const remove = wrap(async (req, res) => {
  const p = await ownedOrAdmin(req)
  await Promise.all([p.deleteOne(), Wishlist.updateMany({}, { $pull: { properties: p._id } }), Booking.deleteMany({ property: p._id }), Review.deleteMany({ property: p._id })])
  res.json({ message: 'Property deleted' })
})
