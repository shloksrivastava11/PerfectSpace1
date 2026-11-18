import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const schema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'owner', 'admin'], default: 'student' },
  profileImage: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } })
schema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12)
  next()
})
schema.methods.matchPassword = function (plain) { return bcrypt.compare(plain, this.password) }
schema.set('toJSON', { transform: (d, r) => ({ id: r._id, name: r.name, email: r.email, phone: r.phone, role: r.role, profileImage: r.profileImage, createdAt: r.createdAt }) })
export default mongoose.model('User', schema)
