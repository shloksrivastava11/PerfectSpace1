import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone } from 'lucide-react'
export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-slate-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-white">PerfectSpace</h3>
          <p className="mt-3 text-sm leading-relaxed">Verified PGs and hostels for students and working professionals. Find Your Perfect Space. Feel at Home.</p>
          <div className="mt-4 flex gap-3">{[Facebook, Instagram, Twitter, Linkedin].map((I, i) => <a key={i} href="#" aria-label="Social link" className="rounded-lg bg-white/10 p-2 hover:bg-primary"><I size={16} /></a>)}</div>
        </div>
        <div><h4 className="mb-3 font-semibold text-white">Quick links</h4><ul className="space-y-2 text-sm">
          {[['/pgs','Find PGs'],['/pgs?type=Hostel','Hostels'],['/about','About'],['/contact','Contact'],['/register','List your property']].map(([t,l]) => <li key={l}><Link to={t} className="hover:text-white">{l}</Link></li>)}</ul></div>
        <div><h4 className="mb-3 font-semibold text-white">Popular locations</h4><ul className="space-y-2 text-sm">
          {['Noida','Delhi','Ghaziabad','Greater Noida','Gurugram','Bangalore'].map((c) => <li key={c}><Link to={`/pgs?city=${c}`} className="hover:text-white">{c}</Link></li>)}</ul></div>
        <div><h4 className="mb-3 font-semibold text-white">Contact</h4><ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><Mail size={14} /> hello@perfectspace.in</li><li className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</li></ul></div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} PerfectSpace. <a href="#" className="hover:text-white">Privacy Policy</a> · <a href="#" className="hover:text-white">Terms &amp; Conditions</a></div>
    </footer>
  )
}
