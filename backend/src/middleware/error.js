export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
export const httpError = (status, message) => Object.assign(new Error(message), { status })
export const notFound = (req, res, next) => next(httpError(404, `Route not found: ${req.method} ${req.originalUrl}`))
export const required = (...fields) => (req, res, next) => {
  const miss = fields.filter((k) => req.body[k] === undefined || req.body[k] === '')
  miss.length ? next(httpError(400, `Missing: ${miss.join(', ')}`)) : next()
}
export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500, message = err.message
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', ') }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid id' }
  else if (err.name === 'MulterError') { status = 400; message = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be under 5 MB' : err.message }
  else if (err.code === 11000) { status = 409; message = 'Already exists' }
  if (status === 500) console.error(err)
  res.status(status).json({ message: status === 500 ? 'Server error' : message })
}
