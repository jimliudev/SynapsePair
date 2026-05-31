import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, Check, Loader, AlertCircle, Plus, Upload, X } from 'lucide-react'
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectModal, useSuiClient } from '@mysten/dapp-kit'
import { buildSubscribeTxV2, buildPublishSkillTx } from '../lib/sui'
import { storeBlob, getBlobUrl } from '../lib/walrus'
import { PACKAGE_ID, MODULE_NAME } from '../config'

const CATEGORIES = ['All', 'Coding', 'Writing', 'Analysis', 'Design', 'Research', 'Marketing']

function SkillCard({ skill, subscribed, onSubscribeSuccess, onUnsubscribe }) {
  const [hovered, setHovered] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [txError, setTxError] = useState(null)
  const account = useCurrentAccount()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()

  const handleSubscribe = () => {
    setTxError(null)

    // Not connected — prompt wallet connect
    if (!account) {
      setConnectOpen(true)
      return
    }

    // Contract not deployed yet — fall back to local state
    if (!PACKAGE_ID) {
      onSubscribeSuccess(skill.id, null)
      return
    }

    // price * 1_000_000 MIST per dollar (symbolic on testnet, e.g. $9 → 0.009 SUI)
    const priceInMist = skill.price * 1_000_000

    const tx = buildSubscribeTxV2(skill.id, skill.name, priceInMist)
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          onSubscribeSuccess(skill.id, result.digest)
        },
        onError: (err) => {
          console.error('Subscribe tx failed:', err)
          setTxError('Transaction failed. Check your wallet and try again.')
        },
      },
    )
  }

  const buttonLabel = () => {
    if (subscribed) return <><Check size={13} /> Subscribed</>
    if (isPending) return <><Loader size={13} className="spin" /> Confirm in wallet</>
    if (!account) return 'Connect & Subscribe'
    return 'Subscribe'
  }

  return (
    <>
      <ConnectModal open={connectOpen} onOpenChange={setConnectOpen} trigger={<span />} />
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
            onClick={subscribed ? () => onUnsubscribe(skill.id) : handleSubscribe}
            disabled={isPending}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              background: subscribed ? 'var(--off-white)' : isPending ? 'var(--mid-gray)' : 'var(--black)',
              color: subscribed ? 'var(--text-secondary)' : isPending ? 'var(--text-secondary)' : 'white',
              fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all var(--transition-fast)',
              border: subscribed ? '1px solid var(--light-gray)' : 'none',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}>
            {buttonLabel()}
          </button>
        </div>
      </div>
      {txError && (
        <div style={{
          marginTop: 10,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--danger)',
        }}>
          <AlertCircle size={12} />
          {txError}
        </div>
      )}
    </motion.div>
    </>
  )
}

