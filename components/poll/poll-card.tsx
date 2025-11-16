'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { submitVote, getUserVotesForPoll } from '@/lib/db-service'
import { awardPoints, calculatePoints } from '@/lib/points-service'
import { BoostModal } from './boost-modal'
import { ExportButton } from './export-button'
import { RequestDataModal } from './request-data-modal'

interface PollOption {
  id: string
  text: string
  votesCount: number
}

interface PollCardProps {
  pollId: string
  title: string
  creator: string
  creatorImage?: string
  ownerUid?: string
  options: PollOption[]
  totalVotes: number
  tags: string[]
  boosted?: boolean
  boostTimeLeft?: number
  onAnswer: (optionId: string) => void
  onRefresh?: () => void
  userPoints?: number
}

export function PollCard({
  pollId,
  title,
  creator,
  creatorImage,
  ownerUid,
  options,
  totalVotes,
  tags,
  boosted,
  boostTimeLeft,
  onAnswer,
  onRefresh,
  userPoints = 0
}: PollCardProps) {
  const { user } = useAuth()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false)
  const [isRequestDataModalOpen, setIsRequestDataModalOpen] = useState(false)
  const isOwner = user?.uid === ownerUid

  const maxVotes = Math.max(...options.map(o => o.votesCount), 1)

  useEffect(() => {
    const checkIfVoted = async () => {
      if (user) {
        const votes = await getUserVotesForPoll(user.uid, pollId)
        if (votes.length > 0) {
          setHasVoted(true)
        }
      }
    }
    
    checkIfVoted()
  }, [user, pollId])

  const handleToggleOption = (optionId: string) => {
    if (hasVoted || isOwner) return
    
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }

  const handleSubmitVote = async () => {
    if (!user || selectedOptions.length === 0 || hasVoted) return

    try {
      setLoading(true)
      const points = calculatePoints(totalVotes)
      
      await submitVote({
        pollId,
        userUid: user.uid,
        selectedOptions
      })

      await awardPoints(user.uid, pollId, points)
      
      setPointsEarned(points)
      setShowPointsAnimation(true)
      setHasVoted(true)
      
      onRefresh?.()
      
      setTimeout(() => setShowPointsAnimation(false), 2000)
    } catch (error) {
      console.error('Error submitting vote:', error)
    } finally {
      setLoading(false)
    }
  }

  const pollData = {
    pollId,
    title,
    ownerName: creator,
    ownerImage: creatorImage,
    options,
    totalVotes,
    tags
  }

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
          className="absolute top-4 right-4 text-2xl font-black text-success"
        >
          +{pointsEarned} pts
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {creatorImage && (
            <img
              src={creatorImage || "/placeholder.svg"}
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
          {hasVoted && (
            <div className="bg-success/20 text-success px-3 py-1 rounded-full font-bold text-xs">
              ✓ Answered
            </div>
          )}
          {boosted && (
            <div className="bg-warning text-black px-3 py-1 rounded-full font-bold text-xs">
              🚀 BOOSTED
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-black mb-4 text-foreground">{title}</h3>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <span
              key={tag}
              className="text-xs bg-accent/20 text-accent font-bold px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-4">
        {options.map(option => {
          const percentage = totalVotes > 0 ? (option.votesCount / totalVotes) * 100 : 0
          const isSelected = selectedOptions.includes(option.id)
          
          return (
            <button
              key={option.id}
              onClick={() => handleToggleOption(option.id)}
              disabled={hasVoted || isOwner}
              className={`w-full text-left group transition-all ${
                hasVoted || isOwner ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isSelected
                  ? 'ring-2 ring-primary rounded-2xl'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {!hasVoted && !isOwner && (
                    <div className={`w-5 h-5 rounded border-2 transition-all ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-primary/30 group-hover:border-primary'
                    }`}>
                      {isSelected && <span className="text-white text-center text-xs">✓</span>}
                    </div>
                  )}
                  <span className={`font-bold text-sm group-hover:text-primary transition-colors ${
                    isSelected ? 'text-primary' : ''
                  }`}>
                    {option.text}
                  </span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {option.votesCount} {option.votesCount === 1 ? 'vote' : 'votes'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full overflow-hidden h-6 border-2 border-primary/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full flex items-center px-2 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary to-primary-light'
                      : 'bg-gradient-to-r from-accent to-accent-light'
                  }`}
                >
                  {percentage > 20 && (
                    <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
                  )}
                </motion.div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Vote Button & Actions */}
      <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span>📊 {totalVotes} votes</span>
        </div>
        
        {!hasVoted && !isOwner ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmitVote()}
              disabled={loading || selectedOptions.length === 0}
              className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm comic-shadow hover:comic-shadow-hover transition-all disabled:opacity-50"
            >
              {loading ? '...' : '✓ Vote'}
            </button>
            <button
              onClick={() => setIsRequestDataModalOpen(true)}
              className="text-xs font-bold text-accent hover:text-accent-dark transition-colors"
            >
              📥 Request Data
            </button>
          </div>
        ) : isOwner ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsBoostModalOpen(true)}
              className="px-4 py-2 bg-warning text-black font-bold rounded-xl text-sm comic-shadow hover:comic-shadow-hover transition-all"
            >
              🚀 Boost
            </button>
            <ExportButton poll={pollData as any} />
          </div>
        ) : (
          <button
            onClick={() => setIsRequestDataModalOpen(true)}
            className="text-xs font-bold text-accent hover:text-accent-dark transition-colors"
          >
            📥 Request Data
          </button>
        )}
      </div>

      {/* Request Data Modal */}
      <RequestDataModal
        isOpen={isRequestDataModalOpen}
        pollId={pollId}
        pollTitle={title}
        onClose={() => setIsRequestDataModalOpen(false)}
        onSuccess={() => {
          setIsRequestDataModalOpen(false)
        }}
      />

      {/* Boost Modal */}
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
