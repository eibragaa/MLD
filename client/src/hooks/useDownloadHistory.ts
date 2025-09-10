import { useState, useEffect } from 'react'

export interface DownloadHistoryItem {
  id: string
  title: string
  platform: string
  url: string
  thumbnail: string
  timestamp: number
  format: string
}

const STORAGE_KEY = 'download-history'
const MAX_HISTORY_ITEMS = 10

export function useDownloadHistory() {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY)
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Failed to parse download history:', error)
        setHistory([])
      }
    }
  }, [])

  const addToHistory = (item: Omit<DownloadHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: DownloadHistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    }

    setHistory(prev => {
      const updated = [newItem, ...prev.filter(h => h.url !== item.url)]
        .slice(0, MAX_HISTORY_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const removeFromHistory = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  }
}