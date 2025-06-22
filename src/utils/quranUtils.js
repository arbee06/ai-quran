export const formatArabicText = (text) => {
  return text
    .replace(/([^\u0621-\u064A\u0660-\u0669\s])/g, '')
    .trim()
}

export const formatVerseReference = (surahName, verseNumber) => {
  return `${surahName} ${verseNumber}`
}

export const parseVerseRange = (rangeString) => {
  const parts = rangeString.split('-')
  if (parts.length === 1) {
    return { start: parseInt(parts[0]), end: parseInt(parts[0]) }
  }
  return { start: parseInt(parts[0]), end: parseInt(parts[1]) }
}

export const highlightSearchTerms = (text, searchTerms) => {
  if (!searchTerms || searchTerms.length === 0) return text
  
  let highlightedText = text
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi')
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
  })
  
  return highlightedText
}

export const getReadingTime = (text) => {
  const wordsPerMinute = 150
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

export const downloadAsFile = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}