import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from './firebase'

// Utility function to clean up orphaned votes
export async function cleanupOrphanedVotes() {
  try {
    console.log('🧹 Starting cleanup of orphaned votes...')
    
    // Get all votes
    const votesSnapshot = await getDocs(collection(db, 'votes'))
    console.log(`📊 Found ${votesSnapshot.size} total votes`)
    
    // Get all poll IDs that currently exist
    const pollsSnapshot = await getDocs(collection(db, 'polls'))
    const existingPollIds = new Set(pollsSnapshot.docs.map(doc => doc.id))
    console.log(`📊 Found ${existingPollIds.size} existing polls`)
    
    // Find orphaned votes
    const orphanedVotes = votesSnapshot.docs.filter(voteDoc => {
      const voteData = voteDoc.data()
      return !existingPollIds.has(voteData.pollId)
    })
    
    console.log(`🗑️ Found ${orphanedVotes.length} orphaned votes`)
    
    if (orphanedVotes.length === 0) {
      console.log('✅ No orphaned votes found')
      return 0
    }
    
    // Delete orphaned votes
    const deletePromises = orphanedVotes.map(voteDoc => 
      deleteDoc(doc(db, 'votes', voteDoc.id))
    )
    
    await Promise.all(deletePromises)
    
    console.log(`✅ Cleaned up ${orphanedVotes.length} orphaned votes`)
    return orphanedVotes.length
    
  } catch (error) {
    console.error('❌ Error cleaning up orphaned votes:', error)
    throw error
  }
}

// Clean up orphaned data requests
export async function cleanupOrphanedDataRequests() {
  try {
    console.log('🧹 Starting cleanup of orphaned data requests...')
    
    const requestsSnapshot = await getDocs(collection(db, 'requests'))
    const pollsSnapshot = await getDocs(collection(db, 'polls'))
    const existingPollIds = new Set(pollsSnapshot.docs.map(doc => doc.id))
    
    const orphanedRequests = requestsSnapshot.docs.filter(requestDoc => {
      const requestData = requestDoc.data()
      return !existingPollIds.has(requestData.pollId)
    })
    
    console.log(`🗑️ Found ${orphanedRequests.length} orphaned data requests`)
    
    if (orphanedRequests.length === 0) {
      return 0
    }
    
    const deletePromises = orphanedRequests.map(requestDoc => 
      deleteDoc(doc(db, 'requests', requestDoc.id))
    )
    
    await Promise.all(deletePromises)
    
    console.log(`✅ Cleaned up ${orphanedRequests.length} orphaned data requests`)
    return orphanedRequests.length
    
  } catch (error) {
    console.error('❌ Error cleaning up orphaned data requests:', error)
    throw error
  }
}
