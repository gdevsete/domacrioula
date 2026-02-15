import crypto from 'crypto'

// Facebook Conversions API
// Envia eventos diretamente do servidor, bypassando bloqueadores de anúncios

const PIXEL_ID = '26115865218048848'
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN

// Hash SHA256 para dados do usuário (requerido pelo Facebook)
const hashData = (data) => {
  if (!data) return null
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      eventName, 
      eventData = {}, 
      userData = {},
      eventSourceUrl,
      eventId 
    } = req.body

    if (!eventName) {
      return res.status(400).json({ error: 'eventName is required' })
    }

    // Construir dados do evento para CAPI
    const eventTime = Math.floor(Date.now() / 1000)
    
    // User data com hashing (requerido pelo Facebook)
    const hashedUserData = {
      client_ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress,
      client_user_agent: req.headers['user-agent'],
      fbc: userData.fbc || null, // Facebook Click ID
      fbp: userData.fbp || null, // Facebook Browser ID
    }

    // Adicionar dados hashados se disponíveis
    if (userData.email) {
      hashedUserData.em = [hashData(userData.email)]
    }
    if (userData.phone) {
      hashedUserData.ph = [hashData(userData.phone.replace(/\D/g, ''))]
    }
    if (userData.firstName) {
      hashedUserData.fn = [hashData(userData.firstName)]
    }
    if (userData.lastName) {
      hashedUserData.ln = [hashData(userData.lastName)]
    }
    if (userData.city) {
      hashedUserData.ct = [hashData(userData.city)]
    }
    if (userData.state) {
      hashedUserData.st = [hashData(userData.state)]
    }
    if (userData.country) {
      hashedUserData.country = [hashData(userData.country)]
    }
    if (userData.zipCode) {
      hashedUserData.zp = [hashData(userData.zipCode)]
    }
    if (userData.externalId) {
      hashedUserData.external_id = [hashData(userData.externalId)]
    }

    // Construir evento
    const event = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId || `${eventName}_${eventTime}_${Math.random().toString(36).substr(2, 9)}`,
      action_source: 'website',
      event_source_url: eventSourceUrl || req.headers.referer || 'https://domacriolacaixastermicaspersonalizadas.site',
      user_data: hashedUserData,
    }

    // Adicionar dados customizados do evento
    if (Object.keys(eventData).length > 0) {
      event.custom_data = {
        ...eventData,
        currency: eventData.currency || 'BRL',
      }
      
      // Campos específicos que o Facebook espera
      if (eventData.value) {
        event.custom_data.value = parseFloat(eventData.value)
      }
      if (eventData.content_ids) {
        event.custom_data.content_ids = eventData.content_ids
      }
      if (eventData.content_type) {
        event.custom_data.content_type = eventData.content_type
      }
      if (eventData.content_name) {
        event.custom_data.content_name = eventData.content_name
      }
      if (eventData.content_category) {
        event.custom_data.content_category = eventData.content_category
      }
      if (eventData.num_items) {
        event.custom_data.num_items = parseInt(eventData.num_items)
      }
    }

    // Enviar para Facebook Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [event],
          // test_event_code: 'TEST12345', // Descomente para testar
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Facebook CAPI Error:', result)
      return res.status(response.status).json({ 
        error: 'Failed to send event to Facebook',
        details: result 
      })
    }

    return res.status(200).json({ 
      success: true, 
      eventId: event.event_id,
      eventsReceived: result.events_received,
      fbTraceId: result.fbtrace_id
    })

  } catch (error) {
    console.error('CAPI Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
