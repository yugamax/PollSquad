'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { submitDataRequest, checkExistingRequest } from '@/lib/request-service'
import { motion, AnimatePresence } from 'framer-motion'

interface RequestDataModalProps {
  isOpen: boolean
  pollId: string
  pollTitle: string
  onClose: () => void
  onSuccess: () => void
}

export function RequestDataModal({
  isOpen,
  pollId,
  pollTitle,
  onClose,
  onSuccess
}: RequestDataModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [hasExistingRequest, setHasExistingRequest] = useState(false)
  const [existingStatus, setExistingStatus] = useState<'pending' | 'approved' | 'denied'>('pending')

  useEffect(() => {
    if (isOpen && user) {
      checkExisting()
    }
  }, [isOpen, user])

  const checkExisting = async () => {
    if (!user) return
    try {
      const existing = await checkExistingRequest(pollId, user.uid)
      if (existing) {
        setHasExistingRequest(true)
        setExistingStatus(existing.status)
      }
    } catch (error) {
      console.error('Error checking request:', error)
    }
  }

  const handleSubmitRequest = async () => {
    if (!user) return

    try {
      setLoading(true)
      await submitDataRequest(
        pollId,
        user.uid,
        user.displayName || 'Anonymous',
        user.email || ''
      )

      setHasExistingRequest(true)
      setExistingStatus('pending')
      
      // Trigger email notification (would be handled by Cloud Function)
      console.log('Data request submitted - email notification would be sent')
      
      onSuccess()
      setTimeout(() => onClose(), 2000)
    } catch (error) {
      console.error('Error submitting request:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl p-8 comic-shadow border-4 border-accent">
              <h2 className="text-3xl font-black mb-2 text-accent">Request Poll Data</h2>
              <p className="text-muted-foreground mb-6">
                Ask the poll owner for access to detailed results
              </p>

              {/* Poll Info */}
              <div className="bg-accent/5 rounded-2xl p-4 mb-6 border-2 border-accent/20">
                <p className="font-bold text-sm mb-1">Poll:</p>
                <p className="text-lg font-black">{pollTitle}</p>
              </div>

              {/* Existing Request Status */}
              {hasExistingRequest && (
                <div className={`rounded-2xl p-4 mb-6 border-2 font-bold text-sm ${
                  existingStatus === 'approved'
                    ? 'bg-success/10 border-success text-success'
                    : existingStatus === 'denied'
                    ? 'bg-danger/10 border-danger text-danger'
                    : 'bg-warning/10 border-warning text-warning'
                }`}>
                  {existingStatus === 'approved' && '✓ Your request was approved! Check your email for the data.'}
                  {existingStatus === 'denied' && '✗ Your request was denied by the poll owner.'}
                  {existingStatus === 'pending' && '⏳ Your request is pending approval...'}
                </div>
              )}

              {!hasExistingRequest && (
                <>
                  <div className="bg-accent/5 rounded-2xl p-4 mb-6 border-2 border-accent/20">
                    <p className="text-xs text-muted-foreground mb-2">Your info will be sent to the poll owner:</p>
                    <p className="font-bold text-sm">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-4 mb-6 border-2 border-blue-200">
                    <p className="text-sm font-bold text-blue-900">
                      The poll owner will receive an email to approve or deny your request. If approved, you'll get access to the full results.
                    </p>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-primary font-bold transition-all hover:bg-primary/5"
                >
                  {hasExistingRequest ? 'Close' : 'Cancel'}
                </button>
                {!hasExistingRequest && (
                  <button
                    onClick={handleSubmitRequest}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-accent text-white rounded-2xl font-bold comic-shadow hover:comic-shadow-hover transition-all disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Request Access'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
