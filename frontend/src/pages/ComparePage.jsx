import { Link } from 'react-router-dom'
import { X, Check, Minus } from 'lucide-react'
import { useStore } from '../store.jsx'
import { useProperties } from '../useProperties.js'
import { inr, facilityOptions } from '../data.js'

export default function ComparePage() {
  const { compare, toggleCompare, clearCompare } = useStore()
  const { properties, loading } = useProperties()
  const list = compare.map((id) => properties.find((p) => p.id === id)).filter(Boolean)
  if (loading) return <div className="container-x py-32 text-center">Loading…</div>
  if (list.length < 2) return (
    <div className="container-x py-24 text-center"><h1 className="text-3xl font-extrabold">Compare properties</h1>
      <p className="mt-3">Select at least 2 properties (up to 3) using the Compare button on property cards.</p><Link to="/pgs" className="btn-primary mt-6">Browse properties</Link></div>)
  const minRent = Math.min(...list.map((p) => p.rent)), maxRating = Math.max(...list.map((p) => p.rating))
  const food = (p) => p.foodAvailable ?? p.facilities.includes('Food')
  const rows = [
    ['Monthly rent', (p) => <b className={p.rent === minRent ? 'text-success' : 'text-ink'}>{inr(p.rent)}{p.rent === minRent && ' · lowest'}</b>],
    ['Security deposit', (p) => inr(p.deposit)],
    ['Type', (p) => p.type], ['Room type', (p) => p.room],
    ['Rooms available', (p) => p.rooms],
    ['Rating', (p) => <span className={p.rating === maxRating ? 'font-bold text-success' : ''}>{p.rating} ({p.reviews} reviews)</span>],
    ['Location', (p) => `${p.area}, ${p.city}`],
    ['Food', (p) => (food(p) ? p.food : 'Not included')],
    ...facilityOptions.filter((f) => f !== 'Food').map((f) => [f, (p) => (p.facilities.includes(f) ? <Check size={18} className="text-success" aria-label="Yes" /> : <Minus size={18} className="text-slate-300" aria-label="No" />)]),
  ]
  return (
    <div className="container-x py-10">
      <div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-extrabold">Compare properties</h1><button onClick={clearCompare} className="text-sm font-semibold text-primary">Clear all</button></div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr><th className="w-40 p-4" />{list.map((p) => (
            <th key={p.id} className="p-4 align-top font-normal"><div className="relative">
              <button onClick={() => toggleCompare(p.id)} aria-label={`Remove ${p.title}`} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white shadow"><X size={14} /></button>
              <img src={p.images[0]} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
              <p className="mt-3 text-base font-bold text-ink">{p.title}</p>
              <Link to={`/pgs/${p.id}`} className="btn-primary mt-3 !py-2">View details</Link></div></th>))}</tr></thead>
          <tbody>{rows.map(([label, get]) => (
            <tr key={label} className="border-t border-slate-100"><th scope="row" className="p-4 font-semibold text-ink">{label}</th>{list.map((p) => <td key={p.id} className="p-4">{get(p)}</td>)}</tr>))}</tbody>
        </table>
      </div>
    </div>)
}
