import type { Poll } from './db-types'

export function generateCSV(poll: Poll): string {
  const csvData: string[] = []
  
  // Add poll title and metadata
  csvData.push(`"Poll Title","${poll.title}"`)
  csvData.push(`"Total Votes","${poll.totalVotes}"`)
  csvData.push(`"Created At","${poll.createdAt.toISOString()}"`)
  csvData.push('') // Empty line
  
  // Add data for each question
  poll.questions.forEach((question, qIndex) => {
    csvData.push(`"Question ${qIndex + 1}","${question.question}"`)
    csvData.push('"Option","Votes","Percentage"')
    
    question.options.forEach(option => {
      const percentage = question.totalVotes > 0 
        ? ((option.votesCount / question.totalVotes) * 100).toFixed(2)
        : '0.00'
      csvData.push(`"${option.text}","${option.votesCount}","${percentage}%"`)
    })
    
    csvData.push('') // Empty line between questions
  })

  return csvData.join('\n')
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export async function generateXLSX(poll: Poll): Promise<ArrayBuffer> {
  // Dynamic import to keep bundle size small
  const XLSX = await import('xlsx').then(mod => mod.default || mod)
  
  const workbook = XLSX.utils.book_new()
  
  // Create a sheet for each question
  poll.questions.forEach((question, qIndex) => {
    const data = question.options.map(option => ({
      'Option': option.text,
      'Votes': option.votesCount,
      'Percentage': question.totalVotes > 0 
        ? ((option.votesCount / question.totalVotes) * 100).toFixed(2) + '%' 
        : '0.00%'
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const sheetName = `Question ${qIndex + 1}`
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
}
