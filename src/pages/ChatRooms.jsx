import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Users, Zap, Lock, Globe, MessageCircle, ChevronRight, Loader, AlertCircle } from 'lucide-react'
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectModal, useSuiClient } from '@mysten/dapp-kit'
import { buildCreateRoomTx } from '../lib/sui'
import { PACKAGE_ID, MODULE_NAME } from '../config'

const LS_KEY = 'coral_rooms'

function slugToName(slug) {
  return (slug || '')
    .replace(/-[a-z0-9]{4,}$/, '')
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function loadLocalRooms() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') }
  catch { return [] }
}

function saveLocalRoom(room) {
  const existing = loadLocalRooms()
  if (existing.find(r => r.id === room.id)) return
  localStorage.setItem(LS_KEY, JSON.stringify([room, ...existing]))
}

function AvatarStack({ members, online, max = 3 }) {
  const colors = ['#e8f0fd', '#e3f9ea', '#fff8e6', '#f3ecff', '#fce8e8']
  const textColors = ['#0055b3', '#1a7f3c', '#996300', '#6e3ab8', '#c0392b']
  const shown = members.slice(0, max)
  const extra = members.length - max

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex' }}>
        {shown.map((m, i) => (
          <div key={m} style={{
            width: 26, height: 26,
            borderRadius: '50%',
            background: colors[i % colors.length],
            color: textColors[i % textColors.length],
            fontSize: 10, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--white)',
            marginLeft: i > 0 ? -8 : 0,
            zIndex: shown.length - i,
          }}>
            {m[0]}
          </div>
        ))}
        {extra > 0 && (
          <div style={{
            width: 26, height: 26,
            borderRadius: '50%',
            background: 'var(--off-white)',
            color: 'var(--text-secondary)',
            fontSize: 9, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--white)',
            marginLeft: -8,
          }}>+{extra}</div>
        )}
      </div>
      {online > 0 && (
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6,
            borderRadius: '50%', background: 'var(--success)',
            marginRight: 4,
          }} />
          {online} online
        </span>
      )}
    </div>
  )
}

