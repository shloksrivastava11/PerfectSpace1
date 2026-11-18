import { useEffect, useState, useCallback } from 'react'
import { NavLink, Navigate, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { LayoutDashboard, User, Heart, ClipboardList, CalendarDays, Star, Building2, PlusCircle, Users, LogOut, ShieldCheck, MessageSquare } from 'lucide-react'
import { api, upload } from '../api.js'
import { useStore } from '../store.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import { Stars } from '../components/Reviews.jsx'
import { inr, typeOptions, roomOptions, facilityOptions } from '../data.js'

function useFetch(path) {
  const [s, setS] = useState({ data: null, loading: true, error: '' })
  const load = useCallback(() => api(path).then((data) => setS({ data, loading: false, error: '' })).catch((e) => setS({ data: null, loading: false, error: e.message })), [path])
  useEffect(() => { setS({ data: null, loading: true, error: '' }); load() }, [load])
  return { ...s, reload: load }
}
const BADGE = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', cancelled: 'bg-slate-100 text-slate-600' }
const Badge = ({ s }) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${BADGE[s]}`}>{s}</span>
const day = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const Page = ({ title, f, children, action }) => (
  <div><div className="mb-6 flex items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">{title}</h1>{action}</div>
    {f?.loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />)}</div>
      : f?.error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{f.error}</p> : children}</div>)
const Empty = ({ text, to, cta }) => <div className="rounded-2xl bg-white py-14 text-center shadow-card"><p>{text}</p>{to && <Link to={to} className="btn-primary mt-4">{cta}</Link>}</div>
const Stat = ({ label, value }) => <div className="rounded-2xl bg-white p-5 shadow-card"><p className="text-sm">{label}</p><p className="mt-1 text-3xl font-extrabold text-ink">{value}</p></div>
const Row = ({ children }) => <li className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card sm:flex-row sm:items-center">{children}</li>

function Bookings({ role, visits }) {
  const { notify } = useStore()
  const f = useFetch(role === 'student' ? '/bookings/my' : role === 'owner' ? '/bookings/owner' : '/admin/bookings')
  const set = async (id, status) => { try { await api(`/bookings/${id}/status`, { method: 'PUT', body: { status } }); notify('Request ' + status); f.reload() } catch (e) { notify(e.message) } }
  const list = (f.data?.bookings || []).filter((b) => role === 'admin' || (b.type === 'visit') === !!visits)
  return (
    <Page title={role === 'admin' ? 'All bookings' : visits ? (role === 'owner' ? 'Visit requests' : 'Scheduled visits') : 'Booking requests'} f={f}>
      {list.length === 0 ? <Empty text="Nothing here yet." to={role === 'student' ? '/pgs' : undefined} cta="Find PGs" /> :
        <ul className="space-y-3">{list.map((b) => (
          <Row key={b._id}>
            {b.property?.images?.[0] && <img src={b.property.images[0]} alt="" className="h-16 w-24 rounded-lg object-cover" />}
            <div className="flex-1 text-sm"><p className="font-bold text-ink">{b.property?.title || 'Property'}</p>
              <p>{role === 'student' ? `Owner: ${b.owner?.name}` : `Student: ${b.student?.name}${b.student?.phone ? ' · ' + b.student.phone : ''}`}{role === 'admin' && ` → ${b.owner?.name}`}</p>
              <p className="text-slate-500">Requested {day(b.createdAt)}{b.type === 'visit' && b.visitDate && ` · Visit on ${new Date(b.visitDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`}{b.moveInDate && ` · Move-in ${day(b.moveInDate)}`}</p>
              {b.paymentStatus && b.paymentStatus !== 'none' && <p className="font-semibold text-success">{b.paymentStatus === 'paid' ? `Paid ${inr(b.amount)} online` : `Paid ${inr(b.amount)} · refund pending`}</p>}
              {role === 'student' && b.status === 'approved' && b.contact && <div className="mt-2 rounded-lg bg-green-50 p-3 text-green-900"><p><b>Owner:</b> {b.owner?.name} · <a className="underline" href={`tel:${b.contact.phone}`}>{b.contact.phone}</a></p><p><b>Address:</b> {b.contact.address} · <a className="underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.contact.address)}`}>Open in Maps</a></p></div>}{b.message && <p className="mt-1 italic">“{b.message}”</p>}</div>
            <Badge s={b.status} />
            {role === 'owner' && b.status === 'pending' && <div className="flex gap-2"><button className="btn-primary !py-2" onClick={() => set(b._id, 'approved')}>Accept</button><button className="btn-outline !py-2" onClick={() => set(b._id, 'rejected')}>Reject</button></div>}
            {role === 'student' && ['pending', 'approved'].includes(b.status) && <button className="btn-outline !py-2" onClick={() => set(b._id, 'cancelled')}>Cancel</button>}
          </Row>))}</ul>}
    </Page>)
}

