# MediaDownloader Clone

A modern, fast, and secure media downloader supporting YouTube, Instagram, TikTok, Facebook, LinkedIn, and X (Twitter).

## 🚀 Features

- ✅ Download videos from multiple platforms (YouTube, Instagram, TikTok, Facebook, LinkedIn, X)
- ✅ Extract audio as MP3
- ✅ Multiple quality options
- ✅ Official platform icons and branding
- ✅ Post descriptions and metadata display
- ✅ Responsive design
- ✅ Fast processing with progress indicators
- ✅ Secure HTTPS
- ✅ No registration required
- ✅ Rate limiting for security
- ✅ Clean, intuitive interface

## 📋 Requirements

### Prerequisites

- **Node.js** 14.0.0 or higher
- **npm** or **yarn**
- **yt-dlp** installed globally

### Installing yt-dlp

**Windows:**
```powershell
# Using pip
pip install yt-dlp

# Or download binary from: https://github.com/yt-dlp/yt-dlp/releases
# Add to PATH for global access
```

**macOS:**
```bash
brew install yt-dlp
```

**Linux:**
```bash
# Using pip
pip install yt-dlp

# Or using package manager (Ubuntu/Debian)
sudo apt install yt-dlp
```

## 🛠️ Installation

1. **Clone or navigate to the project directory:**
```bash
cd c:\Projetos\MidiaDownload
```

2. **Install all dependencies:**
```bash
npm run install:all
```

This will install dependencies for the root project, client, and server.

## 🚀 Development

Start the development environment (both frontend and backend):
```bash
npm run dev
```

This will start:
- React frontend at: http://localhost:3000
- Express backend at: http://localhost:3001

The frontend will automatically proxy API requests to the backend during development.

## 🏗️ Production Build

1. **Build the React application:**
```bash
npm run build
```

2. **Start the production server:**
```bash
npm start
```

The production server will serve both the API and the built React app.

## 📁 Project Structure

```
MidiaDownload/
├── client/                 # React TypeScript frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── App.css        # Styling
│   │   ├── index.tsx      # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Client dependencies
│   └── tsconfig.json      # TypeScript config
├── server/                 # Express.js backend
│   ├── index.js           # Server entry point
│   ├── package.json       # Server dependencies
│   └── .env               # Environment variables
├── package.json           # Root package.json with scripts
└── README.md
```

## 🔌 API Endpoints

### `POST /api/info`
Get video information from URL.

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 180,
  "uploader": "Channel Name",
  "platform": "YouTube",
  "formats": [...]
}
```

### `POST /api/download`
Download video or audio.

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "format_id": "18",
  "audio_only": false
}
```

**Response:** Binary stream (video/audio file)

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-10T..."
}
```

## 🌐 Supported Platforms

- **YouTube** (youtube.com, youtu.be)
- **Facebook** (facebook.com, fb.watch)
- **Instagram** (instagram.com)
- **TikTok** (tiktok.com)
- **LinkedIn** (linkedin.com)
- **X (Twitter)** (x.com, twitter.com, t.co)

## 🔒 Security Features

- **Rate limiting:** 100 requests per 15 minutes per IP
- **CORS protection:** Configured for development and production
- **Helmet security headers:** Standard security headers applied
- **HTTPS enforcement:** In production environment
- **Input validation:** URL validation and sanitization

## 🎯 Performance

- **Load time:** Under 3 seconds
- **Processing time:** Under 10 seconds for most videos
- **Responsive design:** Optimized for desktop, tablet, and mobile
- **Efficient streaming:** Direct file streaming for downloads

## 🐛 Troubleshooting

### Common Issues

1. **yt-dlp not found:**
   - Ensure yt-dlp is installed and available in PATH
   - Test with: `yt-dlp --version`

2. **Download fails:**
   - Check if the URL is from a supported platform
   - Verify the video is publicly accessible
   - Some platforms may have regional restrictions

3. **CORS errors:**
   - Ensure the backend is running on port 3001
   - Check that CORS is properly configured

### Environment Variables

Create `server/.env` with:
```
NODE_ENV=development
PORT=3001
```

For production:
```
NODE_ENV=production
PORT=3001
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review the yt-dlp documentation
- Create an issue in the repository

---

**Built with:** React, TypeScript, Node.js, Express, and yt-dlp

## 🚀 Deployment

### Deploy to Netlify

1. **Build the project:**
   ```bash
   npm run build:all
   ```

2. **Deploy to Netlify:**
   ```bash
   # Install Netlify CLI if not installed
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=client/build
   ```

3. **Or use Netlify UI:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build:all`
   - Set publish directory: `client/build`
   - Set environment variables: `NODE_OPTIONS=--openssl-legacy-provider`

### Environment Variables for Production

Create a `.env` file in the root directory:
```bash
NODE_ENV=production
PORT=3001
REACT_APP_API_BASE_URL=https://your-domain.netlify.app/.netlify/functions
```

### GitHub Repository Setup

1. **Initialize and commit:**
   ```bash
   git add .
   git commit -m "feat: Add MediaDownloader with LinkedIn and X support"
   ```

2. **Add remote repository:**
   ```bash
   git remote add origin https://github.com/your-username/mediadownloader.git
   git branch -M main
   git push -u origin main
   ```

### Notes for Production

- Ensure `yt-dlp` is available in the deployment environment
- For Netlify, consider using Netlify Functions for API endpoints
- Update CORS origins in `server/index.js` for production domain
- Monitor rate limits and implement proper error handling