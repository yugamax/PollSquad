'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Users, TrendingUp, Vote, Lock, LogIn, ChevronRight, X, Star, RefreshCw, Globe } from 'lucide-react'
import { getFeedPolls, submitVote, getUserVotesForPoll } from '../../lib/db-service'
import { useAuth } from '../../lib/auth-context'
import { awardPoints, calculatePoints, awardPollCompletionPoints } from '../../lib/points-service'
import { hasUserCompletedPoll, hasReceivedPollCompletionPoints, hasUserVotedOnPoll } from '../../lib/db-service'

// Match the actual Poll interface from db-service
interface Poll {
  pollId: string
  id?: string
  title: string
  ownerName?: string
  ownerUid: string
  questions?: Array<{
    id: string
    question: string
    options: Array<{
      id: string
      text: string
      votesCount: number
    }>
    totalVotes: number
  }>
  createdAt?: Date | { seconds: number }
  totalVotes?: number
  visible?: boolean
  tags?: string[]
}

interface PollFeedProps {
  onRefresh?: () => void
  showRandomPolls?: boolean
}

export function PollFeed({ onRefresh, showRandomPolls = false }: PollFeedProps) {
  const { user, loading: authLoading, userPoints, refreshUserData } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, string[]>>>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Record<string, string[]>>>({})
  const [votingLoading, setVotingLoading] = useState<Record<string, boolean>>({})
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [votingModal, setVotingModal] = useState(false)
  const [finalSubmitLoading, setFinalSubmitLoading] = useState<Record<string, boolean>>({})
  const loadingRef = useRef(false) // Prevent multiple simultaneous loads

  // Don't load polls if user is not authenticated
  const loadPolls = async () => {
    if (!user) {
      console.log('🚫 PollFeed: No authenticated user, skipping poll loading')
      setLoading(false)
      return
    }

    // Prevent multiple simultaneous requests
    if (loadingRef.current) {
      console.log('🚫 PollFeed: Already loading, skipping...')
      return
    }

    console.log('🔄 PollFeed: loadPolls called for authenticated user')
    
    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)
      
      const fetchedPolls = await getFeedPolls()
      console.log('🎉 PollFeed: getFeedPolls returned:', fetchedPolls?.length || 0, 'polls')
      
      if (Array.isArray(fetchedPolls)) {
        setPolls(fetchedPolls)
        
        // Load user votes for authenticated users
        await loadUserVotes(fetchedPolls)
        console.log('✅ PollFeed: Successfully set polls state')
      } else {
        console.error('❌ PollFeed: Invalid data format:', fetchedPolls)
        setPolls([])
        setError('Invalid data format received')
      }
      
    } catch (error) {
      console.error('❌ PollFeed: Error loading polls:', error)
      
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check Firestore security rules.')
      } else if (error.code === 'unavailable') {
        setError('Database temporarily unavailable. Please try again.')
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load polls')
      }
      setPolls([])
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  const loadUserVotes = async (pollList: Poll[]) => {
    if (!user) {
      console.log('🚫 No user, clearing votes')
      setUserVotes({})
      return
    }
    
    console.log('🔍 Loading votes for CURRENT USER using optimized approach:', user.uid, user.email)
    const votes: Record<string, Record<string, string[]>> = {}
    
    try {
      for (const poll of pollList) {
        if (poll.questions) {
          votes[poll.pollId] = {}
          console.log(`🗳️ Checking votes for poll: ${poll.pollId} (${poll.title})`)
          
          // Get detailed votes for this user on this poll
          const questionVotes = await getUserVotesForPoll(user.uid, poll.pollId)
          console.log(`📊 Raw votes for user ${user.uid} on poll ${poll.pollId}:`, questionVotes)
          
          for (const question of poll.questions) {
            // Filter to get votes for this specific question from this specific user
            const userQuestionVotes = questionVotes.filter(v => 
              v.questionId === question.id && 
              v.userUid === user.uid  // Extra safety check
            )
            
            if (userQuestionVotes.length > 0) {
              votes[poll.pollId][question.id] = userQuestionVotes[0].selectedOptions
              console.log(`✅ User ${user.uid} HAS voted on poll ${poll.pollId}, question ${question.id}:`, userQuestionVotes[0].selectedOptions)
            } else {
              console.log(`❌ User ${user.uid} has NOT voted on poll ${poll.pollId}, question ${question.id}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ PollFeed: Error in loadUserVotes:', error)
    }
    
    console.log('📋 Final votes state for user', user.uid, ':', votes)
    setUserVotes(votes)
  }

  // Clear votes when user changes and reload properly
  useEffect(() => {
    console.log('👤 User effect triggered, user:', user?.uid, user?.email)
    
    // Always clear votes first when user changes
    setUserVotes({})
    setSelectedOptions({})
    setVotingLoading({})
    
    if (user && polls.length > 0) {
      console.log('🔄 Reloading votes for new user')
      loadUserVotes(polls)
    }
  }, [user?.uid]) // Only track uid for account changes

  // Separate effect for when polls change
  useEffect(() => {
    if (user && polls.length > 0) {
      console.log('📊 Polls changed, reloading votes')
      loadUserVotes(polls)
    }
  }, [polls.length])

  const handleToggleOption = (pollId: string, questionId: string, optionId: string) => {
    // UPDATED: Remove isOwner restriction - allow owners to vote
    if (!user || userVotes[pollId]?.[questionId]) return
    
    const poll = polls.find(p => p.pollId === pollId)
    const question = poll?.questions?.find(q => q.id === questionId)
    
    // Check if multiple selections are allowed for this question
    const allowMultiple = question?.allowMultiple ?? poll?.allowMultipleChoices ?? false
    
    setSelectedOptions(prev => ({
      ...prev,
      [pollId]: {
        ...prev[pollId],
        [questionId]: (() => {
          const currentSelections = prev[pollId]?.[questionId] || []
          
          if (allowMultiple) {
            // Multiple choice: toggle the option
            return currentSelections.includes(optionId)
              ? currentSelections.filter(id => id !== optionId)
              : [...currentSelections, optionId]
          } else {
            // Single choice: replace the selection
            return currentSelections.includes(optionId) ? [] : [optionId]
          }
        })()
      }
    }))
  }

  const handleSubmitVote = async (pollId: string, questionId: string) => {
    if (!user) {
      console.log('❌ No user for voting')
      return
    }
    
    const selectedForQuestion = selectedOptions[pollId]?.[questionId]
    if (!selectedForQuestion?.length) {
      console.log('❌ No options selected')
      return
    }
    
    // Check if THIS USER has already voted
    const hasAlreadyVoted = userVotes[pollId]?.[questionId]
    if (hasAlreadyVoted) {
      console.log('❌ Current user has already voted on this question:', hasAlreadyVoted)
      return
    }

    console.log('🗳️ Attempting to submit vote for user:', user.uid)

    try {
      setVotingLoading(prev => ({ ...prev, [`${pollId}-${questionId}`]: true }))
      
      console.log('📝 Submitting vote to database...')
      await submitVote({
        pollId,
        questionId,
        userUid: user.uid,
        selectedOptions: selectedForQuestion
      })
      console.log('✅ Vote submitted successfully')

      // Update local state immediately
      setUserVotes(prev => ({
        ...prev,
        [pollId]: {
          ...prev[pollId],
          [questionId]: selectedForQuestion
        }
      }))
      
      setSelectedOptions(prev => ({
        ...prev,
        [pollId]: {
          ...prev[pollId],
          [questionId]: []
        }
      }))
      
      // CRITICAL FIX: Only check for poll completion after a small delay to ensure all votes are processed
      setTimeout(async () => {
        console.log('🎯 Checking if poll is now fully completed...')
        
        // First check if they already got points for this poll
        const alreadyRewarded = await hasReceivedPollCompletionPoints(user.uid, pollId)
        
        if (!alreadyRewarded) {
          const hasCompleted = await hasUserCompletedPoll(user.uid, pollId)
          
          if (hasCompleted) {
            console.log('🎉 User has completed the entire poll for the FIRST TIME!')
            
            console.log('🎁 Awarding poll completion points...')
            const poll = polls.find(p => p.pollId === pollId)
            const totalVotes = poll?.totalVotes || 0
            
            const pointsAwarded = await awardPollCompletionPoints(user.uid, pollId, totalVotes)
            
            console.log('✅ Poll completion points awarded:', pointsAwarded)
            
            // REMOVED: No more alert messages for successful point awards
            // Show points award silently through UI updates only
          } else {
            console.log('📊 Poll not yet fully completed by user')
          }
        } else {
          console.log('⚠️ User already received points for completing this poll')
        }
      }, 500)
      
      // Refresh data
      console.log('🔄 Refreshing polls after successful vote...')
      await loadPolls()
      onRefresh?.()
      
    } catch (error) {
      console.error('❌ Error submitting vote:', error)
      
      // Show specific error messages based on error type
      if (error.message?.includes('already voted')) {
        alert('You have already voted on this question.')
      } else if (error.message?.includes('Permission denied')) {
        alert('Permission denied. Please sign out and sign in again, then try voting.')
      } else if (error.code === 'permission-denied') {
        alert('Permission denied. Please check your internet connection and try again.')
      } else if (error.code === 'unavailable') {
        alert('Database temporarily unavailable. Please try again in a moment.')
      } else {
        alert(`Failed to submit vote: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setVotingLoading(prev => ({ ...prev, [`${pollId}-${questionId}`]: false }))
    }
  }

  // NEW: Handle final poll submission for multi-question polls
  const handleFinalSubmit = async (pollId: string) => {
    if (!user || !selectedPoll) return
    
    const totalQuestions = selectedPoll.questions?.length || 0
    const answeredQuestions = Object.keys(userVotes[pollId] || {}).length
    
    if (answeredQuestions < totalQuestions) {
      alert(`Please answer all ${totalQuestions} questions before submitting the poll.`)
      return
    }

    setFinalSubmitLoading(prev => ({ ...prev, [pollId]: true }))

    try {
      console.log('🎯 Final poll submission - checking for points award...')
      
      // Check if they already got points for this poll
      const alreadyRewarded = await hasReceivedPollCompletionPoints(user.uid, pollId)
      
      if (!alreadyRewarded) {
        const hasCompleted = await hasUserCompletedPoll(user.uid, pollId)
        
        if (hasCompleted) {
          console.log('🎉 User has completed the entire poll for the FIRST TIME!')
          
          const poll = polls.find(p => p.pollId === pollId)
          const totalVotes = poll?.totalVotes || 0
          
          const pointsAwarded = await awardPollCompletionPoints(user.uid, pollId, totalVotes)
          
          console.log('✅ Poll completion points awarded:', pointsAwarded)
          
          // REMOVED: No more alert messages for successful submissions
          // Points will be shown through UI updates and animations

          // Close modal and refresh
          closeVotingModal()
          await loadPolls()
          onRefresh?.()
        }
      } else {
        console.log('⚠️ User already received points for completing this poll')
        closeVotingModal()
      }
    } catch (error) {
      console.error('❌ Error in final poll submission:', error)
      alert('Error submitting poll. Please try again.')
    } finally {
      setFinalSubmitLoading(prev => ({ ...prev, [pollId]: false }))
    }
  }

  const openVotingModal = (poll: Poll) => {
    setSelectedPoll(poll)
    setVotingModal(true)
  }

  const closeVotingModal = () => {
    setSelectedPoll(null)
    setVotingModal(false)
  }

  useEffect(() => {
    console.log('🎯 PollFeed: useEffect triggered, user exists:', !!user)
    if (!authLoading) {
      loadPolls()
    }
  }, [user, authLoading])

  // Listen for manual refresh events
  useEffect(() => {
    const handleManualRefresh = () => {
      console.log('🔄 PollFeed: Manual refresh event received')
      loadPolls()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('manualRefresh', handleManualRefresh)
      
      return () => {
        window.removeEventListener('manualRefresh', handleManualRefresh)
      }
    }
  }, [])

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {showRandomPolls ? (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl px-6 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Globe className="w-6 h-6 text-blue-400" />
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Community Polls
                  </h2>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
              </div>
            </motion.div>
          ) : (
            <h2 className="text-xl sm:text-2xl font-bold text-foreground text-blue">
              Latest Polls
            </h2>
          )}
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm bg-warning/10 text-warning px-3 py-2 rounded-full border border-warning/20">
                <Star className="w-4 h-4 text-yellow-200" />
                <span className="font-medium text-white">+5 points per poll completed</span>
                <span className="text-xs opacity-90 text-yellow-200">({userPoints} total)</span>
              </div>
            )}
            
            <button 
              onClick={() => {
                console.log('🔄 PollFeed: Refresh button clicked')
                loadPolls()
                onRefresh?.()
              }}
              className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border/30 text-foreground px-4 py-2 rounded-xl font-medium text-sm hover:bg-muted/70 transition-all hover:scale-105 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Poll List */}
        <div className="space-y-2 sm:space-y-3">
          {polls.map((poll, index) => {
            const pollId = poll.pollId || poll.id || `poll-${index}`
            const pollTitle = poll.title || 'Untitled Poll'
            const pollOwner = poll.ownerName || 'Anonymous'
            const pollQuestions = poll.questions || []
            const totalVotes = poll.totalVotes || 0
            const createdAt = poll.createdAt instanceof Date ? poll.createdAt : 
                            poll.createdAt?.seconds ? new Date(poll.createdAt.seconds * 1000) : new Date()
            const hasVotedAny = pollQuestions.some(q => userVotes[pollId]?.[q.id])

            return (
              <motion.div
                key={pollId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-lg hover:shadow-md transition-all cursor-pointer group"
                onClick={() => user ? openVotingModal(poll) : null}
              >
                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* User Profile - Responsive */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
                        {poll.ownerImage ? (
                          <img 
                            src={poll.ownerImage} 
                            alt={pollOwner}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full flex items-center justify-center ${poll.ownerImage ? 'hidden' : 'flex'}`}
                        >
                          <span className="text-primary font-bold text-xs sm:text-sm">
                            {pollOwner.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* User Info - Hidden on mobile to save space */}
                      <div className="hidden sm:block min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {pollOwner}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Poll Title and Stats - Responsive */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate mb-1">
                        {pollTitle}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="hidden xs:inline">{totalVotes} votes</span>
                          <span className="xs:hidden">{totalVotes}</span>
                        </span>
                        <span className="hidden sm:inline">
                          {pollQuestions.length} question{pollQuestions.length !== 1 ? 's' : ''}
                        </span>
                        <span className="sm:hidden">
                          {pollQuestions.length}Q
                        </span>
                        {poll.tags && poll.tags.length > 0 && (
                          <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full hidden sm:inline">
                            #{poll.tags[0]}
                          </span>
                        )}
                        {/* Show date on mobile since it's hidden in user info */}
                        <span className="sm:hidden text-xs">
                          {createdAt.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Status and Action */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {user ? (
                        <>
                          {hasVotedAny && (
                            <div className="bg-success/20 text-success px-2 py-1 rounded-full font-medium text-xs">
                              <span className="hidden sm:inline">✓ Voted</span>
                              <span className="sm:hidden">✓</span>
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </>
                      ) : (
                        <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                          <Lock className="w-3 h-3" />
                          <span className="hidden sm:inline">Sign in to vote</span>
                          <span className="sm:hidden">Sign in</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Voting Modal - Responsive */}
      <AnimatePresence>
        {votingModal && selectedPoll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeVotingModal}
            />

            {/* Modal - Responsive sizing with increased desktop height */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] bg-card rounded-xl border border-border shadow-2xl overflow-hidden"
            >
              {/* Header - Responsive */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
                    {selectedPoll.ownerImage ? (
                      <img 
                        src={selectedPoll.ownerImage} 
                        alt={selectedPoll.ownerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full flex items-center justify-center ${selectedPoll.ownerImage ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-primary font-bold text-xs sm:text-sm">
                        {selectedPoll.ownerName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{selectedPoll.title}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      by {selectedPoll.ownerName} • {selectedPoll.totalVotes} votes
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeVotingModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Points Reward Info */}
              {user && (
                <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-3 sm:p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 text-warning">
                    <Star className="w-4 h-4" />
                    <span className="text-sm sm:text-base font-medium">
                      {selectedPoll.ownerUid === user.uid ? (
                        "You can vote on your own poll but won't earn points"
                      ) : (
                        "Earn 5 points for completing this entire poll (answer all questions)"
                      )}
                    </span>
                  </div>
                  {selectedPoll.questions && selectedPoll.questions.length > 1 && (
                    <div className="mt-2 text-xs text-warning/80">
                      {selectedPoll.ownerUid === user.uid ? (
                        "Poll creators can participate but don't receive point rewards"
                      ) : (
                        `Must answer all ${selectedPoll.questions.length} questions to earn points`
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Content - Responsive scrolling with increased height */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                <div className="space-y-6 sm:space-y-8">
                  {selectedPoll.questions?.map((question, qIndex) => {
                    const pollId = selectedPoll.pollId
                    const hasVoted = userVotes[pollId]?.[question.id]
                    const selectedForQuestion = selectedOptions[pollId]?.[question.id] || []
                    const isVotingOnQuestion = votingLoading[`${pollId}-${question.id}`]

                    return (
                      <div key={question.id} className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">
                          {selectedPoll.questions!.length > 1 ? `${qIndex + 1}. ` : ''}{question.question}
                        </h3>
                        
                        <div className="space-y-2 sm:space-y-3">
                          {question.options?.map((option, optionIndex) => {
                            const percentage = question.totalVotes > 0 
                              ? (option.votesCount / question.totalVotes) * 100 
                              : 0
                            const isSelected = selectedForQuestion.includes(option.id)
                            const userVotedForThis = hasVoted?.includes(option.id)
                            
                            // Check if multiple selections are allowed
                            const allowMultiple = question.allowMultiple ?? selectedPoll.allowMultipleChoices ?? false

                            return (
                              <button
                                key={option.id || optionIndex}
                                onClick={() => handleToggleOption(pollId, question.id, option.id)}
                                disabled={hasVoted || isVotingOnQuestion}
                                className={`w-full text-left transition-all rounded-lg overflow-hidden border ${
                                  hasVoted ? 'cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'
                                } ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
                              >
                                <div className="relative p-3 sm:p-4">
                                  <div className="flex justify-between items-start sm:items-center relative z-10 mb-2">
                                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                      {!hasVoted && (
                                        <div className={`w-4 h-4 sm:w-5 sm:h-5 ${allowMultiple ? 'rounded' : 'rounded-full'} border-2 transition-all flex-shrink-0 mt-0.5 sm:mt-0 ${
                                          isSelected ? 'bg-primary border-primary' : 'border-primary/30'
                                        } flex items-center justify-center`}>
                                          {isSelected && (
                                            <span className="text-white text-xs font-bold leading-none">
                                              {allowMultiple ? '✓' : '●'}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      {userVotedForThis && (
                                        <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-success border-2 border-success ${allowMultiple ? 'rounded' : 'rounded-full'} flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0`}>
                                          <span className="text-white text-xs font-bold leading-none">
                                            {allowMultiple ? '✓' : '●'}
                                          </span>
                                        </div>
                                      )}
                                      <span className={`text-sm sm:text-base font-medium ${
                                        isSelected || userVotedForThis ? 'text-primary' : 'text-foreground'
                                      }`}>
                                        {option.text}
                                      </span>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                      <span className="text-xs sm:text-sm font-bold text-muted-foreground">
                                        {option.votesCount || 0}
                                      </span>
                                      {percentage > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                          {Math.round(percentage)}%
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Progress bar */}
                                  <div className="w-full bg-muted/50 rounded-full h-1.5 sm:h-2">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 0.5, ease: 'easeOut' }}
                                      className={`h-full rounded-full ${
                                        isSelected || userVotedForThis
                                          ? 'bg-primary'
                                          : 'bg-accent'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        {/* Vote Button - Responsive */}
                        {!hasVoted && selectedForQuestion.length > 0 && (
                          <button
                            onClick={() => handleSubmitVote(pollId, question.id)}
                            disabled={isVotingOnQuestion}
                            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 text-sm sm:text-base"
                          >
                            {isVotingOnQuestion ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Voting...
                              </div>
                            ) : (
                              <>✓ Submit Vote {selectedPoll.questions!.length > 1 ? `for Question ${qIndex + 1}` : ''}</>
                            )}
                          </button>
                        )}

                        {/* Already voted indicator */}
                        {hasVoted && (
                          <div className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-success/20 text-success font-bold rounded-lg text-center text-sm sm:text-base">
                            ✓ You voted on this question
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Final Submit Button for Multi-Question Polls */}
                  {selectedPoll.questions && selectedPoll.questions.length > 1 && (
                    <div className="mt-8 pt-6 border-t border-border">
                      {(() => {
                        const totalQuestions = selectedPoll.questions.length
                        const answeredQuestions = Object.keys(userVotes[selectedPoll.pollId] || {}).length
                        const allAnswered = answeredQuestions === totalQuestions
                        const isSubmitting = finalSubmitLoading[selectedPoll.pollId]

                        return (
                          <div className="text-center space-y-4">
                            <div className="text-sm text-muted-foreground">
                              Progress: {answeredQuestions} of {totalQuestions} questions answered
                            </div>
                            
                            {allAnswered ? (
                              <button
                                onClick={() => handleFinalSubmit(selectedPoll.pollId)}
                                disabled={isSubmitting}
                                className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary/80 text-white font-bold rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all disabled:opacity-50 text-lg shadow-lg"
                              >
                                {isSubmitting ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting Poll...
                                  </div>
                                ) : (
                                  <>🎉 Submit Complete Poll & Earn Points</>
                                )}
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full px-6 py-4 bg-muted text-muted-foreground font-bold rounded-lg cursor-not-allowed text-lg"
                              >
                                Answer all questions to submit poll
                              </button>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer - Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 border-t border-border bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  {selectedPoll.tags && selectedPoll.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {selectedPoll.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={closeVotingModal}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
