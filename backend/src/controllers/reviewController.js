import Review from '../models/Review.js'
import Property from '../models/Property.js'
import { wrap, httpError } from '../middleware/error.js'
export const refreshRating = async (propertyId) => {
  const [a] = await Review.aggregate([{ $match: { property: propertyId } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }])
  await Property.updateOne({ _id: propertyId }, { rating: a ? Math.round(a.avg * 10) / 10 : 0, reviews: a?.n || 0 })
}
export const create = wrap(async (req, res) => {
  const { propertyId, rating, comment } = req.body
  const p = await Property.findOne({ _id: propertyId, approvalStatus: 'approved' })
  if (!p) throw httpError(404, 'Property not found')
  // one review per student per property; posting again updates it
  const review = await Review.findOneAndUpdate({ student: req.user._id, property: p._id }, { rating, comment },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true })
  await refreshRating(p._id)
  res.status(201).json({ review })
})
export const mine = wrap(async (req, res) => res.json({ reviews: await Review.find({ student: req.user._id }).sort('-createdAt').populate('property', 'title') }))
export const ownerReviews = wrap(async (req, res) => {
  const ids = (await Property.find({ owner: req.user._id }).select('_id')).map((p) => p._id)
  res.json({ reviews: await Review.find({ property: { $in: ids } }).sort('-createdAt').populate('property', 'title').populate('student', 'name') })
})
export const forProperty = wrap(async (req, res) => {
  res.json({ reviews: await Review.find({ property: req.params.propertyId }).sort('-createdAt').populate('student', 'name profileImage') })
})
