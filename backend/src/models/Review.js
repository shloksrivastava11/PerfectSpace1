import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  rating: { type: Number, required: [true, 'Rating is required'], min: [1, 'Rating must be 1-5'], max: [5, 'Rating must be 1-5'] },
  comment: { type: String, required: [true, 'Comment is required'], maxlength: 1000 },
}, { timestamps: { createdAt: true, updatedAt: false } })
schema.index({ student: 1, property: 1 }, { unique: true })
export default mongoose.model('Review', schema)
