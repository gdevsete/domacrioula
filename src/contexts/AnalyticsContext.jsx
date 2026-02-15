import { createContext, useContext, useEffect, useCallback, useRef } from 'react'

const AnalyticsContext = createContext(null)

// Chaves do localStorage
const STORAGE_KEYS = {
  VISITS: 'doma_crioula_visits',
  EVENTS: 'doma_crioula_events',
  PIXELS: 'doma_crioula_pixels',
  SESSION: 'doma_crioula_session'
}

// Gerar ID único para visitante
const generateVisitorId = () => {
  const stored = localStorage.getItem('doma_crioula_visitor_id')
  if (stored) return stored
  const id = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  localStorage.setItem('doma_crioula_visitor_id', id)
  return id
}

// Gerar ID de sessão
const generateSessionId = () => {
  return 's_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Obter dados do visitante via IP API (gratuito)
const getVisitorData = async () => {
  try {
    // Usando ipapi.co - gratuito até 1000 req/dia
    const response = await fetch('https://ipapi.co/json/')
    if (!response.ok) throw new Error('API error')
    const data = await response.json()
    return {
      ip: data.ip || 'unknown',
      city: data.city || 'Desconhecida',
      region: data.region || 'Desconhecido',
      country: data.country_name || 'Brasil',
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      isp: data.org || 'Desconhecido'
    }
  } catch (error) {
    // Fallback se API falhar
    return {
      ip: 'unknown',
      city: 'Desconhecida',
      region: 'Desconhecido',
      country: 'Brasil',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isp: 'Desconhecido'
    }
  }
}

// Detectar origem do tráfego
const getTrafficSource = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const referrer = document.referrer
  
  // UTM parameters
  const utmSource = urlParams.get('utm_source')
  const utmMedium = urlParams.get('utm_medium')
  const utmCampaign = urlParams.get('utm_campaign')
  const utmContent = urlParams.get('utm_content')
  const utmTerm = urlParams.get('utm_term')
  
  // Facebook/Meta parameters
  const fbclid = urlParams.get('fbclid')
  
  // Google parameters
  const gclid = urlParams.get('gclid')
  
  // TikTok parameters
  const ttclid = urlParams.get('ttclid')
  
  let source = 'direct'
  let medium = 'none'
  let campaign = ''
  
  if (utmSource) {
    source = utmSource
    medium = utmMedium || 'unknown'
    campaign = utmCampaign || ''
  } else if (fbclid) {
    source = 'facebook'
    medium = 'paid'
    campaign = 'facebook_ads'
  } else if (gclid) {
    source = 'google'
    medium = 'cpc'
    campaign = 'google_ads'
  } else if (ttclid) {
    source = 'tiktok'
    medium = 'paid'
    campaign = 'tiktok_ads'
  } else if (referrer) {
    const refUrl = new URL(referrer)
    const hostname = refUrl.hostname.toLowerCase()
    
    if (hostname.includes('google')) {
      source = 'google'
      medium = 'organic'
    } else if (hostname.includes('facebook') || hostname.includes('fb.')) {
      source = 'facebook'
      medium = 'social'
    } else if (hostname.includes('instagram')) {
      source = 'instagram'
      medium = 'social'
    } else if (hostname.includes('tiktok')) {
      source = 'tiktok'
      medium = 'social'
    } else if (hostname.includes('youtube')) {
      source = 'youtube'
      medium = 'social'
    } else if (hostname.includes('twitter') || hostname.includes('x.com')) {
      source = 'twitter'
      medium = 'social'
    } else if (hostname.includes('whatsapp')) {
      source = 'whatsapp'
      medium = 'social'
    } else {
      source = hostname
      medium = 'referral'
    }
  }
  
  return {
    source,
    medium,
    campaign,
    content: utmContent || '',
    term: utmTerm || '',
    fbclid: fbclid || '',
    gclid: gclid || '',
    ttclid: ttclid || '',
    referrer: referrer || 'direct'
  }
}

