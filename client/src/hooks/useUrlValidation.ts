import { useState, useCallback } from 'react'

type ValidationResult = {
  isValid: boolean
  error?: string
  platform?: string
}

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
}

export function useUrlValidation() {
  const [validationState, setValidationState] = useState<ValidationResult>({
    isValid: false
  })

  const validateUrl = useCallback((url: string): ValidationResult => {
    if (!url.trim()) {
      return { isValid: false, error: 'URL is required' }
    }

    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace('www.', '')
      
      const platform = Object.keys(SUPPORTED_PLATFORMS).find(domain => 
        hostname.includes(domain)
      )

      if (!platform) {
        return { 
          isValid: false, 
          error: 'Unsupported platform. Please use YouTube, Instagram, TikTok, Facebook, LinkedIn, or X (Twitter)' 
        }
      }

      const result = { 
        isValid: true, 
        platform: SUPPORTED_PLATFORMS[platform as keyof typeof SUPPORTED_PLATFORMS] 
      }
      
      setValidationState(result)
      return result
      
    } catch {
      const result = { isValid: false, error: 'Invalid URL format' }
      setValidationState(result)
      return result
    }
  }, [])

  const clearValidation = useCallback(() => {
    setValidationState({ isValid: false })
  }, [])

  return {
    validationState,
    validateUrl,
    clearValidation
  }
}