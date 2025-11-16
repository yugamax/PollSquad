import type { Poll } from './db-types'

export function generateCSV(poll: Poll): string {
  const headers = ['Option', 'Votes', 'Percentage']
  const rows = poll.options.map(option => [
    `"${option.text}"`,
    option.votesCount,
    poll.totalVotes > 0 ? ((option.votesCount / poll.totalVotes) * 100).toFixed(2) : '0.00'
  ])

  const data = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return data
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
  
  const data = poll.options.map(option => ({
    'Option': option.text,
    'Votes': option.votesCount,
    'Percentage': poll.totalVotes > 0 ? ((option.votesCount / poll.totalVotes) * 100).toFixed(2) + '%' : '0.00%'
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results')

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
}
