'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { useState } from 'react'
import { Moon, Sun, Trash2, Shield, Bell, Globe } from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    
    try {
      // Add actual account deletion logic here
      console.log('Deleting account...')
      await signOut()
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 mt-4">
          <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Appearance Settings */}
        <div className="card-elevated p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-foreground"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card-elevated p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Profile Visibility</p>
                <p className="text-sm text-muted-foreground">Control who can see your profile</p>
              </div>
              <select className="px-3 py-2 border border-border rounded-md bg-card text-foreground">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Data Sharing</p>
                <p className="text-sm text-muted-foreground">Allow others to request your poll data</p>
              </div>
              <input type="checkbox" className="w-4 h-4" defaultChecked />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card-elevated p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <input type="checkbox" className="w-4 h-4" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Poll Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified about poll deadlines</p>
              </div>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card-elevated p-6 border-danger">
          <h2 className="text-xl font-semibold text-danger mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h2>
          
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-4">
            <h3 className="font-medium text-danger mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. This will permanently delete your profile, polls, and all associated data.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Type "DELETE" to confirm account deletion:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                    placeholder="Type DELETE here"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                    className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE'}
                    className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Permanently Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
