import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Home, Menu, X } from 'lucide-react'
import { useStore } from '../store.jsx'
const links = [['/', 'Home'], ['/pgs', 'Find PGs'], ['/pgs?type=Hostel', 'Hostels'], ['/about', 'About'], ['/contact', 'Contact']]
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useStore()
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><Home size={18} /></span>PerfectSpace
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {links.map(([to, l]) => <NavLink key={l} to={to} end className={({ isActive }) => isActive && !to.includes('?') ? 'text-primary' : 'hover:text-primary'}>{l}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? <><Link to="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link><button className="text-sm font-medium hover:text-primary" onClick={logout}>Logout</button></> : <>
            <Link to="/login" className="text-sm font-medium hover:text-primary">Login</Link>
            <Link to="/register" className="text-sm font-medium hover:text-primary">Register</Link></>}
          <Link to={user?.role === 'owner' ? '/dashboard/add' : '/register'} className="btn-primary">List Your Property</Link>
        </div>
        <button className="lg:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {[...links, ...(user ? [['/dashboard', 'Dashboard']] : [['/login', 'Login'], ['/register', 'Register']])].map(([to, l]) =>
              <Link key={l} to={to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium hover:bg-surface">{l}</Link>)}
            {user && <button onClick={() => { logout(); setOpen(false) }} className="rounded-lg px-3 py-2.5 text-left font-medium hover:bg-surface">Logout</button>}
            <Link to={user?.role === 'owner' ? '/dashboard/add' : '/register'} onClick={() => setOpen(false)} className="btn-primary mt-2">List Your Property</Link>
          </div>
        </div>
      )}
    </header>
  )
}
