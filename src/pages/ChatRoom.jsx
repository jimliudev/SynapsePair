import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Zap, Users, ChevronDown, Plus, Paperclip, Sparkles, Loader, AlertCircle, Archive, CheckCircle, UserPlus, X } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { io } from 'socket.io-client'
import { storeBlob, getBlobUrl } from '../lib/walrus'
import { AI_ENDPOINT, SOCKET_URL } from '../config'

// ─── AI helper ────────────────────────────────────────────────────────────────

/**
 * Stream a response from the AI endpoint.
 * API contract: POST { command } → 200 text/plain chunked stream.
 * onChunk is called incrementally as text arrives.
 */
async function streamAI(command, onChunk) {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  })

  if (!res.ok) throw new Error(`AI API error: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}


function Message({ msg, onSave }) {
  const isAI = msg.role === 'ai'
  const isError = msg.role === 'error'
  const [hovered, setHovered] = useState(false)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved
  const [savedUrl, setSavedUrl] = useState(null)
  const alreadySaved = !!msg.walrusBlobId

  const handleSave = async () => {
    if (saveState !== 'idle' || !onSave) return
    setSaveState('saving')
    try {
      const url = await onSave()
      setSavedUrl(url)
      setSaveState('saved')
      setTimeout(() => { setSaveState('idle'); setSavedUrl(null) }, 5000)
    } catch {
      setSaveState('idle')
    }
  }

  // Error message — inline system notice
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          margin: '4px 0',
          background: '#fff5f5',
          border: '1px solid #ffd6d6',
          borderRadius: 'var(--radius-md)',
          fontSize: 13, color: 'var(--danger)',
        }}>
        <AlertCircle size={13} />
        {msg.content}
      </motion.div>
    )
  }

  const formatContent = (content) => {
    // XSS-safe: escape HTML before injecting bold/code markup
    const escape = s => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return content.split('\n').map((line, i) => {
      const safe = escape(line)
      const withBold = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      const withCode = withBold.replace(/`([^`]+)`/g,
        '<code style="background:#f0f0f5;padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>')
      const withMention = withCode.replace(/@AI/gi,
        '<span style="color:#0071e3;background:#e8f4ff;padding:1px 5px;border-radius:4px;font-weight:600;font-size:13px">@AI</span>')
      return <p key={i} style={{ margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: withMention || '&nbsp;' }} />
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: 12,
        padding: '8px 6px',
        alignItems: 'flex-start',
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        background: hovered ? '#f0f7ff' : 'transparent',
        transition: 'background 0.15s',
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
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>
            {isAI ? 'AI Agent' : msg.user}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{msg.ts}</span>
        </div>
        {/* Attachment message */}
        {msg.attachment ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 14px',
            background: 'var(--off-white)',
            border: '1px solid var(--light-gray)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
          }}>
            <Paperclip size={13} color="var(--text-tertiary)" />
            <a
              href={msg.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 500 }}
            >
              {msg.attachment.name}
            </a>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>· Walrus testnet</span>
          </div>
        ) : (
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
        )}
        {/* Permanent Walrus badge — visible even when not hovering */}
        {alreadySaved && (
          <a
            href={getBlobUrl(msg.walrusBlobId)}
            target="_blank"
            rel="noopener noreferrer"
            title={`Saved on Walrus · ${msg.walrusBlobId.slice(0, 8)}…`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 10, color: '#1a7f3c',
              background: '#e3f9ea', border: '1px solid #b7efc5',
              borderRadius: 4, padding: '1px 5px',
              marginTop: 4, textDecoration: 'none',
              lineHeight: 1.4,
            }}
          >
            <CheckCircle size={9} />
            Walrus
          </a>
        )}
        {/* Hover save button */}
        {hovered && !isError && msg.content && (
          <div style={{
            position: 'absolute', top: 8, right: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {saveState === 'saved' && savedUrl && (
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 10, color: 'var(--accent)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {savedUrl.split('/').pop()}
              </a>
            )}
            <button
              onClick={handleSave}
              title={saveState === 'saved' ? 'Saved to Walrus' : 'Save to Walrus'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26,
                borderRadius: 'var(--radius-sm)',
                background: saveState === 'saved' ? '#e3f9ea' : 'var(--white)',
                border: `1px solid ${saveState === 'saved' ? '#b7efc5' : 'var(--light-gray)'}`,
                color: saveState === 'saved' ? '#1a7f3c' : 'var(--text-tertiary)',
                cursor: saveState === 'idle' ? 'pointer' : 'default',
                transition: 'all 0.15s',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              {saveState === 'saving'
                ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
                : saveState === 'saved'
                  ? <CheckCircle size={11} />
                  : <Archive size={11} />}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Strip the timestamp suffix added by create_room slug generation, then title-case
function slugToName(slug) {
  return (slug || '')
    .replace(/-[a-z0-9]{4,}$/, '')   // strip e.g. "-mpt5fai5"
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function ChatRoom() {
  const { id } = useParams()

  // Derive room metadata from URL slug — no hardcoded data
  const room = {
    name: slugToName(id) || 'Chat Room',
    skill: 'AI Assistant',
    color: '#0071e3',
    members: [],
  }

  // ─── localStorage persistence ─────────────────────────────────────────────
  const LS_KEY = `coral_msgs_${id}`
  const MEMBERS_KEY = `coral_members_${id}`

  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] }
    catch { return [] }
  })
  const [members, setMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(MEMBERS_KEY)) || [] }
    catch { return [] }
  })
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedUrl, setSavedUrl] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberInput, setMemberInput] = useState('')
  const [memberError, setMemberError] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const addMemberRef = useRef(null)
  const socketRef = useRef(null)
  const isSendingRef = useRef(false)
  const account = useCurrentAccount()

  // ─── Socket.io real-time sync ────────────────────────────────────────────────
  useEffect(() => {
    if (!SOCKET_URL) return

    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.emit('join-room', id)

    // Receive messages from other users in the same room
    socket.on('message', (msg) => {
      setMessages(prev => {
        // Deduplicate by id (in case of echo)
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      socket.off('message')
      socket.disconnect()
    }
  }, [id])

  // Auto-save every message update to localStorage
  useEffect(() => {
    if (messages.length > 0)
      localStorage.setItem(LS_KEY, JSON.stringify(messages))
  }, [messages])

  // Persist members to localStorage
  useEffect(() => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
  }, [members])

  // Close add-member popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (addMemberRef.current && !addMemberRef.current.contains(e.target))
        setShowAddMember(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─── Add member ────────────────────────────────────────────────────────

  const addMember = () => {
    const addr = memberInput.trim()
    if (!/^0x[0-9a-fA-F]{20,64}$/.test(addr)) {
      setMemberError('Invalid Sui address')
      return
    }
    if (members.find(m => m.address === addr)) {
      setMemberError('Already added')
      return
    }
    setMembers(prev => [...prev, { address: addr, addedAt: Date.now() }])
    setMemberInput('')
    setMemberError('')
    setShowAddMember(false)
  }

  const ts = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  // ─── Send message to AI ──────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!input.trim() || isTyping || isSendingRef.current) return
    isSendingRef.current = true

    const displayName = account
      ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
      : 'You'

    const userMsg = {
      id: Date.now(),
      role: 'user',
      user: displayName,
      content: input.trim(),
      ts: ts(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    isSendingRef.current = false  // release lock — input cleared, safe to send again

    // Broadcast to other users in the room
    socketRef.current?.emit('message', { roomId: id, msg: userMsg })

    // Only trigger AI when message starts with @AI
    const aiMatch = userMsg.content.match(/^@AI\s*/i)
    if (!aiMatch) return

    const command = userMsg.content.slice(aiMatch[0].length).trim()
    if (!command) return

    setIsTyping(true)

    if (!AI_ENDPOINT) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'error',
        content: 'AI endpoint not configured. Set VITE_AI_ENDPOINT in your .env file.',
        ts: ts(),
      }])
      setIsTyping(false)
      return
    }

    // Insert a live AI bubble — chunks stream into it
    const aiMsgId = Date.now() + 1
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '', ts: ts() }])

    try {
      let fullContent = ''
      await streamAI(command, chunk => {
        fullContent += chunk
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
        ))
      })
      // Streaming done — broadcast the complete AI reply to everyone else in the room
      const aiMsg = { id: aiMsgId, role: 'ai', content: fullContent, ts: ts() }
      socketRef.current?.emit('message', { roomId: id, msg: aiMsg })
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, role: 'error', content: `AI request failed: ${err.message}` }
          : m
      ))
    } finally {
      setIsTyping(false)
    }
  }

  // ─── Save full conversation to Walrus ────────────────────────────────────────

  const saveConversation = async () => {
    if (isSaving || messages.length === 0) return
    setIsSaving(true)
    setSavedUrl(null)
    try {
      const payload = { room: id, savedAt: new Date().toISOString(), messages }
      const blobId = await storeBlob(payload)
      const url = getBlobUrl(blobId)
      console.log('[Walrus] blobId:', blobId, '\nURL:', url)
      setSavedUrl(url)
      setTimeout(() => setSavedUrl(null), 8000)
    } catch (err) {
      console.error('Save to Walrus failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Upload file to Walrus testnet ────────────────────────────────────────────

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploadError(null)
    setIsUploading(true)

    try {
      const blobId = await storeBlob(file)
      const url = getBlobUrl(blobId)

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'user',
        user: account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'You',
        content: '',
        attachment: { name: file.name, url, blobId },
        ts: ts(),
      }])
    } catch (err) {
      console.error('Walrus upload failed:', err)
      setUploadError('Upload failed. Walrus testnet may be temporarily unavailable.')
      setTimeout(() => setUploadError(null), 4000)
    } finally {
      setIsUploading(false)
    }
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
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.1px', color: 'var(--black)' }}>{room.name}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, color: 'var(--text-tertiary)',
          }}>
            <Zap size={10} color={room.color} />
            {room.skill}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Member avatars (max 3) */}
          {members.slice(0, 3).map((m, i) => {
            const colors = ['#e8f0fd','#e3f9ea','#fff8e6','#f3ecff','#fce8e8']
            const tcs    = ['#0055b3','#1a7f3c','#996300','#6e3ab8','#c0392b']
            const label  = m.address.slice(2, 4).toUpperCase()
            return (
              <div key={m.address} title={m.address} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: colors[i % colors.length],
                color: tcs[i % tcs.length],
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--white)',
                marginLeft: i > 0 ? -6 : 0,
                cursor: 'default',
              }}>{label}</div>
            )
          })}

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
            <Users size={12} /> {members.length}
          </button>

          {/* Add member popover */}
          <div ref={addMemberRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowAddMember(v => !v); setMemberInput(''); setMemberError('') }}
              title="Add member"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28,
                borderRadius: '50%',
                background: showAddMember ? 'var(--black)' : 'var(--off-white)',
                color: showAddMember ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--light-gray)',
                transition: 'all var(--transition-fast)',
              }}>
              <UserPlus size={13} />
            </button>

            {showAddMember && (
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
                  padding: '14px',
                  width: 300,
                  zIndex: 2000,
                }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)', marginBottom: 10 }}>Add Member</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    autoFocus
                    placeholder="0x..."
                    value={memberInput}
                    onChange={e => { setMemberInput(e.target.value); setMemberError('') }}
                    onKeyDown={e => e.key === 'Enter' && addMember()}
                    style={{
                      flex: 1, padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${memberError ? 'var(--danger)' : 'var(--light-gray)'}`,
                      fontSize: 12, color: 'var(--black)', outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    onClick={addMember}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--black)', color: 'white',
                      fontSize: 12, fontWeight: 500,
                    }}>Add</button>
                </div>
                {memberError && (
                  <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={11} /> {memberError}
                  </div>
                )}
                {members.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {members.map(m => (
                      <div key={m.address} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {m.address.slice(0, 10)}...{m.address.slice(-6)}
                        </span>
                        <button
                          onClick={() => setMembers(prev => prev.filter(x => x.address !== m.address))}
                          style={{ background: 'none', color: 'var(--text-tertiary)', padding: 2 }}>
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Save conversation to Walrus */}
          <button
            onClick={saveConversation}
            disabled={isSaving || messages.length === 0}
            title="Save conversation to Walrus"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              background: savedUrl ? '#e3f9ea' : 'var(--off-white)',
              color: savedUrl ? '#1a7f3c' : isSaving ? 'var(--text-tertiary)' : 'var(--text-secondary)',
              border: `1px solid ${savedUrl ? '#b7efc5' : 'var(--light-gray)'}`,
              fontSize: 12, fontWeight: 500,
              cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}>
            {isSaving
              ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
              : savedUrl
                ? <><CheckCircle size={12} /> Saved</>  
                : <><Archive size={12} /> Save</>}
          </button>
          {savedUrl && (
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: 'var(--accent)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {savedUrl.split('/').pop()}
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: 760, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {messages.map(msg => (
          <Message
            key={msg.id}
            msg={msg}
            onSave={async () => {
              const blobId = await storeBlob({ ...msg, room: id, savedAt: new Date().toISOString() })
              // 永久標記：把 blobId 回寫到訊息，localStorage 自動同步
              setMessages(prev => prev.map(m =>
                m.id === msg.id ? { ...m, walrusBlobId: blobId } : m
              ))
              return getBlobUrl(blobId)
            }}
          />
        ))}
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
        {uploadError && (
          <div style={{
            maxWidth: 760, margin: '0 auto 8px',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--danger)',
          }}>
            <AlertCircle size={12} />
            {uploadError}
          </div>
        )}
        {/* Hidden file input for Walrus upload */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Attach file (stored on Walrus testnet)"
            style={{ color: isUploading ? 'var(--accent)' : 'var(--text-tertiary)', padding: 2, flexShrink: 0, transition: 'color var(--transition-fast)' }}>
            {isUploading ? <Loader size={18} /> : <Plus size={18} />}
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
