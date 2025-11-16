import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore'
import { db } from './firebase'

export interface Poll {
  id: string
  title: string
  options: string[]
  visible: boolean
  createdBy: string
  createdAt: Date
  expiresAt?: Date
  boostedUntil?: Date
  votes?: Record<string, number>
}

export async function getVisiblePolls(limitCount = 20): Promise<Poll[]> {
  try {
    const pollsRef = collection(db, 'polls')
    
    // Simple query that matches the required index
    const q = query(
      pollsRef,
      where('visible', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    const polls = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate(),
      boostedUntil: doc.data().boostedUntil?.toDate()
    })) as Poll[]
    
    // Filter expired polls in client
    const now = new Date()
    return polls
      .filter(poll => !poll.expiresAt || poll.expiresAt > now)
      .sort((a, b) => {
        // Prioritize boosted polls
        const aIsBoosted = a.boostedUntil && a.boostedUntil > now
        const bIsBoosted = b.boostedUntil && b.boostedUntil > now
        
        if (aIsBoosted && !bIsBoosted) return -1
        if (!aIsBoosted && bIsBoosted) return 1
        
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
    
  } catch (error) {
    console.error('Error fetching polls:', error)
    return []
  }
}

export async function getUserPolls(userId: string): Promise<Poll[]> {
  try {
    const pollsRef = collection(db, 'polls')
    const q = query(
      pollsRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate(),
      boostedUntil: doc.data().boostedUntil?.toDate()
    })) as Poll[]
    
  } catch (error) {
    console.error('Error fetching user polls:', error)
    return []
  }
}
