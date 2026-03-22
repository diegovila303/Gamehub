// Simple local state management sin backend
// Reemplaza base44 para que la app funcione sin credenciales

const store = {
  gameStatus: JSON.parse(localStorage.getItem('gh_gameStatus') || 'null'),
  friends: JSON.parse(localStorage.getItem('gh_friends') || '[]'),
  messages: JSON.parse(localStorage.getItem('gh_messages') || '[]'),
  user: JSON.parse(localStorage.getItem('gh_user') || 'null'),
}

function save(key) {
  localStorage.setItem('gh_' + key, JSON.stringify(store[key]))
}

export const GameStatus = {
  async getMyStatus(email) {
    return store.gameStatus
  },
  async setStatus(data) {
    store.gameStatus = { ...store.gameStatus, ...data, updated_date: new Date().toISOString() }
    save('gameStatus')
    return store.gameStatus
  },
  async getFriendStatuses(emails) {
    return store.friends.filter(f => emails.includes(f.user_email))
  },
  async list() {
    return store.friends
  },
}

export const ChatMessage = {
  async getConversations(myEmail) {
    const msgs = store.messages.filter(m => m.from_email === myEmail || m.to_email === myEmail)
    const partners = new Set()
    msgs.forEach(m => {
      if (m.from_email !== myEmail) partners.add(m.from_email)
      if (m.to_email !== myEmail) partners.add(m.to_email)
    })
    return Array.from(partners).map(email => {
      const conv = msgs.filter(m => m.from_email === email || m.to_email === email)
      return { email, lastMessage: conv[conv.length - 1] }
    })
  },
  async getMessages(myEmail, otherEmail) {
    return store.messages.filter(m =>
      (m.from_email === myEmail && m.to_email === otherEmail) ||
      (m.from_email === otherEmail && m.to_email === myEmail)
    ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
  },
  async send(from_email, to_email, content) {
    const msg = { from_email, to_email, content, read: false, created_date: new Date().toISOString(), id: Date.now().toString() }
    store.messages.push(msg)
    save('messages')
    return msg
  },
}

export const User = {
  async get() {
    return store.user || { name: 'Diego Vila', email: 'diegovila303@gmail.com' }
  },
  async set(data) {
    store.user = { ...store.user, ...data }
    save('user')
    return store.user
  },
}
