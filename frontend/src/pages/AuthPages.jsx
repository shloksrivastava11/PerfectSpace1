import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
const Shell = ({ title, sub, children }) => (
  <div className="container-x grid min-h-[70vh] place-items-center py-12"><div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
    <h1 className="text-2xl font-extrabold">{title}</h1><p className="mt-1 text-sm">{sub}</p><div className="mt-6">{children}</div></div></div>)
const Field = ({ label, error, ...r }) => (<label className="mb-4 block text-sm font-medium text-ink">{label}<input className="input mt-1.5" {...r} />{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>)

export function Login() {
  const { login, notify } = useStore(), nav = useNavigate()
  const [f, setF] = useState({ email: '', password: '' })
  const submit = async (e) => { e.preventDefault(); try { const u = await login(f.email, f.password); notify('Welcome back'); nav(u.role === 'student' ? '/' : '/dashboard') } catch (err) { notify(err.message) } }
  return <Shell title="Welcome back" sub="Log in to save properties and send booking requests.">
    <form onSubmit={submit}>
      <Field label="Email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <Field label="Password" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <Link to="/forgot-password" className="mb-5 block text-right text-sm font-semibold text-primary">Forgot password?</Link>
      <button className="btn-primary w-full">Log in</button></form>
    <p className="mt-5 text-center text-sm">New here? <Link to="/register" className="font-semibold text-primary">Create an account</Link></p></Shell>
}
export function Register() {
  const { register, notify } = useStore(), nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'student' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const mismatch = f.confirm && f.confirm !== f.password
  const submit = async (e) => { e.preventDefault(); if (mismatch) return; try { const u = await register({ name: f.name, email: f.email, phone: f.phone, password: f.password, role: f.role }); notify('Account created'); nav(u.role === 'owner' ? '/dashboard/add' : '/') } catch (err) { notify(err.message) } }
  return <Shell title="Create your account" sub="Join PerfectSpace as a tenant or a PG owner.">
    <form onSubmit={submit}>
      <div className="mb-5 grid grid-cols-2 gap-2">{[['student', 'Student / Tenant'], ['owner', 'PG Owner']].map(([v, l]) => <label key={v} className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold ${f.role === v ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200'}`}><input type="radio" className="sr-only" name="role" checked={f.role === v} onChange={() => setF({ ...f, role: v })} />{l}</label>)}</div>
      <Field label="Full name" required value={f.name} onChange={set('name')} />
      <Field label="Email" type="email" required value={f.email} onChange={set('email')} />
      <Field label="Phone" type="tel" required pattern="[0-9]{10}" title="10-digit mobile number" value={f.phone} onChange={set('phone')} />
      <Field label="Password" type="password" required minLength={6} value={f.password} onChange={set('password')} />
      <Field label="Confirm password" type="password" required value={f.confirm} onChange={set('confirm')} error={mismatch && 'Passwords do not match'} />
      <button className="btn-primary w-full">Create account</button></form>
    <p className="mt-5 text-center text-sm">Already registered? <Link to="/login" className="font-semibold text-primary">Log in</Link></p></Shell>
}
export function Forgot() {
  const { notify } = useStore()
  return <Shell title="Reset password" sub="Enter your email and we will send a reset link.">
    <form onSubmit={(e) => { e.preventDefault(); notify('Reset link sent if the email exists') }}><Field label="Email" type="email" required /><button className="btn-primary w-full">Send reset link</button></form>
    <Link to="/login" className="mt-5 block text-center text-sm font-semibold text-primary">Back to login</Link></Shell>
}