function RoomCard({ room }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
    >
      <Link
        to={`/chat/${room.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', flexDirection: 'column',
          padding: '24px 28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--white)',
          border: `1px solid ${hovered ? 'var(--mid-gray)' : 'var(--light-gray)'}`,
          transition: 'all var(--transition-base)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 'var(--radius-md)',
              background: room.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageCircle size={18} color={room.color} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--black)' }}>
                  {room.name}
                </h3>
                {room.type === 'private' ? (
                  <Lock size={11} color="var(--text-tertiary)" />
                ) : (
                  <Globe size={11} color="var(--text-tertiary)" />
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                {room.lastActive}
              </div>
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--off-white)',
            fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500,
          }}>
            <Zap size={10} color={room.color} />
            {room.skill}
          </div>
        </div>

        <p style={{
          fontSize: 13, color: 'var(--text-secondary)',
          lineHeight: 1.55, fontWeight: 300,
          marginBottom: 16,
        }}>{room.description}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <AvatarStack members={room.members} online={room.online} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              <MessageCircle size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {room.messages}
            </span>
            <ChevronRight size={14} color={hovered ? 'var(--black)' : 'var(--text-tertiary)'} style={{ transition: 'color var(--transition-fast)' }} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ChatRooms() {
  const [showCreate, setShowCreate] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', desc: '' })
  const [connectOpen, setConnectOpen] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [rooms, setRooms] = useState(loadLocalRooms)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const navigate = useNavigate()
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { mutate: signAndExecute, isPending: isCreating } = useSignAndExecuteTransaction()

  // Merge on-chain RoomCreated events into the list
  useEffect(() => {
    if (!PACKAGE_ID) return
    setLoadingRooms(true)
    client
      .queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::RoomCreated` },
        limit: 50,
        order: 'descending',
      })
      .then(({ data }) => {
        const onChain = data.map(e => {
          const f = e.parsedJson
          const slug = typeof f.slug === 'string' ? f.slug : ''
          return {
            id: slug,
            name: slugToName(slug),
            slug,
            description: '',
            skill: 'AI Assistant',
            color: '#0071e3',
            type: 'public',
            members: [],
            online: 0,
            messages: 0,
            lastActive: 'On-chain',
          }
        }).filter(r => r.id)
        setRooms(prev => {
          const ids = new Set(prev.map(r => r.id))
          const merged = [...prev, ...onChain.filter(r => !ids.has(r.id))]
          return merged
        })
      })
      .catch(err => console.error('Failed to fetch rooms from chain:', err))
      .finally(() => setLoadingRooms(false))
  }, [PACKAGE_ID])

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) return
    setCreateError(null)

    const slug = newRoom.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

    const roomObj = {
      id: slug,
      name: newRoom.name.trim(),
      slug,
      description: newRoom.desc.trim(),
      skill: 'AI Assistant',
      color: '#0071e3',
      type: 'public',
      members: [],
      online: 0,
      messages: 0,
      lastActive: 'Just now',
    }

    // No wallet — save locally and navigate
    if (!account) {
      saveLocalRoom(roomObj)
      setRooms(prev => [roomObj, ...prev])
      setShowCreate(false)
      setNewRoom({ name: '', desc: '' })
      navigate(`/chat/${slug}`)
      return
    }

    // Contract not deployed — save locally and navigate
    if (!PACKAGE_ID) {
      saveLocalRoom(roomObj)
      setRooms(prev => [roomObj, ...prev])
      setShowCreate(false)
      setNewRoom({ name: '', desc: '' })
      navigate(`/chat/${slug}`)
      return
    }

    const tx = buildCreateRoomTx(newRoom.name, slug, true)
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          console.info(`Room created: https://suiexplorer.com/txblock/${result.digest}?network=testnet`)
          saveLocalRoom(roomObj)
          setRooms(prev => [roomObj, ...prev])
          setShowCreate(false)
          setNewRoom({ name: '', desc: '' })
          navigate(`/chat/${slug}`)
        },
        onError: (err) => {
          console.error('Create room tx failed:', err)
          setCreateError('Transaction failed. Please try again.')
        },
      },
    )
  }

  return (
    <div style={{ paddingTop: 52 }}>
      <ConnectModal open={connectOpen} onOpenChange={setConnectOpen} trigger={<span />} />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.8px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Chat Rooms
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40, fontWeight: 400,
              letterSpacing: '-1.2px', color: 'var(--black)',
              lineHeight: 1,
            }}>
              Multiplayer AI
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-pill)',
              background: showCreate ? 'var(--off-white)' : 'var(--black)',
              color: showCreate ? 'var(--black)' : 'white',
              fontSize: 14, fontWeight: 500,
              border: showCreate ? '1px solid var(--light-gray)' : 'none',
              transition: 'all var(--transition-base)',
            }}>
            <Plus size={16} />
            New Room
          </button>
        </motion.div>

        {/* Create room panel */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'var(--off-white)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--light-gray)',
              padding: '28px',
              overflow: 'hidden',
            }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--black)' }}>Create a new room</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                placeholder="Room name"
                value={newRoom.name}
                onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--light-gray)',
                  background: 'var(--white)',
                  fontSize: 14, color: 'var(--black)', outline: 'none',
                }}
              />
              <input
                placeholder="Description (optional)"
                value={newRoom.desc}
                onChange={e => setNewRoom(p => ({ ...p, desc: e.target.value }))}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--light-gray)',
                  background: 'var(--white)',
                  fontSize: 14, color: 'var(--black)', outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                {createError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--danger)' }}>
                    <AlertCircle size={12} />
                    {createError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setShowCreate(false); setCreateError(null) }}
                    style={{
                      padding: '9px 18px', borderRadius: 'var(--radius-pill)',
                      background: 'transparent', color: 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 500,
                    }}>Cancel</button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={!newRoom.name || isCreating}
                    style={{
                      padding: '9px 18px', borderRadius: 'var(--radius-pill)',
                      background: newRoom.name && !isCreating ? 'var(--black)' : 'var(--mid-gray)',
                      color: 'white',
                      fontSize: 13, fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all var(--transition-fast)',
                      cursor: !newRoom.name || isCreating ? 'not-allowed' : 'pointer',
                    }}>
                    {isCreating ? <><Loader size={13} /> Creating...</> : account ? 'Create Room' : 'Connect & Create'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loadingRooms && rooms.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-tertiary)' }}>
              <Loader size={20} style={{ marginBottom: 8, opacity: 0.4, animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 13 }}>Loading rooms...</p>
            </div>
          )}
          {!loadingRooms && rooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                textAlign: 'center', padding: '64px 24px',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--light-gray)',
                color: 'var(--text-tertiary)',
              }}>
              <MessageCircle size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>No rooms yet</p>
              <p style={{ fontSize: 13 }}>Create your first room to start collaborating with AI.</p>
            </motion.div>
          )}
          {rooms.map(room => <RoomCard key={room.id} room={room} />)}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 48,
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--off-white)',
            border: '1px solid var(--light-gray)',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Users size={18} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)', marginBottom: 2 }}>
              Invite your team
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300 }}>
              Add teammates to any room and control AI agents together in real-time.
            </p>
          </div>
          <button style={{
            marginLeft: 'auto', flexShrink: 0,
            padding: '8px 16px', borderRadius: 'var(--radius-pill)',
            background: 'var(--white)', border: '1px solid var(--light-gray)',
            fontSize: 13, fontWeight: 500, color: 'var(--black)',
            whiteSpace: 'nowrap',
          }}>
            Invite
          </button>
        </motion.div>
      </div>
    </div>
  )
}
