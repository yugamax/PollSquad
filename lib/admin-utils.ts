import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from './firebase'

export async function updateAllUserPointsTo40() {
  try {
    console.log('🔄 Starting to update all user points to 40...')
    
    const usersCollection = collection(db, 'users')
    const snapshot = await getDocs(usersCollection)
    
    console.log(`📊 Found ${snapshot.size} users to update`)
    
    const updatePromises = snapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data()
      console.log(`📝 Updating user ${userData.email || userDoc.id} points to 40`)
      
      await updateDoc(doc(db, 'users', userDoc.id), {
        points: 40
      })
      
      return userDoc.id
    })
    
    await Promise.all(updatePromises)
    
    console.log('✅ Successfully updated all user points to 40')
    
    // Trigger global refresh event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('allUserPointsUpdated'))
    }
    
    return snapshot.size
  } catch (error) {
    console.error('❌ Error updating user points:', error)
    throw error
  }
}
