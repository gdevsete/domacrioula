import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAnalytics } from '../contexts/AnalyticsContext'

/**
 * Componente que rastreia automaticamente pageviews
 * Coloque dentro do Router para funcionar
 */
const AnalyticsTracker = () => {
  const location = useLocation()
  const { trackPageView, trackEvent } = useAnalytics()
  const lastPathRef = useRef(null)

  // Rastrear mudanças de página
  useEffect(() => {
    // Evitar duplicatas na mesma página
    if (lastPathRef.current === location.pathname) return
    lastPathRef.current = location.pathname
    
    // Pequeno delay para garantir que o título da página foi atualizado
    const timeoutId = setTimeout(() => {
      trackPageView(location.pathname)
      
      // Disparar PageView no Facebook Pixel também
      trackEvent('PageView', {
        page_path: location.pathname,
        page_title: document.title
      })
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [location.pathname, trackPageView, trackEvent])

  // Rastrear tempo na página
  useEffect(() => {
    const startTime = Date.now()
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      if (timeSpent > 5) { // Só registra se ficou mais de 5 segundos
        trackEvent('TimeOnPage', {
          page: location.pathname,
          seconds: timeSpent
        })
      }
    }
  }, [location.pathname, trackEvent])

  // Rastrear cliques em links externos e CTAs
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a, button')
      if (!target) return
      
      // Links externos
      if (target.tagName === 'A' && target.href) {
        try {
          const url = new URL(target.href)
          if (url.hostname !== window.location.hostname) {
            trackEvent('ExternalLinkClick', {
              url: target.href,
              text: target.textContent?.slice(0, 50)
            })
          }
        } catch (e) {
          // URL inválida, ignorar
        }
      }
      
      // Botões de CTA
      if (target.classList.contains('btn-checkout') || 
          target.classList.contains('btn-add-cart') ||
          target.classList.contains('btn-buy') ||
          target.classList.contains('btn-whatsapp')) {
        trackEvent('CTAClick', {
          buttonClass: target.className,
          text: target.textContent?.slice(0, 50),
          page: location.pathname
        })
      }
    }
    
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [location.pathname, trackEvent])

  // Rastrear scroll depth
  useEffect(() => {
    let maxScroll = 0
    let reported25 = false
    let reported50 = false
    let reported75 = false
    let reported100 = false
    
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        
        if (scrollPercent >= 25 && !reported25) {
          reported25 = true
          trackEvent('ScrollDepth', { depth: 25, page: location.pathname })
        }
        if (scrollPercent >= 50 && !reported50) {
          reported50 = true
          trackEvent('ScrollDepth', { depth: 50, page: location.pathname })
        }
        if (scrollPercent >= 75 && !reported75) {
          reported75 = true
          trackEvent('ScrollDepth', { depth: 75, page: location.pathname })
        }
        if (scrollPercent >= 95 && !reported100) {
          reported100 = true
          trackEvent('ScrollDepth', { depth: 100, page: location.pathname })
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname, trackEvent])

  return null // Componente invisível
}

export default AnalyticsTracker
