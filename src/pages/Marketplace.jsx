import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, Zap, Check, ChevronDown } from 'lucide-react'

const CATEGORIES = ['All', 'Coding', 'Writing', 'Analysis', 'Design', 'Research', 'Marketing']

const SKILLS = [
  {
    id: 1, name: 'Code Reviewer Pro', category: 'Coding',
    author: 'devtools.ai', rating: 4.9, reviews: 1204,
    price: 9, desc: 'Deep code review with security analysis, best practices, and refactoring suggestions for any language.',
    tags: ['TypeScript', 'Python', 'Rust'], featured: true, badge: 'Popular',
  },
  {
    id: 2, name: 'Technical Writer', category: 'Writing',
    author: 'docscraft', rating: 4.8, reviews: 876,
    price: 7, desc: 'Transform complex technical concepts into clear, engaging documentation that developers love.',
    tags: ['API Docs', 'Guides', 'READMEs'], featured: false, badge: null,
  },
  {
    id: 3, name: 'Data Analyst', category: 'Analysis',
    author: 'insight.ai', rating: 4.7, reviews: 643,
    price: 12, desc: 'Analyze datasets, generate insights, write SQL queries, and create visualization specifications.',
    tags: ['SQL', 'Python', 'Charts'], featured: true, badge: 'New',
  },
  {
    id: 4, name: 'UI Critic', category: 'Design',
    author: 'ux.studio', rating: 4.9, reviews: 512,
    price: 10, desc: 'Expert UI/UX feedback on your designs with actionable improvements and accessibility checks.',
    tags: ['Figma', 'Web', 'Mobile'], featured: false, badge: null,
  },
  {
    id: 5, name: 'Market Researcher', category: 'Research',
    author: 'alpha.signal', rating: 4.6, reviews: 389,
    price: 14, desc: 'Comprehensive market analysis, competitor research, and trend identification for your industry.',
    tags: ['TAM/SAM', 'Trends', 'Reports'], featured: false, badge: null,
  },
  {
    id: 6, name: 'Growth Copywriter', category: 'Marketing',
    author: 'convert.ai', rating: 4.8, reviews: 721,
    price: 8, desc: 'High-converting copy for landing pages, emails, and ads powered by proven growth frameworks.',
    tags: ['Landing Pages', 'Email', 'Ads'], featured: true, badge: 'Top Rated',
  },
]

function SkillCard({ skill, subscribed, onSubscribe }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${hovered ? 'var(--mid-gray)' : 'var(--light-gray)'}`,
        padding: '28px',
        display: 'flex', flexDirection: 'column',
        gap: 0,
        transition: 'all var(--transition-base)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        cursor: 'default',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'var(--off-white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {['💡','✍️','📊','🎨','🔬','📣'][skill.id - 1]}
        </div>
        {skill.badge && (
          <span style={{
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            background: skill.badge === 'New' ? '#e3f9ea' : skill.badge === 'Popular' ? '#e8f0fd' : '#fff8e6',
            color: skill.badge === 'New' ? '#1a7f3c' : skill.badge === 'Popular' ? '#0055b3' : '#996300',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.2px',
          }}>
            {skill.badge}
          </span>
        )}
      </div>

      <h3 style={{
        fontSize: 16, fontWeight: 600,
        letterSpacing: '-0.2px', color: 'var(--black)',
        marginBottom: 4,
      }}>{skill.name}</h3>
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>by {skill.author}</p>
      <p style={{
        fontSize: 13, color: 'var(--text-secondary)',
        lineHeight: 1.55, fontWeight: 300,
        marginBottom: 16, flex: 1,
      }}>{skill.desc}</p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {skill.tags.map(tag => (
          <span key={tag} style={{
            padding: '3px 9px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--off-white)',
            color: 'var(--text-secondary)',
            fontSize: 11, fontWeight: 500,
          }}>{tag}</span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star size={12} fill="#ff9f0a" color="#ff9f0a" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>{skill.rating}</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>({skill.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--black)' }}>
            ${skill.price}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-tertiary)' }}>/mo</span>
          </span>
          <button
            onClick={() => onSubscribe(skill.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              background: subscribed ? 'var(--off-white)' : 'var(--black)',
              color: subscribed ? 'var(--text-secondary)' : 'white',
              fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all var(--transition-fast)',
              border: subscribed ? '1px solid var(--light-gray)' : 'none',
            }}>
            {subscribed ? <><Check size={13} /> Subscribed</> : 'Subscribe'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Marketplace() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [subscribed, setSubscribed] = useState(new Set())
  const [sort, setSort] = useState('Popular')

  const filtered = SKILLS.filter(s => {
    const matchCat = category === 'All' || s.category === category
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const toggleSubscribe = (id) => {
    setSubscribed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={{ paddingTop: 52 }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--light-gray)',
        background: 'var(--white)',
        position: 'sticky', top: 52, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40, fontWeight: 400,
              letterSpacing: '-1.2px', marginBottom: 4,
              color: 'var(--black)',
            }}>Skills Marketplace</h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 300, marginBottom: 20 }}>
              {subscribed.size > 0 && <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                color: 'var(--accent)', fontWeight: 500, marginRight: 6,
              }}><Check size={13} /> {subscribed.size} subscribed ·</span>}
              {SKILLS.length} skills available
            </p>
          </motion.div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 0 }}>
            {/* Search */}
            <div style={{
              flex: 1, maxWidth: 320,
              position: 'relative',
            }}>
              <Search size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)', pointerEvents: 'none',
              }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search skills..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--light-gray)',
                  background: 'var(--off-white)',
                  fontSize: 14, color: 'var(--black)',
                  outline: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onFocus={e => {
                  e.target.style.background = 'var(--white)'
                  e.target.style.borderColor = 'var(--accent)'
                  e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'
                }}
                onBlur={e => {
                  e.target.style.background = 'var(--off-white)'
                  e.target.style.borderColor = 'var(--light-gray)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    background: category === cat ? 'var(--black)' : 'transparent',
                    color: category === cat ? 'white' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 500,
                    border: '1px solid',
                    borderColor: category === cat ? 'var(--black)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tab underline */}
          <div style={{ height: 1, background: 'transparent', marginTop: 16 }} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {filtered.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              subscribed={subscribed.has(skill.id)}
              onSubscribe={toggleSubscribe}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15 }}>No skills found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
