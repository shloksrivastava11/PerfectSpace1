import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from './api.js'
const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null)
  const [saved, setSaved] = useState([])
  const [toast, setToast] = useState(null)
  const [compare, setCompare] = useState(() => { try { return JSON.parse(localStorage.getItem('ps_compare')) || [] } catch { return [] } })
  const [ready, setReady] = useState(!localStorage.getItem('ps_token'))
  useEffect(() => { localStorage.setItem('ps_compare', JSON.stringify(compare)) }, [compare])
  const notify = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }, [])

  const loadSaved = () => api('/wishlist').then((d) => setSaved(d.properties.map((p) => p.id))).catch(() => {})
  useEffect(() => { // restore session
    if (!localStorage.getItem('ps_token')) return
    api('/auth/me').then((d) => { setUser(d.user); loadSaved() }).catch(() => localStorage.removeItem('ps_token')).finally(() => setReady(true))
  }, [])

  const start = ({ token, user }) => { localStorage.setItem('ps_token', token); setUser(user); loadSaved(); return user }
  const login = async (email, password) => start(await api('/auth/login', { method: 'POST', body: { email, password } }))
  const register = async (f) => start(await api('/auth/register', { method: 'POST', body: f }))
  const logout = () => { localStorage.removeItem('ps_token'); setUser(null); setSaved([]) }

  const toggleCompare = (id) => {
    if (!compare.includes(id) && compare.length >= 3) return notify('You can compare up to 3 properties')
    setCompare(compare.includes(id) ? compare.filter((x) => x !== id) : [...compare, id])
  }
  const toggleSave = async (id) => {
    if (!user) return notify('Please log in to save properties')
    const has = saved.includes(id)
    setSaved(has ? saved.filter((x) => x !== id) : [...saved, id]) // optimistic
    try { await api('/wishlist/' + id, { method: has ? 'DELETE' : 'POST' }); notify(has ? 'Removed from saved' : 'Saved to your list') }
    catch (e) { setSaved(saved); notify(e.message) }
  }
  return (
    <Ctx.Provider value={{ user, setUser, ready, compare, toggleCompare, clearCompare: () => setCompare([]), saved, toggleSave, login, register, logout, notify }}>
      {children}
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white shadow-lift">{toast}</div>}
    </Ctx.Provider>
  )
}
