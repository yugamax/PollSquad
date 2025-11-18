import { updateDoc, doc, increment, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { getUserData } from './db-service' // ADD: Missing import

export const POINTS_CONFIG = {
  STARTING_POINTS: 40,
  BASE_POLL_COMPLETION_POINTS: 5,
  BONUS_STREAK: 10, // Consecutive poll completion bonus
  BONUS_UNDERSAMPLED: 15, // Keep for backward compatibility but not displayed in UI
  STREAK_THRESHOLD: 5, // UPDATED: Changed from 3 to 5 consecutive poll completions
  UNDERSAMPLED_VOTES_THRESHOLD: 50
}

// NEW: Award points for completing an entire poll (all questions answered)
export async function awardPollCompletionPoints(userUid: string, pollId: string, totalVotes: number = 0) {
  try {
    console.log(`🎯 Attempting to award points for poll completion: user ${userUid}, poll ${pollId}`)
    
    // NEW: Check if user is the poll owner - no points for own polls
    const pollDoc = await getDoc(doc(db, 'polls', pollId))
    if (pollDoc.exists()) {
      const pollData = pollDoc.data()
      if (pollData.ownerUid === userUid) {
        console.log('⚠️ User is poll owner - no points awarded for voting on own poll')
        return 0
      }
    }
    
    // Get user data to check completion history
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
    
    let finalPoints = POINTS_CONFIG.BASE_POLL_COMPLETION_POINTS
    
    // NEW: Check for consecutive poll completion streak
    const recentCompletions = completedPolls.length
    const consecutiveCompletions = recentCompletions + 1 // Including current poll
    
    if (consecutiveCompletions >= POINTS_CONFIG.STREAK_THRESHOLD && consecutiveCompletions % POINTS_CONFIG.STREAK_THRESHOLD === 0) {
      finalPoints += POINTS_CONFIG.BONUS_STREAK
      console.log(`🔥 Consecutive poll streak bonus! User completed ${consecutiveCompletions} polls consecutively, adding ${POINTS_CONFIG.BONUS_STREAK} bonus points`)
    }
    
    // Update user points and add to completed polls list ATOMICALLY
    await updateDoc(doc(db, 'users', userUid), {
      points: increment(finalPoints),
      lastUpdated: serverTimestamp(),
      completedPolls: arrayUnion(pollId)
    })
    
    console.log(`🎁 Successfully awarded ${finalPoints} points to user ${userUid} for completing poll ${pollId}`)
    
    // Trigger a custom event to notify components about points update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userPointsUpdated', { 
        detail: { userUid, pointsAwarded: finalPoints, hasStreak: finalPoints > POINTS_CONFIG.BASE_POLL_COMPLETION_POINTS } 
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
