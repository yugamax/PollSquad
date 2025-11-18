'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { submitVote, getUserVotesForPoll } from '@/lib/db-service'
import { awardPoints, calculatePoints, awardPollCompletionPoints } from '@/lib/points-service'
import { hasUserCompletedPoll, hasReceivedPollCompletionPoints, hasUserVotedOnPoll } from '@/lib/db-service'
import { BoostModal } from './boost-modal'
import { ExportButton } from './export-button'
import { RequestDataModal } from './request-data-modal'
import { Users, Calendar, TrendingUp } from 'lucide-react'

interface PollOption {
  id: string
  text: string
  votesCount: number
}

interface PollQuestion {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
}

interface PollCardProps {
  pollId: string
  title: string
  description?: string
  creator: string
  creatorImage?: string
  ownerUid: string
  questions: PollQuestion[]
  totalVotes: number
  tags: string[]
  boosted?: boolean
  boostTimeLeft?: number
  createdAt: Date
  onRefresh?: () => void
  userPoints?: number
}

export function PollCard({
  pollId,
  title,
  description,
  creator,
  creatorImage,
  ownerUid,
  questions = [],
  totalVotes,
  tags = [],
  boosted,
  boostTimeLeft,
  createdAt,
  onRefresh,
  userPoints = 0
}: PollCardProps) {
  const { user, refreshUserData } = useAuth()
  const [userVotes, setUserVotes] = useState<Record<string, string[]>>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false)
  const [isRequestDataModalOpen, setIsRequestDataModalOpen] = useState(false)
  const isOwner = user?.uid === ownerUid

  useEffect(() => {
    const checkIfVoted = async () => {
      if (user && questions.length > 0) {
        console.log('🔍 Checking votes for user using optimized approach:', user.uid, user.email)
        
        // First check if user has voted at all using voters array
        const hasVotedOnPoll = await hasUserVotedOnPoll(user.uid, pollId)
        
        if (!hasVotedOnPoll) {
          console.log(`⚠️ User ${user.uid} not in voters array for poll ${pollId}, no detailed check needed`)
          setUserVotes({})
          return
        }
        
        console.log(`🗳️ User in voters array, checking detailed votes for poll: ${pollId}`)
        
        // Get detailed votes only if user is in voters array
        const votes: Record<string, string[]> = {}
        const allVotes = await getUserVotesForPoll(user.uid, pollId)
        
        for (const question of questions) {
          const userQuestionVotes = allVotes.filter(v => 
            v.questionId === question.id && 
            v.userUid === user.uid // Ensure votes belong to current user
          )
          if (userQuestionVotes.length > 0) {
            votes[question.id] = userQuestionVotes[0].selectedOptions
            console.log(`✅ User ${user.uid} has voted on question ${question.id}`)
          }
        }
        setUserVotes(votes)
      } else {
        // Clear votes when no user
        setUserVotes({})
        setSelectedOptions({})
      }
    }
    
    checkIfVoted()
  }, [user?.uid, pollId, questions]) // Track user.uid for account changes

  const handleToggleOption = (questionId: string, optionId: string) => {
    if (userVotes[questionId] || isOwner || !user) return
    
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: prev[questionId]?.includes(optionId)
        ? prev[questionId].filter(id => id !== optionId)
        : [...(prev[questionId] || []), optionId]
    }))
  }

  const handleSubmitVote = async (questionId: string) => {
    if (!user || !selectedOptions[questionId]?.length || userVotes[questionId]) return

    try {
      setLoading(true)
      
      await submitVote({
        pollId,
        questionId,
        userUid: user.uid,
        selectedOptions: selectedOptions[questionId]
      })

      setUserVotes(prev => ({ ...prev, [questionId]: selectedOptions[questionId] }))
      setSelectedOptions(prev => ({ ...prev, [questionId]: [] }))
      
      // CRITICAL FIX: Only check for poll completion after a small delay
      setTimeout(async () => {
        console.log('🎯 Checking if poll is now fully completed...')
        
        // First check if they already got points for this poll
        const alreadyRewarded = await hasReceivedPollCompletionPoints(user.uid, pollId)
        
        if (!alreadyRewarded) {
          const hasCompleted = await hasUserCompletedPoll(user.uid, pollId)
          
          if (hasCompleted) {
            console.log('🎉 User has completed the entire poll for the FIRST TIME!')
            
            console.log('🎁 Awarding poll completion points...')
            const pointsAwarded = await awardPollCompletionPoints(user.uid, pollId, totalVotes)
            
            setPointsEarned(pointsAwarded)
            setShowPointsAnimation(true)
            setTimeout(() => setShowPointsAnimation(false), 2000)
            
            console.log('✅ Poll completion points awarded:', pointsAwarded)
          }
        } else {
          console.log('⚠️ User already received points for completing this poll')
        }
      }, 500) // Small delay to ensure vote processing is complete
      
      onRefresh?.()
      
    } catch (error) {
      console.error('Error submitting vote:', error)
    } finally {
      setLoading(false)
    }
  }

  // Safety check - must have questions
  if (!questions || questions.length === 0) {
    return null // Don't render at all if no questions
  }

  const hasVotedAny = Object.keys(userVotes).length > 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl p-6 border-4 comic-shadow transition-all relative ${
        boosted
          ? 'bg-warning/5 border-warning'
          : 'bg-white border-primary/20'
      }`}
    >
      {/* Points Animation */}
      {showPointsAnimation && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -40 }}
          transition={{ duration: 1.5 }}
          className="absolute top-4 right-4 text-2xl font-black text-success z-10"
        >
          +{pointsEarned} pts
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {creatorImage && (
            <img
              src={creatorImage}
              alt={creator}
              className="w-10 h-10 rounded-full border-2 border-primary"
            />
          )}
          <div>
            <p className="font-bold text-sm">{creator}</p>
            <p className="text-xs text-muted-foreground">@{creator.split(' ')[0].toLowerCase()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasVotedAny && (
            <div className="bg-success/20 text-success px-3 py-1 rounded-full font-bold text-xs">
              ✓ Voted
            </div>
          )}
          {boosted && (
            <div className="bg-warning text-black px-3 py-1 rounded-full font-bold text-xs">
              🚀 BOOSTED
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-black mb-2 text-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs bg-accent/20 text-accent font-bold px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{tags.length - 3} more</span>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6 mb-4">
        {questions.map((question, qIndex) => {
          const hasVotedThisQuestion = userVotes[question.id]
          const selectedForThisQuestion = selectedOptions[question.id] || []
          
          // Skip if no options
          if (!question.options || question.options.length === 0) {
            return null
          }
          
          return (
            <div key={question.id} className="border border-border/50 rounded-2xl p-4 bg-muted/10">
              <h4 className="font-bold text-base mb-3 text-foreground">
                {questions.length > 1 ? `${qIndex + 1}. ` : ''}{question.question}
              </h4>

              <div className="space-y-2 mb-3">
                {question.options.map((option, optIndex) => {
                  const percentage = question.totalVotes > 0 ? (option.votesCount / question.totalVotes) * 100 : 0
                  const isSelected = selectedForThisQuestion.includes(option.id)
                  const userVoted = hasVotedThisQuestion?.includes(option.id)
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleToggleOption(question.id, option.id)}
                      disabled={hasVotedThisQuestion || isOwner || !user}
                      className={`w-full text-left group transition-all ${
                        hasVotedThisQuestion || isOwner || !user ? 'cursor-not-allowed' : 'cursor-pointer'
                      } ${isSelected || userVoted ? 'ring-2 ring-primary rounded-xl' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {user && !hasVotedThisQuestion && !isOwner && (
                            <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
                              isSelected ? 'bg-primary border-primary' : 'border-primary/30 group-hover:border-primary'
                            }`}>
                              {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                            </div>
                          )}
                          {userVoted && (
                            <div className="w-4 h-4 bg-success border-2 border-success rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          )}
                          <span className={`font-medium text-sm ${
                            isSelected || userVoted ? 'text-primary' : 'group-hover:text-primary transition-colors'
                          }`}>
                            {option.text}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          {option.votesCount || 0}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full overflow-hidden h-4 border border-primary/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`h-full rounded-full flex items-center px-2 ${
                            isSelected || userVoted
                              ? 'bg-gradient-to-r from-primary to-primary/80'
                              : 'bg-gradient-to-r from-accent to-accent/80'
                          }`}
                        >
                          {percentage > 15 && (
                            <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
                          )}
                        </motion.div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Vote button */}
              {user && !hasVotedThisQuestion && !isOwner && selectedForThisQuestion.length > 0 && (
                <button
                  onClick={() => handleSubmitVote(question.id)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm comic-shadow hover:comic-shadow-hover transition-all disabled:opacity-50"
                >
                  {loading ? 'Voting...' : `✓ Vote${questions.length > 1 ? ` on Question ${qIndex + 1}` : ''}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {totalVotes} votes
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {createdAt.toLocaleDateString()}
          </span>
        </div>
        
        {user ? (
          <div className="flex gap-2">
            {isOwner ? (
              <>
                <button
                  onClick={() => setIsBoostModalOpen(true)}
                  className="px-3 py-1 bg-warning text-black font-bold rounded-lg text-xs comic-shadow hover:comic-shadow-hover transition-all"
                >
                  🚀 Boost
                </button>
                <ExportButton poll={{ pollId, title, ownerName: creator, questions, totalVotes } as any} />
              </>
            ) : (
              <button
                onClick={() => setIsRequestDataModalOpen(true)}
                className="text-xs font-bold text-accent hover:text-accent-dark transition-colors"
              >
                📥 Request Data
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            🔒 Sign in to vote
          </div>
        )}
      </div>

      {/* Modals */}
      <RequestDataModal
        isOpen={isRequestDataModalOpen}
        pollId={pollId}
        pollTitle={title}
        onClose={() => setIsRequestDataModalOpen(false)}
        onSuccess={() => setIsRequestDataModalOpen(false)}
      />

      <BoostModal
        isOpen={isBoostModalOpen}
        pollId={pollId}
        onClose={() => setIsBoostModalOpen(false)}
        onSuccess={() => {
          setIsBoostModalOpen(false)
          onRefresh?.()
        }}
        userPoints={userPoints}
      />
    </motion.div>
  )
}
