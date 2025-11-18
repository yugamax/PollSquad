'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { useAuth } from '../../../lib/auth-context'
import { getPublicProfileData, getUserPolls } from '../../../lib/db-service'
import { Calendar, MapPin, GraduationCap, BookOpen, Users, BarChart3, Award, ExternalLink, Lock } from 'lucide-react'

export default function PublicProfilePage() {
  const params = useParams()
  const uid = params.uid as string
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [userPolls, setUserPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!uid) {
        setError('Invalid user ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('🔍 Loading profile for UID:', uid, 'Current user:', currentUser?.uid)
        
        // Use the new getPublicProfileData function
        const userData = await getPublicProfileData(uid, currentUser?.uid)
        
        if (!userData) {
          setError('User not found')
          setLoading(false)
          return
        }

        // Check if profile is private
        if (userData.isPrivate) {
          setError('This profile is private')
          setLoading(false)
          return
        }

        console.log('✅ Profile data loaded successfully:', userData.displayName)
        setProfileUser(userData)

        // Load user's public polls
        try {
          const polls = await getUserPolls(uid)
          const publicPolls = polls.filter(poll => poll.visible)
          console.log('📊 Loaded', publicPolls.length, 'public polls')
          setUserPolls(publicPolls)
        } catch (pollError) {
          console.error('❌ Error loading user polls:', pollError)
          // Don't show error for polls, just show empty array
          setUserPolls([])
        }

      } catch (error) {
        console.error('❌ Error loading profile:', error)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [uid, currentUser?.uid])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">{error}</h2>
          <p className="text-muted-foreground">
            {error === 'User not found' ? 'This user does not exist.' : 
             error === 'This profile is private' ? 'The user has set their profile to private.' :
             'There was an error loading this profile.'}
          </p>
          {error === 'Invalid user ID' && (
            <button 
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </DashboardLayout>
    )
  }

  const isOwnProfile = uid === currentUser?.uid
  const isPublicProfile = profileUser?.settings?.profileVisibility !== false
  const userStats = {
    pollsCreated: userPolls.length,
    totalVotes: userPolls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0),
    points: profileUser?.points || 0,
    completedPolls: profileUser?.completedPolls?.length || 0
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto mt-4">
        {/* Profile Header */}
        <div className="card-elevated p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {profileUser?.photoURL ? (
                  <img 
                    src={profileUser.photoURL} 
                    alt={profileUser.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {profileUser?.displayName?.charAt(0).toUpperCase() || profileUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              {isOwnProfile && (
                <p className="text-xs text-muted-foreground mt-2">Your Profile</p>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {profileUser?.displayName || profileUser?.email?.split('@')[0] || 'Anonymous User'}
              </h1>
              
              {/* Bio - Always visible */}
              {profileUser?.profile?.bio && (
                <div className="mb-4">
                  <p className="text-muted-foreground italic">"{profileUser.profile.bio}"</p>
                </div>
              )}

              {/* Profile Info - Only visible if public profile OR own profile */}
              {(isPublicProfile || isOwnProfile) ? (
                <div className="space-y-3 mb-4">
                  {profileUser?.profile?.college && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span>{profileUser.profile.college}</span>
                    </div>
                  )}
                  
                  {profileUser?.profile?.course && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{profileUser.profile.course}</span>
                      {profileUser?.profile?.year && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {profileUser.profile.year === 'graduate' ? 'Graduate' : 
                           profileUser.profile.year === 'phd' ? 'PhD' : 
                           `Year ${profileUser.profile.year}`}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {profileUser?.profile?.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{profileUser.profile.location}</span>
                    </div>
                  )}

                  {/* NEW: LinkedIn Profile - Clean styling */}
                  {profileUser?.profile?.linkedin && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <a 
                        href={profileUser.profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors hover:underline flex items-center gap-1"
                      >
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profileUser?.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                /* Private Profile Message */
                <div className="mb-4 p-4 bg-muted/20 border border-border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Private Profile</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This user has set their profile to private. Only their name and bio are visible.
                  </p>
                </div>
              )}

              {/* Edit Profile Button for own profile */}
              {isOwnProfile && (
                <div className="mt-4">
                  <a 
                    href="/profile"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Edit Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards - Only show if public or own profile */}
        {(isPublicProfile || isOwnProfile) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{userStats.pollsCreated}</div>
              <div className="text-sm text-muted-foreground">Polls Created</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">{userStats.totalVotes}</div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-warning mb-1">{userStats.points}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-success mb-1">{userStats.completedPolls}</div>
              <div className="text-sm text-muted-foreground">Polls Completed</div>
            </div>
          </div>
        )}

        {/* User's Polls - Only show if public or own profile */}
        {(isPublicProfile || isOwnProfile) && (
          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {isOwnProfile ? 'Your Polls' : `${profileUser?.displayName?.split(' ')[0] || 'User'}'s Polls`}
            </h2>
            
            {userPolls.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't created any polls yet." : "This user hasn't created any public polls yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPolls.slice(0, 5).map((poll, index) => (
                  <div key={poll.pollId} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{poll.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {poll.totalVotes || 0} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {poll.questions?.length || 0} questions
                        </span>
                        <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Boost indicator */}
                    {poll.boostedUntil && poll.boostedUntil > new Date() && (
                      <div className="flex items-center gap-1 bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                        <span>🚀</span>
                        <span>Boosted</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {userPolls.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    ... and {userPolls.length - 5} more polls
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Private Profile Polls Message */}
        {!isPublicProfile && !isOwnProfile && (
          <div className="card-elevated p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Profile Details Hidden</h3>
            <p className="text-muted-foreground">
              This user has chosen to keep their detailed information and polls private.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
