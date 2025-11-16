'use client'

import { useState } from 'react'
import { generateCSV, downloadFile, generateXLSX } from '@/lib/export-service'
import type { Poll } from '@/lib/db-types'
import { motion, AnimatePresence } from 'framer-motion'

interface ExportButtonProps {
  poll: Poll
}

export function ExportButton({ poll }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleExportCSV = () => {
    const csv = generateCSV(poll)
    const filename = `${poll.title.replace(/[^a-z0-9]/gi, '_')}_results.csv`
    downloadFile(csv, filename, 'text/csv')
    setIsOpen(false)
  }

  const handleExportXLSX = async () => {
    try {
      setLoading(true)
      const buffer = await generateXLSX(poll)
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filename = `${poll.title.replace(/[^a-z0-9]/gi, '_')}_results.xlsx`
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setIsOpen(false)
    } catch (error) {
      console.error('Error exporting XLSX:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold text-accent hover:text-accent-dark transition-colors flex items-center gap-1"
      >
        📥 Export
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute right-0 mt-2 bg-white rounded-2xl p-2 comic-shadow border-2 border-accent z-10 min-w-max"
          >
            <button
              onClick={handleExportCSV}
              className="block w-full text-left px-4 py-2 text-sm font-bold rounded-lg hover:bg-accent/10 transition-colors"
            >
              📄 CSV
            </button>
            <button
              onClick={handleExportXLSX}
              disabled={loading}
              className="block w-full text-left px-4 py-2 text-sm font-bold rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50"
            >
              📊 Excel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
