import { useState } from 'react'
import { Search, UserPlus, Users, Check, X, Clock, Trash2, MessageCircle, UserCheck } from 'lucide-react'
import { useFriends } from '@/lib/friends'
import { useAuth } from '@/lib/auth'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const statusColors = {
  playing: 'bg-green-400',
  scheduled: 'bg-amber-400',
  offline: 'bg-muted-foreground/40',
}
const statusLabels = {
  playing: 'Jugando',
  scheduled: 'Va a jugar',
  offline: 'Offline',
}

const TABS = [
  { id: 'friends', label: 'Amigos', icon: Users },
  { id: 'add', label: 'Añadir', icon: UserPlus },
  { id: 'pending', label: 'Pendientes', icon: Clock },
]

export default function AmigosPage() {
  const { user } = useAuth()
  const { friends, incoming, outgoing, sendRequest, acceptRequest, rejectRequest, removeFriend, searchByUsername } = useFriends()
  const [tab, setTab] = useState('friends')
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentMsg, setSentMsg] = useState('')

  const handleSearch = async () => {
    if (!search.trim()) return
    setSearching(true)
    setSearchResult(null)
    setSearchError('')
    setSentMsg('')
    const result = await searchByUsername(search.trim())
    if (!result) {
      setSearchError('Usuario no encontrado')
    } else if (result.uid === user?.uid) {
      setSearchError('Ese eres tú 😄')
    } else {
      setSearchResult(result)
    }
    setSearching(false)
  }

  const handleSendRequest = async () => {
    if (!searchResult) return
    setSending(true)
    const res = await sendRequest(searchResult.uid)
    if (res?.error) {
      setSearchError(res.error)
    } else {
      setSentMsg('¡Solicitud enviada!')
      setSearchResult(null)
      setSearch('')
    }
    setSending(false)
  }

  const onlineFriends = friends.filter(f => f.status !== 'offline')
  const offlineFriends = friends.filter(f => f.status === 'offline')
  const pendingCount = incoming.length

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-foreground mb-4">Amigos</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all relative',
              tab === t.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.id === 'pending' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: Amigos */}
      {tab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
                <Users className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground/80 mb-1">Aún no tienes amigos</p>
                <p className="text-sm text-muted-foreground">Añade amigos con su nombre de usuario</p>
              </div>
              <button onClick={() => setTab('add')} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                Añadir amigo
              </button>
            </div>
          ) : (
            <>
              {onlineFriends.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Activos — {onlineFriends.length}
                  </p>
                  <div className="flex flex-col gap-2">
                    {onlineFriends.map(f => <FriendCard key={f.uid} friend={f} onRemove={() => removeFriend(f.requestId)} />)}
                  </div>
                </div>
              )}
              {offlineFriends.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Offline — {offlineFriends.length}
                  </p>
                  <div className="flex flex-col gap-2">
                    {offlineFriends.map(f => <FriendCard key={f.uid} friend={f} onRemove={() => removeFriend(f.requestId)} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: Añadir */}
      {tab === 'add' && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Busca a tus amigos por su nombre de usuario, por ejemplo <span className="text-foreground font-medium">diego#1234</span>
          </p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="usuario#1234"
                value={search}
                onChange={e => { setSearch(e.target.value); setSearchError(''); setSentMsg(''); setSearchResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60"
            >
              {searching ? '...' : 'Buscar'}
            </button>
          </div>

          {searchError && <p className="text-sm text-destructive mb-3">{searchError}</p>}
          {sentMsg && <p className="text-sm text-primary mb-3">✓ {sentMsg}</p>}

          {searchResult && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                {searchResult.avatar
                  ? <img src={searchResult.avatar} className="w-full h-full object-cover" />
                  : (searchResult.name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{searchResult.name}</p>
                <p className="text-xs text-muted-foreground">{searchResult.username}</p>
              </div>
              <button
                onClick={handleSendRequest}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {sending ? '...' : 'Añadir'}
              </button>
            </div>
          )}

          {/* Tu username */}
          <div className="mt-6 p-4 rounded-xl bg-card border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tu nombre de usuario</p>
            <p className="text-sm font-medium text-foreground">{user?.username || '...'}</p>
            <p className="text-xs text-muted-foreground mt-1">Compártelo con tus amigos para que te añadan</p>
          </div>
        </div>
      )}

      {/* TAB: Pendientes */}
      {tab === 'pending' && (
        <div className="flex flex-col gap-4">
          {incoming.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Solicitudes recibidas — {incoming.length}
              </p>
              <div className="flex flex-col gap-2">
                {incoming.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                      {req.fromUser?.avatar
                        ? <img src={req.fromUser.avatar} className="w-full h-full object-cover" />
                        : (req.fromUser?.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{req.fromUser?.name}</p>
                      <p className="text-xs text-muted-foreground">{req.fromUser?.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptRequest(req.id, req.from)} className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 hover:bg-green-500/25 transition-all">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => rejectRequest(req.id)} className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {outgoing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Solicitudes enviadas — {outgoing.length}
              </p>
              <div className="flex flex-col gap-2">
                {outgoing.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Pendiente de aceptación</p>
                    </div>
                    <button onClick={() => rejectRequest(req.id)} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incoming.length === 0 && outgoing.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <UserCheck className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No tienes solicitudes pendientes</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FriendCard({ friend, onRemove }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border relative">
      <div className="relative">
        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground overflow-hidden">
          {friend.avatar
            ? <img src={friend.avatar} className="w-full h-full object-cover" />
            : (friend.name || '?')[0].toUpperCase()}
        </div>
        <div className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card', statusColors[friend.status] || statusColors.offline)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{friend.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {statusLabels[friend.status] || 'Offline'}
          {friend.current_game ? ` • ${friend.current_game}` : ''}
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/chat?to=${friend.uid}`}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
        </Link>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {showMenu && (
        <div className="absolute right-3 top-14 z-10 bg-card border border-border rounded-xl p-2 shadow-lg">
          <button
            onClick={() => { onRemove(); setShowMenu(false) }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar amigo
          </button>
          <button
            onClick={() => setShowMenu(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary w-full transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
