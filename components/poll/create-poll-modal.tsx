'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createPoll } from '@/lib/db-service'
import { motion, AnimatePresence } from 'framer-motion'

interface CreatePollModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreatePollModal({ isOpen, onClose, onSuccess }: CreatePollModalProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([{ id: Date.now().toString(), question: '', options: [{ id: '1', text: '' }, { id: '2', text: '' }] }])
  const [allowMultipleChoices, setAllowMultipleChoices] = useState(false)

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || options.some(opt => !opt.trim())) return

    try {
      setLoading(true)
      
      const pollData = {
        ownerUid: user.uid,
        ownerName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        ownerImage: user.photoURL,
        title,
        description: description || undefined,
        questions: questions.map(q => ({
          ...q,
          allowMultiple: allowMultipleChoices // Apply global setting to all questions
        })),
        tags,
        allowMultipleChoices, // Store global setting
        visible: true
      }
      
      const pollId = await createPoll(pollData)
      console.log('✅ Poll created successfully:', pollId)
      
      // Reset form
      setTitle('')
      setDescription('')
      setQuestions([{ id: Date.now().toString(), question: '', options: [{ id: '1', text: '' }, { id: '2', text: '' }] }])
      setTags([])
      setAllowMultipleChoices(false)
      
      onSuccess?.()
      onClose()
      
    } catch (error) {
      console.error('❌ Error creating poll:', error)
      alert('Failed to create poll. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl p-8 comic-shadow border-4 border-primary">
              <h2 className="text-3xl font-black mb-6 text-primary">Create a Poll</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block font-bold mb-2 text-sm">Poll Question</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you want to ask?"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block font-bold mb-2 text-sm">Answer Options</label>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-4 py-2 rounded-xl border-2 border-accent/20 focus:border-accent outline-none transition-colors"
                          required
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="px-3 py-2 bg-danger/20 text-danger rounded-xl font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 text-sm font-bold text-accent hover:text-accent-dark transition-colors"
                  >
                    + Add Option
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold mb-2 text-sm">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us more about this poll..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary outline-none transition-colors"
                  />
                </div>

                {/* Multiple Choice Setting */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowMultipleChoices}
                      onChange={(e) => setAllowMultipleChoices(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium">Allow multiple selections per question</span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {allowMultipleChoices 
                      ? 'Users can select multiple options for each question (checkboxes)' 
                      : 'Users can only select one option per question (radio buttons)'
                    }
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block font-bold mb-2 text-sm">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. tech, opinions, fun"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-accent/20 focus:border-accent outline-none transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-primary font-bold transition-all hover:bg-primary/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-2xl font-bold comic-shadow hover:comic-shadow-hover transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Poll'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
