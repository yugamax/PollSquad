'use client'

import { useEffect, useState } from 'react'
import { Coins, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface PointsDisplayProps {
  showTrend?: boolean
  size?: 'sm' | 'md' | 'lg'
  compact?: boolean
}

export function PointsDisplay({ showTrend = false, size = 'md', compact = false }: PointsDisplayProps) {
  const { user } = useAuth()
  const [points, setPoints] = useState(0)
  const [pointsTrend, setPointsTrend] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPoints = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        // Load actual points from your service
        // const userPoints = await getUserPoints(user.uid)
        // const trend = await getPointsTrend(user.uid)
        // setPoints(userPoints)
        // setPointsTrend(trend)
        
        // Demo values
        setPoints(234)
        setPointsTrend(12)
      } catch (error) {
        console.error('Error loading points:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPoints()
  }, [user])

  const sizeClasses = {
    sm: compact ? 'px-3 py-3 text-sm h-[52px]' : 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  if (loading) {
    return (
      <div className={`bg-card/90 backdrop-blur-xl rounded-xl border border-border/20 shadow-lg ${sizeClasses[size]}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded-full"></div>
          <div className="w-16 h-4 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card/90 backdrop-blur-xl rounded-xl border border-border/20 shadow-lg ${sizeClasses[size]}`}>
      <div className="flex items-center gap-2 h-full">
        <div className="relative">
          <Coins className={`${iconSizes[size]} text-warning`} />
          <div className={`absolute inset-0 ${iconSizes[size]} bg-warning/20 rounded-full blur-sm`}></div>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs text-muted-foreground font-medium leading-tight">Points</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-foreground leading-tight ${compact ? 'text-sm' : ''}`}>
              {points.toLocaleString()}
            </span>
            {showTrend && pointsTrend > 0 && (
              <div className="flex items-center gap-1 text-xs text-success">
                <TrendingUp className="w-3 h-3" />
                +{pointsTrend}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
