import 'dotenv/config'
import mongoose from 'mongoose'
import User from './models/User.js'
import Property from './models/Property.js'
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`
const IM = ['photo-1522708323590-d24dbb6b0267', 'photo-1560448204-e02f11c3d0e2', 'photo-1502672260266-1c1ef2d93688', 'photo-1493809842364-78817add7ffb'].map(img)
await mongoose.connect(process.env.MONGO_URI)
await User.deleteMany({ email: { $in: [process.env.ADMIN_EMAIL, 'owner@perfectspace.in', 'student@perfectspace.in'] } })
await Property.deleteMany({})
await User.create({ name: 'PerfectSpace Admin', email: process.env.ADMIN_EMAIL, phone: '9999999999', password: process.env.ADMIN_PASSWORD, role: 'admin' })
const owner = await User.create({ name: 'Rakesh Sharma', email: 'owner@perfectspace.in', phone: '9811111111', password: 'Owner@123', role: 'owner' })
await User.create({ name: 'Ananya Gupta', email: 'student@perfectspace.in', phone: '9822222222', password: 'Student@123', role: 'student' })
const rows = [
  ['Sunrise Boys PG', 'Boys PG', 'Boys', 'Noida', 'Sector 62', 7500, 'Double Sharing', ['Wi-Fi', 'Food', 'Laundry', 'Power Backup'], true],
  ['Orchid Girls Residency', 'Girls PG', 'Girls', 'Noida', 'Sector 15', 9000, 'Single Sharing', ['AC', 'Wi-Fi', 'Food', 'Parking', 'Laundry'], true],
  ['Urban Nest Co-Living', 'Co-Living', 'Any', 'Gurugram', 'Sector 44', 13500, 'Single Sharing', ['AC', 'Wi-Fi', 'Laundry', 'Parking', 'Power Backup'], false],
  ['Scholars Hostel', 'Hostel', 'Any', 'Greater Noida', 'Knowledge Park III', 5200, 'Triple Sharing', ['Wi-Fi', 'Food', 'Power Backup'], true],
]
await Property.insertMany(rows.map(([title, propertyType, genderPreference, city, area, rent, roomType, facilities, foodAvailable], i) => ({
  title, propertyType, genderPreference, location: { city, area, state: 'India', address: `${area}, ${city}` }, rent, securityDeposit: rent * 2, roomType, facilities, foodAvailable,
  description: 'A well-kept, secure property with daily housekeeping and a short commute to colleges and offices nearby.',
  rules: ['No smoking inside rooms', 'Visitors allowed until 8 PM', 'Gate closes at 11 PM'], images: [IM[i % 4], IM[(i + 1) % 4], IM[(i + 2) % 4]],
  availableRooms: 4, owner: owner._id, approvalStatus: 'approved' })))
console.log('Seeded. Admin:', process.env.ADMIN_EMAIL, '| Owner: owner@perfectspace.in / Owner@123 | Student: student@perfectspace.in / Student@123')
await mongoose.disconnect()
