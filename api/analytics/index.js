/**
 * API de Analytics (Supabase)
 * 
 * Rotas:
 * - POST /api/analytics?action=track - Registrar visita/evento
 * - GET /api/analytics?action=summary - Obter resumo de analytics (admin)
 * 
 * Também suporta URLs diretas no frontend que não usam query params:
 * - POST /api/analytics/track (via rewrite)
 * - GET /api/analytics/summary (via rewrite)
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

// Validar admin token
function validateAdminToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now() || payload.role !== 'admin') {
      return null
    }
    return payload
  } catch {
    return null
  }
}

// Handler para registrar visita/evento
async function handleTrack(req, res, supabase) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, data } = req.body

    if (type === 'pageview') {
      const visit = {
        visitor_id: data.visitorId,
        session_id: data.sessionId,
        page: data.page,
        title: data.title || '',
        referrer: data.referrer || '',
        source: data.source || 'direct',
        medium: data.medium || 'none',
        campaign: data.campaign || '',
        city: data.city || 'Desconhecida',
        region: data.region || 'Desconhecido',
        country: data.country || 'Brasil',
        device: data.device || 'desktop',
        browser: data.browser || 'unknown',
        os: data.os || 'unknown',
        user_agent: data.userAgent || '',
        hour: data.hour || new Date().getHours(),
        day_of_week: data.dayOfWeek || new Date().getDay()
      }

      const { error } = await supabase
        .from('analytics_visits')
        .insert(visit)

      if (error) {
        console.error('Error saving visit:', error)
        return res.status(500).json({ error: 'Erro ao salvar visita' })
      }

      return res.status(200).json({ success: true, type: 'pageview' })
    }

    if (type === 'event') {
      const event = {
        visitor_id: data.visitorId,
        session_id: data.sessionId,
        event_name: data.eventName,
        event_data: data.eventData || {},
        page: data.page || '',
        hour: data.hour || new Date().getHours()
      }

      const { error } = await supabase
        .from('analytics_events')
        .insert(event)

      if (error) {
        console.error('Error saving event:', error)
        return res.status(500).json({ error: 'Erro ao salvar evento' })
      }

      return res.status(200).json({ success: true, type: 'event' })
    }

    return res.status(400).json({ error: 'Tipo inválido. Use "pageview" ou "event"' })

  } catch (error) {
    console.error('Track error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Handler para obter resumo de analytics (admin)
async function handleSummary(req, res, supabase) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validar admin
  const admin = validateAdminToken(req.headers.authorization)
  if (!admin) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  try {
    const { days = 30 } = req.query
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(days))
    const dateFilter = daysAgo.toISOString()

    // Buscar visitas e eventos em paralelo
    const [visitsResult, eventsResult] = await Promise.all([
      supabase
        .from('analytics_visits')
        .select('*')
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false }),
      supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false })
    ])

    if (visitsResult.error) throw visitsResult.error
    if (eventsResult.error) throw eventsResult.error

    const visits = visitsResult.data || []
    const events = eventsResult.data || []

    // Calcular métricas
    const uniqueVisitors = new Set(visits.map(v => v.visitor_id)).size
    const totalPageviews = visits.length
    const uniqueSessions = new Set(visits.map(v => v.session_id)).size

    // Agrupar por fonte de tráfego
    const trafficBySource = {}
    visits.forEach(v => {
      const source = v.source || 'direct'
      if (!trafficBySource[source]) {
        trafficBySource[source] = { count: 0, name: source }
      }
      trafficBySource[source].count++
    })

    // Agrupar por localização
    const trafficByLocation = {}
    visits.forEach(v => {
      const city = v.city || 'Desconhecida'
      const region = v.region || ''
      const key = city + (region ? `, ${region}` : '')
      if (!trafficByLocation[key]) {
        trafficByLocation[key] = { count: 0, city, region, country: v.country || 'Brasil' }
      }
      trafficByLocation[key].count++
    })

    // Agrupar por dispositivo
    const trafficByDevice = {}
    visits.forEach(v => {
      const device = v.device || 'desktop'
      if (!trafficByDevice[device]) {
        trafficByDevice[device] = { count: 0, device }
      }
      trafficByDevice[device].count++
    })

    // Agrupar por página
    const pageviews = {}
    visits.forEach(v => {
      const page = v.page || '/'
      if (!pageviews[page]) {
        pageviews[page] = { count: 0, page }
      }
      pageviews[page].count++
    })

    // Agrupar por dia
    const dailyVisits = {}
    visits.forEach(v => {
      const date = new Date(v.created_at).toISOString().split('T')[0]
      if (!dailyVisits[date]) {
        dailyVisits[date] = { date, pageviews: 0, visitors: new Set() }
      }
      dailyVisits[date].pageviews++
      dailyVisits[date].visitors.add(v.visitor_id)
    })

    // Converter sets para contagem
    const dailyData = Object.values(dailyVisits)
      .map(d => ({
        date: d.date,
        pageviews: d.pageviews,
        visitors: d.visitors.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Agrupar por hora
    const hourlyData = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }))
    visits.forEach(v => {
      const hour = v.hour || new Date(v.created_at).getHours()
      if (hour >= 0 && hour < 24) {
        hourlyData[hour].count++
      }
    })

    // Agrupar eventos por tipo
    const eventsByType = {}
    events.forEach(e => {
      const name = e.event_name || 'unknown'
      if (!eventsByType[name]) {
        eventsByType[name] = { count: 0, name }
      }
      eventsByType[name].count++
    })

    // Calcular conversões
    const addToCartEvents = events.filter(e => e.event_name === 'AddToCart').length
    const purchaseEvents = events.filter(e => e.event_name === 'Purchase').length
    const initiateCheckoutEvents = events.filter(e => e.event_name === 'InitiateCheckout').length
    const leadEvents = events.filter(e => e.event_name === 'Lead').length

    // Taxa de conversão
    const conversionRate = uniqueVisitors > 0 
      ? ((purchaseEvents / uniqueVisitors) * 100).toFixed(2)
      : 0

    // Calcular receita total dos eventos de compra
    let totalRevenue = 0
    events.filter(e => e.event_name === 'Purchase').forEach(e => {
      if (e.event_data && e.event_data.value) {
        totalRevenue += parseFloat(e.event_data.value) || 0
      }
    })

    return res.status(200).json({
      summary: {
        totalPageviews,
        uniqueVisitors,
        uniqueSessions,
        totalEvents: events.length,
        conversionRate: parseFloat(conversionRate),
        totalRevenue
      },
      conversions: {
        addToCart: addToCartEvents,
        initiateCheckout: initiateCheckoutEvents,
        purchases: purchaseEvents,
        leads: leadEvents
      },
      trafficBySource: Object.values(trafficBySource).sort((a, b) => b.count - a.count),
      trafficByLocation: Object.values(trafficByLocation).sort((a, b) => b.count - a.count).slice(0, 20),
      trafficByDevice: Object.values(trafficByDevice).sort((a, b) => b.count - a.count),
      pageviews: Object.values(pageviews).sort((a, b) => b.count - a.count).slice(0, 20),
      dailyData,
      hourlyData,
      eventsByType: Object.values(eventsByType).sort((a, b) => b.count - a.count),
      recentVisits: visits.slice(0, 50).map(v => ({
        id: v.id,
        page: v.page,
        city: v.city,
        region: v.region,
        device: v.device,
        source: v.source,
        createdAt: v.created_at
      })),
      recentEvents: events.slice(0, 50).map(e => ({
        id: e.id,
        eventName: e.event_name,
        page: e.page,
        eventData: e.event_data,
        createdAt: e.created_at
      }))
    })

  } catch (error) {
    console.error('Summary error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  // Determinar a rota pela URL ou query param
  // Suporta: /api/analytics?action=track ou /api/analytics/track
  let route = req.query.action || ''
  
  // Extrair da URL se não vier como query param
  if (!route) {
    const url = req.url || ''
    const match = url.match(/\/api\/analytics\/([^?/]+)/)
    if (match) {
      route = match[1]
    }
  }

  switch (route) {
    case 'track':
      return handleTrack(req, res, supabase)
    
    case 'summary':
      return handleSummary(req, res, supabase)
    
    default:
      return res.status(404).json({
        error: 'Not found',
        message: `Route /api/analytics/${route} not found`,
        availableRoutes: [
          'POST /api/analytics/track',
          'GET /api/analytics/summary'
        ]
      })
  }
}
