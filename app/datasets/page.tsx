'use client'

// Fix import paths to use relative imports
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { useAuth } from '../../lib/auth-context'
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
          <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-2 sm:mb-3 text-center sm:text-left">
            Dataset Collection
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg text-center sm:text-left">
            Access and download data from your polls
          </p>
        </div>

        <div className="text-center py-16 card-elevated">
          <h3 className="text-xl font-bold mb-3 text-foreground">No Datasets Available</h3>
          <p className="text-muted-foreground">
            Your poll datasets will appear here once you have active polls with responses.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
