import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Star, Phone, CalendarDays, Send, Check, Utensils, ScrollText, CreditCard, Scale, Navigation } from 'lucide-react'
import { inr } from '../data.js'
import { api } from '../api.js'
import { useProperties, useProperty } from '../useProperties.js'
import { useStore } from '../store.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import Reviews from '../components/Reviews.jsx'
import { VisitModal, PayModal } from '../components/BookingModals.jsx'

export default function DetailsPage() {
  const { id } = useParams(), { user, notify, compare, toggleCompare } = useStore()
  const { property: p, loading } = useProperty(id), { properties } = useProperties()
  const [img, setImg] = useState(0), [modal, setModal] = useState(null), [sent, setSent] = useState({})
  if (loading) return <div className="container-x py-32 text-center">Loading…</div>
  if (!p) return <div className="container-x py-32 text-center"><h1 className="text-2xl font-extrabold">Property not found</h1><Link to="/pgs" className="btn-primary mt-6">Back to search</Link></div>

  const amount = p.bookingAmount || p.rent
  const revealed = !!p.owner?.phone // server only sends this after the owner approves your request
  const allowed = () => {
    if (!user) { notify('Please log in first'); return false }
    if (user.role !== 'student') { notify('Only student accounts can book or visit'); return false }
    return true
  }
  const open = (m) => () => allowed() && setModal(m)
  const done = (k) => () => { setSent({ ...sent, [k]: true }); setModal(null) }
  const request = async () => {
    if (!allowed()) return
    try { await api('/bookings', { method: 'POST', body: { propertyId: p.id } }); setSent({ ...sent, request: true }); notify('Booking request sent') } catch (e) { notify(e.message) }
  }
  const similar = properties.filter((x) => x.id !== p.id && (x.city === p.city || x.type === p.type)).slice(0, 3)
  const mapQ = encodeURIComponent((revealed && p.address ? p.address + ', ' : p.area + ', ') + p.city)
  return (
    <div className="container-x py-8">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <img src={p.images[img]} alt={p.title} className="aspect-[16/10] w-full rounded-2xl object-cover" />
        <div className="grid grid-cols-3 gap-3 md:grid-cols-1">{p.images.map((s, i) => <button key={i} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`} className={`overflow-hidden rounded-xl ring-2 ${i === img ? 'ring-primary' : 'ring-transparent'}`}><img src={s} alt="" className="aspect-[4/3] h-full w-full object-cover" /></button>)}</div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">{p.type}</span>
          <h1 className="mt-3 text-3xl font-extrabold">{p.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"><span className="flex items-center gap-1"><MapPin size={15} />{p.area}, {p.city}</span><span className="flex items-center gap-1 font-semibold text-ink"><Star size={15} className="fill-amber-400 text-amber-400" />{p.rating} ({p.reviews} reviews)</span></p>
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 text-sm shadow-card sm:grid-cols-4">
            {[['Room type', p.room], ['Available', `${p.rooms} rooms`], ['Gender', p.type.startsWith('Boys') ? 'Boys' : p.type.startsWith('Girls') ? 'Girls' : 'Any'], ['Deposit', inr(p.deposit)]].map(([k, v]) => <div key={k}><p className="text-slate-500">{k}</p><p className="font-bold text-ink">{v}</p></div>)}
          </div>
          <h2 className="mt-8 text-xl font-bold">About this property</h2><p className="mt-2 leading-relaxed">{p.description}</p>
          <h2 className="mt-8 text-xl font-bold">Facilities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{p.facilities.map((f) => <li key={f} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-card"><Check size={14} className="text-success" />{f}</li>)}</ul>
          <h2 className="mt-8 flex items-center gap-2 text-xl font-bold"><Utensils size={18} />Food</h2><p className="mt-2">{p.food}</p>
          <h2 className="mt-8 flex items-center gap-2 text-xl font-bold"><ScrollText size={18} />Rules</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">{p.rules.map((r) => <li key={r}>{r}</li>)}</ul>
          <Reviews propertyId={p.id} />
          <h2 className="mt-8 text-xl font-bold">Location</h2>
          <iframe title="Map" loading="lazy" className="mt-3 h-72 w-full rounded-2xl border-0" src={`https://maps.google.com/maps?q=${mapQ}&output=embed`} />
        </div>
        <aside className="h-fit rounded-2xl bg-white p-6 shadow-card lg:sticky lg:top-24">
          <p><span className="text-3xl font-extrabold text-ink">{inr(p.rent)}</span><span className="text-sm"> /month</span></p>
          <p className="mt-1 text-sm">Security deposit {inr(p.deposit)}</p>
          <button className="btn-primary mt-5 w-full" disabled={sent.pay} onClick={open('pay')}><CreditCard size={16} />{sent.pay ? 'Booked, awaiting owner' : `Book online · ${inr(amount)}`}</button>
          <button className="btn-outline mt-3 w-full" disabled={sent.visit} onClick={open('visit')}><CalendarDays size={16} />{sent.visit ? 'Visit requested' : 'Schedule a visit'}</button>
          <button className="btn-outline mt-3 w-full" disabled={sent.request} onClick={request}><Send size={16} />{sent.request ? 'Request sent' : 'Send booking request'}</button>
          <button className="btn-outline mt-3 w-full" aria-pressed={compare.includes(p.id)} onClick={() => toggleCompare(p.id)}><Scale size={16} />{compare.includes(p.id) ? 'Added to compare' : 'Add to compare'}</button>
          <div className="mt-5 border-t border-slate-100 pt-4 text-sm">
            <p className="text-slate-500">Listed by</p><p className="font-bold text-ink">{p.owner?.name}</p>
            {revealed ? (
              <div className="mt-3 space-y-2 rounded-xl bg-green-50 p-3 text-green-900">
                <a href={`tel:${p.owner.phone}`} className="flex items-center gap-2 font-semibold"><Phone size={15} />{p.owner.phone}</a>
                {p.address && <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" />{p.address}</p>}
                <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`} className="flex items-center gap-2 font-semibold underline"><Navigation size={15} />Get directions</a>
              </div>
            ) : <p className="mt-3 rounded-xl bg-surface p-3 text-xs">Owner phone number and exact address are shown after the owner approves your visit or booking.</p>}
          </div>
        </aside>
      </div>
      <h2 className="mb-6 mt-16 text-2xl font-extrabold">Similar properties</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <PropertyCard key={s.id} p={s} />)}</div>
      {modal === 'visit' && <VisitModal p={p} onClose={() => setModal(null)} onDone={done('visit')} />}
      {modal === 'pay' && <PayModal p={p} onClose={() => setModal(null)} onDone={done('pay')} />}
    </div>)
}
