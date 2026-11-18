import mongoose from 'mongoose'
export default mongoose.model('Wishlist', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
}))
