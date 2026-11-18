import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { api } from '../api.js'
import { useStore } from '../store.jsx'
export const Stars = ({ n }) => <span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} className={i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}</span>
export default function Reviews({ propertyId }) {
  const { user, notify } = useStore()
  const [list, setList] = useState([]), [rating, setRating] = useState(5), [comment, setComment] = useState('')
  const load = () => api('/reviews/' + propertyId).then((d) => setList(d.reviews)).catch(() => {})
  useEffect(() => { load() }, [propertyId])
  const submit = async (e) => {
    e.preventDefault()
    try { await api('/reviews', { method: 'POST', body: { propertyId, rating: +rating, comment } }); setComment(''); notify('Review posted'); load() }
    catch (err) { notify(err.message) }
  }
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Reviews ({list.length})</h2>
      {user?.role === 'student' ? (
        <form onSubmit={submit} className="mt-4 rounded-2xl bg-white p-5 shadow-card">
          <label className="text-sm font-medium text-ink">Your rating
            <select className="input mt-1.5 sm:w-40" value={rating} onChange={(e) => setRating(e.target.value)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 && 's'}</option>)}</select></label>
          <textarea className="input mt-3" rows={3} required placeholder="Share your experience" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn-primary mt-3">Post review</button>
        </form>
      ) : <p className="mt-3 text-sm">{user ? 'Only students can post reviews.' : 'Log in as a student to post a review.'}</p>}
      <ul className="mt-4 space-y-3">{list.map((r) => (
        <li key={r._id} className="rounded-2xl bg-white p-5 shadow-card"><div className="flex items-center justify-between"><b className="text-ink">{r.student?.name || 'Student'}</b><Stars n={r.rating} /></div>
          <p className="mt-2 text-sm">{r.comment}</p><p className="mt-2 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p></li>))}
        {list.length === 0 && <li className="text-sm">No reviews yet.</li>}</ul>
    </div>
  )
}
