import mongoose from 'mongoose'
const ref = (m) => ({ type: mongoose.Schema.Types.ObjectId, ref: m, required: true, index: true })
export default mongoose.model('Booking', new mongoose.Schema({
  student: ref('User'), owner: ref('User'), property: ref('Property'),
  type: { type: String, enum: ['request', 'visit', 'online'], default: 'request' }, // request = free booking request, visit = scheduled visit, online = paid booking
  visitDate: Date, moveInDate: Date, message: { type: String, maxlength: 500, default: '' },
  amount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['none', 'paid', 'refund_pending'], default: 'none' },
  paymentId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
}, { timestamps: { createdAt: true, updatedAt: false } }))
