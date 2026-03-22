import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import AppLayout from './components/layouts/AppLayout'
import EstadoPage from './pages/EstadoPage'
import AmigosPage from './pages/AmigosPage'
import ChatPage from './pages/ChatPage'
import PerfilPage from './pages/PerfilPage'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<EstadoPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/friends" element={<AmigosPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<PerfilPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
