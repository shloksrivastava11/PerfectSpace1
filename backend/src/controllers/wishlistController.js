import Wishlist from '../models/Wishlist.js'
import Property from '../models/Property.js'
import { wrap, httpError } from '../middleware/error.js'
export const get = wrap(async (req, res) => {
  const w = await Wishlist.findOne({ user: req.user._id }).populate({ path: 'properties', populate: { path: 'owner', select: 'name phone' } })
  res.json({ properties: (w?.properties || []).filter((p) => p.approvalStatus === 'approved') })
})
export const add = wrap(async (req, res) => {
  const p = await Property.findOne({ _id: req.params.propertyId, approvalStatus: 'approved' })
  if (!p) throw httpError(404, 'Property not found')
  await Wishlist.updateOne({ user: req.user._id }, { $addToSet: { properties: p._id } }, { upsert: true })
  res.status(201).json({ message: 'Saved' })
})
export const remove = wrap(async (req, res) => {
  await Wishlist.updateOne({ user: req.user._id }, { $pull: { properties: req.params.propertyId } })
  res.json({ message: 'Removed' })
})
