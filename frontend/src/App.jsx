import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import DetailsPage from './pages/DetailsPage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import CompareBar from './components/CompareBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { About, Contact } from './pages/InfoPages.jsx'
import { Login, Register, Forgot } from './pages/AuthPages.jsx'
export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pgs" element={<SearchPage />} />
          <Route path="/pgs/:id" element={<DetailsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="*" element={<div className="container-x py-32 text-center"><h1 className="text-3xl font-extrabold">Page not found</h1></div>} />
        </Routes>
      </main>
      <Footer />
      <CompareBar />
    </>
  )
}
