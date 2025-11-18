'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  fetchAllUsersJSON, 
  downloadUsersAsJSON, 
  UserDataJSON 
} from '@/lib/user-data-service'
import { useAuth } from '@/lib/auth-context'

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserDataJSON[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'points' | 'created'>('points')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table')

  const handleFetchUsers = async () => {
    setLoading(true)
    try {
      console.log('📥 Fetching all users...')
      const allUsers = await fetchAllUsersJSON()
      setUsers(allUsers)
      console.log(`✅ Loaded ${allUsers.length} users`)
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      alert(`Failed to fetch users: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      handleFetchUsers()
    }
  }, [user])

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => 
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName)
          break
        case 'points':
          comparison = a.points - b.points
          break
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const totalPoints = users.reduce((sum, user) => sum + user.points, 0)
  const averagePoints = users.length > 0 ? Math.round(totalPoints / users.length) : 0

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Data Management</h1>
            <p className="text-muted-foreground mt-2">
              View and export all user data in JSON format
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleFetchUsers}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            <button
              onClick={() => downloadUsersAsJSON(users, `users-export-${new Date().toISOString().split('T')[0]}.json`)}
              disabled={users.length === 0}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
            >
              Download JSON ({users.length} users)
            </button>
          </div>
        </div>

        {/* Statistics */}
        {users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-2xl font-bold text-warning">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-2xl font-bold text-success">{averagePoints}</div>
              <div className="text-sm text-muted-foreground">Average Points</div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-2xl font-bold text-secondary">
                {users.filter(u => u.completedPolls.length > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-card p-6 rounded-lg border mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-lg"
              >
                <option value="points">Sort by Points</option>
                <option value="name">Sort by Name</option>
                <option value="created">Sort by Created Date</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-lg"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'json' ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
              >
                JSON View
              </button>
            </div>
          </div>
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground">No users found. Try refreshing the data.</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Points</th>
                    <th className="text-left p-4 font-medium">Completed Polls</th>
                    <th className="text-left p-4 font-medium">Profile</th>
                    <th className="text-left p-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map((user, index) => (
                    <tr key={user.uid} className="border-t hover:bg-muted/20">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.photoURL && (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-medium">{user.displayName}</div>
                            <div className="text-xs text-muted-foreground">{user.uid}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className="font-bold text-warning">{user.points}</span>
                      </td>
                      <td className="p-4">{user.completedPolls.length}</td>
                      <td className="p-4">
                        <div className="text-xs">
                          {user.profile?.college && (
                            <div>🎓 {user.profile.college}</div>
                          )}
                          {user.profile?.course && (
                            <div>📚 {user.profile.course}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">JSON Data ({filteredAndSortedUsers.length} users)</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(filteredAndSortedUsers, null, 2))
                  alert('JSON data copied to clipboard!')
                }}
                className="px-3 py-1 bg-secondary text-white rounded text-sm hover:bg-secondary/90"
              >
                Copy JSON
              </button>
            </div>
            <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-auto max-h-96 border">
              {JSON.stringify(filteredAndSortedUsers, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