const ReviewList = ({ f, title, who }) => (
  <Page title={title} f={f}>{!f.data?.reviews.length ? <Empty text="No reviews yet." /> :
    <ul className="space-y-3">{f.data.reviews.map((r) => (
      <li key={r._id} className="rounded-2xl bg-white p-4 shadow-card"><div className="flex items-center justify-between"><b className="text-ink">{r.property?.title}</b><Stars n={r.rating} /></div>
        <p className="mt-2 text-sm">{r.comment}</p><p className="mt-1 text-xs text-slate-500">{who && `${r.student?.name} · `}{day(r.createdAt)}</p></li>))}</ul>}</Page>)

function Profile() {
  const { user, setUser, notify } = useStore()
  const [f, setF] = useState({ name: user.name, phone: user.phone, password: '' })
  const submit = async (e) => { e.preventDefault(); try { const d = await api('/auth/me', { method: 'PUT', body: { ...f, password: f.password || undefined } }); setUser(d.user); setF({ ...f, password: '' }); notify('Profile updated') } catch (err) { notify(err.message) } }
  return (
    <Page title="My profile">
      <form onSubmit={submit} className="max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm">{user.email} · <span className="capitalize">{user.role}</span></p>
        <input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Name" />
        <input className="input" required pattern="[0-9]{10}" title="10-digit number" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} aria-label="Phone" />
        <input className="input" type="password" minLength={6} placeholder="New password (optional)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button className="btn-primary">Save changes</button>
      </form></Page>)
}

function StudentHome() {
  const { saved } = useStore(), f = useFetch('/bookings/my'), b = f.data?.bookings || []
  return (
    <Page title="Overview" f={f}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Booking requests" value={b.length} /><Stat label="Pending" value={b.filter((x) => x.status === 'pending').length} /><Stat label="Approved" value={b.filter((x) => x.status === 'approved').length} /><Stat label="Saved properties" value={saved.length} /></div>
      <h2 className="mb-3 mt-8 font-bold text-ink">Recent activity</h2>
      {b.length === 0 ? <Empty text="No activity yet. Start by finding a place." to="/pgs" cta="Explore PGs" /> :
        <ul className="space-y-3">{b.slice(0, 5).map((x) => <Row key={x._id}><div className="flex-1 text-sm"><b className="text-ink">{x.property?.title}</b><br />{day(x.createdAt)}</div><Badge s={x.status} /></Row>)}</ul>}
    </Page>)
}
function Saved() {
  const f = useFetch('/wishlist'), { saved } = useStore()
  const list = (f.data?.properties || []).filter((p) => saved.includes(p.id))
  return <Page title="Saved properties" f={f}>{list.length === 0 ? <Empty text="You have not saved any property yet." to="/pgs" cta="Find PGs" /> : <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{list.map((p) => <PropertyCard key={p.id} p={p} />)}</div>}</Page>
}

