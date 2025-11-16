'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SentRequestsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/requests')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-muted-foreground">Redirecting to Requests...</p>
      </div>
    </div>
  )
}
