'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import { Download, Eye, Calendar, Database } from 'lucide-react'

export default function DatasetsPage() {
  const { user } = useAuth()
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDatasets = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        // Load actual user datasets from your service
        // const userDatasets = await getUserDatasets(user.uid)
        // setDatasets(userDatasets)
        
        // For now, showing empty state
        setDatasets([])
      } catch (error) {
        console.error('Error loading datasets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDatasets()
  }, [user])

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8 mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 sm:mb-3 text-center sm:text-left">
            Dataset Collection
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg text-center sm:text-left">
            Access and download data from your polls
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-12 card-elevated">
            <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-foreground">No Datasets Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created any polls with collected data yet. Create your first poll to start collecting responses.
            </p>
            <button 
              onClick={() => window.location.href = '/create-poll'}
              className="btn-primary"
            >
              Create Your First Poll
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {datasets.map((dataset: any) => (
              <div key={dataset.id} className="card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{dataset.pollTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dataset.responses} responses collected
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors text-foreground">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex items-center gap-2 btn-primary">
                      <Download className="w-4 h-4" />
                      Download CSV
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created: {dataset.createdAt}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Updated: {dataset.lastUpdated}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
