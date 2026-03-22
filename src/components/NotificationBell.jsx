import { useState, useEffect } from 'react'
import { Bell, X, UserPlus, Gamepad2, MessageCircle, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useNotifications, markAllRead, markRead } from '@/lib/notifications'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

const notifConfig = {
  friend_request: { icon: UserPlus, color: 'text-primary bg-primary/15', label: 'Solicitud de amistad' },
  friend_playing: { icon: Gamepad2, color: 'text-green-400 bg-green-500/15', label: 'Jugando' },
  new_message: { icon: MessageCircle, color: 'text-blue-400 bg-blue-500/15', label: 'Mensaje' },
  friend_scheduled: { icon: Clock, color: 'text-amber-400 bg-amber-500/15', label: 'Partida programada' },
}

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const unsub = useNotifications(user, setNotifications)
    return unsub
  }, [user])

  const unread = notifications.filter(n => !n.read).length

  const handleOpen = async () => {
    setOpen(!open)
    if (!open && unread > 0) {
      await markAllRead(user)
    }
  }

  const handleNotifClick = async (notif) => {
    await markRead(notif.id)
    setOpen(false)
    if (notif.type === 'friend_request') navigate('/friends')
    if (notif.type === 'new_message') navigate(`/chat?to=${notif.data?.fromUid}`)
    if (notif.type === 'friend_playing' || notif.type === 'friend_scheduled') navigate('/')
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="font-semibold text-sm text-foreground">Notificaciones</p>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Bell className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Sin notificaciones</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const config = notifConfig[notif.type] || notifConfig.friend_request
                  const Icon = config.icon
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-all text-left border-b border-border/50 last:border-0 ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">{notif.data?.message || config.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(notif.createdAt), { locale: es, addSuffix: true })}
                        </p>
                      </div>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
