import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Zap, Users, Settings, ChevronDown, Bot, Plus, Paperclip, Sparkles } from 'lucide-react'

const ROOM_DATA = {
  'eng-frontend': {
    name: 'Frontend Engineering',
    skill: 'Code Reviewer Pro',
    color: '#0071e3',
    members: [
      { name: 'Alex', color: '#e8f0fd', tc: '#0055b3', online: true },
      { name: 'Sam', color: '#e3f9ea', tc: '#1a7f3c', online: true },
      { name: 'Jordan', color: '#fff8e6', tc: '#996300', online: true },
      { name: 'Taylor', color: '#f3ecff', tc: '#6e3ab8', online: false },
    ],
  },
  'content-team': {
    name: 'Content & Copy',
    skill: 'Growth Copywriter',
    color: '#30d158',
    members: [
      { name: 'Morgan', color: '#e8f0fd', tc: '#0055b3', online: true },
      { name: 'Casey', color: '#e3f9ea', tc: '#1a7f3c', online: true },
      { name: 'Riley', color: '#fff8e6', tc: '#996300', online: false },
    ],
  },
  'data-insights': {
    name: 'Data & Analytics',
    skill: 'Data Analyst',
    color: '#ff9f0a',
    members: [
      { name: 'Quinn', color: '#e8f0fd', tc: '#0055b3', online: true },
      { name: 'Avery', color: '#e3f9ea', tc: '#1a7f3c', online: false },
    ],
  },
}

const INITIAL_MESSAGES = {
  'eng-frontend': [
    { id: 1, role: 'user', user: 'Alex', content: 'Hey team, can we get a code review on this React component?', ts: '10:24 AM' },
    { id: 2, role: 'ai', content: "I've analyzed the component. Here are my findings:\n\n**Performance**: You're creating a new function inside the render loop. Move `handleClick` outside or use `useCallback`.\n\n**Accessibility**: The button is missing an `aria-label`. Screen readers won't know its purpose.\n\n**Code style**: Consider destructuring props at the top for readability.", ts: '10:24 AM' },
    { id: 3, role: 'user', user: 'Sam', content: 'Good catch on the useCallback. Alex, want me to fix the accessibility issue?', ts: '10:26 AM' },
    { id: 4, role: 'user', user: 'Alex', content: 'Yes please! Also asking about the TypeScript types while we\'re at it.', ts: '10:27 AM' },
    { id: 5, role: 'ai', content: "For the TypeScript types, I'd recommend:\n\n```typescript\ninterface ButtonProps {\n  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void\n  label: string\n  variant?: 'primary' | 'secondary' | 'ghost'\n  disabled?: boolean\n}\n```\n\nUsing discriminated unions for the `variant` prop gives you better type safety than a plain string.", ts: '10:27 AM' },
  ],
  'content-team': [
    { id: 1, role: 'user', user: 'Morgan', content: 'Working on the Q2 launch copy. Need help with the hero headline.', ts: '9:15 AM' },
    { id: 2, role: 'ai', content: "Here are 5 headline options for your Q2 launch:\n\n1. **Ship with confidence.** — Direct, trust-focused\n2. **The fastest way to ship AI.** — Speed-oriented\n3. **Intelligence, multiplied.** — Aspirational\n4. **AI that works with your team.** — Collaboration angle\n5. **Build AI products in days, not months.** — ROI-driven\n\nWhich direction resonates most with your audience?", ts: '9:15 AM' },
    { id: 3, role: 'user', user: 'Casey', content: 'I love #3. Can we explore that direction more?', ts: '9:18 AM' },
  ],
}

