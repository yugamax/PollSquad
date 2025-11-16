'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import { Save, AlertCircle, X } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    bio: '',
    school: '',
    course: '',
    year: '',
    location: '',
    interests: []
  })
  const [originalProfile, setOriginalProfile] = useState(profile)
  const [hasChanges, setHasChanges] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const initial = {
      displayName: user?.displayName || '',
      bio: '',
      school: '',
      course: '',
      year: '',
      location: '',
      interests: []
    }
    setProfile(initial)
    setOriginalProfile(initial)
  }, [user])

  useEffect(() => {
    const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile)
    setHasChanges(changed)
    setShowNotification(changed)
  }, [profile, originalProfile])

  const handleSave = async () => {
    try {
      console.log('Saving profile:', profile)
      setOriginalProfile(profile)
      setHasChanges(false)
      setShowNotification(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleDiscard = () => {
    setProfile(originalProfile)
    setHasChanges(false)
    setShowNotification(false)
  }

  const updateProfile = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
      {/* Unsaved Changes Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 bg-warning/90 backdrop-blur-xl text-warning-foreground px-4 py-3 rounded-xl border border-warning/20 shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Changes not saved</span>
          <button
            onClick={() => setShowNotification(false)}
            className="p-1 hover:bg-warning/20 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-4">
        {/* Profile Header */}
        <div className="card-elevated p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center">
              <ProfilePictureUpload showCamera={true} size="lg" />
              <p className="text-sm text-muted-foreground mt-2">Click to change</p>
            </div>
            
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary mb-2">
                  Profile Settings
                </h1>
                <p className="text-muted-foreground">
                  Update your profile information and preferences
                </p>
              </div>
              
              {hasChanges && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card-elevated p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Profile Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => updateProfile('displayName', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bio / About
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => updateProfile('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                placeholder="Tell others about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  School/University
                </label>
                <input
                  type="text"
                  value={profile.school}
                  onChange={(e) => updateProfile('school', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Where do you study?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course/Major
                </label>
                <input
                  type="text"
                  value={profile.course}
                  onChange={(e) => updateProfile('course', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="What do you study?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Year/Level
                </label>
                <select
                  value={profile.year}
                  onChange={(e) => updateProfile('year', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="graduate">Graduate</option>
                  <option value="phd">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => updateProfile('location', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card-elevated p-6 mt-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Activity Stats</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Polls Created</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">0</div>
              <div className="text-sm text-muted-foreground">Votes Cast</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-3xl font-bold text-warning mb-1">234</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-3xl font-bold text-success mb-1">0</div>
              <div className="text-sm text-muted-foreground">Boosted Polls</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
