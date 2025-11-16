import { updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export const POINTS_CONFIG = {
  BASE_ANSWER_POINTS: 5,
  BONUS_STREAK: 10,
  BONUS_UNDERSAMPLED: 15,
  STREAK_THRESHOLD: 3, // consecutive poll answers
  UNDERSAMPLED_VOTES_THRESHOLD: 50 // polls with less than 50 votes
}

export async function awardPoints(userUid: string, pollId: string, points: number) {
  try {
    await updateDoc(doc(db, 'users', userUid), {
      points: increment(points),
      lastUpdated: serverTimestamp()
    })
    
    // Log points transaction
    await addDoc(collection(db, 'pointsLog'), {
      userUid,
      pollId,
      points,
      type: 'answer_bonus',
      timestamp: serverTimestamp()
    })
  } catch (error) {
    console.error('Error awarding points:', error)
  }
}

export function calculatePoints(totalVotes: number, isStreak: boolean = false): number {
  let points = POINTS_CONFIG.BASE_ANSWER_POINTS
  
  if (isStreak) {
    points += POINTS_CONFIG.BONUS_STREAK
  }
  
  if (totalVotes < POINTS_CONFIG.UNDERSAMPLED_VOTES_THRESHOLD) {
    points += POINTS_CONFIG.BONUS_UNDERSAMPLED
  }
  
  return points
}

import { addDoc, collection } from 'firebase/firestore'
