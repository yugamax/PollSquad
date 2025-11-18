'use client'

// Fix import paths to use relative imports
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { ProfilePictureUpload } from '../../components/ui/profile-picture-upload'
import { useAuth } from '../../lib/auth-context'
import { getUserData } from '../../lib/db-service'
import { useState, useEffect, useRef } from 'react'
import { Save, AlertCircle, X, ExternalLink, MapPin, Search } from 'lucide-react'
import { indianCities, searchCities } from '../../lib/indian-cities'
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function ProfilePage() {
  const { user, userPoints, refreshUserData } = useAuth()
  const [displayPoints, setDisplayPoints] = useState(0)
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    bio: '',
    college: '',
    course: '',
    year: '',
    location: '',
    linkedin: '', // NEW: LinkedIn field
    interests: []
  })
  const [originalProfile, setOriginalProfile] = useState(profile)
  const [hasChanges, setHasChanges] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // NEW: City search functionality
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [filteredCities, setFilteredCities] = useState(indianCities.slice(0, 10))
  const cityInputRef = useRef<HTMLInputElement>(null)
  
  const [userStats, setUserStats] = useState({
    pollsCreated: 0,
    pollsCompleted: 0,
    totalVotes: 0
  })

  useEffect(() => {
    const initial = {
      displayName: user?.displayName || '',
      bio: '',
      college: '',
      course: '',
      year: '',
      location: '',
      linkedin: '', // NEW: LinkedIn field
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

  useEffect(() => {
    // NEW: Load user statistics
    const loadUserStats = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid)
          if (userData) {
            const completedPolls = userData.completedPolls?.length || 0
            setUserStats(prev => ({
              ...prev,
              pollsCompleted: completedPolls
            }))
          }
        } catch (error) {
          console.error('Error loading user stats:', error)
        }
      }
    }
    
    loadUserStats()
  }, [user])

  // Force refresh points when profile page loads
  useEffect(() => {
    if (user) {
      console.log('🔄 Profile: Page loaded, forcing points refresh')
      refreshUserData()
    }
  }, [user?.uid, refreshUserData])

  // Listen for points updates
  useEffect(() => {
    const handlePointsUpdate = () => {
      console.log('🔄 Profile: Points update event received, refreshing...')
      refreshUserData()
    }

    const handleForceRefresh = (event) => {
      console.log('🔄 Profile: Force refresh event received:', event.detail)
      setDisplayPoints(event.detail?.points || 0)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('userPointsUpdated', handlePointsUpdate)
      window.addEventListener('forcePointsRefresh', handleForceRefresh)
      
      return () => {
        window.removeEventListener('userPointsUpdated', handlePointsUpdate)
        window.removeEventListener('forcePointsRefresh', handleForceRefresh)
      }
    }
  }, [refreshUserData])

  // Update display points when context changes
  useEffect(() => {
    console.log('📊 Profile: Context points changed to:', userPoints)
    setDisplayPoints(userPoints)
  }, [userPoints])

  // NEW: Handle city search
  useEffect(() => {
    const filtered = searchCities(citySearch)
    setFilteredCities(filtered)
  }, [citySearch])

  // NEW: Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid)
          if (userData?.profile) {
            const profileData = {
              displayName: user.displayName || '',
              bio: userData.profile.bio || '',
              college: userData.profile.college || '',
              course: userData.profile.course || '',
              year: userData.profile.year || '',
              location: userData.profile.location || '',
              linkedin: userData.profile.linkedin || '',
              interests: userData.profile.interests || []
            }
            setProfile(profileData)
            setOriginalProfile(profileData)
            setCitySearch(userData.profile.location || '')
          }
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      }
    }
    
    loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    
    try {
      setSaving(true)
      console.log('Saving profile:', profile)
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, {
        displayName: profile.displayName,
        profile: {
          bio: profile.bio,
          college: profile.college,
          course: profile.course,
          year: profile.year,
          location: profile.location,
          linkedin: profile.linkedin,
          interests: profile.interests
        },
        updatedAt: serverTimestamp()
      })
      
      setOriginalProfile(profile)
      setHasChanges(false)
      setShowNotification(false)
      
      // Show success message
      alert('Profile updated successfully!')
      
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
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

  const handleCitySelect = (city: string) => {
    updateProfile('location', city)
    setCitySearch(city)
    setShowCityDropdown(false)
  }

  // NEW: Fix city search input to update both states
  const handleCityInputChange = (value: string) => {
    setCitySearch(value)
    updateProfile('location', value) // Keep location in sync with search input
    setShowCityDropdown(true)
  }

  const validateLinkedIn = (url: string) => {
    if (!url) return true
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    return linkedinPattern.test(url)
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
                Display Name *
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => updateProfile('displayName', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Your display name"
                required
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
                  College/University
                </label>
                <input
                  type="text"
                  value={profile.college}
                  onChange={(e) => updateProfile('college', e.target.value)}
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

              {/* NEW: Indian Cities Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City (India)
                </label>
                <div className="relative">
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={citySearch}
                    onChange={(e) => handleCityInputChange(e.target.value)}
                    onFocus={() => setShowCityDropdown(true)}
                    onBlur={() => {
                      // Delay to allow dropdown click
                      setTimeout(() => setShowCityDropdown(false), 200)
                    }}
                    className="w-full px-4 py-3 pr-10 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Search for your city..."
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  
                  {/* Dropdown */}
                  {showCityDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                            onClick={() => handleCitySelect(city)}
                            className="w-full text-left px-4 py-2 hover:bg-muted text-foreground text-sm first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {city}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-muted-foreground text-sm">
                          No cities found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* NEW: LinkedIn Profile */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn Profile</span>
                </div>
              </label>
              <input
                type="url"
                value={profile.linkedin}
                onChange={(e) => updateProfile('linkedin', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                  profile.linkedin && !validateLinkedIn(profile.linkedin)
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
                placeholder="https://linkedin.com/in/your-profile"
              />
              {profile.linkedin && !validateLinkedIn(profile.linkedin) && (
                <p className="text-red-500 text-xs mt-1">
                  Please enter a valid LinkedIn profile URL
                </p>
              )}
              <p className="text-muted-foreground text-xs mt-1">
                Enter your full LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)
              </p>
            </div>

            {/* Save Button */}
            {hasChanges && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={handleDiscard}
                  disabled={saving}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || (profile.linkedin && !validateLinkedIn(profile.linkedin))}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="card-elevated p-6 mt-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Activity Stats</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-3xl font-bold text-primary mb-1">{userStats.pollsCreated}</div>
              <div className="text-sm text-muted-foreground">Polls Created</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">{userStats.pollsCompleted}</div>
              <div className="text-sm text-muted-foreground">Polls Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-3xl font-bold text-warning mb-1">{displayPoints}</div>
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
