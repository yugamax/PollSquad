'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, TrendingUp } from 'lucide-react'

interface Poll {
  id: string
  title: string
  options: string[]
  createdAt: Date
  boostedUntil?: Date
  votes: Record<string, number>
}

interface PollFeedProps {
  onRefresh?: () => void
  showRandomPolls?: boolean
}

export function PollFeed({ onRefresh, showRandomPolls = false }: PollFeedProps) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setPolls([])
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground mt-4">Loading polls...</p>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12 card-elevated">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-bold mb-2 text-foreground">No Polls Available</h3>
        <p className="text-muted-foreground">
          Be the first to create a poll and start the conversation!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {showRandomPolls ? 'Community Polls' : 'Latest Polls'}
        </h2>
        <button 
          onClick={onRefresh}
          className="text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll, index) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-elevated p-6 hover:shadow-lg transition-all cursor-pointer"
          >
            <h3 className="font-semibold text-foreground text-lg mb-4">
              {poll.title}
            </h3>

            <div className="space-y-2 mb-4">
              {poll.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  className="w-full text-left p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <span className="text-foreground">{option}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{Object.values(poll.votes || {}).reduce((a, b) => a + b, 0)} votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{poll.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
