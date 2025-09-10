import React, { useState, useCallback, useMemo } from 'react'
import { FaYoutube, FaInstagram, FaTiktok, FaFacebookF, FaDownload, FaMusic, FaVideo, FaClock, FaUser, FaLinkedin, FaTwitter, FaMoon, FaSun, FaEye } from 'react-icons/fa'

import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { ThemeProvider, useTheme } from './components/theme-provider'
import { LanguageProvider, useLanguage } from './components/language-provider'

import './App.css'

interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  filesize?: number;
  acodec: string;
  vcodec: string;
  format_note?: string;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  platform: string;
  formats: VideoFormat[];
  description?: string;
  view_count?: number;
  upload_date?: string;
  webpage_url?: string;
}

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="btn btn-icon btn-outline"
    >
      {theme === 'light' ? <FaMoon /> : <FaSun />}
    </button>
  )
}

// Platform Selector Component
const PlatformSelector: React.FC<{ onSelect: (platform: string, url: string) => void }> = ({ onSelect }) => {
  const platforms = useMemo(() => [
    { name: 'YouTube', icon: FaYoutube, color: '#FF0000', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { name: 'Instagram', icon: FaInstagram, color: '#E4405F', url: 'https://instagram.com/p/example/' },
    { name: 'TikTok', icon: FaTiktok, color: '#000000', url: 'https://tiktok.com/@user/video/123456' },
    { name: 'Facebook', icon: FaFacebookF, color: '#1877F2', url: 'https://facebook.com/watch?v=123456' },
    { name: 'LinkedIn', icon: FaLinkedin, color: '#0077B5', url: 'https://linkedin.com/posts/example' },
    { name: 'X (Twitter)', icon: FaTwitter, color: '#000000', url: 'https://x.com/user/status/123456' }
  ], [])

  return (
    <div className="platform-grid">
      {platforms.map((platform) => {
        const IconComponent = platform.icon
        return (
          <button
            key={platform.name}
            className="platform-btn"
            onClick={() => onSelect(platform.name, platform.url)}
          >
            <IconComponent className="platform-icon" style={{ color: platform.color }} />
            <span className="platform-name">{platform.name}</span>
          </button>
        )
      })}
    </div>
  )
}

// Main App Component
const AppContent: React.FC = () => {
  const [url, setUrl] = useState<string>('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [downloadProgress, setDownloadProgress] = useState<string>('')
  
  const { t } = useLanguage()

  const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

  const handlePlatformSelect = useCallback((platform: string, platformUrl: string) => {
    setUrl(platformUrl)
    setError('')
  }, [])

  const handleGetInfo = useCallback(async () => {
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setVideoInfo(null)

    try {
      const response = await fetch(`${API_BASE}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get video info')
      }

      setVideoInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [url, API_BASE])

  const handleDownload = useCallback(async (formatId?: string, audioOnly: boolean = false) => {
    if (!videoInfo || !url) return

    setDownloadProgress('Starting download...')
    
    try {
      const response = await fetch(`${API_BASE}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(), 
          format_id: formatId,
          audio_only: audioOnly 
        })
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${videoInfo.title}${audioOnly ? '.mp3' : '.mp4'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      setDownloadProgress('Download completed!')
      setTimeout(() => setDownloadProgress(''), 3000)
    } catch (err) {
      setError('Download failed')
      setDownloadProgress('')
    }
  }, [videoInfo, url, API_BASE])

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-controls">
            <ThemeToggle />
          </div>
          <h1 className="title">MediaDownloader</h1>
          <p className="subtitle">Download videos from YouTube, Instagram, TikTok, Facebook, LinkedIn, and X</p>
        </header>

        {/* Platform Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Platform</CardTitle>
            <CardDescription>Select a platform to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformSelector onSelect={handlePlatformSelect} />
          </CardContent>
        </Card>

        {/* URL Input */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Video URL</CardTitle>
            <CardDescription>Paste the link to the video you want to download</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <div className="form-row">
                <input
                  type="url"
                  className="input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={loading}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleGetInfo}
                  disabled={loading || !url.trim()}
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaVideo />
                      Get Info
                    </>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Progress Message */}
        {downloadProgress && (
          <div className="alert alert-success">
            {downloadProgress}
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Video Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="video-preview">
                <img 
                  src={videoInfo.thumbnail} 
                  alt={videoInfo.title}
                  className="video-thumbnail"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="video-details">
                  <h3 className="video-title">{videoInfo.title}</h3>
                  <div className="video-meta">
                    <Badge className="badge badge-primary">
                      <FaUser /> {videoInfo.uploader}
                    </Badge>
                    <Badge className="badge badge-secondary">
                      <FaClock /> {formatDuration(videoInfo.duration)}
                    </Badge>
                    {videoInfo.view_count && (
                      <Badge className="badge badge-secondary">
                        <FaEye /> {formatViewCount(videoInfo.view_count)} views
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="form-group">
                <h4>Download Options</h4>
                
                {/* Audio Download */}
                <div className="download-option">
                  <div className="format-info">
                    <div className="format-title">
                      <FaMusic /> Audio (MP3)
                    </div>
                    <div className="format-description">
                      Extract audio only as MP3 file
                    </div>
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={() => handleDownload(undefined, true)}
                    disabled={!!downloadProgress}
                  >
                    <FaDownload /> Download MP3
                  </button>
                </div>

                {/* Video Formats */}
                {videoInfo.formats.slice(0, 3).map((format) => (
                  <div key={format.format_id} className="download-option">
                    <div className="format-info">
                      <div className="format-title">
                        <FaVideo /> {format.quality} ({format.ext})
                      </div>
                      <div className="format-description">
                        {format.format_note || `${format.quality} quality video`}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownload(format.format_id)}
                      disabled={!!downloadProgress}
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Main App with Providers
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App