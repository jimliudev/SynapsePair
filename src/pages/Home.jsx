import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Users, ShoppingBag, Star, ChevronRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }
  })
}

const FEATURES = [
  {
    icon: ShoppingBag,
    title: 'Skills Marketplace',
    desc: 'Discover and subscribe to curated AI prompt skills built by experts. From coding to creative writing — find the perfect skill for your workflow.',
    color: '#0071e3',
    bg: '#e8f0fd',
    link: '/marketplace',
  },
  {
    icon: Users,
    title: 'Multiplayer AI',
    desc: 'Collaborate with your team inside shared AI chat rooms. Control agents together, share context, and ship faster with collective intelligence.',
    color: '#30d158',
    bg: '#e3f9ea',
    link: '/chat',
  },
]

const STATS = [
  { value: '2,400+', label: 'Skills available' },
  { value: '18k', label: 'Active users' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '< 80ms', label: 'Avg. latency' },
]

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const heroRef = useRef(null)

  useEffect(() => {
    const handleMove = (e) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div style={{ paddingTop: 52 }}>
      {/* Hero */}
      <section
        ref={heroRef}
        style={{
          minHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background mesh */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 80% 60% at ${mousePos.x * 100}% ${mousePos.y * 100}%,
            rgba(0,113,227,0.06) 0%, transparent 60%)`,
          transition: 'background 0.3s ease',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(48,209,88,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0,113,227,0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px 6px 8px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--off-white)',
            border: '1px solid var(--light-gray)',
            fontSize: 13, color: 'var(--text-secondary)',
            fontWeight: 500, marginBottom: 32,
          }}>
          <span style={{
            background: 'var(--accent)', color: 'white',
            borderRadius: 'var(--radius-pill)', padding: '2px 8px',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.3px',
          }}>NEW</span>
          Multiplayer AI rooms now available
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 400,
            color: 'var(--black)',
            textAlign: 'center',
            lineHeight: 1.0,
            letterSpacing: '-2px',
            maxWidth: 800,
            marginBottom: 12,
          }}>
          Intelligence,
          <br />
          <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>multiplied.</span>
        </motion.h1>

        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: 540,
            lineHeight: 1.6,
            marginBottom: 44,
            fontWeight: 300,
          }}>
          Subscribe to expert AI skills. Collaborate with your team in shared AI rooms. Build faster with collective intelligence.
        </motion.p>

        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/marketplace" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--black)',
            color: 'white',
            fontSize: 16, fontWeight: 500,
            letterSpacing: '-0.2px',
            boxShadow: 'var(--shadow-md)',
            transition: 'all var(--transition-base)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#3a3a3c'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--black)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-md)'
          }}>
            Browse Marketplace <ArrowRight size={16} />
          </Link>
          <Link to="/chat" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--white)',
            color: 'var(--black)',
            fontSize: 16, fontWeight: 500,
            letterSpacing: '-0.2px',
            border: '1px solid var(--light-gray)',
            transition: 'all var(--transition-base)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--off-white)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--white)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
            Open Chat Rooms
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={5}
          style={{
            display: 'flex', gap: 0,
            marginTop: 72,
            borderTop: '1px solid var(--light-gray)',
            paddingTop: 40,
            width: '100%', maxWidth: 640,
            justifyContent: 'space-between',
          }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28, fontWeight: 400,
                color: 'var(--black)', lineHeight: 1,
                letterSpacing: '-0.5px', marginBottom: 4,
              }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 400 }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{
        padding: '80px 24px',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '1px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}>
            Platform
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 400,
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            color: 'var(--black)',
          }}>Everything you need.</h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map(({ icon: Icon, title, desc, color, bg, link }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={link} style={{
                display: 'block',
                padding: '40px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--off-white)',
                border: '1px solid var(--light-gray)',
                transition: 'all var(--transition-base)',
                height: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                e.currentTarget.style.background = 'var(--white)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = 'var(--off-white)'
              }}>
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 28,
                }}>
                  <Icon size={22} color={color} strokeWidth={1.8} />
                </div>
                <h3 style={{
                  fontSize: 22, fontWeight: 600,
                  letterSpacing: '-0.4px', marginBottom: 12,
                  color: 'var(--black)',
                }}>{title}</h3>
                <p style={{
                  fontSize: 15, color: 'var(--text-secondary)',
                  lineHeight: 1.6, fontWeight: 300, marginBottom: 28,
                }}>{desc}</p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 14, fontWeight: 500, color: color,
                }}>
                  Learn more <ChevronRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px 120px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          style={{
            maxWidth: 720,
            width: '100%',
            background: 'var(--black)',
            borderRadius: 32,
            padding: '64px 60px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,113,227,0.2) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 400,
            color: 'white',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Start building<br />
            <span style={{ opacity: 0.5, fontStyle: 'italic' }}>together.</span>
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.5)',
            fontWeight: 300, marginBottom: 36, lineHeight: 1.6,
          }}>
            Join thousands of teams using Coral to ship AI-powered products faster.
          </p>
          <Link to="/marketplace" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px',
            borderRadius: 'var(--radius-pill)',
            background: 'white',
            color: 'var(--black)',
            fontSize: 16, fontWeight: 500,
            letterSpacing: '-0.2px',
            transition: 'all var(--transition-base)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            Get started free <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
