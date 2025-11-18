'use client'

// Fix: Use relative paths
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/auth-context'
import { createPoll } from '../../lib/db-service'
import { ArrowLeft, Plus, Trash2, HelpCircle } from 'lucide-react'

interface PollQuestion {
  id: string
  question: string
  options: string[]
}

export default function CreatePollPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [questions, setQuestions] = useState<PollQuestion[]>(
    [{ id: 'q1', question: '', options: ['', ''] }]
  )
  const [loading, setLoading] = useState(false)

  const addQuestion = () => {
    const newId = `q${questions.length + 1}`
    setQuestions([...questions, { id: newId, question: '', options: ['', ''] }])
  }

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId))
    }
  }

  const updateQuestion = (questionId: string, field: 'question', value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ))
  }
  
  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId && q.options.length > 2 
        ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
        : q
    ))
  }
  
  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, i) => i === optionIndex ? value : opt) }
        : q
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate form
    const isValid = title.trim() && 
      questions.every(q => 
        q.question.trim() && 
        q.options.filter(opt => opt.trim()).length >= 2
      )

    if (!isValid) {
      alert('Please fill in all required fields and ensure each question has at least 2 options.')
      return
    }

    setLoading(true)
    
    try {
      console.log('Creating poll with user data:', {
        title: title.trim(),
        ownerUid: user.uid,
        ownerName: user.displayName || 'Anonymous',
        ownerEmail: user.email
      })

      const pollData = {
        ownerUid: user.uid,
        ownerName: user.displayName || 'Anonymous',
        ...(user.photoURL && { ownerImage: user.photoURL }),
        title: title.trim(),
        ...(description.trim() && { description: description.trim() }),
        questions: questions.map(q => ({
          id: q.id,
          question: q.question.trim(),
          options: q.options
            .filter(opt => opt.trim())
            .map((text, i) => ({
              id: `${q.id}_opt${i}`,
              text: text.trim(),
              votesCount: 0
            })),
          totalVotes: 0
        })),
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        visible: true
      }

      console.log('Complete poll data to be saved:', JSON.stringify(pollData, null, 2))

      const pollId = await createPoll(pollData)
      console.log('Poll created successfully with ID:', pollId)
      
      // Show success message
      alert(`✅ Poll created successfully!\n\nID: ${pollId}\nTitle: ${title}\n\nRedirecting to dashboard...`)
      
      // Force a small delay then redirect
      setTimeout(() => {
        router.push('/dashboard?refresh=true')
      }, 1000)
      
    } catch (error) {
      console.error('Error creating poll:', error)
      alert(`❌ Failed to create poll:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck browser console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Poll Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Poll Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground text-lg"
                placeholder="Give your poll a catchy title"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be displayed on the dashboard
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground"
                placeholder="Provide more context about your poll"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground"
                placeholder="e.g. tech, survey, opinions (comma separated)"
              />
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-foreground">
                  Questions *
                </label>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((question, qIndex) => (
                  <div key={question.id} className="border border-border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">Question {qIndex + 1}</span>
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="p-1 text-danger hover:bg-danger/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                        placeholder={`Enter question ${qIndex + 1}`}
                        required
                      />
                    </div>

                    {/* Question Options */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Answer Options
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-3 items-center">
                            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                              {optIndex + 1}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-border rounded-md bg-card text-foreground"
                              placeholder={`Option ${optIndex + 1}`}
                              required
                            />
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(question.id, optIndex)}
                                className="p-1 text-danger hover:bg-danger/10 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => addOption(question.id)}
                        className="mt-2 flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || questions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))}
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
