import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import ChatRooms from './pages/ChatRooms'
import ChatRoom from './pages/ChatRoom'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/chat" element={<ChatRooms />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
      </Routes>
    </div>
  )
}