function OwnerHome() {
  const p = useFetch('/properties/mine'), b = useFetch('/bookings/owner')
  const props = p.data?.properties || [], bk = b.data?.bookings || []
  return (
    <Page title="Overview" f={p.loading || b.loading ? { loading: true } : p.error ? p : b}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Total properties" value={props.length} /><Stat label="Active listings" value={props.filter((x) => x.approvalStatus === 'approved').length} /><Stat label="Pending requests" value={bk.filter((x) => x.status === 'pending').length} /><Stat label="Total enquiries" value={bk.length} /></div>
      {props.length === 0 && <div className="mt-8"><Empty text="List your first property to start receiving requests." to="/dashboard/add" cta="Add property" /></div>}
    </Page>)
}
function MyProperties() {
  const { notify } = useStore(), f = useFetch('/properties/mine'), [rooms, setRooms] = useState({})
  const saveRooms = async (p) => { try { await api('/properties/' + p.id, { method: 'PUT', body: { availableRooms: +rooms[p.id] } }); notify('Availability updated'); f.reload() } catch (e) { notify(e.message) } }
  const del = async (p) => { if (!confirm(`Delete “${p.title}”? This also removes its bookings and reviews.`)) return; try { await api('/properties/' + p.id, { method: 'DELETE' }); notify('Property deleted'); f.reload() } catch (e) { notify(e.message) } }
  const list = f.data?.properties || []
  return (
    <Page title="My properties" f={f} action={<Link to="/dashboard/add" className="btn-primary">Add property</Link>}>
      {list.length === 0 ? <Empty text="No properties yet." to="/dashboard/add" cta="Add property" /> :
        <ul className="space-y-3">{list.map((p) => (
          <Row key={p.id}>
            <img src={p.images[0]} alt="" className="h-16 w-24 rounded-lg bg-slate-100 object-cover" />
            <div className="flex-1 text-sm"><p className="font-bold text-ink">{p.title}</p><p>{p.area}, {p.city} · {inr(p.rent)}/month</p>
              {p.approvalStatus === 'rejected' && p.rejectionReason && <p className="text-red-600">Reason: {p.rejectionReason}</p>}</div>
            <Badge s={p.approvalStatus} />
            <div className="flex items-center gap-2"><input type="number" min={0} aria-label="Available rooms" className="input !w-20 !py-2" value={rooms[p.id] ?? p.rooms} onChange={(e) => setRooms({ ...rooms, [p.id]: e.target.value })} />
              <button className="btn-outline !py-2" onClick={() => saveRooms(p)}>Update</button></div>
            <div className="flex gap-2"><Link to={`/dashboard/edit/${p.id}`} className="btn-outline !py-2">Edit</Link><button className="btn-outline !py-2 !text-red-600" onClick={() => del(p)}>Delete</button></div>
          </Row>))}</ul>}
    </Page>)
}
const blank = { title: '', description: '', propertyType: 'Boys PG', genderPreference: 'Any', address: '', city: '', state: '', area: '', rent: '', securityDeposit: '', roomType: 'Single Sharing', availableRooms: 1, bookingAmount: '', facilities: [], foodAvailable: false, foodDetails: '', rules: '', images: [] }
const F = ({ label, children }) => <label className="block text-sm font-medium text-ink">{label}<div className="mt-1.5">{children}</div></label>
function PropertyForm() {
  const { id } = useParams(), nav = useNavigate(), { notify } = useStore()
  const [f, setF] = useState(blank), [busy, setBusy] = useState(false)
  useEffect(() => {
    setF(blank)
    if (id) api('/properties/' + id).then(({ property: p }) => setF({ title: p.title, description: p.description, propertyType: p.type, genderPreference: p.genderPreference, address: p.address, city: p.city, state: p.state, area: p.area, rent: p.rent, securityDeposit: p.deposit, roomType: p.room, availableRooms: p.rooms, bookingAmount: p.bookingAmount, facilities: p.facilities, foodAvailable: p.foodAvailable, foodDetails: p.foodAvailable ? p.food : '', rules: p.rules.join('\n'), images: p.images })).catch((e) => notify(e.message))
  }, [id])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const addImages = async (e) => { try { const urls = await upload(e.target.files); setF((x) => ({ ...x, images: [...x.images, ...urls] })) } catch (err) { notify(err.message) } e.target.value = '' }
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const body = { ...f, rent: +f.rent, securityDeposit: +f.securityDeposit || 0, availableRooms: +f.availableRooms, bookingAmount: +f.bookingAmount || 0, rules: f.rules.split('\n').map((s) => s.trim()).filter(Boolean) }
      await api(id ? '/properties/' + id : '/properties', { method: id ? 'PUT' : 'POST', body })
      notify(id ? 'Updated and sent for review' : 'Submitted for admin approval'); nav('/dashboard/properties')
    } catch (err) { notify(err.message) } setBusy(false)
  }
  return (
    <Page title={id ? 'Edit property' : 'Add property'}>
      <form onSubmit={submit} className="grid gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-2">
        <div className="md:col-span-2"><F label="Property name"><input className="input" required value={f.title} onChange={set('title')} /></F></div>
        <div className="md:col-span-2"><F label="Description"><textarea className="input" rows={3} required value={f.description} onChange={set('description')} /></F></div>
        <F label="Property type"><select className="input" value={f.propertyType} onChange={set('propertyType')}>{typeOptions.map((t) => <option key={t}>{t}</option>)}</select></F>
        <F label="Gender preference"><select className="input" value={f.genderPreference} onChange={set('genderPreference')}>{['Any', 'Boys', 'Girls'].map((t) => <option key={t}>{t}</option>)}</select></F>
        <div className="md:col-span-2"><F label="Full address"><input className="input" value={f.address} onChange={set('address')} /></F></div>
        <F label="City"><input className="input" required value={f.city} onChange={set('city')} /></F>
        <F label="State"><input className="input" value={f.state} onChange={set('state')} /></F>
        <F label="Area / sector"><input className="input" value={f.area} onChange={set('area')} /></F>
        <F label="Room type"><select className="input" value={f.roomType} onChange={set('roomType')}>{roomOptions.map((t) => <option key={t}>{t}</option>)}</select></F>
        <F label="Monthly rent (₹)"><input className="input" type="number" min={0} required value={f.rent} onChange={set('rent')} /></F>
        <F label="Security deposit (₹)"><input className="input" type="number" min={0} value={f.securityDeposit} onChange={set('securityDeposit')} /></F>
        <F label="Available rooms"><input className="input" type="number" min={0} required value={f.availableRooms} onChange={set('availableRooms')} /></F>
        <F label="Online booking amount (₹)"><input className="input" type="number" min={0} placeholder="Empty = one month's rent" value={f.bookingAmount} onChange={set('bookingAmount')} /></F>
        <fieldset className="md:col-span-2"><legend className="mb-2 text-sm font-medium text-ink">Facilities</legend><div className="flex flex-wrap gap-4">{facilityOptions.map((x) => <label key={x} className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={f.facilities.includes(x)} onChange={() => setF({ ...f, facilities: f.facilities.includes(x) ? f.facilities.filter((y) => y !== x) : [...f.facilities, x] })} />{x}</label>)}</div></fieldset>
        <label className="flex items-center gap-2 text-sm font-medium text-ink"><input type="checkbox" className="accent-primary" checked={f.foodAvailable} onChange={set('foodAvailable')} />Food available</label>
        {f.foodAvailable && <input className="input" placeholder="Meals, timings, veg / non-veg" value={f.foodDetails} onChange={set('foodDetails')} />}
        <div className="md:col-span-2"><F label="Rules (one per line)"><textarea className="input" rows={3} value={f.rules} onChange={set('rules')} /></F></div>
        <div className="md:col-span-2"><F label="Images (JPG, PNG or WebP, up to 5 MB each)"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addImages} className="text-sm" /></F>
          <div className="mt-3 flex flex-wrap gap-3">{f.images.map((u) => <div key={u} className="relative"><img src={u} alt="" className="h-20 w-28 rounded-lg object-cover" /><button type="button" aria-label="Remove image" onClick={() => setF({ ...f, images: f.images.filter((x) => x !== u) })} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-white">×</button></div>)}</div></div>
        <div className="md:col-span-2"><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : id ? 'Save changes' : 'Submit for approval'}</button></div>
      </form></Page>)
}

