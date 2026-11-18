import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, IndianRupee, CalendarCheck, UserCheck, Lock, Star } from 'lucide-react'
import { cities, testimonials, typeOptions } from '../data.js'
import { useProperties } from '../useProperties.js'
import PropertyCard, { CardSkeleton } from '../components/PropertyCard.jsx'

function Counter({ to, suffix = '' }) {
  const [n, setN] = useState(0), ref = useRef()
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect(); let s; const f = (t) => { s ??= t; const k = Math.min((t - s) / 1200, 1); setN(Math.round(to * k)); k < 1 && requestAnimationFrame(f) }
      requestAnimationFrame(f)
    }); io.observe(ref.current); return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{n.toLocaleString('en-IN')}{suffix}</span>
}

export default function HomePage() {
  const nav = useNavigate()
  const { properties, loading } = useProperties('limit=6')
  const [q, setQ] = useState({ city: '', type: '', max: '' })
  const go = (e) => { e.preventDefault(); nav('/pgs?' + new URLSearchParams(Object.entries(q).filter(([, v]) => v))) }
  const why = [[ShieldCheck,'Verified properties','Every listing is checked before it goes live.'],[IndianRupee,'Affordable pricing','Clear rent and deposit, no hidden broker fees.'],[CalendarCheck,'Easy booking','Send a request or schedule a visit in a minute.'],[UserCheck,'Trusted owners','Owners are screened and rated by residents.'],[Lock,'Safe accommodation','Look for CCTV, security and gated entry on each listing.']]
  const steps = [['Search location','Enter your college, office or area.'],['Compare properties','Check rent, rooms, food and rules side by side.'],['Contact owner','Ask questions or schedule a visit.'],['Book your stay','Send a booking request and move in.']]
  return (
    <>
      <section className="relative">
        <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1800&q=70" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="container-x relative py-20 sm:py-28">
          <h1 className="max-w-2xl text-4xl font-extrabold text-white sm:text-6xl">Find Your Perfect Space.</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-200">Discover comfortable, affordable and verified PGs and hostels near your college or workplace.</p>
          <form onSubmit={go} className="mt-10 grid gap-3 rounded-2xl bg-white p-3 shadow-lift sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <input className="input" placeholder="Location (city, area or sector)" value={q.city} onChange={(e) => setQ({ ...q, city: e.target.value })} aria-label="Location" />
            <select className="input" value={q.type} onChange={(e) => setQ({ ...q, type: e.target.value })} aria-label="Property type"><option value="">Property type</option>{typeOptions.map((t) => <option key={t}>{t}</option>)}</select>
            <select className="input" value={q.max} onChange={(e) => setQ({ ...q, max: e.target.value })} aria-label="Budget"><option value="">Budget</option>{[6000, 8000, 10000, 15000].map((b) => <option key={b} value={b}>Up to ₹{b.toLocaleString('en-IN')}</option>)}</select>
            <button className="btn-primary"><Search size={18} />Search</button>
          </form>
        </div>
      </section>

      <section className="container-x -mt-1 grid grid-cols-2 gap-6 py-12 text-center md:grid-cols-4">
        {[[1000,'+','Properties'],[50,'+','Locations'],[5000,'+','Happy residents']].map(([n, s, l]) => <div key={l}><p className="text-4xl font-extrabold text-ink"><Counter to={n} suffix={s} /></p><p className="mt-1 text-sm">{l}</p></div>)}
        <div><p className="flex items-center justify-center gap-2 text-4xl font-extrabold text-success"><ShieldCheck size={34} />100%</p><p className="mt-1 text-sm">Verified listings</p></div>
      </section>

      <section className="container-x py-10">
        <div className="mb-8 flex items-end justify-between"><h2 className="text-3xl font-extrabold">Featured properties</h2><Link to="/pgs" className="text-sm font-semibold text-primary hover:underline">See all</Link></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{loading && [...Array(3)].map((_, i) => <CardSkeleton key={i} />)}{properties.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      </section>

      <section className="container-x py-14">
        <h2 className="mb-8 text-3xl font-extrabold">Popular locations</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {cities.map((c) => (
            <Link key={c.name} to={`/pgs?city=${c.name}`} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
              <img src={c.img} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white"><p className="font-bold">{c.name}</p><p className="text-xs text-slate-200">{c.n}+ properties</p></div>
            </Link>))}
        </div>
      </section>

      <section className="bg-white py-16"><div className="container-x">
        <h2 className="mb-10 text-3xl font-extrabold">Why PerfectSpace?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">{why.map(([I, t, d]) => <div key={t}><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-primary"><I size={22} /></span><h3 className="mt-4 font-bold">{t}</h3><p className="mt-1 text-sm">{d}</p></div>)}</div>
      </div></section>

      <section className="container-x py-16">
        <h2 className="mb-10 text-3xl font-extrabold">How it works</h2>
        <ol className="grid gap-6 md:grid-cols-4">{steps.map(([t, d], i) => <li key={t} className="rounded-2xl bg-white p-6 shadow-card"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-white">{i + 1}</span><h3 className="mt-4 font-bold">{t}</h3><p className="mt-1 text-sm">{d}</p></li>)}</ol>
      </section>

      <section className="container-x pb-6">
        <h2 className="mb-8 text-3xl font-extrabold">What residents say</h2>
        <div className="grid gap-6 md:grid-cols-3">{testimonials.map((t) => (
          <figure key={t.name} className="rounded-2xl bg-white p-6 shadow-card">
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}</div>
            <blockquote className="mt-4 text-sm leading-relaxed">{t.text}</blockquote>
            <figcaption className="mt-5 text-sm"><b className="text-ink">{t.name}</b><br />{t.role}</figcaption>
          </figure>))}</div>
      </section>

      <section className="container-x pt-16"><div className="rounded-3xl bg-primary px-6 py-14 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to Find Your New Home?</h2>
        <Link to="/pgs" className="btn mt-8 bg-white text-primary hover:bg-slate-100">Explore PGs</Link>
      </div></section>
    </>
  )
}