function Message({ msg }) {
  const isAI = msg.role === 'ai'
  const isUser = msg.role === 'user'

  const formatContent = (content) => {
    return content.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, (_, m) =>
        `<strong>${m}</strong>`)
      const codeLine = boldLine.replace(/`([^`]+)`/g, (_, m) =>
        `<code style="background:#f0f0f5;padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace">${m}</code>`)
      return <p key={i} style={{ margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: codeLine || '&nbsp;' }} />
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        gap: 12,
        padding: '8px 0',
        alignItems: 'flex-start',
      }}>
      {isAI ? (
        <div style={{
          width: 32, height: 32, flexShrink: 0,
          borderRadius: 10,
          background: 'var(--black)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 2,
        }}>
          <Sparkles size={14} color="white" />
        </div>
      ) : (
        <div style={{
          width: 32, height: 32, flexShrink: 0,
          borderRadius: '50%',
          background: '#e8f0fd',
          color: '#0055b3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, marginTop: 2,
        }}>{msg.user?.[0]}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: isAI ? 'var(--black)' : 'var(--black)',
          }}>
            {isAI ? 'AI Agent' : msg.user}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{msg.ts}</span>
        </div>
        <div style={{
          fontSize: 14, color: isAI ? 'var(--black)' : 'var(--text-secondary)',
          lineHeight: 1.6, fontWeight: isAI ? 400 : 300,
          background: isAI ? 'var(--off-white)' : 'transparent',
          borderRadius: isAI ? 'var(--radius-md)' : 0,
          padding: isAI ? '12px 14px' : 0,
          border: isAI ? '1px solid var(--light-gray)' : 'none',
        }}>
          {formatContent(msg.content)}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatRoom() {
  const { id } = useParams()
  const room = ROOM_DATA[id] || ROOM_DATA['eng-frontend']
  const roomName = room.name
  const [messages, setMessages] = useState(INITIAL_MESSAGES[id] || INITIAL_MESSAGES['eng-frontend'])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const AI_RESPONSES = [
    "I can help with that. Let me analyze this further.\n\nBased on the context you've provided, here are my recommendations:\n\n**Approach 1**: Start with the simplest solution that meets requirements.\n\n**Approach 2**: Consider long-term maintainability before optimizing.\n\nWhat would you like to explore first?",
    "Great question! Here's what I'd suggest:\n\nThe key insight is to break this down into smaller, testable pieces. Each piece should have a single responsibility.\n\nWant me to elaborate on any specific part?",
    "I've reviewed the context. A few things stand out:\n\n1. The current approach works but has room for optimization\n2. Consider edge cases for empty states and error conditions\n3. Adding types here would prevent runtime errors\n\nShall I show you a revised implementation?",
  ]

  const sendMessage = () => {
    if (!input.trim()) return
    const userMsg = {
      id: Date.now(),
      role: 'user',
      user: 'You',
      content: input.trim(),
      ts: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: AI_RESPONSES[messages.length % AI_RESPONSES.length],
        ts: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMsg])
    }, 1200 + Math.random() * 800)
  }

  return (
    <div style={{ paddingTop: 52, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Room header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 24px',
        borderBottom: '1px solid var(--light-gray)',
        background: 'var(--white)',
        flexShrink: 0,
      }}>
        <Link to="/chat" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32,
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-secondary)',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--off-white)'
          e.currentTarget.style.color = 'var(--black)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}>
          <ArrowLeft size={16} />
        </Link>

        <div style={{
          width: 32, height: 32,
          borderRadius: 'var(--radius-sm)',
          background: room.color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: room.color }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.1px', color: 'var(--black)' }}>{roomName}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, color: 'var(--text-tertiary)',
          }}>
            <Zap size={10} color={room.color} />
            {room.skill}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {room.members.filter(m => m.online).map(m => (
            <div key={m.name} style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: m.color,
              color: m.tc,
              fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {m.name[0]}
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--success)',
                border: '2px solid var(--white)',
              }} />
            </div>
          ))}
          <button
            onClick={() => setShowMembers(!showMembers)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--off-white)',
              color: 'var(--text-secondary)',
              fontSize: 12, fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}>
            <Users size={12} /> {room.members.length}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: 760, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 12, padding: '8px 0', alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: 10,
              background: 'var(--black)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={14} color="white" />
            </div>
            <div style={{
              background: 'var(--off-white)', border: '1px solid var(--light-gray)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-tertiary)' }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 24px 24px',
        borderTop: '1px solid var(--light-gray)',
        background: 'var(--white)',
        flexShrink: 0,
      }}>
        <div style={{
          maxWidth: 760, margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          background: 'var(--off-white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--light-gray)',
          padding: '10px 14px',
          transition: 'all var(--transition-fast)',
        }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = 'var(--mid-gray)'
          e.currentTarget.style.background = 'var(--white)'
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = 'var(--light-gray)'
          e.currentTarget.style.background = 'var(--off-white)'
          e.currentTarget.style.boxShadow = 'none'
        }}>
          <button style={{ color: 'var(--text-tertiary)', padding: 2, flexShrink: 0 }}>
            <Plus size={18} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Message the team and AI..."
            rows={1}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 14, color: 'var(--black)',
              lineHeight: 1.5, maxHeight: 120,
              overflowY: 'auto',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: input.trim() ? 'var(--black)' : 'var(--light-gray)',
              color: input.trim() ? 'white' : 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}>
            <Send size={14} />
          </button>
        </div>
        <p style={{
          textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)',
          marginTop: 8, fontWeight: 300,
        }}>
          Press ↵ to send · Shift+↵ for new line · All team members see this conversation
        </p>
      </div>
    </div>
  )
}
