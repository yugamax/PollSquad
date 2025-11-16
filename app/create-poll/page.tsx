'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function CreatePollPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [loading, setLoading] = useState(false)

  const addOption = () => setOptions([...options, ''])
  
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }
  
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Poll creation logic here
      console.log('Creating poll:', { title, options })
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating poll:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-md transition-colors text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Create New Poll</h1>
        </div>

        {/* Form */}
        <div className="card-elevated p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Poll Question *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground text-lg"
                placeholder="What would you like to ask?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-4">
                Poll Options *
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium text-foreground">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-card text-foreground"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-danger hover:bg-danger/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addOption}
                className="mt-3 flex items-center gap-2 text-primary hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add Another Option
              </button>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Poll'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
