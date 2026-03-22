import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Send, MessageCircle, ArrowLeft, Users, Plus, X, Check } from 'lucide-react'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth'
import { useFriends } from '@/lib/friends'
import ChatBubble from '@/components/chat/ChatBubble'
import {
  collection, addDoc, onSnapshot, query,
  orderBy, doc, getDoc, setDoc, updateDoc,
  arrayUnion, where, getDocs
} from 'firebase/firestore'

export default function ChatPage() {
  const { user } = useAuth()
  const { friends } = useFriends()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toUid = searchParams.get('to')

  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const bottomRef = useRef(null)

  // Cargar conversaciones
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'conversations'), where('members', 'array-contains', user.uid))
    const unsub = onSnapshot(q, async snap => {
      const convs = await Promise.all(snap.docs.map(async d => {
        const data = d.data()
        const isGroup = data.type === 'group'
        let title = data.name || ''
        let avatar = null
        if (!isGroup && data.members) {
          const otherUid = data.members.find(m => m !== user.uid)
          if (otherUid) {
            const otherSnap = await getDoc(doc(db, 'users', otherUid))
            const other = otherSnap.data()
            title = other?.name || other?.email || 'Usuario'
            avatar = other?.avatar
          }
        }
        return { id: d.id, ...data, title, avatar }
      }))
      convs.sort((a, b) => (b.lastMessageAt || '') > (a.lastMessageAt || '') ? 1 : -1)
      setConversations(convs)
    })
    return unsub
  }, [user])

  // Abrir chat directo desde amigos
  useEffect(() => {
    if (!toUid || !user) return
    openDirectChat(toUid)
  }, [toUid, user])

  // Cargar mensajes del chat activo
  useEffect(() => {
    if (!activeChat) return
    const q = query(collection(db, 'conversations', activeChat.id, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [activeChat])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openDirectChat = async (otherUid) => {
    if (!user) return
    // Buscar conversación directa existente
    const q = query(collection(db, 'conversations'),
      where('type', '==', 'direct'),
      where('members', 'array-contains', user.uid))
    const snap = await getDocs(q)
    let existing = snap.docs.find(d => d.data().members.includes(otherUid))

    if (existing) {
      const otherSnap = await getDoc(doc(db, 'users', otherUid))
      const other = otherSnap.data()
      setActiveChat({ id: existing.id, ...existing.data(), title: other?.name, avatar: other?.avatar })
    } else {
      // Crear nueva conversación directa
      const otherSnap = await getDoc(doc(db, 'users', otherUid))
      const other = otherSnap.data()
      const newConv = await addDoc(collection(db, 'conversations'), {
        type: 'direct',
        members: [user.uid, otherUid],
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString()
      })
      setActiveChat({ id: newConv.id, type: 'direct', members: [user.uid, otherUid], title: other?.name, avatar: other?.avatar })
    }
  }

  const createGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return
    const members = [user.uid, ...selectedMembers]
    const newConv = await addDoc(collection(db, 'conversations'), {
      type: 'group',
      name: groupName.trim(),
      members,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    })
    setActiveChat({ id: newConv.id, type: 'group', name: groupName, members, title: groupName })
    setShowNewGroup(false)
    setGroupName('')
    setSelectedMembers([])
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeChat || !user) return
    const text = input.trim()
    setInput('')
    await addDoc(collection(db, 'conversations', activeChat.id, 'messages'), {
      text,
      from: user.uid,
      fromName: user.displayName || user.email,
      fromAvatar: user.photoURL,
      createdAt: new Date().toISOString()
    })
    await updateDoc(doc(db, 'conversations', activeChat.id), {
      lastMessage: text,
      lastMessageAt: new Date().toISOString()
    })
  }

  // Vista: chat activo
  if (activeChat) {
    const isGroup = activeChat.type === 'group'
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <button onClick={() => { setActiveChat(null); navigate('/chat') }} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          {activeChat.avatar ? (
            <img src={activeChat.avatar} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              {isGroup ? <Users className="w-4 h-4 text-muted-foreground" /> : <span className="text-sm font-bold text-muted-foreground">{(activeChat.title || '?')[0].toUpperCase()}</span>}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-foreground">{activeChat.title}</p>
            {isGroup && <p className="text-xs text-muted-foreground">{activeChat.members?.length} miembros</p>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Sé el primero en decir algo 👋</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={{ ...msg, content: msg.text, created_date: msg.createdAt }} isMine={msg.from === user?.uid} senderName={isGroup && msg.from !== user?.uid ? msg.fromName : null} />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-border flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button onClick={sendMessage} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Vista: lista de conversaciones
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <p className="text-sm text-muted-foreground">Tus conversaciones</p>
        </div>
        <button onClick={() => setShowNewGroup(!showNewGroup)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Crear grupo */}
      {showNewGroup && (
        <div className="mb-4 p-4 rounded-xl bg-card border border-border">
          <p className="text-sm font-semibold text-foreground mb-3">Nuevo grupo</p>
          <input
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="Nombre del grupo..."
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 mb-3"
          />
          <p className="text-xs text-muted-foreground mb-2">Selecciona miembros:</p>
          <div className="flex flex-col gap-2 mb-3">
            {friends.map(f => (
              <button key={f.uid} onClick={() => setSelectedMembers(prev => prev.includes(f.uid) ? prev.filter(u => u !== f.uid) : [...prev, f.uid])}
                className={`flex items-center gap-3 p-2 rounded-xl transition-all ${selectedMembers.includes(f.uid) ? 'bg-primary/10 border border-primary/30' : 'bg-secondary'}`}>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {f.avatar ? <img src={f.avatar} className="w-full h-full object-cover" /> : (f.name || '?')[0].toUpperCase()}
                </div>
                <span className="text-sm text-foreground flex-1 text-left">{f.name}</span>
                {selectedMembers.includes(f.uid) && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNewGroup(false)} className="flex-1 py-2 rounded-xl bg-secondary text-sm text-muted-foreground">Cancelar</button>
            <button onClick={createGroup} disabled={!groupName.trim() || selectedMembers.length === 0} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Crear</button>
          </div>
        </div>
      )}

      {/* Lista */}
      {conversations.length > 0 ? (
        <div className="flex flex-col gap-2">
          {conversations.map(conv => (
            <button key={conv.id} onClick={() => setActiveChat(conv)}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-left">
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                {conv.avatar ? <img src={conv.avatar} className="w-full h-full object-cover" /> : conv.type === 'group' ? <Users className="w-5 h-5" /> : (conv.title || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{conv.title}</p>
                {conv.lastMessage && <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground/80 mb-1">No tienes conversaciones</p>
            <p className="text-sm text-muted-foreground">Ve a Amigos y pulsa el icono de chat</p>
          </div>
        </div>
      )}
    </div>
  )
}
