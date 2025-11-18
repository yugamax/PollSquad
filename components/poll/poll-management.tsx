'use client'

// Fix: Use relative paths instead of @/ alias
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { PollFeed } from '../../components/poll/poll-feed'
import { motion } from 'framer-motion'
import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { deletePollWithCleanup } from '../../lib/db-service'

export default function DashboardPage() {
  const { user, userPoints, refreshUserData } = useAuth()
  console.log('🚀 DASHBOARD COMPONENT LOADING - IMPORT PATHS FIXED!')
  console.log('🏠 Dashboard component rendered with original design')
  
  const [pollsUpdated, setPollsUpdated] = useState(0)

  const handlePollsRefresh = useCallback(() => {
    console.log('🔄 Dashboard: handlePollsRefresh called')
    setPollsUpdated(prev => prev + 1)
  }, [])

  // Force refresh points when dashboard loads
  useEffect(() => {
    if (user) {
      console.log('🔄 Dashboard: Force refreshing user points from database')
      refreshUserData()
    }
  }, [user?.uid, refreshUserData])

  const handleDeletePoll = async (pollId: string) => {
    const confirmed = confirm(
      'Are you sure you want to delete this poll? This will also delete all votes and related data. This action cannot be undone.'
    )
    
    if (!confirmed) return
    
    try {
      setLoading(true)
      
      console.log('🗑️ Deleting poll with complete cleanup:', pollId)
      const result = await deletePollWithCleanup(pollId)
      
      console.log('✅ Poll deletion completed:', result)
      
      // Show cleanup summary (optional)
      const summary = [
        `Poll deleted successfully`,
        `${result.deletedVotes} votes removed`,
        `${result.updatedUsers} user records updated`,
        `${result.deletedRequests} data requests removed`
      ].join('\n')
      
      console.log('📊 Deletion summary:', summary)
      
      // Refresh the UI
      onRefresh?.()
      
    } catch (error) {
      console.error('❌ Error deleting poll:', error)
      alert('Failed to delete poll. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      {/* Welcome Section - Responsive with background overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12 text-center"
      >
        <div className="card-elevated content-overlay p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-primary">
            Discover Polls
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Vote on interesting polls from the community and earn points
          </p>
        </div>
      </motion.div>

      {/* Polls Feed - Responsive with background considerations */}
      <div className="relative">
        <PollFeed key={pollsUpdated} onRefresh={handlePollsRefresh} showRandomPolls />
      </div>
    </DashboardLayout>
  )
}