import { Link } from 'react-router-dom'
import { Heart, MapPin, Star, ChevronLeft, ChevronRight, Scale } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store.jsx'
import { inr } from '../data.js'
export const CardSkeleton = () => <div className="overflow-hidden rounded-2xl bg-white shadow-card"><div className="aspect-[4/3] animate-pulse bg-slate-200" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" /><div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" /><div className="h-8 w-full animate-pulse rounded bg-slate-200" /></div></div>
export default function PropertyCard({ p, gallery = false }) {
  const { saved, toggleSave, compare, toggleCompare } = useStore()
  const [i, setI] = useState(0)
  const on = saved.includes(p.id), cmp = compare.includes(p.id)
  const step = (d) => () => setI((i + d + p.images.length) % p.images.length)
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={p.images[gallery ? i : 0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink">{p.type}</span>
        <button onClick={() => toggleSave(p.id)} aria-label={on ? 'Remove from saved' : 'Save property'} aria-pressed={on}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow transition hover:scale-110">
          <Heart size={18} className={on ? 'fill-red-500 text-red-500' : 'text-ink'} /></button>
        <button onClick={() => toggleCompare(p.id)} aria-pressed={cmp} className={`absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold shadow ${cmp ? 'bg-primary text-white' : 'bg-white/95 text-ink'}`}><Scale size={14} />{cmp ? 'Added' : 'Compare'}</button>
        {gallery && <>
          <button onClick={step(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1"><ChevronLeft size={16} /></button>
          <button onClick={step(1)} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1"><ChevronRight size={16} /></button></>}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold leading-snug">{p.title}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink"><Star size={14} className="fill-amber-400 text-amber-400" />{p.rating} <span className="font-normal text-slate-500">({p.reviews})</span></span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} />{p.area}, {p.city}</p>
        <p className="mt-3 text-sm">{p.room} · <span className={p.rooms <= 3 ? 'font-semibold text-amber-600' : 'font-semibold text-success'}>{p.rooms} rooms left</span></p>
        <div className="mt-3 flex flex-wrap gap-1.5">{p.facilities.slice(0, 4).map((f) => <span key={f} className="rounded-md bg-surface px-2 py-1 text-xs font-medium">{f}</span>)}</div>
        <div className="mt-5 flex items-center justify-between">
          <p><span className="text-xl font-extrabold text-ink">{inr(p.rent)}</span><span className="text-sm text-slate-500"> /month</span></p>
          <Link to={`/pgs/${p.id}`} className="btn-primary !py-2">View Details</Link>
        </div>
      </div>
    </article>
  )
}
