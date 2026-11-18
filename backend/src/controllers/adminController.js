import User from '../models/User.js'
import Property from '../models/Property.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import Wishlist from '../models/Wishlist.js'
import { wrap, httpError } from '../middleware/error.js'
import { refreshRating } from './reviewController.js'
const pop = (q) => q.populate('owner', 'name email phone')
export const dashboard = wrap(async (req, res) => {
  const [users, owners, properties, pending, bookings, active, byStatus, byCity] = await Promise.all([
    User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'owner' }), Property.countDocuments(),
    Property.countDocuments({ approvalStatus: 'pending' }), Booking.countDocuments(), Property.countDocuments({ approvalStatus: 'approved' }),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Property.aggregate([{ $group: { _id: '$location.city', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
  ])
  res.json({ stats: { totalUsers: users + owners, totalStudents: users, totalOwners: owners, totalProperties: properties, pendingProperties: pending, totalBookings: bookings, activeProperties: active },
    bookingsByStatus: byStatus, propertiesByCity: byCity })
})
export const properties = wrap(async (req, res) => {
  const f = req.query.status ? { approvalStatus: req.query.status } : {}
  res.json({ properties: (await pop(Property.find(f).sort('-createdAt'))).map((p) => p.toJSON({ full: true })) })
})
const setApproval = (approvalStatus) => wrap(async (req, res) => {
  const p = await Property.findByIdAndUpdate(req.params.id, { approvalStatus, rejectionReason: approvalStatus === 'rejected' ? req.body.reason || '' : '' }, { new: true })
  if (!p) throw httpError(404, 'Property not found')
  res.json({ property: p })
})
export const approve = setApproval('approved')
export const reject = setApproval('rejected')
export const users = wrap(async (req, res) => res.json({ users: await User.find(req.query.role ? { role: req.query.role } : {}).sort('-createdAt') }))
export const removeUser = wrap(async (req, res) => {
  const u = await User.findById(req.params.id)
  if (!u) throw httpError(404, 'User not found')
  if (u.role === 'admin') throw httpError(400, 'Admin accounts cannot be deleted here')
  const ids = (await Property.find({ owner: u._id }).select('_id')).map((p) => p._id)
  await Promise.all([Property.deleteMany({ owner: u._id }), Booking.deleteMany({ $or: [{ student: u._id }, { owner: u._id }, { property: { $in: ids } }] }),
    Review.deleteMany({ student: u._id }), Wishlist.deleteOne({ user: u._id }), u.deleteOne()])
  res.json({ message: 'User deleted' })
})
export const bookings = wrap(async (req, res) => res.json({ bookings: await Booking.find().sort('-createdAt').populate('property', 'title').populate('student', 'name').populate('owner', 'name') }))
export const reviews = wrap(async (req, res) => res.json({ reviews: await Review.find().sort('-createdAt').populate('property', 'title').populate('student', 'name') }))
export const removeReview = wrap(async (req, res) => {
  const r = await Review.findByIdAndDelete(req.params.id)
  if (!r) throw httpError(404, 'Review not found')
  await refreshRating(r.property)
  res.json({ message: 'Review deleted' })
})
