const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.netlify.app', 'https://*.netlify.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Supported platforms
const SUPPORTED_PLATFORMS = {
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'facebook.com': 'Facebook',
  'fb.watch': 'Facebook',
  'instagram.com': 'Instagram',
  'tiktok.com': 'TikTok',
  'linkedin.com': 'LinkedIn',
  'twitter.com': 'X (Twitter)',
  'x.com': 'X (Twitter)',
  't.co': 'X (Twitter)'
};

// Validate URL
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return Object.keys(SUPPORTED_PLATFORMS).some(domain => 
      urlObj.hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

// Get video info endpoint
app.post('/api/info', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL or unsupported platform'
      });
    }

    const ytDlp = spawn('python', [
      '-m', 'yt_dlp',
      '--dump-json',
      '--no-playlist',
      url
    ]);

    let stdout = '';
    let stderr = '';

    ytDlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytDlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytDlp.on('close', (code) => {
      if (code !== 0) {
        console.error('yt-dlp error:', stderr);
        return res.status(500).json({
          error: 'Failed to fetch video information'
        });
      }

      try {
        const videoInfo = JSON.parse(stdout);
        
        // Extract relevant information
        const hostname = new URL(url).hostname.replace('www.', '');
        const platform = SUPPORTED_PLATFORMS[hostname] || 
                        Object.keys(SUPPORTED_PLATFORMS).find(domain => hostname.includes(domain));
        
        const response = {
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          duration: videoInfo.duration,
          uploader: videoInfo.uploader,
          platform: platform ? SUPPORTED_PLATFORMS[platform] || platform : 'Unknown',
          description: videoInfo.description,
          view_count: videoInfo.view_count,
          upload_date: videoInfo.upload_date,
          webpage_url: videoInfo.webpage_url,
          formats: videoInfo.formats
            .filter(format => format.ext && (format.vcodec !== 'none' || format.acodec !== 'none'))
            .map(format => ({
              format_id: format.format_id,
              ext: format.ext,
              quality: format.height ? `${format.height}p` : 'audio',
              filesize: format.filesize,
              acodec: format.acodec,
              vcodec: format.vcodec,
              format_note: format.format_note
            }))
            .sort((a, b) => {
              if (a.quality === 'audio') return 1;
              if (b.quality === 'audio') return -1;
              return parseInt(b.quality) - parseInt(a.quality);
            })
        };

        res.json(response);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        res.status(500).json({
          error: 'Failed to parse video information'
        });
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Download endpoint
app.post('/api/download', async (req, res) => {
  try {
    const { url, format_id, audio_only } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL or unsupported platform'
      });
    }

    const args = [
      '--no-playlist',
      url
    ];

    if (audio_only) {
      args.push('-x', '--audio-format', 'mp3');
    } else if (format_id) {
      args.push('-f', format_id);
    }

    // Set output template
    args.push('-o', '%(title)s.%(ext)s');

    const ytDlp = spawn('python', ['-m', 'yt_dlp'].concat(args));

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment');

    ytDlp.stdout.pipe(res);

    ytDlp.stderr.on('data', (data) => {
      console.error('yt-dlp stderr:', data.toString());
    });

    ytDlp.on('close', (code) => {
      if (code !== 0) {
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Download failed'
          });
        }
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;