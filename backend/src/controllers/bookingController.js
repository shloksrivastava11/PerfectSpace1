import Booking from '../models/Booking.js'
import Property from '../models/Property.js'
import { wrap, httpError } from '../middleware/error.js'
const pop = (q) => q.populate('property', 'title images rent location').populate('student', 'name email phone').populate('owner', 'name phone')

export const findBookable = async (student, propertyId, type) => {
  const p = await Property.findById(propertyId)
  if (!p || p.approvalStatus !== 'approved') throw httpError(404, 'Property not found')
  if (p.availableRooms < 1) throw httpError(400, 'No rooms available right now')
  const dup = await Booking.findOne({ student: student._id, property: p._id, type, status: { $in: ['pending', 'approved'] } })
  if (dup) throw httpError(409, 'You already have an active request of this kind for this property')
  return p
}
export const create = wrap(async (req, res) => {
  const { propertyId, visitDate, message, type = 'request' } = req.body
  if (!['request', 'visit'].includes(type)) throw httpError(400, 'Invalid booking type') // paid bookings go through /api/payments
  if (type === 'visit') { const d = new Date(visitDate); if (isNaN(d) || d < new Date()) throw httpError(400, 'Choose a future date and time for your visit') }
  const p = await findBookable(req.user, propertyId, type)
  const booking = await Booking.create({ student: req.user._id, owner: p.owner, property: p._id, type, visitDate: type === 'visit' ? visitDate : undefined, message })
  res.status(201).json({ booking })
})
export const my = wrap(async (req, res) => {
  const list = await pop(Booking.find({ student: req.user._id }).sort('-createdAt'))
  const bookings = list.map((b) => {
    const o = b.toJSON(), loc = b.property?.location
    // owner phone + exact address are shown only after the owner approves
    if (b.status === 'approved' && b.owner) o.contact = { phone: b.owner.phone, address: [loc?.address, loc?.area, loc?.city].filter(Boolean).join(', ') }
    if (o.owner) delete o.owner.phone
    return o
  })
  res.json({ bookings })
})
export const owner = wrap(async (req, res) => res.json({ bookings: await pop(Booking.find({ owner: req.user._id }).sort('-createdAt')) }))
export const setStatus = wrap(async (req, res) => {
  const { status } = req.body
  const b = await Booking.findById(req.params.id)
  if (!b) throw httpError(404, 'Booking not found')
  if (req.user.role === 'owner') {
    if (String(b.owner) !== String(req.user._id)) throw httpError(403, 'Not your booking request')
    if (b.status !== 'pending' || !['approved', 'rejected'].includes(status)) throw httpError(400, 'Owners can approve or reject pending requests only')
  } else if (req.user.role === 'student') {
    if (String(b.student) !== String(req.user._id)) throw httpError(403, 'Not your booking request')
    if (status !== 'cancelled' || !['pending', 'approved'].includes(b.status)) throw httpError(400, 'Only pending or approved requests can be cancelled')
  } else throw httpError(403, 'Not allowed')
  const was = b.status
  b.status = status
  if (['rejected', 'cancelled'].includes(status) && b.paymentStatus === 'paid') b.paymentStatus = 'refund_pending'
  await b.save()
  if (status === 'approved') await Property.updateOne({ _id: b.property, availableRooms: { $gt: 0 } }, { $inc: { availableRooms: -1 } })
  if (status === 'cancelled' && was === 'approved') await Property.updateOne({ _id: b.property }, { $inc: { availableRooms: 1 } })
  res.json({ booking: b })
})
