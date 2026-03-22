import { db } from './firebase'
import {
  collection, addDoc, query, where, onSnapshot,
  updateDoc, doc, orderBy, writeBatch, getDocs
} from 'firebase/firestore'

export async function createNotification(toUid, type, data) {
  await addDoc(collection(db, 'notifications'), {
    to: toUid,
    type,
    data,
    read: false,
    createdAt: new Date().toISOString()
  })
}

export function useNotifications(user, setNotifications) {
  if (!user) return () => {}
  const q = query(
    collection(db, 'notifications'),
    where('to', '==', user.uid),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap => {
    setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function markAllRead(user) {
  if (!user) return
  const q = query(
    collection(db, 'notifications'),
    where('to', '==', user.uid),
    where('read', '==', false)
  )
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(doc(db, 'notifications', d.id), { read: true }))
  await batch.commit()
}

export async function markRead(notifId) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true })
}