// Detectar dispositivo
const getDeviceInfo = () => {
  const ua = navigator.userAgent
  
  let device = 'desktop'
  if (/mobile/i.test(ua)) device = 'mobile'
  else if (/tablet|ipad/i.test(ua)) device = 'tablet'
  
  let os = 'unknown'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/macintosh|mac os/i.test(ua)) os = 'MacOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  
  let browser = 'unknown'
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome'
  else if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
  else if (/edge/i.test(ua)) browser = 'Edge'
  else if (/opera|opr/i.test(ua)) browser = 'Opera'
  
  return {
    device,
    os,
    browser,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language || 'pt-BR'
  }
}

export const AnalyticsProvider = ({ children }) => {
  const sessionRef = useRef(null)
  const visitorIdRef = useRef(null)
  const locationDataRef = useRef(null)
  const hasTrackedRef = useRef(false)

  // Inicializar sessão
  useEffect(() => {
    const initSession = async () => {
      // Verificar se já tem sessão ativa (últimos 30 min)
      const storedSession = sessionStorage.getItem(STORAGE_KEYS.SESSION)
      if (storedSession) {
        const session = JSON.parse(storedSession)
        if (Date.now() - session.lastActivity < 30 * 60 * 1000) {
          sessionRef.current = session
          visitorIdRef.current = session.visitorId
          return
        }
      }
      
      // Criar nova sessão
      visitorIdRef.current = generateVisitorId()
      sessionRef.current = {
        id: generateSessionId(),
        visitorId: visitorIdRef.current,
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageViews: 0
      }
      
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionRef.current))
    }
    
    initSession()
  }, [])

  // Atualizar atividade da sessão
  const updateSessionActivity = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.lastActivity = Date.now()
      sessionRef.current.pageViews += 1
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionRef.current))
    }
  }, [])

  // Registrar visita
  const trackPageView = useCallback(async (pagePath) => {
    updateSessionActivity()
    
    // Obter dados de localização se ainda não tem
    if (!locationDataRef.current) {
      locationDataRef.current = await getVisitorData()
    }
    
    const visit = {
      id: 'pv_' + Date.now().toString(36),
      timestamp: Date.now(),
      date: new Date().toISOString(),
      visitorId: visitorIdRef.current,
      sessionId: sessionRef.current?.id,
      page: pagePath || window.location.pathname,
      title: document.title,
      ...locationDataRef.current,
      ...getDeviceInfo(),
      ...getTrafficSource(),
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    }
    
    // Salvar no localStorage
    const visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]')
    visits.push(visit)
    
    // Manter apenas últimos 30 dias (limpar dados antigos)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    const filteredVisits = visits.filter(v => v.timestamp > thirtyDaysAgo)
    
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(filteredVisits))
    
    // Disparar pixels
    firePixelEvent('PageView', { page: pagePath })
    
    return visit
  }, [updateSessionActivity])

  // Registrar evento (click, add to cart, purchase, etc)
  const trackEvent = useCallback((eventName, eventData = {}) => {
    const event = {
      id: 'ev_' + Date.now().toString(36),
      timestamp: Date.now(),
      date: new Date().toISOString(),
      visitorId: visitorIdRef.current,
      sessionId: sessionRef.current?.id,
      eventName,
      eventData,
      page: window.location.pathname,
      hour: new Date().getHours()
    }
    
    const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
    events.push(event)
    
    // Manter apenas últimos 30 dias
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    const filteredEvents = events.filter(e => e.timestamp > thirtyDaysAgo)
    
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filteredEvents))
    
    // Disparar pixels
    firePixelEvent(eventName, eventData)
    
    return event
  }, [])

  // Disparar evento nos pixels configurados
  const firePixelEvent = useCallback((eventName, eventData = {}) => {
    const pixels = JSON.parse(localStorage.getItem(STORAGE_KEYS.PIXELS) || '{}')
    
    // Facebook Pixel - sempre verificar window.fbq (carregado via index.html)
    if (window.fbq) {
      try {
        if (eventName === 'PageView') {
          window.fbq('track', 'PageView')
        } else if (eventName === 'AddToCart') {
          window.fbq('track', 'AddToCart', eventData)
        } else if (eventName === 'Purchase') {
          window.fbq('track', 'Purchase', eventData)
        } else if (eventName === 'InitiateCheckout') {
          window.fbq('track', 'InitiateCheckout', eventData)
        } else if (eventName === 'AddPaymentInfo') {
          window.fbq('track', 'AddPaymentInfo', eventData)
        } else if (eventName === 'Lead') {
          window.fbq('track', 'Lead', eventData)
        } else if (eventName === 'ViewContent') {
          window.fbq('track', 'ViewContent', eventData)
        } else {
          window.fbq('trackCustom', eventName, eventData)
        }
      } catch (e) {
        console.warn('Facebook Pixel error:', e)
      }
    }
    
    // Google Analytics 4
    if (pixels.googleAnalyticsId && window.gtag) {
      try {
        const gaEventMap = {
          'PageView': 'page_view',
          'AddToCart': 'add_to_cart',
          'Purchase': 'purchase',
          'InitiateCheckout': 'begin_checkout',
          'AddPaymentInfo': 'add_payment_info',
          'ViewContent': 'view_item'
        }
        window.gtag('event', gaEventMap[eventName] || eventName, eventData)
      } catch (e) {
        console.warn('Google Analytics error:', e)
      }
    }
    
    // TikTok Pixel
    if (pixels.tiktokPixelId && window.ttq) {
      try {
        if (eventName === 'PageView') {
          window.ttq.page()
        } else if (eventName === 'AddToCart') {
          window.ttq.track('AddToCart', eventData)
        } else if (eventName === 'Purchase') {
          window.ttq.track('CompletePayment', eventData)
        } else {
          window.ttq.track(eventName, eventData)
        }
      } catch (e) {
        console.warn('TikTok Pixel error:', e)
      }
    }
  }, [])

  // Obter todas as visitas
  const getVisits = useCallback((filters = {}) => {
    const visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]')
    
    let filtered = visits
    
    if (filters.startDate) {
      filtered = filtered.filter(v => v.timestamp >= new Date(filters.startDate).getTime())
    }
    if (filters.endDate) {
      filtered = filtered.filter(v => v.timestamp <= new Date(filters.endDate).getTime())
    }
    if (filters.source) {
      filtered = filtered.filter(v => v.source === filters.source)
    }
    if (filters.device) {
      filtered = filtered.filter(v => v.device === filters.device)
    }
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }, [])

  // Obter todos os eventos
  const getEvents = useCallback((filters = {}) => {
    const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
    
    let filtered = events
    
    if (filters.eventName) {
      filtered = filtered.filter(e => e.eventName === filters.eventName)
    }
    if (filters.startDate) {
      filtered = filtered.filter(e => e.timestamp >= new Date(filters.startDate).getTime())
    }
    if (filters.endDate) {
      filtered = filtered.filter(e => e.timestamp <= new Date(filters.endDate).getTime())
    }
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }, [])

  // Configuração padrão dos pixels
  const DEFAULT_PIXELS = {
    facebookPixelId: '26115865218048848',
    googleAnalyticsId: '',
    tiktokPixelId: ''
  }

  // Obter configuração de pixels
  const getPixels = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PIXELS)
    if (!stored) {
      // Salvar e retornar configuração padrão
      localStorage.setItem(STORAGE_KEYS.PIXELS, JSON.stringify(DEFAULT_PIXELS))
      return DEFAULT_PIXELS
    }
    return JSON.parse(stored)
  }, [])

  // Salvar configuração de pixels
  const savePixels = useCallback((pixelConfig) => {
    localStorage.setItem(STORAGE_KEYS.PIXELS, JSON.stringify(pixelConfig))
    
    // Recarregar scripts de pixel se necessário
    injectPixelScripts(pixelConfig)
  }, [])

  // Injetar scripts de pixel no head
  const injectPixelScripts = useCallback((pixels) => {
    // Facebook Pixel - já está no index.html, não precisa injetar novamente
    // O pixel base é carregado pelo index.html com ID 26115865218048848
    // Os eventos são disparados via window.fbq que já está disponível
    
    // Google Analytics 4
    if (pixels.googleAnalyticsId && !document.getElementById('ga-script')) {
      const gaScript1 = document.createElement('script')
      gaScript1.async = true
      gaScript1.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.googleAnalyticsId}`
      gaScript1.id = 'ga-script'
      document.head.appendChild(gaScript1)
      
      const gaScript2 = document.createElement('script')
      gaScript2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${pixels.googleAnalyticsId}');
      `
      document.head.appendChild(gaScript2)
    }
    
    // TikTok Pixel
    if (pixels.tiktokPixelId && !document.getElementById('tt-pixel-script')) {
      const ttScript = document.createElement('script')
      ttScript.id = 'tt-pixel-script'
      ttScript.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${pixels.tiktokPixelId}');
          ttq.page();
        }(window, document, 'ttq');
      `
      document.head.appendChild(ttScript)
    }
  }, [])

  // Carregar pixels ao iniciar
  useEffect(() => {
    const pixels = getPixels()
    if (pixels.facebookPixelId || pixels.googleAnalyticsId || pixels.tiktokPixelId) {
      injectPixelScripts(pixels)
    }
  }, [getPixels, injectPixelScripts])

  // Analytics resumido
  const getAnalyticsSummary = useCallback((period = 7) => {
    const startDate = Date.now() - (period * 24 * 60 * 60 * 1000)
    const visits = getVisits({ startDate })
    const events = getEvents({ startDate })
    
    // Visitantes únicos
    const uniqueVisitors = new Set(visits.map(v => v.visitorId)).size
    
    // Sessões únicas
    const uniqueSessions = new Set(visits.map(v => v.sessionId)).size
    
    // Pageviews
    const totalPageviews = visits.length
    
    // Páginas por sessão
    const pagesPerSession = uniqueSessions > 0 ? (totalPageviews / uniqueSessions).toFixed(1) : 0
    
    // Eventos por tipo
    const eventsByType = events.reduce((acc, e) => {
      acc[e.eventName] = (acc[e.eventName] || 0) + 1
      return acc
    }, {})
    
    // Por fonte de tráfego
    const bySource = visits.reduce((acc, v) => {
      acc[v.source] = (acc[v.source] || 0) + 1
      return acc
    }, {})
    
    // Por dispositivo
    const byDevice = visits.reduce((acc, v) => {
      acc[v.device] = (acc[v.device] || 0) + 1
      return acc
    }, {})
    
    // Por cidade
    const byCity = visits.reduce((acc, v) => {
      const city = v.city || 'Desconhecida'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {})
    
    // Por hora do dia
    const byHour = visits.reduce((acc, v) => {
      acc[v.hour] = (acc[v.hour] || 0) + 1
      return acc
    }, {})
    
    // Por dia da semana
    const byDayOfWeek = visits.reduce((acc, v) => {
      acc[v.dayOfWeek] = (acc[v.dayOfWeek] || 0) + 1
      return acc
    }, {})
    
    // Visitas por dia
    const visitsByDay = {}
    visits.forEach(v => {
      const day = new Date(v.timestamp).toISOString().split('T')[0]
      visitsByDay[day] = (visitsByDay[day] || 0) + 1
    })
    
    // Conversões (eventos de compra)
    const purchases = events.filter(e => e.eventName === 'Purchase')
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.eventData?.value || 0), 0)
    
    // Taxa de conversão
    const conversionRate = uniqueVisitors > 0 
      ? ((purchases.length / uniqueVisitors) * 100).toFixed(2) 
      : 0
    
    return {
      uniqueVisitors,
      uniqueSessions,
      totalPageviews,
      pagesPerSession,
      eventsByType,
      bySource,
      byDevice,
      byCity,
      byHour,
      byDayOfWeek,
      visitsByDay,
      purchases: purchases.length,
      totalRevenue,
      conversionRate,
      topPages: getTopPages(visits),
      recentVisits: visits.slice(0, 20)
    }
  }, [getVisits, getEvents])

  // Top páginas
  const getTopPages = (visits) => {
    const pageCount = visits.reduce((acc, v) => {
      acc[v.page] = (acc[v.page] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }))
  }

  // Recomendações de anúncios baseadas nos dados
  const getAdRecommendations = useCallback(() => {
    const summary = getAnalyticsSummary(30)
    const recommendations = []
    
    // Analisar melhores horários
    const bestHours = Object.entries(summary.byHour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))
    
    if (bestHours.length > 0) {
      recommendations.push({
        type: 'timing',
        title: 'Melhores horários para anunciar',
        description: `Seus visitantes são mais ativos às ${bestHours.map(h => `${h}h`).join(', ')}. Concentre seus anúncios nesses horários.`,
        priority: 'high',
        icon: '⏰'
      })
    }
    
    // Analisar melhores fontes
    const topSources = Object.entries(summary.bySource)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    if (topSources.length > 0) {
      const [bestSource, count] = topSources[0]
      const percentage = ((count / summary.totalPageviews) * 100).toFixed(0)
      recommendations.push({
        type: 'source',
        title: `${bestSource} é sua melhor fonte`,
        description: `${percentage}% do seu tráfego vem de ${bestSource}. Considere aumentar investimento nessa plataforma.`,
        priority: 'high',
        icon: '📊'
      })
    }
    
    // Analisar dispositivos
    const mobilePercentage = ((summary.byDevice.mobile || 0) / summary.totalPageviews * 100).toFixed(0)
    if (mobilePercentage > 60) {
      recommendations.push({
        type: 'device',
        title: 'Foco em mobile',
        description: `${mobilePercentage}% dos visitantes usam celular. Certifique-se que seus anúncios estão otimizados para mobile.`,
        priority: 'medium',
        icon: '📱'
      })
    }
    
    // Analisar cidades
    const topCities = Object.entries(summary.byCity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    if (topCities.length > 0) {
      const cityList = topCities.map(([city]) => city).join(', ')
      recommendations.push({
        type: 'location',
        title: 'Segmentação geográfica',
        description: `Maior concentração de visitantes em: ${cityList}. Segmente seus anúncios para essas regiões.`,
        priority: 'medium',
        icon: '📍'
      })
    }
    
    // Analisar dias da semana
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const bestDays = Object.entries(summary.byDayOfWeek)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day]) => dayNames[parseInt(day)])
    
    if (bestDays.length > 0) {
      recommendations.push({
        type: 'days',
        title: 'Melhores dias da semana',
        description: `Os dias com mais visitas são ${bestDays.join(' e ')}. Aumente o orçamento nesses dias.`,
        priority: 'medium',
        icon: '📅'
      })
    }
    
    // Taxa de conversão baixa
    if (summary.conversionRate < 1 && summary.uniqueVisitors > 100) {
      recommendations.push({
        type: 'conversion',
        title: 'Melhorar taxa de conversão',
        description: `Taxa de conversão de ${summary.conversionRate}% está abaixo da média (1-2%). Revise suas páginas de produto e checkout.`,
        priority: 'high',
        icon: '🎯'
      })
    }
    
    // Páginas populares
    if (summary.topPages.length > 0) {
      const topPage = summary.topPages[0]
      recommendations.push({
        type: 'content',
        title: 'Página mais popular',
        description: `"${topPage.page}" é sua página mais visitada com ${topPage.count} visitas. Use para remarketing.`,
        priority: 'low',
        icon: '⭐'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [getAnalyticsSummary])

  const value = {
    trackPageView,
    trackEvent,
    getVisits,
    getEvents,
    getPixels,
    savePixels,
    getAnalyticsSummary,
    getAdRecommendations
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

export default AnalyticsContext
