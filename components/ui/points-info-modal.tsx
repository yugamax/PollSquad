'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Trophy, Zap, Gift } from 'lucide-react'

interface PointsInfoModalProps {
  isOpen: boolean
  onClose: () => void
  currentPoints: number
}

export function PointsInfoModal({ isOpen, onClose, currentPoints }: PointsInfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm sm:max-w-xl lg:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-card rounded-xl sm:rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-warning/10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Points System</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    You have <span className="font-bold text-warning">{currentPoints}</span> points
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              <div className="space-y-4 sm:space-y-6">
                {/* How to Earn Points */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    How to Earn Points
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-success font-bold text-xs sm:text-sm">5</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-success text-sm sm:text-base">Complete a Poll</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Answer ALL questions in a poll to earn 5 points. You can only earn points once per poll.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-bold text-xs sm:text-sm">+10</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-accent text-sm sm:text-base">Consecutive Poll Bonus</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          For consecutive 5 poll answering extra 10 credit will be provided.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-xs sm:text-sm">30</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-primary text-sm sm:text-base">Starting Bonus</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          New accounts automatically start with 30 points to get you started.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Use Points */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                    How to Use Points
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-warning text-sm sm:text-base">Boost Your Polls</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Spend 60-240 points to boost your polls and get more visibility and responses.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-secondary text-sm sm:text-base">Future Features</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          More ways to use points coming soon: premium themes, advanced analytics, and exclusive features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boost Pricing */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">💰 Boost Pricing</h3>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span>🕐 6 Hours</span>
                      <span className="font-bold text-warning">60 points</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span>📅 24 Hours</span>
                      <span className="font-bold text-warning">120 points</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span>🗓️ 3 Days</span>
                      <span className="font-bold text-warning">240 points</span>
                    </div>
                  </div>
                </div>

                {/* Points Rules */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">📋 Important Rules</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-success mt-0.5">•</span>
                      <span>Points are awarded only once per poll completion</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-success mt-0.5">•</span>
                      <span>You must answer ALL questions in a poll to earn points</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-success mt-0.5">•</span>
                      <span>Every 5 consecutive poll completions earn +10 bonus points</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-warning mt-0.5">•</span>
                      <span><strong>Poll creators can vote on their own polls but won't earn points</strong></span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-success mt-0.5">•</span>
                      <span>Points cannot be transferred between accounts</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-success mt-0.5">•</span>
                      <span>Your points balance is updated in real-time</span>
                    </div>
                  </div>
                </div>

                {/* Current Status */}
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">📊 Your Status</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-warning">{currentPoints}</div>
                      <div className="text-xs text-muted-foreground">Current Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {Math.floor(currentPoints / 60)}
                      </div>
                      <div className="text-xs text-muted-foreground">Possible Boosts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-t border-border bg-muted/20">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Points are updated automatically when you complete polls
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto text-sm sm:text-base"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
