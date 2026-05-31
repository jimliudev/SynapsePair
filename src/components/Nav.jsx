import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'

const links = [
  // { to: '/marketplace', label: 'Marketplace' },
  { to: '/chat', label: 'Chat Rooms' },
]

// ─── Wallet button ─────────────────────────────────────────────────────────────

function WalletButton() {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const [connectOpen, setConnectOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const copyAddress = () => {
    navigator.clipboard.writeText(account.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (account) {
    const short = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    return (
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            marginLeft: 8,
            padding: '7px 14px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--off-white)',
            color: 'var(--black)',
            fontSize: 13, fontWeight: 500,
            border: '1px solid var(--light-gray)',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--mid-gray)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--light-gray)'}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--success)', flexShrink: 0,
          }} />
          {short}
        </button>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--white)',
              border: '1px solid var(--light-gray)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              minWidth: 200,
              overflow: 'hidden',
              zIndex: 2000,
            }}>
            <div style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--light-gray)',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>Connected wallet</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {account.address.slice(0, 16)}...
              </p>
            </div>
            <button
              onClick={copyAddress}
              style={{
                width: '100%', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: 'var(--text-secondary)',
                transition: 'background var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy address'}
            </button>
            <button
              onClick={() => { disconnect(); setMenuOpen(false) }}
              style={{
                width: '100%', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: 'var(--danger)',
                transition: 'background var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={13} />
              Disconnect
            </button>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <ConnectModal
      trigger={
        <button
          style={{
            marginLeft: 8,
            padding: '7px 18px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--black)',
            color: 'white',
            fontSize: 14, fontWeight: 500,
            letterSpacing: '-0.1px',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#3a3a3c'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
        >
          <Wallet size={14} />
          Sign in
        </button>
      }
      open={connectOpen}
      onOpenChange={setConnectOpen}
    />
  )
}

// ─── Nav ───────────────────────────────────────────────────────────────────────

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            }}>Coral</span>
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
            <WalletButton />
          </div>
        </div>
      </nav>
    </>
  )
}
