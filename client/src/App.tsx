import React, { useState } from 'react';
import { FaYoutube, FaInstagram, FaTiktok, FaFacebookF, FaDownload, FaMusic, FaVideo, FaClock, FaUser, FaLinkedin, FaTwitter } from 'react-icons/fa';
import './App.css';

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

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const supportedPlatforms = [
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
  ];

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '' 
    : 'http://localhost:3001';

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);
    setDownloadProgress('Fetching video information...');

    try {
      const response = await fetch(`${API_BASE}/api/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: VideoInfo | ApiError = await response.json();

      if (!response.ok) {
        throw new Error((data as ApiError).error || 'Failed to fetch video info');
      }

      setVideoInfo(data as VideoInfo);
      setDownloadProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setDownloadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (formatId?: string, audioOnly: boolean = false) => {
    if (!videoInfo) return;

    const downloadId = formatId || 'audio';
    setDownloadingId(downloadId);
    setDownloadProgress('Preparing download...');

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
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const extension = audioOnly ? 'mp3' : 'mp4';
      a.download = `${videoInfo.title}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadProgress('Download completed!');
      setTimeout(() => {
        setDownloadProgress('');
        setDownloadingId(null);
      }, 3000);
    } catch (err) {
      setError('Download failed. Please try again.');
      setDownloadProgress('');
      setDownloadingId(null);
    }
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="title">MediaDownloader</h1>
          <p className="subtitle">
            Download videos and audio from YouTube, Instagram, TikTok, Facebook, LinkedIn, and X (Twitter)
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* URL Input Form */}
        <div className="card">
          <div className="card-header">
            <h2>Enter Video URL</h2>
            <p>Paste the link to your video from any supported platform</p>
          </div>
          <div className="card-content">
            {/* Platform Selector */}
            <div className="platform-selector">
              <h4>Supported Platforms:</h4>
              <div className="platform-buttons">
                {supportedPlatforms.map((platform) => {
                  return (
                    <button
                      key={platform.name}
                      className={`platform-btn ${selectedPlatform === platform.name ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPlatform(platform.name);
                        setUrl(platform.url);
                      }}
                      style={{
                        '--platform-color': platform.color
                      } as React.CSSProperties}
                    >
                      {React.createElement(platform.icon as any, {
                        className: "platform-icon",
                        style: { color: selectedPlatform === platform.name ? 'white' : platform.color }
                      })}
                      <span className="platform-name">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <form onSubmit={handleUrlSubmit} className="url-form">
              <div className="input-group">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={selectedPlatform ? supportedPlatforms.find(p => p.name === selectedPlatform)?.placeholder : "Paste video URL from any supported platform"}
                  className="url-input"
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="download-button"
                  disabled={loading || !url.trim()}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaVideo className="button-icon" />
                      Get Info
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        {/* Progress Message */}
        {downloadProgress && (
          <div className="progress-message">
            <span>{downloadProgress}</span>
            {downloadingId && (
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            )}
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <div className="card video-info">
            <div className="card-header">
              <h2>Video Information</h2>
            </div>
            <div className="card-content">
              {/* Video Preview */}
              <div className="video-preview">
                <div className="thumbnail-container">
                  <img 
                    src={videoInfo.thumbnail} 
                    alt={videoInfo.title}
                    className="video-thumbnail"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLDivElement;
                      if (placeholder && placeholder.classList.contains('thumbnail-placeholder')) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'block';
                      const placeholder = target.nextElementSibling as HTMLDivElement;
                      if (placeholder && placeholder.classList.contains('thumbnail-placeholder')) {
                        placeholder.style.display = 'none';
                      }
                    }}
                  />
                  <div className="thumbnail-placeholder" style={{ display: 'none' }}>
                    <span className="placeholder-icon">🎬</span>
                    <span className="placeholder-text">No thumbnail available</span>
                  </div>
                </div>
                <div className="video-details">
                  <h3 className="video-title">{videoInfo.title}</h3>
                  
                  {/* Video Description */}
                  {videoInfo.description && (
                    <div className="video-description">
                      <p>{videoInfo.description.length > 200 ? 
                        `${videoInfo.description.substring(0, 200)}...` : 
                        videoInfo.description
                      }</p>
                    </div>
                  )}
                  
                  <div className="video-meta">
                    <span className="badge badge-platform">
                      {React.createElement((supportedPlatforms.find(p => p.name === videoInfo.platform)?.icon || FaVideo) as any, {
                        className: 'badge-icon',
                        style: { color: supportedPlatforms.find(p => p.name === videoInfo.platform)?.color || '#666' }
                      })}
                      {videoInfo.platform}
                    </span>
                    <span className="badge badge-uploader">
                      <FaUser className="badge-icon" />
                      {videoInfo.uploader}
                    </span>
                    <span className="badge badge-duration">
                      <FaClock className="badge-icon" />
                      {formatDuration(videoInfo.duration)}
                    </span>
                    {videoInfo.view_count && (
                      <span className="badge badge-views">
                        👁️ {formatViewCount(videoInfo.view_count)} views
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="download-options">
                <h4>Download Options</h4>
                
                {/* Audio Only Option */}
                <div className="format-option audio-option">
                  <div className="format-info">
                    <div className="format-title">
                      <FaMusic className="format-icon" /> Audio Only (MP3)
                    </div>
                    <div className="format-description">Extract audio from video</div>
                  </div>
                  <button 
                    onClick={() => handleDownload(undefined, true)}
                    disabled={downloadingId === 'audio'}
                    className="download-btn audio-btn"
                  >
                    {downloadingId === 'audio' ? (
                      <>
                        <div className="spinner"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaDownload className="button-icon" />
                        Download MP3
                      </>
                    )}
                  </button>
                </div>

                {/* Video Formats */}
                <div className="video-formats">
                  {videoInfo.formats
                    .filter(format => format.vcodec !== 'none')
                    .slice(0, 5)
                    .map((format) => (
                    <div key={format.format_id} className="format-option">
                      <div className="format-info">
                        <div className="format-title">
                          <FaVideo className="format-icon" /> {format.quality} ({format.ext.toUpperCase()})
                        </div>
                        <div className="format-description">
                          {formatFileSize(format.filesize)}
                          {format.format_note && (
                            <span className="format-note"> • {format.format_note}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownload(format.format_id)}
                        disabled={downloadingId === format.format_id}
                        className="download-btn"
                      >
                        {downloadingId === format.format_id ? (
                          <>
                            <div className="spinner"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <FaDownload className="button-icon" />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="card features-card">
          <div className="card-header">
            <h2>Features</h2>
            <p>Why choose our MediaDownloader?</p>
          </div>
          <div className="card-content">
            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">🌐</div>
                <h3>Multiple Platforms</h3>
                <p>Support for YouTube, Instagram, TikTok, Facebook, LinkedIn, and X (Twitter)</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🎵</div>
                <h3>Various Formats</h3>
                <p>Download in different qualities and extract audio as MP3</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h3>Fast & Secure</h3>
                <p>Quick processing with HTTPS encryption</p>
              </div>
              <div className="feature">
                <div className="feature-icon">👤</div>
                <h3>No Registration</h3>
                <p>Start downloading immediately, no account required</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/contact">Contact</a>
          </div>
          <p className="footer-text">
            &copy; 2025 MediaDownloader. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;