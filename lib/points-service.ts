import { updateDoc, doc, increment, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from './firebase'

export const POINTS_CONFIG = {
  STARTING_POINTS: 40, // UPDATED: Changed from 25 to 40 points for new accounts
  BASE_POLL_COMPLETION_POINTS: 5,
  BONUS_STREAK: 10,
  BONUS_UNDERSAMPLED: 15,
  STREAK_THRESHOLD: 3,
  UNDERSAMPLED_VOTES_THRESHOLD: 50
}

// NEW: Award points for completing an entire poll (all questions answered)
export async function awardPollCompletionPoints(userUid: string, pollId: string, totalVotes: number = 0) {
  try {
    console.log(`🎯 Attempting to award points for poll completion: user ${userUid}, poll ${pollId}`)
    
    // CRITICAL: Check if user already got points for this poll
    const userData = await getUserData(userUid)
    if (!userData) {
      console.log('❌ User not found, cannot award points')
      return 0
    }
    
    const completedPolls = userData.completedPolls || []
    if (completedPolls.includes(pollId)) {
      console.log('⚠️ User already received points for this poll, skipping')
      return 0
    }
    
    const points = POINTS_CONFIG.BASE_POLL_COMPLETION_POINTS
    
    // Add undersampled bonus if poll has few votes
    let finalPoints = points
    if (totalVotes < POINTS_CONFIG.UNDERSAMPLED_VOTES_THRESHOLD) {
      finalPoints += POINTS_CONFIG.BONUS_UNDERSAMPLED
    }
    
    // Update user points and add to completed polls list ATOMICALLY
    await updateDoc(doc(db, 'users', userUid), {
      points: increment(finalPoints),
      lastUpdated: serverTimestamp(),
      completedPolls: arrayUnion(pollId) // Track completed polls in user document
    })
    
    console.log(`🎁 Successfully awarded ${finalPoints} points to user ${userUid} for completing poll ${pollId}`)
    
    // NEW: Trigger a custom event to notify components about points update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userPointsUpdated', { 
        detail: { userUid, pointsAwarded: finalPoints } 
      }))
    }
    
    return finalPoints
  } catch (error) {
    console.error('Error awarding poll completion points:', error)
    return 0
  }
}

// DEPRECATED: Keep for backwards compatibility but update to use new system
export async function awardPoints(userUid: string, pollId: string, points: number) {
  console.log('⚠️ Using deprecated awardPoints function. Use awardPollCompletionPoints instead.')
  return await awardPollCompletionPoints(userUid, pollId, 0)
}

// Update calculatePoints to reflect new system
export function calculatePoints(totalVotes: number, isStreak: boolean = false): number {
  console.log('⚠️ calculatePoints is deprecated. Points are now awarded per completed poll, not per question.')
  return POINTS_CONFIG.BASE_POLL_COMPLETION_POINTS
}