function AdminHome() {
  const f = useFetch('/admin/dashboard'), s = f.data?.stats
  const L = [['totalUsers', 'Total users'], ['totalOwners', 'Total owners'], ['totalProperties', 'Total properties'], ['pendingProperties', 'Pending properties'], ['totalBookings', 'Total bookings'], ['activeProperties', 'Active properties']]
  const max = Math.max(1, ...(f.data?.propertiesByCity || []).map((c) => c.count))
  return (
    <Page title="Overview" f={f}>{s && <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{L.map(([k, l]) => <Stat key={k} label={l} value={s[k]} />)}</div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-card"><h2 className="mb-4 font-bold text-ink">Properties by city</h2>{f.data.propertiesByCity.map((c) => <div key={c._id} className="mb-2 text-sm"><div className="flex justify-between"><span>{c._id}</span><b>{c.count}</b></div><div className="mt-1 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-primary" style={{ width: `${(c.count / max) * 100}%` }} /></div></div>)}</section>
        <section className="rounded-2xl bg-white p-5 shadow-card"><h2 className="mb-4 font-bold text-ink">Bookings by status</h2><ul className="space-y-2">{f.data.bookingsByStatus.map((c) => <li key={c._id} className="flex justify-between text-sm"><Badge s={c._id} /><b>{c.count}</b></li>)}{!f.data.bookingsByStatus.length && <li className="text-sm">No bookings yet.</li>}</ul></section>
      </div></>}</Page>)
}
function AdminUsers({ role }) {
  const { notify } = useStore(), f = useFetch('/admin/users?role=' + role)
  const del = async (u) => { if (!confirm(`Delete ${u.name} and everything linked to them?`)) return; try { await api('/admin/users/' + u.id, { method: 'DELETE' }); notify('User deleted'); f.reload() } catch (e) { notify(e.message) } }
  const list = f.data?.users || []
  return <Page title={role === 'student' ? 'Manage students' : 'Manage owners'} f={f}>{list.length === 0 ? <Empty text="No users yet." /> : <ul className="space-y-3">{list.map((u) => <Row key={u.id}><div className="flex-1 text-sm"><b className="text-ink">{u.name}</b><br />{u.email} · {u.phone} · joined {day(u.createdAt)}</div><button className="btn-outline !py-2 !text-red-600" onClick={() => del(u)}>Delete</button></Row>)}</ul>}</Page>
}
function AdminProperties() {
  const { notify } = useStore(), [st, setSt] = useState('pending'), f = useFetch('/admin/properties' + (st ? '?status=' + st : ''))
  const act = async (p, kind) => {
    try {
      if (kind === 'delete') { if (!confirm(`Delete “${p.title}”?`)) return; await api('/properties/' + p.id, { method: 'DELETE' }) }
      else await api(`/admin/properties/${p.id}/${kind}`, { method: 'PUT', body: kind === 'reject' ? { reason: prompt('Reason for rejection (shown to the owner)') || '' } : {} })
      notify('Done'); f.reload()
    } catch (e) { notify(e.message) }
  }
  const list = f.data?.properties || []
  return (
    <Page title="Manage properties" f={f}>
      <div className="mb-4 flex gap-2 overflow-x-auto">{['pending', 'approved', 'rejected', ''].map((s) => <button key={s} onClick={() => setSt(s)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${st === s ? 'bg-primary text-white' : 'bg-white'}`}>{s || 'all'}</button>)}</div>
      {list.length === 0 ? <Empty text="No properties in this view." /> : <ul className="space-y-3">{list.map((p) => (
        <Row key={p.id}><img src={p.images[0]} alt="" className="h-16 w-24 rounded-lg bg-slate-100 object-cover" />
          <div className="flex-1 text-sm"><Link to={`/pgs/${p.id}`} className="font-bold text-ink hover:text-primary">{p.title}</Link><p>{p.area}, {p.city} · {inr(p.rent)} · by {p.owner?.name}</p></div><Badge s={p.approvalStatus} />
          <div className="flex gap-2">{p.approvalStatus !== 'approved' && <button className="btn-primary !py-2" onClick={() => act(p, 'approve')}>Approve</button>}{p.approvalStatus !== 'rejected' && <button className="btn-outline !py-2" onClick={() => act(p, 'reject')}>Reject</button>}<button className="btn-outline !py-2 !text-red-600" onClick={() => act(p, 'delete')}>Delete</button></div></Row>))}</ul>}
    </Page>)
}
function AdminReviews() {
  const { notify } = useStore(), f = useFetch('/admin/reviews')
  const del = async (r) => { try { await api('/admin/reviews/' + r._id, { method: 'DELETE' }); notify('Review deleted'); f.reload() } catch (e) { notify(e.message) } }
  const list = f.data?.reviews || []
  return <Page title="Manage reviews" f={f}>{list.length === 0 ? <Empty text="No reviews yet." /> : <ul className="space-y-3">{list.map((r) => <Row key={r._id}><div className="flex-1 text-sm"><div className="flex items-center gap-3"><b className="text-ink">{r.property?.title}</b><Stars n={r.rating} /></div><p className="mt-1">{r.comment}</p><p className="text-xs text-slate-500">{r.student?.name} · {day(r.createdAt)}</p></div><button className="btn-outline !py-2 !text-red-600" onClick={() => del(r)}>Delete</button></Row>)}</ul>}</Page>
}

const MENU = {
  student: [['', 'Overview', LayoutDashboard], ['profile', 'My profile', User], ['saved', 'Saved properties', Heart], ['bookings', 'Booking requests', ClipboardList], ['visits', 'Scheduled visits', CalendarDays], ['reviews', 'My reviews', Star]],
  owner: [['', 'Overview', LayoutDashboard], ['properties', 'My properties', Building2], ['add', 'Add property', PlusCircle], ['bookings', 'Booking requests', ClipboardList], ['visits', 'Visit requests', CalendarDays], ['reviews', 'Reviews', Star], ['profile', 'Profile', User]],
  admin: [['', 'Overview', LayoutDashboard], ['students', 'Students', Users], ['owners', 'Owners', Users], ['properties', 'Properties', Building2], ['bookings', 'Bookings', ClipboardList], ['reviews', 'Reviews', MessageSquare], ['profile', 'Profile', ShieldCheck]],
}
const ROUTES = {
  student: [['', <StudentHome />], ['profile', <Profile />], ['saved', <Saved />], ['bookings', <Bookings role="student" />], ['visits', <Bookings role="student" visits />], ['reviews', <MyReviews />]],
  owner: [['', <OwnerHome />], ['properties', <MyProperties />], ['add', <PropertyForm />], ['edit/:id', <PropertyForm />], ['bookings', <Bookings role="owner" />], ['visits', <Bookings role="owner" visits />], ['reviews', <OwnerReviews />], ['profile', <Profile />]],
  admin: [['', <AdminHome />], ['students', <AdminUsers role="student" />], ['owners', <AdminUsers role="owner" />], ['properties', <AdminProperties />], ['bookings', <Bookings role="admin" />], ['reviews', <AdminReviews />], ['profile', <Profile />]],
}
function MyReviews() { return <ReviewList f={useFetch('/reviews/my')} title="My reviews" /> }
function OwnerReviews() { return <ReviewList f={useFetch('/reviews/owner')} title="Reviews on your properties" who /> }

export default function Dashboard() {
  const { user, ready, logout } = useStore()
  if (!ready) return <div className="container-x py-32 text-center">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="container-x grid gap-6 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="h-fit rounded-2xl bg-white p-3 shadow-card lg:sticky lg:top-24">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {MENU[user.role].map(([to, label, Icon]) => (
            <NavLink key={label} to={`/dashboard/${to}`} end className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-primary text-white' : 'hover:bg-surface'}`}><Icon size={17} />{label}</NavLink>))}
          <button onClick={logout} className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface"><LogOut size={17} />Logout</button>
        </nav>
      </aside>
      <div className="min-w-0">
        <Routes>{ROUTES[user.role].map(([p, el]) => <Route key={p} path={p || undefined} index={!p} element={el} />)}<Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes>
      </div>
    </div>)
}
