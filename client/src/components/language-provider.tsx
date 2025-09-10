import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Language translations
const translations = {
  en: {
    title: 'MediaDownloader',
    subtitle: 'Download videos and audio from YouTube, Instagram, TikTok, Facebook, LinkedIn, and X (Twitter)',
    enterUrl: 'Enter Video URL',
    pasteLink: 'Paste the link to your video from any supported platform',
    supportedPlatforms: 'Supported Platforms:',
    getInfo: 'Get Info',
    processing: 'Processing...',
    videoInfo: 'Video Information',
    downloadOptions: 'Download Options',
    audioOnly: 'Audio Only (MP3)',
    extractAudio: 'Extract audio from video',
    downloadMp3: 'Download MP3',
    downloading: 'Downloading...',
    download: 'Download',
    downloadCompleted: 'Download completed!',
    features: 'Features',
    whyChoose: 'Why choose our MediaDownloader?',
    fastDownloads: 'Fast Downloads',
    fastDescription: 'Lightning-fast download speeds with optimized servers',
    multipleFormats: 'Multiple Formats',
    formatsDescription: 'Support for various video and audio formats',
    noWatermark: 'No Watermark',
    watermarkDescription: 'Clean downloads without any watermarks',
    freeToUse: 'Free to Use',
    freeDescription: 'Completely free with no hidden costs',
    securePrivate: 'Secure & Private',
    secureDescription: 'Your privacy is protected, no data stored',
    easyToUse: 'Easy to Use',
    easyDescription: 'Simple interface for quick downloads',
    invalidUrl: 'Please enter a valid URL',
    fetchingInfo: 'Fetching video information...',
    downloadFailed: 'Download failed. Please try again.',
    failedToFetch: 'Failed to fetch video info',
    views: 'views',
    light: 'Light',
    dark: 'Dark',
    downloadHistory: 'Download History',
    clearHistory: 'Clear History',
    noHistory: 'No download history yet',
    redownload: 'Re-download',
  },
  pt: {
    title: 'MediaDownloader',
    subtitle: 'Baixe vídeos e áudio do YouTube, Instagram, TikTok, Facebook, LinkedIn e X (Twitter)',
    enterUrl: 'Insira a URL do Vídeo',
    pasteLink: 'Cole o link do seu vídeo de qualquer plataforma suportada',
    supportedPlatforms: 'Plataformas Suportadas:',
    getInfo: 'Obter Info',
    processing: 'Processando...',
    videoInfo: 'Informações do Vídeo',
    downloadOptions: 'Opções de Download',
    audioOnly: 'Apenas Áudio (MP3)',
    extractAudio: 'Extrair áudio do vídeo',
    downloadMp3: 'Baixar MP3',
    downloading: 'Baixando...',
    download: 'Baixar',
    downloadCompleted: 'Download concluído!',
    features: 'Recursos',
    whyChoose: 'Por que escolher nosso MediaDownloader?',
    fastDownloads: 'Downloads Rápidos',
    fastDescription: 'Velocidades de download super rápidas com servidores otimizados',
    multipleFormats: 'Múltiplos Formatos',
    formatsDescription: 'Suporte para vários formatos de vídeo e áudio',
    noWatermark: 'Sem Marca D\'água',
    watermarkDescription: 'Downloads limpos sem marcas d\'água',
    freeToUse: 'Gratuito',
    freeDescription: 'Completamente gratuito sem custos ocultos',
    securePrivate: 'Seguro e Privado',
    secureDescription: 'Sua privacidade é protegida, nenhum dado armazenado',
    easyToUse: 'Fácil de Usar',
    easyDescription: 'Interface simples para downloads rápidos',
    invalidUrl: 'Por favor, insira uma URL válida',
    fetchingInfo: 'Buscando informações do vídeo...',
    downloadFailed: 'Falha no download. Tente novamente.',
    failedToFetch: 'Falha ao buscar informações do vídeo',
    views: 'visualizações',
    light: 'Claro',
    dark: 'Escuro',
    downloadHistory: 'Histórico de Downloads',
    clearHistory: 'Limpar Histórico',
    noHistory: 'Nenhum histórico de download ainda',
    redownload: 'Baixar novamente',
  }
}

type Language = 'en' | 'pt'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations.en) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved as Language) || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key]
  }

  const value = {
    language,
    setLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}