'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { updatePoll, getUserData } from '@/lib/db-service'
import { motion, AnimatePresence } from 'framer-motion'
import { updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Timestamp } from 'firebase/firestore'

interface BoostModalProps {
  isOpen: boolean
  pollId: string
  onClose: () => void
  onSuccess: () => void
}

const BOOST_DURATIONS = [
  { hours: 6, cost: 60 },
  { hours: 24, cost: 120 },
  { hours: 72, cost: 240 }
]

export function BoostModal({ isOpen, pollId, onClose, onSuccess }: BoostModalProps) {
  const { user, userPoints, refreshUserData } = useAuth()
  const [selectedDuration, setSelectedDuration] = useState(BOOST_DURATIONS[1])
  const [loading, setLoading] = useState(false)

  const canAfford = userPoints >= selectedDuration.cost

  useEffect(() => {
    if (isOpen) {
      // Refresh user data when modal opens to get latest points
      refreshUserData()
    }
  }, [isOpen, refreshUserData])

  const handleBoost = async () => {
    if (!user || !canAfford) return

    try {
      setLoading(true)
      const now = new Date()
      const boostUntil = new Date(now.getTime() + selectedDuration.hours * 60 * 60 * 1000)

      // Update poll boost time
      await updatePoll(pollId, {
        boostedUntil: Timestamp.fromDate(boostUntil),
        boosted: true,
        boostHours: selectedDuration.hours
      })

      // FIXED: Deduct points from user using proper Firestore operations
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(-selectedDuration.cost), // Subtract points
        lastUpdated: serverTimestamp()
      })

      // Refresh user data to update context
      await refreshUserData()

      // Show success message
      alert(`🚀 Poll boosted for ${selectedDuration.hours} hours! ${selectedDuration.cost} points deducted.`)

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error boosting poll:', error)
      alert('Failed to boost poll. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl relative z-50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">🚀 Boost Poll</h2>
              <div className="flex items-center gap-2 bg-warning/10 text-warning px-3 py-2 rounded-full">
                <span className="text-sm">⭐</span>
                <span className="font-bold">{userPoints}</span>
                <span className="text-xs">points</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">Push your poll to the top and get more visibility!</p>

            {/* Duration Options */}
            <div className="space-y-3 mb-8">
              {BOOST_DURATIONS.map(duration => (
                <button
                  key={duration.hours}
                  onClick={() => setSelectedDuration(duration)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between font-bold ${
                    selectedDuration.hours === duration.hours
                      ? 'bg-warning/20 border-warning shadow-lg'
                      : 'border-border hover:border-warning'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-lg">
                      {duration.hours === 6 && '🕐 6 Hours'}
                      {duration.hours === 24 && '📅 24 Hours'}
                      {duration.hours === 72 && '🗓️ 3 Days'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {duration.hours === 24 ? 'Most popular choice' : 'Great visibility'}
                    </div>
                  </div>
                  <div className="text-xl font-black text-primary">
                    {duration.cost}
                  </div>
                </button>
              ))}
            </div>

            {/* Cost Summary */}
            <div className="bg-primary/5 rounded-2xl p-4 mb-6 border border-primary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Your Points</span>
                <span className={userPoints >= selectedDuration.cost ? 'text-success font-bold' : 'text-danger font-bold'}>
                  {userPoints} pts
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Boost Cost</span>
                <span className="text-primary font-black">-{selectedDuration.cost} pts</span>
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                <span className="font-bold">After Boost</span>
                <span className={`font-black ${userPoints >= selectedDuration.cost ? 'text-success' : 'text-danger'}`}>
                  {userPoints - selectedDuration.cost} pts
                </span>
              </div>
            </div>

            {!canAfford && (
              <div className="bg-danger/10 border border-danger/30 rounded-2xl p-3 mb-6 text-danger text-sm font-bold">
                ❌ You need {selectedDuration.cost - userPoints} more points to boost this poll
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-primary font-bold transition-all hover:bg-primary/5"
              >
                Cancel
              </button>
              <button
                onClick={handleBoost}
                disabled={loading || !canAfford}
                className="flex-1 px-4 py-3 bg-warning text-black rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-warning/90"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Boosting...
                  </div>
                ) : (
                  `🚀 Boost for ${selectedDuration.cost} pts`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
