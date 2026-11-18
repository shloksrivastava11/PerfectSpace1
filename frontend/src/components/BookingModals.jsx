import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../api.js'
import { inr } from '../data.js'
import { useStore } from '../store.jsx'

const pad = (n) => String(n).padStart(2, '0')
const local = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
const loadRazorpay = () => new Promise((ok, no) => {
  if (window.Razorpay) return ok()
  const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = ok; s.onerror = () => no(new Error('Could not load the payment gateway')); document.body.appendChild(s)
})
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">{title}</h2><button onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        {children}
      </div>
    </div>)
}

export function VisitModal({ p, onClose, onDone }) {
  const { notify } = useStore()
  const [when, setWhen] = useState(''), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    const h = new Date(when).getHours()
    if (h < 8 || h >= 20) return notify('Please pick a time between 8 AM and 8 PM')
    setBusy(true)
    try {
      await api('/bookings', { method: 'POST', body: { propertyId: p.id, type: 'visit', visitDate: new Date(when).toISOString(), message: msg } })
      notify('Visit request sent'); onDone()
    } catch (err) { notify(err.message); setBusy(false) }
  }
  return (
    <Modal title="Schedule a visit" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm">{p.title} · {p.area}, {p.city}</p>
        <label className="block text-sm font-medium text-ink">Date and time
          <input type="datetime-local" required min={local(new Date(Date.now() + 3600000))} value={when} onChange={(e) => setWhen(e.target.value)} className="input mt-1.5" /></label>
        <p className="-mt-2 text-xs text-slate-500">Visiting hours: 8 AM to 8 PM.</p>
        <textarea className="input" rows={3} placeholder="Message to the owner (optional)" maxLength={500} value={msg} onChange={(e) => setMsg(e.target.value)} />
        <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">The owner's phone number and exact address are shared once the owner approves your visit.</p>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Request visit'}</button>
      </form>
    </Modal>)
}

export function PayModal({ p, onClose, onDone }) {
  const { user, notify } = useStore()
  const [date, setDate] = useState(''), [busy, setBusy] = useState(false), [demo, setDemo] = useState(null)
  const amount = p.bookingAmount || p.rent
  const finish = async (order, extra) => {
    try {
      await api('/payments/verify', { method: 'POST', body: { propertyId: p.id, moveInDate: date, orderId: order.orderId, ...extra } })
      notify('Payment successful. Booking request sent to the owner'); onDone()
    } catch (err) { notify(err.message); setBusy(false) }
  }
  const start = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const order = await api('/payments/order', { method: 'POST', body: { propertyId: p.id, moveInDate: date } })
      if (order.demo) { setDemo(order); setBusy(false); return }
      await loadRazorpay()
      new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId, name: 'PerfectSpace', description: p.title,
        prefill: { name: user.name, email: user.email, contact: user.phone }, theme: { color: '#2563EB' },
        handler: (r) => finish(order, { paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
        modal: { ondismiss: () => setBusy(false) },
      }).open()
    } catch (err) { notify(err.message); setBusy(false) }
  }
  if (demo) return (
    <Modal title="Demo payment" onClose={onClose}>
      <p className="text-sm">Payment gateway keys are not configured, so this is a <b>demo</b>. No real money is charged.</p>
      <p className="mt-4 text-3xl font-extrabold text-ink">{inr(demo.amount / 100)}</p>
      <button className="btn-primary mt-5 w-full" disabled={busy} onClick={() => { setBusy(true); finish(demo, { paymentId: 'demo_' + Date.now() }) }}>{busy ? 'Processing…' : 'Pay (demo)'}</button>
    </Modal>)
  return (
    <Modal title="Book online" onClose={onClose}>
      <form onSubmit={start} className="space-y-4">
        <p className="text-sm">{p.title} · {p.room}</p>
        <label className="block text-sm font-medium text-ink">Move-in date
          <input type="date" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="input mt-1.5" /></label>
        <div className="flex items-center justify-between rounded-xl bg-surface p-4"><span className="text-sm">Booking amount</span><b className="text-xl text-ink">{inr(amount)}</b></div>
        <p className="text-xs text-slate-500">Your request goes to the owner after payment. If the owner rejects it or you cancel, the payment is marked for refund.</p>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : `Pay ${inr(amount)}`}</button>
      </form>
    </Modal>)
}
