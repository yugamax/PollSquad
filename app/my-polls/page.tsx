'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { getUserPolls, deletePollWithCleanup } from '@/lib/db-service'
import { BoostModal } from '@/components/poll/boost-modal'
import { ExportButton } from '@/components/poll/export-button'
import { 
  Trash2, 
  Users, 
  Calendar, 
  BarChart3, 
  Rocket,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Poll {
  pollId: string
  title: string
  ownerName: string
  ownerUid: string
  questions: Array<{
    id: string
    question: string
    options: Array<{
      id: string
      text: string
      votesCount: number
    }>
    totalVotes: number
  }>
  totalVotes: number
  createdAt: Date
  boosted?: boolean
  boostedUntil?: Date
  boostHours?: number
  tags?: string[]
}

export default function MyPollsPage() {
  const { user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [boostModal, setBoostModal] = useState<{ isOpen: boolean; pollId: string | null }>({
    isOpen: false,
    pollId: null
  })

  const loadUserPolls = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userPolls = await getUserPolls(user.uid)
      setPolls(userPolls)
    } catch (error) {
      console.error('Error loading user polls:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserPolls()
  }, [user])

  const handleDelete = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(pollId)
      await deletePollWithCleanup(pollId)
      setPolls(polls.filter(poll => poll.pollId !== pollId))
    } catch (error) {
      console.error('Error deleting poll:', error)
      alert('Failed to delete poll. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleBoostClick = (pollId: string) => {
    setBoostModal({ isOpen: true, pollId })
  }

  const handleBoostSuccess = () => {
    setBoostModal({ isOpen: false, pollId: null })
    loadUserPolls() // Refresh to show updated boost status
  }

  const handleBoostClose = () => {
    setBoostModal({ isOpen: false, pollId: null })
  }

  // Helper function to calculate remaining boost time
  const getBoostTimeRemaining = (boostedUntil: Date) => {
    const now = new Date()
    const timeLeft = boostedUntil.getTime() - now.getTime()
    
    if (timeLeft <= 0) return null
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading your polls...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8 mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-2 sm:mb-3 text-center sm:text-left">
            My Polls
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg text-center sm:text-left">
            Manage your created polls, view analytics, and boost visibility
          </p>
        </div>

        {polls.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Polls Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first poll to start gathering opinions and insights.
            </p>
            <a
              href="/create-poll"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              Create Your First Poll
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll, index) => {
              const isDeleting = deletingId === poll.pollId
              
              // Check if poll is boosted and still active
              const boostedUntil = poll.boostedUntil
              const isBoosted = boostedUntil && boostedUntil > new Date()
              const boostTimeLeft = isBoosted ? getBoostTimeRemaining(boostedUntil) : null

              return (
                <motion.div
                  key={poll.pollId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 sm:p-6 rounded-2xl border transition-all ${
                    isBoosted 
                      ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border-yellow-300/50 shadow-lg' 
                      : 'bg-card border-border hover:shadow-md'
                  }`}
                  style={isBoosted ? {
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.2), 0 0 40px rgba(251, 191, 36, 0.05)'
                  } : {}}
                >
                  {/* Boost Indicator */}
                  {isBoosted && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Rocket className="w-3 h-3" />
                        <span>BOOSTED</span>
                        {boostTimeLeft && <span>• {boostTimeLeft}</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg sm:text-xl font-bold mb-2 ${
                        isBoosted ? 'text-yellow-900' : 'text-foreground'
                      }`}>
                        {poll.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {poll.totalVotes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          {poll.questions.length} question{poll.questions.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {poll.createdAt.toLocaleDateString()}
                        </span>
                        {isBoosted && (
                          <span className="flex items-center gap-1 text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full font-bold">
                            <Clock className="w-3 h-3" />
                            {boostTimeLeft} remaining
                          </span>
                        )}
                      </div>

                      {poll.tags && poll.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {poll.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                          {poll.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{poll.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap sm:flex-col gap-2 sm:gap-3">
                      {/* Boost Button - only show if NOT already boosted */}
                      {!isBoosted && (
                        <button
                          onClick={() => handleBoostClick(poll.pollId)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30"
                        >
                          <Rocket className="w-4 h-4" />
                          <span>Boost Poll</span>
                        </button>
                      )}

                      {/* Show boost status if already boosted */}
                      {isBoosted && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-yellow-200 text-yellow-800 border border-yellow-300">
                          <Rocket className="w-4 h-4" />
                          <span>Currently Boosted</span>
                        </div>
                      )}

                      {/* Export Button */}
                      <ExportButton poll={poll} />

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(poll.pollId)}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-3 py-2 bg-danger/20 text-danger border border-danger/30 rounded-lg font-semibold text-sm hover:bg-danger/30 transition-all disabled:opacity-50 hover:scale-105"
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin"></div>
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Low Engagement Warning */}
                  {poll.totalVotes < 5 && !isBoosted && (
                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-warning mb-1">
                            Low engagement detected
                          </p>
                          <p className="text-warning/80">
                            Consider boosting this poll to increase visibility and get more responses.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Boost Modal */}
        <BoostModal
          isOpen={boostModal.isOpen}
          pollId={boostModal.pollId || ''}
          onClose={handleBoostClose}
          onSuccess={handleBoostSuccess}
        />
      </div>
    </DashboardLayout>
  )
}
