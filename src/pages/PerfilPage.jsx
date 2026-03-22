import { useState } from 'react'
import { WifiOff, Send, LogOut, CheckCircle, Edit2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export default function PerfilPage() {
  const { user, logout } = useAuth()
  const [inviteEmail, setInviteEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(user?.displayName || '')

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    setSent(true)
    setInviteEmail('')
    setTimeout(() => setSent(false), 3000)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  const handleSaveName = async () => {
    if (!newName.trim() || !user) return
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: newName.trim() })
    } catch (e) { console.error(e) }
    setEditingName(false)
  }

  const initial = (user?.displayName || user?.email || '?')[0].toUpperCase()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-foreground mb-4">Perfil</h1>

      <div className="bg-card border border-border rounded-2xl p-4 mb-3">
        <div className="flex items-center gap-3 mb-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2">
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50" autoFocus />
                <button onClick={handleSaveName} className="text-xs text-primary font-medium">Guardar</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">{user?.displayName || 'Sin nombre'}</p>
                <button onClick={() => setEditingName(true)}><Edit2 className="w-3 h-3 text-muted-foreground" /></button>
              </div>
            )}
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5">
          <WifiOff className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground capitalize">{user?.status || 'Offline'}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mb-3">
        <p className="font-semibold text-foreground mb-1">Invitar amigos</p>
        <p className="text-sm text-muted-foreground mb-3">Envía una invitación por email para que se unan</p>
        <div className="flex gap-2">
          <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()} placeholder="email@ejemplo.com"
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
          <button onClick={handleInvite}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all">
            {sent ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        {sent && <p className="text-xs text-primary mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Invitación enviada</p>}
      </div>

      <button onClick={handleLogout} disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 active:scale-95 transition-all disabled:opacity-60">
        <LogOut className="w-4 h-4" />
        {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>
    </div>
  )
}
