/**
 * API de Notificações WhatsApp
 * 
 * Suporta:
 * - Evolution API (self-hosted)
 * - WhatsApp Cloud API (Meta Business)
 * 
 * Rotas:
 * - POST /api/notify/whatsapp - Enviar notificação WhatsApp
 * - POST /api/notify/email - Enviar email (usa Resend)
 */

import { Resend } from 'resend'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Templates de mensagens
const MESSAGE_TEMPLATES = {
  new_order: (data) => `🛒 *Novo Pedido!*

📦 *Pedido:* #${data.orderId}
👤 *Cliente:* ${data.customerName}
📱 *Telefone:* ${data.customerPhone || 'Não informado'}
📧 *Email:* ${data.customerEmail}

💰 *Total:* R$ ${(data.total / 100).toFixed(2).replace('.', ',')}
💳 *Pagamento:* ${data.paymentMethod || 'PIX'}

📍 *Endereço:*
${data.address?.street || ''}, ${data.address?.number || ''}
${data.address?.neighborhood || ''} - ${data.address?.city || ''}/${data.address?.state || ''}
CEP: ${data.address?.zipCode || ''}

🕐 ${new Date().toLocaleString('pt-BR')}`,

  new_customer: (data) => `👤 *Novo Cliente Cadastrado!*

📧 *Email:* ${data.email}
👤 *Nome:* ${data.name}
📱 *Telefone:* ${data.phone || 'Não informado'}

🕐 ${new Date().toLocaleString('pt-BR')}`,

  payment_confirmed: (data) => `✅ *Pagamento Confirmado!*

📦 *Pedido:* #${data.orderId}
👤 *Cliente:* ${data.customerName}
💰 *Valor:* R$ ${(data.total / 100).toFixed(2).replace('.', ',')}

🕐 ${new Date().toLocaleString('pt-BR')}`,

  order_shipped: (data) => `📦 *Pedido Enviado!*

📦 *Pedido:* #${data.orderId}
👤 *Cliente:* ${data.customerName}
🚚 *Rastreio:* ${data.trackingCode || 'Aguardando código'}

🕐 ${new Date().toLocaleString('pt-BR')}`,

  low_stock: (data) => `⚠️ *Estoque Baixo!*

📦 *Produto:* ${data.productName}
📊 *Estoque atual:* ${data.stock} unidades

🕐 ${new Date().toLocaleString('pt-BR')}`
}

// Enviar via Evolution API
async function sendViaEvolutionAPI(phone, message) {
  const apiUrl = process.env.EVOLUTION_API_URL || process.env.WHATSAPP_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY || process.env.WHATSAPP_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE || process.env.WHATSAPP_INSTANCE

  if (!apiUrl || !apiKey || !instance) {
    throw new Error('Evolution API não configurada')
  }

  // Formatar número (remover + e caracteres especiais)
  const formattedPhone = phone.replace(/\D/g, '')

  const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey
    },
    body: JSON.stringify({
      number: formattedPhone,
      text: message
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Evolution API error: ${error}`)
  }

  return response.json()
}

// Enviar via WhatsApp Cloud API (Meta)
async function sendViaCloudAPI(phone, message) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp Cloud API não configurada')
  }

  // Formatar número
  const formattedPhone = phone.replace(/\D/g, '')

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message
        }
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Cloud API error: ${JSON.stringify(error)}`)
  }

  return response.json()
}

// Handler para WhatsApp
async function handleWhatsApp(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, data, phone } = req.body

    // Usar número do admin se não especificado
    const targetPhone = phone || process.env.ADMIN_WHATSAPP

    if (!targetPhone) {
      return res.status(400).json({ 
        error: 'Número de telefone não configurado',
        hint: 'Configure ADMIN_WHATSAPP no ambiente'
      })
    }

    // Gerar mensagem do template ou usar mensagem customizada
    let message
    if (type && MESSAGE_TEMPLATES[type]) {
      message = MESSAGE_TEMPLATES[type](data || {})
    } else if (data?.message) {
      message = data.message
    } else {
      return res.status(400).json({ 
        error: 'Tipo de notificação inválido',
        availableTypes: Object.keys(MESSAGE_TEMPLATES)
      })
    }

    // Tentar enviar via Evolution API primeiro, depois Cloud API
    let result
    let provider

    // Verificar qual API está configurada
    const hasEvolution = process.env.EVOLUTION_API_URL || process.env.WHATSAPP_API_URL
    const hasCloudAPI = process.env.WHATSAPP_ACCESS_TOKEN

    if (hasEvolution) {
      try {
        result = await sendViaEvolutionAPI(targetPhone, message)
        provider = 'evolution'
      } catch (evolutionError) {
        console.error('Evolution API error:', evolutionError)
        
        // Tentar Cloud API como fallback
        if (hasCloudAPI) {
          result = await sendViaCloudAPI(targetPhone, message)
          provider = 'cloud'
        } else {
          throw evolutionError
        }
      }
    } else if (hasCloudAPI) {
      result = await sendViaCloudAPI(targetPhone, message)
      provider = 'cloud'
    } else {
      return res.status(500).json({ 
        error: 'Nenhuma API de WhatsApp configurada',
        hint: 'Configure EVOLUTION_API_URL ou WHATSAPP_ACCESS_TOKEN'
      })
    }

    return res.status(200).json({
      success: true,
      provider,
      message: 'Notificação enviada com sucesso'
    })

  } catch (error) {
    console.error('WhatsApp notification error:', error)
    return res.status(500).json({ 
      error: 'Erro ao enviar notificação',
      details: error.message
    })
  }
}

// Handler para Email
async function handleEmail(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Resend API não configurada' })
  }

  try {
    const { to, subject, html, text, from } = req.body

    if (!to || !subject) {
      return res.status(400).json({ error: 'Destinatário e assunto são obrigatórios' })
    }

    const resend = new Resend(RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: from || 'Doma Crioula <noreply@domacrioulacaixastermicaspersonalizadas.site>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || `<p>${text || ''}</p>`,
      text: text || ''
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: 'Erro ao enviar email', details: error })
    }

    return res.status(200).json({
      success: true,
      emailId: data?.id,
      message: 'Email enviado com sucesso'
    })

  } catch (error) {
    console.error('Email notification error:', error)
    return res.status(500).json({ error: 'Erro ao enviar email' })
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

  // Determinar a rota pelo path
  const pathParts = req.query.path || []
  const route = pathParts[0] || ''

  switch (route) {
    case 'whatsapp':
      return handleWhatsApp(req, res)
    
    case 'email':
      return handleEmail(req, res)
    
    default:
      return res.status(404).json({
        error: 'Not found',
        message: `Route /api/notify/${route} not found`,
        availableRoutes: [
          'POST /api/notify/whatsapp',
          'POST /api/notify/email'
        ]
      })
  }
}
