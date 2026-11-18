import { Link, useLocation } from 'react-router-dom'
import { Scale, X } from 'lucide-react'
import { useStore } from '../store.jsx'
export default function CompareBar() {
  const { compare, clearCompare } = useStore(), { pathname } = useLocation()
  if (!compare.length || pathname === '/compare') return null
  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-lift">
      <Scale size={18} /><span>{compare.length} selected</span>
      <Link to="/compare" className="btn-primary !py-1.5">{compare.length < 2 ? 'Compare (add 1 more)' : 'Compare now'}</Link>
      <button onClick={clearCompare} aria-label="Clear comparison"><X size={16} /></button>
    </div>)
}
