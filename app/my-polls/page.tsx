'use client'

import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { useAuth } from '../../lib/auth-context'
import { getUserPolls } from '../../lib/db-service'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Users, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Poll {
  pollId: string
  title: string
  description?: string
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
  tags: string[]
  visible: boolean
}

export default function MyPollsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [polls, setPolls] = useState<Poll[]>([])
  const [pollsLoading, setPollsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserPolls = async () => {
      if (!user) return
      
      try {
        setPollsLoading(true)
        const userPolls = await getUserPolls(user.uid)
        setPolls(userPolls)
      } catch (err) {
        console.error('Error loading user polls:', err)
        setError('Failed to load your polls')
      } finally {
        setPollsLoading(false)
      }
    }

    if (user) {
      loadUserPolls()
    }
  }, [user])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please sign in to view your polls.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Polls</h1>
            <p className="text-muted-foreground mt-2">
              Manage and view your created polls
            </p>
          </div>
          <button
            onClick={() => router.push('/create-poll')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Poll
          </button>
        </div>

        {/* Loading State */}
        {pollsLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading your polls...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 bg-card rounded-lg border border-red-200">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2 text-red-600">Database Configuration Required</h3>
            <p className="text-red-500 mb-4 max-w-md mx-auto">
              {error}
            </p>
            {error.includes('index') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-lg mx-auto">
                <p className="text-sm text-red-700 mb-2">
                  <strong>Firestore index required.</strong> Please run this command:
                </p>
                <code className="bg-red-100 px-2 py-1 rounded text-xs text-red-800">
                  firebase deploy --only firestore:indexes
                </code>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!pollsLoading && !error && polls.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg border">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2 text-foreground">No Polls Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't created any polls yet. Create your first poll to get started!
            </p>
            <button
              onClick={() => router.push('/create-poll')}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First Poll
            </button>
          </div>
        )}

        {/* Polls List */}
        {!pollsLoading && !error && polls.length > 0 && (
          <div className="space-y-4">
            {polls.map((poll, index) => (
              <motion.div
                key={poll.pollId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {poll.title}
                    </h3>
                    {poll.description && (
                      <p className="text-muted-foreground mb-3">
                        {poll.description}
                      </p>
                    )}
                    
                    {/* Tags */}
                    {poll.tags && poll.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {poll.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      poll.visible 
                        ? 'bg-success/20 text-success' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {poll.visible ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{poll.totalVotes} votes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{poll.questions.length} question{poll.questions.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{poll.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/poll/${poll.pollId}`)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    View Poll
                  </button>
                  <button
                    onClick={() => router.push(`/poll/${poll.pollId}/results`)}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                  >
                    View Results
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
