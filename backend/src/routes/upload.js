import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import { protect, restrictTo } from '../middleware/auth.js'
import { wrap, httpError } from '../middleware/error.js'
export const UPLOAD_DIR = path.resolve('uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, f, cb) => (EXT[f.mimetype] ? cb(null, true) : cb(httpError(400, 'Only JPG, PNG or WebP images are allowed'))) })
const r = Router()
r.post('/', protect, restrictTo('owner', 'student'), up.array('images', 8), wrap(async (req, res) => {
  if (!req.files?.length) throw httpError(400, 'No images uploaded')
  const urls = []
  for (const f of req.files) {
    if (process.env.CLOUDINARY_URL) { // Cloudinary mode (reads CLOUDINARY_URL automatically)
      urls.push(await new Promise((ok, no) => cloudinary.uploader.upload_stream({ folder: 'perfectspace' }, (e, x) => (e ? no(e) : ok(x.secure_url))).end(f.buffer)))
    } else {
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${EXT[f.mimetype]}`
      await fs.promises.writeFile(path.join(UPLOAD_DIR, name), f.buffer)
      urls.push('/uploads/' + name)
    }
  }
  res.status(201).json({ urls })
}))
export default r
