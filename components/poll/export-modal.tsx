'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileSpreadsheet, FileText, Download, Users, BarChart3 } from 'lucide-react'

interface Poll {
  pollId: string
  title: string
  questions: Array<{
    id: string
    question: string
    options: Array<{
      id: string
      text: string
      votesCount: number
    }>
    totalVotes: number
  }>
  totalVotes: number
  createdAt: Date
}

interface ExportModalProps {
  isOpen: boolean
  poll: Poll
  onClose: () => void
}

export function ExportModal({ isOpen, poll, onClose }: ExportModalProps) {
  const [loading, setLoading] = useState<'csv' | 'excel' | null>(null)

  const handleExport = async (format: 'csv' | 'excel') => {
    setLoading(format)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (format === 'csv') {
        downloadCSV()
      } else {
        downloadExcel()
      }
    } catch (error) {
      console.error('Export error:', error)
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const downloadCSV = () => {
    const csvContent = generateCSVData()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${poll.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadExcel = () => {
    // For now, we'll create a more structured CSV that can be easily imported into Excel
    const excelContent = generateExcelData()
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${poll.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.xlsx`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const generateCSVData = () => {
    let csv = `Poll Title: ${poll.title}\n`
    csv += `Export Date: ${new Date().toLocaleString()}\n`
    csv += `Total Votes: ${poll.totalVotes}\n\n`

    poll.questions.forEach((question, qIndex) => {
      csv += `Question ${qIndex + 1}: ${question.question}\n`
      csv += `Total Votes: ${question.totalVotes}\n`
      csv += `Option,Votes,Percentage\n`
      
      question.options.forEach(option => {
        const percentage = question.totalVotes > 0 ? 
          ((option.votesCount / question.totalVotes) * 100).toFixed(1) : '0.0'
        csv += `"${option.text}",${option.votesCount},${percentage}%\n`
      })
      csv += '\n'
    })

    return csv
  }

  const generateExcelData = () => {
    // Create a more structured format suitable for Excel
    let excel = `Poll Title\t${poll.title}\n`
    excel += `Export Date\t${new Date().toLocaleString()}\n`
    excel += `Total Poll Votes\t${poll.totalVotes}\n\n`

    poll.questions.forEach((question, qIndex) => {
      excel += `Question ${qIndex + 1}\t${question.question}\n`
      excel += `Question Total Votes\t${question.totalVotes}\n`
      excel += `Option\tVotes\tPercentage\n`
      
      question.options.forEach(option => {
        const percentage = question.totalVotes > 0 ? 
          ((option.votesCount / question.totalVotes) * 100).toFixed(1) : '0.0'
        excel += `${option.text}\t${option.votesCount}\t${percentage}%\n`
      })
      excel += '\n'
    })

    return excel
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal - Responsive sizing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-card rounded-xl sm:rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Export Poll Data</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {poll.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto p-4 sm:p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              {/* Poll Stats */}
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 text-primary mb-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-base sm:text-lg font-bold">{poll.totalVotes}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Total Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 text-accent mb-1">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-base sm:text-lg font-bold">{poll.questions.length}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">Choose Export Format</h3>
                
                {/* CSV Option */}
                <button
                  onClick={() => handleExport('csv')}
                  disabled={loading !== null}
                  className="w-full p-3 sm:p-4 border-2 border-border hover:border-primary/50 rounded-lg sm:rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                      {loading === 'csv' ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base">CSV Format</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Simple format, works with spreadsheet apps
                      </p>
                    </div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                      .csv
                    </div>
                  </div>
                </button>

                {/* Excel Option */}
                <button
                  onClick={() => handleExport('excel')}
                  disabled={loading !== null}
                  className="w-full p-3 sm:p-4 border-2 border-border hover:border-primary/50 rounded-lg sm:rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                      {loading === 'excel' ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base">Excel Format</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Structured format, ready for Excel analysis
                      </p>
                    </div>
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                      .xlsx
                    </div>
                  </div>
                </button>
              </div>

              {/* Export Info */}
              <div className="mt-4 sm:mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-primary/80">
                  <strong>What's included:</strong> Poll title, questions, answer options, vote counts, and percentages for comprehensive analysis.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-t border-border bg-muted/10">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Export generated on {new Date().toLocaleDateString()}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
