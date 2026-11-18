import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  propertyType: { type: String, enum: ['Boys PG', 'Girls PG', 'Co-Living', 'Hostel'], required: true },
  genderPreference: { type: String, enum: ['Boys', 'Girls', 'Any'], default: 'Any' },
  location: {
    address: { type: String, default: '' }, city: { type: String, required: [true, 'City is required'], index: true },
    state: { type: String, default: '' }, area: { type: String, default: '' },
  },
  rent: { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, default: 0, min: 0 },
  roomType: { type: String, enum: ['Single Sharing', 'Double Sharing', 'Triple Sharing'], required: true },
  facilities: [String],
  foodAvailable: { type: Boolean, default: false },
  foodDetails: { type: String, default: '' },
  rules: [String],
  images: [String], // Cloudinary secure_url strings
  availableRooms: { type: Number, default: 1, min: 0 },
  bookingAmount: { type: Number, default: 0, min: 0 }, // online booking amount; 0 = one month's rent
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  rejectionReason: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } })
// JSON shape matches the React frontend. Address and owner phone are only included with toJSON({ full: true }).
schema.set('toJSON', { transform: (d, r, o) => {
  const L = r.location || {}, full = !!(o && o.full)
  return {
    id: r._id, title: r.title, description: r.description, type: r.propertyType, genderPreference: r.genderPreference,
    city: L.city, area: L.area, state: L.state, ...(full && { address: L.address }),
    rent: r.rent, deposit: r.securityDeposit, bookingAmount: r.bookingAmount || r.rent, room: r.roomType, facilities: r.facilities, foodAvailable: r.foodAvailable,
    food: r.foodAvailable ? r.foodDetails || 'Meals included.' : 'No meals; shared kitchen available.',
    rules: r.rules, images: r.images, rooms: r.availableRooms, rating: r.rating, reviews: r.reviews,
    approvalStatus: r.approvalStatus, rejectionReason: r.rejectionReason, createdAt: r.createdAt,
    owner: r.owner?.name ? { id: r.owner.id ?? r.owner._id, name: r.owner.name, ...(full && { phone: r.owner.phone }) } : r.owner,
  }
} })
export default mongoose.model('Property', schema)
