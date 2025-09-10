import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FaYoutube, FaInstagram, FaTiktok, FaFacebookF, FaDownload, FaMusic, FaVideo, FaClock, FaUser, FaLinkedin, FaTwitter, FaMoon, FaSun, FaHistory, FaLanguage, FaPlay, FaEye } from 'react-icons/fa'

import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { ThemeProvider, useTheme } from './components/theme-provider'
import { LanguageProvider, useLanguage } from './components/language-provider'
import { useDownloadHistory } from './hooks/useDownloadHistory'
import { useUrlValidation } from './hooks/useUrlValidation'
import { cn } from './lib/utils'

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

interface ApiError {
  error: string;
}

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="h-9 w-9"
    >
      {theme === 'light' ? (
        <FaMoon className="h-4 w-4" />
      ) : (
        <FaSun className="h-4 w-4" />
      )}
      <span className="sr-only">{t(theme === 'light' ? 'dark' : 'light')}</span>
    </Button>
  )
}

// Language Toggle Component
const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
      className="h-9 px-3"
    >
      <FaLanguage className="h-4 w-4 mr-2" />
      {language.toUpperCase()}
    </Button>
  )
}

// Platform Selector Component
interface PlatformSelectorProps {
  selectedPlatform: string
  onPlatformSelect: (platform: string, url: string) => void
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatform, onPlatformSelect }) => {
  const { t } = useLanguage()

  const supportedPlatforms = useMemo(() => [
    { 
      name: 'YouTube', 
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', 
      icon: FaYoutube,
      color: '#FF0000',
      placeholder: 'https://youtube.com/watch?v=...' 
    },
    { 
      name: 'Instagram', 
      url: 'https://instagram.com/p/example/', 
      icon: FaInstagram,
      color: '#E4405F',
      placeholder: 'https://instagram.com/p/...' 
    },
    { 
      name: 'TikTok', 
      url: 'https://tiktok.com/@user/video/123456', 
      icon: FaTiktok,
      color: '#000000',
      placeholder: 'https://tiktok.com/@user/video/...' 
    },
    { 
      name: 'Facebook', 
      url: 'https://facebook.com/watch?v=123456', 
      icon: FaFacebookF,
      color: '#1877F2',
      placeholder: 'https://facebook.com/watch?v=...' 
    },
    { 
      name: 'LinkedIn', 
      url: 'https://linkedin.com/posts/example', 
      icon: FaLinkedin,
      color: '#0077B5',
      placeholder: 'https://linkedin.com/posts/...' 
    },
    { 
      name: 'X (Twitter)', 
      url: 'https://x.com/user/status/123456', 
      icon: FaTwitter,
      color: '#000000',
      placeholder: 'https://x.com/user/status/...' 
    }
  ], [])

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-center">{t('supportedPlatforms')}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {supportedPlatforms.map((platform) => {
          const IconComponent = platform.icon
          const isSelected = selectedPlatform === platform.name
          
          return (
            <Button
              key={platform.name}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto p-3 flex flex-col gap-2 transition-all",
                isSelected && "shadow-md"
              )}
              onClick={() => onPlatformSelect(platform.name, platform.url)}
            >
              <IconComponent 
                className="h-5 w-5" 
                style={{ color: isSelected ? 'white' : platform.color }}
              />
              <span className="text-xs font-medium">{platform.name}</span>
            </Button>
          )
        })}
      </div>
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [showHistory, setShowHistory] = useState<boolean>(false)

  const { t } = useLanguage()
  const { history, addToHistory, clearHistory } = useDownloadHistory()
  const { validationState, validateUrl, clearValidation } = useUrlValidation()

  const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

  // Memoized platform selection handler
  const handlePlatformSelect = useCallback((platform: string, platformUrl: string) => {
    setSelectedPlatform(platform)
    setUrl(platformUrl)
    clearValidation()
  }, [clearValidation])

  // Real-time URL validation
  useEffect(() => {
    if (url.trim()) {
      const timeoutId = setTimeout(() => {
        validateUrl(url)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      clearValidation()
    }
  }, [url, validateUrl, clearValidation])

  const handleUrlSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateUrl(url)
    if (!validation.isValid) {
      setError(validation.error || t('invalidUrl'))
      return
    }

    setLoading(true)
    setError('')
    setVideoInfo(null)
    setDownloadProgress(t('fetchingInfo'))

    try {
      const response = await fetch(`${API_BASE}/api/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data: VideoInfo | ApiError = await response.json()

      if (!response.ok) {
        throw new Error((data as ApiError).error || t('failedToFetch'))
      }

      setVideoInfo(data as VideoInfo)
      setDownloadProgress('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setDownloadProgress('')
    } finally {
      setLoading(false)
    }
  }, [url, validateUrl, t, API_BASE])

  const handleDownload = useCallback(async (formatId?: string, audioOnly: boolean = false) => {
    if (!videoInfo) return

    const downloadId = formatId || 'audio'
    setDownloadingId(downloadId)
    setDownloadProgress(t('processing'))

    try {
      const response = await fetch(`${API_BASE}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          format_id: formatId,
          audio_only: audioOnly,
        }),
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      
      const extension = audioOnly ? 'mp3' : 'mp4'
      const filename = `${videoInfo.title}.${extension}`
      a.download = filename
      
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)

      // Add to history
      addToHistory({
        title: videoInfo.title,
        platform: videoInfo.platform,
        url: url,
        thumbnail: videoInfo.thumbnail,
        format: audioOnly ? 'MP3' : (formatId ? `${videoInfo.formats.find(f => f.format_id === formatId)?.quality || 'Video'}` : 'Video')
      })

      setDownloadProgress(t('downloadCompleted'))
      setTimeout(() => {
        setDownloadProgress('')
        setDownloadingId(null)
      }, 3000)
    } catch (err) {
      setError(t('downloadFailed'))
      setDownloadProgress('')
      setDownloadingId(null)
    }
  }, [videoInfo, url, t, API_BASE, addToHistory])

  // Utility functions
  const formatViewCount = useCallback((count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }, [])

  const formatFileSize = useCallback((bytes?: number): string => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }, [])

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="hidden md:flex"
              >
                <FaHistory className="h-4 w-4 mr-2" />
                {t('downloadHistory')}
              </Button>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* URL Input Form */}
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl">{t('enterUrl')}</CardTitle>
            <CardDescription>{t('pasteLink')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Selector */}
            <PlatformSelector 
              selectedPlatform={selectedPlatform}
              onPlatformSelect={handlePlatformSelect}
            />
            
            {/* URL Input */}
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t('pasteLink')}
                    disabled={loading}
                    className={cn(
                      "text-base",
                      validationState.isValid && "border-green-500",
                      validationState.error && "border-red-500"
                    )}
                  />
                  {validationState.platform && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span>✓</span>
                      <span>Detected: {validationState.platform}</span>
                    </div>
                  )}
                  {validationState.error && (
                    <p className="text-sm text-red-600">{validationState.error}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !url.trim() || !validationState.isValid}
                  size="lg"
                  className="md:w-auto w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <FaPlay className="h-4 w-4 mr-2" />
                      {t('getInfo')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="w-full max-w-4xl mx-auto border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <span className="text-lg">⚠</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Message */}
        {downloadProgress && (
          <Card className="w-full max-w-4xl mx-auto border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{downloadProgress}</span>
              </div>
              {downloadingId && (
                <div className="mt-3 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Video Info */}
        {videoInfo && (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">{t('videoInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Preview */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src={videoInfo.thumbnail} 
                    alt={videoInfo.title}
                    className="w-full md:w-64 h-36 md:h-36 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA0NUwxMTUgNjBMODUgNzVWNDVaIiBmaWxsPSIjODg4ODg4Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzg4ODg4OCI+Tm8gdGh1bWJuYWlsPC90ZXh0Pgo8L3N2Zz4K'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  <h3 className="text-lg md:text-xl font-semibold line-clamp-2 leading-tight">
                    {videoInfo.title}
                  </h3>
                  
                  {videoInfo.description && (
                    <div className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {videoInfo.description.length > 200 ? 
                          `${videoInfo.description.substring(0, 200)}...` : 
                          videoInfo.description
                        }
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-2">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#1976D2'}} />
                      {videoInfo.platform}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <FaUser className="h-3 w-3" />
                      {videoInfo.uploader}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <FaClock className="h-3 w-3" />
                      {formatDuration(videoInfo.duration)}
                    </Badge>
                    {videoInfo.view_count && (
                      <Badge variant="outline" className="gap-1">
                        <FaEye className="h-3 w-3" />
                        {formatViewCount(videoInfo.view_count)} {t('views')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">{t('downloadOptions')}</h4>
                
                {/* Audio Only Option */}
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <FaMusic className="h-4 w-4" />
                          <span className="font-medium">{t('audioOnly')}</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-500">{t('extractAudio')}</p>
                      </div>
                      <Button 
                        onClick={() => handleDownload(undefined, true)}
                        disabled={downloadingId === 'audio'}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        {downloadingId === 'audio' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            {t('downloading')}
                          </>
                        ) : (
                          <>
                            <FaDownload className="h-4 w-4 mr-2" />
                            {t('downloadMp3')}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Video Formats */}
                <div className="space-y-3">
                  {videoInfo.formats
                    .filter(format => format.vcodec !== 'none')
                    .slice(0, 5)
                    .map((format) => (
                    <Card key={format.format_id} className="transition-all hover:shadow-md">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FaVideo className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">
                                {format.quality} ({format.ext.toUpperCase()})
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{formatFileSize(format.filesize)}</span>
                              {format.format_note && (
                                <span>• {format.format_note}</span>
                              )}
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleDownload(format.format_id)}
                            disabled={downloadingId === format.format_id}
                            variant="default"
                            size="lg"
                          >
                            {downloadingId === format.format_id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                {t('downloading')}
                              </>
                            ) : (
                              <>
                                <FaDownload className="h-4 w-4 mr-2" />
                                {t('download')}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download History */}
        {showHistory && (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{t('downloadHistory')}</CardTitle>
                {history.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearHistory}>
                    {t('clearHistory')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('noHistory')}
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.thumbnail} 
                          alt={item.title}
                          className="w-16 h-10 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNyAxNUwzNyAyMEwyNyAyNVYxNVoiIGZpbGw9IiM4ODg4ODgiLz4KPC9zdmc+Cg=='
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{item.platform}</Badge>
                            <Badge variant="outline" className="text-xs">{item.format}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setUrl(item.url)
                            setShowHistory(false)
                          }}
                        >
                          {t('redownload')}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {/* Features Section */}
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t('features')}</CardTitle>
            <CardDescription>{t('whyChoose')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FaDownload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">{t('fastDownloads')}</h3>
                <p className="text-sm text-muted-foreground">{t('fastDescription')}</p>
              </div>
              
              <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <FaVideo className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold">{t('multipleFormats')}</h3>
                <p className="text-sm text-muted-foreground">{t('formatsDescription')}</p>
              </div>
              
              <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <FaMusic className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">{t('noWatermark')}</h3>
                <p className="text-sm text-muted-foreground">{t('watermarkDescription')}</p>
              </div>
              
              <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">🆓</span>
                </div>
                <h3 className="font-semibold">{t('freeToUse')}</h3>
                <p className="text-sm text-muted-foreground">{t('freeDescription')}</p>
              </div>
              
              <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">🔒</span>
                </div>
                <h3 className="font-semibold">{t('securePrivate')}</h3>
                <p className="text-sm text-muted-foreground">{t('secureDescription')}</p>
              </div>
              
              <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="font-semibold">{t('easyToUse')}</h3>
                <p className="text-sm text-muted-foreground">{t('easyDescription')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>&copy; 2024 MediaDownloader. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span>Made with ❤️ by eibragaa</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Main App with Providers
const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App