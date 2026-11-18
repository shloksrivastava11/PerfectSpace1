import { useState } from 'react'
import { api } from '../api.js'
import { useStore } from '../store.jsx'
export const About = () => (
  <div className="container-x max-w-3xl py-16">
    <h1 className="text-4xl font-extrabold">About PerfectSpace</h1>
    <p className="mt-6 leading-relaxed">PerfectSpace helps students and working professionals find a PG, hostel or co-living space near their college or workplace. Every listing is reviewed by our team before it goes live, so what you see is what you get.</p>
    <p className="mt-4 leading-relaxed">Owners get a simple way to list rooms, manage booking requests and reach genuine tenants. Tenants get clear pricing, honest reviews and a direct line to the owner.</p>
  </div>)
export function Contact() {
  const { notify } = useStore()
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const submit = async (e) => { e.preventDefault(); try { const d = await api('/contact', { method: 'POST', body: f }); notify(d.message); setF({ name: '', email: '', message: '' }) } catch (err) { notify(err.message) } }
  return (
    <div className="container-x max-w-xl py-16">
      <h1 className="text-4xl font-extrabold">Contact us</h1>
      <p className="mt-3">Questions about a listing or your account? Write to us at hello@perfectspace.in or use the form.</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <input className="input" placeholder="Your name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <textarea className="input" rows={4} placeholder="How can we help?" required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
        <button className="btn-primary w-full">Send message</button>
      </form>
    </div>)
}
