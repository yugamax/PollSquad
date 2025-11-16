'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Send, Inbox, CheckCircle, Clock, User, Calendar } from 'lucide-react'

type RequestTab = 'received' | 'sent' | 'accepted'

interface RequestData {
  id: string
  type: 'sent' | 'received' | 'accepted'
  pollTitle: string
  requesterName?: string
  requesterEmail?: string
  recipientName?: string
  recipientEmail?: string
  createdAt: string
  status: 'pending' | 'approved' | 'denied'
}

export default function RequestsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<RequestTab>('received')
  const [requests, setRequests] = useState<RequestData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        // Load actual requests from your service
        // For now, showing empty state
        setRequests([])
      } catch (error) {
        console.error('Error loading requests:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [user, activeTab])

  const handleApprove = async (reqId: string) => {
    // Handle approval logic
    console.log('Approving request:', reqId)
  }

  const handleDeny = async (reqId: string) => {
    // Handle denial logic
    console.log('Denying request:', reqId)
  }

  // derive counts dynamically from requests
  const counts = useMemo(() => {
    return {
      received: requests.filter(r => r.type === 'received').length,
      sent: requests.filter(r => r.type === 'sent').length,
      accepted: requests.filter(r => r.status === 'approved').length,
    }
  }, [requests])

  const tabs = [
    { id: 'received' as RequestTab, label: 'Received Requests', icon: Inbox, count: counts.received },
    { id: 'sent' as RequestTab, label: 'Sent Requests', icon: Send, count: counts.sent },
    { id: 'accepted' as RequestTab, label: 'Accepted Requests', icon: CheckCircle, count: counts.accepted },
  ]

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'received') return req.type === 'received'
    if (activeTab === 'sent') return req.type === 'sent'
    if (activeTab === 'accepted') return req.status === 'approved'
    return false
  })

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 mt-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Requests Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage data access requests for your polls
          </p>
        </div>

        {/* Centered Tabs */}
        <div className="mb-8">
          <div className="w-full flex justify-center">
            <div className="flex items-center gap-4 bg-card/70 backdrop-blur-xl p-2 rounded-xl border border-border/20 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg transition
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'bg-transparent text-foreground hover:bg-muted/40'}
                    `}
                    aria-pressed={isActive}
                    aria-label={tab.label}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="whitespace-nowrap font-medium text-sm">{tab.label}</span>
                    <span className={`ml-2 inline-flex items-center justify-center text-xs font-bold px-2 py-1 rounded-full ${
                      isActive ? 'bg-white/20' : 'bg-primary/20 text-primary'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 card-elevated">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              {activeTab === 'received' && <Inbox className="w-12 h-12 text-muted-foreground" />}
              {activeTab === 'sent' && <Send className="w-12 h-12 text-muted-foreground" />}
              {activeTab === 'accepted' && <CheckCircle className="w-12 h-12 text-muted-foreground" />}
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              {activeTab === 'received' && 'No Requests Received'}
              {activeTab === 'sent' && 'No Requests Sent'}
              {activeTab === 'accepted' && 'No Accepted Requests'}
            </h3>
            
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              {activeTab === 'received' && 'When someone requests access to your poll data, it will appear here.'}
              {activeTab === 'sent' && 'Your data access requests to other users will be shown here.'}
              {activeTab === 'accepted' && 'Approved data sharing agreements will be listed here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(req => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{req.pollTitle}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {activeTab === 'received' && (
                            <>
                              <span>From: {req.requesterName}</span>
                              <span>{req.requesterEmail}</span>
                            </>
                          )}
                          {activeTab === 'sent' && (
                            <>
                              <span>To: {req.recipientName}</span>
                              <span>{req.recipientEmail}</span>
                            </>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {req.createdAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-2 rounded-full text-sm font-medium ${
                      req.status === 'pending' ? 'bg-warning/20 text-warning' :
                      req.status === 'approved' ? 'bg-success/20 text-success' :
                      'bg-danger/20 text-danger'
                    }`}>
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' && <Clock className="w-4 h-4" />}
                        {req.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                        {req.status === 'pending' ? 'Pending' : 
                         req.status === 'approved' ? 'Approved' : 'Denied'}
                      </div>
                    </div>

                    {activeTab === 'received' && req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeny(req.id)}
                          className="px-4 py-2 border-2 border-danger text-danger rounded-lg hover:bg-danger hover:text-white transition-all"
                        >
                          Deny
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="btn-primary"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
