'use client'

// Fix: Use relative paths instead of @/ alias
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { PollFeed } from '../../components/poll/poll-feed'
import { motion } from 'framer-motion'
import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'

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

  return (
    <DashboardLayout>
      {/* Welcome Section - Responsive with background overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8 text-center"
      >
        <div className="card-elevated content-overlay p-3 sm:p-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-primary">
            Discover Polls
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
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