import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/chat', label: 'Chat Rooms' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        transition: 'all var(--transition-base)',
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28,
              background: 'var(--black)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="4" cy="7" r="2.5" fill="white" />
                <circle cx="10" cy="4" r="1.8" fill="white" opacity="0.7" />
                <circle cx="10" cy="10" r="1.8" fill="white" opacity="0.7" />
                <line x1="6.4" y1="6" x2="8.4" y2="4.8" stroke="white" strokeWidth="0.8" opacity="0.5" />
                <line x1="6.4" y1="8" x2="8.4" y2="9.2" stroke="white" strokeWidth="0.8" opacity="0.5" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--black)',
              letterSpacing: '-0.3px',
            }}>Synapse</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {links.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 14,
                fontWeight: 500,
                color: location.pathname.startsWith(to) ? 'var(--black)' : 'var(--text-secondary)',
                background: location.pathname.startsWith(to) ? 'var(--off-white)' : 'transparent',
                transition: 'all var(--transition-fast)',
                letterSpacing: '-0.1px',
              }}
              onMouseEnter={e => {
                if (!location.pathname.startsWith(to)) {
                  e.currentTarget.style.color = 'var(--black)'
                  e.currentTarget.style.background = 'var(--off-white)'
                }
              }}
              onMouseLeave={e => {
                if (!location.pathname.startsWith(to)) {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}>
                {label}
              </Link>
            ))}
            <button style={{
              marginLeft: 8,
              padding: '7px 18px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--black)',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '-0.1px',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#3a3a3c'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}>
              Sign in
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
