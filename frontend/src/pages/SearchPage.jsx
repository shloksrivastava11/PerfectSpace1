import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, SearchX } from 'lucide-react'
import { typeOptions, roomOptions, facilityOptions } from '../data.js'
import { useProperties } from '../useProperties.js'
import PropertyCard, { CardSkeleton } from '../components/PropertyCard.jsx'

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
export default function SearchPage() {
  const [sp] = useSearchParams()
  const { properties, loading } = useProperties()
  const [text, setText] = useState(sp.get('city') || '')
  const [min, setMin] = useState(''), [max, setMax] = useState(sp.get('max') || '')
  const [types, setTypes] = useState(sp.get('type') ? [sp.get('type')] : [])
  const [rooms, setRooms] = useState([]), [facs, setFacs] = useState([])
  const [sort, setSort] = useState('rating'), [show, setShow] = useState(6), [panel, setPanel] = useState(false)

  const list = useMemo(() => {
    const t = text.toLowerCase()
    return properties.filter((p) =>
      (!t || [p.title, p.city, p.area].some((s) => s.toLowerCase().includes(t))) &&
      (!min || p.rent >= +min) && (!max || p.rent <= +max) &&
      (!types.length || types.includes(p.type)) && (!rooms.length || rooms.includes(p.room)) &&
      facs.every((f) => p.facilities.includes(f))
    ).sort((a, b) => sort === 'low' ? a.rent - b.rent : sort === 'high' ? b.rent - a.rent : b.rating - a.rating)
  }, [properties, text, min, max, types, rooms, facs, sort])

  const Group = ({ title, opts, val, set }) => (
    <fieldset className="mb-6"><legend className="mb-2 font-bold text-ink">{title}</legend>
      {opts.map((o) => <label key={o} className="flex cursor-pointer items-center gap-2 py-1 text-sm"><input type="checkbox" className="h-4 w-4 accent-primary" checked={val.includes(o)} onChange={() => set(toggle(val, o))} />{o}</label>)}</fieldset>)
  const reset = () => { setText(''); setMin(''); setMax(''); setTypes([]); setRooms([]); setFacs([]) }

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold">Find PGs &amp; hostels</h1>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input className="input" placeholder="Search by city, area, sector or property name" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search" />
        <select className="input sm:w-56" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="rating">Top rated</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
        <button className="btn-outline lg:hidden" onClick={() => setPanel(!panel)}><SlidersHorizontal size={16} />Filters</button>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${panel ? 'block' : 'hidden'} h-fit rounded-2xl bg-white p-6 shadow-card lg:sticky lg:top-24 lg:block`}>
          <div className="mb-6 flex items-center justify-between"><h2 className="font-extrabold text-ink">Filters</h2><button onClick={reset} className="text-sm font-semibold text-primary">Clear all</button></div>
          <div className="mb-6"><p className="mb-2 font-bold text-ink">Monthly rent (₹)</p><div className="flex gap-2"><input className="input !px-3" type="number" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} /><input className="input !px-3" type="number" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} /></div></div>
          <Group title="Property type" opts={typeOptions} val={types} set={setTypes} />
          <Group title="Room type" opts={roomOptions} val={rooms} set={setRooms} />
          <Group title="Facilities" opts={facilityOptions} val={facs} set={setFacs} />
        </aside>
        <section>
          <p className="mb-4 text-sm">{loading ? 'Loading properties…' : `${list.length} properties found`}</p>
          {!loading && list.length === 0 ? (
            <div className="rounded-2xl bg-white py-20 text-center shadow-card"><SearchX className="mx-auto text-slate-400" size={40} /><h3 className="mt-4 text-lg font-bold">No properties match these filters</h3><p className="mt-1 text-sm">Try a wider budget or remove a filter.</p><button onClick={reset} className="btn-primary mt-5">Clear filters</button></div>
          ) : <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{loading && [...Array(6)].map((_, i) => <CardSkeleton key={i} />)}{list.slice(0, show).map((p) => <PropertyCard key={p.id} p={p} gallery />)}</div>
            {show < list.length && <div className="mt-10 text-center"><button className="btn-outline" onClick={() => setShow(show + 6)}>Load more</button></div>}
          </>}
        </section>
      </div>
    </div>
  )
}