export default function Marketplace() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [subscribed, setSubscribed] = useState(new Set())
  const [skills, setSkills] = useState([])
  const [loadingSkills, setLoadingSkills] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminForm, setAdminForm] = useState({ name: '', description: '', category: 'Coding', price: '', systemPrompt: '', tags: '', author: '', badge: '' })
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [connectOpen, setConnectOpen] = useState(false)
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  // Fetch SkillPublished events from chain, then load each Walrus blob for metadata
  useEffect(() => {
    if (!PACKAGE_ID) return
    setLoadingSkills(true)
    client
      .queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::SkillPublished` },
        limit: 50,
        order: 'descending',
      })
      .then(async ({ data }) => {
        const loaded = await Promise.all(
          data.map(async (e) => {
            const f = e.parsedJson
            const blobId = typeof f.blob_id === 'string' ? f.blob_id : ''
            if (!blobId) return null
            try {
              const res = await fetch(getBlobUrl(blobId))
              const meta = await res.json()
              return {
                id: Number(f.skill_id),
                price: Number(f.price) / 1_000_000,
                blobId,
                rating: 0, reviews: 0,
                ...meta,
              }
            } catch { return null }
          })
        )
        setSkills(prev => {
          const ids = new Set(prev.map(s => s.id))
          return [...prev, ...loaded.filter(s => s && !ids.has(s.id))]
        })
      })
      .catch(err => console.error('Failed to fetch skills:', err))
      .finally(() => setLoadingSkills(false))
  }, [PACKAGE_ID])

  const publishSkill = async () => {
    if (!adminForm.name || !adminForm.price) { setPublishError('Name and price are required'); return }
    if (!account) { setConnectOpen(true); return }
    setIsPublishing(true)
    setPublishError('')
    try {
      const skillId = Date.now() % 2147483647
      const priceInMist = Math.round(parseFloat(adminForm.price) * 1_000_000)
      const meta = {
        name: adminForm.name.trim(),
        description: adminForm.description.trim(),
        category: adminForm.category,
        systemPrompt: adminForm.systemPrompt.trim(),
        tags: adminForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        author: adminForm.author.trim() || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`,
        badge: adminForm.badge.trim() || null,
        rating: 0, reviews: 0,
      }
      const blobId = await storeBlob(meta)
      if (!PACKAGE_ID) {
        // No contract — save locally only
        setSkills(prev => [{ id: skillId, price: parseFloat(adminForm.price), blobId, ...meta }, ...prev])
        setShowAdminPanel(false)
        setAdminForm({ name: '', description: '', category: 'Coding', price: '', systemPrompt: '', tags: '', author: '', badge: '' })
        return
      }
      const tx = buildPublishSkillTx(skillId, priceInMist, blobId)
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.info(`Skill published: https://suiexplorer.com/txblock/${result.digest}?network=testnet`)
            setSkills(prev => [{ id: skillId, price: parseFloat(adminForm.price), blobId, ...meta }, ...prev])
            setShowAdminPanel(false)
            setAdminForm({ name: '', description: '', category: 'Coding', price: '', systemPrompt: '', tags: '', author: '', badge: '' })
          },
          onError: (err) => {
            console.error('Publish skill failed:', err)
            setPublishError('Transaction failed. Check your wallet and try again.')
          },
        }
      )
    } catch (err) {
      console.error('Publish skill error:', err)
      setPublishError(err.message)
    } finally {
      setIsPublishing(false)
    }
  }

  const filtered = skills.filter(s => {
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

  const handleSubscribeSuccess = (id, digest) => {
    setSubscribed(prev => new Set([...prev, id]))
    if (digest) console.info(`Subscription tx: https://suiexplorer.com/txblock/${digest}?network=testnet`)
  }

  const adminField = (label, key, placeholder, opts = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {opts.textarea
        ? <textarea
            rows={3}
            placeholder={placeholder}
            value={adminForm[key]}
            onChange={e => setAdminForm(p => ({ ...p, [key]: e.target.value }))}
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--light-gray)', fontSize: 13, color: 'var(--black)', resize: 'vertical', outline: 'none' }}
          />
        : <input
            placeholder={placeholder}
            value={adminForm[key]}
            onChange={e => setAdminForm(p => ({ ...p, [key]: e.target.value }))}
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--light-gray)', fontSize: 13, color: 'var(--black)', outline: 'none' }}
          />
      }
    </div>
  )

  return (
    <div style={{ paddingTop: 52 }}>
      <ConnectModal open={connectOpen} onOpenChange={setConnectOpen} trigger={<span />} />
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
              {filtered.length} skills available
              {account && (
                <button
                  onClick={() => setShowAdminPanel(v => !v)}
                  style={{
                    marginLeft: 16,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: showAdminPanel ? 'var(--black)' : 'var(--off-white)',
                    color: showAdminPanel ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--light-gray)',
                    fontSize: 12, fontWeight: 500,
                  }}>
                  <Plus size={12} /> Publish Skill
                </button>
              )}
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

        {/* Admin: Publish Skill panel */}
        {showAdminPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'var(--off-white)',
              border: '1px solid var(--light-gray)',
              borderRadius: 'var(--radius-xl)',
              padding: 24, marginBottom: 24, overflow: 'hidden',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)' }}>Publish New Skill</h3>
              <button onClick={() => setShowAdminPanel(false)} style={{ background: 'none', color: 'var(--text-tertiary)' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {adminField('Name *', 'name', 'e.g. Code Reviewer Pro')}
              {adminField('Price (SUI/mo) *', 'price', 'e.g. 9')}
              {adminField('Author', 'author', 'Your name or handle')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                <select
                  value={adminForm.category}
                  onChange={e => setAdminForm(p => ({ ...p, category: e.target.value }))}
                  style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--light-gray)', fontSize: 13, color: 'var(--black)', background: 'var(--white)', outline: 'none' }}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {adminField('Badge', 'badge', 'New / Popular / Featured (optional)')}
              {adminField('Tags', 'tags', 'comma-separated, e.g. code,review,typescript')}
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {adminField('Description', 'description', 'Short description shown in the card', { textarea: true })}
              {adminField('System Prompt', 'systemPrompt', 'Instructions the AI will follow when this skill is active', { textarea: true })}
            </div>
            {publishError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--danger)', marginTop: 10 }}>
                <AlertCircle size={12} /> {publishError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowAdminPanel(false)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13 }}>Cancel</button>
              <button
                onClick={publishSkill}
                disabled={isPublishing}
                style={{
                  padding: '8px 20px', borderRadius: 'var(--radius-pill)',
                  background: isPublishing ? 'var(--mid-gray)' : 'var(--black)',
                  color: 'white', fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                {isPublishing
                  ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Publishing...</>
                  : <><Upload size={13} /> Upload to Walrus &amp; Publish</>}
              </button>
            </div>
          </motion.div>
        )}
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
              onSubscribeSuccess={handleSubscribeSuccess}
              onUnsubscribe={toggleSubscribe}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-tertiary)' }}>
            {loadingSkills
              ? <><Loader size={24} style={{ marginBottom: 12, opacity: 0.4, animation: 'spin 1s linear infinite' }} /><p style={{ fontSize: 14 }}>Loading skills from chain...</p></>
              : search
                ? <p style={{ fontSize: 15 }}>No skills found for &ldquo;{search}&rdquo;</p>
                : <>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>No skills published yet</p>
                    <p style={{ fontSize: 13 }}>{account ? 'Click "Publish Skill" above to add the first one.' : 'Connect wallet and publish the first skill.'}</p>
                  </>
            }
          </div>
        )}
      </div>
    </div>
  )
}
