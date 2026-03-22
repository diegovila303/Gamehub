import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layouts/AppLayout'
import EstadoPage from './pages/EstadoPage'
import AmigosPage from './pages/AmigosPage'
import ChatPage from './pages/ChatPage'
import ChatConversationPage from './pages/ChatConversationPage'
import PerfilPage from './pages/PerfilPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<EstadoPage />} />
        <Route path="/friends" element={<AmigosPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<PerfilPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
